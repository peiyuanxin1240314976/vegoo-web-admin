# bc-management backend-api 契约索引

父级 API：`/api/account-management/bc-management`

## 接口清单

- `01-bc-table.json`：BC 分页列表（P0）
- `02-bc-filter-options.json`：状态/开户主体/封户记录筛选项（P0）
- `03-bc-create.json`：新建 BC（P0）
- `04-bc-update.json`：编辑 BC（P0）
- `05-bc-delete.json`：删除 BC（P0）
- `06-bc-export.json`：导出 BC 列表（P1）

## 场景 -> 接口

| 场景         | 触发时机 | 契约                        |
| ------------ | -------- | --------------------------- |
| 页面首屏列表 | 页面挂载 | `01-bc-table.json`          |
| 筛选项初始化 | 页面挂载 | `02-bc-filter-options.json` |
| 新建/编辑    | 弹窗提交 | `03/04`                     |
| 删除         | 删除确认 | `05`                        |
| 导出         | 点击导出 | `06`                        |
