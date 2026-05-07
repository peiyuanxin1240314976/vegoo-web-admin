# 整体回收 — Mock 数据说明

## 目录

```
mock/
  data.ts               本地 Mock 数据（Tab 数据，被 overall-recovery-api-mock 引用）
  README.md             本文件
  backend-api/
    README.md           接口清单与拆分说明
    02-overall-tab-*.json         Tab1 五段接口契约（kpis / recovery-curve / … / detail-records）
    03-organic-tab.json           Tab2 自然量分析数据
```

顶栏筛选项 **无独立 Mock 常量**：与付费分析等同构页一致，数据来自公用 **`cockpit/meta-filter-options`**（Pinia `useCockpitMetaFilterStore`）。

## 数据结构映射

| 导出名                  | 对应类型         | 对应接口                                |
| ----------------------- | ---------------- | --------------------------------------- |
| `MOCK_OVERALL_TAB_DATA` | `OverallTabData` | `02-overall-tab-*.json`（五段合并展示） |
| `MOCK_ORGANIC_TAB_DATA` | `OrganicTabData` | `03-organic-tab.json`                   |

## 接入真实接口

在 `src/api/user-growth/overall-recovery.ts` 中对应 `fetch*` 由模块 `config/data-source.ts` 切换 Mock / 远程；类型契约与 `mock/backend-api` 对齐。
