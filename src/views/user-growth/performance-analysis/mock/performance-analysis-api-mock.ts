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

const CANDIDATE_POOL: CompareCandidateItem[] = [
  {
    id: 'zhao6',
    name: '赵六',
    level: '高级优化师',
    status: '超标',
    statusClass: 'over',
    score: 96
  },
  {
    id: 'zhang3',
    name: '张三',
    level: '高级优化师',
    status: '达标',
    statusClass: 'pass',
    score: 94
  },
  { id: 'liu7', name: '刘七', level: '优化师', status: '达标', statusClass: 'pass', score: 90 },
  { id: 'li4', name: '李四', level: '优化师', status: '达标', statusClass: 'pass', score: 88 },
  { id: 'chen8', name: '陈八', level: '优化师', status: '达标', statusClass: 'pass', score: 83 },
  { id: 'zhou9', name: '周九', level: '优化师', status: '达标', statusClass: 'pass', score: 80 },
  {
    id: 'wu10',
    name: '吴十',
    level: '初级优化师',
    status: '接近达标',
    statusClass: 'near',
    score: 78
  },
  { id: 'wang5', name: '王五', level: '优化师', status: '未达标', statusClass: 'fail', score: 72 }
]

export async function mockFetchPerformanceCompareCandidates(
  body: CompareCandidatesRequest
): Promise<{
  list: CompareCandidateItem[]
  total: number
}> {
  void body.startDate
  void body.endDate
  void body.appFilter
  const current = body.current ?? 1
  const size = body.size ?? 20

  const statusText = body.statusFilter ?? ''
  const keyword = (body.keyword ?? '').trim()

  let list = CANDIDATE_POOL.filter((item) => !body.excludeIds.includes(item.id))
  if (body.personFilter && body.personFilter !== '全部') {
    list = list.filter((item) => item.name === body.personFilter || item.id === body.personFilter)
  }
  if (statusText === '达标') {
    list = list.filter((item) => item.statusClass === 'pass' || item.statusClass === 'over')
  } else if (statusText === '未达标') {
    list = list.filter((item) => item.statusClass === 'fail' || item.statusClass === 'near')
  }
  if (keyword) {
    list = list.filter((item) => item.name.includes(keyword))
  }

  list = [...list].sort((a, b) => b.score - a.score)
  const start = (current - 1) * size
  return Promise.resolve({
    list: list.slice(start, start + size),
    total: list.length
  })
}
