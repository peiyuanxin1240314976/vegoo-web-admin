# 角色管理 API 契约

本目录维护 `config-management/role` 相关的接口契约。根据项目规范，接口契约以 JSON 文件形式承载，并按页面内模块进行独立拆分。

## 父级 API 路径

`/api/config-management/role`

## 接口清单

| 功能             | 方法 | Endpoint               | 契约文件                          | 优先级 |
| ---------------- | ---- | ---------------------- | --------------------------------- | ------ |
| 获取角色列表     | POST | `/list`                | `01-role-list.json`               | P0     |
| 获取角色功能权限 | POST | `/permissions/func`    | `02-permission-func.json`         | P0     |
| 获取角色数据权限 | POST | `/permissions/data`    | `03-permission-data.json`         | P0     |
| 获取角色权限摘要 | POST | `/permissions/summary` | `04-permission-summary.json`      | P1     |
| 获取角色关联用户 | POST | `/users`               | `05-role-users.json`              | P1     |
| 保存角色权限配置 | POST | `/permissions-update`  | `06-role-permissions-update.json` | P0     |

## 拆分原则与约束对齐

1. **细粒度 Endpoint**：严格根据 UI 边界将原有的“获取权限树”拆解为了 **左侧列表** (`list`)、**中间 Tab 1** (`permissions/func`)、**中间 Tab 2** (`permissions/data`)、**右上角摘要统计** (`permissions/summary`) 和 **右下角用户列表** (`users`) 五个独立的查询接口。避免了“一口气返回整页所有数据”的设计。
2. **驼峰命名 & 类型约定**：`sampleResponse` 及 `fieldDescription` 中全面采用 camelCase，且代表 ID 的字段符合类型定义（如 `roleId`）。
3. **枚举覆盖**：`dataScope` 等字段具备闭合的 `enum`，并在示例中给出全面覆盖。
4. **数组数据量**：功能权限模块 `modules` 等数组在返回体中均提供了 ≥3 条有效数据示例，以支撑 UI 层对多种勾选及禁用状态的准确渲染。
