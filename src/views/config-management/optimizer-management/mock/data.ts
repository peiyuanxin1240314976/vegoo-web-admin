import type { OptimizerItem, SystemUser } from '../types'

// ─── 系统用户池（新建时下拉选择） ─────────────────────────────────
export const systemUsers: SystemUser[] = [
  { id: 'u001', userName: '张三', email: '张三@vegoo.com', avatarColor: '#2dd4bf' },
  { id: 'u002', userName: '李四', email: '李四@vegoo.com', avatarColor: '#60a5fa' },
  { id: 'u003', userName: '王五', email: '王五@vegoo.com', avatarColor: '#22c55e' },
  { id: 'u004', userName: '赵六', email: '赵六@vegoo.com', avatarColor: '#f59e0b' },
  { id: 'u005', userName: '吴七', email: '吴七@vegoo.com', avatarColor: '#a78bfa' },
  { id: 'u006', userName: '陈八', email: '陈八@vegoo.com', avatarColor: '#94a3b8' },
  { id: 'u007', userName: '郑九', email: '郑九@vegoo.com', avatarColor: '#f97316' },
  { id: 'u008', userName: '冯十', email: '冯十@vegoo.com', avatarColor: '#ec4899' },
  { id: 'u009', userName: '周十一', email: '周十一@vegoo.com', avatarColor: '#34d399' },
  { id: 'u010', userName: '孙十二', email: '孙十二@vegoo.com', avatarColor: '#818cf8' }
]

