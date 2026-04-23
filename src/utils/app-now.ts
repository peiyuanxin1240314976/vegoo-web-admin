/**
 * 全局“当前时间”入口。
 *
 * 测试环境：默认固定为 2026-03-15（因为目前只有这一天的数据）。
 * 上线后：只需要把 `getFixedNow()` 改为返回 `new Date()`（或改为读取环境变量）即可全局恢复真实今天。
 */

/** 动态返回“昨天”（基于当前时间减一天） */
function getFixedNow(): Date {
  // 保持真实时分秒，仅将日期回退一天
  const real = new Date()
  const yesterday = new Date(real)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

export function getAppNow(): Date {
  return getFixedNow()
}

export function formatYYYYMMDD(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getAppTodayYYYYMMDD(): string {
  return formatYYYYMMDD(getAppNow())
}

export function getAppNowMs(): number {
  return getAppNow().getTime()
}

/** 复制指定时刻，便于在应用时间上做大字日历运算且不改动原 Date */
export function cloneAppDate(d: Date): Date {
  return new Date(d.getTime())
}

/** 应用当前时刻 + 偏移毫秒（如一周前：offsetAppNowMs(-604800000)） */
export function offsetAppNowMs(deltaMs: number): Date {
  return new Date(getAppNowMs() + deltaMs)
}
