export interface Translation {
  id: string
  lang: string
  langCode: string
  status: 'completed' | 'over_limit' | 'translating' | 'pending'
  appName: string
  shortDesc: string
  fullDesc: string
  appNameCount: number
  shortDescCount: number
  fullDescCount: number
  appNameLimit: 30
  shortDescLimit: 80
  fullDescLimit: 4000
  selected: boolean
  aiSuggestion?: string
}

export interface AppContent {
  appName: string
  shortDesc: string
  fullDesc: string
}

export type Step = 1 | 2 | 3
export type AIModel = 'claude-sonnet' | 'gpt4o' | 'gemini-15-pro'
