<template>
  <ElCard class="api-panel" shadow="never">
    <template #header>
      <div class="api-panel__header">
        <div class="api-panel__title">ROI 分布地图</div>
        <div class="api-panel__hint">拖拽/滚轮缩放查看细节</div>
      </div>
    </template>

    <div class="api-panel__body">
      <div ref="chartRef" class="api-chart api-chart--map"></div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import type { AdPlatformInfoMapPoint } from '../types'

  defineOptions({ name: 'ApiRoiMapPanel' })

  const props = defineProps<{ points: AdPlatformInfoMapPoint[] }>()

  const WORLD_JSON_URL = `${import.meta.env.BASE_URL}geo/world.json`
  let mapRegistered = false
  async function ensureMapRegistered() {
    if (mapRegistered) return
    const res = await fetch(WORLD_JSON_URL)
    const geoJson = await res.json()
    echarts.registerMap('world', geoJson)
    mapRegistered = true
  }

  const { chartRef, initChart, updateChart } = useChart()

  function buildOption(): EChartsOption {
    const values = props.points.map((d) => d.value).filter((v) => Number.isFinite(v))
    const dataMin = values.length ? Math.min(...values) : 0
    const dataMax = values.length ? Math.max(...values) : 10

    const COORDS: Record<string, [number, number]> = {
      'United States': [-98.5795, 39.8283],
      Canada: [-106.3468, 56.1304],
      Mexico: [-102.5528, 23.6345],
      Brazil: [-51.9253, -14.235],
      Argentina: [-63.6167, -38.4161],
      Chile: [-71.5429, -35.6751],
      Colombia: [-74.2973, 4.5709],
      Peru: [-75.0152, -9.19],
      'United Kingdom': [-3.436, 55.3781],
      France: [2.2137, 46.2276],
      Germany: [10.4515, 51.1657],
      Italy: [12.5674, 41.8719],
      Spain: [-3.7492, 40.4637],
      Netherlands: [5.2913, 52.1326],
      Sweden: [18.6435, 60.1282],
      Norway: [8.4689, 60.472],
      Poland: [19.1451, 51.9194],
      Turkey: [35.2433, 38.9637],
      Israel: [34.8516, 31.0461],
      'Saudi Arabia': [45.0792, 23.8859],
      'United Arab Emirates': [53.8478, 23.4241],
      Egypt: [30.8025, 26.8206],
      Nigeria: [8.6753, 9.082],
      Kenya: [37.9062, -0.0236],
      'South Africa': [22.9375, -30.5595],
      India: [78.9629, 20.5937],
      Japan: [138.2529, 36.2048],
      'South Korea': [127.7669, 35.9078],
      Taiwan: [120.9605, 23.6978],
      'Hong Kong': [114.1694, 22.3193],
      Thailand: [100.9925, 15.87],
      Vietnam: [108.2772, 14.0583],
      Indonesia: [113.9213, -0.7893],
      Philippines: [121.774, 12.8797],
      Malaysia: [101.9758, 4.2105],
      Singapore: [103.8198, 1.3521],
      Australia: [133.7751, -25.2744],
      'New Zealand': [174.886, -40.9006]
    }

    const geoScatter = props.points
      .map((p) => {
        const coord = COORDS[p.name]
        if (!coord) return null
        return { name: p.cnName ?? p.name, value: [...coord, p.value] }
      })
      .filter(Boolean) as Array<{ name: string; value: [number, number, number] }>

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(15,23,42,0.92)',
        borderColor: 'rgba(59,130,246,0.35)',
        borderWidth: 1,
        padding: [10, 12],
        textStyle: { color: '#f1f5f9', fontSize: 12 },
        formatter: (params: any) => {
          const item = props.points.find((d) => d.name === params.name)
          if (!item) return `<div style="color:#94a3b8">${params.name}</div>`
          return [
            `<div style="font-weight:700;margin-bottom:4px">${item.cnName ?? params.name}</div>`,
            `<div>ROI：<b style="color:#3B82F6">${item.value.toFixed(2)}%</b></div>`
          ].join('')
        }
      },
      visualMap: {
        type: 'continuous',
        show: false,
        min: dataMin,
        max: dataMax,
        realtime: false,
        calculable: false,
        inRange: { color: ['#111827', '#1e3a8a', '#3B82F6', '#10B981'] },
        left: 12,
        bottom: 12,
        itemWidth: 12,
        itemHeight: 86,
        textStyle: { color: '#64748b', fontSize: 11 },
        formatter: (v: unknown) => Number(v ?? 0).toFixed(1)
      },
      geo: {
        map: 'world',
        roam: true,
        zoom: 1.18,
        scaleLimit: { min: 0.8, max: 5 },
        itemStyle: {
          areaColor: '#0f172a',
          borderColor: 'rgba(148,163,184,0.25)',
          borderWidth: 0.6
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(59,130,246,0.28)',
            borderColor: 'rgba(59,130,246,0.8)',
            borderWidth: 1.1,
            shadowBlur: 14,
            shadowColor: 'rgba(59,130,246,0.25)'
          },
          label: { show: false }
        }
      },
      series: [
        {
          type: 'map',
          map: 'world',
          geoIndex: 0,
          data: props.points.map((d) => ({ name: d.name, value: d.value, cnName: d.cnName })),
          emphasis: { disabled: true },
          label: { show: false }
        },
        {
          name: '闪烁点',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: geoScatter,
          rippleEffect: {
            period: 4,
            scale: 2.1,
            brushType: 'stroke'
          },
          symbolSize: (val: [number, number, number]) => {
            const v = Number(val?.[2] ?? 0)
            return Math.max(3, Math.min(10, ((v - dataMin) / (dataMax - dataMin || 1)) * 7 + 3))
          },
          itemStyle: {
            color: '#3B82F6',
            shadowBlur: 18,
            shadowColor: 'rgba(59,130,246,0.55)'
          },
          emphasis: {
            scale: true
          },
          tooltip: {
            formatter: (p: any) => {
              const v = Number(p.value?.[2] ?? 0)
              return `<div style="font-weight:700;margin-bottom:4px">${p.name}</div><div>ROI：<b style="color:#3B82F6">${v.toFixed(
                2
              )}%</b></div>`
            }
          }
        }
      ]
    } as unknown as EChartsOption
  }

  async function sync() {
    await ensureMapRegistered()
    const op = buildOption()
    if (!chartRef.value) return
    initChart(op, !props.points.length)
  }

  onMounted(() => {
    void sync()
  })

  watch(
    () => props.points,
    () => {
      updateChart(buildOption())
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .api-panel {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;

    :deep(.el-card__header) {
      padding: 12px 14px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 14px;
    }
  }

  .api-panel__header {
    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
  }

  .api-panel__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--art-gray-900);
  }

  .api-panel__hint {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-chart--map {
    width: 100%;
    height: 292px;
  }
</style>
