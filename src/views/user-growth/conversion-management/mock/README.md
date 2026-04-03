# 转化管理 Mock

- **HTTP 契约（`fieldDescription` / `sampleRequest` / `sampleResponse` / `interaction`）**：见 `backend-api/README.md` 与各 `backend-api/*.json`。
- **页面级静态/Mock 实现**：`data.ts`（name Tab 列表与侧栏静态量）、`data-tab.ts`（data Tab 聚合 Mock）。
- **数据源 mock | 远程**：待按 `module-api-mock-config` 在页面目录下增加 `config/data-source.ts` 后与 `src/api/user-growth/conversion-management.ts` 对齐（当前 API 文件仍为占位路径与非 POST 形态，以契约为准联调）。
