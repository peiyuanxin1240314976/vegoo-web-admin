<template>
  <div class="api-header">
    <div class="api-header__wrap">
      <div class="api-header__left">
        <div class="api-platform">
          <div class="api-platform__logo">
            <ArtSvgIcon icon="ri:google-fill" :size="18" />
          </div>
          <div class="api-platform__meta">
            <div class="api-platform__name">{{ summary.name }}</div>
            <ElTag class="api-platform__tag" size="small" type="primary" effect="dark">聚合</ElTag>
          </div>
        </div>

        <div class="api-score">
          <div class="api-score__ring" :style="{ '--p': summary.score }">
            <div class="api-score__num">{{ summary.score }}</div>
            <div class="api-score__text">{{ summary.scoreText }}</div>
            <div class="api-score__label">优秀</div>
          </div>
        </div>
      </div>

      <div class="api-header__right">
        <div class="api-actions">
          <div class="api-pill">
            <ArtSvgIcon icon="ri:calendar-2-line" :size="16" class="api-pill__icon" />
            <span class="api-pill__text">{{ rangeText }}</span>
          </div>

          <ElButton round class="api-export" @click="emit('export')">
            <ArtSvgIcon icon="ri:download-2-line" :size="16" />
            导出报表
          </ElButton>
        </div>

        <div class="api-controls">
          <div class="api-filter">
            <div class="api-filter__label">广告平台</div>
            <ElSelect v-model="sourceProxy" class="api-select">
              <ElOption
                v-for="o in sourceOptions"
                :key="o.value"
                :label="o.label"
                :value="o.value"
              />
            </ElSelect>
          </div>

          <div class="api-filter">
            <div class="api-filter__label">日期范围</div>
            <ElRadioGroup v-model="dateRangeProxy" class="api-seg" size="default">
              <ElRadioButton v-for="o in dateRangeOptions" :key="o.value" :label="o.value">
                {{ o.label }}
              </ElRadioButton>
            </ElRadioGroup>
          </div>

          <div class="api-filter api-filter--btns">
            <div class="api-filter__label">数据更新时间</div>
            <div class="api-updated">{{ updatedAtText }}</div>
            <div class="api-btns">
              <ElButton round type="primary" @click="emit('query')">查询</ElButton>
              <ElButton round @click="emit('refresh')">刷新</ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AdPlatformInfoFilterState, AdPlatformInfoPlatformSummary } from '../types'
  import ArtSvgIcon from '@/components/core/base/art-svg-icon/index.vue'

  defineOptions({ name: 'ApiPageHeader' })

  const props = defineProps<{
    dateRange: AdPlatformInfoFilterState['dateRange']
    source: AdPlatformInfoFilterState['source']
    updatedAtText: string
    summary: AdPlatformInfoPlatformSummary
  }>()

  const emit = defineEmits<{
    (e: 'update:dateRange', v: AdPlatformInfoFilterState['dateRange']): void
    (e: 'update:source', v: AdPlatformInfoFilterState['source']): void
    (e: 'query'): void
    (e: 'refresh'): void
    (e: 'export'): void
  }>()

  const sourceOptions = [
    { label: 'Google Ads', value: 'google_ads' },
    { label: 'Facebook Ads', value: 'facebook_ads' },
    { label: 'AppLovin', value: 'applovin' },
    { label: 'Unity', value: 'unity' },
    { label: 'IronSource', value: 'ironsource' }
  ] as const

  const dateRangeOptions = [
    { label: '近7天', value: '7d' },
    { label: '近30天', value: '30d' },
    { label: '近90天', value: '90d' }
  ] as const

  const sourceProxy = computed({
    get: () => props.source,
    set: (v) => emit('update:source', v)
  })

  const dateRangeProxy = computed({
    get: () => props.dateRange,
    set: (v) => emit('update:dateRange', v)
  })

  const rangeText = computed(() => {
    if (props.dateRange === '7d') return '过去7天，2026年01月25日-2026年01月31日'
    if (props.dateRange === '90d') return '过去90天，2025年11月03日-2026年01月31日'
    return '过去30天，2026年01月01日-2026年01月31日'
  })
</script>

<style scoped lang="scss">
  .api-header {
    padding: 14px 16px;
    background: linear-gradient(180deg, rgb(10 10 10 / 50%), rgb(10 10 10 / 0%));
    border: 1px solid var(--default-border);
    border-radius: 14px;
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
      background: rgb(24 24 27 / 85%);
      border: 1px solid var(--default-border);
      border-radius: 14px;
      box-shadow: 0 14px 32px rgb(0 0 0 / 25%);
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

  .api-score__ring {
    --size: 64px;
    --track: rgb(161 161 170 / 22%);
    --color: var(--art-primary);

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
    inset: 5px;
    width: calc(var(--size) - 10px);
    height: calc(var(--size) - 10px);
    content: '';
    background: var(--default-box-color);
    border-radius: 9999px;
  }

  .api-score__num {
    position: relative;
    z-index: 1;
    font-size: 16px;
    font-weight: 900;
    line-height: 1.1;
    color: var(--art-gray-900);
    text-align: center;
  }

  .api-score__text {
    position: relative;
    z-index: 1;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 700;
    color: var(--art-gray-600);
  }

  .api-score__label {
    position: relative;
    z-index: 1;
    margin-top: 2px;
    font-size: 11px;
    font-weight: 700;
    color: var(--art-success);
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
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    background: rgb(24 24 27 / 55%);
    border: 1px solid var(--default-border);
    border-radius: 9999px;

    &__icon {
      color: var(--art-gray-600);
    }

    &__text {
      font-size: 12px;
      color: var(--art-gray-900);
      white-space: nowrap;
    }
  }

  .api-export {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .api-controls {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 1.2fr;
    gap: 12px;

    @media (width <= 1100px) {
      grid-template-columns: 1fr;
    }
  }

  .api-filter__label {
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-select {
    width: 100%;
  }

  .api-filter--btns {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .api-updated {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-btns {
    display: flex;
    gap: 10px;
    justify-content: flex-end;

    @media (width <= 1100px) {
      justify-content: flex-start;
    }
  }

  .api-seg {
    :deep(.el-radio-button__inner) {
      border-color: var(--default-border);
    }
  }
</style>
