<template>
  <ElCard
    class="cockpit-panel cockpit-map-panel"
    :class="{ 'cockpit-map-panel--dark': isDark }"
    shadow="never"
  >
    <template #header>
      <span>业务分布地图</span>
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
      <template v-if="countryData.length">
        <div ref="mapChartRef" class="map-chart"></div>
      </template>
      <div v-else class="map-empty">暂无数据</div>
    </div>
    <!-- <div class="map-legend">
      <div v-for="r in regionList" :key="r.name" class="legend-item">
        <span class="dot" :style="{ background: r.color }"></span>
        <span>{{ r.name }}（{{ r.value }} {{ r.trend }}）</span>
      </div>
    </div> -->
  </ElCard>
  <!-- 悬浮 tooltip：Teleport 到 body，避免父卡片 transform/overflow:hidden 导致定位失效或被裁切 -->
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
    Array.isArray(props.mapCountries) ? props.mapCountries : MOCK_COCKPIT_OVERVIEW.mapCountries
  )
  // const regionList = computed(() =>
  //   props.mapLegend.length ? props.mapLegend : MOCK_COCKPIT_OVERVIEW.mapLegend
  // )

  const mapChartRef = ref<HTMLElement | null>(null)
  const mapLoading = ref(true)
  const mapMetric = ref<'revenue' | 'spend' | 'user'>('revenue')
  const { chartRef, initChart, updateChart, destroyChart, getChartInstance } = useChart()
  const geoCoordMap = ref<Record<string, [number, number]>>({})

  /** 悬浮 tooltip：仅在有数据国家显示，按收入/消耗/用户切换内容 */
  const hoverTooltipVisible = ref(false)
  const hoverTooltipX = ref(0)
  const hoverTooltipY = ref(0)
  const hoverTooltipHtml = ref('')
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)
  /** 当前悬浮的国家名（用于切换收入/消耗/用户时刷新悬浮 tooltip 内容） */
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

  /** 无数据国家悬浮时只显示国旗+国家名（使用 GeoJSON 英文名） */
  function getMinimalHoverTooltipHtml(nameEn: string): string {
    const isoCode = getCountryCode(nameEn).toLowerCase()
    const hasFlag = /^[a-z]{2}$/.test(isoCode)
    const title = hasFlag
      ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag fi fi-${isoCode}"></span> ${nameEn}</div>`
      : `<div class="cockpit-map-tt-title">${nameEn}</div>`
    return title
  }

  /** 悬浮 tooltip 内容：第一排国旗+中文名，第二/三排按收入/消耗/用户按钮切换 */
  function getHoverTooltipHtml(c: CockpitMapCountry): string {
    const isoCode = (c.code || getCountryCode(c.nameEn) || '').toLowerCase()
    const hasFlag = /^[a-z]{2}$/.test(isoCode)
    const title = hasFlag
      ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag fi fi-${isoCode}"></span> ${c.name}</div>`
      : `<div class="cockpit-map-tt-title">${c.name}</div>`
    const upClass = isDark.value ? 'color:#34d399' : 'color:var(--el-color-success)'
    const downClass = isDark.value ? 'color:#f87171' : 'color:var(--el-color-danger)'
    if (mapMetric.value === 'revenue') {
      const up = isTrendUp(c.trend)
      return `${title}<div class="cockpit-map-tt-row"><span>收入:</span> <span style="${up ? upClass : downClass}">$${fmtValue(c.revenue, true)} ${c.trend}</span></div>`
    }
    if (mapMetric.value === 'spend') {
      const spendTrend = c.spendTrend ?? c.trend
      const up = isTrendUp(spendTrend)
      return `${title}<div class="cockpit-map-tt-row"><span>广告支出:</span> <span style="${up ? upClass : downClass}">$${fmtValue(c.spend, true)} ${spendTrend}</span></div>`
    }
    // 用户：第二排新增用户+变化，第三排活跃用户+变化
    const newUserTrend = c.newUserTrend ?? c.trend
    const userTrendVal = c.userTrend ?? c.trend
    return `${title}<div class="cockpit-map-tt-row"><span>新增用户:</span> <span style="${isTrendUp(newUserTrend) ? upClass : downClass}">${(c.newUser ?? 0).toLocaleString()} ${newUserTrend}</span></div><div class="cockpit-map-tt-row"><span>活跃用户:</span> <span style="${isTrendUp(userTrendVal) ? upClass : downClass}">${(c.user ?? 0).toLocaleString()} ${userTrendVal}</span></div>`
  }

  /** 仅当区域名称在有数据的国家集合中时才显示 tooltip */
  function buildTooltipFormatter(isDarkTheme: boolean, regionNamesWithData: Set<string>) {
    return (params: any) => {
      if (!regionNamesWithData.has(params.name)) {
        return '' // 数据中无此国家时不显示 tooltip
      }
      const d = params.data
      if (!d) return ''
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

    const dataValues = mapData.map((d) => d.value).filter((v) => Number.isFinite(v))
    const dataMin = dataValues.length ? Math.min(...dataValues) : 0
    const dataMax = dataValues.length ? Math.max(...dataValues) : 100
    const hasPositive = dataMax > 0
    const visualMin = hasPositive && dataMin >= 0 ? 0.5 : dataMin
    const visualMax = dataMax
    const regionNamesWithData = new Set(mapData.map((d) => d.name))
    const pulseData = mapData
      .map((d) => {
        const coord = geoCoordMap.value[d.name]
        if (!coord) return null
        const metricValue = Number(d.value ?? 0)
        if (!Number.isFinite(metricValue) || metricValue <= 0) return null
        return {
          name: d.name,
          value: [...coord, metricValue]
        }
      })
      .filter(Boolean)
      .sort((a, b) => Number((b as any).value[2]) - Number((a as any).value[2]))
      .slice(0, 6) as Array<{ name: string; value: [number, number, number] }>

    return {
      animation: true,
      animationDuration: 900,
      animationEasing: 'quarticOut',
      animationDurationUpdate: 650,
      animationEasingUpdate: 'quarticInOut',
      geo: {
        map: 'world',
        roam: true,
        zoom: 1.15,
        scaleLimit: { min: 0.6, max: 4 },
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
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'click', // 改为点击显示，避免悬浮时盖住邻国误触
        confine: true,
        enterable: true, // 允许鼠标移入 tooltip，便于点击「查看详情」（仅在有数据的国家显示链接）
        transitionDuration: 0.2,
        backgroundColor: dark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.98)',
        borderColor: dark ? 'rgba(71,85,105,0.6)' : 'var(--el-border-color-lighter)',
        borderWidth: 1,
        padding: [12, 16],
        textStyle: {
          fontSize: 12,
          color: dark ? '#e2e8f0' : 'var(--el-text-color-primary)'
        },
        formatter: buildTooltipFormatter(dark, regionNamesWithData)
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
        },
        {
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 3,
          symbolSize: (val: number[]) => Math.max(4, Math.min(10, Number(val[2] ?? 0) * 0.8)),
          rippleEffect: {
            period: 4,
            scale: 2.2,
            brushType: 'stroke'
          },
          showEffectOn: 'render',
          itemStyle: {
            color: '#ffd166',
            opacity: 0.75,
            shadowBlur: 8,
            shadowColor: 'rgb(255 209 102 / 35%)'
          },
          emphasis: {
            scale: true
          },
          data: pulseData
        },
        {
          type: 'scatter',
          coordinateSystem: 'geo',
          zlevel: 2,
          symbolSize: 2,
          itemStyle: {
            color: '#7dd3fc',
            opacity: 0.55
          },
          silent: true,
          data: pulseData.map((d) => ({
            name: d.name,
            value: d.value
          }))
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

  /** 父组件 overview 异步加载，首次 onMounted 时 mapChartRef 可能尚未渲染（countryData 为空）；数据到达后再初始化 */
  watch(
    () => countryData.value.length,
    (len) => {
      if (len > 0) nextTick(initWorldMap)
    }
  )

  let mapInitialized = false
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
          mapInitialized = true
        }
      })
    } catch (e) {
      console.error('[Cockpit] 世界地图 GeoJSON 加载失败', e)
      mapLoading.value = false
    }
  }

  const router = useRouter()
  /** 悬浮到任意国家时显示 tooltip：有数据则按收入/消耗/用户显示指标，无数据则仅显示国旗+国家名 */
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
  /** 鼠标离开某个地图区域时先隐藏，进入新区域时 mouseover 会再显示新国家的 tooltip */
  function handleMapMouseOut() {
    hoverTooltipVisible.value = false
    hoveredCountryNameEn.value = null
  }
  /** 鼠标离开整个图表时隐藏悬浮 tooltip */
  function handleMapGlobalOut() {
    hoverTooltipVisible.value = false
    hoveredCountryNameEn.value = null
  }
  /** 地图容器 mousemove：更新鼠标位置，悬浮 tooltip 显示时跟随 */
  function handleMapContainerMouseMove(e: MouseEvent) {
    const offset = 12
    lastMouseX.value = e.clientX + offset
    lastMouseY.value = e.clientY + offset
    if (hoverTooltipVisible.value) {
      hoverTooltipX.value = e.clientX + offset
      hoverTooltipY.value = e.clientY + offset
    }
  }
  /** 点击地图区域时，若该国家不在数据中则隐藏 tooltip，使点击显示 tooltip 不生效；并隐藏悬浮 tooltip */
  function handleMapItemClick(params: any) {
    hoverTooltipVisible.value = false
    const namesWithData = new Set(countryData.value.map((c) => c.nameEn))
    if (!params?.name || !namesWithData.has(params.name)) {
      getChartInstance()?.dispatchAction({ type: 'hideTip' })
    }
  }
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
  })

  onUnmounted(() => {
    if (mapChartRef.value) {
      mapChartRef.value.removeEventListener('click', handleTooltipLinkClick)
      mapChartRef.value.removeEventListener('mousemove', handleMapContainerMouseMove)
    }
    destroyChart()
  })
