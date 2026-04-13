# 应用商店凭据管理 · 接口清单

**父级路径**：`/api/config-management/app-store-management`

## 场景 → 接口

| 场景 | 契约文件 | 建议 fetch\* |
| --- | --- | --- |
| 进入页面 / 平台筛选 / 状态筛选 | `01-credential-table.json` | `fetchAppStoreCredentialTable` |
| 顶部统计卡片（已配置、正常、异常、即将过期） | `02-overview-stats.json` | `fetchAppStoreCredentialOverviewStats` |
| 新增凭据（保存并测试） | `03-credential-create.json` | `createAppStoreCredential` |
| 编辑凭据保存 | `04-credential-update.json` | `updateAppStoreCredential` |
| 单条测试连接（正常/失败弹窗） | `05-credential-test-connection.json` | `testAppStoreCredentialConnection` |
| 批量测试连接 | `06-credential-batch-test.json` | `batchTestAppStoreCredentialConnection` |
| 连接异常重试 | `07-credential-retry-connection.json` | `retryAppStoreCredentialConnection` |
| 查看详情（查看按钮/告警详情） | `08-credential-detail.json` | `fetchAppStoreCredentialDetail` |
| 导出列表 | `09-credential-export.json` | `exportAppStoreCredentialList` |

## 场景触发说明

| 页面场景     | 触发时机                           | 接口                 |
| ------------ | ---------------------------------- | -------------------- |
| 首屏加载     | `onMounted` 首次进入页面           | 表格 + 统计卡片      |
| 筛选变更     | 平台或状态下拉变化                 | 表格 + 统计卡片      |
| 新增凭据     | 新增弹窗点击「保存并测试」         | 新增接口后接单条测试 |
| 编辑凭据     | 编辑弹窗点击「保存」               | 更新接口             |
| 状态按钮动作 | 点击「测试/续期/重试」             | 单条测试或重试       |
| 批量测试按钮 | 点击页头「测试连接」               | 批量测试             |
| 查看动作     | 点击「查看」或底部告警「查看详情」 | 凭据详情             |
| 导出         | 点击页头「导出」                   | 导出接口             |

## 方法与路径

| 方法 | 路径                                | 说明         |
| ---- | ----------------------------------- | ------------ |
| POST | `/credential/table`                 | 凭据分页列表 |
| POST | `/credential/overview-stats`        | 顶部统计     |
| POST | `/credential/create`                | 新增         |
| POST | `/credential/update`                | 编辑         |
| POST | `/credential/test-connection`       | 单条测试连接 |
| POST | `/credential/test-connection-batch` | 批量测试     |
| POST | `/credential/retry-connection`      | 异常重试     |
| POST | `/credential/detail`                | 详情         |
| POST | `/credential/export`                | 导出         |
