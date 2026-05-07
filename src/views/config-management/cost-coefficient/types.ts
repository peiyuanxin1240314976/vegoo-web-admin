// 成本系数管理类型定义

export interface AdPlatform {
  nSource: number // n_source 值
  name: string
  abbr: string // 缩写，用于图标显示
  color: string // 图标背景色
}

export interface CostCoefficientItem {
  id: string
  nSource: number // 广告平台 n_source
  platformName: string // 广告平台名称
  tstart: string // 生效起始日期 YYYY-MM-DD
  dcostRatio: number // 折算比例 d_cost_ratio，3位小数
  dinstallCost: number // 安装成本 d_install_cost，5位小数
  updatedAt: string // 最后修改时间 YYYY-MM-DD HH:mm
  updatedBy: string // 操作人
  remark: string // 备注
  isDeleted: boolean // 逻辑删除
}

export interface CostCoefficientHistory {
  time: string
  operator: string
  changes: string[] // 变更描述列表
}

export interface CostCoefficientFormModel {
  nSource: number | null
  tStart: string
  dCostRatio: number | ''
  dInstallCost: number | ''
  remark: string
}

export interface CostCoefficientQuery {
  nSource?: number | ''
  tStartYear?: string
  keyword?: string
  page: number
  pageSize: number
}

export interface CostCoefficientOverviewKpi {
  total: number
  active: number
  platforms: number
  monthChanges: number
}
