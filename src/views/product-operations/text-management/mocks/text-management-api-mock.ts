/**
 * 文本管理 - Mock 实现
 * 与 mock/backend-api 契约及 api-mock/*.json 对齐
 */
import type {
  TranslateParams,
  TranslateResult,
  StoreListingDraft,
  AuditWordLists
} from '../api/text-management'
import { mockAuditWordLists, mockStoreListingDraft } from '../api/text-management'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function mockFetchGetStoreListingDraft(): Promise<StoreListingDraft> {
  await delay(400)
  return JSON.parse(JSON.stringify(mockStoreListingDraft)) as StoreListingDraft
}

export async function mockFetchSaveStoreListingDraft(_body: StoreListingDraft): Promise<void> {
  void _body
  await delay(300)
}

export async function mockFetchAuditWordLists(): Promise<AuditWordLists> {
  await delay(200)
  return { ...mockAuditWordLists, bannedWords: [...mockAuditWordLists.bannedWords] }
}

/** 模拟译化：延迟后返回带目标语言前缀的占位译文（与原先 axios 失败兜底行为一致） */
export async function mockFetchTranslate(params: TranslateParams): Promise<TranslateResult> {
  const { targetLang, content } = params
  await delay(1200 + Math.random() * 800)
  const prefix = `[${targetLang}] `
  const appName = prefix + content.appName.substring(0, 12)
  const shortDesc = prefix + content.shortDesc.substring(0, 40)
  const fullDesc = prefix + content.fullDesc.substring(0, 200)
  return { appName, shortDesc, fullDesc }
}
