/**
 * 用户增长 - 预警管理 API（当前为 mock）
 */
import type {
  AlertManagementOverview,
  AlertManagementOverviewParams
} from '@/views/user-growth/alert-management/types'
import { buildMockAlertManagementOverview } from '@/views/user-growth/alert-management/mock/data'

/** 预警管理 - 整页聚合（当前：mock；后端：`POST /api/user-growth/alert-management/overview`） */
export function fetchAlertManagementOverview(
  params: AlertManagementOverviewParams
): Promise<AlertManagementOverview> {
  return Promise.resolve(buildMockAlertManagementOverview(params))
}
