<template>
  <div class="api-kpi-wrap">
    <div class="api-kpi-grid api-kpi-grid--top">
      <article
        v-for="k in topKpis"
        :key="k.id"
        class="api-kpi api-kpi--top"
        :data-accent="k.accent"
      >
        <div class="api-kpi__head">
          <div class="api-kpi__title">{{ k.title }}</div>
          <div class="api-kpi__delta" :class="k.deltaPct >= 0 ? 'is-up' : 'is-down'">
            <span class="api-kpi__deltaIcon">{{ k.deltaPct >= 0 ? '↗' : '↘' }}</span>
            {{ Math.abs(k.deltaPct).toFixed(2) }}%
          </div>
        </div>

        <div class="api-kpi__value">{{ k.valueText }}</div>

        <div class="api-kpi__area">
          <svg viewBox="0 0 160 54" preserveAspectRatio="none">
            <defs>
              <linearGradient :id="`g-${k.id}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="accentColor(k.accent)" stop-opacity="0.28" />
                <stop offset="100%" :stop-color="accentColor(k.accent)" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            <path :d="sparkPath(k.spark, 160, 54, 6)" :fill="`url(#g-${k.id})`" opacity="0.9" />
            <polyline
              :points="sparkPoints(k.spark, 160, 54, 6)"
              fill="none"
              :stroke="accentColor(k.accent)"
              stroke-width="2.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </article>
    </div>

    <div class="api-kpi-grid api-kpi-grid--bottom">
      <article
        v-for="k in bottomKpis"
        :key="k.id"
        class="api-kpi api-kpi--stat"
        :data-accent="k.accent"
      >
        <template v-if="k.variant === 'retention' && k.retentionSegments?.length">
          <div class="api-kpi__statHead">
            <div class="api-kpi__icon" :style="{ color: accentColor(k.accent) }">
              <ArtSvgIcon :icon="k.icon || 'ri:user-smile-line'" :size="18" />
            </div>
            <div class="api-kpi__title">{{ k.title }}</div>
          </div>

          <div class="api-retention">
            <div v-for="seg in k.retentionSegments" :key="seg.label" class="api-retention__seg">
              <div class="api-retention__k">{{ seg.label }}</div>
              <div class="api-retention__v">{{ seg.valueText }}</div>
              <div class="api-retention__spark">
                <svg viewBox="0 0 72 28" preserveAspectRatio="none">
                  <path
                    :d="sparkPath(seg.spark, 72, 28, 3)"
                    :fill="accentColor(k.accent)"
                    opacity="0.12"
                  />
                  <polyline
                    :points="sparkPoints(seg.spark, 72, 28, 3)"
                    fill="none"
                    :stroke="accentColor(k.accent)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="api-kpi__statHead">
            <div class="api-kpi__icon" :style="{ color: accentColor(k.accent) }">
              <ArtSvgIcon :icon="k.icon || 'ri:bar-chart-2-line'" :size="18" />
            </div>
            <div class="api-kpi__title">{{ k.title }}</div>
            <div class="api-kpi__badge" v-if="k.noteText">
              <span class="api-kpi__badgeDot"></span>
            </div>
          </div>

          <div class="api-kpi__value api-kpi__value--stat">{{ k.valueText }}</div>

          <div class="api-kpi__note">
            <span class="api-kpi__noteIcon" :class="k.deltaPct >= 0 ? 'is-up' : 'is-down'"></span>
            <span class="api-kpi__noteText">
              {{ k.noteText || `${Math.abs(k.deltaPct).toFixed(2)}%` }}
            </span>
          </div>
        </template>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AdPlatformInfoKpiCard } from '../types'
  import { getAccentColor } from '../mock'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ApiKpiGrid' })

  const props = defineProps<{ kpis: AdPlatformInfoKpiCard[] }>()

  const topKpis = computed(() =>
    props.kpis.filter(
      (k) => k.variant === 'top' || ['spend', 'revenue', 'profit', 'roi'].includes(k.metricKey)
    )
  )

  const bottomKpis = computed(() =>
    props.kpis.filter(
      (k) => k.variant !== 'top' && !['spend', 'revenue', 'profit', 'roi'].includes(k.metricKey)
    )
  )

  function accentColor(accent: AdPlatformInfoKpiCard['accent']) {
    return getAccentColor(accent)
  }

  function sparkPoints(values: number[], w: number, h: number, pad: number) {
    if (!values.length) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    return values
      .map((v, i) => {
        const x = (i / Math.max(1, values.length - 1)) * (w - pad * 2) + pad
        const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2)
        return `${x.toFixed(2)},${y.toFixed(2)}`
      })
      .join(' ')
  }

  function sparkPath(values: number[], w: number, h: number, pad: number) {
    const pts = sparkPoints(values, w, h, pad)
    if (!pts) return ''
    const first = pts.split(' ')[0]
    const last = pts.split(' ').at(-1) || first
    const [fx] = first.split(',').map(Number)
    const [lx] = last.split(',').map(Number)
    return `M ${fx} ${h - pad} L ${pts
      .split(' ')
      .map((p) => `L ${p}`)
      .join(' ')
      .replace(/^L\s/, '')} L ${lx} ${h - pad} Z`
  }
