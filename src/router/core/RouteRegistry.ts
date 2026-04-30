/**
 * 路由注册核心类
 *
 * 负责动态路由的注册、验证和管理
 *
 * @module router/core/RouteRegistry
 * @author VeGoo Team
 */

import type { Router, RouteRecordRaw } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'
import { ComponentLoader } from './ComponentLoader'
import { RouteValidator } from './RouteValidator'
import { RouteTransformer } from './RouteTransformer'

export class RouteRegistry {
  private router: Router
  private componentLoader: ComponentLoader
  private validator: RouteValidator
  private transformer: RouteTransformer
  private removeRouteFns: (() => void)[] = []
  private registered = false

  constructor(router: Router) {
    this.router = router
    this.componentLoader = new ComponentLoader()
    this.validator = new RouteValidator()
    this.transformer = new RouteTransformer(this.componentLoader)
  }

  /**
   * 注册动态路由
   */
  register(menuList: AppRouteRecord[]): void {
    if (this.registered) {
      console.warn('[RouteRegistry] 路由已注册，跳过重复注册')
      return
    }

    // 验证路由配置
    const validationResult = this.validator.validate(menuList)
    if (!validationResult.valid) {
      throw new Error(`路由配置验证失败: ${validationResult.errors.join(', ')}`)
    }

    // 转换并注册路由
    const removeRouteFns: (() => void)[] = []

    menuList.forEach((route) => {
      if (route.name && !this.router.hasRoute(route.name)) {
        const routeConfig = this.transformer.transform(route)
        const removeRouteFn = this.router.addRoute(routeConfig as RouteRecordRaw)
        removeRouteFns.push(removeRouteFn)
      }
    })

    this.removeRouteFns = removeRouteFns
    this.registered = true
  }

  /**
   * 预加载菜单对应的页面组件，降低首次进入页面的白屏感知
   */
  preloadRouteComponents(menuList: AppRouteRecord[], targetPaths: string[] = []): void {
    const loaders = new Set<() => Promise<any>>()
    const normalizedTargets = new Set(
      targetPaths.filter(Boolean).map((path) => path.replace(/\/+$/, '') || '/')
    )

    const resolveRoutePath = (parentPath: string, routePath: string): string => {
      if (!routePath) {
        return parentPath || '/'
      }
      if (routePath.startsWith('/')) {
        return routePath
      }
      const base = parentPath === '/' ? '' : parentPath
      return `${base}/${routePath}`.replace(/\/+/g, '/')
    }

    const collectLoaders = (
      routes: AppRouteRecord[],
      parentPath = '',
      inheritPreload = false
    ): boolean => {
      let hasCriticalRoute = false

      routes.forEach((route) => {
        const fullPath = resolveRoutePath(parentPath, route.path || '')
        const childHasCriticalRoute = route.children?.length
          ? collectLoaders(route.children, fullPath, inheritPreload || route.meta?.preload === true)
          : false
        const shouldPreloadSelf =
          inheritPreload ||
          route.meta?.preload === true ||
          normalizedTargets.has(fullPath.replace(/\/+$/, '') || '/')

        if (
          (shouldPreloadSelf || childHasCriticalRoute) &&
          route.component &&
          !route.meta?.isIframe
        ) {
          loaders.add(this.componentLoader.load(route.component as string))
        }

        if (shouldPreloadSelf || childHasCriticalRoute) {
          hasCriticalRoute = true
        }
      })

      return hasCriticalRoute
    }

    collectLoaders(menuList)

    if (!loaders.size) {
      return
    }

    void Promise.allSettled(Array.from(loaders, (loader) => loader())).catch((error) => {
      console.warn('[RouteRegistry] 预加载路由组件失败', error)
    })
  }

  /**
   * 移除所有动态路由
   */
  unregister(): void {
    this.removeRouteFns.forEach((fn) => fn())
    this.removeRouteFns = []
    this.registered = false
  }

  /**
   * 检查是否已注册
   */
  isRegistered(): boolean {
    return this.registered
  }

  /**
   * 获取移除函数列表（用于 store 管理）
   */
  getRemoveRouteFns(): (() => void)[] {
    return this.removeRouteFns
  }

  /**
   * 标记为已注册（用于错误处理场景，避免重复请求）
   */
  markAsRegistered(): void {
    this.registered = true
  }
}
