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

    /** 广告平台分析 - 筛选项元数据单项（响应 data.apps | platforms | sources[]） */
    interface AdPlatformFiltersMetaOptionDto {
      label: string
      value: string
    }

    /** 广告平台分析 - 筛选项元数据（响应 data，POST .../filters/meta） */
    interface AdPlatformFiltersMetaDto {
      apps: AdPlatformFiltersMetaOptionDto[]
      platforms: AdPlatformFiltersMetaOptionDto[]
      /** 广告平台下拉，请求体字段 `source` 对应该项的 `value` */
      sources: AdPlatformFiltersMetaOptionDto[]
    }

    /**
     * 广告平台分析大屏通用请求体（各模块 POST 入参一致）
     * 例：KPI 卡片 POST /api/v1/datacenter/analysis/ad-platform/kpi/cards
     */
    interface AdPlatformAnalysisRequestParams {
      appId: string
      currentPage: number
      dateEnd: string
      dateStart: string
      groupBy: string
      pageSize: number
      /** 终端平台筛选，如 ios / android；空字符串表示全部 */
      platform: string
      /** 广告平台筛选；空字符串表示全部 */
      source: string
      userId: string
    }

    /** KPI 卡片单项（响应 data[]） */
    interface AdPlatformKpiCardDto {
      id: string
      name: string
      logo?: string
      cost: string
      revenue: string
      cpi: string
      roi: number
      roiChange: number
      roiChangeUp: boolean
      trendData: number[]
    }

    /** ROI 趋势折线系列（响应 data.series[]） */
    interface AdPlatformRoiTrendSeriesDto {
      name: string
      data: number[]
    }

    /** ROI 趋势（响应 data，POST .../roi/trend） */
    interface AdPlatformRoiTrendDto {
      /** 横轴日期，如 YYYY-MM-DD */
      dates: string[]
      series: AdPlatformRoiTrendSeriesDto[]
    }

    /** 用户质量热力图单行（响应 data[]，POST .../quality/heatmap） */
    interface AdPlatformQualityHeatmapRowDto {
      /** 广告平台名称，对应热力图行 */
      source: string
      d1Retention: number
      d7Retention: number
      d30Retention: number
      payRate: number
      arpu: number
    }

    /** Top10 广告系列单行（响应 data[]，POST .../campaign/top10） */
    interface AdPlatformCampaignTop10RowDto {
      campaignId: string
      campaignName: string
      cost: number
      cpi: number
      roi: number
      /** 广告平台名称 */
      source: string
    }

    type AdPlatformMetricStatus = 'excellent' | 'average' | 'poor'

    /** 指标比较详情表单行（响应 data.rows[]，POST .../metrics/table） */
    interface AdPlatformMetricsTableRowDto {
      source: string
      status: string | AdPlatformMetricStatus
      statusText?: string
      cost: string
      revenue: string
      installs: string
      cpi: number
      cpiTrendUp: boolean
      roi: number
      roiTrendUp: boolean
      roas: number
      ltv7: number
      ltv30: number
      userQualityD7: number
      userQualityD7TrendUp: boolean
      userQualityPay: number
      userQualityPayTrendUp: boolean
      roiSparkline?: number[]
      cpiSparkline?: number[]
    }

    /** 指标比较详情分页（响应 data） */
    interface AdPlatformMetricsTableDto {
      total: number
      rows: AdPlatformMetricsTableRowDto[]
    }

    /**
     * 我的广告 - 頁頭通用請求體（與頂部篩選聯動，後續接口參數一致）
     * POST /api/v1/datacenter/analysis/my-ads/overview/page-header
     */
    /** 除 currentPage、pageSize 外，未傳或空值建議送 null（與後端約定一致） */
    interface MyAdsPageHeaderRequestParams {
      appId?: string | null
      countryCode?: string | null
      currentPage?: number
      endDate?: string | null
      groupBy?: 'app' | 'source' | null
      keyword?: string | null
      pageSize?: number
      source?: number | null
      staffId?: string | null
      startDate?: string | null
      /** Campaign 篩選：狀態 active|warn|inactive */
      status?: string | null
      /** Campaign 篩選：投放類型 with_agency=含代投 pure=僅直投 */
      agencyType?: 'with_agency' | 'pure' | null
    }

    /** 我的广告 - 筛选项下拉项 POST .../meta-filter-options */
    interface MyAdsFilterOptionDto {
      label: string
      value: string
    }

    /** 我的广告 - 筛选项 POST /api/v1/datacenter/analysis/my-ads/meta-filter-options */
    interface MyAdsMetaFilterOptionsDto {
      adPlatformOptions: Api.UserGrowth.MyAdsFilterOptionDto[]
      appOptions: Api.UserGrowth.MyAdsFilterOptionDto[]
      countryOptions: Api.UserGrowth.MyAdsFilterOptionDto[]
    }

    /** 我的广告 - 頁頭列表單行（與 MyAdsCampaignRowDto 一致） */
    interface MyAdsPageHeaderRowDto {
      id: string
      name: string
      appName: string
      appIcon: string
      platform: string
      platformIcon: string
      s_country_code: string
      status: string
      trend: string
      budget: number
      spend: number
      calcSpend: number
      agencySpend: number
      minSpend: number
      estProfit: number
      roi: number
    }

    /** 我的广告 - 頁頭 userCard（與後端約定） */
    interface MyAdsPageHeaderUserCardDto {
      avatarLetter: string
      name: string
      role: string
      appsLine: string
    }

    /** 我的广告 - 頁頭 metric 單項 */
    interface MyAdsPageHeaderMetricDto {
      label: string
      value: string
      sub: string
      subColor: string
      valueColor: string
    }

    /** 我的广告 - 頁頭響應 data（與 POST .../overview/page-header 約定一致） */
    interface MyAdsPageHeaderResponseDto {
      staffList: { id: string; name: string }[]
      defaultStaffId: string
      dateRange: [string, string]
      userCard: Api.UserGrowth.MyAdsPageHeaderUserCardDto
      metrics: Api.UserGrowth.MyAdsPageHeaderMetricDto[]
    }

    /** 我的广告 - Summary 消耗进度單行 POST .../overview/summary */
    interface MyAdsSummaryProgressItemDto {
      id: string
      name: string
      budget: string
      spend: string
      progress: number
      platformIcon: string
      statusType: string
      roi?: string
      status?: string
    }

    /** 我的广告 - Summary 饼图單項 */
    interface MyAdsSummarySourcePieItemDto {
      name: string
      value: number
      color: string
    }

    /** 我的广告 - Summary 统计卡單个 */
    interface MyAdsSummaryStatCardDto {
      main: string
      mainColor?: string
      budget?: string
      diff?: string
      diffColor?: string
      prevLine?: string
      momLine?: string
      momColor?: string
      borderColor?: string
      agency?: string
      direct?: string
      target?: string
      overTarget?: string
      minProfit?: string
      margin?: string
    }

    /** 我的广告 - Summary 趨勢 */
    interface MyAdsSummaryTrendDto {
      days: string[]
      spend: number[]
      profit: number[]
      roiPct: number[]
    }

    /** 我的广告 - Summary 響應 data */
    interface MyAdsSummaryResponseDto {
      progressList: Api.UserGrowth.MyAdsSummaryProgressItemDto[]
      sourcePie: Api.UserGrowth.MyAdsSummarySourcePieItemDto[]
      statCards: Record<string, Api.UserGrowth.MyAdsSummaryStatCardDto>
      trend: Api.UserGrowth.MyAdsSummaryTrendDto
    }

    /** 我的广告 - Platform 廣告系列卡片 POST .../overview/platform */
    interface MyAdsPlatformCampaignCardDto {
      platform: string
      platformIcon: string
      status: string
      spend: string
      budget: string
      roi: string
      roiTarget: string
      progress: number
      minSpend: string
      cpi: string
    }

    /** 我的广告 - Platform 應用分組 */
    interface MyAdsPlatformAppGroupDto {
      name: string
      nameEn: string
      icon: string
      color: string
      totalSpend: string
      avgRoi: string
      platformCount: number
      campaigns: Api.UserGrowth.MyAdsPlatformCampaignCardDto[]
    }

    /** 我的广告 - Platform 底部匯總 */
    interface MyAdsPlatformFooterDto {
      appCount: number
      campaignCount: number
      totalSpend: string
      overBudgetCount: number
      roiBelowTargetCount: number
      avgRoi: string
      estTotalProfit: string
      minTotalProfit: string
    }

    /** 我的广告 - Platform 響應 data */
    interface MyAdsPlatformResponseDto {
      appGroups: Api.UserGrowth.MyAdsPlatformAppGroupDto[]
      footer: Api.UserGrowth.MyAdsPlatformFooterDto
    }

    /** 我的广告 - Campaign 列表單行 POST .../overview/campaign */
    interface MyAdsCampaignRowDto {
      id: string
      name: string
      appId?: string
      appName: string
      appIcon: string | null
      platform: string
      platformIcon: string | null
      /** 國家代碼（規範字段）；與 `countryCode` 擇一 */
      s_country_code?: string | null
      /** 與 `s_country_code` 同義，部分後端返回 camelCase */
      countryCode?: string | null
      status: string
      trend: string | null
      budget: number
      spend: number
      calcSpend: number | null
      agencySpend: number | null
      minSpend: number | null
      estProfit: number
      roi: number
      /** 可選，部分接口可能不返回 */
      minProfit?: number
      cpi?: number
    }

    /** 我的广告 - Campaign 響應 data */
    interface MyAdsCampaignTableDto {
      list: Api.UserGrowth.MyAdsCampaignRowDto[]
      total: number
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

      /** 导出异步凭证（与网关约定；若直接返回文件流见接口说明） */
      interface ExportResponse {
        fileToken: string
      }
    }
  }
}
