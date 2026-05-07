import { routeModules } from '@/router/modules'
import type { AppRouteRecord } from '@/types/router'

export interface MockRoleListItem {
  roleId: number
  roleName: string
  roleCode: string
  description: string
  enabled: boolean
  createTime: string
}

/**
 * Backward-compatible export for stale HMR modules that still import the old
 * permission module constant. The role page has moved to route/date permission
 * contracts, so this stays as an empty placeholder.
 */
export const MOCK_PERMISSION_MODULES: unknown[] = []

export interface RolePermissionTreeNode {
  routeName: string
  title: string
  path: string
  children?: RolePermissionTreeNode[]
}

export interface RoleDateScopeConfig {
  maxHistoryDays: number
  defaultRangeDays: number
  allowCustomRange: boolean
}

export interface RolePageDateScope extends RoleDateScopeConfig {
  pageKey: string
}

export interface RoleDatePageOption {
  pageKey: string
  pageName: string
}

export interface MockRoleUserItem {
  id: string | number
  userName: string
  userEmail: string
  avatarText: string
  statusText: string
  statusClass: string
  lastActive: string
  isLast?: boolean
}

export interface MockPermissionSummary {
  routeGrantedCount: number
  routeTotalCount: number
  defaultDateScopeText: string
  overridePageCount: number
  allowCustomRange: boolean
  lastUpdatedAt: string
  lastUpdatedBy: string
  highlightedRoutes: string[]
}

export const MOCK_ROLE_LIST: MockRoleListItem[] = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleCode: 'SuperAdmin',
    description: '拥有全部页面访问与全部日期范围权限',
    enabled: true,
    createTime: '2026-01-01 09:00:00'
  },
  {
    roleId: 2,
    roleName: '管理层',
    roleCode: 'Manager',
    description: '查看核心经营页面，日期范围较宽',
    enabled: true,
    createTime: '2026-01-02 09:00:00'
  },
  {
    roleId: 3,
    roleName: '投放经理',
    roleCode: 'DeliveryManager',
    description: '重点查看投放与增长分析页面',
    enabled: true,
    createTime: '2026-01-03 09:00:00'
  },
  {
    roleId: 4,
    roleName: '分析师',
    roleCode: 'Analyst',
    description: '查看多业务分析页面，但日期范围更收敛',
    enabled: true,
    createTime: '2026-01-04 09:00:00'
  },
  {
    roleId: 5,
    roleName: '运营',
    roleCode: 'Operator',
    description: '保留必要运营页面与较短的数据窗口',
    enabled: true,
    createTime: '2026-01-05 09:00:00'
  }
]

const ROLE_USERS_BY_ID: Record<number, MockRoleUserItem[]> = {
  1: [
    {
      id: '1',
      userName: 'admin',
      userEmail: 'admin@vegoo.com',
      avatarText: 'AD',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-16'
    }
  ],
  2: [
    {
      id: '2',
      userName: 'ceo',
      userEmail: 'ceo@vegoo.com',
      avatarText: 'CE',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-16'
    },
    {
      id: '3',
      userName: 'director',
      userEmail: 'director@vegoo.com',
      avatarText: 'DI',
      statusText: '离线',
      statusClass: 'status-dot--offline',
      lastActive: '2026-04-14'
    }
  ],
  3: [
    {
      id: '4',
      userName: 'zhangsan',
      userEmail: 'zhangsan@vegoo.com',
      avatarText: 'ZS',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-16'
    },
    {
      id: '5',
      userName: 'lisi',
      userEmail: 'lisi@vegoo.com',
      avatarText: 'LS',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-15'
    },
    {
      id: '6',
      userName: 'wangwu',
      userEmail: 'wangwu@vegoo.com',
      avatarText: 'WW',
      statusText: '离线',
      statusClass: 'status-dot--offline',
      lastActive: '2026-04-13'
    }
  ],
  4: [
    {
      id: '7',
      userName: 'analyst.a',
      userEmail: 'analyst.a@vegoo.com',
      avatarText: 'AA',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-16'
    },
    {
      id: '8',
      userName: 'analyst.b',
      userEmail: 'analyst.b@vegoo.com',
      avatarText: 'AB',
      statusText: '离线',
      statusClass: 'status-dot--offline',
      lastActive: '2026-04-12'
    }
  ],
  5: [
    {
      id: '9',
      userName: 'operator.a',
      userEmail: 'operator.a@vegoo.com',
      avatarText: 'OA',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-16'
    },
    {
      id: '10',
      userName: 'operator.b',
      userEmail: 'operator.b@vegoo.com',
      avatarText: 'OB',
      statusText: '活跃',
      statusClass: 'status-dot--active',
      lastActive: '2026-04-15'
    }
  ]
}

