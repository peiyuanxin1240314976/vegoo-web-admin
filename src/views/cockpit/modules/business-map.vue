<template>
  <ElCard
    class="cockpit-panel cockpit-map-panel"
    :class="{ 'cockpit-map-panel--dark': isDark }"
    shadow="never"
  >
    <template #header>
      <span>业务分布地图</span>
      <ElRadioGroup v-model="mapMetric" size="small" class="map-metric-tabs">
        <ElRadioButton label="revenue">收入</ElRadioButton>
        <ElRadioButton label="spend">消耗</ElRadioButton>
        <ElRadioButton label="user">用户</ElRadioButton>
      </ElRadioGroup>
    </template>
    <div v-loading="mapLoading" class="map-wrap">
      <div ref="mapChartRef" class="map-chart"></div>
    </div>
    <!-- <div class="map-legend">
      <div v-for="r in regionList" :key="r.name" class="legend-item">
        <span class="dot" :style="{ background: r.color }"></span>
        <span>{{ r.name }}（{{ r.value }} {{ r.trend }}）</span>
      </div>
    </div> -->
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { CockpitMapCountry, CockpitMapLegendItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'
  import 'flag-icons/css/flag-icons.min.css'

  defineOptions({ name: 'CockpitBusinessMap' })

  // 使用 base 路径，打包部署到子路径（如 /admin/）时也能正确加载
  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`

  /** 国家/地区英文名 → ISO 3166-1 alpha-2（与 world.json GeoJSON 的 name 字段一致，覆盖全部地图区域以显示国旗） */
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
    "Côte d'Ivoire": 'CI',
    Croatia: 'HR',
    Cuba: 'CU',
    Curaçao: 'CW',
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
    'São Tomé and Príncipe': 'ST',
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
    props.mapCountries.length ? props.mapCountries : MOCK_COCKPIT_OVERVIEW.mapCountries
  )
  // const regionList = computed(() =>
  //   props.mapLegend.length ? props.mapLegend : MOCK_COCKPIT_OVERVIEW.mapLegend
  // )

  const mapChartRef = ref<HTMLElement | null>(null)
  const mapLoading = ref(true)
  const mapMetric = ref<'revenue' | 'spend' | 'user'>('revenue')
  const { chartRef, initChart, updateChart, destroyChart } = useChart()

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

  /** 解析趋势字符串，返回是否为正（用于显示 ↑ 绿色 / ↓ 红色） */
  function isTrendUp(trend: string | undefined): boolean {
    if (!trend) return true
    return trend.startsWith('+') || !trend.includes('-')
  }

  function fmtValue(v: number, isK = false): string {
    if (v >= 1000) return `${(v / 1000).toFixed(2)}M`
    return isK ? `${v}K` : v.toLocaleString()
  }

  /** 根据国家英文名解析 ISO 代码（与 GeoJSON 常用名称对齐） */
  function getCountryCode(nameEn: string): string {
    const code = COUNTRY_NAME_TO_ISO[nameEn]
    if (code) return code
    // 尝试去掉 "of X" 等后缀再匹配
    const key = Object.keys(COUNTRY_NAME_TO_ISO).find(
      (k) => k.startsWith(nameEn) || nameEn.startsWith(k)
    )
    return key ? COUNTRY_NAME_TO_ISO[key] : ''
  }

  function buildTooltipFormatter(isDarkTheme: boolean) {
    return (params: any) => {
      const d = params.data
      if (!d) return params.name
      const upClass = isDarkTheme ? 'color:#34d399' : 'color:var(--el-color-success)'
      const downClass = isDarkTheme ? 'color:#f87171' : 'color:var(--el-color-danger)'
      const revenueUp = isTrendUp(d.trend)
      const newUserTrend = d.newUserTrend ?? d.trend
      const ecpmTrend = d.ecpmTrend ?? d.trend
      const revArrow = revenueUp ? `↑${d.trend}` : `↓${d.trend}`
      const spendVal = d.spend ?? 0
      const spendTrend = spendVal > 500 ? '↓-5%' : `↑${d.trend}`
      const spendUp = isTrendUp(spendTrend)
      const newUserStr =
        d.newUser != null
          ? `${d.newUser.toLocaleString()} ${isTrendUp(newUserTrend) ? '↑' : '↓'}${newUserTrend}`
          : `${(d.user ?? 0).toLocaleString()} ↑${d.trend}`
      const ecpmStr =
        d.ecpm != null ? `$${d.ecpm} ${isTrendUp(ecpmTrend) ? '↑' : '↓'}${ecpmTrend}` : ''
      const isoCodeRaw = d.code || getCountryCode(params.name) || ''
      const isoCode = isoCodeRaw.toLowerCase()
      const hasFlag = /^[a-z]{2}$/.test(isoCode)
      const titleHtml = hasFlag
        ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag fi fi-${isoCode}"></span> ${d.nameCn || params.name}</div>`
        : `<div class="cockpit-map-tt-title">${d.nameCn || params.name}</div>`
      const lines = [
        titleHtml,
        `<div class="cockpit-map-tt-row"><span>收入:</span> <span style="${revenueUp ? upClass : downClass}">$${fmtValue(d.revenue, true)} ${revArrow}</span></div>`,
        `<div class="cockpit-map-tt-row"><span>广告支出:</span> <span style="${spendUp ? upClass : downClass}">$${fmtValue(spendVal, true)} ${spendTrend}</span></div>`,
        `<div class="cockpit-map-tt-row"><span>活跃用户:</span> <span style="${upClass}">${(d.user ?? 0).toLocaleString()} ↑${d.trend}</span></div>`,
        d.newUser != null
          ? `<div class="cockpit-map-tt-row"><span>新增用户:</span> <span style="${upClass}">${newUserStr}</span></div>`
          : '',
        ecpmStr
          ? `<div class="cockpit-map-tt-row"><span>eCPM:</span> <span style="${upClass}">${ecpmStr}</span></div>`
          : '',
        `<div class="cockpit-map-tt-link" data-country-code="${(isoCodeRaw || '').replace(/"/g, '&quot;')}" data-country-en="${(d.name || params.name || '').replace(/"/g, '&quot;')}" data-country-cn="${(d.nameCn || params.name || '').replace(/"/g, '&quot;')}">查看${d.nameCn || params.name}详情 →</div>`
      ].filter(Boolean)
      return lines.join('')
    }
  }

  function buildOption(): EChartsOption {
    const dark = isDark.value
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

    // 深色模式：低值端用较亮色避免“全黑”；浅色模式：边框更浅、低值/无数据区域更亮，避免发黑
    const visualMapColors = dark
      ? ['#f87171', '#fbbf24', '#34d399'] // 亮红→琥珀→翠绿
      : ['#fecaca', '#fde047', '#86efac'] // 浅粉红→浅黄→浅绿，低值更亮

    const unhighlightedArea = dark ? 'rgba(71,85,105,0.75)' : '#f1f5f9'
    const borderColor = dark ? 'rgba(100,116,139,0.65)' : 'rgba(0,0,0,0.12)'
    const emphasisArea = dark ? 'rgba(52,211,153,0.35)' : 'var(--el-color-primary-light-5)'
    const emphasisBorder = dark ? 'rgba(52,211,153,0.8)' : 'var(--el-color-primary)'
    const emphasisShadow = dark ? 'rgba(52,211,153,0.35)' : 'rgba(0,0,0,0.15)'

    return {
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        triggerOn: 'click', // 改为点击显示，避免悬浮时盖住邻国误触
        confine: true,
        enterable: true, // 允许鼠标移入 tooltip，便于点击「查看详情」
        transitionDuration: 0.2,
        backgroundColor: dark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.98)',
        borderColor: dark ? 'rgba(71,85,105,0.6)' : 'var(--el-border-color-lighter)',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          fontSize: 12,
          color: dark ? '#e2e8f0' : 'var(--el-text-color-primary)'
        },
        formatter: buildTooltipFormatter(dark)
      },
      visualMap: {
        type: 'continuous',
        min: mapData.length ? Math.min(...mapData.map((d) => d.value)) : 0,
        max: mapData.length ? Math.max(...mapData.map((d) => d.value)) : 100,
        text: ['高', '低'],
        realtime: false,
        calculable: true,
        inRange: { color: visualMapColors },
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
          roam: true,
          zoom: 1.15,
          scaleLimit: { min: 0.6, max: 4 },
          name: '业务分布',
          data: mapData,
          itemStyle: {
            areaColor: unhighlightedArea,
            borderColor,
            borderWidth: 0.9
          },
          emphasis: {
            itemStyle: {
              areaColor: emphasisArea,
              borderColor: emphasisBorder,
              borderWidth: 1.4,
              shadowBlur: dark ? 18 : 12,
              shadowColor: emphasisShadow
            },
            label: {
              show: true,
              color: dark ? '#f1f5f9' : '#1f2937',
              fontSize: 11,
              fontWeight: 600
            }
          },
          select: {
            itemStyle: { areaColor: emphasisArea },
            label: { show: true }
          },
          label: { show: false }
        }
      ]
    }
  }

  watch(mapMetric, () => updateChart(buildOption()))
  watch(isDark, () => updateChart(buildOption()))

  async function initWorldMap() {
    if (!mapChartRef.value) return
    try {
      const res = await fetch(WORLD_JSON_URL)
      const worldJson = await res.json()
      echarts.registerMap('world', worldJson)
      ;(chartRef as { value: HTMLElement | null }).value = mapChartRef.value
      nextTick(() => {
        initChart(buildOption())
        mapLoading.value = false
      })
    } catch (e) {
      console.error('[Cockpit] 世界地图 GeoJSON 加载失败', e)
      mapLoading.value = false
    }
  }

  const router = useRouter()
  /** 点击 tooltip 内「查看详情」时跳转地区详情页 */
  function handleTooltipLinkClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('.cockpit-map-tt-link')
    if (!link) return
    e.preventDefault()
    const countryCode = link.getAttribute('data-country-code') ?? ''
    if (countryCode) {
      router.push({ name: 'CockpitMapDetail', params: { country: countryCode } })
    }
  }

  onMounted(() => {
    initWorldMap()
    const el = mapChartRef.value
    if (el) el.addEventListener('click', handleTooltipLinkClick)
  })

  onUnmounted(() => {
    const el = mapChartRef.value
    if (el) el.removeEventListener('click', handleTooltipLinkClick)
    destroyChart()
  })