// ─── Mock 种子数据（12 条） ────────────────────────────────────────
const OPTIMIZER_MOCK_SEED: OptimizerItem[] = [
  {
    id: 'opt001',
    no: 1,
    userId: 'u001',
    userName: '张三',
    email: '张三@vegoo.com',
    avatarColor: '#2dd4bf',
    version: 1,
    sCode: 'FB-OPT-001',
    sCode2: 'FB-001',
    minConsumption: 800,
    checkCode: 'CHK-A8F2D3E1B5C7F9X9K2M4P6Q8R3S1T0U7V2W5Y8Z1',
    status: '在职',
    apps: ['Vegoo Keyboard', 'Vegoo VPN', 'Vegoo Notes', 'Vegoo Weather'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 14:30', content: '更新 Vegoo Keyboard 预算' },
      { id: 'l2', timeLabel: '今天 10:15', content: '创建新推广计划' },
      { id: 'l3', timeLabel: '昨天 17:00', content: '导出数据报表' },
      { id: 'l4', timeLabel: '昨天 09:30', content: '修改出价策略' }
    ],
    createTime: '2024-01-15',
    lastModifyTime: '2026-03-15 14:30'
  },
  {
    id: 'opt002',
    no: 2,
    userId: 'u002',
    userName: '李四',
    email: '李四@vegoo.com',
    avatarColor: '#60a5fa',
    version: 2,
    sCode: 'GG-OPT-002',
    sCode2: 'GG-002',
    minConsumption: 1200,
    checkCode: 'CHK-B3E7F1A2D9C4K4M8N2P5Q0R6S3T9U1V4W8X2Y5Z7',
    status: '在职',
    apps: ['Vegoo Camera', 'Vegoo Music'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 09:00', content: '调整 Vegoo Camera 投放策略' },
      { id: 'l2', timeLabel: '昨天 16:45', content: '更新广告素材' },
      { id: 'l3', timeLabel: '昨天 11:20', content: '导出周报数据' }
    ],
    createTime: '2024-01-20',
    lastModifyTime: '2026-03-14 09:00'
  },
  {
    id: 'opt003',
    no: 3,
    userId: 'u003',
    userName: '王五',
    email: '王五@vegoo.com',
    avatarColor: '#22c55e',
    version: 1,
    sCode: 'TK-OPT-003',
    sCode2: 'TK-003',
    minConsumption: 600,
    checkCode: 'CHK-C5D1F8A3B6E2G9H4I7J1K5L2M7N3O9P4Q8R2S6M7',
    status: '在职',
    apps: ['Vegoo Travel', 'Vegoo Map'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 11:00', content: '新建 TikTok 广告组' },
      { id: 'l2', timeLabel: '昨天 15:30', content: '修改预算上限' }
    ],
    createTime: '2024-02-01',
    lastModifyTime: '2026-03-13 11:00'
  },
  {
    id: 'opt004',
    no: 4,
    userId: 'u004',
    userName: '赵六',
    email: '赵六@vegoo.com',
    avatarColor: '#f59e0b',
    version: 2,
    sCode: 'FB-OPT-004',
    sCode2: 'FB-004',
    minConsumption: 950,
    checkCode: 'CHK-D2F8G5H1I4J7K3L6M9N2O5P8Q1R4S7T0U3V6P2',
    status: '在职',
    apps: ['Vegoo Shopping', 'Vegoo Finance'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 08:30', content: '审核广告素材' },
      { id: 'l2', timeLabel: '昨天 17:20', content: '优化受众定向' },
      { id: 'l3', timeLabel: '2天前 14:00', content: '创建新广告系列' }
    ],
    createTime: '2024-02-10',
    lastModifyTime: '2026-03-15 08:30'
  },
  {
    id: 'opt005',
    no: 5,
    userId: 'u005',
    userName: '吴七',
    email: '吴七@vegoo.com',
    avatarColor: '#a78bfa',
    version: 1,
    sCode: 'GG-OPT-005',
    minConsumption: 750,
    checkCode: 'CHK-E9A3B6C2D5F8G1H4I7J0K3L6M9N2O5P8Q6',
    status: '在职',
    apps: ['Vegoo Health'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 13:00', content: '更新 Google 出价' },
      { id: 'l2', timeLabel: '昨天 10:00', content: '导出广告报告' }
    ],
    createTime: '2024-02-15',
    lastModifyTime: '2026-03-12 13:00'
  },
  {
    id: 'opt006',
    no: 6,
    userId: 'u006',
    userName: '陈八',
    email: '陈八@vegoo.com',
    avatarColor: '#94a3b8',
    version: 1,
    sCode: 'TK-OPT-006',
    sCode2: 'TK-006',
    minConsumption: 500,
    checkCode: 'CHK-F1B4C7D0E3F6G9H2I5J8K1L4M7N0O3P6R3',
    status: '离职',
    apps: [],
    recentLogs: [{ id: 'l1', timeLabel: '2026-01-10 09:00', content: '最后一次登录' }],
    createTime: '2024-03-01',
    lastModifyTime: '2026-01-10 09:00'
  },
  {
    id: 'opt007',
    no: 7,
    userId: 'u007',
    userName: '郑九',
    email: '郑九@vegoo.com',
    avatarColor: '#f97316',
    version: 3,
    sCode: 'FB-OPT-007',
    sCode2: 'FB-007',
    minConsumption: 1100,
    checkCode: 'CHK-G4H8I2J6K0L4M8N2O6P0Q4R8S2T6U0V4O7',
    status: '在职',
    apps: ['Vegoo Reader', 'Vegoo Cloud'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 15:00', content: '创建再营销受众' },
      { id: 'l2', timeLabel: '今天 09:30', content: '调整广告预算' }
    ],
    createTime: '2024-03-10',
    lastModifyTime: '2026-03-15 15:00'
  },
  {
    id: 'opt008',
    no: 8,
    userId: 'u008',
    userName: '冯十',
    email: '冯十@vegoo.com',
    avatarColor: '#ec4899',
    version: 1,
    sCode: 'GG-OPT-008',
    sCode2: 'GG-008',
    minConsumption: 680,
    checkCode: 'CHK-H7I1J5K9L3M7N1O5P9Q3R7S1T5U9V3P8',
    status: '在职',
    apps: ['Vegoo Notes', 'Vegoo Calendar'],
    recentLogs: [
      { id: 'l1', timeLabel: '昨天 14:00', content: '优化关键词出价' },
      { id: 'l2', timeLabel: '昨天 10:30', content: '新增广告计划' }
    ],
    createTime: '2024-03-15',
    lastModifyTime: '2026-03-14 14:00'
  },
  {
    id: 'opt009',
    no: 9,
    userId: 'u009',
    userName: '周十一',
    email: '周十一@vegoo.com',
    avatarColor: '#34d399',
    version: 2,
    sCode: 'TK-OPT-009',
    minConsumption: 900,
    checkCode: 'CHK-I3J7K1L5M9N3O7P1Q5R9S3T7U1V5Q9',
    status: '在职',
    apps: ['Vegoo Fitness'],
    recentLogs: [{ id: 'l1', timeLabel: '今天 10:00', content: '更新创意素材' }],
    createTime: '2024-04-01',
    lastModifyTime: '2026-03-15 10:00'
  },
  {
    id: 'opt010',
    no: 10,
    userId: 'u010',
    userName: '孙十二',
    email: '孙十二@vegoo.com',
    avatarColor: '#818cf8',
    version: 1,
    sCode: 'FB-OPT-010',
    sCode2: 'FB-010',
    minConsumption: 1050,
    checkCode: 'CHK-J6K0L4M8N2O6P0Q4R8S2T6U0V4R0',
    status: '在职',
    apps: ['Vegoo Security'],
    recentLogs: [
      { id: 'l1', timeLabel: '今天 08:00', content: '检查广告账户余额' },
      { id: 'l2', timeLabel: '昨天 18:00', content: '提交广告审核' }
    ],
    createTime: '2024-04-10',
    lastModifyTime: '2026-03-15 08:00'
  },
  {
    id: 'opt011',
    no: 11,
    userId: 'u007',
    userName: '郑九',
    email: '郑九@vegoo.com',
    avatarColor: '#f97316',
    version: 2,
    sCode: 'GG-OPT-011',
    minConsumption: 720,
    checkCode: 'CHK-K2L6M0N4O8P2Q6R0S4T8U2V6S1',
    status: '在职',
    apps: ['Vegoo Browser'],
    recentLogs: [{ id: 'l1', timeLabel: '昨天 11:30', content: '分析竞品投放策略' }],
    createTime: '2024-05-01',
    lastModifyTime: '2026-03-14 11:30'
  },
  {
    id: 'opt012',
    no: 12,
    userId: 'u008',
    userName: '冯十',
    email: '冯十@vegoo.com',
    avatarColor: '#ec4899',
    version: 3,
    sCode: 'TK-OPT-012',
    sCode2: 'TK-012',
    minConsumption: 830,
    checkCode: 'CHK-L5M9N3O7P1Q5R9S3T7U1V5T2',
    status: '在职',
    apps: ['Vegoo Social'],
    recentLogs: [{ id: 'l1', timeLabel: '今天 16:00', content: '新增 TikTok 账户' }],
    createTime: '2024-05-15',
    lastModifyTime: '2026-03-15 16:00'
  }
]

export const optimizerMockList: OptimizerItem[] = OPTIMIZER_MOCK_SEED

export function cloneOptimizerMockList(): OptimizerItem[] {
  return JSON.parse(JSON.stringify(OPTIMIZER_MOCK_SEED)) as OptimizerItem[]
}
