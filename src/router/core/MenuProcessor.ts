/**
 * 菜单处理器
 *
 * 负责菜单数据的获取、过滤和处理
 *
 * @module router/core/MenuProcessor
 * @author VeGoo Team
 */

import type { AppRouteRecord } from '@/types/router'
import { useUserStore } from '@/store/modules/user'
import { useAppMode } from '@/hooks/core/useAppMode'
import { fetchGetMenuList } from '@/api/system-manage'
import { asyncRoutes } from '../routes/asyncRoutes'
import { RoutesAlias } from '../routesAlias'
import { formatMenuTitle } from '@/utils'

export class MenuProcessor {
  /**
   * 已弃用的菜单/路由前缀（历史工作台 / dashboard / console）
   * 这些路由可能仍会被后端菜单下发；前端侧需兜底过滤，避免注册后出现在 worktab 中。
   */
  private static readonly DEPRECATED_ROUTE_PREFIXES = ['/dashboard']

  /**
   * 已弃用的路由 name（历史工作台 / dashboard）
   */
  private static readonly DEPRECATED_ROUTE_NAMES = new Set([
    'Dashboard',
    'Console',
    'BigScreen',
    'FinanceScreen',
    'DeepAnalysis'
  ])

  /**
   * 获取菜单数据
   */
  async getMenuList(): Promise<AppRouteRecord[]> {
    const { isFrontendMode } = useAppMode()

    let menuList: AppRouteRecord[]
    if (isFrontendMode.value) {
      menuList = await this.processFrontendMenu()
    } else {
      menuList = await this.processBackendMenu()
    }

    // 过滤已弃用的 dashboard/console 路由（后端菜单可能仍在下发）
    menuList = this.filterDeprecatedRoutes(menuList)

    // 在规范化路径之前，验证原始路径配置
    this.validateMenuPaths(menuList)

    // 规范化路径（将相对路径转换为完整路径）
    return this.normalizeMenuPaths(menuList)
  }

  /** 超级管理员权限标识：permissions 包含此值时可见全部页面 */
  private static readonly SUPER_ADMIN = 'SuperAdmin'

  /**
   * 处理前端控制模式的菜单
   */
  private async processFrontendMenu(): Promise<AppRouteRecord[]> {
    const userStore = useUserStore()
    const roles = userStore.info?.roles ?? []
    const routeNames = userStore.info?.permissionConfig?.routePermissions?.routeNames ?? []

    let menuList = [...asyncRoutes]

    const useRouteNamesMenu =
      import.meta.env.VITE_USE_ROUTE_NAMES_MENU === 'true' &&
      routeNames.length > 0 &&
      !roles.includes(MenuProcessor.SUPER_ADMIN)

    if (useRouteNamesMenu) {
      menuList = this.filterMenuByRouteNames(menuList, routeNames)
    } else if (roles.length > 0 && !roles.includes(MenuProcessor.SUPER_ADMIN)) {
      // 根据接口返回的 permissions（已映射到 roles）过滤菜单；包含 SuperAdmin 时不做过滤，展示全部
      menuList = this.filterMenuByRoles(menuList, roles)
    }

    return this.filterEmptyMenus(menuList)
  }

  /**
   * 处理后端控制模式的菜单
   */
  private async processBackendMenu(): Promise<AppRouteRecord[]> {
    const list = await fetchGetMenuList()
    // 后端菜单可能滞后于前端已上线的路由：与静态 `asyncRoutes` 按 route.name 合并缺失项（如「报告管理」）
    const merged = this.mergeBackendMenuWithStaticRoutes(list, asyncRoutes)
    return this.filterEmptyMenus(merged)
  }

  /** 按 route.name 将静态路由树合并进后端菜单（补齐后端未配置的子菜单，顺序以静态配置为准） */
  private mergeBackendMenuWithStaticRoutes(
    backendList: AppRouteRecord[],
    staticList: AppRouteRecord[]
  ): AppRouteRecord[] {
    const staticByName = new Map(staticList.map((r) => [String(r.name), r]))
    return backendList.map((item) => {
      const staticItem = staticByName.get(String(item.name))
      return staticItem ? this.mergeMenuBranch(item, staticItem) : item
    })
  }

