# 认证接口 API 契约

该目录维护登录态获取与当前用户信息相关的接口契约。

## 父级 API 路径

`/api/v1/datacenter/biz/user`

## 接口清单

| 功能             | 方法 | Endpoint | 契约文件            | 优先级 |
| ---------------- | ---- | -------- | ------------------- | ------ |
| 获取当前用户信息 | GET  | `/get`   | `01-user-info.json` | P0     |

## 场景 -> 接口

| 页面场景 | 接口 | 触发时机 | 说明 |
| --- | --- | --- | --- |
| 登录成功后初始化用户态 | `GET /get` | token 已写入后 | 获取当前登录用户的基础资料、角色身份与权限配置 |
| 页面刷新后恢复登录态 | `GET /get` | 应用初始化并检测到本地 token | 重新拉取用户信息，避免使用本地过期权限 |

## 契约说明

1. `roles` 为正式角色字段，建议后端直接返回最终角色列表。
2. `permissions` 为兼容字段，短期内与 `roles` 保持一致，供老逻辑平滑迁移。
3. `permissionConfig.routePermissions.routeNames` 表示当前用户最终可访问的页面集合，建议由后端直接下发，而不是让前端再根据角色推导一次。
4. `permissionConfig.datePermissions.defaultDateScope` 与 `pageDateScopes` 用于前端日期选择器限制，同时后端查询接口仍需做兜底校验。
5. `buttonPermissions.codes` 当前可以返回空数组，但结构建议固定保留，方便后续扩展按钮级权限。
