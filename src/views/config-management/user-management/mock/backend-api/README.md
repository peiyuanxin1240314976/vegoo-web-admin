# 用户管理 · 接口清单

**父级路径**：`/api/config-management/user`

| 方法   | 路径                     | 说明          |
| ------ | ------------------------ | ------------- |
| POST   | `/table`                 | 分页列表      |
| POST   | `/`                      | 新增用户      |
| PUT    | `/:id`                   | 更新用户信息  |
| DELETE | `/:id`                   | 删除用户      |
| PUT    | `/:id/status`            | 禁用/启用用户 |
| POST   | `/:id/reset-password`    | 重置密码      |
| POST   | `/:id/resend-activation` | 发送激活邮件  |
| POST   | `/export`                | 导出          |

详细字段见各 `*.json` 契约文件。