const ROLE_ROUTE_PRESETS: Record<number, string[]> = {
  1: ['__ALL__'],
  2: [
    'Cockpit',
    'UserGrowth',
    'AccountPerformance',
    'AdPlatformAnalysis',
    'MyAds',
    'MyPerformance',
    'PerformanceAnalysis',
    'ComprehensiveAnalysis',
    'BusinessInsight',
    'AgencyAnalysis',
    'ProfitAnalysis',
    'ConfigManagement',
    'ApplicationManagement',
    'AppAssignment'
  ],
  3: [
    'UserGrowth',
    'AccountPerformance',
    'AdPlatformAnalysis',
    'MyAds',
    'MyPerformance',
    'AdPerformance',
    'PerformanceAnalysis',
    'ComprehensiveAnalysis',
    'BusinessInsight',
    'AgencyAnalysis'
  ],
  4: [
    'Cockpit',
    'UserGrowth',
    'AccountPerformance',
    'PerformanceAnalysis',
    'ComprehensiveAnalysis',
    'PlatformAnalysisDetail',
    'BusinessInsight',
    'ProfitAnalysis',
    'IAPAnalysis'
  ],
  5: [
    'UserGrowth',
    'MyAds',
    'ConversionManagement',
    'ProductOperations',
    'ReviewsRatingsMonitor',
    'OrderRefundAnalysis'
  ]
}

const ROLE_DEFAULT_DATE_SCOPE: Record<number, RoleDateScopeConfig> = {
  1: { maxHistoryDays: -1, defaultRangeDays: 30, allowCustomRange: true },
  2: { maxHistoryDays: 365, defaultRangeDays: 30, allowCustomRange: true },
  3: { maxHistoryDays: 90, defaultRangeDays: 7, allowCustomRange: true },
  4: { maxHistoryDays: 30, defaultRangeDays: 7, allowCustomRange: true },
  5: { maxHistoryDays: 7, defaultRangeDays: 3, allowCustomRange: false }
}

const ROLE_PAGE_DATE_SCOPE: Record<number, RolePageDateScope[]> = {
  1: [{ pageKey: 'AdMobDetail', maxHistoryDays: 7, defaultRangeDays: 1, allowCustomRange: true }],
  2: [
    { pageKey: 'AdMobDetail', maxHistoryDays: 7, defaultRangeDays: 1, allowCustomRange: false },
    {
      pageKey: 'PerformanceAnalysis',
      maxHistoryDays: 180,
      defaultRangeDays: 30,
      allowCustomRange: true
    }
  ],
  3: [
    { pageKey: 'AdMobDetail', maxHistoryDays: 3, defaultRangeDays: 1, allowCustomRange: false },
    { pageKey: 'MyAds', maxHistoryDays: 60, defaultRangeDays: 7, allowCustomRange: true }
  ],
  4: [
    {
      pageKey: 'ComprehensiveAnalysis',
      maxHistoryDays: 30,
      defaultRangeDays: 7,
      allowCustomRange: true
    }
  ],
  5: [
    { pageKey: 'MyAds', maxHistoryDays: 7, defaultRangeDays: 3, allowCustomRange: false },
    {
      pageKey: 'ConversionManagement',
      maxHistoryDays: 15,
      defaultRangeDays: 7,
      allowCustomRange: false
    }
  ]
}

function buildRouteNodeTitle(route: AppRouteRecord): string {
  return String(route.meta?.title || route.name || route.path)
}

