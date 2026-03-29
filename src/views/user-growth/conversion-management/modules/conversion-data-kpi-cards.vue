<template>
  <div class="conversion-data-kpi-cards">
    <ElRow v-if="loading" :gutter="16">
      <ElCol v-for="i in 4" :key="`sk-${i}`" :xs="24" :sm="12" :lg="6" :xl="6">
        <div
          class="conversion-data-kpi-cards__card conversion-data-kpi-cards__card--sk"
          :class="`conversion-data-kpi-cards__card--${cardTheme(i - 1)}`"
        >
          <ElSkeleton animated :throttle="0">
            <template #template>
              <div class="kpi-sk">
                <ElSkeletonItem variant="text" class="kpi-sk__label" />
                <ElSkeletonItem variant="text" class="kpi-sk__value" />
                <ElSkeletonItem variant="text" class="kpi-sk__compare" />
              </div>
            </template>
          </ElSkeleton>
        </div>
      </ElCol>
    </ElRow>

    <ElRow v-else :gutter="16">
      <ElCol v-for="(card, index) in cards" :key="card.key" :xs="24" :sm="12" :lg="6" :xl="6">
        <div
          class="conversion-data-kpi-cards__card"
          :class="`conversion-data-kpi-cards__card--${cardTheme(index)}`"
        >
          <div class="kpi-border-spin" aria-hidden="true"></div>
          <div class="conversion-data-kpi-cards__label">{{ card.label }}</div>
          <div class="conversion-data-kpi-cards__value-row">
            <div class="conversion-data-kpi-cards__value">{{ card.valueText }}</div>
            <div class="conversion-data-kpi-cards__compare" :class="card.deltaClass">
              <span class="conversion-data-kpi-cards__delta-arrow">{{ card.deltaArrow }}</span>
              <span>{{ card.deltaText }}</span>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import type { ConversionKpi } from '../types'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'ConversionDataKpiCards' })

  const props = withDefaults(
    defineProps<{
      kpi?: ConversionKpi | null
      loading?: boolean
    }>(),
    { kpi: null, loading: false }
  )

  const { t, n } = useI18n()

  function cardTheme(index: number): string {
    const themes = ['cpi', 'active', 'roi', 'profit']
    return themes[index] ?? 'cpi'
  }

  function toDeltaMeta(deltaPercent: number) {
    const d = Number(deltaPercent || 0)
    const isUp = d >= 0
    const abs = Math.abs(d)
    return {
      deltaClass: isUp ? 'is-up' : 'is-down',
      deltaArrow: isUp ? '↑' : '↓',
      deltaText: `${abs}%`
    }
  }

  const cards = computed(() => {
    const kpi = props.kpi
    const numberOrDash = (v: number | undefined) => (Number.isFinite(v) ? n(v as number) : '-')
    const currencyOrDash = (v: number | undefined) =>
      Number.isFinite(v) ? `$${n(v as number)}` : '-'

    const conversionCount = kpi?.conversionCount
    const conversionValue = kpi?.conversionValue
    const averageValue = kpi?.averageValue
    const activeTypeCount = kpi?.activeTypeCount

    return [
      {
        key: 'conversionCount',
        label: t('conversionManagement.kpiConversionCount'),
        valueText: numberOrDash(conversionCount?.value),
        ...toDeltaMeta(conversionCount?.deltaPercent ?? 0)
      },
      {
        key: 'conversionValue',
        label: t('conversionManagement.kpiConversionValue'),
        valueText: currencyOrDash(conversionValue?.value),
        ...toDeltaMeta(conversionValue?.deltaPercent ?? 0)
      },
      {
        key: 'averageValue',
        label: t('conversionManagement.kpiAverageValue'),
        valueText: currencyOrDash(averageValue?.value),
        ...toDeltaMeta(averageValue?.deltaPercent ?? 0)
      },
      {
        key: 'activeTypeCount',
        label: t('conversionManagement.kpiActiveTypeCount'),
        valueText: numberOrDash(activeTypeCount?.value),
        ...toDeltaMeta(activeTypeCount?.deltaPercent ?? 0)
      }
    ]
  })
