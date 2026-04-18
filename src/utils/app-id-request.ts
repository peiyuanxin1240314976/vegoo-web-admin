/**
 * 将单选 UI 中的应用 ID 转为 POST 请求体字段 `appIds: string[]`。
 * 不限/全部应用 → []；已选 → ['应用ID']。
 */
export function toAppIdsRequestBody(selectedAppId: string | undefined | null): string[] {
  const id = typeof selectedAppId === 'string' ? selectedAppId.trim() : ''
  return id ? [id] : []
}