</script>

<style scoped lang="scss">
  .cockpit-map-panel {
    height: 100%;
    border-radius: 10px;

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 5px 15px;
    }

    :deep(.el-card__body) {
      padding: 5px;
    }
  }

  .map-metric-box {
    position: relative;
    display: inline-flex;
    padding: 3px;
    // background: var(--el-fill-color-light);
    // border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .map-metric-slider {
    position: absolute;
    top: 3px;
    left: 3px;
    width: calc((100% - 6px) / 3);
    height: calc(100% - 6px);
    pointer-events: none;
    background: var(--el-color-primary);
    border-radius: 6px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .map-metric-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 52px;
    padding: 6px 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background: transparent;
    border: none;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    transition: color 0.2s ease;

    &:hover {
      color: var(--el-text-color-primary);
    }
    // margin-right: 2px;

    &.active {
      color: #fff;
      border-width: 0;
    }
  }

  .cockpit-map-panel--dark {
    .map-metric-slider {
      background: rgb(59 130 246 / 90%);
    }

    .map-metric-btn {
      color: #cbd5e1;

      &:hover {
        color: #f1f5f9;
      }

      &.active {
        color: #fff;
      }
    }

    .map-legend {
      color: #94a3b8;
    }
  }

  .map-wrap {
    position: relative;
    min-height: 470px;
  }

  .map-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 470px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .map-chart {
    width: 100%;
    height: 470px;
  }

  .cockpit-map-hover-tt {
    position: fixed;
    z-index: 2000;
    min-width: 140px;
    padding: 10px 14px;
    font-size: 12px;
    line-height: 1.4;
    pointer-events: none;
    background: rgb(255 255 255 / 98%);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);

    &.cockpit-map-hover-tt--dark {
      color: #e2e8f0;
      background: rgb(30 41 59 / 95%);
      border-color: rgb(71 85 105 / 60%);
      box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
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

  /*
   * 点击地图区域时，阻止父卡片 :active 伪类触发 ap-panel-hover 的抖动动画。
   * 使用 :has() 检测点击目标是否在 .map-chart 内，若是则将 transform 锁定在悬浮位置，
   * 仅点击地图外区域（如 Header 按钮）才允许触发 :active 效果。
   */
  html.dark .cockpit-map-panel:has(.map-chart:active) {
    transition: none;
    transform: translateY(-6px);
  }

  html:not(.dark) .cockpit-map-panel:has(.map-chart:active) {
    transition: none;
    transform: translateY(-4px);
  }
</style>
