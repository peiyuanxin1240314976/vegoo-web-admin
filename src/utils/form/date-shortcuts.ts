/**
 * 全局统一的日期选择器快捷选项配置
 * 所有日期选择（含 AppDatePicker / daterange / datetimerange / date / datetime）均可复用此定义。
 * 如需按业务定制，只需修改此文件，全项目自动生效。
 */

import { getAppNow, cloneAppDate } from '@/utils/app-now'

/** 日期范围 shortcuts（所有 daterange / datetimerange 共用） */
export const dateRangeShortcuts = [
  {
    text: '近3天',
    value: () => {
      const end = getAppNow()
      const start = cloneAppDate(end)
      start.setDate(start.getDate() - 2)
      return [start, end]
    }
  },
  {
    text: '近7天',
    value: () => {
      const end = getAppNow()
      const start = cloneAppDate(end)
      start.setDate(start.getDate() - 6)
      return [start, end]
    }
  },
  {
    text: '近30天',
    value: () => {
      const end = getAppNow()
      const start = cloneAppDate(end)
      start.setDate(start.getDate() - 29)
      return [start, end]
    }
  }
]

/** 单日期 shortcuts（date / datetime 用，可按需扩展） */
export const dateShortcuts = [
  {
    text: '今天',
    value: () => getAppNow()
  },
  {
    text: '昨天',
    value: () => {
      const d = cloneAppDate(getAppNow())
      d.setDate(d.getDate() - 1)
      return d
    }
  }
]
