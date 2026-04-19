/**
 * 一次性导出：角色「页面权限」路由目录全量 JSON（与前端 routeModules + !isHide 规则一致）。
 * 运行：pnpm exec tsx scripts/dump-route-permission-catalog.mts
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { routeModules } from '../src/router/modules/index.ts'
import type { AppRouteRecord } from '../src/types/router/index.ts'

const zhMessages = JSON.parse(readFileSync(resolve('src/locales/langs/zh.json'), 'utf8')) as Record<
  string,
  unknown
>

/** 按点路径从 zh.json 取值；取不到则原样返回 title（可能已是中文或缺失 key） */
function resolveTitleZh(titleKey: string): string {
  const parts = titleKey.split('.').filter(Boolean)
  if (parts.length < 2) return titleKey

  let cur: unknown = zhMessages
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object' || !(p in cur)) {
      return titleKey
    }
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : titleKey
}

/** 与路由表 `component` 一致：项目惯例为 `'/模块/页面'` */
function componentPathOf(route: AppRouteRecord): string | undefined {
  const c = route.component
  if (typeof c === 'string' && c.length > 0) return c
  if (typeof c === 'function') return '[dynamic-import]'
  return undefined
}

/**
 * 与 `ComponentLoader` 一致：先 `views/<path>/index.vue`，再 `views/<path>.vue`。
 * 均不存在时回退为更常见的目录入口路径，便于人工核对。
 */
function viewFileRelative(componentPath: string | undefined): string | undefined {
  if (!componentPath || componentPath === '[dynamic-import]') return undefined
  const p = componentPath.startsWith('/') ? componentPath.slice(1) : componentPath
  const indexFile = resolve(`src/views/${p}/index.vue`)
  const flatFile = resolve(`src/views/${p}.vue`)
  if (existsSync(indexFile)) {
    return `src/views/${p}/index.vue`.replace(/\\/g, '/')
  }
  if (existsSync(flatFile)) {
    return `src/views/${p}.vue`.replace(/\\/g, '/')
  }
  return `src/views/${p}/index.vue`.replace(/\\/g, '/')
}

type NodeKind = 'directory' | 'leaf'

export interface RoutePermissionCatalogNode {
  /** 与 Vue Router name 一致，权限主键 */
  routeName: string
  /** 菜单/页展示用 i18n key 或文案 */
  title: string
  /** 路由表原始 path（子级常为相对片段，与 router 配置一致） */
  path: string
  /** 拼接后的绝对路径，便于运营对照与外链（Vue Router 解析结果形态） */
  fullPath: string
  /** 父级 routeName，顶层为 null */
  parentRouteName: string | null
  /** 同级排序，从 0 递增 */
  sortOrder: number
  /** 有可见子节点则为 directory，否则为 leaf */
  nodeKind: NodeKind
  /** 是否在侧栏/角色树中展示（已过滤 isHide） */
  permissionUiVisible: boolean
  /** 是否适合作为日期权限 pageKey（叶子页） */
  datePermissionEligible: boolean
  icon?: string
  keepAlive?: boolean
  skipDatePermission?: boolean
  /** 路由 meta.roles，无则省略 */
  routeRoles?: string[]
  /** 从 zh.json 解析的中文标题，便于库表/运营后台展示与对账 */
  titleZh: string
  /** 前端视图入口，与 `AppRouteRecord.component` 字符串一致 */
  componentPath?: string
  /** 相对仓库根的视图文件路径，便于检索与对账 */
  viewFile?: string
  children?: RoutePermissionCatalogNode[]
}

function titleOf(route: AppRouteRecord): string {
  return String(route.meta?.title || route.name || route.path)
}

function iconOf(route: AppRouteRecord): string | undefined {
  const v = route.meta?.icon
  return typeof v === 'string' ? v : undefined
}

function joinFullPath(parentFullPath: string, segment: string): string {
  if (!segment) return parentFullPath || '/'
  if (segment.startsWith('/')) return segment.replace(/\/+$/, '') || '/'
  const base = (parentFullPath || '').replace(/\/+$/, '')
  if (!base) return `/${segment}`
  return `${base}/${segment}`.replace(/\/+/g, '/')
}

