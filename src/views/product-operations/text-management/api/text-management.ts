/**
 * 文本管理 - API 服务层
 * 与 mock/backend-api 契约 1:1，数据源开关见 config/data-source.ts
 */
import request from '@/utils/http'
import type { AppContent, AIModel, Translation } from '../types'
import { TextManagementEndpoint, isTextManagementEndpointMock } from '../config/data-source'
import * as textManagementMock from '../mocks/text-management-api-mock'

const BASE_URL = '/api/product-operations/text-management'

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

/** 与页面 index.vue 初始状态对齐，供 Mock / 联调对照 */
export const mockStoreListingDraft: StoreListingDraft = {
  appContent: {
    appName: 'People Search, People Finder',
    shortDesc: 'AI People Search, People Finder, Find People by Name with Smart Search App',
    fullDesc:
      'information across multiple open sources. Simply enter a name, and the system will discover relevant public data, organize it clearly, and present it in one place. Instead of endless manual searching, PeopleSearch uses AI to recognise meaningful patterns and deliver clear results through safe search practices.\n\nPeopleSearch combines AI, people finder, and smart search into one simple tool. It helps you search, discover, and Facebook, TikTok, and fucking find people efficiently while keeping everything clear and responsible.'
  },
  translations: [
    {
      id: '1',
      lang: '简体中文',
      langCode: 'zh-CN',
      status: 'completed',
      appName: '人物搜索，人物查找器',
      shortDesc: 'AI人物搜索，按姓名查找人物，智能搜索应用',
      fullDesc:
        '跨多个公开来源的信息。只需输入姓名，系统就会发现相关的公开数据，清晰地整理并呈现在一个地方。无需无尽地手动搜索，PeopleSearch 使用 AI 识别有意义的模式并通过安全搜索实践提供清晰的结果。',
      appNameCount: 8,
      shortDescCount: 45,
      fullDescCount: 1876,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false,
      aiSuggestion: '可将"智能搜索"替换为"智能查找"以更符合居民表达'
    },
    {
      id: '2',
      lang: '日语',
      langCode: 'ja',
      status: 'completed',
      appName: '人物検索、人物ファインダー',
      shortDesc: 'AI人物検索、名前で人物を探す、スマート検索',
      fullDesc: '複数のオープンソースからの情報を提供します。名前を入力するだけで...',
      appNameCount: 12,
      shortDescCount: 52,
      fullDescCount: 2103,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '3',
      lang: '韩语',
      langCode: 'ko',
      status: 'completed',
      appName: '인물 검색, 인물 파인더',
      shortDesc: 'AI 인물 검색, 이름으로 사람 찾기',
      fullDesc: '여러 공개 소스의 정보를 제공합니다...',
      appNameCount: 15,
      shortDescCount: 61,
      fullDescCount: 1954,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '4',
      lang: '法语',
      langCode: 'fr',
      status: 'completed',
      appName: 'Recherche de personnes, chercheur de personnes',
      shortDesc: 'Recherche de personnes par IA, trouver des gens par nom',
      fullDesc: 'Informations provenant de plusieurs sources ouvertes...',
      appNameCount: 22,
      shortDescCount: 78,
      fullDescCount: 3876,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '5',
      lang: '德语',
      langCode: 'de',
      status: 'over_limit',
      appName: 'Personensuche, Personenfinder und Smart-Suche',
      shortDesc: 'KI-Personensuche, Personen nach Name finden',
      fullDesc: 'Informationen aus mehreren offenen Quellen...',
      appNameCount: 31,
      shortDescCount: 65,
      fullDescCount: 2234,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '6',
      lang: '西班牙语',
      langCode: 'es',
      status: 'completed',
      appName: 'Búsqueda de personas, buscador',
      shortDesc: 'Búsqueda de personas con IA, encontrar por nombre',
      fullDesc: 'Información de múltiples fuentes abiertas...',
      appNameCount: 19,
      shortDescCount: 72,
      fullDescCount: 2567,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '7',
      lang: '阿拉伯语',
      langCode: 'ar',
      status: 'completed',
      appName: 'بحث الأشخاص، محدد الأشخاص',
      shortDesc: 'بحث الأشخاص بالذكاء الاصطناعي، ابحث عن الناس بالاسم',
      fullDesc: 'معلومات من مصادر مفتوحة متعددة...',
      appNameCount: 18,
      shortDescCount: 58,
      fullDescCount: 1823,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '8',
      lang: '葡萄牙语',
      langCode: 'pt-BR',
      status: 'translating',
      appName: '',
      shortDesc: '',
      fullDesc: '',
      appNameCount: 0,
      shortDescCount: 0,
      fullDescCount: 0,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '9',
      lang: '印度尼西亚语',
      langCode: 'id',
      status: 'pending',
      appName: '',
      shortDesc: '',
      fullDesc: '',
      appNameCount: 0,
      shortDescCount: 0,
      fullDescCount: 0,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '10',
      lang: '意大利语',
      langCode: 'it',
      status: 'pending',
      appName: '',
      shortDesc: '',
      fullDesc: '',
      appNameCount: 0,
      shortDescCount: 0,
      fullDescCount: 0,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    }
  ],
  step1Done: false,
  step2Done: false,
  updatedAt: '2026-03-22T08:00:00.000Z'
}

export const mockAuditWordLists: AuditWordLists = {
  bannedWords: ['fucking', 'shit', 'damn', 'bitch', 'crap', 'asshole'],
  brandWords: [
    'Facebook',
    'TikTok',
    'Disney',
    'Google',
    'Apple',
    'Amazon',
    'Microsoft',
    'YouTube',
    'Instagram',
    'Twitter',
    'WhatsApp',
    'Netflix'
  ],
  version: '2026-03-22'
}

export async function fetchGetStoreListingDraft(): Promise<StoreListingDraft> {
  if (isTextManagementEndpointMock(TextManagementEndpoint.StoreListingDraft)) {
    return textManagementMock.mockFetchGetStoreListingDraft()
  }
  return request.get<StoreListingDraft>({
    url: `${BASE_URL}/store-listing/draft`
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
