<script setup lang="ts">
  /**
   * ReviewMonitorSummary.vue
   * 评论与评分监控 - 汇总分析 Tab
   *
   * Props:
   *   filters: GlobalFilter - 从父组件传入的全局过滤条件
   *
   * Usage:
   *   <ReviewMonitorSummary :filters="globalFilters" />
   */
  import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
  import * as echarts from 'echarts'
  import type { ECharts, EChartsOption } from 'echarts'
  import {
    reviewMonitorApi,
    type GlobalFilter,
    type SummaryData,
    type TopicWord
  } from '@/api/product-operations/reviews-ratings-monitor'

  // ─────────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────────
  interface Props {
    filters?: GlobalFilter
  }
  const props = withDefaults(defineProps<Props>(), {
    filters: () => ({ appIds: [] })
  })

  // ─────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────
  const loading = ref(false)
  const data = ref<SummaryData | null>(null)

  // Chart DOM refs
  const ratingDistRef = ref<HTMLElement | null>(null)
  const dailyRef = ref<HTMLElement | null>(null)
  const appTopRef = ref<HTMLElement | null>(null)
  const trendRef = ref<HTMLElement | null>(null)
  const reviewTypeRef = ref<HTMLElement | null>(null)
  const langRef = ref<HTMLElement | null>(null)
  const deviceRef = ref<HTMLElement | null>(null)
  const ratingDonutRef = ref<HTMLElement | null>(null)
  const complaintRef = ref<HTMLElement | null>(null)

  // Chart instances
  const charts: ECharts[] = []

  // ─────────────────────────────────────────────
  // Chart color palette
  // ─────────────────────────────────────────────
  const STAR_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#4e8ef7', '#00d4aa']
  const LANG_COLORS = ['#00d4aa', '#4e8ef7', '#a78bfa', '#f59e0b', '#f97316', '#e879f9', '#94a3b8']

  // ─────────────────────────────────────────────
  // Init helper
  // ─────────────────────────────────────────────
  function initChart(el: HTMLElement, option: EChartsOption): ECharts {
    const chart = echarts.init(el, undefined, { renderer: 'canvas' })
    chart.setOption(option)
    charts.push(chart)
    return chart
  }

  // ─────────────────────────────────────────────
  // Chart: 评分分布（水平条形）
  // ─────────────────────────────────────────────
  function drawRatingDist(d: SummaryData) {
    if (!ratingDistRef.value) return
    const reversed = [...d.ratingDistribution].reverse()
    initChart(ratingDistRef.value, {
      grid: { left: 40, right: 60, top: 8, bottom: 8 },
      xAxis: { type: 'value', show: false, max: 100 },
      yAxis: {
        type: 'category',
        data: reversed.map((r) => r.star),
        axisLabel: {
          color: '#9ca3af',
          formatter: (v: string | number) => `${v} ★`,
          fontSize: 12
        },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          data: reversed.map((r, i) => ({
            value: r.percent,
            itemStyle: {
              color: STAR_COLORS[i],
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barWidth: 14,
          label: {
            show: true,
            position: 'right',
            formatter: '{c}%',
            color: '#9ca3af',
            fontSize: 11
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' },
        formatter: (p: any) =>
          `${p.name}星：${d.ratingDistribution.find((r) => r.star === parseInt(p.name))?.count || 0} 条 (${p.value}%)`
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 按日期评论分布（堆叠条形）
  // ─────────────────────────────────────────────
  function drawDaily(d: SummaryData) {
    if (!dailyRef.value) return
    const starKeys = ['star1', 'star2', 'star3', 'star4', 'star5'] as const
    const starNames = ['1星', '2星', '3星', '4星', '5星']
    initChart(dailyRef.value, {
      legend: {
        bottom: 0,
        textStyle: { color: '#9ca3af', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
        data: starNames.map((n, i) => ({ name: n, itemStyle: { color: STAR_COLORS[i] } }))
      },
      grid: { left: 20, right: 20, top: 30, bottom: 36 },
      xAxis: {
        type: 'category',
        data: d.dailyReviews.map((r) => r.date),
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      yAxis: { type: 'value', show: false },
      series: starKeys.map((key, i) => ({
        name: starNames[i],
        type: 'bar',
        stack: 'total',
        data: d.dailyReviews.map((r) => r[key]),
        itemStyle: {
          color: STAR_COLORS[i],
          borderRadius: i === 4 ? [4, 4, 0, 0] : [0, 0, 0, 0]
        },
        label: {
          show: i === 4,
          position: 'top',
          formatter: (p: any) => {
            return d.dailyReviews[p.dataIndex].total.toString()
          },
          color: '#e8eaed',
          fontSize: 12,
          fontWeight: 'bold'
        }
      })),
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' }
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 按应用汇总 Top 10
  // ─────────────────────────────────────────────
  function drawAppTop(d: SummaryData) {
    if (!appTopRef.value) return
    const reversed = [...d.appTopList].reverse()
    const max = Math.max(...d.appTopList.map((a) => a.count))
    initChart(appTopRef.value, {
      grid: { left: 80, right: 50, top: 8, bottom: 8 },
      xAxis: { type: 'value', show: false, max },
      yAxis: {
        type: 'category',
        data: reversed.map((a) => a.appName),
        axisLabel: { color: '#9ca3af', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          data: reversed.map((a, i) => ({
            value: a.count,
            itemStyle: {
              color: LANG_COLORS[i % LANG_COLORS.length],
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barWidth: 12,
          label: {
            show: true,
            position: 'right',
            color: '#9ca3af',
            fontSize: 11
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' }
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 30天评分趋势（面积折线）
  // ─────────────────────────────────────────────
  function drawTrend(d: SummaryData) {
    if (!trendRef.value) return
    const dates = d.trend30Days.map((p) => p.date)
    const ratings = d.trend30Days.map((p) => p.rating)
    const minR = Math.min(...ratings) - 0.1
    const maxR = Math.max(...ratings) + 0.05

    initChart(trendRef.value, {
      grid: { left: 40, right: 20, top: 16, bottom: 30 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#2a2d3a' } }
      },
      yAxis: {
        type: 'value',
        min: minR,
        max: maxR,
        splitLine: { lineStyle: { color: '#1e2433' } },
        axisLabel: { color: '#9ca3af', fontSize: 11 }
      },
      series: [
        {
          type: 'line',
          data: ratings,
          smooth: 0.4,
          symbol: 'circle',
          symbolSize: 5,
          showSymbol: false,
          lineStyle: { color: '#00d4aa', width: 2 },
          itemStyle: { color: '#00d4aa', borderWidth: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0,212,170,0.35)' },
              { offset: 1, color: 'rgba(0,212,170,0.02)' }
            ])
          },
          endLabel: {
            show: true,
            formatter: '{@[0]}',
            color: '#00d4aa',
            fontWeight: 'bold',
            fontSize: 14
          },
          markPoint: {
            data: [{ type: 'max', name: 'max' }],
            itemStyle: { color: '#00d4aa' },
            label: { color: '#fff', fontSize: 10 },
            symbolSize: 30
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' }
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 按评论类型分布（水平条形）
  // ─────────────────────────────────────────────
  function drawReviewType(d: SummaryData) {
    if (!reviewTypeRef.value) return
    const reversed = [...d.reviewTypes].reverse()
    const max = Math.max(...d.reviewTypes.map((r) => r.count))
    initChart(reviewTypeRef.value, {
      grid: { left: 70, right: 50, top: 4, bottom: 4 },
      xAxis: { type: 'value', show: false, max },
      yAxis: {
        type: 'category',
        data: reversed.map((r) => r.type),
        axisLabel: { color: '#9ca3af', fontSize: 11 },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          data: reversed.map((r) => ({
            value: r.count,
            itemStyle: {
              color: r.color || '#4e8ef7',
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barWidth: 12,
          label: {
            show: true,
            position: 'right',
            color: '#9ca3af',
            fontSize: 11
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' }
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 按语言分布（环形饼图）
  // ─────────────────────────────────────────────
  function drawLang(d: SummaryData) {
    if (!langRef.value) return
    initChart(langRef.value, {
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          data: d.languageDistribution.map((l, i) => ({
            name: l.displayName,
            value: l.percent,
            itemStyle: { color: LANG_COLORS[i % LANG_COLORS.length] }
          })),
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 11, color: '#e8eaed', formatter: '{b}\n{d}%' },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' },
        formatter: '{b}: {d}%'
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 按设备分布 Top 10（环形）
  // ─────────────────────────────────────────────
  function drawDevice(d: SummaryData) {
    if (!deviceRef.value) return
    initChart(deviceRef.value, {
      legend: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          data: d.deviceDistribution.map((dv, i) => ({
            name: dv.device,
            value: dv.percent,
            itemStyle: { color: LANG_COLORS[i % LANG_COLORS.length] }
          })),
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 11, color: '#e8eaed', formatter: '{b}\n{d}%' },
            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.3)' }
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' },
        formatter: '{b}: {d}%'
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: 按评分分布（甜甜圈）
  // ─────────────────────────────────────────────
  function drawRatingDonut(d: SummaryData) {
    if (!ratingDonutRef.value) return
    initChart(ratingDonutRef.value, {
      legend: {
        orient: 'vertical',
        right: '4%',
        top: 'middle',
        textStyle: { color: '#9ca3af', fontSize: 11 },
        formatter: (name: string) => {
          const item = d.ratingDistribution.find((r) => `${r.star} 星` === name)
          return `${name}  ${item?.percent ?? 0}%`
        }
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '68%'],
          center: ['32%', '50%'],
          data: [...d.ratingDistribution].reverse().map((r, i) => ({
            name: `${r.star} 星`,
            value: r.percent,
            itemStyle: { color: STAR_COLORS[4 - i] }
          })),
          label: { show: false },
          emphasis: {
            label: { show: true, color: '#e8eaed', fontSize: 12 }
          }
        }
      ],
      graphic: [
        {
          type: 'text',
          left: '26%',
          top: '44%',
          style: {
            text: d.kpi.newReviews.toString(),
            fill: '#e8eaed',
            fontSize: 18,
            fontWeight: 'bold',
            align: 'center'
          }
        },
        {
          type: 'text',
          left: '26%',
          top: '57%',
          style: { text: '总评论', fill: '#9ca3af', fontSize: 11, align: 'center' }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' },
        formatter: '{b}: {d}%'
      }
    })
  }

  // ─────────────────────────────────────────────
  // Chart: Top 5 投诉主题（水平条形）
  // ─────────────────────────────────────────────
  function drawComplaint(d: SummaryData) {
    if (!complaintRef.value) return
    const reversed = [...d.complaintTopics].reverse()
    const topicColors = ['#94a3b8', '#8b5cf6', '#f97316', '#f59e0b', '#ef4444']
    const max = Math.max(...d.complaintTopics.map((c) => c.count))
    initChart(complaintRef.value, {
      grid: { left: 56, right: 48, top: 4, bottom: 4 },
      xAxis: { type: 'value', show: false, max },
      yAxis: {
        type: 'category',
        data: reversed.map((c) => c.topic),
        axisLabel: { color: '#9ca3af', fontSize: 12 },
        axisTick: { show: false },
        axisLine: { show: false }
      },
      series: [
        {
          type: 'bar',
          data: reversed.map((c, i) => ({
            value: c.count,
            itemStyle: {
              color: topicColors[i % topicColors.length],
              borderRadius: [0, 4, 4, 0]
            }
          })),
          barWidth: 14,
          label: {
            show: true,
            position: 'right',
            color: '#9ca3af',
            fontSize: 11
          }
        }
      ],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e2433',
        borderColor: '#2a2d3a',
        textStyle: { color: '#e8eaed' }
      }
    })
  }

  // ─────────────────────────────────────────────
  // Word cloud helpers
  // ─────────────────────────────────────────────
  function wordSize(weight: number): string {
    const sizes = [12, 14, 16, 18, 20, 22, 26, 28, 32, 36]
    return `${sizes[Math.min(weight - 1, sizes.length - 1)]}px`
  }

  function wordColor(w: TopicWord): string {
    const map: Record<string, string> = {
      positive: '#00d4aa',
      negative: '#ef4444',
      neutral: '#9ca3af'
    }
    return map[w.sentiment] || '#9ca3af'
  }

  // ─────────────────────────────────────────────
  // Fetch data & render
  // ─────────────────────────────────────────────
  async function fetchData() {
    loading.value = true
    charts.forEach((c) => {
      c.dispose()
      charts.splice(0)
    })

    try {
      data.value = await reviewMonitorApi.getSummary(props.filters)
      await nextTick()
      const d = data.value
      if (!d) return
      drawRatingDist(d)
      drawDaily(d)
      drawAppTop(d)
      drawTrend(d)
      drawReviewType(d)
      drawLang(d)
      drawDevice(d)
      drawRatingDonut(d)
      drawComplaint(d)
      await nextTick()
      handleResize()
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────────
  // Resize handler
  // ─────────────────────────────────────────────
  function handleResize() {
    charts.forEach((c) => c.resize())
  }

  // ─────────────────────────────────────────────
  // Lifecycle & watch
  // ─────────────────────────────────────────────
  onMounted(() => {
    fetchData()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    charts.forEach((c) => c.dispose())
    charts.splice(0)
  })

  watch(() => props.filters, fetchData, { deep: true })

  // ─────────────────────────────────────────────
  // KPI trend helpers
  // ─────────────────────────────────────────────
  function deltaClass(val: number, reverse = false): string {
    const positive = reverse ? val < 0 : val > 0
    return positive ? 'trend-up' : 'trend-down'
  }

  function deltaLabel(val: number, isPercent = false, isPp = false): string {
    const prefix = val > 0 ? '↑ +' : '↓ '
    const suffix = isPp ? 'pp' : isPercent ? '%' : ''
    return `${prefix}${Math.abs(val)}${suffix}`
  }
</script>

<template>
  <div v-loading="loading" class="summary-root">
    <template v-if="data">
      <!-- ── KPI 卡片行 ─────────────────────────── -->
      <div class="kpi-row">
        <!-- 平均评分 -->
        <div class="kpi-card kpi-rating">
          <div class="kpi-label">
            <span class="kpi-card-title-text">平均评分</span>
            <span
              v-for="i in 5"
              :key="i"
              :class="['star', i <= Math.round(data.kpi.avgRating) ? 'star-filled' : 'star-empty']"
              >★</span
            >
          </div>
          <div class="kpi-value">{{ data.kpi.avgRating.toFixed(1) }}</div>
          <div :class="['kpi-delta', deltaClass(data.kpi.avgRatingDelta)]">
            {{ deltaLabel(data.kpi.avgRatingDelta) }}
          </div>
          <div class="kpi-sub">逢月同期</div>
        </div>

        <!-- 新增评论 -->
        <div class="kpi-card kpi-new">
          <div class="kpi-label"><span class="kpi-card-title-text">新增评论</span></div>
          <div class="kpi-value"
            >{{ data.kpi.newReviews.toLocaleString() }} <span class="kpi-unit">条</span></div
          >
          <div :class="['kpi-delta', deltaClass(data.kpi.newReviewsPct)]">
            {{ deltaLabel(data.kpi.newReviewsPct, true) }}
          </div>
          <div class="kpi-sub">逢月同期</div>
        </div>

        <!-- 好评率 -->
        <div class="kpi-card kpi-positive">
          <div class="kpi-label">好评率</div>
          <div class="kpi-value">{{ data.kpi.positiveRate }}<span class="kpi-unit">%</span></div>
          <div :class="['kpi-delta', deltaClass(data.kpi.positiveRateDelta)]">
            {{ deltaLabel(data.kpi.positiveRateDelta, false, true) }}
          </div>
          <div class="kpi-sub">4-5星占比</div>
        </div>

        <!-- 差评率 -->
        <div class="kpi-card kpi-negative">
          <div class="kpi-label"><span class="kpi-card-title-text">差评率</span></div>
          <div class="kpi-value">{{ data.kpi.negativeRate }}<span class="kpi-unit">%</span></div>
          <div :class="['kpi-delta', deltaClass(data.kpi.negativeRateDelta, true)]">
            {{ deltaLabel(data.kpi.negativeRateDelta, false, true) }}
          </div>
          <div class="kpi-sub">1-2星占比</div>
        </div>

        <!-- 待回复 -->
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">
            <span class="kpi-card-title-text">待回复</span>
            <el-icon class="warn-icon"><WarningFilled /></el-icon>
          </div>
          <div class="kpi-value kpi-pending-val"
            >{{ data.kpi.pendingReply }} <span class="kpi-unit">条</span></div
          >
          <div class="kpi-sub">需要处理</div>
        </div>
      </div>

      <!-- ── 主内容网格 ───────────────────────── -->
      <div class="chart-grid">
        <!-- 左列 -->
        <div class="col-left">
          <!-- 评分分布 -->
          <div class="chart-card">
            <div class="chart-title">评分分布</div>
            <div ref="ratingDistRef" class="chart-box" style="height: 140px" />
          </div>

          <!-- 30 天趋势：左列中间行 1fr，图表区随高度撑开 -->
          <div class="chart-card chart-card--fill chart-card--left-trend">
            <div class="chart-title">透 30 天评分趋势</div>
            <div ref="trendRef" class="chart-box chart-box--flex-grow chart-box--left-trend" />
          </div>

          <!-- 评分分布甜甜圈 -->
          <div class="chart-card">
            <div class="chart-title">按评分分布</div>
            <div ref="ratingDonutRef" class="chart-box" style="height: 170px" />
          </div>
        </div>

        <!-- 中列 -->
        <div class="col-mid">
          <!-- 按日期评论分布（中列剩余高度由该卡吃掉，图表区随 flex 撑开） -->
          <div class="chart-card chart-card--fill">
            <div class="chart-title">按日期评论分布</div>
            <div ref="dailyRef" class="chart-box chart-box--flex-grow chart-box--mid-daily" />
          </div>

          <!-- 按评论类型分布 -->
          <div class="chart-card">
            <div class="chart-title">按评论类型分布</div>
            <div ref="reviewTypeRef" class="chart-box" style="height: 240px" />
          </div>
        </div>

        <!-- 右列 -->
        <div class="col-right">
          <!-- 应用 Top 10 -->
          <div class="chart-card">
            <div class="chart-title">按应用汇总 Top 10</div>
            <div ref="appTopRef" class="chart-box" style="height: 200px" />
          </div>

          <!-- 语言 + 设备 -->
          <div class="chart-row-2">
            <div class="chart-card flex-1 chart-card--fill">
              <div class="chart-title">按语言分布</div>
              <div class="lang-chart-wrap">
                <div ref="langRef" class="chart-box chart-box--flex-grow" />
                <div class="lang-legend">
                  <div
                    v-for="(l, i) in data.languageDistribution"
                    :key="l.language"
                    class="lang-item"
                  >
                    <span
                      class="lang-dot"
                      :style="{
                        background: [
                          '#00d4aa',
                          '#4e8ef7',
                          '#a78bfa',
                          '#f59e0b',
                          '#f97316',
                          '#e879f9',
                          '#94a3b8'
                        ][i]
                      }"
                    />
                    <span class="lang-name">{{ l.displayName }}</span>
                    <span class="lang-pct">{{ l.percent }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="chart-card flex-1 chart-card--fill">
              <div class="chart-title">按设备分布 Top 10</div>
              <div ref="deviceRef" class="chart-box chart-box--flex-grow" />
            </div>
          </div>

          <!-- 评论主题分析 -->
          <div class="chart-card">
            <div class="chart-title-row">
              <span class="chart-title">评论主题分析</span>
              <span class="chart-subtitle">Top 5 投诉主题</span>
            </div>
            <div class="topic-wrap">
              <!-- 词云 -->
              <div class="word-cloud">
                <span
                  v-for="w in data.topicWords"
                  :key="w.word"
                  class="word-item"
                  :style="{
                    fontSize: wordSize(w.weight),
                    color: wordColor(w),
                    fontWeight: w.weight >= 8 ? 'bold' : 'normal'
                  }"
                  >{{ w.word }}</span
                >
              </div>
              <!-- 投诉 Top 5 -->
              <div ref="complaintRef" class="chart-box" style="flex: 1; height: 140px" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else-if="!loading" class="empty-state">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<style scoped lang="scss">
  @use '../styles/rrm-shared.scss' as *;

  .summary-root {
    flex: 1;
    min-height: 0;
    padding: 0 0 8px;
    overflow: hidden auto;
    color: var(--el-text-color-primary);

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }
  }

  /* ── KPI Row ────────────────────────────────── */
  .kpi-row {
    display: flex;
    flex-wrap: nowrap;
    gap: 12px;
    align-items: stretch;
    margin-bottom: 16px;
  }

  .kpi-card {
    position: relative;
    z-index: 0;
    display: flex;
    flex: 1 1 0;
    flex-direction: column;
    min-width: 0;
    padding: 16px 20px;
    transition:
      transform 0.2s ease,
      box-shadow 0.42s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.32s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));
    animation: fadeSlideUp 0.5s ease both;

    @include rrm-neon-panel;
    @include rrm-card-mesh;
    @include rrm-panel-hover;

    > * {
      position: relative;
      z-index: 1;
    }

    &:hover {
      transform: translateY(-2px);
    }
  }

  @for $i from 1 through 5 {
    .kpi-card:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.08}s;
    }
  }

  .kpi-label {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 6px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 13px;
  }

  .kpi-card-title-text {
    @include rrm-card-title-gradient;
  }

  .star {
    font-size: 14px;
  }

  .star-filled {
    color: #f59e0b;
  }

  .star-empty {
    color: #374151;
  }

  .kpi-value {
    margin-bottom: 6px;
    font-size: clamp(1.375rem, 2.8vw + 0.5rem, 1.75rem);
    font-weight: 700;
    line-height: 1;
  }

  .kpi-unit {
    margin-left: 2px;
    font-size: 14px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  .kpi-delta {
    margin-bottom: 2px;
    font-size: 12px;
    font-weight: 500;

    &.trend-up {
      color: var(--el-color-success);
    }

    &.trend-down {
      color: #ef4444;
    }
  }

  .kpi-sub {
    margin-top: auto;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .kpi-rating .kpi-value {
    color: #f59e0b;
  }

  .kpi-new .kpi-value {
    color: var(--el-text-color-primary);
  }

  .kpi-positive .kpi-value {
    color: var(--el-color-success);
  }

  .kpi-negative .kpi-value {
    color: #ef4444;
  }

  .kpi-pending-val {
    color: #f59e0b;
  }

  .warn-icon {
    font-size: 14px;
    color: #f59e0b;
  }

  /* ── Chart Grid ─────────────────────────────── */
  .chart-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr 1.3fr;
    gap: 16px;
    align-items: stretch;
    min-width: 0;
  }

  .col-left {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 16px;
    min-width: 0;
    min-height: 0;
  }

  .col-left > .chart-card--left-trend {
    min-height: 0;
  }

  .col-mid,
  .col-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
    min-height: 0;
  }

  /* 右列：末卡底边与整行对齐。左列用 grid 中间 1fr 撑趋势图，不再对末卡 auto */
  .col-right > .chart-card:last-child {
    margin-top: auto;
  }

  .col-mid > .chart-card:first-child {
    flex: 1 1 0;
    min-height: 0;
  }

  .col-mid > .chart-card:last-child {
    flex-shrink: 0;
  }

  .chart-card {
    position: relative;
    z-index: 0;
    padding: 14px 16px;
    transition:
      box-shadow 0.42s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.32s ease;
    animation: fadeIn 0.6s ease both;

    @include rrm-neon-panel;
    @include rrm-card-mesh;
    @include rrm-panel-hover;

    .chart-title,
    .chart-title-row,
    .chart-box,
    .lang-chart-wrap,
    .topic-wrap {
      position: relative;
      z-index: 1;
    }
  }

  .chart-title {
    margin-bottom: 10px;
    font-size: 13px;

    @include rrm-card-title-gradient;
  }

  .chart-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .chart-subtitle {
    font-size: 11px;

    @include rrm-card-subtitle-gradient;
  }

  .chart-box {
    width: 100%;
  }

  /* 并排小卡：等高由 flex stretch + 内部列布局撑满，图表区用 min-height + 伸展，避免写死整卡高度 */
  .chart-card--fill {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .chart-box--flex-grow {
    flex: 1 1 auto;
    width: 100%;
    min-height: 8.75rem;
  }

  /* 按日期评论分布：堆叠柱 + 图例，需要更高默认下限，其余随中列 flex 继续长高 */
  .chart-box--mid-daily {
    min-height: 15rem;
  }

  /* 透 30 天评分趋势：折线区默认不低于原 160px，其余随左列中间行 1fr 长高 */
  .chart-box--left-trend {
    min-height: 10rem;
  }

  /* ── Language legend ─────────────────────────── */
  .lang-chart-wrap {
    display: flex;
    flex: 1 1 auto;
    gap: 8px;
    align-items: flex-start;
    min-height: 0;
  }

  .chart-card--fill .lang-chart-wrap {
    flex: 1 1 auto;
    min-height: 8.75rem;
  }

  .lang-legend {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 5px;
    padding-top: 8px;
  }

  .lang-item {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .lang-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .lang-name {
    flex: 1;
  }

  .lang-pct {
    font-size: 11px;
    color: var(--el-text-color-primary);
  }

  .chart-row-2 {
    display: flex;
    flex-direction: row;
    gap: 16px;
    align-items: stretch;
    min-width: 0;
  }

  .flex-1 {
    flex: 1;
    min-width: 0;
  }

  /* ── 响应式：大屏默认三列 KPI 单行；中屏双列图表 + KPI 换行；小屏单列 ── */
  @media (width <= 1199px) {
    .kpi-row {
      flex-wrap: wrap;
    }

    .kpi-card {
      flex: 1 1 calc(33.333% - 8px);
      min-width: 168px;
    }

    .chart-grid {
      grid-template-columns: 1fr 1fr;
    }

    .col-left {
      grid-column: 1;
    }

    .col-mid {
      grid-column: 2;
    }

    .col-right {
      grid-column: 1 / -1;
    }
  }

  @media (width <= 991px) {
    .kpi-card {
      flex: 1 1 calc(50% - 6px);
      min-width: 148px;
      padding: 14px 16px;
    }
  }

  @media (width <= 767px) {
    .summary-root {
      padding: 0 4px 8px;
    }

    .kpi-row {
      gap: 10px;
    }

    .kpi-card {
      flex: 1 1 calc(50% - 5px);
      min-width: 0;
      padding: 12px 14px;
    }

    .chart-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .col-left,
    .col-mid,
    .col-right {
      grid-column: auto;
      gap: 12px;
    }

    .chart-card {
      padding: 12px 14px;
    }

    .chart-title-row {
      flex-wrap: wrap;
      gap: 6px 10px;
      align-items: flex-start;
    }

    .chart-row-2 {
      flex-direction: column;
    }

    .lang-chart-wrap {
      flex-direction: column;
      align-items: stretch;
    }

    .lang-legend {
      padding-top: 0;
    }

    .topic-wrap {
      flex-direction: column;
    }

    .word-cloud {
      min-height: 80px;
    }
  }

  @media (width <= 479px) {
    .kpi-card {
      flex: 1 1 100%;
    }

    .kpi-label {
      font-size: 12px;
    }

    .kpi-sub {
      font-size: 10px;
    }
  }

  /* ── Word Cloud ─────────────────────────────── */
  .topic-wrap {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .word-cloud {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    min-height: 120px;
    padding: 4px;
  }

  .word-item {
    line-height: 1.3;
    cursor: default;
    transition:
      transform 0.2s,
      opacity 0.2s;

    &:hover {
      opacity: 0.85;
      transform: scale(1.15);
    }
  }

  /* ── Animations ─────────────────────────────── */
  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
  }
</style>
