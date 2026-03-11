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
    <div class="map-legend">
      <div v-for="r in regionList" :key="r.name" class="legend-item">
        <span class="dot" :style="{ background: r.color }"></span>
        <span>{{ r.name }}（{{ r.value }} {{ r.trend }}）</span>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useSettingStore } from '@/store/modules/setting'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { CockpitMapCountry, CockpitMapLegendItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitBusinessMap' })

  // 使用 base 路径，打包部署到子路径（如 /admin/）时也能正确加载
  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`

  /** 国家英文名 → ISO 3166-1 alpha-2（与常见 GeoJSON 名称一致，便于 tooltip 显示国旗） */
  const COUNTRY_NAME_TO_ISO: Record<string, string> = {
    'United States of America': 'US',
    'United States': 'US',
    Brazil: 'BR',
    Japan: 'JP',
    India: 'IN',
    Australia: 'AU',
    'United Kingdom': 'GB',
    Germany: 'DE',
    France: 'FR',
    China: 'CN',
    Canada: 'CA',
    Mexico: 'MX',
    Russia: 'RU',
    'South Korea': 'KR',
    Korea: 'KR',
    Italy: 'IT',
    Spain: 'ES',
    Indonesia: 'ID',
    Turkey: 'TR',
    Netherlands: 'NL',
    Vietnam: 'VN',
    Thailand: 'TH',
    Philippines: 'PH',
    Malaysia: 'MY',
    Singapore: 'SG',
    'South Africa': 'ZA',
    Egypt: 'EG',
    Nigeria: 'NG',
    Argentina: 'AR',
    Chile: 'CL',
    Colombia: 'CO',
    Poland: 'PL',
    'Saudi Arabia': 'SA',
    'United Arab Emirates': 'AE',
    Pakistan: 'PK',
    Bangladesh: 'BD',
    Taiwan: 'TW',
    'Hong Kong': 'HK',
    'New Zealand': 'NZ',
    Sweden: 'SE',
    Norway: 'NO',
    Switzerland: 'CH',
    Belgium: 'BE',
    Austria: 'AT',
    Israel: 'IL',
    Ukraine: 'UA',
    Romania: 'RO',
    'Czech Republic': 'CZ',
    Greece: 'GR',
    Portugal: 'PT',
    Ireland: 'IE',
    Denmark: 'DK',
    Finland: 'FI',
    Hungary: 'HU'
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
  const regionList = computed(() =>
    props.mapLegend.length ? props.mapLegend : MOCK_COCKPIT_OVERVIEW.mapLegend
  )

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

  /** ISO 3166-1 alpha-2 转国旗 emoji（无网络、兼容性好） */
  function getFlagEmoji(code: string): string {
    if (!code || code.length !== 2) return ''
    return code
      .toUpperCase()
      .split('')
      .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
      .join('')
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
      const isoCode = d.code || getCountryCode(params.name)
      const flagEmoji = getFlagEmoji(isoCode)
      const titleHtml = flagEmoji
        ? `<div class="cockpit-map-tt-title"><span class="cockpit-map-tt-flag">${flagEmoji}</span> ${d.nameCn || params.name}</div>`
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
        `<div class="cockpit-map-tt-link" data-country-en="${(d.name || params.name || '').replace(/"/g, '&quot;')}" data-country-cn="${(d.nameCn || params.name || '').replace(/"/g, '&quot;')}">查看${d.nameCn || params.name}详情 →</div>`
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

  /** 点击 tooltip 内「查看详情」时触发（事件委托） */
  function handleTooltipLinkClick(e: MouseEvent) {
    const link = (e.target as HTMLElement).closest('.cockpit-map-tt-link')
    if (!link) return
    e.preventDefault()
    const countryEn = link.getAttribute('data-country-en') ?? ''
    const countryCn = link.getAttribute('data-country-cn') ?? ''
    console.log('查看详情', { countryEn, countryCn })
    // TODO: 跳转详情页等，例如：router.push({ name: 'CockpitCountry', params: { country: countryEn } })
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
    min-height: 400px;
  }

  .map-chart {
    width: 100%;
    height: 400px;
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

  .cockpit-map-tt-flag {
    font-size: 20px;
    line-height: 1;
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
