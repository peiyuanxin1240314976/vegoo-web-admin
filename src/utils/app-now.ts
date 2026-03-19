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
