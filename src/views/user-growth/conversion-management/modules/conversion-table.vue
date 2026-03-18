<template>
  <div class="conversion-table">
    <div class="conversion-table__summary">
      {{ $t('conversionManagement.totalRecords', { n: pagination?.total ?? 0 }) }}
    </div>
    <ArtTable
      :data="data"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      :pagination-options="paginationOptions"
      size="small"
      stripe
      @pagination:size-change="$emit('pagination:size-change', $event)"
      @pagination:current-change="$emit('pagination:current-change', $event)"
    />
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
  .conversion-table {
    margin-bottom: 16px;

    :deep(.el-table) {
      .el-table__header th,
      .el-table__body td {
        font-size: 12px;
      }
    }
  }

  .conversion-table__summary {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  :deep(.conversion-table__platform) {
    display: inline-block !important;
    padding: 2px 10px !important;
    font-weight: 500 !important;
    background-color: var(--art-gray-400) !important;
    border-radius: 9999px !important;
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
