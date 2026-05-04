<template>
  <div class="revenue-flow-panel">
    <div class="revenue-flow-border-spin" aria-hidden="true" />
    <div class="panel-header">
      <span class="panel-title">近7日收入结构流向</span>
      <!-- <ElButton type="primary" link size="small">查看更多</ElButton> -->
    </div>
    <template v-if="hasFlowData">
      <div ref="chartRef" class="sankey-chart" />
      <div v-if="flowData.insights?.length" class="panel-insights">
        <div v-for="(item, index) in flowData.insights" :key="index" class="insight-item">
          <span class="insight-dot" :style="{ background: item.color }" />
          <span class="insight-text">{{ item.text }}</span>
        </div>
      </div>
    </template>
    <div v-else class="flow-empty">暂无数据</div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, watch } from 'vue'
  import { useChart } from '@/hooks/core/useChart'
  import type { EChartsOption } from 'echarts'
  import type { CockpitRevenueStructureFlow } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'
  import 'flag-icons/css/flag-icons.min.css'

  defineOptions({ name: 'CockpitRevenueStructureFlow' })

  /** flag-icons 国旗图 CDN（与项目安装的 flag-icons 版本一致，ECharts 需图片 URL） */
  const FLAG_ICONS_CDN = 'https://cdn.jsdelivr.net/npm/flag-icons@7.5.0/flags/4x3'
  function getFlagIconUrl(code: string): string {
    return `${FLAG_ICONS_CDN}/${String(code).toLowerCase()}.svg`
  }

  const props = withDefaults(defineProps<{ flowData?: CockpitRevenueStructureFlow | null }>(), {
    flowData: null
  })

  const flowData = computed(() =>
    props.flowData != null
      ? {
          nodes: props.flowData?.nodes ?? [],
          links: props.flowData?.links ?? [],
          insights: props.flowData?.insights ?? []
        }
      : (MOCK_COCKPIT_OVERVIEW.revenueStructureFlow ?? { nodes: [], links: [], insights: [] })
  )

  const hasFlowData = computed(
    () => (flowData.value.nodes?.length ?? 0) > 0 || (flowData.value.links?.length ?? 0) > 0
  )

  const { chartRef, initChart, updateChart } = useChart()

  /** 根据链接计算每个节点的流量合计（用于保证节点有最小高度） */
  function getNodeValueSum(
    nodeName: string,
    links: { source: string; target: string; value: number }[]
  ): number {
    return links.reduce((sum, l) => {
      if (l.source === nodeName || l.target === nodeName) return sum + l.value
      return sum
    }, 0)
  }

  function getNodeSortValue(
    nodeName: string,
    links: { source: string; target: string; value: number }[]
  ): number {
    return links.reduce((sum, l) => {
      if (l.source === nodeName || l.target === nodeName) return sum + l.value
      return sum
    }, 0)
  }

  function sortFlowNodesByRevenue(
    nodes: CockpitRevenueStructureFlow['nodes'],
    links: CockpitRevenueStructureFlow['links']
  ): CockpitRevenueStructureFlow['nodes'] {
    return [...nodes].sort((a, b) => {
      const depthA = a.depth ?? 0
      const depthB = b.depth ?? 0
      if (depthA !== depthB) return depthA - depthB
      return getNodeSortValue(b.name, links) - getNodeSortValue(a.name, links)
    })
  }

  /** 估算单行文字占宽（像素，fontSize 11 约 6.5px/字） */
  const CHAR_WIDTH = 6.5
  /** 单行在节点内占用的近似像素高度（含 lineHeight + 间距） */
  const PIXEL_HEIGHT_PER_LINE = 20
  /** 节点区域预估可用高度（扣除 padding），用于按比例算最小 value */
  const SANKEY_NODE_AREA_HEIGHT = 60
  /** 按行数非线性权重的底数（lineCount^2.5 * WEIGHT_BASE），使多行节点占比更大、避免文字溢出 */
  const HEIGHT_WEIGHT_BASE = 600
  /** 节点整体高度缩放（不改 links.value，仅让节点更“高”） */
  const NODE_HEIGHT_SCALE = 5
  /** 节点名称最大展示长度（超出将显示省略号） */
  const MAX_NODE_NAME_LEN = 10

  function truncateNodeName(name: string): string {
    const s = String(name ?? '')
    return s.length > MAX_NODE_NAME_LEN ? `${s.slice(0, MAX_NODE_NAME_LEN)}…` : s
  }

  /** 节点内图标样式：尺寸、圆角等，统一控制国旗图与 emoji 大小 */
  const NODE_ICON_STYLE = {
    size: 14,
    imgBorderRadius: 2,
    iconColor: '#fff'
  }

  function buildOption(): EChartsOption {
    const { nodes, links } = flowData.value
    if (!nodes?.length || !links?.length) {
      return { title: { text: '暂无数据', left: 'center', top: 'middle' } }
    }

    const labelFontSize = 11
    let maxLabelWidth = 0

    function escapeRich(s: string) {
      return String(s)
        .replace(/\|/g, '\\|')
        .replace(/\n/g, ' ')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
    }

    const defaultBorderRadius = 6
    const iconSize = NODE_ICON_STYLE.size

    const totalLinkValue = links.reduce((sum, l) => sum + l.value, 0)
    /** 节点 name → 展示名（用于 tooltip 与避免重复名报错） */
    const nameToDisplay: Record<string, string> = {}
    nodes.forEach((n) => {
      nameToDisplay[n.name] = n.displayName ?? n.name
    })

    const data = sortFlowNodesByRevenue(nodes, links).map((n) => {
      const rawDisplayLabel = n.displayName ?? n.name
      const displayLabel = truncateNodeName(rawDisplayLabel)
      const resolvedIconImage = n.iconImage ?? (n.code ? getFlagIconUrl(n.code) : undefined)
      const lines = [displayLabel, n.valueDisplay, n.percent].filter(Boolean) as string[]
      const hasIcon = !!(n.icon || resolvedIconImage)
      const lineCount = hasIcon
        ? 1 + (n.valueDisplay ? 1 : 0) + (n.percent ? 1 : 0)
        : Math.max(1, lines.length)
      const maxLineLen = Math.max(
        0,
        ...lines.map((s) => s.length),
        n.icon ? String(n.icon).length : 0
      )
      maxLabelWidth = Math.max(maxLabelWidth, maxLineLen * CHAR_WIDTH, hasIcon ? iconSize : 0)
      const linkSum = getNodeValueSum(n.name, links)
      const minPixelHeight = lineCount * PIXEL_HEIGHT_PER_LINE
      const minValueFromRatio =
        totalLinkValue > 0
          ? (minPixelHeight / SANKEY_NODE_AREA_HEIGHT) * totalLinkValue
          : lineCount * 5000
      const minValueFromWeight = Math.pow(lineCount, 2.5) * HEIGHT_WEIGHT_BASE
      const minValue = Math.max(minValueFromRatio, minValueFromWeight, linkSum * 0.4)

      /** 无 percent 的节点用黑色字，有 percent 的用白色字 */
      const hasPercent = !!(n.percent != null && n.percent !== '')
      // const textColor = hasPercent ? '#fff' : '#000'
      // const pctColor = hasPercent ? 'rgba(255,255,255,0.9)' : '#000'

      const rich: Record<string, any> = {
        name: {
          color: '#fff',
          fontSize: labelFontSize,
          lineHeight: 16,
          ...(hasPercent ? {} : { padding: [8, 0, 0, 0] })
        },
        value: {
          color: '#fff',
          fontSize: labelFontSize - 1,
          lineHeight: 14,
          ...(hasPercent ? {} : { padding: [15, 0, 0, 0] })
        },
        pct: { color: '#fff', fontSize: labelFontSize - 1, lineHeight: 14 }
      }
      // 以下 rich 片段（图标块）支持 ECharts 富文本全部样式，可任选使用：
      // 尺寸与间距: width, height, lineHeight, padding（注意：无 margin，仅 padding）
      // 背景: backgroundColor（色值或 { image: url, repeat?: 'repeat'|'no-repeat'|'repeat-x'|'repeat-y' ）, borderRadius
      // 边框: borderColor, borderWidth, borderRadius
      // 对齐: align（'left'|'center'|'right'）, verticalAlign（'top'|'middle'|'bottom'）
      // 文字（对图片块影响小）: color, fontSize, fontStyle, fontWeight, fontFamily
      // 文字描边: textBorderColor, textBorderWidth
      // 文字阴影: textShadowColor, textShadowBlur, textShadowOffsetX, textShadowOffsetY
      // 块阴影: shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY
      if (resolvedIconImage) {
        // const nameLineHeight = 16
        rich.img = {
          backgroundColor: { image: resolvedIconImage, repeat: 'no-repeat' },
          width: iconSize,
          height: 10,
          borderRadius: NODE_ICON_STYLE.imgBorderRadius,
          padding: [0, 0, 0, 0],
          align: 'left',
          verticalAlign: 'bottom'
        }
      }
      if (n.icon) {
        rich.icon = {
          color: NODE_ICON_STYLE.iconColor,
          fontSize: iconSize,
          lineHeight: iconSize,
          ...(hasPercent ? { padding: [0, 0, 2, 0] } : { padding: [15, 0, 2, 0] })
        }
      }

      let formatterStr = ''
      if (resolvedIconImage) formatterStr += `{img| } {name|${escapeRich(displayLabel)}}\n`
      else if (n.icon) formatterStr += `{icon|${n.icon}} {name|${escapeRich(displayLabel)}}\n`
      else formatterStr += `{name|${escapeRich(displayLabel)}}\n`
      if (n.valueDisplay) formatterStr += `{value|${escapeRich(n.valueDisplay)}}\n`
      if (n.percent) formatterStr += `{pct|${escapeRich(n.percent)}}`

      return {
        ...n,
        value: Math.max(linkSum, minValue) * NODE_HEIGHT_SCALE,
        itemStyle: {
          borderRadius: n.itemStyle?.borderRadius ?? defaultBorderRadius,
          ...n.itemStyle
        },
        label: {
          position: 'inside' as const,
          formatter: formatterStr,
          rich
        }
      }
    })

    const nodeWidth = Math.max(32, Math.min(Math.ceil(maxLabelWidth) + 28, 88))
    // 想让节点“更高/更厚”：优先减少节点间距（nodeGap）与上下留白，而不是整体放大 value（会被布局归一化）
    const nodeGap = Math.max(2, Math.min(10, Math.ceil(nodeWidth * 0.2)))

    return {
      title: { text: '', show: false },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const src = nameToDisplay[params.data.source] ?? params.data.source
            const tgt = nameToDisplay[params.data.target] ?? params.data.target
            return `${src} → ${tgt}<br/>${params.data.value?.toLocaleString?.() ?? params.data.value}`
          }
          return nameToDisplay[params.name] ?? params.name
        }
      },
      series: [
        {
          type: 'sankey',
          layoutIterations: 0,
          nodeWidth,
          nodeGap,
          left: '2%',
          right: '2%',
          top: 12,
          bottom: 4,
          data,
          links,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5
          },
          itemStyle: {
            borderRadius: defaultBorderRadius
          },
          label: {
            position: 'inside',
            color: '#fff',
            fontSize: labelFontSize
          },
          emphasis: {
            focus: 'adjacency'
          }
        }
      ]
    }
  }

  onMounted(() => {
    initChart(buildOption())
  })
  watch(flowData, () => updateChart(buildOption()), { deep: true })
