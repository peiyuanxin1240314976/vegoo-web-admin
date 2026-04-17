# 角色管理 Mock 说明

该目录用于支撑 `src/views/config-management/role` 页面在接口未完全联调前的前端开发。

## 目录说明

- `backend-api/` 角色管理页的接口契约 JSON，已按“角色列表 / 角色基础信息 / 页面权限 / 日期权限 / 摘要 / 成员 / 保存”拆分。
- `data.ts` 当前页面的本地 mock 数据与辅助构造函数，包括：
  - 角色列表
  - 角色成员
  - 页面权限路由树
  - 日期权限默认规则与页面覆盖规则
  - 右侧摘要信息

## 当前约束

1. 第一版页面只落地：页面权限日期权限
2. 角色基础信息弹窗只维护： `roleName / roleCode / description / enabled` 权限本身不在弹窗内编辑。
3. `buttonPermissions.codes` 已在保存契约中预留，但本期固定为空数组。
4. 页面权限的唯一标识使用 `routeName`，建议后端也以此为准存储角色可见页面。
5. 日期权限采用： `defaultDateScope + pageDateScopes` 便于后续扩展到更多数据权限场景。