</script>

<style scoped lang="scss">
  @property --kpi-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .conversion-data-kpi-cards {
    margin-bottom: 16px;

    :deep(.el-col) {
      display: flex;
      margin-bottom: 0;
    }
  }

  .conversion-data-kpi-cards__card {
    --kpi-accent: #3b82f6;
    --kpi-accent-2: #06b6d4;
    --kpi-glow: rgb(59 130 246 / 45%);
    --kpi-glow-2: rgb(6 182 212 / 25%);
    --kpi-spin-a: rgb(16 185 129 / 55%);
    --kpi-spin-b: rgb(59 130 246 / 48%);
    --kpi-spin-c: rgb(168 85 247 / 38%);

    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 108px;
    padding: 18px 12px;
    overflow: hidden;
    background-color: rgb(8 8 12 / 98%);
    background-image:
      radial-gradient(
        ellipse 120% 80% at 50% -18%,
        var(--kpi-glow) 0%,
        var(--kpi-glow-2) 30%,
        transparent 58%
      ),
      linear-gradient(
        172deg,
        color-mix(in srgb, var(--kpi-accent) 22%, rgb(8 8 12)) 0%,
        color-mix(in srgb, var(--kpi-accent) 38%, rgb(8 8 12)) 60%,
        color-mix(in srgb, var(--kpi-accent-2) 15%, rgb(8 8 12)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--kpi-accent) 55%, transparent);
    border-radius: 14px;
    box-shadow:
      0 8px 40px rgb(0 0 0 / 52%),
      0 0 0 1px color-mix(in srgb, var(--kpi-accent) 18%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 16%),
      inset 0 -10px 28px rgb(0 0 0 / 38%),
      0 0 28px color-mix(in srgb, var(--kpi-accent) 12%, transparent);
    transition:
      transform 0.36s var(--ease-out),
      box-shadow 0.4s var(--ease-out),
      border-color 0.28s var(--ease-default);

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
        var(--kpi-accent),
        var(--kpi-accent-2),
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
      background: linear-gradient(90deg, transparent, var(--kpi-accent), transparent);
      opacity: 0.45;
      transform: translateX(-50%);
    }

    > *:not(.kpi-border-spin) {
      position: relative;
      z-index: 1;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--kpi-accent) 85%, transparent);
      box-shadow:
        0 28px 72px rgb(0 0 0 / 55%),
        0 0 0 1px color-mix(in srgb, var(--kpi-accent) 40%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 20%),
        0 0 60px color-mix(in srgb, var(--kpi-accent) 35%, transparent),
        0 0 100px color-mix(in srgb, var(--kpi-accent) 18%, transparent),
        0 0 140px color-mix(in srgb, var(--kpi-accent-2) 12%, transparent);
      transform: translateY(-7px) scale(1.04);
    }

    &:active {
      transition-duration: 0.12s;
      transform: translateY(-3px) scale(1.01);
    }

    &--cpi {
      --kpi-accent: #10b981;
      --kpi-accent-2: #22d3ee;
      --kpi-glow: rgb(16 185 129 / 45%);
      --kpi-glow-2: rgb(34 211 238 / 22%);
      --kpi-spin-a: rgb(16 185 129 / 62%);
      --kpi-spin-b: rgb(34 211 238 / 48%);
      --kpi-spin-c: rgb(59 130 246 / 38%);
    }

    &--active {
      --kpi-accent: #3b82f6;
      --kpi-accent-2: #22d3ee;
      --kpi-glow: rgb(59 130 246 / 45%);
      --kpi-glow-2: rgb(34 211 238 / 22%);
      --kpi-spin-a: rgb(59 130 246 / 62%);
      --kpi-spin-b: rgb(34 211 238 / 48%);
      --kpi-spin-c: rgb(16 185 129 / 38%);
    }

    &--roi {
      --kpi-accent: #10b981;
      --kpi-accent-2: #34d399;
      --kpi-glow: rgb(16 185 129 / 45%);
      --kpi-glow-2: rgb(52 211 153 / 22%);
      --kpi-spin-a: rgb(52 211 153 / 62%);
      --kpi-spin-b: rgb(16 185 129 / 48%);
      --kpi-spin-c: rgb(34 211 238 / 38%);
    }

    &--profit {
      --kpi-accent: #a855f7;
      --kpi-accent-2: #818cf8;
      --kpi-glow: rgb(168 85 247 / 45%);
      --kpi-glow-2: rgb(129 140 248 / 22%);
      --kpi-spin-a: rgb(168 85 247 / 62%);
      --kpi-spin-b: rgb(129 140 248 / 48%);
      --kpi-spin-c: rgb(59 130 246 / 38%);
    }

    &--sk {
      --kpi-accent: var(--default-border);
      --kpi-glow: transparent;

      cursor: default;

      &:hover {
        box-shadow:
          0 8px 32px rgb(0 0 0 / 36%),
          0 0 0 1px rgb(244 244 245 / 5%),
          inset 0 1px 0 rgb(244 244 245 / 12%);
        transform: none;
      }
    }
  }

  .kpi-border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1.5px;
    pointer-events: none;
    background: conic-gradient(
      from var(--kpi-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--kpi-spin-a) 45deg,
      transparent 95deg,
      transparent 145deg,
      var(--kpi-spin-b) 195deg,
      transparent 250deg,
      transparent 300deg,
      var(--kpi-spin-c) 340deg,
      transparent 360deg
    );
    filter: blur(0.3px);
    border-radius: inherit;
    opacity: 0.92;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: kpi-border-spin 4s linear infinite;

    --kpi-border-angle: 0deg;
  }

  @keyframes kpi-border-spin {
    to {
      --kpi-border-angle: 360deg;
    }
  }

  .kpi-sk {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 8px 4px;
  }

  .kpi-sk__label {
    width: 65% !important;
    height: 12px !important;
    border-radius: 6px !important;
  }

  .kpi-sk__value {
    width: 80% !important;
    height: 22px !important;
    border-radius: 6px !important;
  }

  .kpi-sk__compare {
    width: 45% !important;
    height: 10px !important;
    border-radius: 6px !important;
  }

  .conversion-data-kpi-cards__label {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    text-align: center;
    letter-spacing: 0.03em;
  }

  .conversion-data-kpi-cards__value-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }

  .conversion-data-kpi-cards__value {
    font-size: 22px;
    font-weight: 900;
    font-variant-numeric: tabular-nums;
    color: var(--kpi-accent);
    text-align: center;
    text-shadow:
      0 0 12px color-mix(in srgb, var(--kpi-accent) 80%, transparent),
      0 0 30px color-mix(in srgb, var(--kpi-accent) 50%, transparent),
      0 0 60px color-mix(in srgb, var(--kpi-accent) 28%, transparent);
    filter: drop-shadow(0 0 4px color-mix(in srgb, var(--kpi-accent) 40%, transparent));
  }

  .conversion-data-kpi-cards__compare {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    border-radius: 9999px;

    &.is-up {
      color: var(--art-success);
      text-shadow: 0 0 8px rgb(16 185 129 / 40%);
      background: color-mix(in srgb, var(--art-success) 16%, transparent);
    }

    &.is-down {
      color: var(--art-danger);
      text-shadow: 0 0 8px rgb(239 68 68 / 40%);
      background: color-mix(in srgb, var(--art-danger) 16%, transparent);
    }
  }

  .conversion-data-kpi-cards__delta-arrow {
    font-size: 12px;
    line-height: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .kpi-border-spin {
      opacity: 0;
      animation: none;
    }

    .conversion-data-kpi-cards__card {
      transition: none;

      &:hover,
      &:active {
        transform: none;
      }
    }
  }
</style>
