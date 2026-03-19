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

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status'> &
        Api.Common.CommonSearchParams
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
}
