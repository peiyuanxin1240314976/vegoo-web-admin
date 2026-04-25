<template>
  <div class="cockpit-map-kpi">
    <div class="map-kpi-border-spin" aria-hidden="true" />
    <ElCard class="cockpit-map-panel" :class="{ 'cockpit-map-panel--dark': isDark }" shadow="never">
      <template #header>
        <span class="map-panel-title">业务分布地图</span>
        <div class="map-metric-box">
          <div
            class="map-metric-slider"
            :style="{ transform: `translateX(${metricIndex * 100}%)` }"
          />
          <button
            v-for="opt in metricOptions"
            :key="opt.value"
            type="button"
            class="map-metric-btn"
            :class="{ active: mapMetric === opt.value }"
            @click="selectMetric(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </template>
      <div v-loading="mapLoading" class="map-wrap">
        <div ref="mapChartRef" class="map-chart"></div>
      </div>
      <!-- <div class="map-legend">
      <div v-for="r in regionList" :key="r.name" class="legend-item">
        <span class="dot" :style="{ background: r.color }"></span>
        <span>{{ r.name }}锛坽{ r.value }} {{ r.trend }}锛?/span>
      </div>
    </div> -->
    </ElCard>
  </div>
  <!-- 鎮诞 tooltip锛歍eleport 鍒?body锛岄伩鍏嶇埗鍗＄墖 transform/overflow:hidden 瀵艰嚧瀹氫綅澶辨晥鎴栬瑁佸垏 -->
  <Teleport to="body">
    <div
      v-show="hoverTooltipVisible"
      class="cockpit-map-hover-tt"
      :class="{ 'cockpit-map-hover-tt--dark': isDark }"
      :style="{ left: hoverTooltipX + 'px', top: hoverTooltipY + 'px' }"
      v-html="hoverTooltipHtml"
    />
  </Teleport>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed, onDeactivated } from 'vue'
  import { useMediaQuery } from '@vueuse/core'
  import { useRouter, onBeforeRouteLeave } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { CockpitMapCountry, CockpitMapLegendItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'
  import 'flag-icons/css/flag-icons.min.css'

  defineOptions({ name: 'CockpitBusinessMap' })

  // 浣跨敤 base 璺緞锛屾墦鍖呴儴缃插埌瀛愯矾寰勶紙濡?/admin/锛夋椂涔熻兘姝ｇ‘鍔犺浇
  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`

  /** 鍥藉/鍦板尯鑻辨枃鍚?鈫?ISO 3166-1 alpha-2锛堜笌 world.json GeoJSON 鐨?name 瀛楁涓€鑷达紝瑕嗙洊鍏ㄩ儴鍦板浘鍖哄煙浠ユ樉绀哄浗鏃楋級 */
  const COUNTRY_NAME_TO_ISO: Record<string, string> = {
    'United States of America': 'US',
    'United States': 'US',
    Afghanistan: 'AF',
    Aland: 'AX',
    Albania: 'AL',
    Algeria: 'DZ',
    'American Samoa': 'AS',
    Andorra: 'AD',
    Angola: 'AO',
    'Antigua and Barb.': 'AG',
    Argentina: 'AR',
    Armenia: 'AM',
    Australia: 'AU',
    Austria: 'AT',
    Azerbaijan: 'AZ',
    Bahamas: 'BS',
    Bahrain: 'BH',
    Bangladesh: 'BD',
    Barbados: 'BB',
    Belarus: 'BY',
    Belgium: 'BE',
    Belize: 'BZ',
    Benin: 'BJ',
    Bermuda: 'BM',
    Bhutan: 'BT',
    Bolivia: 'BO',
    'Bosnia and Herz.': 'BA',
    Botswana: 'BW',
    'Br. Indian Ocean Ter.': 'IO',
    Brazil: 'BR',
    Brunei: 'BN',
    Bulgaria: 'BG',
    'Burkina Faso': 'BF',
    Burundi: 'BI',
    Cambodia: 'KH',
    Cameroon: 'CM',
    Canada: 'CA',
    'Cape Verde': 'CV',
    'Cayman Is.': 'KY',
    'Central African Rep.': 'CF',
    Chad: 'TD',
    Chile: 'CL',
    China: 'CN',
    Colombia: 'CO',
    Comoros: 'KM',
    Congo: 'CG',
    'Costa Rica': 'CR',
    "C么te d'Ivoire": 'CI',
    Croatia: 'HR',
    Cuba: 'CU',
    Cura莽ao: 'CW',
    Cyprus: 'CY',
    'Czech Rep.': 'CZ',
    'Czech Republic': 'CZ',
    'Dem. Rep. Congo': 'CD',
    'Dem. Rep. Korea': 'KP',
    Denmark: 'DK',
    Djibouti: 'DJ',
    Dominica: 'DM',
    'Dominican Rep.': 'DO',
    Ecuador: 'EC',
    Egypt: 'EG',
    'El Salvador': 'SV',
    'Eq. Guinea': 'GQ',
    Eritrea: 'ER',
    Estonia: 'EE',
    Ethiopia: 'ET',
    'Faeroe Is.': 'FO',
    'Falkland Is.': 'FK',
    Fiji: 'FJ',
    Finland: 'FI',
    'Fr. Polynesia': 'PF',
    'Fr. S. Antarctic Lands': 'TF',
    France: 'FR',
    Gabon: 'GA',
    Gambia: 'GM',
    Georgia: 'GE',
    Germany: 'DE',
    Ghana: 'GH',
    Greece: 'GR',
    Greenland: 'GL',
    Grenada: 'GD',
    Guam: 'GU',
    Guatemala: 'GT',
    Guinea: 'GN',
    'Guinea-Bissau': 'GW',
    Guyana: 'GY',
    Haiti: 'HT',
    'Heard I. and McDonald Is.': 'HM',
    Honduras: 'HN',
    'Hong Kong': 'HK',
    Hungary: 'HU',
    Iceland: 'IS',
    India: 'IN',
    Indonesia: 'ID',
    Iran: 'IR',
    Iraq: 'IQ',
    Ireland: 'IE',
    'Isle of Man': 'IM',
    Israel: 'IL',
    Italy: 'IT',
    Jamaica: 'JM',
    Japan: 'JP',
    Jersey: 'JE',
    Jordan: 'JO',
    Kazakhstan: 'KZ',
    Kenya: 'KE',
    Kiribati: 'KI',
    Korea: 'KR',
    'South Korea': 'KR',
    Kuwait: 'KW',
    Kyrgyzstan: 'KG',
    'Lao PDR': 'LA',
    Latvia: 'LV',
    Lebanon: 'LB',
    Lesotho: 'LS',
    Liberia: 'LR',
    Libya: 'LY',
    Liechtenstein: 'LI',
    Lithuania: 'LT',
    Luxembourg: 'LU',
    Macedonia: 'MK',
    Madagascar: 'MG',
    Malawi: 'MW',
    Malaysia: 'MY',
    Mali: 'ML',
    Malta: 'MT',
    Mauritania: 'MR',
    Mauritius: 'MU',
    Mexico: 'MX',
    Micronesia: 'FM',
    Moldova: 'MD',
    Mongolia: 'MN',
    Montenegro: 'ME',
    Montserrat: 'MS',
    Morocco: 'MA',
    Mozambique: 'MZ',
    Myanmar: 'MM',
    'N. Cyprus': 'CY',
    'N. Mariana Is.': 'MP',
    Namibia: 'NA',
    Nepal: 'NP',
    Netherlands: 'NL',
    'New Caledonia': 'NC',
    'New Zealand': 'NZ',
    Nicaragua: 'NI',
    Niger: 'NE',
    Nigeria: 'NG',
    Niue: 'NU',
    Norway: 'NO',
    Oman: 'OM',
    Pakistan: 'PK',
    Palau: 'PW',
    Palestine: 'PS',
    Panama: 'PA',
    'Papua New Guinea': 'PG',
    Paraguay: 'PY',
    Peru: 'PE',
    Philippines: 'PH',
    Poland: 'PL',
    Portugal: 'PT',
    'Puerto Rico': 'PR',
    Qatar: 'QA',
    Romania: 'RO',
    Russia: 'RU',
    Rwanda: 'RW',
    'S茫o Tom茅 and Pr铆ncipe': 'ST',
    'S. Geo. and S. Sandw. Is.': 'GS',
    'S. Sudan': 'SS',
    'Saint Helena': 'SH',
    'Saint Lucia': 'LC',
    Samoa: 'WS',
    'Saudi Arabia': 'SA',
    Senegal: 'SN',
    Serbia: 'RS',
    Seychelles: 'SC',
    'Sierra Leone': 'SL',
    Singapore: 'SG',
    Slovakia: 'SK',
    Slovenia: 'SI',
    'Solomon Is.': 'SB',
    Somalia: 'SO',
    'South Africa': 'ZA',
    Spain: 'ES',
    'Sri Lanka': 'LK',
    'St. Pierre and Miquelon': 'PM',
    'St. Vin. and Gren.': 'VC',
    Sudan: 'SD',
    Suriname: 'SR',
    Swaziland: 'SZ',
    Sweden: 'SE',
    Switzerland: 'CH',
    Syria: 'SY',
    Taiwan: 'TW',
    Tajikistan: 'TJ',
    Tanzania: 'TZ',
    Thailand: 'TH',
    'Timor-Leste': 'TL',
    Togo: 'TG',
    Tonga: 'TO',
    'Trinidad and Tobago': 'TT',
    Tunisia: 'TN',
    Turkey: 'TR',
    Turkmenistan: 'TM',
    'Turks and Caicos Is.': 'TC',
    'U.S. Virgin Is.': 'VI',
    Uganda: 'UG',
    Ukraine: 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    Uruguay: 'UY',
    Uzbekistan: 'UZ',
    Vanuatu: 'VU',
    Venezuela: 'VE',
    Vietnam: 'VN',
    'W. Sahara': 'EH',
    Yemen: 'YE',
    Zambia: 'ZM',
    Zimbabwe: 'ZW'
  }
  const { isDark } = storeToRefs(useSettingStore())

  const props = withDefaults(
    defineProps<{
      mapCountries?: CockpitMapCountry[]
      mapLegend?: CockpitMapLegendItem[]
    }>(),
    { mapCountries: () => [], mapLegend: () => [] }
  )

  const countryData = computed(() =>
    Array.isArray(props.mapCountries) ? props.mapCountries : MOCK_COCKPIT_OVERVIEW.mapCountries
  )
  // const regionList = computed(() =>
  //   props.mapLegend.length ? props.mapLegend : MOCK_COCKPIT_OVERVIEW.mapLegend
  // )

  const mapChartRef = ref<HTMLElement | null>(null)
  const mapLoading = ref(true)
  const mapMetric = ref<'revenue' | 'spend' | 'user'>('revenue')
  const mapViewportWidth = ref(0)
  const mapViewportHeight = ref(0)
  /** 涓庡竷灞€ md 鏂偣涓€鑷达細绐勫睆闄嶄綆鍦板浘缁樺埗涓庝氦浜掓垚鏈?*/
  const isNarrowViewport = useMediaQuery('(max-width: 992px)')
  const narrowAtSetup =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 992px)').matches
  const { chartRef, initChart, updateChart, destroyChart, getChartInstance } = useChart({
    echartsInitOpts: {
      devicePixelRatio: Math.min(
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
        narrowAtSetup ? 1.5 : 2
      )
    }
  })
  const geoCoordMap = ref<Record<string, [number, number]>>({})

  /** 鎮诞 tooltip锛氫粎鍦ㄦ湁鏁版嵁鍥藉鏄剧ず锛屾寜收入/娑堣€?鐢ㄦ埛鍒囨崲鍐呭 */
  const hoverTooltipVisible = ref(false)
  const hoverTooltipX = ref(0)
  const hoverTooltipY = ref(0)
  const hoverTooltipHtml = ref('')
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)
  /** 褰撳墠鎮诞鐨勫浗瀹跺悕锛堢敤浜庡垏鎹㈡敹鍏?娑堣€?鐢ㄦ埛鏃跺埛鏂版偓娴?tooltip 鍐呭锛?*/
  const hoveredCountryNameEn = ref<string | null>(null)

  const metricOptions: { value: 'revenue' | 'spend' | 'user'; label: string }[] = [
    { value: 'revenue', label: '收入' },
    { value: 'spend', label: '消耗' },
    { value: 'user', label: '用户' }
  ]
  const metricIndex = computed(() => metricOptions.findIndex((o) => o.value === mapMetric.value))
  function selectMetric(value: 'revenue' | 'spend' | 'user') {
    mapMetric.value = value
  }

  function getValueByMetric(item: CockpitMapCountry) {
    switch (mapMetric.value) {
      case 'revenue':
        return item.revenue
      case 'spend':
        return item.spend
      default:
        return item.user
    }
  }

  /** 瑙ｆ瀽瓒嬪娍瀛楃涓诧紝杩斿洖鏄惁涓烘锛堢敤浜庢樉绀?鈫?缁胯壊 / 鈫?绾㈣壊锛?*/
  function isTrendUp(trend: string | undefined): boolean {
    if (!trend) return true
    return trend.startsWith('+') || !trend.includes('-')
  }

  function fmtValue(v: number, isK = false): string {
    if (v >= 1000) return `${(v / 1000).toFixed(2)}M`
    return isK ? `${v}K` : v.toLocaleString()
  }

  /** 鏍规嵁鍥藉鑻辨枃鍚嶈В鏋?ISO 浠ｇ爜锛堜笌 GeoJSON 甯哥敤鍚嶇О瀵归綈锛?*/
  function getCountryCode(nameEn: string): string {
    const code = COUNTRY_NAME_TO_ISO[nameEn]
    if (code) return code
    // 灏濊瘯鍘绘帀 "of X" 绛夊悗缂€鍐嶅尮閰?
    const key = Object.keys(COUNTRY_NAME_TO_ISO).find(
      (k) => k.startsWith(nameEn) || nameEn.startsWith(k)
    )
    return key ? COUNTRY_NAME_TO_ISO[key] : ''
  }

  /** 鏃犳暟鎹浗瀹舵偓娴椂鍙樉绀哄浗鏃?鍥藉鍚嶏紙浣跨敤 GeoJSON 鑻辨枃鍚嶏級 */
  function getMinimalHoverTooltipHtml(nameEn: string): string {
    const isoCode = getCountryCode(nameEn).toLowerCase()
    const hasFlag = /^[a-z]{2}$/.test(isoCode)
    const title = hasFlag
      ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag fi fi-${isoCode}"></span><span>${nameEn}</span></div>`
      : `<div class="cockpit-map-tt-title"><span>${nameEn}</span></div>`
    return `<div class="cockpit-map-hover-card cockpit-map-hover-card--minimal">${title}</div>`
  }

  /** 鎮诞 tooltip 鍐呭锛氱涓€鎺掑浗鏃?涓枃鍚嶏紝绗簩/涓夋帓鎸夋敹鍏?娑堣€?鐢ㄦ埛鎸夐挳鍒囨崲 */
  function getHoverTooltipHtml(c: CockpitMapCountry): string {
    const isoCode = (c.code || getCountryCode(c.nameEn) || '').toLowerCase()
    const hasFlag = /^[a-z]{2}$/.test(isoCode)
    const title = hasFlag
      ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag fi fi-${isoCode}"></span><span>${c.name}</span></div>`
      : `<div class="cockpit-map-tt-title"><span>${c.name}</span></div>`
    const upClass = isDark.value ? 'color:#34d399' : 'color:var(--el-color-success)'
    const downClass = isDark.value ? 'color:#f87171' : 'color:var(--el-color-danger)'
    if (mapMetric.value === 'revenue') {
      const up = isTrendUp(c.trend)
      return `<div class="cockpit-map-hover-card">${title}<div class="cockpit-map-tt-row"><span>收入</span><span style="${up ? upClass : downClass}">$${fmtValue(c.revenue, true)} ${c.trend}</span></div></div>`
    }
    if (mapMetric.value === 'spend') {
      const spendTrend = c.spendTrend ?? c.trend
      const up = isTrendUp(spendTrend)
      return `<div class="cockpit-map-hover-card">${title}<div class="cockpit-map-tt-row"><span>消耗</span><span style="${up ? upClass : downClass}">$${fmtValue(c.spend, true)} ${spendTrend}</span></div></div>`
    }
    // 鐢ㄦ埛锛氱浜屾帓新增用户+鍙樺寲锛岀涓夋帓活跃用户+鍙樺寲
    const newUserTrend = c.newUserTrend ?? c.trend
    const userTrendVal = c.userTrend ?? c.trend
    return `<div class="cockpit-map-hover-card">${title}<div class="cockpit-map-tt-row"><span>新增用户</span><span style="${isTrendUp(newUserTrend) ? upClass : downClass}">${(c.newUser ?? 0).toLocaleString()} ${newUserTrend}</span></div><div class="cockpit-map-tt-row"><span>活跃用户</span><span style="${isTrendUp(userTrendVal) ? upClass : downClass}">${(c.user ?? 0).toLocaleString()} ${userTrendVal}</span></div></div>`
  }

  /** map 绯诲垪涓€琛岋紙涓?buildOption 涓?mapData 椤逛竴鑷达級锛沞ffectScatter 鐨?params.data 鍙湁鍧愭爣+鎸囨爣锛岄』鎸?name 鍥炴煡 */
  type MapTooltipRow = {
    name: string
    value: number
    revenue: number
    spend: number
    user: number
    nameCn: string
    trend: string
    code: string
    newUser?: number
    newUserTrend?: string
    ecpm?: number
    ecpmTrend?: string
  }

  /** 浠呭綋鍖哄煙鍚嶇О鍦ㄦ湁鏁版嵁鐨勫浗瀹堕泦鍚堜腑鏃舵墠鏄剧ず tooltip锛涘畾浣嶇偣涓庡湴鍥惧尯鍩熷叡鐢ㄥ悓涓€濂楁枃妗?*/
  function buildTooltipFormatter(
    isDarkTheme: boolean,
    regionNamesWithData: Set<string>,
    dataByNameEn: Record<string, MapTooltipRow>
  ) {
    return (params: any) => {
      const nameEn = (params?.name ?? params?.data?.name) as string | undefined
      if (!nameEn || !regionNamesWithData.has(nameEn)) {
        return ''
      }
      const d = dataByNameEn[nameEn]
      if (!d) return ''
      const upClass = isDarkTheme ? 'color:#34d399' : 'color:var(--el-color-success)'
      const downClass = isDarkTheme ? 'color:#f87171' : 'color:var(--el-color-danger)'
      const revenueUp = isTrendUp(d.trend)
      const newUserTrend = d.newUserTrend ?? d.trend
      const ecpmTrend = d.ecpmTrend ?? d.trend
      const revArrow = `${revenueUp ? '↑' : '↓'}${d.trend}`
      const spendVal = d.spend ?? 0
      const spendTrend = spendVal > 500 ? '↓5%' : `${isTrendUp(d.trend) ? '↑' : '↓'}${d.trend}`
      const spendUp = isTrendUp(spendTrend)
      const newUserStr =
        d.newUser != null
          ? `${d.newUser.toLocaleString()} ${isTrendUp(newUserTrend) ? '↑' : '↓'}${newUserTrend}`
          : `${(d.user ?? 0).toLocaleString()} ${isTrendUp(d.trend) ? '↑' : '↓'}${d.trend}`
      const ecpmStr =
        d.ecpm != null ? `$${d.ecpm} ${isTrendUp(ecpmTrend) ? '↑' : '↓'}${ecpmTrend}` : ''
      const isoCodeRaw = d.code || getCountryCode(params.name) || ''
      const isoCode = isoCodeRaw.toLowerCase()
      const hasFlag = /^[a-z]{2}$/.test(isoCode)
      const titleHtml = hasFlag
        ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag fi fi-${isoCode}"></span><span>${d.nameCn || params.name}</span></div>`
        : `<div class="cockpit-map-tt-title"><span>${d.nameCn || params.name}</span></div>`
      const lines = [
        '<div class="cockpit-map-detail-card">',
        titleHtml,
        `<div class="cockpit-map-tt-row"><span>收入</span><span style="${revenueUp ? upClass : downClass}">$${fmtValue(d.revenue, true)} ${revArrow}</span></div>`,
        `<div class="cockpit-map-tt-row"><span>广告支出</span><span style="${spendUp ? upClass : downClass}">$${fmtValue(spendVal, true)} ${spendTrend}</span></div>`,
        `<div class="cockpit-map-tt-row"><span>活跃用户</span><span style="${upClass}">${(d.user ?? 0).toLocaleString()} ↑${d.trend}</span></div>`,
        d.newUser != null
          ? `<div class="cockpit-map-tt-row"><span>新增用户</span><span style="${upClass}">${newUserStr}</span></div>`
          : '',
        ecpmStr
          ? `<div class="cockpit-map-tt-row"><span>eCPM</span><span style="${upClass}">${ecpmStr}</span></div>`
          : '',
        `<div class="cockpit-map-tt-link" data-country-code="${(isoCodeRaw || '').replace(/"/g, '&quot;')}" data-country-en="${(d.name || params.name || '').replace(/"/g, '&quot;')}" data-country-cn="${(d.nameCn || params.name || '').replace(/"/g, '&quot;')}">查看${d.nameCn || params.name}详情 →</div>`,
        '</div>'
      ].filter(Boolean)
      return lines.join('')
    }
  }

  function syncMapViewport() {
    const el = mapChartRef.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    mapViewportWidth.value = Math.round(rect.width)
    mapViewportHeight.value = Math.round(rect.height)
  }

  function getGeoResponsiveLayout(lite: boolean) {
    const width = mapViewportWidth.value || (lite ? 760 : 1180)
    const height = mapViewportHeight.value || (lite ? 360 : 520)
    const aspect = width / Math.max(height, 1)

    const widthPenalty = width < 1080 ? Math.min((1080 - width) / 340, 1) : 0
    const heightPenalty = height < 430 ? Math.min((430 - height) / 140, 1) : 0
    const aspectPenalty = aspect < 1.85 ? Math.min((1.85 - aspect) / 0.55, 1) : 0
    const shrinkFactor = widthPenalty * 0.35 + heightPenalty * 0.3 + aspectPenalty * 0.35

    const layoutSizeBase = lite ? 111 : 115
    const centerYBase = lite ? 52.2 : 53

    return {
      layoutCenter: ['50%', `${centerYBase}%`],
      layoutSize: `${Math.max(layoutSizeBase - shrinkFactor * 7, lite ? 105 : 109)}%`
    }
  }

  function buildOption(): EChartsOption {
    const dark = isDark.value
    const lite = isNarrowViewport.value
    const geoLayout = getGeoResponsiveLayout(lite)
    const mapData = countryData.value.map((item) => ({
      name: item.nameEn,
      value: getValueByMetric(item),
      revenue: item.revenue,
      spend: item.spend,
      user: item.user,
      nameCn: item.name,
      trend: item.trend,
      code: item.code || getCountryCode(item.nameEn),
      newUser: item.newUser,
      newUserTrend: item.newUserTrend,
      ecpm: item.ecpm,
      ecpmTrend: item.ecpmTrend
    }))

    // 娣辫壊妯″紡锛氫綆鍊肩鐢ㄨ緝浜壊閬垮厤鈥滃叏榛戔€濓紱娴呰壊妯″紡锛氳竟妗嗘洿娴呫€佷綆鍊?鏃犳暟鎹尯鍩熸洿浜紝閬垮厤鍙戦粦

    const visualMapColors = dark
      ? ['#b92d34', '#ff7a2f', '#f2c94c', '#5ef28a']
      : ['#fca5a5', '#fdba74', '#facc15', '#4ade80']

    const unhighlightedArea = dark ? '#283140' : '#edf2f7'
    const borderColor = dark ? 'rgba(122,163,214,0.68)' : 'rgba(51,65,85,0.14)'
    const emphasisArea = dark ? 'rgba(102,255,137,0.96)' : '#86efac'
    const emphasisBorder = dark ? 'rgba(199,255,214,0.95)' : '#22c55e'
    const emphasisShadow = dark ? 'rgba(102,255,137,0.42)' : 'rgba(34,197,94,0.25)'

    const dataValues = mapData.map((d) => d.value).filter((v) => Number.isFinite(v))
    const dataMin = dataValues.length ? Math.min(...dataValues) : 0
    const dataMax = dataValues.length ? Math.max(...dataValues) : 100
    const hasPositive = dataMax > 0
    const visualMin = hasPositive && dataMin >= 0 ? 0.5 : dataMin
    const visualMax = dataMax
    const regionNamesWithData = new Set(mapData.map((d) => d.name))
    const dataByNameEn = Object.fromEntries(mapData.map((row) => [row.name, row])) as Record<
      string,
      MapTooltipRow
    >
    return {
      animation: !lite,
      animationDuration: lite ? 0 : 900,
      animationEasing: 'quarticOut',
      animationDurationUpdate: lite ? 0 : 650,
      animationEasingUpdate: 'quarticInOut',
      geo: {
        map: 'world',
        roam: !lite,
        layoutCenter: geoLayout.layoutCenter,
        layoutSize: geoLayout.layoutSize,
        scaleLimit: { min: 0.6, max: 4 },
        itemStyle: {
          areaColor: unhighlightedArea,
          borderColor,
          borderWidth: dark ? 1.05 : 0.9,
          shadowBlur: dark ? 8 : 0,
          shadowColor: dark ? 'rgba(7,12,24,0.52)' : 'transparent'
        },
        emphasis: {
          itemStyle: {
            areaColor: emphasisArea,
            borderColor: emphasisBorder,
            borderWidth: 1.1,
            shadowBlur: lite ? 14 : dark ? 28 : 14,
            shadowColor: emphasisShadow
          },
          label: {
            show: false,
            color: dark ? '#f8fafc' : '#1f2937',
            fontSize: 11,
            fontWeight: 600
          }
        },
        select: {
          itemStyle: { areaColor: emphasisArea },
          label: { show: false }
        },
        label: { show: false }
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'click', // 鏀逛负鐐瑰嚮鏄剧ず锛岄伩鍏嶆偓娴椂鐩栦綇閭诲浗璇Е
        confine: true,
        enterable: true, // 鍏佽榧犳爣绉诲叆 tooltip锛屼究浜庣偣鍑汇€屾煡鐪嬭鎯呫€嶏紙浠呭湪鏈夋暟鎹殑鍥藉鏄剧ず閾炬帴锛?
        transitionDuration: 0.2,
        backgroundColor: dark ? 'rgba(20,24,29,0.96)' : 'rgba(255,255,255,0.98)',
        borderColor: dark ? 'rgba(129,255,177,0.16)' : 'rgba(34,197,94,0.18)',
        borderWidth: 1,
        extraCssText: dark
          ? 'backdrop-filter: blur(12px); border-radius: 14px; box-shadow: 0 24px 56px rgba(0,0,0,0.52);'
          : 'border-radius: 14px; box-shadow: 0 16px 40px rgba(15,23,42,0.16);',
        padding: [0, 0],
        textStyle: {
          fontSize: 12,
          color: dark ? '#e2e8f0' : 'var(--el-text-color-primary)'
        },
        formatter: buildTooltipFormatter(dark, regionNamesWithData, dataByNameEn)
      },
      visualMap: {
        show: false,
        type: 'continuous',
        min: visualMin,
        max: visualMax,
        text: ['高', '低'],
        realtime: false,
        calculable: true,
        inRange: { color: visualMapColors },
        outOfRange: { color: [unhighlightedArea] },
        left: 12,
        bottom: 24,
        textStyle: {
          fontSize: 11,
          color: dark ? '#94a3b8' : 'var(--el-text-color-secondary)'
        },
        padding: 6
      },
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          name: '业务分布',
          data: mapData,
          label: { show: false }
        }
      ]
    }
  }

  watch(mapMetric, () => {
    updateChart(buildOption())
    if (hoverTooltipVisible.value && hoveredCountryNameEn.value) {
      const country = countryData.value.find((c) => c.nameEn === hoveredCountryNameEn.value)
      if (country) hoverTooltipHtml.value = getHoverTooltipHtml(country)
    }
  })
  watch(isDark, () => updateChart(buildOption()))

  watch(isNarrowViewport, () => {
    if (!getChartInstance()) return
    syncMapViewport()
    updateChart(buildOption())
    nextTick(() => getChartInstance()?.resize())
  })

  /** 鐖剁粍浠?overview 寮傛鍔犺浇锛岄娆?onMounted 鏃?mapChartRef 鍙兘灏氭湭娓叉煋锛坈ountryData 涓虹┖锛夛紱鏁版嵁鍒拌揪鍚庡啀鍒濆鍖?*/
  watch(
    countryData,
    () => {
      if (!mapChartRef.value) return
      if (!getChartInstance()) {
        nextTick(initWorldMap)
        return
      }
      updateChart(buildOption())
      if (
        hoverTooltipVisible.value &&
        hoveredCountryNameEn.value &&
        !countryData.value.some((c) => c.nameEn === hoveredCountryNameEn.value)
      ) {
        resetHoverTooltip()
      }
    },
    { deep: true }
  )

  let mapInitialized = false
  let mapResizeObserver: ResizeObserver | null = null
  let mapResizeRaf = 0

  function refreshMapLayout() {
    if (mapResizeRaf) cancelAnimationFrame(mapResizeRaf)
    mapResizeRaf = requestAnimationFrame(() => {
      mapResizeRaf = 0
      syncMapViewport()
      const chart = getChartInstance()
      if (!chart) return
      updateChart(buildOption())
      chart.resize()
    })
  }

  async function initWorldMap() {
    if (!mapChartRef.value) return
    try {
      const res = await fetch(WORLD_JSON_URL)
      const worldJson = await res.json()
      const coordMap: Record<string, [number, number]> = {}
      if (Array.isArray(worldJson?.features)) {
        worldJson.features.forEach((feature: any) => {
          const name = feature?.properties?.name
          const cp = feature?.properties?.cp
          if (
            typeof name === 'string' &&
            Array.isArray(cp) &&
            cp.length >= 2 &&
            Number.isFinite(Number(cp[0])) &&
            Number.isFinite(Number(cp[1]))
          ) {
            coordMap[name] = [Number(cp[0]), Number(cp[1])]
          }
        })
      }
      geoCoordMap.value = coordMap
      echarts.registerMap('world', worldJson)
      ;(chartRef as { value: HTMLElement | null }).value = mapChartRef.value
      nextTick(() => {
        syncMapViewport()
        initChart(buildOption())
        mapLoading.value = false
        if (!mapInitialized) {
          const chart = getChartInstance()
          if (chart) {
            chart.on('click', handleMapItemClick)
            chart.on('mouseover', handleMapMouseOver)
            chart.on('mouseout', handleMapMouseOut)
            chart.on('globalOut', handleMapGlobalOut)
          }
          mapChartRef.value?.addEventListener('click', handleTooltipLinkClick)
          mapChartRef.value?.addEventListener('mousemove', handleMapContainerMouseMove)
          if (typeof ResizeObserver !== 'undefined' && mapChartRef.value) {
            mapResizeObserver = new ResizeObserver(() => refreshMapLayout())
            mapResizeObserver.observe(mapChartRef.value)
          }
          mapInitialized = true
        }
      })
    } catch (e) {
      console.error('[Cockpit] 涓栫晫鍦板浘 GeoJSON 鍔犺浇澶辫触', e)
      mapLoading.value = false
    }
  }

  const router = useRouter()

  function ensureMapDetailRoute() {
    if (router.hasRoute('CockpitMapDetail')) return
    router.addRoute({
      path: '/cockpit-map-detail',
      component: () => import('@/views/index/index.vue'),
      children: [
        {
          name: 'CockpitMapDetail',
          path: ':country',
          component: () => import('./map-detail.vue'),
          meta: {
            title: '地区详情',
            isHide: true,
            keepAlive: false,
            roles: ['R_SUPER', 'R_ADMIN']
          }
        }
      ]
    })
  }

  /** 鎮诞鍒颁换鎰忓浗瀹舵椂鏄剧ず tooltip锛氭湁鏁版嵁鍒欐寜收入/娑堣€?鐢ㄦ埛鏄剧ず鎸囨爣锛屾棤鏁版嵁鍒欎粎鏄剧ず鍥芥棗+鍥藉鍚?*/
  function handleMapMouseOver(params: any) {
    if (params?.componentSubType !== 'map' || !params?.name) return
    const country = countryData.value.find((c) => c.nameEn === params.name)
    hoveredCountryNameEn.value = country ? params.name : null
    hoverTooltipHtml.value = country
      ? getHoverTooltipHtml(country)
      : getMinimalHoverTooltipHtml(params.name)
    hoverTooltipX.value = lastMouseX.value
    hoverTooltipY.value = lastMouseY.value
    hoverTooltipVisible.value = true
  }
  /** 榧犳爣绂诲紑鏌愪釜鍦板浘鍖哄煙鏃跺厛闅愯棌锛岃繘鍏ユ柊鍖哄煙鏃?mouseover 浼氬啀鏄剧ず鏂板浗瀹剁殑 tooltip */
  function handleMapMouseOut() {
    hoverTooltipVisible.value = false
    hoveredCountryNameEn.value = null
  }
  /** 榧犳爣绂诲紑鏁翠釜鍥捐〃鏃堕殣钘忔偓娴?tooltip */
  function handleMapGlobalOut() {
    hoverTooltipVisible.value = false
    hoveredCountryNameEn.value = null
  }
  function resetHoverTooltip() {
    hoverTooltipVisible.value = false
    hoveredCountryNameEn.value = null
    hoverTooltipHtml.value = ''
  }
  let pendingMapMove: MouseEvent | null = null
  let mapMoveRaf = 0
  /** 鍦板浘瀹瑰櫒 mousemove锛歳AF 鍚堝苟锛屽噺杞诲皬灞?瑙︽帶涓嬮珮棰戜簨浠跺帇鍔?*/
  function handleMapContainerMouseMove(e: MouseEvent) {
    pendingMapMove = e
    if (mapMoveRaf) return
    mapMoveRaf = requestAnimationFrame(() => {
      mapMoveRaf = 0
      const ev = pendingMapMove
      pendingMapMove = null
      if (!ev) return
      const offset = 12
      lastMouseX.value = ev.clientX + offset
      lastMouseY.value = ev.clientY + offset
      if (hoverTooltipVisible.value) {
        hoverTooltipX.value = ev.clientX + offset
        hoverTooltipY.value = ev.clientY + offset
      }
    })
  }
  /** 鐐瑰嚮鍦板浘鍖哄煙鏃讹紝鑻ヨ鍥藉涓嶅湪鏁版嵁涓垯闅愯棌 tooltip锛屼娇鐐瑰嚮鏄剧ず tooltip 涓嶇敓鏁堬紱骞堕殣钘忔偓娴?tooltip */
  function handleMapItemClick(params: any) {
    resetHoverTooltip()
    const namesWithData = new Set(countryData.value.map((c) => c.nameEn))
    if (!params?.name || !namesWithData.has(params.name)) {
      getChartInstance()?.dispatchAction({ type: 'hideTip' })
    }
  }
  /** 鐐瑰嚮 tooltip 鍐呫€屾煡鐪嬭鎯呫€嶆椂璺宠浆鍦板尯详情椤?*/
  function handleTooltipLinkClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('.cockpit-map-tt-link')
    if (!link) return
    e.preventDefault()
    resetHoverTooltip()
    getChartInstance()?.dispatchAction({ type: 'hideTip' })
    const countryCode = link.getAttribute('data-country-code') ?? ''
    if (countryCode) {
      ensureMapDetailRoute()
      router.push({ name: 'CockpitMapDetail', params: { country: countryCode } })
    }
  }

  onBeforeRouteLeave(() => {
    resetHoverTooltip()
    getChartInstance()?.dispatchAction({ type: 'hideTip' })
  })

  onDeactivated(() => {
    resetHoverTooltip()
    getChartInstance()?.dispatchAction({ type: 'hideTip' })
  })

  onMounted(() => {
    initWorldMap()
  })

  /** 鍦ㄥ嵏杞藉墠鏈熼噴鏀惧湴鍥句笌 RAF锛屽噺杞荤椹鹃┒鑸辨椂涓庝笅涓€椤垫寕杞藉彔鍦ㄥ悓涓€娈典富绾跨▼涓婄殑鍘嬪姏 */
  onBeforeUnmount(() => {
    resetHoverTooltip()
    if (mapMoveRaf) {
      cancelAnimationFrame(mapMoveRaf)
      mapMoveRaf = 0
      pendingMapMove = null
    }
    if (mapResizeRaf) {
      cancelAnimationFrame(mapResizeRaf)
      mapResizeRaf = 0
    }
    mapResizeObserver?.disconnect()
    mapResizeObserver = null
    if (mapChartRef.value) {
      mapChartRef.value.removeEventListener('click', handleTooltipLinkClick)
      mapChartRef.value.removeEventListener('mousemove', handleMapContainerMouseMove)
    }
    destroyChart()
  })