</script>

<style scoped lang="scss">
  .api-kpi-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .api-kpi-grid {
    display: grid;
    gap: 16px;
  }

  .api-kpi-grid--top {
    grid-template-columns: repeat(4, minmax(0, 1fr));

    @media (width <= 1100px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .api-kpi {
    position: relative;
    padding: 14px 14px 12px;
    overflow: hidden;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
    transition:
      transform 160ms ease,
      border-color 160ms ease;

    &:hover {
      border-color: rgb(59 130 246 / 45%);
      transform: translateY(-2px);
    }

    &__head {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    &__title {
      font-size: 12px;
      color: var(--art-gray-600);
    }

    &__value {
      font-size: 22px;
      font-weight: 800;
      color: var(--art-gray-900);
      letter-spacing: -0.2px;
    }

    &__delta {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      font-weight: 700;

      &.is-up {
        color: var(--art-success);
      }

      &.is-down {
        color: var(--art-danger);
      }
    }

    &__deltaIcon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      font-size: 12px;
      background: rgb(16 185 129 / 12%);
      border-radius: 9999px;
    }
  }

  .api-kpi--top {
    padding: 14px 14px 10px;
  }

  .api-kpi__area {
    height: 54px;
    margin-top: 10px;
    opacity: 0.95;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .api-kpi-grid--bottom {
    grid-template-columns: repeat(3, minmax(0, 1fr));

    @media (width <= 1100px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .api-kpi--stat {
    padding: 14px;
  }

  .api-kpi__statHead {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }

  .api-kpi__icon {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    background: rgb(24 24 27 / 60%);
    border: 1px solid var(--default-border);
    border-radius: 10px;
  }

  .api-kpi__value--stat {
    font-size: 20px;
  }

  .api-kpi__note {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    margin-top: 8px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-kpi__noteIcon {
    width: 10px;
    height: 10px;
    background: rgb(161 161 170 / 30%);
    border-radius: 9999px;

    &.is-up {
      background: rgb(16 185 129 / 75%);
    }

    &.is-down {
      background: rgb(239 68 68 / 75%);
    }
  }

  .api-retention {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .api-retention__seg {
    padding: 10px 10px 8px;
    background: rgb(24 24 27 / 35%);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .api-retention__k {
    font-size: 11px;
    color: var(--art-gray-600);
  }

  .api-retention__v {
    margin-top: 4px;
    font-size: 14px;
    font-weight: 900;
    color: var(--art-gray-900);
  }

  .api-retention__spark {
    height: 28px;
    margin-top: 6px;

    svg {
      width: 100%;
      height: 100%;
    }
  }
</style>