</script>

<style scoped lang="scss">
  /* 与广告成效 KPI 卡片同系：旋转渐变边框 */
  @property --revenue-flow-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .revenue-flow-panel {
    --rf-accent: #3b82f6;
    --rf-accent-2: #22d3ee;
    --rf-glow: rgb(59 130 246 / 45%);
    --rf-glow-2: rgb(34 211 238 / 22%);
    --rf-spin-a: rgb(59 130 246 / 62%);
    --rf-spin-b: rgb(34 211 238 / 48%);
    --rf-spin-c: rgb(16 185 129 / 38%);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background-color: rgb(8 8 12 / 98%);
    background-image:
      radial-gradient(
        ellipse 120% 80% at 50% -18%,
        var(--rf-glow) 0%,
        var(--rf-glow-2) 30%,
        transparent 58%
      ),
      linear-gradient(
        172deg,
        color-mix(in srgb, var(--rf-accent) 22%, rgb(8 8 12)) 0%,
        color-mix(in srgb, var(--rf-accent) 38%, rgb(8 8 12)) 60%,
        color-mix(in srgb, var(--rf-accent-2) 15%, rgb(8 8 12)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--rf-accent) 55%, transparent);
    border-radius: 14px;
    box-shadow:
      0 8px 40px rgb(0 0 0 / 52%),
      0 0 0 1px color-mix(in srgb, var(--rf-accent) 18%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 16%),
      inset 0 -10px 28px rgb(0 0 0 / 38%),
      0 0 28px color-mix(in srgb, var(--rf-accent) 12%, transparent);
    transition:
      box-shadow 0.4s var(--ease-out),
      border-color 0.28s var(--ease-default);

    > *:not(.revenue-flow-border-spin) {
      position: relative;
      z-index: 1;
    }

    &::before {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 0;
      width: 80%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--rf-accent),
        var(--rf-accent-2),
        transparent
      );
      opacity: 0.8;
      transform: translateX(-50%);
    }

    &::after {
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: 0;
      width: 60%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(90deg, transparent, var(--rf-accent), transparent);
      opacity: 0.45;
      transform: translateX(-50%);
    }

    &:hover {
      border-color: color-mix(in srgb, var(--rf-accent) 85%, transparent);
      box-shadow:
        0 28px 72px rgb(0 0 0 / 55%),
        0 0 0 1px color-mix(in srgb, var(--rf-accent) 40%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 20%),
        0 0 60px color-mix(in srgb, var(--rf-accent) 35%, transparent),
        0 0 100px color-mix(in srgb, var(--rf-accent) 18%, transparent),
        0 0 140px color-mix(in srgb, var(--rf-accent-2) 12%, transparent);
    }

    &:active {
      transition-duration: 0.12s;
    }
  }

  .revenue-flow-border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1.5px;
    pointer-events: none;
    background: conic-gradient(
      from var(--revenue-flow-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--rf-spin-a) 45deg,
      transparent 95deg,
      transparent 145deg,
      var(--rf-spin-b) 195deg,
      transparent 250deg,
      transparent 300deg,
      var(--rf-spin-c) 340deg,
      transparent 360deg
    );
    filter: blur(0.3px);
    border-radius: inherit;
    opacity: 0.92;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: revenue-flow-border-spin 4s linear infinite;

    --revenue-flow-border-angle: 0deg;
  }

  @keyframes revenue-flow-border-spin {
    to {
      --revenue-flow-border-angle: 360deg;
    }
  }

  html:not(.dark) .revenue-flow-panel {
    background-color: #fff;
    background-image: none;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow:
      0 8px 24px rgb(15 23 42 / 8%),
      inset 0 1px 0 rgb(255 255 255 / 90%);

    &::before {
      opacity: 0.7;
    }

    &::after {
      opacity: 0.35;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--rf-accent) 45%, var(--el-border-color-lighter));
      box-shadow:
        0 14px 36px rgb(15 23 42 / 12%),
        0 0 0 1px color-mix(in srgb, var(--rf-accent) 22%, transparent);
    }

    .revenue-flow-border-spin {
      opacity: 0.45;
    }

    .panel-header {
      border-bottom-color: var(--el-border-color-lighter);

      .panel-title {
        color: #303133;
      }
    }

    .flow-empty {
      color: var(--el-text-color-secondary);
    }

    .insight-item {
      color: var(--el-text-color-secondary);
    }
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--rf-accent) 28%, transparent);

    .panel-title {
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.02em;
    }
  }

  .flow-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .sankey-chart {
    flex: 1;
    min-height: 280px;
  }

  .panel-insights {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    padding: 12px 16px;
    font-size: 12px;
    border-top: 1px solid rgb(255 255 255 / 10%);
  }

  .insight-item {
    display: flex;
    gap: 6px;
    align-items: center;
    color: var(--text-secondary);

    .insight-dot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .insight-text {
      white-space: nowrap;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .revenue-flow-border-spin {
      opacity: 0;
      animation: none;
    }

    .revenue-flow-panel {
      transition: none;

      &:hover,
      &:active {
        transform: none;
      }
    }
  }
</style>
