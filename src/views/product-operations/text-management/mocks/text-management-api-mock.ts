/**
 * 文本管理 - Mock 实现
 * 与 mock/backend-api 契约及 api-mock/*.json 对齐
 */
import type {
  TranslateParams,
  TranslateResult,
  StoreListingDraft,
  AuditWordLists,
  AuditConfirmParams,
  AuditConfirmResult,
  AuditRerunParams,
  AuditRerunResult,
  TranslationsImportParams,
  TranslationsImportResult,
  TranslationsExportParams,
  TranslationsExportResult,
  TranslationEditSaveParams,
  TranslationEditSaveResult,
  SubmitStoreParams,
  SubmitStoreResult
} from '../api/text-management'
import storeListingDraftMock from '../mock/api-mock/01-store-listing-draft.json'
import auditWordListsMock from '../mock/api-mock/02-audit-word-lists.json'
import translateMock from '../mock/api-mock/03-translate.json'
import auditConfirmMock from '../mock/api-mock/04-audit-confirm.json'
import auditRerunMock from '../mock/api-mock/05-audit-rerun.json'
import importMock from '../mock/api-mock/06-translations-import.json'
import exportMock from '../mock/api-mock/07-translations-export.json'
import editSaveMock from '../mock/api-mock/08-translation-edit-save.json'
import submitStoreMock from '../mock/api-mock/09-submit-store.json'

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function mockFetchGetStoreListingDraft(appId?: string): Promise<StoreListingDraft> {
  void appId
  await delay(400)
  return JSON.parse(JSON.stringify(storeListingDraftMock.data)) as StoreListingDraft
}

export async function mockFetchSaveStoreListingDraft(_body: StoreListingDraft): Promise<void> {
  void _body
  await delay(300)
}

export async function mockFetchAuditWordLists(): Promise<AuditWordLists> {
  await delay(200)
  const data = auditWordListsMock.data
  return {
    ...data,
    bannedWords: [...data.bannedWords],
    brandWords: [...data.brandWords]
  }
}

/** 模拟译化：延迟后返回带目标语言前缀的占位译文（与原先 axios 失败兜底行为一致） */
export async function mockFetchTranslate(params: TranslateParams): Promise<TranslateResult> {
  const { targetLang, content } = params
  await delay(1200 + Math.random() * 800)
  const preset = translateMock.data
  const prefix = `[${targetLang}] `
  const appName = content.appName ? `${prefix}${content.appName.substring(0, 12)}` : preset.appName
  const shortDesc = content.shortDesc
    ? `${prefix}${content.shortDesc.substring(0, 40)}`
    : preset.shortDesc
  const fullDesc = content.fullDesc
    ? `${prefix}${content.fullDesc.substring(0, 200)}`
    : preset.fullDesc
  return { appName, shortDesc, fullDesc }
}

export async function mockFetchAuditConfirm(
  params: AuditConfirmParams
): Promise<AuditConfirmResult> {
  void params
  await delay(300)
  return JSON.parse(JSON.stringify(auditConfirmMock.data)) as AuditConfirmResult
}

export async function mockFetchAuditRerun(params: AuditRerunParams): Promise<AuditRerunResult> {
  const allText = [
    params.appContent.appName,
    params.appContent.shortDesc,
    params.appContent.fullDesc
  ]
    .join(' ')
    .toLowerCase()
  await delay(350)
  const preset = auditRerunMock.data
  return {
    repeatWords: preset.repeatWords.filter((w) => allText.includes(w.toLowerCase())),
    bannedWords: preset.bannedWords.filter((w) => allText.includes(w.toLowerCase())),
    brandWords: preset.brandWords.filter((w) => allText.includes(w.toLowerCase()))
  }
}

export async function mockFetchTranslationsImport(
  params: TranslationsImportParams
): Promise<TranslationsImportResult> {
  void params
  await delay(400)
  return JSON.parse(JSON.stringify(importMock.data)) as TranslationsImportResult
}

export async function mockFetchTranslationsExport(
  params: TranslationsExportParams
): Promise<TranslationsExportResult> {
  await delay(280)
  const preset = exportMock.data
  return {
    downloadUrl: `${preset.downloadUrl}?format=${params.format}&scope=${params.scope}`,
    fileName: preset.fileName.replace('xlsx', params.format),
    expiresAt: preset.expiresAt
  }
}

export async function mockFetchTranslationEditSave(
  params: TranslationEditSaveParams
): Promise<TranslationEditSaveResult> {
  void params
  await delay(220)
  return JSON.parse(JSON.stringify(editSaveMock.data)) as TranslationEditSaveResult
}

export async function mockFetchSubmitStore(params: SubmitStoreParams): Promise<SubmitStoreResult> {
  void params
  await delay(500)
  return JSON.parse(JSON.stringify(submitStoreMock.data)) as SubmitStoreResult
}
