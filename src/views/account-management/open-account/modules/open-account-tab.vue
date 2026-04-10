<template>
  <div class="open-account-tab">
    <OpenAccountFiltersBar
      v-model:source-filter="sourceFilter"
      v-model:app-filter="appFilter"
      v-model:status-filter="statusFilter"
      v-model:agency-filter="agencyFilter"
      :source-select-options="sourceSelectOptions"
      :app-select-options="appSelectOptions"
      :filter-meta-loading="filterMetaLoading"
      :status-options="statusOptions"
      :agency-options="agencySelectOptions"
      :feishu-enabled="feishuEnabled"
      @open-feishu="handleOpenFeishuSetting"
    />

    <OpenAccountStatCards :stats="finalStats" />

    <OpenAccountRecordTable
      :paged-list="pagedList"
      :selected-row-id="props.selectedId ?? innerSelectedId"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :jump-page="jumpPage"
      @row-click="handleRowClick"
      @assign="emit('assign', $event)"
      @delete="emit('delete', $event)"
      @update:current-page="currentPage = $event"
      @update:jump-page="jumpPage = $event"
      @jump="handleJump"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { storeToRefs } from 'pinia'
  import {
    fetchOpenAccountFilterOptions,
    fetchOpenAccountOverviewStats,
    fetchOpenAccountFeishuConfig,
    fetchOpenAccountTable,
    saveOpenAccountFeishuConfig
  } from '@/api/config-management/account-management'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import {
    OpenAccountEndpoint,
    isOpenAccountEndpointMock
  } from '@/views/account-management/open-account/config/data-source'
  import { openAccountAppOptions as mockAppNames } from '@/views/account-management/open-account/mock/data'
  import {
    mockFetchOpenAccountFilterOptions,
    mockFetchOpenAccountTable,
    mockFetchOpenAccountFeishuConfig,
    mockSaveOpenAccountFeishuConfig
  } from '@/views/account-management/open-account/mock/open-account-api-mock'
  import { PLATFORM_CONFIGS } from '@/views/config-management/account-management/types'
  import type { OpenAccountItem } from '@/views/config-management/account-management/types'
  import OpenAccountFiltersBar from './open-account/open-account-filters-bar.vue'
  import OpenAccountStatCards from './open-account/open-account-stat-cards.vue'
  import OpenAccountRecordTable from './open-account/open-account-record-table.vue'

  defineOptions({ name: 'OpenAccountTab' })

  const props = defineProps<{ searchKeyword: string; selectedId?: string }>()

  const emit = defineEmits<{
    select: [row: OpenAccountItem]
    assign: [row: OpenAccountItem]
    delete: [row: OpenAccountItem]
  }>()

  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(cockpitMetaFilterStore)

  const sourceFilter = ref('')
  const appFilter = ref('')
  const statusFilter = ref('')
  const agencyFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')
  const innerSelectedId = ref('')

  const list = ref<OpenAccountItem[]>([])
  const remoteStats = ref<{
    total: number
    pending: number
    active: number
    failed: number
  } | null>(null)
  const feishuEnabled = ref(true)
  const filterMetaLoading = ref(false)
  const agencySelectOptions = ref<string[]>([])
  const statusOptionsState = ref<
    { label: string; value: string; type: 'default' | 'warn' | 'ok' | 'fail'; count?: number }[]
  >([
    { label: '全部', value: '', type: 'default' },
    { label: '待分配', value: '待分配', type: 'warn' },
    { label: '已激活', value: '已激活', type: 'ok' },
    { label: '开户失败', value: '开户失败', type: 'fail' }
  ])

  const rawAppOptions = computed(
    () => cockpitMeta.value?.appOptions ?? ([] as CockpitMetaOptionItem[])
  )
  const rawSourceOptions = computed(
    () => cockpitMeta.value?.sourceOptions ?? ([] as CockpitMetaOptionItem[])
  )

  const appSelectOptions = computed<CockpitMetaOptionItem[]>(() => {
    const raw = rawAppOptions.value.filter((o) => o.value !== 'all')
    if (raw.length === 0) {
      return [{ label: '全部', value: '' }, ...mockAppNames.map((a) => ({ label: a, value: a }))]
    }
    return [{ label: '全部', value: '' }, ...raw]
  })

  const sourceSelectOptions = computed<CockpitMetaOptionItem[]>(() => {
    const raw = rawSourceOptions.value.filter((o) => o.value !== 'all')
    if (raw.length === 0) {
      return [
        { label: '全部', value: '' },
        ...PLATFORM_CONFIGS.map((p) => ({ label: p.label, value: p.value }))
      ]
    }
    return [{ label: '全部', value: '' }, ...raw]
  })

  function rowMatchesSourceFilter(row: OpenAccountItem, filterValue: string) {
    if (!filterValue) return true
    const opts = cockpitMeta.value?.sourceOptions ?? []
    const byMeta = opts.find((o) => o.value === filterValue)
    if (byMeta) return row.source === byMeta.label
    return row.source === filterValue
  }

  function rowMatchesAppFilter(row: OpenAccountItem, filterValue: string) {
    if (!filterValue) return true
    const opts = cockpitMeta.value?.appOptions ?? []
    const byMeta = opts.find((o) => o.value === filterValue)
    if (byMeta) return row.app === byMeta.label || row.app === byMeta.value
    return row.app === filterValue
  }

  const loadOpenAccountList = async () => {
    if (!isOpenAccountEndpointMock(OpenAccountEndpoint.Table)) {
      try {
        const response = await fetchOpenAccountTable({ current: 1, size: 1000 })
        const rows = (response as any)?.records ?? (response as any)?.list ?? []
        if (Array.isArray(rows)) {
          list.value = rows
          autoSelectFirst()
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }
    const mockRes = await mockFetchOpenAccountTable({ current: 1, size: 1000 })
    list.value = mockRes.records
    autoSelectFirst()
  }

  const statusTypeMap: Record<string, 'default' | 'warn' | 'ok' | 'fail'> = {
    '': 'default',
    待分配: 'warn',
    已激活: 'ok',
    开户失败: 'fail'
  }

  const loadFilterOptions = async () => {
    if (isOpenAccountEndpointMock(OpenAccountEndpoint.FilterOptions)) {
      const res = await mockFetchOpenAccountFilterOptions()
      agencySelectOptions.value = res.agencyOptions
        .filter((i) => i.value !== '')
        .map((i) => i.label)
      statusOptionsState.value = res.statusOptions.map((i) => ({
        label: i.label,
        value: i.value,
        type: statusTypeMap[i.value] ?? 'default',
        count: i.count
      }))
      return
    }
    try {
      const res = await fetchOpenAccountFilterOptions()
      const agencyRaw = (res as any)?.agencyOptions ?? []
      const statusRaw = (res as any)?.statusOptions ?? []
      agencySelectOptions.value = Array.isArray(agencyRaw)
        ? agencyRaw
            .filter((i: any) => i?.value !== '')
            .map((i: any) => i?.label ?? i?.value)
            .filter(Boolean)
        : []
      statusOptionsState.value = Array.isArray(statusRaw)
        ? statusRaw.map((i: any) => ({
            label: i?.label ?? '',
            value: i?.value ?? '',
            type: statusTypeMap[i?.value ?? ''] ?? 'default',
            count: i?.count
          }))
        : statusOptionsState.value
    } catch {
      // fallback keep default
    }
  }

  const autoSelectFirst = () => {
    if (!props.selectedId && list.value.length > 0) {
      const first = list.value[0]
      innerSelectedId.value = first.id
      emit('select', first)
    }
  }

  const loadFeishuConfig = async () => {
    if (isOpenAccountEndpointMock(OpenAccountEndpoint.FeishuConfigFetch)) {
      const response = await mockFetchOpenAccountFeishuConfig()
      feishuEnabled.value = !!response.enabled
      return
    }
    try {
      const response = await fetchOpenAccountFeishuConfig()
      feishuEnabled.value = !!(response as any)?.enabled
    } catch {
      // keep default
    }
  }

  onMounted(async () => {
    filterMetaLoading.value = true
    try {
      await cockpitMetaFilterStore.ensureLoaded()
    } finally {
      filterMetaLoading.value = false
    }
    await loadFilterOptions()
    loadOpenAccountList()
    loadOverviewStats()
    loadFeishuConfig()
  })

  const removeFromList = (id: string) => {
    list.value = list.value.filter((i) => i.id !== id)
    if (innerSelectedId.value === id) innerSelectedId.value = ''
  }

  defineExpose({ reloadList: loadOpenAccountList, removeFromList })

  const filteredList = computed(() =>
    list.value.filter((item) => {
      const kw = props.searchKeyword.toLowerCase()
      if (kw && !item.id.toLowerCase().includes(kw) && !item.app.toLowerCase().includes(kw))
        return false
      if (!rowMatchesSourceFilter(item, sourceFilter.value)) return false
      if (statusFilter.value && item.status !== statusFilter.value) return false
      if (agencyFilter.value && item.agency !== agencyFilter.value) return false
      if (!rowMatchesAppFilter(item, appFilter.value)) return false
      return true
    })
  )

  const total = computed(() => filteredList.value.length)
  const pagedList = computed(() => {
    const s = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(s, s + pageSize.value)
  })

  const stats = computed(() => ({
    total: list.value.length,
    pending: list.value.filter((i) => i.status === '待分配').length,
    active: list.value.filter((i) => i.status === '已激活').length,
    failed: list.value.filter((i) => i.status === '开户失败').length
  }))

  const finalStats = computed(() => remoteStats.value ?? stats.value)

  const loadOverviewStats = async () => {
    if (isOpenAccountEndpointMock(OpenAccountEndpoint.OverviewStats)) {
      remoteStats.value = null
      return
    }
    try {
      remoteStats.value = await fetchOpenAccountOverviewStats({
        keyword: props.searchKeyword,
        source: sourceFilter.value,
        status: statusFilter.value,
        agency: agencyFilter.value,
        app: appFilter.value
      })
    } catch {
      remoteStats.value = null
    }
  }

  const statusOptions = computed(() =>
    statusOptionsState.value.map((item) => {
      if (item.value === '待分配') return { ...item, count: stats.value.pending }
      if (item.value === '已激活') return { ...item, count: stats.value.active }
      if (item.value === '开户失败') return { ...item, count: stats.value.failed }
      if (item.value === '') return { ...item, count: stats.value.total }
      return item
    })
  )

  watch(
    () => [
      props.searchKeyword,
      sourceFilter.value,
      statusFilter.value,
      agencyFilter.value,
      appFilter.value
    ],
    () => {
      currentPage.value = 1
      loadOverviewStats()
    }
  )

  function handleRowClick(row: OpenAccountItem) {
    innerSelectedId.value = row.id
    emit('select', row)
  }

  const handleJump = () => {
    const raw = parseInt(jumpPage.value, 10)
    jumpPage.value = ''
    if (Number.isNaN(raw) || raw < 1) return
    currentPage.value = Math.min(raw, Math.max(1, Math.ceil(total.value / pageSize.value)))
  }

  const handleOpenFeishuSetting = async () => {
    const nextEnabled = !feishuEnabled.value
    if (isOpenAccountEndpointMock(OpenAccountEndpoint.FeishuConfigSave)) {
      await mockSaveOpenAccountFeishuConfig({ enabled: nextEnabled })
    } else {
      try {
        await saveOpenAccountFeishuConfig({ enabled: nextEnabled })
      } catch {
        ElMessage.error('保存飞书推送设置失败')
        return
      }
    }
    feishuEnabled.value = nextEnabled
    ElMessage.success(nextEnabled ? '飞书推送已开启' : '飞书推送已关闭')
  }
</script>

<style lang="scss" scoped>
  .open-account-tab {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
</style>
