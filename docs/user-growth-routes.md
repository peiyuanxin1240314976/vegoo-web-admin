# 用户增长模块 — 路由与跳转全表

> 生成时间：2026-03-30 图例：✅ keepAlive=true　🔒 keepAlive=false　🔗 isHide 隐藏子页　👁️ 菜单可见

---

## 一、账户成效模块

| 页面 | 完整路由路径 | Name | keepAlive | 类型 | 跳出目标 | 触发动作 | 传参 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 账户成效 | `/user-growth/account-performance` | AccountPerformance | ✅ | 👁️ | → AdPlatformInfo | 点击平台卡片行 | `?id=` |
| 账户成效 | `/user-growth/account-performance` | AccountPerformance | ✅ | 👁️ | → CampaignDetail | 点击应用行/账户明细行 | `?id=&appId=&name=...` |

---

## 二、广告平台分析模块

| 页面 | 完整路由路径 | Name | keepAlive | 类型 | activePath（侧边高亮） | 跳出目标 | 触发动作 | 传参 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 广告平台分析 | `/user-growth/ad-platform-analysis` | AdPlatformAnalysis | ✅ | 👁️ | — | → AdPlatformInfo | 点击广告系列行 | `?id=` |
| 广告平台详情 | `/user-growth/ad-platform-analysis/ad-platform-info` | AdPlatformInfo | ✅ | 🔗 | `/user-growth/ad-platform-analysis` | — | — | 接收 `?id=` |

---

## 三、我的广告模块

| 页面 | 完整路由路径 | Name | keepAlive | 类型 | 跳出目标 | 触发动作 | 传参 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 我的广告 | `/user-growth/my-ads` | MyAds | ✅ | 👁️ | → CampaignDetail | CampaignTab 点击行 | `?id=&name=&appId=&appName=` |
| 我的广告 | `/user-growth/my-ads` | MyAds | ✅ | 👁️ | ← 上一页 | 返回按钮 `router.back()` | — |

---

## 四、广告成效模块（3 级子页链路）

| 层级 | 页面 | 完整路由路径 | Name | keepAlive | 类型 | activePath（侧边高亮） | 跳出目标 | 触发动作 | 传参 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| L1 | 广告成效 | `/user-growth/ad-performance` | AdPerformance | ✅ | 👁️ | — | → CampaignDetail | 侧边抽屉「查看系列」 | `?id=&name=...` |
| L2 | 系列详情 | `/user-growth/ad-performance/campaign-detail` | CampaignDetail | 🔒 | 🔗 | `/user-growth/ad-performance` | → AdDetail | 广告列表点击行 | `?id=&campaignId=` |
| L2 | 系列详情 | `/user-growth/ad-performance/campaign-detail` | CampaignDetail | 🔒 | 🔗 | `/user-growth/ad-performance` | → AdEdit | 「编辑」按钮 | `?campaignId=&appId=...` |
| L3 | 广告详情 | `/user-growth/ad-performance/campaign-detail/ad-detail` | AdDetail | 🔒 | 🔗 | `/user-growth/ad-performance` | → AdEdit | 「编辑」按钮 | `?campaignId=&adId=` |
| L3 | 广告编辑 | `/user-growth/ad-performance/campaign-detail/ad-edit` | AdEdit | 🔒 | 🔗 | `/user-growth/ad-performance` | ← CampaignDetail | 提交成功 / 返回按钮 `router.back()` | — |

> L2/L3 侧边栏高亮均保持在「广告成效」跳入 `CampaignDetail` 的来源：AccountPerformance、MyAds（CampaignTab）、AdPerformance（抽屉）

---

## 五、成效分析模块

| 页面 | 完整路由路径 | Name | keepAlive | 类型 | activePath（侧边高亮） | 跳出目标 | 触发动作 | 传参 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 成效分析（列表） | `/user-growth/performance-analysis` | PerformanceAnalysis | ✅ | 👁️ | — | → PerformanceComparison | 单行「查看详情」 | `?ids=&startDate=&endDate=` |
| 成效分析（列表） | `/user-growth/performance-analysis` | PerformanceAnalysis | ✅ | 👁️ | — | → PerformanceComparison | 多选「对比」（≥2 行） | `?ids=,...&startDate=&endDate=` |
| 成效对比 | `/user-growth/performance-analysis/comparison` | PerformanceComparison | 🔒 | 🔗 | `/user-growth/performance-analysis` | ← PerformanceAnalysis | 「返回」按钮 `router.push(path)` | — |

