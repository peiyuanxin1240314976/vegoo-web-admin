# 综合分析 — api-mock 示例 JSON

与 `../backend-api/*.json` 中 **`sampleResponse` 的业务体**一致（根级 `data` 模拟网关包裹后的形状），便于 Postman / Insomnia / MSW 直接导入。

**维护**：调整 `mock/data.ts` 中 `MOCK_COMPREHENSIVE_ANALYSIS_*` 基线或契约示例后，请同步更新本目录对应文件。

**开关**：是否走本 Mock 由 `../config/data-source.ts` 中 `COMPREHENSIVE_ANALYSIS_USE_MOCK` 控制；实现代码为 `../comprehensive-analysis-api-mock.ts`。