function buildRouteNodes(routes: AppRouteRecord[]): RolePermissionTreeNode[] {
  return routes
    .filter((route) => !route.meta?.isHide)
    .map((route) => {
      const children = route.children?.length ? buildRouteNodes(route.children) : undefined
      return {
        routeName: String(route.name || route.path),
        title: buildRouteNodeTitle(route),
        path: String(route.path || ''),
        children: children?.length ? children : undefined
      }
    })
    .filter((route) => route.routeName && route.path)
}

function flattenRouteNames(nodes: RolePermissionTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    node.routeName,
    ...(node.children ? flattenRouteNames(node.children) : [])
  ])
}

const ALL_ROUTE_TREE = buildRouteNodes(routeModules)
const ALL_ROUTE_NAMES = flattenRouteNames(ALL_ROUTE_TREE)

export function getMockRoleUsers(roleId: number | undefined): MockRoleUserItem[] {
  if (!roleId) return []
  return ROLE_USERS_BY_ID[roleId] ?? []
}

export function getMockRoleDescription(roleName: string | undefined): string {
  const matched = MOCK_ROLE_LIST.find((item) => item.roleName === roleName)
  return matched?.description ?? '当前角色用于控制页面访问与日期权限。'
}

export function getMockRoleRouteTree(): RolePermissionTreeNode[] {
  return ALL_ROUTE_TREE
}

export function getMockCheckedRouteNames(roleId: number | undefined): string[] {
  if (!roleId) return []
  const preset = ROLE_ROUTE_PRESETS[roleId] ?? []
  if (preset.includes('__ALL__')) {
    return ALL_ROUTE_NAMES
  }
  return preset.filter((item) => ALL_ROUTE_NAMES.includes(item))
}

export function getMockDatePageOptions(): RoleDatePageOption[] {
  return ALL_ROUTE_NAMES.map((routeName) => findRouteNodeByName(ALL_ROUTE_TREE, routeName))
    .filter((item): item is RolePermissionTreeNode => Boolean(item))
    .filter((item) => !item.children?.length)
    .map((item) => ({
      pageKey: item.routeName,
      pageName: item.title
    }))
}

function findRouteNodeByName(
  nodes: RolePermissionTreeNode[],
  routeName: string
): RolePermissionTreeNode | undefined {
  for (const node of nodes) {
    if (node.routeName === routeName) return node
    if (node.children?.length) {
      const matched = findRouteNodeByName(node.children, routeName)
      if (matched) return matched
    }
  }
  return undefined
}

export function getMockDefaultDateScope(roleId: number | undefined): RoleDateScopeConfig {
  return (
    (roleId ? ROLE_DEFAULT_DATE_SCOPE[roleId] : undefined) ?? {
      maxHistoryDays: 30,
      defaultRangeDays: 7,
      allowCustomRange: true
    }
  )
}

export function getMockPageDateScopes(roleId: number | undefined): RolePageDateScope[] {
  if (!roleId) return []
  return ROLE_PAGE_DATE_SCOPE[roleId] ?? []
}

function formatDateScopeText(scope: RoleDateScopeConfig): string {
  const dayText = scope.maxHistoryDays === -1 ? '不限天数' : `近${scope.maxHistoryDays}天`
  const customText = scope.allowCustomRange ? '允许自定义' : '不允许自定义'
  return `${dayText}，默认${scope.defaultRangeDays}天，${customText}`
}

export function getMockPermissionSummary(roleId: number | undefined): MockPermissionSummary {
  const grantedRoutes = getMockCheckedRouteNames(roleId)
  const defaultScope = getMockDefaultDateScope(roleId)
  const pageScopes = getMockPageDateScopes(roleId)

  return {
    routeGrantedCount: grantedRoutes.length,
    routeTotalCount: ALL_ROUTE_NAMES.length,
    defaultDateScopeText: formatDateScopeText(defaultScope),
    overridePageCount: pageScopes.length,
    allowCustomRange: defaultScope.allowCustomRange,
    lastUpdatedAt: '2026-04-16 18:30:00',
    lastUpdatedBy: 'admin',
    highlightedRoutes: grantedRoutes.slice(0, 5)
  }
}
