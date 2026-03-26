# 人员绩效（Performance Analysis）接口契约

本目录为「用户增长 / 人员绩效」页面的接口契约定义，供后端实现与前端联调使用。

## 父级 API 路径

建议与用户增长模块保持一致：

`/api/v1/datacenter/analysis/user-growth/performance-analysis`

## 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-meta-filter-options.json` | 筛选项元数据（人员/应用/达标状态） | `/meta-filter-options` | POST | P0 |
| `02-performance-list.json` | 列表页人员绩效数据 | `/performance-list` | POST | P0 |
| `03-overview-metrics.json` | 列表页右侧指标概览 | `/overview-metrics` | POST | P0 |
| `04-compare-candidates.json` | 对比页“添加对比”候选人员（按筛选条件） | `/compare-candidates` | POST | P0 |
| `05-comparison-overview.json` | 对比页顶部 KPI 汇总 | `/comparison-overview` | POST | P0 |
| `06-comparison-charts.json` | 对比页图表数据（ROI/花费/雷达/利润） | `/comparison-charts` | POST | P0 |
| `07-comparison-rankings.json` | 对比页指标排名数据 | `/comparison-rankings` | POST | P0 |
| `08-comparison-score-detail.json` | 对比页绩效得分明细 | `/comparison-score-detail` | POST | P0 |
| `09-comparison-alerts.json` | 对比页异常预警列表 | `/comparison-alerts` | POST | P1 |

## 统一约定

- 广告平台字段使用 `source`，终端平台字段使用 `platform`。
- 日期范围统一传真实日期区间：`startDate` / `endDate`，格式 `YYYY-MM-DD`。
- “添加对比”接口必须支持 `excludeIds`，避免返回已选人员。
