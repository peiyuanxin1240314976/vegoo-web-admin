## 文本管理 - backend-api 契约

### 父级 API 路径（建议）

`/api/v1/datacenter/analysis/product-operations/text-management`

对应路由：`/product-operations/text-management`。

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-store-listing-draft.json` | 商店文案草稿：应用主文案 + 多语种译文列表 | `/store-listing/draft` | GET / POST | P0 |
| `02-audit-word-lists.json` | 文本审核：违禁词、品牌词词库（审核页配置） | `/meta/audit-word-lists` | GET | P1 |
| `03-translate.json` | 单语种 AI 译化（自动填充步骤） | `/action/translate` | POST | P0 |
| `04-audit-confirm.json` | 文本审核确认（全部确认/确认审核结果） | `/action/audit-confirm` | POST | P0 |
| `05-audit-rerun.json` | 重新审核（按最新文本重跑审核） | `/action/audit-rerun` | POST | P0 |
| `06-translations-import.json` | 导入译文文件并解析回标准列表 | `/action/translations-import` | POST | P0 |
| `07-translations-export.json` | 导出译文文件（返回下载地址） | `/action/translations-export` | POST | P0 |
| `08-translation-edit-save.json` | 单条译文编辑保存 | `/action/translation-edit-save` | POST | P0 |
| `09-submit-store.json` | 提交到商店后台任务 | `/action/submit-store` | POST | P0 |

### 拆分原则

- **草稿与译化分离**：草稿读写独立；译化为单独操作类接口，避免单接口 payload 过大。
- **元信息与业务分离**：审核词库走 `meta/*`，便于缓存与权限控制。
- **业务体口径**：`sampleResponse` 表示业务体（网关若有 `code/message/data` 包裹，则放在 `data` 中）。
- **草稿接口读写**：`01-store-listing-draft` 使用同一路径，`GET` 读取草稿，`POST` 保存草稿（请求体与草稿结构一致）。
