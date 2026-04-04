/** 与 `mock/backend-api/02-performance-list.json` 中 PerformanceRow 对齐的 Mock 行 */
export interface PerformanceListRow {
  id: string
  surname: string
  name: string
  avatarBg: string
  level: string
  levelClass: string
  adSpend: number
  budget: number
  roi1: number
  roi3: number
  roi7: number
  agentCost: number
  minCost: number
  estProfit: number
  minProfit: number
  score: number
  status: string
  statusClass: string
  reportDate: string
}

export interface PerformanceListTotals {
  adSpend: number
  budget: number
  roi1: number
  roi3: number
  roi7: number
  agentCost: number
  estProfit: number
  minProfit: number
  score: number
}

export interface PerformanceListRequest {
  startDate: string
  endDate: string
  personFilter?: string
  appFilter?: string
  statusFilter?: string
  keyword?: string
  sortField?: string
  sortAsc?: boolean
  current: number
  size: number
}

export interface PerformanceOverviewRequest {
  startDate: string
  endDate: string
  personFilter?: string
  appFilter?: string
  statusFilter?: string
  keyword?: string
}

interface CompareCandidateItem {
  id: string
  name: string
  level: string
  status: string
  statusClass: string
  score: number
}

interface CompareCandidatesRequest {
  startDate: string
  endDate: string
  personFilter?: string
  appFilter?: string
  statusFilter?: string
  keyword?: string
  excludeIds: string[]
  current?: number
  size?: number
}

const STAFF_ROWS: PerformanceListRow[] = [
  {
    id: 'zhao6',
    surname: '赵',
    name: '赵六',
    avatarBg: '#f97316',
    level: '高级优化师',
    levelClass: 'senior',
    adSpend: 52100,
    budget: 50800,
    roi1: 96,
    roi3: 94,
    roi7: 95,
    agentCost: 2400,
    minCost: 48000,
    estProfit: 15600,
    minProfit: 9800,
    score: 96,
    status: '超标',
    statusClass: 'over',
    reportDate: '2026-04-02'
  },
  {
    id: 'zhang3',
    surname: '张',
    name: '张三',
    avatarBg: '#06b6d4',
    level: '高级优化师',
    levelClass: 'senior',
    adSpend: 49279,
    budget: 49840,
    roi1: 93,
    roi3: 91,
    roi7: 92,
    agentCost: 1866,
    minCost: 45000,
    estProfit: 12400,
    minProfit: 8200,
    score: 94,
    status: '达标',
    statusClass: 'pass',
    reportDate: '2026-04-01'
  },
  {
    id: 'liu7',
    surname: '刘',
    name: '刘七',
    avatarBg: '#3b82f6',
    level: '优化师',
    levelClass: 'mid',
    adSpend: 33500,
    budget: 31200,
    roi1: 91,
    roi3: 89,
    roi7: 90,
    agentCost: 0,
    minCost: 30000,
    estProfit: 8900,
    minProfit: 5100,
    score: 90,
    status: '达标',
    statusClass: 'pass',
    reportDate: '2026-03-31'
  },
  {
    id: 'li4',
    surname: '李',
    name: '李四',
    avatarBg: '#6366f1',
    level: '优化师',
    levelClass: 'mid',
    adSpend: 37838,
    budget: 27159,
    roi1: 88,
    roi3: 86,
    roi7: 87,
    agentCost: 38,
    minCost: 25000,
    estProfit: 6800,
    minProfit: 3200,
    score: 88,
    status: '达标',
    statusClass: 'pass',
    reportDate: '2026-03-30'
  },
  {
    id: 'chen8',
    surname: '陈',
    name: '陈八',
    avatarBg: '#8b5cf6',
    level: '优化师',
    levelClass: 'mid',
    adSpend: 29600,
    budget: 28400,
    roi1: 85,
    roi3: 83,
    roi7: 84,
    agentCost: 120,
    minCost: 27000,
    estProfit: 3200,
    minProfit: 1800,
    score: 83,
    status: '达标',
    statusClass: 'pass',
    reportDate: '2026-03-29'
  },
  {
    id: 'zhou9',
    surname: '周',
    name: '周九',
    avatarBg: '#0ea5e9',
    level: '优化师',
    levelClass: 'mid',
    adSpend: 24100,
    budget: 22800,
    roi1: 82,
    roi3: 80,
    roi7: 81,
    agentCost: 200,
    minCost: 21000,
    estProfit: 1600,
    minProfit: 800,
    score: 80,
    status: '达标',
    statusClass: 'pass',
    reportDate: '2026-03-28'
  },
  {
    id: 'wu10',
    surname: '吴',
    name: '吴十',
    avatarBg: '#64748b',
    level: '初级优化师',
    levelClass: 'junior',
    adSpend: 18200,
    budget: 16900,
    roi1: 84,
    roi3: 82,
    roi7: 83,
    agentCost: 0,
    minCost: 15000,
    estProfit: 900,
    minProfit: 200,
    score: 78,
    status: '接近达标',
    statusClass: 'near',
    reportDate: '2026-03-27'
  },
  {
    id: 'wang5',
    surname: '王',
    name: '王五',
    avatarBg: '#a855f7',
    level: '优化师',
    levelClass: 'mid',
    adSpend: 28450,
    budget: 26100,
    roi1: 79,
    roi3: 77,
    roi7: 78,
    agentCost: 420,
    minCost: 24000,
    estProfit: -1200,
    minProfit: -3800,
    score: 72,
    status: '未达标',
    statusClass: 'fail',
    reportDate: '2026-03-26'
  }
]

