/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { username: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author VeGoo Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数（与后端接口字段一致，使用 username） */
    interface LoginParams {
      username: string
      password: string
      /** 记住我 */
      rememberMe?: boolean
    }

    /** 登录响应：后端返回的 token 字符串 */
    type LoginResponse = string

    /** 用户信息（与 GET /api/v1/datacenter/biz/user/get 响应一致） */
    interface UserInfo {
      id: number
      username: string
      email: string
      phone: string
      /** 0 非管理员，1 管理员 */
      isAdmin: number
      permissions: string[]
      /** 兼容：与 id 相同，用于 store 等 */
      userId?: number
      /** 兼容：与 username 相同 */
      userName?: string
      /** 兼容：与 permissions 一致，用于角色/权限判断 */
      roles?: string[]
      /** 兼容：与 permissions 一致，用于 useAuth 按钮权限 */
      buttons?: string[]
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /**
     * 用户列表项（系统管理 · 用户管理）
     *
     * status 约定：1=在线 2=离线 3=异常 4=已禁用（与列表筛选、标签展示一致）
     */
    interface UserListItem {
      id: number
      /** 头像 URL；缺省、空串或无效时前端使用统一占位图，不参与业务校验 */
      avatar?: string
      /** 1=在线 2=离线 3=异常 4=已禁用 */
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      /** 角色编码列表，与 RoleListItem.roleCode 一致 */
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
      /** 可访问应用标识列表（业务自定义，如包名或应用 ID） */
      accessibleApps?: string[]
      /** 运营备注 */
      remark?: string
    }

    /**
     * 用户列表查询参数
     *
     * role：按角色编码筛选，与 RoleListItem.roleCode、userRoles 元素一致
     */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams & {
          role?: string
        }
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams
    >
  }

  /** 用户增长 - 转化管理 */
  namespace UserGrowth {
    /** 转化映射列表项 */
    interface ConversionMappingItem {
      id: string
      platform: 'android' | 'ios'
      mccAccount: string
      appPackage: string
      conversionName: string
      conversionId: string
      platformConversionType: string
      systemDisplayName: string
      billingType: string
      status: 'enabled' | 'duplicate' | 'unmapped'
    }

    /** 转化映射列表响应 */
    type ConversionMappingList = Api.Common.PaginatedResponse<ConversionMappingItem>

    /** 转化映射列表请求参数 */
    interface ConversionMappingListParams extends Api.Common.CommonSearchParams {
      platform?: string
      app?: string
      conversionType?: string
      status?: string
      keyword?: string
    }

    /** 右侧统计 - 转化类型分布 */
    interface ConversionTypeDistributionItem {
      name: string
      value: number
      count?: number
    }

    /** 右侧统计 - 映射状态 */
    interface MappingStats {
      mapped: number
      duplicate: number
      unmapped: number
    }

    /** 右侧统计 - 平台分布 */
    interface PlatformStats {
      android: number
      ios: number
    }

    /** 综合分析 - 筛选下拉（meta-filter-options 响应，与页面 types 一致） */
    interface ComprehensiveAnalysisFilterOptionsDto {
      appOptions: { label: string; value: string }[]
      adPlatformOptions: { label: string; value: string }[]
      countryOptions: { label: string; value: string }[]
    }

    /** 综合分析 - overview 请求体（与 `ComprehensiveAnalysisApiParams` 一致） */
    interface ComprehensiveAnalysisOverviewRequest {
      /** 区间开始 YYYY-MM-DD */
      date_start: string
      /** 区间结束 YYYY-MM-DD */
      date_end: string
      /** 应用；空字符串表示全部 */
      s_app_id: string
      /** 广告平台；空字符串表示全部（字段名 `source`） */
      source: string
      /** 国家代码；空字符串表示全部 */
      s_country_code: string
    }

    /** 广告平台分析详情 - overview 请求 */
    interface PlatformAnalysisDetailOverviewRequest {
      /** 钻取实体名称（与路由 query `name` 一致，如应用名） */
      name: string
      /** 来源页面标识，如 comprehensive-analysis */
      from: string
    }
  }

  /** 商业洞察 - IAA 分析 */
  namespace BusinessInsight {
    namespace IaaAnalysis {
      /** 筛选下拉选项 */
      interface FilterOptions {
        appOptions: { label: string; value: string }[]
        platformOptions: { label: string; value: string }[]
        countryOptions: { label: string; value: string }[]
      }
      /** 概览 KPI 请求 */
      interface OverviewKpiParams {
        tab: string
        s_app_id?: string
        platform?: string
        s_country_code?: string
        t_date: string
      }
      /** 概览 KPI 响应 */
      interface OverviewKpiResponse {
        kpis: Array<{
          id: string
          title: string
          primaryValue: string
          subText?: string
          trendUp?: boolean
          accent?: string
        }>
      }
    }
  }

  /** 配置管理（应用 / 用户 / 优化师等） */
  namespace ConfigManagement {
    /** 优化师管理 */
    namespace Optimizer {
      interface OperationLogItem {
        id: string
        timeLabel: string
        content: string
      }

      /** 列表/详情行（与 views 下 OptimizerItem 字段一致，便于联调） */
      interface ListItem {
        id: string
        no: number
        userId: string
        userName: string
        email: string
        avatarColor: string
        version: number
        sCode: string
        sCode2?: string
        minConsumption: number
        checkCode: string
        status: '在职' | '离职'
        apps: string[]
        recentLogs: OperationLogItem[]
        createTime: string
        lastModifyTime?: string
      }

      interface TableQuery extends Api.Common.CommonSearchParams {
        keyword?: string
        status?: string
      }

      interface FormPayload {
        id?: string
        userId: string
        version: number
        sCode: string
        sCode2?: string
        minConsumption: number
        checkCode: string
        status: '在职' | '离职'
      }

      /** 页头统计卡片（独立聚合，避免仅靠当前分页推算） */
      interface OverviewResponse {
        total: number
        active: number
        /** 在职优化师最低消耗要求均值（美元，整数或一位小数由后端约定） */
        avgMinConsumption: number
        monthNew: number
      }

      /** 新建时「关联用户」下拉候选 */
      interface MetaSystemUserItem {
        id: string
        userName: string
        email: string
        avatarColor: string
      }
    }
  }
}
