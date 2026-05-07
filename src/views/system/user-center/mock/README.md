# 系统 · 个人中心 Mock

该目录维护 `system/user-center` 页面相关接口契约，当前仅沉淀 **通知设置** 的联调文档与示例。

## 目录说明

- `backend-api/README.md`：父级路径与接口清单
- `backend-api/01-notification-settings-query.json`：查询当前用户通知偏好
- `backend-api/02-notification-settings-save.json`：保存通知偏好

## 对接说明

页面入口：`/system/user-center`，通知 Tab 对应表单字段与契约中 `UserNotificationSettings` 对齐；联调时以 `mock/backend-api` 内 `fieldDescription` 与 `sampleRequest` / `sampleResponse` 为准。