function filterStaffByListParams(
  rows: PerformanceListRow[],
  body: Pick<
    PerformanceListRequest,
    'startDate' | 'endDate' | 'personFilter' | 'statusFilter' | 'keyword'
  >
): PerformanceListRow[] {
  const { startDate, endDate, personFilter, statusFilter, keyword } = body
  let list = rows.filter((r) => r.reportDate >= startDate && r.reportDate <= endDate)

  const pf = personFilter ?? ''
  if (pf) {
    list = list.filter((r) => r.name === pf || r.id === pf)
  }

  const sf = statusFilter ?? ''
  if (sf === '达标') {
    list = list.filter((r) => r.statusClass === 'pass' || r.statusClass === 'over')
  } else if (sf === '未达标') {
    list = list.filter((r) => r.statusClass === 'fail' || r.statusClass === 'near')
  }

  const kw = (keyword ?? '').trim()
  if (kw) {
    list = list.filter((r) => r.name.includes(kw))
  }

  return list
}

function buildTotals(rows: PerformanceListRow[]): PerformanceListTotals {
  if (rows.length === 0) {
    return {
      adSpend: 0,
      budget: 0,
      roi1: 0,
      roi3: 0,
      roi7: 0,
      agentCost: 0,
      estProfit: 0,
      minProfit: 0,
      score: 0
    }
  }
  const n = rows.length
  const sum = (pick: (r: PerformanceListRow) => number) => rows.reduce((s, r) => s + pick(r), 0)
  return {
    adSpend: sum((r) => r.adSpend),
    budget: sum((r) => r.budget),
    roi1: Math.round(sum((r) => r.roi1) / n),
    roi3: Math.round(sum((r) => r.roi3) / n),
    roi7: Math.round(sum((r) => r.roi7) / n),
    agentCost: sum((r) => r.agentCost),
    estProfit: sum((r) => r.estProfit),
    minProfit: sum((r) => r.minProfit),
    score: Math.round(sum((r) => r.score) / n)
  }
}

