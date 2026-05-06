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
      </div>

      <div class="api-header__right">
        <div class="api-actions">
          <div class="api-pill">
            <AppDatePicker
              size="small"
              v-model="datePickerValue"
              type="daterange"
              :shortcuts="dateRangeShortcuts"
              unlink-panels
              range-separator="～"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              popper-class="api-info-filter-popper"
            />
          </div>

          <!-- <ElButton round class="api-export" @click="emit('export')">
            <ArtSvgIcon icon="ri:download-2-line" :size="16" />
            导出报表
          </ElButton> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { cloneAppDate, formatYYYYMMDD, getAppNow } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import type {
    AdPlatformInfoDateRangePreset,
    AdPlatformInfoFilterState,
    AdPlatformInfoPlatformSummary
  } from '../types'
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

  const datePickerValue = computed<[string, string]>({
    get: () => {
      if (Array.isArray(props.dateRange)) return props.dateRange as [string, string]

      const preset: AdPlatformInfoDateRangePreset = props.dateRange
      const end = getAppNow()
      const start = cloneAppDate(end)
      const days = preset === '7d' ? 7 : preset === '90d' ? 90 : 30
      start.setDate(end.getDate() - (days - 1))
      return [formatYYYYMMDD(start), formatYYYYMMDD(end)] as [string, string]
    },
    set: (v: [string, string]) => {
      if (!v?.length) return
      const [start, end] = v
      if (!start || !end) return
      emit('update:dateRange', [start, end])
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
      color: var(--el-color-primary);
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 35%, transparent);
      border-radius: 14px;
      box-shadow:
        0 14px 32px rgb(0 0 0 / 28%),
        0 0 20px color-mix(in srgb, var(--el-color-primary) 20%, transparent);
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
    background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 30%, transparent);
    border-radius: 5px;
    box-shadow: 0 0 16px color-mix(in srgb, var(--el-color-primary) 16%, transparent);

    :deep(.el-range-editor.el-input__wrapper) {
      width: 100%;
      min-height: 30px;
      padding: 0 12px;
      background: transparent;
      border: none;
      border-radius: 5px;
      box-shadow: none;
      transition:
        box-shadow 0.22s ease,
        background 0.22s ease;
    }

    :deep(.el-range-editor.el-input__wrapper:hover) {
      background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    }

    :deep(.el-range-editor.el-input__wrapper.is-focus) {
      background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
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
