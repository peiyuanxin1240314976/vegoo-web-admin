<template>
  <div class="conversion-table">
    <div class="conversion-table__card">
      <div class="conversion-table__head">
        <div class="conversion-table__title">{{
          $t('conversionManagement.mappingTableTitle')
        }}</div>
        <div class="conversion-table__summary">
          {{ $t('conversionManagement.totalRecords', { n: pagination?.total ?? 0 }) }}
        </div>
      </div>
      <div class="conversion-table__body">
        <ArtTable
          :data="data"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          :pagination-options="paginationOptions"
          size="small"
          stripe
          class="conversion-table__art"
          @pagination:size-change="$emit('pagination:size-change', $event)"
          @pagination:current-change="$emit('pagination:current-change', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { h } from 'vue'
  import { ElTag, ElButton } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import type { ColumnOption } from '@/types'
  import type { ConversionMappingItem, MappingStatus } from '../types'

  defineOptions({ name: 'ConversionTable' })

  const { t } = useI18n()

  defineProps<{
    data: ConversionMappingItem[]
    loading?: boolean
    pagination?: { current: number; size: number; total: number }
  }>()

  const emit = defineEmits<{
    (e: 'edit', row: ConversionMappingItem): void
    (e: 'delete', row: ConversionMappingItem): void
    (e: 'pagination:size-change', size: number): void
    (e: 'pagination:current-change', current: number): void
  }>()

  const STATUS_CONFIG: Record<MappingStatus, { class: string; textKey: string }> = {
    enabled: {
      class: 'conversion-table__status--enabled',
      textKey: 'conversionManagement.statusEnabled'
    },
    duplicate: {
      class: 'conversion-table__status--duplicate',
      textKey: 'conversionManagement.statusDuplicate'
    },
    unmapped: {
      class: 'conversion-table__status--unmapped',
      textKey: 'conversionManagement.statusUnmapped'
    }
  }

  const TYPE_TAG_COLOR: Record<string, string> = {
    PHONE_CALL_LEAD: '#4ABEFF',
    DOWNLOAD: '#67c23a',
    PURCHASE: '#e6a23c',
    ADD_TO_CART: '#722ed1',
    PAGE_VIEW: '#909399',
    BEGIN_CHECKOUT: '#f56c6c'
  }

  const columns = computed<ColumnOption<ConversionMappingItem>[]>(() => [
    {
      prop: 'platform',
      label: t('conversionManagement.platform'),
      width: 80,
      formatter: (row) => {
        const text =
          row.platform === 'android'
            ? t('conversionManagement.android')
            : t('conversionManagement.ios')
        return h('span', { class: 'conversion-table__platform' }, text)
      }
    },
    {
      prop: 'mccAccount',
      label: t('conversionManagement.mccAccount'),
      width: 100,
      showOverflowTooltip: true
    },
    {
      prop: 'appPackage',
      label: t('conversionManagement.appPackage'),
      minWidth: 130,
      showOverflowTooltip: true,
      formatter: (row) =>
        h('span', { class: 'conversion-table__app-package' }, row.appPackage ?? '')
    },
    {
      prop: 'conversionName',
      label: t('conversionManagement.conversionName'),
      minWidth: 160,
      showOverflowTooltip: true
    },
    {
      prop: 'conversionId',
      label: t('conversionManagement.conversionId'),
      width: 100,
      showOverflowTooltip: true
    },
    {
      prop: 'platformConversionType',
      label: t('conversionManagement.platformConversionType'),
      width: 168,
      formatter: (row) => {
        const color = TYPE_TAG_COLOR[row.platformConversionType] ?? '#909399'
        return h(
          ElTag,
          {
            size: 'small',
            class: 'conversion-table__type-tag',
            style: {
              backgroundColor: color,
              borderColor: color,
              color: '#fff',
              borderRadius: '9999px'
            }
          },
          () => row.platformConversionType
        )
      }
    },
    {
      prop: 'systemDisplayName',
      label: t('conversionManagement.systemDisplayName'),
      width: 96,
      showOverflowTooltip: true
    },
    { prop: 'billingType', label: t('conversionManagement.billingType'), width: 72 },
    {
      prop: 'status',
      label: t('conversionManagement.status'),
      width: 88,
      formatter: (row) => {
        const config = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.enabled
        return h('span', { class: ['conversion-table__status', config.class] }, [
          h('span', { class: 'conversion-table__status-dot' }, '●'),
          t(config.textKey)
        ])
      }
    },
    {
      prop: 'operation',
      label: t('conversionManagement.operation'),
      width: 100,
      fixed: 'right',
      formatter: (row) => {
        const showDelete = row.status === 'duplicate' || row.status === 'unmapped'
        return h('div', { class: 'conversion-table__ops' }, [
          h(
            ElButton,
            {
              type: 'success',
              link: true,
              class: 'conversion-table__edit-link',
              onClick: () => emit('edit', row)
            },
            () => t('conversionManagement.edit')
          ),
          ...(showDelete
            ? [
                h(
                  ElButton,
                  {
                    type: 'danger',
                    link: true,
                    class: 'conversion-table__delete-link',
                    onClick: () => emit('delete', row)
                  },
                  () => t('conversionManagement.delete')
                )
              ]
            : [])
        ])
      }
    }
  ])

  const paginationOptions = { pageSizes: [10, 20, 50], align: 'right' as const }