export async function mockFetchPerformanceListFilterOptions(_body: {
  startDate: string
  endDate: string
}): Promise<{
  personOptions: { label: string; value: string }[]
  appCategoryOptions: { label: string; value: string }[]
  statusOptions: { label: string; value: string }[]
}> {
  void _body
  return Promise.resolve({
    personOptions: [
      { label: '全部', value: '' },
      { label: '张三', value: 'zhang3' },
      { label: '李四', value: 'li4' },
      { label: '王五', value: 'wang5' },
      { label: '赵六', value: 'zhao6' },
      { label: '刘七', value: 'liu7' },
      { label: '陈八', value: 'chen8' },
      { label: '周九', value: 'zhou9' },
      { label: '吴十', value: 'wu10' }
    ],
    appCategoryOptions: [
      { label: '全部', value: '' },
      { label: '天气类', value: '天气类' },
      { label: '健康类', value: '健康类' },
      { label: '工具类', value: '工具类' }
    ],
    statusOptions: [
      { label: '全部', value: '' },
      { label: '达标', value: '达标' },
      { label: '未达标', value: '未达标' }
    ]
  })
}

export async function mockFetchPerformanceList(body: PerformanceListRequest): Promise<{
  list: PerformanceListRow[]
  total: number
  totals: PerformanceListTotals
}> {
  void body.appFilter
  let list = filterStaffByListParams(STAFF_ROWS, body)
  const totals = buildTotals(list)

  if (body.sortField === 'adSpend') {
    const asc = body.sortAsc ?? true
    list = [...list].sort((a, b) => (asc ? a.adSpend - b.adSpend : b.adSpend - a.adSpend))
  }

  const current = body.current ?? 1
  const size = body.size ?? 20
  const start = (current - 1) * size
  return Promise.resolve({
    list: list.slice(start, start + size),
    total: list.length,
    totals
  })
}

export async function mockFetchPerformanceOverviewMetrics(
  body: PerformanceOverviewRequest
): Promise<{
  adSpend: number
  adSpendWeekOverWeekText?: string
  avgRoi1: number
  roiStatusLabel: string
  estProfit: number
  estProfitWeekOverWeekText?: string
  failCount: number
  failNames: string[]
}> {
  void body.appFilter
  const list = filterStaffByListParams(STAFF_ROWS, body)
  const n = list.length
  const adSpend = list.reduce((s, r) => s + r.adSpend, 0)
  const estProfit = list.reduce((s, r) => s + r.estProfit, 0)
  const avgRoi1 = n > 0 ? list.reduce((s, r) => s + r.roi1, 0) / n : 0
  const failRows = list.filter((r) => r.statusClass === 'fail' || r.statusClass === 'near')
  return Promise.resolve({
    adSpend,
    adSpendWeekOverWeekText: '+8%',
    avgRoi1: Math.round(avgRoi1 * 100) / 100,
    roiStatusLabel: avgRoi1 >= 85 ? '达标' : '未达标',
    estProfit,
    estProfitWeekOverWeekText: '+12%',
    failCount: failRows.length,
    failNames: failRows.map((r) => r.name)
  })
}

function latestRowPerStaffId(rows: PerformanceListRow[]): PerformanceListRow[] {
  const m = new Map<string, PerformanceListRow>()
  for (const r of rows) {
    const prev = m.get(r.id)
    if (!prev || r.reportDate > prev.reportDate) m.set(r.id, r)
  }
  return [...m.values()]
}

function normalizePersonFilterForList(raw?: string): string {
  if (!raw || raw === '全部') return ''
  return raw
}

export async function mockFetchPerformanceCompareCandidates(
  body: CompareCandidatesRequest
): Promise<{
  list: CompareCandidateItem[]
  total: number
}> {
  void body.appFilter
  const current = body.current ?? 1
  const size = body.size ?? 20

  const filtered = filterStaffByListParams(STAFF_ROWS, {
    startDate: body.startDate,
    endDate: body.endDate,
    personFilter: normalizePersonFilterForList(body.personFilter),
    statusFilter: body.statusFilter ?? '',
    keyword: body.keyword ?? ''
  })
  const latest = latestRowPerStaffId(filtered)

  let list: CompareCandidateItem[] = latest
    .filter((r) => !body.excludeIds.includes(r.id))
    .map((r) => ({
      id: r.id,
      name: r.name,
      level: r.level,
      status: r.status,
      statusClass: r.statusClass,
      score: r.score
    }))

  list = [...list].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  const start = (current - 1) * size
  return Promise.resolve({
    list: list.slice(start, start + size),
    total: list.length
  })
}