  private mergeMenuBranch(backendItem: AppRouteRecord, staticItem: AppRouteRecord): AppRouteRecord {
    const staticChildren = staticItem.children
    if (!staticChildren?.length) {
      return backendItem
    }

    const backendChildren = backendItem.children ?? []
    if (backendChildren.length === 0) {
      return { ...backendItem, children: staticChildren.map((c) => ({ ...c })) }
    }

    const backendByName = new Map(backendChildren.map((c) => [String(c.name), c]))
    const merged: AppRouteRecord[] = []

    for (const sc of staticChildren) {
      const key = String(sc.name)
      const bc = backendByName.get(key)
      if (bc) {
        merged.push(this.mergeMenuBranch(bc, sc))
        backendByName.delete(key)
      } else {
        merged.push({ ...sc })
      }
    }

    for (const [, bc] of backendByName) {
      merged.push(bc)
    }

    return { ...backendItem, children: merged }
  }

  /**
   * 按后端下发的路由 name 集合过滤菜单（与 permissionConfig.routePermissions.routeNames 对齐）
   * 父级 name 可不在列表中，只要子树过滤后仍有节点则保留父级。
   */
  private filterMenuByRouteNames(menu: AppRouteRecord[], routeNames: string[]): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const currentName = item.name ? String(item.name) : ''
      const children = item.children?.length
        ? this.filterMenuByRouteNames(item.children, routeNames)
        : item.children

      const selfMatched = currentName ? routeNames.includes(currentName) : false
      const hasChildren = Boolean(children?.length)

      if (selfMatched || hasChildren) {
        acc.push({
          ...item,
          children
        })
      }