</script>

<style scoped lang="scss">
  .cockpit-map-panel {
    height: 100%;

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .map-metric-tabs {
    :deep(.el-radio-button__inner) {
      margin-left: 4px;
      border-radius: 6px;
    }

    :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
      color: #fff;
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
    }
  }

  .cockpit-map-panel--dark {
    .map-metric-tabs {
      :deep(.el-radio-button__inner) {
        color: #cbd5e1;
        background: rgb(51 65 85 / 80%);
        border-color: rgb(71 85 105 / 60%);
      }

      :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
        color: #fff;
        background: rgb(59 130 246 / 90%);
        border-color: rgb(96 165 250 / 80%);
      }
    }

    .map-legend {
      color: #94a3b8;
    }
  }

  .map-wrap {
    position: relative;
    min-height: 500px;
  }

  .map-chart {
    width: 100%;
    height: 500px;
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
</style>

<style lang="scss">
  /* 地图 tooltip 全局样式（渲染在 body，需非 scoped） */
  .cockpit-map-tt-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
  }

  .cockpit-map-tt-flag.fi {
    display: inline-block;
    width: 1.25em;
    min-width: 20px;
    height: 0.9em;
    min-height: 14px;
    vertical-align: middle;
    background-size: cover;
  }

  .cockpit-map-tt-row {
    margin-bottom: 4px;

    span:first-child {
      margin-right: 6px;
    }
  }

  .cockpit-map-tt-link {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-color-primary);
    cursor: pointer;
  }
</style>
