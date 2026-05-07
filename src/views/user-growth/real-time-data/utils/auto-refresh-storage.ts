import { StorageConfig } from '@/utils/storage/storage-config'

export const REALTIME_AUTO_REFRESH_DEFAULT_MINUTES = 30
export const REALTIME_AUTO_REFRESH_MIN_MINUTES = 1
export const REALTIME_AUTO_REFRESH_MAX_MINUTES = 60

function autoRefreshStorageKey(): string {
  return StorageConfig.generateStorageKey(
    StorageConfig.REALTIME_DASHBOARD_AUTO_REFRESH_MINUTES_STORE_ID
  )
}

export function readRealtimeAutoRefreshMinutes(): number {
  const raw = localStorage.getItem(autoRefreshStorageKey())
  const n = raw != null ? Number.parseInt(raw, 10) : NaN
  if (
    !Number.isFinite(n) ||
    n < REALTIME_AUTO_REFRESH_MIN_MINUTES ||
    n > REALTIME_AUTO_REFRESH_MAX_MINUTES
  ) {
    return REALTIME_AUTO_REFRESH_DEFAULT_MINUTES
  }
  return n
}

export function writeRealtimeAutoRefreshMinutes(minutes: number): void {
  const clamped = Math.min(
    REALTIME_AUTO_REFRESH_MAX_MINUTES,
    Math.max(REALTIME_AUTO_REFRESH_MIN_MINUTES, Math.round(minutes))
  )
  localStorage.setItem(autoRefreshStorageKey(), String(clamped))
}
