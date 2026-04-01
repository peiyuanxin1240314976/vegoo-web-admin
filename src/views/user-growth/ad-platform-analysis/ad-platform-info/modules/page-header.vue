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
