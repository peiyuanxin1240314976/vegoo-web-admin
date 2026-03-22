/**
 * 全局“当前时间”入口。
 *
 * 测试环境：默认固定为 2026-03-15（因为目前只有这一天的数据）。
 * 上线后：只需要把 `getFixedNow()` 改为返回 `new Date()`（或改为读取环境变量）即可全局恢复真实今天。
 */

/** 固定“今天”为 2026-03-15（本地时区 00:00:00） */
function getFixedNow(): Date {
  // 保持“日期固定”，但沿用真实的时分秒，避免导出文件名/日志时间等出现大量重复
  const real = new Date()
  // month: 0-11
  return new Date(
    2026,
    2,
    5,
    real.getHours(),
    real.getMinutes(),
    real.getSeconds(),
    real.getMilliseconds()
  )
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
