import { getAppNow } from '@/utils/app-now'

/** 与 `mock/backend-api/01-user-list.json` sample 结构一致，供列表 Mock 克隆 */
export function buildSystemUserMockSeed(): Api.SystemManage.UserListItem[] {
  const y = getAppNow().getFullYear()
  const base = (i: number): Api.SystemManage.UserListItem => ({
    id: i,
    avatar: '',
    status: (['1', '2', '3', '4'] as const)[i % 4],
    userName: `user_${i}`,
    nickName: i % 2 === 0 ? `昵称${i}` : '',
    userGender: i % 2 === 0 ? '男' : '女',
    userPhone: `1380013${String(8000 + i).slice(-4)}`,
    userEmail: `user${i}@example.com`,
    userRoles: i % 5 === 0 ? ['admin'] : ['ops'],
    accessibleApps: i % 4 === 0 ? ['com.demo.app'] : [],
    remark: i % 6 === 0 ? 'Mock 备注' : '',
    createBy: 'admin',
    createTime: `${y}-01-${String((i % 28) + 1).padStart(2, '0')} 10:00:00`,
    updateBy: 'admin',
    updateTime: `${y}-02-${String((i % 28) + 1).padStart(2, '0')} 15:30:00`
  })

  const list: Api.SystemManage.UserListItem[] = []
  for (let i = 1; i <= 24; i++) {
    list.push(base(i))
  }
  // 保证首条与契约示例接近，便于对照
  list[0] = {
    id: 1,
    avatar: '',
    status: '1',
    userName: 'demo',
    nickName: '演示',
    userGender: '男',
    userPhone: '13800138000',
    userEmail: 'demo@example.com',
    userRoles: ['ops'],
    accessibleApps: [],
    remark: '',
    createBy: 'admin',
    createTime: `${y}-01-01 10:00:00`,
    updateBy: 'admin',
    updateTime: `${y}-01-02 10:00:00`
  }
  return list
}

let cachedSeed: Api.SystemManage.UserListItem[] | null = null

export function getSystemUserMockList(): Api.SystemManage.UserListItem[] {
  if (!cachedSeed) {
    cachedSeed = buildSystemUserMockSeed()
  }
  return cachedSeed.map((r) => ({ ...r }))
}
