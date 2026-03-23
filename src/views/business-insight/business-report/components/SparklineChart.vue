<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="sparkline">
    <defs>
      <linearGradient :id="`grad-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <!-- Fill area -->
    <path v-if="showArea" :d="areaPath" :fill="`url(#grad-${uid})`" />
    <!-- Line -->
    <path
      :d="linePath"
      fill="none"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- End dot -->
    <circle v-if="showDot" :cx="lastPoint.x" :cy="lastPoint.y" :r="dotRadius" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  const props = withDefaults(
    defineProps<{
      data: number[]
      color?: string
      width?: number
      height?: number
      strokeWidth?: number
      showArea?: boolean
      showDot?: boolean
      dotRadius?: number
    }>(),
    {
      color: '#00D4A1',
      width: 80,
      height: 32,
      strokeWidth: 1.5,
      showArea: true,
      showDot: true,
      dotRadius: 2.5
    }
  )

  const uid = Math.random().toString(36).slice(2, 8)

  const normalizedPoints = computed(() => {
    const d = props.data
    if (!d || d.length < 2) return []
    const min = Math.min(...d)
    const max = Math.max(...d)
    const range = max - min || 1
    const pad = 4
    return d.map((v, i) => ({
      x: (i / (d.length - 1)) * (props.width - pad * 2) + pad,
      y: props.height - pad - ((v - min) / range) * (props.height - pad * 2)
    }))
  })

  const linePath = computed(() => {
    const pts = normalizedPoints.value
    if (pts.length < 2) return ''
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  })

  const areaPath = computed(() => {
    const pts = normalizedPoints.value
    if (pts.length < 2) return ''
    const line = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ')
    const last = pts[pts.length - 1]
    const first = pts[0]
    return `${line} L${last.x.toFixed(1)},${props.height} L${first.x.toFixed(1)},${props.height} Z`
  })

  const lastPoint = computed(() => {
    const pts = normalizedPoints.value
    return pts[pts.length - 1] ?? { x: 0, y: 0 }
  })
</script>