// ─── 对比页（PerformanceComparison）────────────────────────────

const STAFF_BY_ID: Record<string, PerformanceListRow> = Object.fromEntries(
  STAFF_ROWS.map((r) => [r.id, r])
)

const ROI_TREND_SERIES: Record<string, number[]> = {
  zhao6: [98, 99, 97, 95, 94, 98, 98],
  zhang3: [93, 96, 97, 95, 90, 94, 98],
  li4: [90, 91, 89, 90, 81, 93, 93],
  wang5: [85, 79, 81, 76, 80, 81, 82],
  liu7: [90, 91, 90, 88, 89, 91, 90],
  chen8: [84, 85, 83, 82, 83, 85, 84],
  zhou9: [81, 82, 80, 79, 80, 81, 81],
  wu10: [83, 84, 82, 81, 82, 83, 83]
}

const AD_TREND_SERIES: Record<string, number[]> = {
  zhao6: [6800, 7200, 7600, 7100, 7400, 7800, 8100],
  zhang3: [6400, 6900, 7100, 6800, 7000, 7200, 7500],
  li4: [3800, 4100, 3900, 4200, 4000, 4400, 4500],
  wang5: [3500, 3800, 3600, 3900, 4000, 3700, 4200],
  liu7: [4200, 4600, 4400, 4800, 4600, 5000, 4900],
  chen8: [3900, 4100, 3800, 4000, 4200, 4100, 4300],
  zhou9: [3000, 3200, 3100, 3300, 3200, 3400, 3500],
  wu10: [2300, 2500, 2400, 2600, 2400, 2700, 2600]
}

const RADAR_SERIES_VALUES: Record<string, number[]> = {
  zhao6: [28, 30, 20, 18, 96],
  zhang3: [25, 30, 20, 19, 94],
  li4: [22, 28, 20, 18, 88],
  wang5: [15, 18, 16, 23, 72],
  liu7: [24, 28, 19, 17, 90],
  chen8: [21, 26, 18, 16, 83],
  zhou9: [18, 24, 16, 14, 80],
  wu10: [16, 22, 18, 13, 78]
}

const STAFF_COLOR: Record<string, string> = {
  zhao6: '#f59e0b',
  zhang3: '#22d3ee',
  li4: '#60a5fa',
  wang5: '#a78bfa',
  liu7: '#34d399',
  chen8: '#fb7185',
  zhou9: '#e879f9',
  wu10: '#94a3b8'
}

const SCORE_BREAKDOWN: Record<
  string,
  { spend: number; roi: number; cpi: number; profit: number; total: number }
> = {
  zhao6: { spend: 28, roi: 30, cpi: 20, profit: 18, total: 96 },
  zhang3: { spend: 25, roi: 30, cpi: 20, profit: 19, total: 94 },
  li4: { spend: 22, roi: 28, cpi: 20, profit: 18, total: 88 },
  wang5: { spend: 15, roi: 18, cpi: 16, profit: 23, total: 72 },
  liu7: { spend: 23, roi: 29, cpi: 20, profit: 18, total: 90 },
  chen8: { spend: 21, roi: 26, cpi: 19, profit: 17, total: 83 },
  zhou9: { spend: 20, roi: 25, cpi: 18, profit: 17, total: 80 },
  wu10: { spend: 19, roi: 24, cpi: 18, profit: 17, total: 78 }
}

export interface ComparisonStaffRequest {
  startDate: string
  endDate: string
  staffIds: string[]
}

