# 角色管理 API 契约

该目录维护 `config-management/role` 页面的接口契约。当前页面第一版聚焦三类数据：

- 角色基础信息
- 页面权限
- 日期权限

## 父级 API 路径

`/api/v1/datacenter/analysis/config-management/role`

## 接口清单

| 功能             | 方法 | Endpoint               | 契约文件                       | 优先级 |
| ---------------- | ---- | ---------------------- | ------------------------------ | ------ |
| 获取角色列表     | POST | `/list`                | `01-role-list.json`            | P0     |
| 获取页面权限     | POST | `/permissions/pages`   | `02-page-permissions.json`     | P0     |
| 获取日期权限     | POST | `/permissions/date`    | `03-date-permissions.json`     | P0     |
| 获取权限摘要     | POST | `/permissions/summary` | `04-permission-summary.json`   | P1     |
| 获取角色成员     | POST | `/users`               | `05-role-users.json`           | P1     |
| 保存角色权限     | POST | `/permissions/update`  | `06-role-permission-save.json` | P0     |
| 保存角色基础信息 | POST | `/detail/save`         | `07-role-detail-save.json`     | P0     |

## 场景 -> 接口

| 页面场景 | 接口 | 触发时机 | 说明 |
| --- | --- | --- | --- |
| 进入角色管理页 | `POST /list` | `index.vue` 初始化 | 拉左侧角色列表，默认选中第一项 |
| 选中左侧角色 | `POST /permissions/pages` | 角色切换后 | 渲染页面权限树并回填勾选 |
| 切到日期权限 Tab | `POST /permissions/date` | 首次进入 Tab 或角色切换 | 回填默认日期规则与页面覆盖规则 |
| 选中左侧角色 | `POST /permissions/summary` | 角色切换后 | 刷新右侧权限摘要 |
| 选中左侧角色 | `POST /users` | 角色切换后 | 刷新右侧角色成员列表 |
| 点击保存权限配置 | `POST /permissions/update` | 中间面板底部保存按钮 | 统一提交页面权限与日期权限 |
| 点击新增角色或编辑角色弹窗确认 | `POST /detail/save` | 角色基础信息弹窗提交 | 仅保存角色基础信息 |

## 契约说明

1. 页面权限的唯一标识使用 `routeName`，建议直接和前端路由 `name` 一致。
2. 日期权限采用： `defaultDateScope + pageDateScopes` 这样既能快速上线，也方便后续扩展到按钮级权限和更多数据策略。
3. `buttonPermissions.codes` 当前只做预留，前端仍会按该结构提交空数组，确保未来扩展时无需改接口根结构。
4. 角色基础信息弹窗只维护 `roleName / roleCode / description / enabled`，权限编辑继续在主面板完成。
5. 当前模块不涉及公共 cockpit `meta-filter-options`，因此本目录没有该类 JSON 契约文件。
