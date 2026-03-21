# 整体回收 — Mock 数据说明

## 目录

```
mock/
  data.ts               本地 Mock 数据（被 src/api/user-growth.ts 引用）
  README.md             本文件
  backend-api/
    README.md           接口清单与拆分说明
    01-meta-filter-options.json   筛选下拉选项
    02-overall-tab.json           Tab1 整体回收数据
    03-organic-tab.json           Tab2 自然量分析数据
```

## 数据结构映射

| 导出名 | 对应类型 | 对应接口 |
| --- | --- | --- |
| `MOCK_OVERALL_RECOVERY_FILTER_OPTIONS` | `OverallRecoveryFilterOptions` | `01-meta-filter-options.json` |
| `MOCK_OVERALL_TAB_DATA` | `OverallTabData` | `02-overall-tab.json` |
| `MOCK_ORGANIC_TAB_DATA` | `OrganicTabData` | `03-organic-tab.json` |

## 接入真实接口

在 `src/api/user-growth.ts` 中将对应函数的 `Promise.resolve(MOCK_...)` 替换为 `request.post(...)` 即可，类型契约保持不变。
