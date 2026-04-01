<template>
  <div class="api-header api-header--ap-fx">
    <div class="api-header__wrap">
      <div class="api-header__left">
        <div class="api-platform">
          <div class="api-platform__logo">
            <ArtSvgIcon icon="ri:google-fill" :size="18" />
          </div>
          <div class="api-platform__meta">
            <div class="api-platform__name">{{ summary.name }}</div>
            <ElTag class="api-platform__tag" size="small" type="primary" effect="dark"
              >广告平台</ElTag
            >
          </div>
        </div>

        <div class="api-score">
          <div class="api-score__card" :class="`is-${scoreStatus}`">
            <div class="api-score__ring" :style="{ '--p': scorePercent }">
              <div class="api-score__ringNum">{{ scoreValue }}</div>
            </div>
            <div class="api-score__meta">
              <div class="api-score__value">
                {{ scoreValue }}<span class="api-score__total">/100</span>
              </div>
              <div class="api-score__label">{{ scoreLabel }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="api-header__right">
        <div class="api-actions">
          <div class="api-pill">
            <ElDatePicker
              size="small"
              v-model="datePickerValue"
              type="daterange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              popper-class="api-info-filter-popper"
            />
          </div>

          <ElButton round class="api-export" @click="emit('export')">
            <ArtSvgIcon icon="ri:download-2-line" :size="16" />
            导出报表
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { cloneAppDate, getAppNow } from '@/utils/app-now'
  import type { AdPlatformInfoFilterState, AdPlatformInfoPlatformSummary } from '../types'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ApiPageHeader' })

  const props = defineProps<{
    dateRange: AdPlatformInfoFilterState['dateRange']
    updatedAtText: string
    summary: AdPlatformInfoPlatformSummary
  }>()

  const emit = defineEmits<{
    (e: 'update:dateRange', v: AdPlatformInfoFilterState['dateRange']): void
    (e: 'query'): void
    (e: 'refresh'): void
    (e: 'export'): void
  }>()

  const scoreValue = computed(() => {
    const v = Number(props.summary.score || 0)
    if (Number.isNaN(v)) return 0
    if (v > 100) return 100
    if (v < 0) return 0
    return Math.round(v)
  })

  const scorePercent = computed(() => {
    return scoreValue.value
  })

  const scoreStatus = computed(() => {
    if (scoreValue.value >= 90) return 'excellent'
    if (scoreValue.value >= 60) return 'good'
    return 'bad'
  })

  const scoreLabel = computed(() => {
    if (scoreValue.value >= 90) return '优秀'
    if (scoreValue.value >= 60) return '良好'
    return '较差'
  })

  const datePickerValue = computed<[Date, Date]>({
    get: () => {
      const end = getAppNow()
      const start = cloneAppDate(end)
      const days = props.dateRange === '7d' ? 7 : props.dateRange === '90d' ? 90 : 30
      start.setDate(end.getDate() - (days - 1))
      return [start, end] as [Date, Date]
    },
    set: (v: [Date, Date]) => {
      if (!v?.length) return
      const [start, end] = v
      const diffMs = end.getTime() - start.getTime()
      const days = Math.floor(diffMs / 86400000) + 1
      if (days <= 14) {
        emit('update:dateRange', '7d')
      } else if (days <= 60) {
        emit('update:dateRange', '30d')
      } else {
        emit('update:dateRange', '90d')
      }
      emit('query')
    }
  })
</script>

<style scoped lang="scss">
  .api-header {
    padding: 16px 18px;
    border-radius: 16px;
  }

  .api-header--ap-fx {
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .api-header__wrap {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
    gap: 18px;
    align-items: center;

    @media (width <= 1100px) {
      grid-template-columns: 1fr;
    }
  }

  .api-header__left {
    display: flex;
    gap: 16px;
    align-items: center;
    min-width: 0;
  }

  .api-platform {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;

    &__logo {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      background: rgb(16 185 129 / 8%);
      border: 1px solid rgb(16 185 129 / 32%);
      border-radius: 14px;
      box-shadow:
        0 14px 32px rgb(0 0 0 / 28%),
        0 0 20px rgb(16 185 129 / 12%);
    }

    &__meta {
      display: flex;
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    &__name {
      font-size: 18px;
      font-weight: 900;
      color: var(--art-gray-900);
    }

    &__tag {
      border-radius: 9999px;
    }
  }

  .api-score__card {
    --accent: var(--art-success);

    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 12px;
    background: rgb(24 24 27 / 72%);
    border: 1px solid color-mix(in srgb, var(--accent) 75%, transparent);
    border-radius: 12px;
  }

  .api-score__card.is-excellent {
    --accent: var(--art-primary);
  }

  .api-score__card.is-bad {
    --accent: var(--art-danger);
  }

  .api-score__ring {
    --size: 42px;
    --track: rgb(161 161 170 / 22%);
    --color: var(--accent);

    position: relative;
    display: grid;
    place-items: center;
    width: var(--size);
    height: var(--size);
    background: conic-gradient(var(--color) calc(var(--p) * 1%), var(--track) 0);
    border-radius: 9999px;
    box-shadow:
      0 0 0 1px var(--default-border),
      0 10px 28px rgb(0 0 0 / 25%);
  }

  .api-score__ring::before {
    position: absolute;
    inset: 4px;
    width: calc(var(--size) - 8px);
    height: calc(var(--size) - 8px);
    content: '';
    background: var(--default-box-color);
    border-radius: 9999px;
  }

  .api-score__ringNum {
    position: relative;
    z-index: 1;
    font-size: 27px;
    font-weight: 900;
    line-height: 1;
    color: var(--accent);
    zoom: 0.5;
  }

  .api-score__meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .api-score__value {
    font-size: 37px;
    font-weight: 900;
    line-height: 1;
    color: var(--accent);
    letter-spacing: -0.01em;
    zoom: 0.5;
  }

  .api-score__total {
    font-weight: 700;
    color: color-mix(in srgb, var(--accent) 80%, white);
  }

  .api-score__label {
    font-size: 12px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .api-score {
    flex-shrink: 0;
  }

  .api-header__right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .api-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;

    @media (width <= 1100px) {
      justify-content: flex-start;
    }
  }

  .api-pill {
    display: inline-flex;
    align-items: center;
    min-width: 280px;
    padding: 4px 6px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 30%);
    border-radius: 9999px;
    box-shadow: 0 0 16px rgb(16 185 129 / 8%);

    :deep(.el-range-editor.el-input__wrapper) {
      width: 100%;
      min-height: 34px;
      padding: 0 12px;
      background: transparent;
      border: none;
      border-radius: 9999px;
      box-shadow: none;
      transition:
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-range-editor.el-input__wrapper:hover) {
      background: rgb(16 185 129 / 6%);
      box-shadow: 0 0 12px rgb(16 185 129 / 14%);
    }

    :deep(.el-range-editor.el-input__wrapper.is-focus) {
      background: rgb(16 185 129 / 10%);
      box-shadow: 0 0 0 2px rgb(16 185 129 / 22%);
    }

    :deep(.el-range-input) {
      font-size: 13px;
      color: var(--art-gray-900);
    }

    :deep(.el-range-separator) {
      color: var(--art-gray-600);
    }
  }

  .api-export {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
    color: #ecfdf5 !important;
    background: linear-gradient(135deg, #059669 0%, #10b981 48%, #34d399 100%) !important;
    border: 1px solid rgb(16 185 129 / 45%) !important;
    box-shadow:
      0 0 18px rgb(16 185 129 / 32%),
      inset 0 1px 0 rgb(255 255 255 / 12%);
    transition:
      box-shadow 0.22s ease,
      filter 0.22s ease;

    &:hover {
      filter: brightness(1.06);
      box-shadow:
        0 0 28px rgb(16 185 129 / 42%),
        inset 0 1px 0 rgb(255 255 255 / 16%);
    }
  }
</style>
