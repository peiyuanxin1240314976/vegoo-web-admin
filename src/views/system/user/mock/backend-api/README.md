# 系统 · 用户管理 · 接口清单

**路由**：`/system/user`  
**父级路径**：`/api/user`（列表为 `GET /api/user/list`，与 `src/api/system-manage.ts` 中 `fetchGetUserList` 一致）

## 接口清单

| 优先级 | 说明         | 逻辑 URL         | 方法 | 契约文件            |
| ------ | ------------ | ---------------- | ---- | ------------------- |
| P0     | 分页用户列表 | `/api/user/list` | GET  | `01-user-list.json` |

**说明**：本页为存量 **GET + query**；项目新模块约定为 POST + JSON body，迁移方案见 `01-user-list.json` 的 `apiSuggestion`。

## 场景 → 接口

| 场景       | 接口           | 触发时机摘要                           |
| ---------- | -------------- | -------------------------------------- |
| 列表首屏   | `01-user-list` | `index.vue` 表格 `useTable` 初始化加载 |
| 搜索与分页 | `01-user-list` | 筛选、分页、刷新                       |

详细 `interaction` 见 `01-user-list.json`。
