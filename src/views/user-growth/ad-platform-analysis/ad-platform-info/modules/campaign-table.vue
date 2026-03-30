<template>
  <div class="api-campaign-table">
    <ElCard class="api-panel api-panel--table" shadow="never">
      <template #header>
        <div class="api-panel__header">
          <div class="api-panel__title">活动明细</div>
        </div>
      </template>

      <div class="api-panel__body api-panel__body--table" :style="tableBodyStyle">
        <ArtTable
          ref="artTableRef"
          :data="displayedRows"
          :columns="columns"
          row-key="id"
          height="100%"
          :show-table-header="false"
          size="small"
          :stripe="false"
          :border="false"
        >
          <template #profit="{ row }">
            <span :class="row.profit >= 0 ? 'is-pos' : 'is-neg'">${{ fmtUsd2(row.profit) }}</span>
          </template>
          <template #status="{ row }">
            <ElTag :type="row.status === 'active' ? 'success' : 'info'" effect="dark">
              {{ row.status === 'active' ? '投放中' : '已暂停' }}
            </ElTag>
          </template>
          <template #action="{ row }">
            <ElButton round size="small" type="primary" link @click="openDetail(row)">
              详情
            </ElButton>
            <ElButton round size="small" type="primary" link @click="toggleStatus(row)">
              {{ row.status === 'active' ? '暂停' : '启用' }}
            </ElButton>
          </template>
        </ArtTable>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import type { ColumnOption } from '@/types'
  import type { AdPlatformInfoCampaignRow } from '../types'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'ApiCampaignTable' })

  const props = defineProps<{ rows: AdPlatformInfoCampaignRow[] }>()

  const TABLE_MAX_HEIGHT = 520
  const INITIAL_LOAD_COUNT = 30
  const LOAD_MORE_COUNT = 20
  const LOAD_MORE_THRESHOLD_PX = 48

  const artTableRef = ref<InstanceType<typeof ArtTable> | null>(null)
  const visibleCount = ref(INITIAL_LOAD_COUNT)
  const isLoadingMore = ref(false)
  const bodyScrollEl = ref<HTMLElement | null>(null)

  const displayedRows = computed(() => props.rows.slice(0, visibleCount.value))
  const tableBodyHeight = computed(() => TABLE_MAX_HEIGHT)
  const tableBodyStyle = computed(() => ({ height: `${tableBodyHeight.value}px` }))

  function appendMoreRows() {
    if (isLoadingMore.value) return
    if (visibleCount.value >= props.rows.length) return
    isLoadingMore.value = true
    visibleCount.value = Math.min(visibleCount.value + LOAD_MORE_COUNT, props.rows.length)
    isLoadingMore.value = false
  }

  function handleBodyScroll() {
    if (!bodyScrollEl.value) return
    const { scrollTop, clientHeight, scrollHeight } = bodyScrollEl.value
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - LOAD_MORE_THRESHOLD_PX
    if (isNearBottom) {
      appendMoreRows()
    }
  }

  function bindTableBodyScroll() {
    const tableRoot = (artTableRef.value as unknown as { $el?: HTMLElement })?.$el
    const nextBody = tableRoot?.querySelector('.el-scrollbar__wrap') as HTMLElement | null
    if (!nextBody) return
    if (bodyScrollEl.value === nextBody) return
    if (bodyScrollEl.value) {
      bodyScrollEl.value.removeEventListener('scroll', handleBodyScroll)
    }
    bodyScrollEl.value = nextBody
    bodyScrollEl.value.addEventListener('scroll', handleBodyScroll, { passive: true })
  }

  watch(
    () => props.rows,
    () => {
      visibleCount.value = INITIAL_LOAD_COUNT
      nextTick(() => {
        bindTableBodyScroll()
      })
    },
    { deep: true }
  )

  onMounted(() => {
    nextTick(() => {
      bindTableBodyScroll()
    })
  })

  onBeforeUnmount(() => {
    if (bodyScrollEl.value) {
      bodyScrollEl.value.removeEventListener('scroll', handleBodyScroll)
      bodyScrollEl.value = null
    }
  })

  function toFiniteNumber(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : 0
  }

  function fmtUsd2(n: unknown) {
    return toFiniteNumber(n).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  function fmtPct2(n: unknown) {
    return (
      toFiniteNumber(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + '%'
    )
  }

  const columns: ColumnOption[] = [
    {
      prop: 'campaign',
      label: '活动名称',
      width: 'auto',
      showOverflowTooltip: true
    },
    {
      prop: 'spend',
      label: '支出',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => `$${fmtUsd2(r.spend)}`
    },
    {
      prop: 'revenue',
      label: '收入',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => `$${fmtUsd2(r.revenue)}`
    },
    {
      prop: 'profit',
      label: '利润',
      width: 'auto',
      align: 'left',
      useSlot: true,
      showOverflowTooltip: true
    },
    {
      prop: 'roi',
      label: 'ROI',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => fmtPct2(r.roi)
    },
    {
      prop: 'cpi',
      label: 'CPI',
      width: 'auto',
      align: 'left',
      formatter: (r: AdPlatformInfoCampaignRow) => `$${fmtUsd2(r.cpi)}`
    },
    {
      prop: 'installs',
      label: '安装量',
      width: 'auto',
      align: 'right',
      formatter: (r: AdPlatformInfoCampaignRow) =>
        toFiniteNumber(r.installs).toLocaleString('en-US')
    },
    { prop: 'status', label: '状态', width: 'auto', align: 'center', useSlot: true },
    { prop: 'action', label: '操作', width: 'auto', align: 'center', fixed: 'right', useSlot: true }
  ]

  function openDetail(row: AdPlatformInfoCampaignRow) {
    ElMessage.info(`详情面板待接入：${row.campaign}`)
  }

  function toggleStatus(row: AdPlatformInfoCampaignRow) {
    const next = row.status === 'active' ? 'paused' : 'active'
    ElMessage.success(`已切换状态：${row.campaign} → ${next === 'active' ? '投放中' : '已暂停'}`)
  }
</script>

<style scoped lang="scss">
  @use '../styles/api-info-fx.scss' as fx;

  .api-campaign-table {
    min-width: 0;
    min-height: 0;
  }

  .api-panel {
    @include fx.api-panel-card;

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .api-panel__header {
    display: flex;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
  }

  .api-panel__title {
    font-size: 14px;
    font-weight: 800;
    color: var(--art-gray-900);
  }

  .api-panel__hint {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .api-panel__body--table {
    min-height: 0;
  }

  :deep(.art-table .el-table) {
    margin-top: 0 !important;
  }

  .api-table {
    --el-table-header-bg-color: rgb(24 24 27 / 50%);
    --el-table-row-hover-bg-color: rgb(39 39 42 / 55%);
  }

  .is-pos {
    font-weight: 800;
    color: var(--art-success);
  }

  .is-neg {
    font-weight: 800;
    color: var(--art-danger);
  }
</style>