</script>

<script lang="ts">
  export default { name: 'ConversionTable' }
</script>

<style scoped lang="scss">
  @use '../../ad-performance/styles/ap-card-fx.scss' as *;

  .conversion-table {
    margin-bottom: 16px;
  }

  .conversion-table__card {
    @include ap-neon-bg;
    @include ap-card-mesh;

    position: relative;
    padding: 14px 14px 10px;
    overflow: hidden;
    border: 1px solid rgb(96 165 250 / 28%);
    border-radius: 14px;
  }

  .conversion-table__head,
  .conversion-table__body {
    position: relative;
    z-index: 1;
  }

  .conversion-table__head {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    margin-bottom: 12px;
    border-bottom: 1px solid color-mix(in srgb, var(--art-success) 22%, var(--default-border));
  }

  .conversion-table__title {
    @include ap-title-gradient;

    font-size: 15px;
    line-height: 1.3;
  }

  .conversion-table__summary {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .conversion-table__body {
    min-height: 120px;
  }

  .conversion-table__art {
    :deep(.el-table) {
      --el-table-border-color: color-mix(in srgb, var(--default-border) 90%, rgb(16 185 129 / 15%));
      --el-table-header-bg-color: color-mix(in srgb, rgb(8 12 18) 92%, rgb(16 185 129 / 10%));
      --el-table-row-hover-bg-color: color-mix(
        in srgb,
        var(--default-box-color) 88%,
        rgb(59 130 246 / 8%)
      );
      --el-table-fixed-left-column: color-mix(in srgb, var(--default-box-color) 96%, transparent);
      --el-table-fixed-right-column: color-mix(in srgb, var(--default-box-color) 96%, transparent);

      font-size: 12px;
      background: transparent;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.el-table__header-wrapper th) {
      font-weight: 600;
      color: var(--text-secondary);
      background: linear-gradient(
        180deg,
        color-mix(in srgb, rgb(16 185 129 / 12%) 100%, transparent) 0%,
        color-mix(in srgb, rgb(8 10 16) 100%, transparent) 100%
      ) !important;
      border-bottom: 1px solid color-mix(in srgb, var(--art-success) 28%, transparent) !important;
      box-shadow: inset 0 1px 0 rgb(186 230 253 / 8%);
    }

    :deep(.el-table__body tr:hover > td) {
      background-color: color-mix(
        in srgb,
        var(--default-box-color) 82%,
        rgb(34 211 238 / 6%)
      ) !important;
      box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--art-success) 12%, transparent);
    }

    :deep(.el-table td),
    :deep(.el-table th) {
      border-color: color-mix(in srgb, var(--default-border) 92%, transparent);
    }

    :deep(.pagination) {
      padding-top: 4px;
      margin-top: 12px;
    }

    :deep(.el-pagination) {
      --el-pagination-hover-color: var(--art-success);
      --el-pagination-button-color: var(--el-text-color-regular);
      --el-pagination-bg-color: transparent;
      --el-pagination-border-radius: 9999px;
    }

    :deep(.el-pagination .btn-prev),
    :deep(.el-pagination .btn-next) {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 6%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-success) 45%, transparent);
      border-radius: 9999px;
    }

    :deep(.el-pagination .el-pager li) {
      border-radius: 9999px;
    }

    :deep(.el-pagination .el-pager li.is-active) {
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, rgb(16 185 129 / 88%), rgb(5 150 105 / 82%));
      box-shadow: 0 0 14px rgb(16 185 129 / 35%);
    }

    :deep(.el-pagination .el-select .el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px var(--art-success) inset !important;
    }
  }

  :deep(.conversion-table__platform) {
    display: inline-block !important;
    padding: 2px 10px !important;
    font-weight: 600 !important;
    color: var(--text-primary) !important;
    background: color-mix(in srgb, var(--art-success) 16%, var(--default-box-color)) !important;
    border: 1px solid color-mix(in srgb, var(--art-success) 35%, transparent) !important;
    border-radius: 9999px !important;
    box-shadow: 0 0 10px rgb(16 185 129 / 12%);
  }

  :deep(.conversion-table__app-package) {
    color: var(--el-color-success) !important;
  }

  :deep(.conversion-table__type-tag) {
    border-radius: 9999px;

    &.el-tag {
      border: none;
    }
  }

  :deep(.conversion-table__status) {
    display: inline-flex;
    gap: 4px;
    align-items: center;

    .conversion-table__status-dot {
      font-size: 10px;
      line-height: 1;
    }
  }

  :deep(.conversion-table__status--enabled) {
    color: var(--el-text-color-primary);

    .conversion-table__status-dot {
      color: var(--el-color-success);
    }
  }

  html.dark :deep(.conversion-table__status--enabled) {
    color: var(--el-color-white);
  }

  :deep(.conversion-table__status--duplicate) {
    color: var(--el-color-warning);

    .conversion-table__status-dot {
      color: var(--el-color-warning);
    }
  }

  :deep(.conversion-table__status--unmapped) {
    color: #909399;

    .conversion-table__status-dot {
      color: #909399;
    }
  }

  .conversion-table__ops {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .conversion-table__edit-link,
  .conversion-table__delete-link {
    padding: 0 4px;
  }
</style>
