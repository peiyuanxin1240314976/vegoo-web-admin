# 我的广告页 Mock 说明

## 用途

- 支撑 `component/MyAds.vue`、`SummaryTab.vue`、`PlatformTab.vue`、`CampaignTab.vue` 在接口未就绪时的数据展示与联调预览。
- 类型定义见同级目录 `../types.ts`；聚合数据见 `data.ts` 中的 `MOCK_MY_ADS`。
- 与后端契约见 `backend-api/README.md` 及各编号 JSON；实现接口时保持字段语义一致，前端可将 `mock/data.ts` 替换为 `fetch*` 请求结果映射。

## 文件

| 文件 | 说明 |
| --- | --- |
| `data.ts` | 页面级 Mock 常量：`MOCK_MY_ADS_PAGE_HEADER`、`MOCK_MY_ADS_SUMMARY_TAB`、`MOCK_MY_ADS_PLATFORM_TAB`、`MOCK_MY_ADS_CAMPAIGN_ROWS`、`MOCK_MY_ADS` |
| `backend-api/*.json` | 按接口拆分的请求/响应示例与 `fieldDescription` |

## 与类型的关系

- 页面头部（优化师下拉、期间、用户信息卡、指标横条）对应 `MyAdsPageHeaderMock`。
- 汇总 Tab 对应 `MyAdsSummaryTabMock`（统计卡、趋势、平台分布饼图、应用占比条、消耗进度表）。
- 应用 + 广告平台 Tab 对应 `MyAdsPlatformTabMock`。
- 广告系列明细 Tab 表格行对应 `MyAdsCampaignRowMock[]`（含 `s_country_code`；国旗由 `CampaignTab` 用 `flag-icons` 映射，不放在 Mock 里）。