      return acc
    }, [])
  }

  /**
   * 根据角色过滤菜单
   */
  private filterMenuByRoles(menu: AppRouteRecord[], roles: string[]): AppRouteRecord[] {
    return menu.reduce((acc: AppRouteRecord[], item) => {
      const itemRoles = item.meta?.roles
      const hasPermission = !itemRoles || itemRoles.some((role) => roles?.includes(role))

      if (hasPermission) {
        const filteredItem = { ...item }
        if (filteredItem.children?.length) {
          filteredItem.children = this.filterMenuByRoles(filteredItem.children, roles)
        }
        acc.push(filteredItem)
      }

      return acc
    }, [])
  }

  /**
   * 递归过滤空菜单项
   */
  private filterEmptyMenus(menuList: AppRouteRecord[]): AppRouteRecord[] {
    return menuList
      .map((item) => {
        // 如果有子菜单，先递归过滤子菜单
        if (item.children && item.children.length > 0) {
          const filteredChildren = this.filterEmptyMenus(item.children)
          return {
            ...item,
            children: filteredChildren
          }
        }
        return item
      })
      .filter((item) => {
        // 如果定义了 children 属性（即使是空数组），说明这是一个目录菜单，应该保留
        if ('children' in item) {
          return true
        }

        // 如果有外链或 iframe，保留
        if (item.meta?.isIframe === true || item.meta?.link) {
          return true
        }

        // 如果有有效的 component，保留
        if (item.component && item.component !== '' && item.component !== RoutesAlias.Layout) {
          return true
        }

        // 纯 redirect 子路由（无 component）：须保留以便注册与旧链接跳转
        if (
          item.redirect !== undefined &&
          item.redirect !== null &&
          !(typeof item.redirect === 'string' && item.redirect === '')
        ) {
          return true
        }

        // 其他情况过滤掉
        return false
      })
  }

  /**
   * 过滤已弃用的菜单项（dashboard / console）
   * - 支持 top-level: /dashboard
   * - 支持 children 相对路径：console（父级为 /dashboard）
   * - 支持通过 route.name 过滤
   */
  private filterDeprecatedRoutes(menuList: AppRouteRecord[], parentPath = ''): AppRouteRecord[] {
    const shouldDrop = (route: AppRouteRecord): boolean => {
      const name = route.name ? String(route.name) : ''
      if (name && MenuProcessor.DEPRECATED_ROUTE_NAMES.has(name)) return true

      const rawPath = String(route.path || '')
      const fullPath = this.buildFullPath(rawPath, parentPath)

      return MenuProcessor.DEPRECATED_ROUTE_PREFIXES.some(
        (prefix) => fullPath === prefix || fullPath.startsWith(`${prefix}/`)
      )
    }

    return menuList
      .filter((route) => !shouldDrop(route))
      .map((route) => {
        if (!route.children?.length) return route

        const nextParentPath = this.buildFullPath(String(route.path || ''), parentPath)
        return {
          ...route,
          children: this.filterDeprecatedRoutes(route.children, nextParentPath)
        }
      })
  }

  /**
   * 验证菜单列表是否有效
   */
  validateMenuList(menuList: AppRouteRecord[]): boolean {
    return Array.isArray(menuList) && menuList.length > 0
  }

  /**
   * 规范化菜单路径
   * 将相对路径转换为完整路径，确保菜单跳转正确
   */
  private normalizeMenuPaths(menuList: AppRouteRecord[], parentPath = ''): AppRouteRecord[] {
    return menuList.map((item) => {
      // 构建完整路径
      const fullPath = this.buildFullPath(item.path || '', parentPath)

      // 递归处理子菜单
      const children = item.children?.length
        ? this.normalizeMenuPaths(item.children, fullPath)
        : item.children

      return {
        ...item,
        path: fullPath,
        children
      }
    })
  }

  /**
   * 验证菜单路径配置
   * 检测非一级菜单是否错误使用了 / 开头的路径
   */
  /**
   * 验证菜单路径配置
   * 检测非一级菜单是否错误使用了 / 开头的路径
   */
  private validateMenuPaths(menuList: AppRouteRecord[], level = 1): void {
    menuList.forEach((route) => {
      if (!route.children?.length) return

      const parentName = String(route.name || route.path || '未知路由')

      route.children.forEach((child) => {
        const childPath = child.path || ''

        // 跳过合法的绝对路径：外部链接和 iframe 路由
        if (this.isValidAbsolutePath(childPath)) return

        // 检测非法的绝对路径
        if (childPath.startsWith('/')) {
          this.logPathError(child, childPath, parentName, level)
        }
      })

      // 递归检查更深层级的子路由
      this.validateMenuPaths(route.children, level + 1)
    })
  }

  /**
   * 判断是否为合法的绝对路径
   */
  private isValidAbsolutePath(path: string): boolean {
    return (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('/outside/iframe/')
    )
  }

  /**
   * 输出路径配置错误日志
   */
  private logPathError(
    route: AppRouteRecord,
    path: string,
    parentName: string,
    level: number
  ): void {
    const routeName = String(route.name || path || '未知路由')
    const menuTitle = route.meta?.title || routeName
    const suggestedPath = path.split('/').pop() || path.slice(1)

    console.error(
      `[路由配置错误] 菜单 "${formatMenuTitle(menuTitle)}" (name: ${routeName}, path: ${path}) 配置错误\n` +
        `  位置: ${parentName} > ${routeName}\n` +
        `  问题: ${level + 1}级菜单的 path 不能以 / 开头\n` +
        `  当前配置: path: '${path}'\n` +
        `  应该改为: path: '${suggestedPath}'`
    )
  }

  /**
   * 构建完整路径
   */
  private buildFullPath(path: string, parentPath: string): string {
    if (!path) return ''

    // 外部链接直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }

    // 如果已经是绝对路径，直接返回
    if (path.startsWith('/')) {
      return path
    }

    // 拼接父路径和当前路径
    if (parentPath) {
      // 移除父路径末尾的斜杠，移除子路径开头的斜杠，然后拼接
      const cleanParent = parentPath.replace(/\/$/, '')
      const cleanChild = path.replace(/^\//, '')
      return `${cleanParent}/${cleanChild}`
    }

    // 没有父路径，添加前导斜杠
    return `/${path}`
  }
}
