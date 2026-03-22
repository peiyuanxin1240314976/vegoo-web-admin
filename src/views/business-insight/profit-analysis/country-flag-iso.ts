/**
 * 後端未下發 s_country_code 時，用表格展示用中文國名解析 ISO 3166-1 alpha-2，供 flag-icons 使用。
 * 有 s_country_code 時一律優先使用介面欄位。
 */
const CN_NAME_TO_ISO: Record<string, string> = {
  美国: 'US',
  英国: 'GB',
  德国: 'DE',
  法国: 'FR',
  意大利: 'IT',
  西班牙: 'ES',
  波兰: 'PL',
  韩国: 'KR',
  朝鲜: 'KP',
  日本: 'JP',
  中国: 'CN',
  中国台湾: 'TW',
  台湾: 'TW',
  香港: 'HK',
  澳门: 'MO',
  巴西: 'BR',
  印度: 'IN',
  俄罗斯: 'RU',
  加拿大: 'CA',
  澳大利亚: 'AU',
  墨西哥: 'MX',
  土耳其: 'TR',
  印度尼西亚: 'ID',
  越南: 'VN',
  泰国: 'TH',
  新加坡: 'SG',
  马来西亚: 'MY',
  菲律宾: 'PH',
  南非: 'ZA',
  埃及: 'EG',
  尼日利亚: 'NG',
  阿根廷: 'AR',
  智利: 'CL',
  哥伦比亚: 'CO',
  荷兰: 'NL',
  比利时: 'BE',
  瑞典: 'SE',
  挪威: 'NO',
  瑞士: 'CH',
  奥地利: 'AT',
  葡萄牙: 'PT',
  希腊: 'GR',
  捷克: 'CZ',
  罗马尼亚: 'RO',
  乌克兰: 'UA',
  以色列: 'IL',
  阿联酋: 'AE',
  沙特阿拉伯: 'SA'
}

function normalizeIso2(raw: string | undefined): string {
  if (!raw?.trim()) return ''
  const t = raw.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(t)) return ''
  return t
}

export function resolveProfitCountryIso(row: { s_country_code?: string; name?: string }): string {
  const fromApi = normalizeIso2(row.s_country_code)
  if (fromApi) return fromApi
  const n = row.name?.trim()
  if (n && CN_NAME_TO_ISO[n]) return CN_NAME_TO_ISO[n]
  return ''
}