---

## 六、综合分析模块

| 页面 | 完整路由路径 | Name | keepAlive | 类型 | activePath（侧边高亮） | 跳出目标 | 触发动作 | 传参 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 综合分析 | `/user-growth/comprehensive-analysis` | ComprehensiveAnalysis | ✅ | 👁️ | — | → PlatformAnalysisDetail | 图表/表格下钻 | `?name=&from=comprehensive-analysis` |
| 应用详情 | `/user-growth/comprehensive-analysis/platform-analysis-detail` | PlatformAnalysisDetail | 🔒 | 🔗 | `/user-growth/comprehensive-analysis` | ← ComprehensiveAnalysis | 面包屑「← 返回综合分析」 | — |
| 应用详情 | `/user-growth/comprehensive-analysis/platform-analysis-detail` | PlatformAnalysisDetail | 🔒 | 🔗 | `/user-growth/comprehensive-analysis` | ← AccountPerformance | 面包屑「应用层面」 | — |
| 应用详情 | `/user-growth/comprehensive-analysis/platform-analysis-detail` | PlatformAnalysisDetail | 🔒 | 🔗 | `/user-growth/comprehensive-analysis` | ← AdPlatformAnalysis | 面包屑「广告平台层面」 | — |

> `PlatformAnalysisDetail` 面包屑可横跳至 3 个不同模块，是全模块唯一多向出口子页。

---

## 七、独立页面（无页内跳转逻辑）

| 页面 | 完整路由路径 | Name | keepAlive | 备注 |
| --- | --- | --- | --- | --- |
| 我的成效 | `/user-growth/my-performance` | MyPerformance | ✅ | 占位页，暂无跳转 |
| 实时数据 | `/user-growth/real-time-data` | AdMobDetail | ✅ | 独立页，无跳出 |
| 转化管理 | `/user-growth/conversion-management` | ConversionManagement | ✅ | 独立页，无跳出 |
| 代理分析 | `/user-growth/agency-analysis` | AgencyAnalysis | ✅ | 组件来自 `business-insight/agency-analysis` |
| 付费分析 | `/user-growth/paid-analysis` | UserGrowthPaidAnalysis | ✅ | 独立页，无跳出 |
| 整体回收 | `/user-growth/overall-recovery` | OverallRecovery | ✅ | 独立页，无跳出 |
| 预警管理 | `/user-growth/alert-management` | AlertManagement | ✅ | 独立页，无跳出 |

---

## 汇总：隐藏子页（isHide）一览

| 子页名称 | 完整路由路径 | Name | keepAlive | activePath（侧边高亮） | 接收参数 | 可被谁跳入 |
| --- | --- | --- | --- | --- | --- | --- |
| 广告平台详情 | `/user-growth/ad-platform-analysis/ad-platform-info` | AdPlatformInfo | ✅ | `/user-growth/ad-platform-analysis` | `?id=` | AdPlatformAnalysis、AccountPerformance |
| 成效对比 | `/user-growth/performance-analysis/comparison` | PerformanceComparison | 🔒 | `/user-growth/performance-analysis` | `?ids=&startDate=&endDate=` | PerformanceAnalysis（单行查看 / 多选对比） |
| 应用详情 | `/user-growth/comprehensive-analysis/platform-analysis-detail` | PlatformAnalysisDetail | 🔒 | `/user-growth/comprehensive-analysis` | `?name=&from=` | ComprehensiveAnalysis |
| 系列详情 | `/user-growth/ad-performance/campaign-detail` | CampaignDetail | 🔒 | `/user-growth/ad-performance` | `?id=&appId=&name=...` | AccountPerformance、MyAds、AdPerformance |
| 广告详情 | `/user-growth/ad-performance/campaign-detail/ad-detail` | AdDetail | 🔒 | `/user-growth/ad-performance` | `?id=&campaignId=` | CampaignDetail |
| 广告编辑 | `/user-growth/ad-performance/campaign-detail/ad-edit` | AdEdit | 🔒 | `/user-growth/ad-performance` | `?campaignId=&adId=` | CampaignDetail、AdDetail |
