/**
 * 广告平台 → 阿里 iconfont 类名映射与兜底首字符。
 * 需在页面入口或 index.html 引入对应 iconfont CSS。
 *
 * @module utils/ui/ad-platform-iconfont
 */

/** slug（小写）→ iconfont 第二个类名 */
export const AD_PLATFORM_ICONFONT_CLASS: Readonly<Record<string, string>> = {
  google: 'icon-google',
  facebook: 'icon-facebook',
  tiktok: 'icon-tiktoklogo_tiktok',
  mintegral: 'icon-Mintegral',
  kwai: 'icon-kwai'
}

/** 展示名 / 别名（小写）→ 标准 slug */
const DISPLAY_NAME_TO_SLUG: Readonly<Record<string, string>> = {
  'google ads': 'google',
  google: 'google',
  facebook: 'facebook',
  tiktok: 'tiktok',
  mintegral: 'mintegral',
  mintefral: 'mintegral',
  kwai: 'kwai'
}

function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * 从 platform / name 解析出可用于查表的小写 slug；无则返回空串。
 */
export function resolveAdPlatformSlug(input: { platform?: string; name?: string }): string {
  const pRaw = input.platform?.trim()
  if (pRaw) {
    const p = pRaw.toLowerCase()
    if (p in AD_PLATFORM_ICONFONT_CLASS) return p
    const fromP = DISPLAY_NAME_TO_SLUG[normKey(pRaw)]
    if (fromP) return fromP
  }
  const nRaw = input.name?.trim() ?? ''
  if (!nRaw) return ''
  const n = normKey(nRaw)
  if (n in DISPLAY_NAME_TO_SLUG) return DISPLAY_NAME_TO_SLUG[n]!
  if (n in AD_PLATFORM_ICONFONT_CLASS) return n
  const noAds = n.replace(/\s+ads$/i, '').trim()
  if (noAds !== n && noAds in AD_PLATFORM_ICONFONT_CLASS) return noAds
  if (noAds === 'google' || n.startsWith('google ')) return 'google'
  return ''
}

export function getAdPlatformIconfontClass(slug: string): string | undefined {
  if (!slug) return undefined
  return AD_PLATFORM_ICONFONT_CLASS[slug]
}

/**
 * 无 iconfont 时用于占位的一个字符（英文取首字母大写，中文取首字）。
 */
export function getAdPlatformIconFallbackLetter(displayName: string): string {
  const s = displayName.trim()
  if (!s) return '?'
  const first = s[0]
  if (/[a-zA-Z]/.test(first)) return first.toUpperCase()
  return first
}

export interface AdPlatformIconDisplay {
  /** iconfont 第二个类名（如 icon-google），无则 undefined */
  iconClass?: string
  /** 无图标时展示的单个字符 */
  letter: string
}

/**
 * 一次返回图标类名或兜底字母，供列表/卡片绑定。
 */
export function getAdPlatformIconDisplay(input: {
  platform?: string
  name?: string
}): AdPlatformIconDisplay {
  const displayName = (input.name ?? '').trim() || '—'
  const slug = resolveAdPlatformSlug(input)
  const iconClass = getAdPlatformIconfontClass(slug)
  if (iconClass) {
    return { iconClass, letter: '' }
  }
  return {
    iconClass: undefined,
    letter: getAdPlatformIconFallbackLetter(displayName)
  }
}
