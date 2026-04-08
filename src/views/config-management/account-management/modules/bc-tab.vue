<template>
  <div class="bc-tab">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">广告平台：</span>
        <ElSelect
          v-model="sourceFilter"
          class="filter-select"
          placeholder="全部"
          clearable
          filterable
          :loading="sourceFilterLoading"
        >
          <ElOption
            v-for="o in sourceOptions"
            :key="o.value || 'all'"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </div>
      <div class="filter-group">
        <span class="filter-label">状态：</span>
        <ElSelect
          v-model="statusFilter"
          class="filter-select filter-select--narrow"
          placeholder="全部"
          clearable
        >
          <ElOption
            v-for="s in statusOptions"
            :key="s.value || 'all'"
            :label="s.label"
            :value="s.value"
          />
        </ElSelect>
      </div>
      <div class="filter-group">
        <span class="filter-label">开户主体：</span>
        <ElSelect
          v-model="ownerTypeFilter"
          class="filter-select filter-select--narrow"
          placeholder="全部"
          clearable
        >
          <ElOption
            v-for="o in ownerTypeOptions"
            :key="o.value || 'all'"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
      </div>
      <div class="filter-group">
        <span class="filter-label">封户记录：</span>
        <ElSelect
          v-model="banRecordFilter"
          class="filter-select filter-select--narrow"
          placeholder="全部"
          clearable
        >
          <ElOption
            v-for="b in banRecordOptions"
            :key="b.value || 'all'"
            :label="b.label"
            :value="b.value"
          />
        </ElSelect>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-label">BC总数</div>
        <div class="stat-value stat-value--white">{{ stats.total }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">健康/可用</div>
        <div class="stat-value stat-value--green">{{ stats.healthy }} 个</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">有封户记录</div>
        <div class="stat-value stat-value--amber">{{ stats.banned }} 个</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">本月开户数</div>
        <div class="stat-value stat-value--blue">{{ stats.monthOpen }} 个</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        class="bc-table"
        table-layout="auto"
        :row-class-name="getRowClass"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="BM ID" min-width="90">
          <template #default="{ row }">
            <span
              class="bm-id"
              :class="{
                'bm-id--banned': row.status === '封禁',
                'bm-id--inactive': row.status === '不再使用'
              }"
              >{{ row.id }}</span
            >
          </template>
        </el-table-column>
        <el-table-column prop="bmName" label="BM名称" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="bm-name" :class="{ 'bm-name--inactive': row.status === '不再使用' }">{{
              row.bmName
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="120">
          <template #default="{ row }">
            <span class="platform-chip" :style="getPlatformStyle(row.source)">{{
              row.source
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="group" label="归属组" min-width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="group-text">{{ row.group }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              <span class="status-icon">{{ getStatusIcon(row.status) }}</span>
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="开户主体" min-width="100" align="center">
          <template #default="{ row }">
            <span :class="['owner-badge', `owner-badge--${ownerClass(row.ownerType)}`]">{{
              row.ownerType
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="管理员" min-width="80" align="center">
          <template #default="{ row }">
            <span class="manager-text">{{ row.manager }}</span>
          </template>
        </el-table-column>
        <el-table-column label="封户记录" min-width="90" align="center">
          <template #default="{ row }">
            <span
              :class="['ban-badge', row.banRecord === '有' ? 'ban-badge--yes' : 'ban-badge--no']"
              >{{ row.banRecord }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--view" @click.stop="emit('select', row)"
                >查看</button
              >
              <button class="action-btn action-btn--edit" @click.stop="emit('edit', row)"
                >编辑</button
              >
              <button
                v-if="row.status !== '不再使用'"
                class="action-btn action-btn--del"
                @click.stop="emit('delete', row)"
                >删除</button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <span class="pagination-total">共{{ total }}条</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          class="bc-pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { fetchBcTable } from '@/api/config-management/account-management'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import { AccountApiSource } from '../config/data-source'
  import {
    BcManagementEndpoint,
    isBcManagementEndpointMock
  } from '@/views/account-management/bc-management/config/data-source'
  import { mockFetchBcTable } from '@/views/account-management/bc-management/mock/bc-management-api-mock'
  import { PLATFORM_CONFIGS } from '../types'
  import type { BcItem } from '../types'

  defineOptions({ name: 'BcTab' })

  const props = defineProps<{
    searchKeyword: string
    selectedId?: string
  }>()

  const emit = defineEmits<{
    select: [row: BcItem]
    edit: [row: BcItem]
    delete: [row: BcItem]
  }>()

  // 广告平台筛选：直接使用 cockpit-meta-filter 实时数据
  const bcPlatforms = PLATFORM_CONFIGS.filter((p) => ['Meta Ads', 'TikTok Ads'].includes(p.value))
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(cockpitMetaFilterStore)
  const sourceFilterLoading = ref(false)

  const sourceOptions = computed(() => {
    const metaSources = (cockpitMeta.value?.sourceOptions ?? []) as CockpitMetaOptionItem[]
    const mapped = metaSources
      .filter((opt) => opt.value !== 'all')
      .map((opt) => ({ label: opt.label, value: opt.value }))
    if (mapped.length > 0) return [{ label: '全部', value: '' }, ...mapped]
    return [
      { label: '全部', value: '' },
      ...bcPlatforms.map((p) => ({ label: p.label, value: p.value }))
    ]
  })

  const statusOptions = [
    { label: '全部', value: '' },
    { label: '健康', value: '健康' },
    { label: '可用', value: '可用' },
    { label: '不再使用', value: '不再使用' },
    { label: '封禁', value: '封禁' },
    { label: '其他', value: '其他' }
  ]
  const ownerTypeOptions = [
    { label: '全部', value: '' },
    { label: '企业户', value: '企业户' },
    { label: '个人户', value: '个人户' },
    { label: '小额广告户', value: '小额广告户' }
  ]
  const banRecordOptions = [
    { label: '全部', value: '' },
    { label: '有封户记录', value: '有' },
    { label: '无封户记录', value: '无' }
  ]

  const sourceFilter = ref('')
  const statusFilter = ref('')
  const ownerTypeFilter = ref('')
  const banRecordFilter = ref('')
  const currentPage = ref(1)
  const pageSize = ref(10)
  const innerSelectedId = ref('')

  // Mock 数据
  const mockBcList: BcItem[] = [
    {
      id: 'BM-001',
      bmId: '123456789012345',
      bmName: 'Vegoo主务BC',
      source: 'Meta Ads',
      group: 'Google组',
      status: '健康',
      ownerType: '企业户',
      manager: '张三',
      banRecord: '无',
      banDesc: '',
      createTime: '2022-06-15',
      remark: 'Vegoo公司主要Meta平台BC',
      linkedAccounts: 45,
      activeAccounts: 40,
      inactiveAccounts: 5,
      monthSpend: 128450,
      monthOpenCount: 8
    },
    {
      id: 'BM-002',
      bmId: '234567890123456',
      bmName: 'Vegoo备用BC',
      source: 'Meta Ads',
      group: 'Google组',
      status: '健康',
      ownerType: '企业户',
      manager: '李四',
      banRecord: '无',
      banDesc: '',
      createTime: '2022-08-20',
      remark: '',
      linkedAccounts: 28,
      activeAccounts: 25,
      inactiveAccounts: 3,
      monthSpend: 45230,
      monthOpenCount: 3
    },
    {
      id: 'BM-003',
      bmId: '345678901234567',
      bmName: 'TT主务BC',
      source: 'TikTok Ads',
      group: 'TikTok组',
      status: '健康',
      ownerType: '企业户',
      manager: '王五',
      banRecord: '无',
      banDesc: '',
      createTime: '2023-01-10',
      remark: '',
      linkedAccounts: 18,
      activeAccounts: 16,
      inactiveAccounts: 2,
      monthSpend: 56780,
      monthOpenCount: 2
    },
    {
      id: 'BM-004',
      bmId: '456789012345678',
      bmName: 'FB-Agency-A-BC',
      source: 'Meta Ads',
      group: 'Agency-A组',
      status: '可用',
      ownerType: '企业户',
      manager: '张三',
      banRecord: '有',
      banDesc: '曾有封户记录',
      createTime: '2022-11-05',
      remark: '',
      linkedAccounts: 32,
      activeAccounts: 28,
      inactiveAccounts: 4,
      monthSpend: 98230,
      monthOpenCount: 4
    },
    {
      id: 'BM-005',
      bmId: '567890123456789',
      bmName: 'FB-Agency-B-BC',
      source: 'Meta Ads',
      group: 'Agency-B组',
      status: '可用',
      ownerType: '个人户',
      manager: '李四',
      banRecord: '有',
      banDesc: '',
      createTime: '2023-02-14',
      remark: '',
      linkedAccounts: 15,
      activeAccounts: 12,
      inactiveAccounts: 3,
      monthSpend: 23450,
      monthOpenCount: 1
    },
    {
      id: 'BM-006',
      bmId: '678901234567890',
      bmName: 'TT-Agency-BC',
      source: 'TikTok Ads',
      group: 'Agency-B组',
      status: '封禁',
      ownerType: '小额广告户',
      manager: '王五',
      banRecord: '有',
      banDesc: '账户异常被封',
      createTime: '2023-04-20',
      remark: '',
      linkedAccounts: 8,
      activeAccounts: 0,
      inactiveAccounts: 8,
      monthSpend: 0,
      monthOpenCount: 0
    },
    {
      id: 'BM-007',
      bmId: '789012345678901',
      bmName: '备用BC-01',
      source: 'Meta Ads',
      group: 'Google组',
      status: '不再使用',
      ownerType: '企业户',
      manager: '张三',
      banRecord: '无',
      banDesc: '',
      createTime: '2021-12-01',
      remark: '',
      linkedAccounts: 0,
      activeAccounts: 0,
      inactiveAccounts: 0,
      monthSpend: 0,
      monthOpenCount: 0
    },
    {
      id: 'BM-008',
      bmId: '890123456789012',
      bmName: 'TT备用BC',
      source: 'TikTok Ads',
      group: 'TikTok组',
      status: '健康',
      ownerType: '企业户',
      manager: '王五',
      banRecord: '无',
      banDesc: '',
      createTime: '2023-06-01',
      remark: '',
      linkedAccounts: 12,
      activeAccounts: 10,
      inactiveAccounts: 2,
      monthSpend: 34560,
      monthOpenCount: 2
    }
  ]

  const bcList = ref<BcItem[]>([])
  const route = useRoute()
  const isAccountBcPage = computed(() => route.path.includes('/account-management/bc-management'))

  const loadList = async () => {
    if (isAccountBcPage.value && isBcManagementEndpointMock(BcManagementEndpoint.Table)) {
      const mockRes = await mockFetchBcTable({
        current: 1,
        size: 1000,
        keyword: '',
        source: '',
        status: '',
        ownerType: '',
        banRecord: ''
      })
      bcList.value = mockRes.records
      autoSelectFirst()
      return
    }
    if (!AccountApiSource.bcTable) {
      try {
        const response = await fetchBcTable({
          current: 1,
          size: 1000,
          keyword: '',
          source: '',
          status: '',
          ownerType: '',
          banRecord: ''
        })
        const rows =
          (response as { records?: BcItem[] })?.records ??
          (response as { list?: BcItem[] })?.list ??
          []
        if (Array.isArray(rows)) {
          bcList.value = rows
          autoSelectFirst()
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }
    bcList.value = mockBcList.map((i) => ({ ...i }))
    autoSelectFirst()
  }

  const autoSelectFirst = () => {
    if (!props.selectedId && bcList.value.length > 0) {
      const first = bcList.value[0]
      innerSelectedId.value = first.id
      emit('select', first)
    }
  }

  onMounted(async () => {
    sourceFilterLoading.value = true
    try {
      await cockpitMetaFilterStore.ensureLoaded()
    } finally {
      sourceFilterLoading.value = false
    }
    void loadList()
  })

  defineExpose({
    reloadList: loadList,
    removeFromList: (id: string) => {
      bcList.value = bcList.value.filter((i) => i.id !== id)
      if (innerSelectedId.value === id) innerSelectedId.value = ''
    }
  })

  const filteredList = computed(() => {
    return bcList.value.filter((item) => {
      const kw = props.searchKeyword.toLowerCase()
      if (
        kw &&
        !item.id.toLowerCase().includes(kw) &&
        !item.bmName.toLowerCase().includes(kw) &&
        !item.bmId.includes(kw)
      )
        return false
      if (sourceFilter.value && item.source !== sourceFilter.value) return false
      if (statusFilter.value && item.status !== statusFilter.value) return false
      if (ownerTypeFilter.value && item.ownerType !== ownerTypeFilter.value) return false
      if (banRecordFilter.value && item.banRecord !== banRecordFilter.value) return false
      return true
    })
  })

  const total = computed(() => filteredList.value.length)
  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  const stats = computed(() => ({
    total: bcList.value.length,
    healthy: bcList.value.filter((i) => i.status === '健康' || i.status === '可用').length,
    banned: bcList.value.filter((i) => i.banRecord === '有').length,
    monthOpen: bcList.value.reduce((s, i) => s + i.monthOpenCount, 0)
  }))

  watch(
    () => [
      props.searchKeyword,
      sourceFilter.value,
      statusFilter.value,
      ownerTypeFilter.value,
      banRecordFilter.value
    ],
    () => {
      currentPage.value = 1
    }
  )

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color, background: cfg.bg }
  }

  function getStatusClass(status: string) {
    if (status === '健康') return 'status--healthy'
    if (status === '可用') return 'status--available'
    if (status === '封禁') return 'status--banned'
    if (status === '不再使用') return 'status--inactive'
    return 'status--other'
  }

  function getStatusIcon(status: string) {
    if (status === '健康' || status === '可用') return '●'
    if (status === '封禁') return '▲'
    if (status === '不再使用') return '■'
    return '●'
  }

  function ownerClass(ownerType: string) {
    if (ownerType === '企业户') return 'corp'
    if (ownerType === '个人户') return 'personal'
    return 'small'
  }

  function getRowClass({ row }: { row: BcItem }) {
    if (row.id === (props.selectedId ?? innerSelectedId.value)) return 'row--selected'
    if (row.status === '封禁') return 'row--banned'
    if (row.status === '不再使用') return 'row--inactive'
    return ''
  }

  const handleRowClick = (row: BcItem) => {
    innerSelectedId.value = row.id
    emit('select', row)
  }
</script>

<style lang="scss" scoped>
  .bc-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  // ─── 筛选栏 ─────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 20px;
    align-items: center;
    padding: 12px 16px;
    background: #131c2e;
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .filter-group {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .filter-select {
    width: 168px;

    &--narrow {
      width: 140px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 9999px;
      box-shadow: none !important;
      transition: border-color var(--duration-fast) var(--ease-default);

      &:focus-within {
        border-color: #3b82f6 !important;
      }
    }

    :deep(.el-input__inner),
    :deep(.el-select__placeholder) {
      font-size: 12px;
      color: #e2e8f0;
    }
  }

  // ─── 统计卡片 ────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px 20px;
    background: #131c2e;
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .stat-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: #94a3b8;
  }

  .stat-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;

    &--white {
      color: #e2e8f0;
    }

    &--green {
      color: #22c55e;
    }

    &--amber {
      color: #f59e0b;
    }

    &--blue {
      color: #3b82f6;
    }
  }

  // ─── 表格 ────────────────────────────────────────────
  .table-wrapper {
    padding: 16px;
    background: #131c2e;
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .bc-table {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 3%);
    --el-table-border-color: rgb(255 255 255 / 6%);
    --el-table-text-color: #e2e8f0;
    --el-table-header-text-color: #64748b;

    cursor: pointer;

    :deep(th.el-table__cell) {
      font-size: 12px;
      background: transparent;
    }

    :deep(td.el-table__cell) {
      font-size: 13px;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.row--selected td.el-table__cell) {
      background: rgb(59 130 246 / 8%) !important;
    }

    :deep(.row--banned td.el-table__cell) {
      background: rgb(245 158 11 / 5%) !important;
    }

    :deep(.row--inactive td.el-table__cell) {
      opacity: 0.5;
    }
  }

  .bm-id {
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    color: #e2e8f0;

    &--banned {
      color: #f59e0b;
    }

    &--inactive {
      color: #64748b;
    }
  }

  .bm-name {
    font-weight: 500;

    &--inactive {
      color: #64748b;
    }
  }

  .platform-chip {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
  }

  .group-text {
    font-size: 12px;
    color: #94a3b8;
  }

  .manager-text {
    font-size: 13px;
    color: #e2e8f0;
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--healthy {
      color: #22c55e;
    }

    &.status--available {
      color: #3b82f6;
    }

    &.status--banned {
      color: #f59e0b;
    }

    &.status--inactive {
      color: #64748b;
    }

    &.status--other {
      color: #94a3b8;
    }
  }

  .status-icon {
    font-size: 10px;
  }

  .owner-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--corp {
      color: #60a5fa;
      background: rgb(96 165 250 / 12%);
    }

    &--personal {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }

    &--small {
      color: #34d399;
      background: rgb(52 211 153 / 12%);
    }
  }

  .ban-badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;

    &--no {
      color: #64748b;
      background: rgb(100 116 139 / 15%);
    }

    &--yes {
      color: #f59e0b;
      background: rgb(245 158 11 / 15%);
    }
  }

  .action-btns {
    display: flex;
    gap: 4px;
    justify-content: center;
  }

  .action-btn {
    padding: 2px 0;
    font-size: 12px;
    cursor: pointer;
    background: none;
    border: none;
    transition: opacity 0.15s;

    &::before {
      color: #475569;
      content: '[';
    }

    &::after {
      color: #475569;
      content: ']';
    }

    &--view {
      color: #3b82f6;

      &:hover {
        opacity: 0.75;
      }
    }

    &--edit {
      color: #22c55e;

      &:hover {
        opacity: 0.75;
      }
    }

    &--del {
      color: #f87171;

      &:hover {
        opacity: 0.75;
      }
    }
  }

  // ─── 分页 ────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding-top: 14px;
    margin-top: 4px;
    border-top: 1px solid rgb(255 255 255 / 7%);
  }

  .pagination-total {
    font-size: 13px;
    color: #94a3b8;
  }

  .bc-pagination {
    :deep(.el-pager li) {
      color: #94a3b8;
      background: transparent;

      &.is-active {
        color: #3b82f6;
        background: rgb(59 130 246 / 15%);
        border-radius: 4px;
      }

      &:hover:not(.is-active) {
        color: #e2e8f0;
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: #94a3b8;
      background: transparent;

      &:hover {
        color: #e2e8f0;
      }
    }
  }
</style>