function enumerateDatesYmd(startDate: string, endDate: string, maxLen = 14): string[] {
  const out: string[] = []
  const cur = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)
  while (cur <= end && out.length < maxLen) {
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const d = String(cur.getDate()).padStart(2, '0')
    out.push(`${y}-${m}-${d}`)
    cur.setDate(cur.getDate() + 1)
  }
  if (out.length === 0) out.push(startDate)
  return out
}

function expandSeries(base: number[] | undefined, len: number): number[] {
  const b = base?.length ? base : [0]
  return Array.from({ length: len }, (_, i) => b[i % b.length])
}

function fmtUsdInt(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

export async function mockFetchPerformanceComparisonOverview(
  body: ComparisonStaffRequest
): Promise<{
  totalAd: number
  totalAdWeekOverWeekText?: string
  avgRoi: number
  roiPassLabel?: string
  totalProfit: number
  totalProfitWeekOverWeekText?: string
  failCount: number
  failName: string
}> {
  void body.startDate
  void body.endDate
  const rows = body.staffIds.map((id) => STAFF_BY_ID[id]).filter(Boolean)
  const n = rows.length
  const totalAd = rows.reduce((s, r) => s + r.adSpend, 0)
  const totalProfit = rows.reduce((s, r) => s + r.estProfit, 0)
  const avgRoi = n > 0 ? rows.reduce((s, r) => s + r.roi1, 0) / n : 0
  const failRows = rows.filter((r) => r.statusClass === 'fail')
  return Promise.resolve({
    totalAd,
    totalAdWeekOverWeekText: '+8%',
    avgRoi: Math.round(avgRoi * 100) / 100,
    roiPassLabel: avgRoi >= 85 ? '达标' : '未达标',
    totalProfit,
    totalProfitWeekOverWeekText: '+12%',
    failCount: failRows.length,
    failName: failRows.map((r) => r.name).join('、')
  })
}

export async function mockFetchPerformanceComparisonCharts(body: ComparisonStaffRequest): Promise<{
  dates: string[]
  roiTrend: { id: string; name: string; values: number[] }[]
  adSpendTrend: { id: string; name: string; values: number[] }[]
  radarIndicators: { name: string; max: number }[]
  radarSeries: { id: string; name: string; values: number[] }[]
  profitBars: { id: string; name: string; value: number }[]
  roiRefLines?: { name: string; value: number }[]
}> {
  const dates = enumerateDatesYmd(body.startDate, body.endDate)
  const L = dates.length

  const radarIndicators = [
    { name: '花费达成', max: 30 },
    { name: '首日ROI', max: 30 },
    { name: 'CPI控制', max: 20 },
    { name: '利润达成', max: 25 },
    { name: '绩效得分', max: 100 }
  ]

  const roiTrend = body.staffIds.map((id) => {
    const r = STAFF_BY_ID[id]
    return {
      id,
      name: r?.name ?? id,
      values: expandSeries(ROI_TREND_SERIES[id], L)
    }
  })

  const adSpendTrend = body.staffIds.map((id) => {
    const r = STAFF_BY_ID[id]
    return {
      id,
      name: r?.name ?? id,
      values: expandSeries(AD_TREND_SERIES[id], L)
    }
  })

  const radarSeries = body.staffIds.map((id) => {
    const r = STAFF_BY_ID[id]
    return {
      id,
      name: r?.name ?? id,
      values: RADAR_SERIES_VALUES[id] ?? [0, 0, 0, 0, 0]
    }
  })

  const profitBars = body.staffIds.map((id) => {
    const r = STAFF_BY_ID[id]
    return { id, name: r?.name ?? id, value: r?.estProfit ?? 0 }
  })

  return Promise.resolve({
    dates,
    roiTrend,
    adSpendTrend,
    radarIndicators,
    radarSeries,
    profitBars,
    roiRefLines: [
      { name: '达标线', value: 85 },
      { name: '最低要求', value: 80 }
    ]
  })
}

export async function mockFetchPerformanceComparisonRankings(
  body: ComparisonStaffRequest
): Promise<{
  rows: { metric: string; r1: string; r2: string; r3: string }[]
}> {
  void body.startDate
  void body.endDate
  const pool = body.staffIds.map((id) => STAFF_BY_ID[id]).filter(Boolean)
  const bySpend = [...pool].sort((a, b) => b.adSpend - a.adSpend)
  const byRoi = [...pool].sort((a, b) => b.roi1 - a.roi1)
  const byProfit = [...pool].sort((a, b) => b.estProfit - a.estProfit)
  const byMinProfit = [...pool].sort((a, b) => b.minProfit - a.minProfit)
  const byScore = [...pool].sort((a, b) => b.score - a.score)

  const top3 = (sorted: PerformanceListRow[], fmt: (r: PerformanceListRow) => string) => {
    const a = sorted[0]
    const b = sorted[1]
    const c = sorted[2]
    return {
      r1: a ? `${a.name} ${fmt(a)}` : '—',
      r2: b ? `${b.name} ${fmt(b)}` : '—',
      r3: c ? `${c.name} ${fmt(c)}` : '—'
    }
  }

  const spend3 = top3(bySpend, (r) => fmtUsdInt(r.adSpend))
  const roi3 = top3(byRoi, (r) => `${r.roi1}%`)
  const profit3 = top3(byProfit, (r) =>
    r.estProfit >= 0 ? `+${fmtUsdInt(r.estProfit)}` : `-${fmtUsdInt(Math.abs(r.estProfit))}`
  )
  const minP3 = top3(byMinProfit, (r) =>
    r.minProfit >= 0 ? `+${fmtUsdInt(r.minProfit)}` : `-${fmtUsdInt(Math.abs(r.minProfit))}`
  )
  const score3 = top3(byScore, (r) => `${r.score}分`)

  return Promise.resolve({
    rows: [
      { metric: '广告支出', ...spend3 },
      { metric: '首日ROI', ...roi3 },
      { metric: '预估利润', ...profit3 },
      { metric: '最低利润', ...minP3 },
      { metric: '绩效得分', ...score3 }
    ]
  })
}

export async function mockFetchPerformanceComparisonScoreDetail(
  body: ComparisonStaffRequest
): Promise<{
  list: {
    id: string
    name: string
    color: string
    spend: number
    roi: number
    cpi: number
    profit: number
    total: number
    status: string
    statusClass: string
  }[]
}> {
  void body.startDate
  void body.endDate
  const list = body.staffIds.map((id) => {
    const r = STAFF_BY_ID[id]
    const br = SCORE_BREAKDOWN[id] ?? {
      spend: 20,
      roi: 25,
      cpi: 18,
      profit: 17,
      total: r?.score ?? 80
    }
    return {
      id,
      name: r?.name ?? id,
      color: STAFF_COLOR[id] ?? '#e2e8f0',
      spend: br.spend,
      roi: br.roi,
      cpi: br.cpi,
      profit: br.profit,
      total: br.total,
      status: r?.status ?? '',
      statusClass: r?.statusClass ?? 'pass'
    }
  })
  return Promise.resolve({ list })
}

export async function mockFetchPerformanceComparisonAlerts(body: ComparisonStaffRequest): Promise<{
  list: { id: string; level: 'warn' | 'error'; text: string }[]
}> {
  void body.startDate
  void body.endDate
  const list: { id: string; level: 'warn' | 'error'; text: string }[] = []
  if (body.staffIds.includes('wang5')) {
    list.push({
      id: 'pa-alert-001',
      level: 'warn',
      text: '王五 连续7日首日ROI低于80%达标线，建议尽快安排复盘会议'
    })
    list.push({
      id: 'pa-alert-002',
      level: 'error',
      text: '王五 预估利润连续为负，建议调整投放策略'
    })
  }
  if (body.staffIds.includes('wu10')) {
    list.push({
      id: 'pa-alert-003',
      level: 'warn',
      text: '吴十 花费达成率低于团队均值 12%，请关注账户结构'
    })
  }
  return Promise.resolve({ list })
}