</script>

<style scoped lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as *;

  @property --map-kpi-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .cockpit-map-kpi {
    --map-accent: #59c7ff;
    --map-accent-2: #24e3ff;
    --map-glow: rgb(89 199 255 / 10%);
    --map-glow-2: rgb(36 227 255 / 6%);
    --map-spin-a: rgb(89 199 255 / 16%);
    --map-spin-b: rgb(36 227 255 / 12%);
    --map-spin-c: rgb(103 232 249 / 9%);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% -8%, rgb(255 255 255 / 3.2%), transparent 28%),
      radial-gradient(circle at 16% 22%, rgb(89 199 255 / 5.5%), transparent 22%),
      radial-gradient(circle at 84% 16%, rgb(36 227 255 / 3.5%), transparent 18%),
      linear-gradient(180deg, rgb(255 255 255 / 3%) 0%, transparent 12%),
      linear-gradient(180deg, rgb(6 11 22 / 96%) 0%, rgb(6 11 24 / 94%) 52%, rgb(4 8 18 / 97%) 100%);
    backdrop-filter: blur(16px) saturate(118%);
    border: 1px solid rgb(96 165 250 / 16%);
    border-radius: 18px;
    box-shadow:
      0 18px 40px rgb(2 6 23 / 34%),
      0 0 0 1px rgb(96 165 250 / 6%),
      inset 0 1px 0 rgb(255 255 255 / 6%),
      inset 0 0 0 1px rgb(255 255 255 / 2%),
      inset 0 -18px 34px rgb(0 0 0 / 18%),
      0 0 36px rgb(59 130 246 / 6%);
    transition:
      box-shadow 0.3s var(--ease-out),
      border-color 0.28s var(--ease-default),
      background 0.28s var(--ease-default);

    > *:not(.map-kpi-border-spin) {
      position: relative;
      z-index: 1;
    }

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background:
        linear-gradient(
          90deg,
          transparent 0%,
          rgb(125 211 252 / 42%) 16%,
          rgb(34 211 238 / 24%) 54%,
          transparent 100%
        ),
        linear-gradient(
          90deg,
          transparent 0%,
          rgb(89 199 255 / 10%) 22%,
          rgb(255 255 255 / 8%) 48%,
          rgb(36 227 255 / 9%) 74%,
          transparent 100%
        ),
        radial-gradient(circle at 74% 72%, rgb(255 255 255 / 2.2%), transparent 14%),
        radial-gradient(circle at 18% 82%, rgb(89 199 255 / 2.5%), transparent 12%),
        linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 2.6%) 50%, transparent 100%),
        linear-gradient(180deg, rgb(255 255 255 / 2.2%) 0%, transparent 10%);
      background-repeat: no-repeat;
      background-position:
        top 0 left 0,
        center,
        center,
        center,
        center;
      background-size:
        100% 1px,
        140% 100%,
        auto,
        auto,
        auto,
        auto;
      opacity: 0.68;
    }

    &::after {
      position: absolute;
      inset: 10px;
      pointer-events: none;
      content: '';
      border: 1px solid rgb(255 255 255 / 5%);
      border-radius: 14px;
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 5%),
        0 0 0 1px rgb(89 199 255 / 4%);
      opacity: 0.38;
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
    }

    .cockpit-map-panel::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        105deg,
        transparent 16%,
        rgb(255 255 255 / 0%) 34%,
        rgb(255 255 255 / 5%) 44%,
        rgb(125 211 252 / 10%) 50%,
        rgb(255 255 255 / 5%) 56%,
        transparent 72%
      );
      background-position: 120% 0;
      background-size: 180% 100%;
      mix-blend-mode: screen;
      opacity: 0;
      transition:
        opacity 0.28s ease,
        background-position 0.75s ease;
    }

    &:hover {
      border-color: rgb(96 165 250 / 22%);
      box-shadow:
        0 22px 48px rgb(2 6 23 / 38%),
        0 0 0 1px rgb(96 165 250 / 10%),
        inset 0 1px 0 rgb(255 255 255 / 6%),
        0 0 44px rgb(59 130 246 / 10%),
        0 0 88px rgb(6 182 212 / 5%);

      &::before {
        opacity: 0.8;
      }

      &::after {
        box-shadow:
          inset 0 1px 0 rgb(255 255 255 / 7%),
          0 0 0 1px rgb(89 199 255 / 7%),
          inset 0 0 26px rgb(89 199 255 / 3%);
        opacity: 0.46;
      }

      .cockpit-map-panel::before {
        background-position: -20% 0;
        opacity: 1;
      }
    }
  }

  .map-kpi-border-spin {
    position: absolute;
    inset: -1px;
    z-index: 0;
    padding: 1px;
    pointer-events: none;
    background: conic-gradient(
      from var(--map-kpi-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--map-spin-a) 52deg,
      transparent 110deg,
      transparent 180deg,
      var(--map-spin-b) 232deg,
      transparent 286deg,
      var(--map-spin-c) 330deg,
      transparent 360deg
    );
    filter: blur(10px);
    border-radius: inherit;
    opacity: 0.24;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: map-kpi-border-spin 14s linear infinite;
  }

  @keyframes map-kpi-border-spin {
    to {
      --map-kpi-border-angle: 360deg;
    }
  }

  html:not(.dark) .cockpit-map-kpi {
    background:
      radial-gradient(circle at 18% 16%, rgb(74 222 128 / 12%), transparent 24%),
      radial-gradient(circle at 82% 20%, rgb(251 146 60 / 12%), transparent 22%),
      linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
    backdrop-filter: blur(14px) saturate(118%);
    border: 1px solid rgb(148 163 184 / 24%);
    box-shadow:
      0 14px 32px rgb(15 23 42 / 10%),
      inset 0 1px 0 rgb(255 255 255 / 85%);

    &::after {
      border-color: rgb(148 163 184 / 16%);
      opacity: 0.75;
    }

    .map-kpi-border-spin {
      opacity: 0.22;
    }
  }

  // html.dark .map-panel-title {
  //   @include ap-title-gradient;
  // }

  .map-panel-title {
    font-size: 14px;
    font-weight: 700;
    color: #e8f2ff;
    text-shadow:
      0 0 10px rgb(125 211 252 / 12%),
      0 0 22px rgb(34 211 238 / 8%);
    letter-spacing: 0.05em;
  }

  html:not(.dark) .map-panel-title {
    color: #0f172a;
  }

  .cockpit-map-kpi :deep(.el-card.cockpit-map-panel) {
    position: relative;
    height: 100%;
    background: transparent !important;
    // border: none !important;
    box-shadow: none !important;
  }

  .cockpit-map-kpi :deep(.el-card__header) {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px 10px;
    background: transparent !important;
    border-bottom: none;
  }

  .cockpit-map-kpi :deep(.el-card__body) {
    display: flex;
    flex: 1;
    padding: 0 12px 12px;
    background: transparent !important;
  }

  .map-metric-box {
    position: relative;
    display: inline-flex;
    padding: 4px;
    background:
      linear-gradient(180deg, rgb(8 15 30 / 94%), rgb(6 11 24 / 92%)),
      radial-gradient(circle at top, rgb(59 130 246 / 9%), transparent 60%);
    border: 1px solid
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent);
    border-radius: 13px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 6%),
      0 10px 24px rgb(0 0 0 / 18%),
      0 0 16px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent);
  }

  html:not(.dark) .map-metric-box {
    background: rgb(255 255 255 / 92%);
    border-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 28%,
      rgb(148 163 184 / 28%)
    );
    box-shadow:
      0 8px 18px rgb(15 23 42 / 8%),
      0 0 12px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 12%, transparent);
  }

  .map-metric-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc((100% - 8px) / 3);
    height: calc(100% - 8px);
    pointer-events: none;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 78%, white 22%) 0%,
      var(--theme-color, var(--art-primary, #3b82f6)) 100%
    );
    border: 1px solid
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 54%, white 22%);
    border-radius: 10px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent),
      0 0 16px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 24%);
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .map-metric-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 56px;
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    color: rgb(203 213 225 / 72%);
    letter-spacing: 0.04em;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9px;
    transition:
      color 0.2s ease,
      text-shadow 0.2s ease;
  }

  .map-metric-btn:hover {
    color: rgb(255 255 255 / 92%);
  }

  .map-metric-btn.active {
    color: #fff;
    text-shadow: 0 0 10px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 22%, transparent);
  }

  html:not(.dark) .map-metric-btn {
    color: #475569;
  }

  html:not(.dark) .map-metric-btn:hover,
  html:not(.dark) .map-metric-btn.active {
    color: #fff;
  }

  .cockpit-map-panel--dark {
    .map-legend {
      color: #94a3b8;
    }
  }

  .map-wrap {
    position: relative;
    flex: 1;
    height: 100%;
    min-height: clamp(360px, 58vh, 580px);
    background:
      radial-gradient(circle at 50% 110%, rgb(255 163 77 / 6%), transparent 28%),
      radial-gradient(circle at 18% 38%, rgb(67 157 255 / 7%), transparent 24%),
      radial-gradient(circle at 82% 42%, rgb(42 112 255 / 5%), transparent 22%),
      linear-gradient(
        180deg,
        rgb(3 8 18 / 98%) 0%,
        rgb(4 10 21 / 96%) 52%,
        rgb(3 7 16 / 100%) 100%
      ),
      url('@/assets/images/draw/2.webp') center 100% / cover no-repeat,
      linear-gradient(180deg, rgb(7 12 22 / 98%) 0%, rgb(5 8 16 / 100%) 100%);
    isolation: isolate;
    border: 1px solid rgb(96 165 250 / 11%);
    border-radius: 16px;
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 5%),
      inset 0 0 0 1px rgb(255 255 255 / 2%),
      0 16px 36px rgb(2 6 23 / 24%);
    contain: paint;

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(circle at 76% 56%, rgb(255 235 179 / 4%), transparent 16%),
        radial-gradient(circle at 28% 78%, rgb(255 173 94 / 4%), transparent 16%),
        radial-gradient(circle at 50% 30%, rgb(255 255 255 / 3.2%), transparent 18%),
        radial-gradient(circle at 22% 34%, rgb(255 255 255 / 3.6%) 0 1px, transparent 2px),
        radial-gradient(circle at 71% 42%, rgb(255 216 150 / 3.8%) 0 1px, transparent 2px),
        radial-gradient(circle at 64% 64%, rgb(255 255 255 / 3.2%) 0 1px, transparent 2px),
        linear-gradient(rgb(148 163 184 / 6.5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(148 163 184 / 6.5%) 1px, transparent 1px);
      background-size:
        auto,
        auto,
        auto,
        180px 180px,
        220px 220px,
        200px 200px,
        42px 42px,
        42px 42px;
      opacity: 0.76;
      mask-image: linear-gradient(to bottom, rgb(255 255 255 / 86%), rgb(255 255 255 / 72%));
    }

    &::after {
      position: absolute;
      inset: 12px;
      pointer-events: none;
      content: '';
      border: 1px solid rgb(255 255 255 / 3%);
      border-radius: 14px;
      opacity: 0.18;
    }
  }

  .map-wrap :deep(canvas) {
    position: relative;
    z-index: 2;
  }

  .map-wrap::before,
  .map-wrap::after {
    z-index: 0;
  }

  .map-wrap > * {
    position: relative;
    z-index: 2;
  }

  .map-wrap > .map-chart::after {
    position: absolute;
    inset: auto auto 10% 12%;
    z-index: 0;
    width: 28%;
    height: 18%;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(circle at 30% 50%, rgb(89 199 255 / 8%), transparent 52%),
      linear-gradient(90deg, transparent, rgb(255 255 255 / 3%), transparent);
    filter: blur(24px);
    opacity: 0.18;
  }

  .map-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(360px, 55vh, 560px);
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .map-chart {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: clamp(360px, 58vh, 580px);
    will-change: transform;

    @media (width <= 992px) {
      min-height: clamp(320px, 50vh, 480px);
      will-change: auto;
    }
  }

  .cockpit-map-hover-tt {
    position: fixed;
    z-index: 2000;
    min-width: 132px;
    padding: 0;
    font-size: 12px;
    line-height: 1.4;
    color: #e2e8f0;
    pointer-events: none;
    background: transparent;
    border: none;
    border-radius: 14px;
    box-shadow: none;

    &.cockpit-map-hover-tt--dark {
      color: #e2e8f0;
    }
  }

  .map-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--el-text-color-regular);

    .legend-item {
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }

  @media (width <= 992px) {
    .cockpit-map-kpi :deep(.el-card__header) {
      flex-direction: column;
      align-items: flex-start;
      padding-bottom: 8px;
    }

    .map-metric-box {
      align-self: stretch;
      width: 100%;
    }

    .map-metric-btn {
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .map-kpi-border-spin {
      opacity: 0;
      animation: none;
    }

    .cockpit-map-kpi {
      transition: none;
    }
  }
</style>

<style lang="scss">
  .cockpit-map-hover-card,
  .cockpit-map-detail-card {
    position: relative;
    min-width: 148px;
    padding: 12px 14px;
    color: #e2e8f0;
    background: linear-gradient(180deg, rgb(31 38 46 / 94%) 0%, rgb(17 22 28 / 98%) 100%);
    border: 1px solid rgb(96 165 250 / 24%);
    border-radius: 14px;
    box-shadow:
      0 18px 42px rgb(0 0 0 / 46%),
      0 0 0 1px rgb(96 165 250 / 10%),
      inset 0 1px 0 rgb(255 255 255 / 5%),
      0 0 42px rgb(59 130 246 / 12%);
  }

  .cockpit-map-hover-card::after,
  .cockpit-map-detail-card::after {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background:
      linear-gradient(
        90deg,
        transparent 0%,
        rgb(125 211 252 / 28%) 18%,
        rgb(34 211 238 / 16%) 56%,
        transparent 100%
      ),
      linear-gradient(180deg, rgb(255 255 255 / 3%) 0%, transparent 32%);
    background-repeat: no-repeat;
    background-position:
      top left,
      center;
    background-size:
      100% 1px,
      auto;
    border-radius: inherit;
  }

  .cockpit-map-hover-card--minimal {
    min-width: 108px;
    padding: 10px 12px;
  }

  .cockpit-map-detail-card {
    min-width: 220px;
    padding: 14px 16px;
    backdrop-filter: blur(12px);
  }

  .cockpit-map-tt-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 700;
    color: #f8fafc;
    text-shadow:
      0 0 10px rgb(125 211 252 / 16%),
      0 0 18px rgb(34 211 238 / 8%);
    letter-spacing: 0.01em;
  }

  .cockpit-map-tt-flag.fi {
    display: inline-block;
    width: 1.25em;
    min-width: 20px;
    height: 0.9em;
    min-height: 14px;
    overflow: hidden;
    vertical-align: middle;
    background-size: cover;
    border-radius: 2px;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 10%);
  }

  .cockpit-map-tt-row {
    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;
    white-space: nowrap;

    span:first-child {
      color: #94a3b8;
    }

    span:last-child {
      font-weight: 600;
      color: #f8fafc;
      text-align: right;
    }
  }

  .cockpit-map-tt-link {
    padding-top: 10px;
    margin-top: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #7dd3fc;
    cursor: pointer;
    border-top: 1px solid rgb(148 163 184 / 14%);
  }

  html.dark .cockpit-map-kpi:has(.map-chart:active),
  html:not(.dark) .cockpit-map-kpi:has(.map-chart:active) {
    transition: none;
    transform: none;
  }
</style>
