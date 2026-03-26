## 人员绩效（Performance Analysis）- Mock 说明

本目录用于「用户增长 / 人员绩效」页面在接口未就绪或联调阶段的契约管理与示例数据联调。

数据源开关建议放在 `../config/data-source.ts`，并与 `backend-api` 各接口一一对应。

### 目录结构

- `backend-api/`：接口契约（每个 JSON 对应一个接口，包含字段说明与 sampleRequest/sampleResponse）

### 联调目标

- 列表页按当前筛选条件获取人员数据。
- 对比页点击“添加对比”时，按当前筛选条件重新拉取可选人员（并排除已选）。