function buildNodes(
  routes: AppRouteRecord[],
  parentRouteName: string | null,
  parentFullPath: string
): RoutePermissionCatalogNode[] {
  return routes
    .filter((route) => !route.meta?.isHide)
    .map((route, index) => {
      const routeName = String(route.name || route.path)
      const path = String(route.path || '')
      const fullPath = joinFullPath(parentFullPath, path)
      const childBuilt = route.children?.length
        ? buildNodes(route.children, routeName, fullPath)
        : []
      const children = childBuilt.length ? childBuilt : undefined
      const nodeKind: NodeKind = children?.length ? 'directory' : 'leaf'
      const title = titleOf(route)
      const componentPath = componentPathOf(route)

      return {
        routeName,
        title,
        path,
        fullPath,
        parentRouteName,
        sortOrder: index,
        nodeKind,
        permissionUiVisible: true,
        datePermissionEligible: nodeKind === 'leaf',
        icon: iconOf(route),
        keepAlive: route.meta?.keepAlive === true ? true : undefined,
        skipDatePermission: route.meta?.skipDatePermission === true ? true : undefined,
        routeRoles: Array.isArray(route.meta?.roles) ? (route.meta!.roles as string[]) : undefined,
        titleZh: resolveTitleZh(title),
        componentPath,
        viewFile: viewFileRelative(componentPath),
        children
      }
    })
    .filter((n) => n.routeName && n.path)
}

interface FlatRow extends Omit<RoutePermissionCatalogNode, 'children'> {
  depth: number
}

function flatten(nodes: RoutePermissionCatalogNode[], depth = 0): FlatRow[] {
  const out: FlatRow[] = []
  for (const n of nodes) {
    const { children, ...rest } = n
    out.push({ ...rest, depth })
    if (children?.length) out.push(...flatten(children, depth + 1))
  }
  return out
}

const routeTree = buildNodes(routeModules, null, '')
const flatTableRows = flatten(routeTree).map((row, idx) => ({
  /** 建议库表自增主键，导入前可忽略，由 DB 生成 */
  id: idx + 1,
  ...row
}))

const payload = {
  _meta: {
    generatedBy: 'scripts/dump-route-permission-catalog.mts',
    description:
      '供后端初始化「路由权限目录」表或字典：routeTree 与接口 permissions/pages 中 routeTree 形态兼容；routeTreeCatalog 为嵌套全字段；flatTableRows 便于关系库一行一路由。',
    rules: [
      '仅包含 meta.isHide !== true 的节点，与前端角色页 mock 构建规则一致。',
      'routeName 为全局唯一业务键；path 变更时需同步更新本目录。',
      'datePermissionEligible=true 的节点可与日期权限 pageKey 对齐。',
      'nodeKind=directory 表示仅菜单分组，一般不把 directory 本身写入角色已选页（除非产品要求父级勾选即全选子级）。',
      'titleZh 由 meta.title 对应 i18n key 在 src/locales/langs/zh.json 解析；缺 key 时与 title 同值。',
      'componentPath 与路由表一致；viewFile 按 ComponentLoader 规则解析真实存在的 .vue 路径（优先 …/index.vue）。'
    ],
    compatibleApiFields: {
      routeTreeMinimal: ['routeName', 'title', 'path', 'children'],
      extraForDatabase: [
        'parentRouteName',
        'sortOrder',
        'nodeKind',
        'permissionUiVisible',
        'datePermissionEligible',
        'icon',
        'keepAlive',
        'skipDatePermission',
        'routeRoles',
        'fullPath',
        'titleZh',
        'componentPath',
        'viewFile',
        'depth（仅平铺）'
      ]
    }
  },
  /** 与前端 GET/POST 契约中 routeTree 字段一致，便于直接塞 sampleResponse */
  routeTree: routeTree.map(stripExtraForApiShape),
  /** 嵌套全字段，便于对照与文档；入库时可忽略 children 改查 flatTableRows */
  routeTreeCatalog: routeTree,
  flatTableRows
}

/** 与现有 02-page-permissions 契约一致的最小子集树（children 空数组而非 undefined 可选） */
/** 与 permissions/pages 契约一致：path 使用解析后的绝对路径，便于与 02-page-permissions 示例一致 */
function stripExtraForApiShape(n: RoutePermissionCatalogNode): Pick<
  RoutePermissionCatalogNode,
  'routeName' | 'title' | 'path'
> & {
  children: ReturnType<typeof stripExtraForApiShape>[]
} {
  return {
    routeName: n.routeName,
    title: n.title,
    path: n.fullPath,
    children: n.children?.length ? n.children.map(stripExtraForApiShape) : []
  }
}

const outPath = resolve(
  'src/views/config-management/role/mock/backend-api/route-permission-catalog.full.json'
)
writeFileSync(outPath, JSON.stringify(payload, null, 2), 'utf8')
console.log('written:', outPath)
console.log('nodes(flat):', flatTableRows.length)
