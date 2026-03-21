# 广告系列详情页 Mock 说明

页面路由：`/user-growth/ad-performance/campaign-detail` 对应类型：`../types.ts`（`CampaignDetailData` 及子类型）

## 文件说明

| 文件           | 说明                                                      |
| -------------- | --------------------------------------------------------- |
| `data.ts`      | 页面所有 mock 数据的入口，供 `index.vue` 直接 import 使用 |
| `backend-api/` | 接口契约定义，供后端实现与联调参考                        |

## Mock 数据来源

数据按 UI 原型图填写，字段与 `types.ts` 保持一致，后续对接真实接口时直接替换 `data.ts` 中的常量即可。
