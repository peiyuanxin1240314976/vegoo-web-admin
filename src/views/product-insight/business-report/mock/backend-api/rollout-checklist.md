# 报告管理 - 灰度收口联调清单

## 说明

- 本清单用于第二阶段灰度收口：确认新契约三周期链路稳定后，下线旧 `01~05`。
- 验收优先级：`P0 -> P1 -> P2`。
- 每项建议记录：请求体、响应体、页面截图、异常日志（如有）。

## 日报联调

- [ ] `daily-00-app-list`：侧栏列表与顶栏 **多选**（`appIds` / `platformList` / `sourceList` / `countryCodeList`）联动；`appId` 固定 `""`，`tab` 随二级 Tab 变化
- [ ] `daily-01-overview`：首屏加载成功，KPI/用户指标/ROI/留存渲染正常
- [ ] `daily-02-ad-platform`：广告平台卡片与筛选联动正确
- [ ] `daily-03-by-country`：国家列表 + othersRow 正常
- [ ] `daily-04-platform-country`：树形/平铺结构均可渲染
- [ ] `daily-05-campaigns`：状态、国家、广告平台筛选正确
- [ ] `daily-06-compare-overview`：对比卡片可随应用选择刷新
- [ ] `daily-07-compare-trends`：近7天趋势曲线与图例一致
- [ ] `daily-08-compare-metrics`：指标矩阵 bestId 标记正确

## 周报联调

- [ ] `weekly-00-app-list`：同日报侧栏契约（周 `startDate`/`endDate` 为周一至周日）
- [ ] `weekly-01-overview`：周区间请求体与返回匹配
- [ ] `weekly-02-ad-platform`：周环比口径正确
- [ ] `weekly-03-by-country`：周聚合国家数据正确
- [ ] `weekly-04-platform-country`：周聚合树形节点完整
- [ ] `weekly-05-campaigns`：周维度系列数据正确
- [ ] `weekly-06-compare-overview`：周对比卡片可用
- [ ] `weekly-07-compare-trends`：近8周趋势标签与数据长度一致
- [ ] `weekly-08-compare-metrics`：周对比指标矩阵可用

## 月报联调

- [ ] `monthly-00-app-list`：同日报侧栏契约（自然月 `startDate`/`endDate`）
- [ ] `monthly-01-overview`：月汇总含 `feeDeductions` 且结构正确
- [ ] `monthly-02-ad-platform`：月聚合平台数据正确
- [ ] `monthly-03-by-country`：月聚合国家数据正确
- [ ] `monthly-04-platform-country`：月聚合树形节点完整
- [ ] `monthly-05-campaigns`：月维度系列数据正确
- [ ] `monthly-06-compare-overview`：月对比卡片可用
- [ ] `monthly-07-compare-trends`：近6月趋势标签与数据长度一致
- [ ] `monthly-08-compare-metrics`：月对比指标矩阵可用

## 公共验收项

- [ ] 所有报告接口均为 `POST + JSON body`（飞书 `push-config` 的 GET 除外）
- [ ] 请求体包含 `startDate` / `endDate`，无旧 `date` 字段
- [ ] 顶栏多选以 **`appIds` / `platformList` / `sourceList` / `countryCodeList`** 四数组提交；**空数组 `[]` 表示该维度不限**（不再使用单笔 `platform`/`source`/`countryCode` 字符串）
- [ ] 详情类：`appId` 为 `string`，整体传 `""`；**`app-list` 的 `appId` 固定 `""`**
- [ ] `account` 不限时传 `""`
- [ ] 对比模式额外包含 `compareAppIds` / `compareEnabled` / `compareStartDate` / `compareEndDate`，且仍带上述四组顶栏数组（含顶栏 `appIds`）
- [ ] 周期仅在 URL 路径（`daily|weekly|monthly`），请求体 **不含** `period` 字段
- [ ] 页面切换日报/周报/月报不再访问旧 `/report/summary` 等旧 URL
- [ ] `config/data-source.ts` 可按枚举 **逐接口** 切换 Mock / 远程
- [ ] 联调核对详见上级 `docs/后端联调核对清单.md`

## 上线前核对

- [ ] 三周期主链路联调通过
- [ ] 对比模式三周期联调通过
- [ ] 线上灰度观察窗口无 P0/P1 异常（建议 >= 3 个工作日）

（旧版 `01~05` 契约与前端兼容逻辑已不在本仓库维护。）
