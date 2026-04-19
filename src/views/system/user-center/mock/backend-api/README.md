# 系统 · 个人中心 · 接口清单

**路由**：`/system/user-center`  
**父级路径**：`/api/system/user-center`  
**说明**：当前页面其余 Tab（基本信息、密码等）沿用既有认证/用户接口；本目录仅覆盖 **通知设置** 契约。

**前端封装**：`src/api/user-center.ts` — `fetchUserCenterNotificationSettings`（查询）、`fetchUserCenterNotificationSettingsSave`（保存）。进入「通知设置」Tab 时拉取详情并回显；保存按钮提交保存接口。

## 接口清单

| 优先级 | 说明 | 逻辑 URL | 方法 | 契约文件 |
| --- | --- | --- | --- | --- |
| P0 | 查询当前用户通知设置 | `/notification-settings/query` | POST | `01-notification-settings-query.json` |
| P0 | 保存当前用户通知设置 | `/notification-settings/save` | POST | `02-notification-settings-save.json` |

## 场景 → 接口

| 场景 | 契约文件 | 触发时机摘要 |
| --- | --- | --- |
| 进入「通知设置」Tab 或页面默认展示该 Tab 时拉取偏好 | `01-notification-settings-query.json` | 首屏/切换 Tab 时（实现接入后） |
| 点击「保存设置」提交表单 | `02-notification-settings-save.json` | 用户确认保存 |

## 联调说明

1. 请求体字段键名均为 **camelCase**；与当前页面对齐时仅包含：**飞书通知**（`alert`、`daily`）、**预警级别**（仅 `alertChannels.high`，渠道仅 `feishu`）、**推送时间**（`pushInWorkTime`、`pushStartTime`、`pushEndTime`、`pushWeekdays`）。
2. `feishu` 仅包含当前表格展示的两类：`alert`（预警通知）、`daily`（日报推送）。
3. `alertChannels` 仅包含 `high`；渠道数组元素当前仅 `feishu`（与「飞书卡片」勾选一致）。
4. `pushWeekdays` 为 **1–7** 的整数数组，**1=周一 … 7=周日**，与页面 `ElCheckbox` 取值一致。
5. `pushStartTime` / `pushEndTime` 为当日时间字符串，格式 **`HH:mm`**（24 小时制）。
6. 若网关统一包裹 `{ code, data, message }`，业务体以实际网关为准；契约 `sampleResponse` 中已用 `data` 承载查询结果，保存接口示例为 `{ success: true }`，可按网关规范再包一层。
