/**
 * 文本管理 - API 服务层
 * 与 mock/backend-api 契约 1:1，数据源开关见 config/data-source.ts
 */
import request from '@/utils/http'
import type { AppContent, AIModel, Translation } from '../types'
import { TextManagementEndpoint, isTextManagementEndpointMock } from '../config/data-source'
import * as textManagementMock from '../mocks/text-management-api-mock'

const BASE_URL = '/api/v1/datacenter/analysis/product-operations/text-management'

export interface StoreListingDraft {
  appContent: AppContent
  translations: Translation[]
  step1Done: boolean
  step2Done: boolean
  updatedAt?: string
}

export interface AuditWordLists {
  bannedWords: string[]
  brandWords: string[]
  version?: string
}

export interface TranslateParams {
  model: AIModel
  agent: string
  targetLang: string
  content: AppContent
}

export interface TranslateResult {
  appName: string
  shortDesc: string
  fullDesc: string
}

export interface AuditConfirmParams {
  appContent: AppContent
  repeatWords: string[]
  bannedWords: string[]
  brandWords: string[]
}

export interface AuditConfirmResult {
  pendingCount: number
  step1Done: boolean
}

export interface AuditRerunParams {
  appContent: AppContent
}

export interface AuditRerunResult {
  repeatWords: string[]
  bannedWords: string[]
  brandWords: string[]
}

export interface TranslationEditSaveParams {
  translation: Translation
}

export interface TranslationEditSaveResult {
  saved: boolean
  updatedAt: string
}

export interface TranslationsExportParams {
  format: 'xlsx' | 'csv' | 'json'
  scope: 'completed' | 'selected' | 'custom'
  langCodes: string[]
}

export interface TranslationsExportResult {
  downloadUrl: string
  fileName: string
  expiresAt: string
}

export interface TranslationsImportParams {
  fileName: string
  fileType: string
  payload: string
}

export interface TranslationsImportResult {
  translations: Translation[]
  importedCount: number
  overwrittenCount: number
}

export interface SubmitStoreParams {
  appContent: AppContent
  translations: Translation[]
  platform: 'google_play' | 'app_store' | 'huawei'
}

export interface SubmitStoreResult {
  taskId: string
  status: 'queued' | 'processing'
  submittedAt: string
}

export async function fetchGetStoreListingDraft(appId?: string): Promise<StoreListingDraft> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.StoreListingDraft)) {
    return textManagementMock.mockFetchGetStoreListingDraft(appId)
  }
  const query = appId ? `?appId=${encodeURIComponent(appId)}` : ''
  return request.get<StoreListingDraft>({
    url: `${BASE_URL}/store-listing/draft${query}`
  })
}

export async function fetchSaveStoreListingDraft(body: StoreListingDraft): Promise<void> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.StoreListingDraft)) {
    return textManagementMock.mockFetchSaveStoreListingDraft(body)
  }
  return request.post<void>({
    url: `${BASE_URL}/store-listing/draft`,
    data: body
  })
}

export async function fetchAuditWordLists(): Promise<AuditWordLists> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.AuditWordLists)) {
    return textManagementMock.mockFetchAuditWordLists()
  }
  return request.get<AuditWordLists>({
    url: `${BASE_URL}/meta/audit-word-lists`
  })
}

export async function fetchTextManagementTranslate(
  params: TranslateParams
): Promise<TranslateResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.Translate)) {
    return textManagementMock.mockFetchTranslate(params)
  }
  return request.post<TranslateResult>({
    url: `${BASE_URL}/action/translate`,
    data: params
  })
}

export async function fetchAuditConfirm(params: AuditConfirmParams): Promise<AuditConfirmResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.AuditConfirm)) {
    return textManagementMock.mockFetchAuditConfirm(params)
  }
  return request.post<AuditConfirmResult>({
    url: `${BASE_URL}/action/audit-confirm`,
    data: params
  })
}

export async function fetchAuditRerun(params: AuditRerunParams): Promise<AuditRerunResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.AuditRerun)) {
    return textManagementMock.mockFetchAuditRerun(params)
  }
  return request.post<AuditRerunResult>({
    url: `${BASE_URL}/action/audit-rerun`,
    data: params
  })
}

export async function fetchTranslationsImport(
  params: TranslationsImportParams
): Promise<TranslationsImportResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.TranslationsImport)) {
    return textManagementMock.mockFetchTranslationsImport(params)
  }
  return request.post<TranslationsImportResult>({
    url: `${BASE_URL}/action/translations-import`,
    data: params
  })
}

export async function fetchTranslationsExport(
  params: TranslationsExportParams
): Promise<TranslationsExportResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.TranslationsExport)) {
    return textManagementMock.mockFetchTranslationsExport(params)
  }
  return request.post<TranslationsExportResult>({
    url: `${BASE_URL}/action/translations-export`,
    data: params
  })
}

export async function fetchTranslationEditSave(
  params: TranslationEditSaveParams
): Promise<TranslationEditSaveResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.TranslationEditSave)) {
    return textManagementMock.mockFetchTranslationEditSave(params)
  }
  return request.post<TranslationEditSaveResult>({
    url: `${BASE_URL}/action/translation-edit-save`,
    data: params
  })
}

export async function fetchSubmitStore(params: SubmitStoreParams): Promise<SubmitStoreResult> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.SubmitStore)) {
    return textManagementMock.mockFetchSubmitStore(params)
  }
  return request.post<SubmitStoreResult>({
    url: `${BASE_URL}/action/submit-store`,
    data: params
  })
}
