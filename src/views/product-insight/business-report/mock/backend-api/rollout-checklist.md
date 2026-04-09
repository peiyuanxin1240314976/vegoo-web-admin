# 报告管理 - 灰度收口联调清单

## 说明

- 本清单用于第二阶段灰度收口：确认新契约三周期链路稳定后，下线旧 `01~05`。
- 验收优先级：`P0 -> P1 -> P2`。
- 每项建议记录：请求体、响应体、页面截图、异常日志（如有）。

## 日报联调

- [ ] `daily-01-overview`：首屏加载成功，KPI/用户指标/ROI/留存渲染正常
- [ ] `daily-02-ad-platform`：广告平台卡片与筛选联动正确
- [ ] `daily-03-by-country`：国家列表 + othersRow 正常
- [ ] `daily-04-platform-country`：树形/平铺结构均可渲染
- [ ] `daily-05-campaigns`：状态、国家、广告平台筛选正确
- [ ] `daily-06-compare-overview`：对比卡片可随应用选择刷新
- [ ] `daily-07-compare-trends`：近7天趋势曲线与图例一致
- [ ] `daily-08-compare-metrics`：指标矩阵 bestId 标记正确

## 周报联调

- [ ] `weekly-01-overview`：周区间请求体与返回匹配
- [ ] `weekly-02-ad-platform`：周环比口径正确
- [ ] `weekly-03-by-country`：周聚合国家数据正确
- [ ] `weekly-04-platform-country`：周聚合树形节点完整
- [ ] `weekly-05-campaigns`：周维度系列数据正确
- [ ] `weekly-06-compare-overview`：周对比卡片可用
- [ ] `weekly-07-compare-trends`：近8周趋势标签与数据长度一致
- [ ] `weekly-08-compare-metrics`：周对比指标矩阵可用

## 月报联调

- [ ] `monthly-01-overview`：月汇总含 `feeDeductions` 且结构正确
- [ ] `monthly-02-ad-platform`：月聚合平台数据正确
- [ ] `monthly-03-by-country`：月聚合国家数据正确
- [ ] `monthly-04-platform-country`：月聚合树形节点完整
- [ ] `monthly-05-campaigns`：月维度系列数据正确
- [ ] `monthly-06-compare-overview`：月对比卡片可用
- [ ] `monthly-07-compare-trends`：近6月趋势标签与数据长度一致
- [ ] `monthly-08-compare-metrics`：月对比指标矩阵可用

## 公共验收项

- [ ] 所有报告接口均为 `POST + JSON body`
- [ ] 请求体包含 `startDate/endDate`，无旧 `date` 字段
- [ ] `appId/platform/source/countryCode/account` 空值统一传空字符串
- [ ] 对比模式请求体包含 `appIds/compareEnabled/compareStartDate/compareEndDate`
- [ ] 页面切换日报/周报/月报不再访问旧 `/report/summary` 等旧 URL
- [ ] `config/data-source.ts` 对应新 endpoint 开关可独立控制

## 下线门槛（旧 01~05）

- [ ] 三周期主链路联调通过率 100%
- [ ] 对比模式三周期联调通过率 100%
- [ ] 线上灰度观察窗口无 P0/P1 异常（建议 >= 3 个工作日）
- [ ] 通过后执行：删除旧 `01~05` 契约与旧 URL 兼容代码
