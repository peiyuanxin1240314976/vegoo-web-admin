## 文本管理 - backend-api 契约

### 父级 API 路径（建议）

`/api/product-operations/text-management`

对应路由：`/product-operations/text-management`。

### 接口清单

| 文件 | 说明 | 建议 URL | 方法 | 优先级 |
| --- | --- | --- | --- | --- |
| `01-store-listing-draft.json` | 商店文案草稿：应用主文案 + 多语种译文列表 | `/store-listing/draft` | GET / POST | P0 |
| `02-audit-word-lists.json` | 文本审核：违禁词、品牌词词库（审核页配置） | `/meta/audit-word-lists` | GET | P1 |
| `03-translate.json` | 单语种 AI 译化（自动填充步骤） | `/action/translate` | POST | P0 |

### 拆分原则

- **草稿与译化分离**：草稿读写独立；译化为单独操作类接口，避免单接口 payload 过大。
- **元信息与业务分离**：审核词库走 `meta/*`，便于缓存与权限控制。
