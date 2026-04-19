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
        <ElInput
          v-model="ownerTypeFilter"
          class="filter-select filter-select--narrow"
          placeholder="请输入"
          clearable
        />
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
      <div class="stat-card stat-card--total">
        <div class="stat-label">BC总数</div>
        <div class="stat-value stat-value--total">{{ stats.total }}</div>
      </div>
      <div class="stat-card stat-card--healthy">
        <div class="stat-label">健康/可用</div>
        <div class="stat-value stat-value--healthy">{{ stats.healthy }} 个</div>
      </div>
      <div class="stat-card stat-card--flagged">
        <div class="stat-label">有封户记录</div>
        <div class="stat-value stat-value--flagged">{{ stats.banned }} 个</div>
      </div>
      <div class="stat-card stat-card--open">
        <div class="stat-label">本月开户数</div>
        <div class="stat-value stat-value--open">{{ stats.monthOpen }} 个</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="pagedList"
        class="bc-table"
        max-height="630px"
        table-layout="fixed"
        :row-class-name="getRowClass"
        @row-click="handleRowClick"
      >
        <el-table-column prop="id" label="BM ID" min-width="90" align="left">
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
        <el-table-column
          prop="bmName"
          label="BM名称"
          min-width="130"
          align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="bm-name" :class="{ 'bm-name--inactive': row.status === '不再使用' }">{{
              row.bmName
            }}</span>
          </template>
        </el-table-column>
        <el-table-column label="广告平台" min-width="120" align="left">
          <template #default="{ row }">
            <span class="platform-chip" :style="getPlatformStyle(row.source)">{{
              row.source
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="group"
          label="归属组"
          min-width="100"
          align="left"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span class="group-text">{{ row.group }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="left">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusClass(row.status)]">
              <span class="status-icon">{{ getStatusIcon(row.status) }}</span>
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="开户主体" min-width="100" align="left">
          <template #default="{ row }">
            <span :class="['owner-badge', `owner-badge--${ownerClass(row.ownerType)}`]">{{
              row.ownerType
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="manager" label="管理员" min-width="80" align="left">
          <template #default="{ row }">
            <span class="manager-text">{{ row.manager }}</span>
          </template>
        </el-table-column>
        <el-table-column label="封户记录" min-width="90" align="left">
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
  import { fetchBcOverviewStats, fetchBcTable } from '@/api/config-management/account-management'
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
  const remoteStats = ref<{
    total: number
    healthy: number
    banned: number
    monthOpen: number
  } | null>(null)

  const loadList = async () => {
    const query = {
      current: 1,
      size: 1000,
      keyword: '',
      source: '',
      status: '',
      ownerType: '',
      banRecord: ''
    }

    const maybeLoadRemoteStats = async () => {
      if (!isAccountBcPage.value) return
      if (isBcManagementEndpointMock(BcManagementEndpoint.OverviewStats)) {
        remoteStats.value = null
        return
      }
      try {
        remoteStats.value = await fetchBcOverviewStats(query)
      } catch {
        remoteStats.value = null
      }
    }

    // 独立 BC 管理页：按页面级开关决定是否 mock/远程
    if (isAccountBcPage.value) {
      if (isBcManagementEndpointMock(BcManagementEndpoint.Table)) {
        const mockRes = await mockFetchBcTable(query)
        bcList.value = mockRes.records
        void maybeLoadRemoteStats()
        autoSelectFirst()
        return
      }
      try {
        const response = await fetchBcTable(query)
        const rows =
          (response as { records?: BcItem[] })?.records ??
          (response as { list?: BcItem[] })?.list ??
          []
        if (Array.isArray(rows)) {
          bcList.value = rows
          void maybeLoadRemoteStats()
          autoSelectFirst()
          return
        }
      } catch {
        // remote unavailable, fallback to mock
      }
    }

    // 配置管理 Tab：按 AccountApiSource 决定是否远程
    if (!isAccountBcPage.value && !AccountApiSource.bcTable) {
      try {
        const response = await fetchBcTable(query)
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

    // fallback: 内置 mock list
    bcList.value = mockBcList.map((i) => ({ ...i }))
    void maybeLoadRemoteStats()
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
      if (
        ownerTypeFilter.value &&
        !item.ownerType.toLowerCase().includes(ownerTypeFilter.value.toLowerCase())
      )
        return false
      if (banRecordFilter.value && item.banRecord !== banRecordFilter.value) return false
      return true
    })
  })

  const total = computed(() => filteredList.value.length)
  const pagedList = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredList.value.slice(start, start + pageSize.value)
  })

  const stats = computed(() => {
    if (remoteStats.value) return remoteStats.value
    return {
      total: bcList.value.length,
      healthy: bcList.value.filter((i) => i.status === '健康' || i.status === '可用').length,
      banned: bcList.value.filter((i) => i.banRecord === '有').length,
      monthOpen: bcList.value.reduce((s, i) => s + i.monthOpenCount, 0)
    }
  })

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
    const cls: string[] = []
    if (row.id === (props.selectedId ?? innerSelectedId.value)) cls.push('row-selected')
    if (row.status === '封禁') cls.push('row-banned')
    if (row.status === '不再使用') cls.push('row-inactive')
    return cls.join(' ')
  }

  const handleRowClick = (row: BcItem) => {
    innerSelectedId.value = row.id
    emit('select', row)
  }
</script>

<style lang="scss" scoped>
  .bc-tab {
    --bc-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --bc-border-strong: color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    --bc-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --bc-surface-soft: color-mix(in srgb, var(--default-box-color) 84%, transparent);
    --bc-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --bc-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);
    --green: var(--art-success);
    --green-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --amber: var(--art-warning);
    --amber-bg: color-mix(in srgb, var(--art-warning) 14%, transparent);
    --red: var(--art-danger);
    --red-bg: color-mix(in srgb, var(--art-danger) 12%, transparent);
    --purple: color-mix(in srgb, var(--theme-color) 42%, var(--el-color-primary) 58%);
    --purple-bg: color-mix(in srgb, var(--theme-color) 14%, transparent);

    display: flex;
    flex-direction: column;
    gap: 0;
  }

  // ─── 筛选栏 ────────────────────────────────────────────
  .filter-bar {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    padding: 16px 18px;
    margin-bottom: 16px;
    overflow: hidden;
    background:
      radial-gradient(
        ellipse 90% 70% at 12% 0%,
        color-mix(in srgb, var(--el-color-primary) 12%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 96%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 88%, transparent) 100%
      );
    isolation: isolate;
    border: 1px solid var(--bc-border);
    border-radius: 16px;
    box-shadow:
      0 12px 32px rgb(0 0 0 / 8%),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .filter-bar::after {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary) 40%, transparent) 42%,
      color-mix(in srgb, var(--theme-color) 32%, transparent) 58%,
      transparent 100%
    );
    opacity: 0.85;
  }

  .filter-group {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .filter-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .filter-select {
    width: 168px;

    &--narrow {
      width: 140px;
    }

    :deep(.el-select__wrapper),
    :deep(.el-input__wrapper) {
      min-height: 34px;
      color: var(--text-primary);
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent) !important;
      border: 1px solid var(--bc-border) !important;
      border-radius: 9999px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out),
        box-shadow var(--duration-fast) var(--ease-out);
    }

    :deep(.el-select__wrapper:hover),
    :deep(.el-input__wrapper:hover) {
      background: color-mix(in srgb, var(--el-color-primary) 9%, transparent) !important;
      border-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent) !important;
    }

    :deep(.el-select__wrapper.is-focused),
    :deep(.el-input__wrapper.is-focus) {
      border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent) !important;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 18%, transparent) !important;
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item),
    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
    }

    :deep(.el-select__caret) {
      color: var(--text-secondary);
    }
  }

  :deep(.el-select-dropdown__item.is-selected) {
    font-weight: 600;
    color: var(--el-color-primary);
  }

  :deep(.el-select-dropdown__item:hover) {
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
  }

  // ─── 统计卡片 ───────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    position: relative;
    padding: 16px 18px;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--bc-border);
    border-radius: 14px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 5%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      content: '';
    }

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 1px;
      pointer-events: none;
      content: '';
      opacity: 0.65;
    }

    &:hover {
      border-color: var(--bc-border-strong);
      box-shadow:
        0 10px 24px rgb(0 0 0 / 8%),
        0 0 0 1px color-mix(in srgb, var(--el-color-primary) 8%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
      transform: translateY(-1px);
    }

    &--total {
      background:
        radial-gradient(
          ellipse 110% 85% at 92% 8%,
          color-mix(in srgb, var(--el-color-primary) 20%, transparent) 0%,
          transparent 58%
        ),
        linear-gradient(
          155deg,
          var(--bc-surface) 0%,
          color-mix(in srgb, var(--default-bg-color) 35%, transparent) 100%
        );

      &::before {
        background: var(--el-color-primary);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--el-color-primary) 35%, transparent),
          transparent
        );
      }
    }

    &--healthy {
      background:
        radial-gradient(
          ellipse 100% 80% at 88% 0%,
          color-mix(in srgb, var(--art-success) 16%, transparent) 0%,
          transparent 55%
        ),
        linear-gradient(165deg, var(--bc-surface-soft) 0%, var(--bc-surface) 100%);

      &::before {
        background: var(--green);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--art-success) 30%, transparent),
          transparent
        );
      }
    }

    &--flagged {
      background:
        radial-gradient(
          ellipse 95% 78% at 85% 15%,
          color-mix(in srgb, var(--art-warning) 14%, transparent) 0%,
          transparent 58%
        ),
        linear-gradient(175deg, var(--bc-surface-soft) 0%, var(--bc-surface) 100%);

      &::before {
        background: var(--amber);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--art-warning) 32%, transparent),
          transparent
        );
      }
    }

    &--open {
      background:
        radial-gradient(
          ellipse 100% 80% at 10% 12%,
          color-mix(in srgb, var(--theme-color) 14%, transparent) 0%,
          transparent 56%
        ),
        linear-gradient(198deg, var(--bc-surface) 0%, var(--bc-surface-soft) 100%);

      &::before {
        background: var(--purple);
      }

      &::after {
        background: linear-gradient(
          90deg,
          transparent,
          color-mix(in srgb, var(--theme-color) 28%, transparent),
          transparent
        );
      }
    }
  }

  .stat-label {
    position: relative;
    z-index: 1;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .stat-value {
    position: relative;
    z-index: 1;
    font-size: 26px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    letter-spacing: -0.02em;

    &--total {
      color: var(--el-color-primary);
      text-shadow: 0 0 24px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    }

    &--healthy {
      color: var(--green);
      text-shadow: 0 0 20px color-mix(in srgb, var(--art-success) 18%, transparent);
    }

    &--flagged {
      color: var(--amber);
      text-shadow: 0 0 18px color-mix(in srgb, var(--art-warning) 14%, transparent);
    }

    &--open {
      color: var(--purple);
      text-shadow: 0 0 20px color-mix(in srgb, var(--theme-color) 16%, transparent);
    }
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bc-surface);
    border: 1px solid var(--bc-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .bc-table {
    width: 100%;
    cursor: pointer;

    --el-table-bg-color: transparent;
    --el-table-header-bg-color: var(--bc-header-bg);
    --el-table-row-hover-bg-color: var(--bc-row-hover);
    --el-table-border-color: var(--bc-border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);
    --el-table-border: 1px solid var(--bc-border);

    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 10px;
      font-size: 12px;
      font-weight: 600;
      background: var(--bc-header-bg) !important;
      border-bottom: 1px solid var(--bc-border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px;
      font-size: 13px;
      border-bottom: 1px solid var(--bc-border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(tr.row-banned:not(.row-selected) td.el-table__cell) {
      background: color-mix(in srgb, var(--art-warning) 8%, transparent) !important;
    }

    :deep(tr.row-inactive:not(.row-selected) td.el-table__cell) {
      opacity: 0.55;
    }

    :deep(tr.row-selected td.el-table__cell) {
      background: color-mix(in srgb, var(--el-color-primary) 11%, transparent) !important;
      border-bottom-color: color-mix(in srgb, var(--el-color-primary) 18%, transparent) !important;
    }
  }

  .bm-id {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: var(--text-primary);

    &--banned {
      color: var(--amber);
    }

    &--inactive {
      color: var(--text-muted);
    }
  }

  .bm-name {
    font-weight: 500;
    color: var(--text-primary);

    &--inactive {
      color: var(--text-muted);
    }
  }

  .platform-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 5px;
  }

  .group-text {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .manager-text {
    font-size: 13px;
    color: var(--text-primary);
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--healthy {
      color: var(--green);
    }

    &.status--available {
      color: var(--el-color-primary);
    }

    &.status--banned {
      color: var(--amber);
    }

    &.status--inactive {
      color: var(--text-muted);
    }

    &.status--other {
      color: var(--text-secondary);
    }
  }

  .status-icon {
    font-size: 10px;
  }

  .owner-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 6px;

    &--corp {
      color: var(--el-color-primary);
      background: var(--accent-dim);
    }

    &--personal {
      color: var(--purple);
      background: var(--purple-bg);
    }

    &--small {
      color: var(--green);
      background: var(--green-bg);
    }
  }

  .ban-badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &--no {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--text-tertiary) 12%, transparent);
    }

    &--yes {
      color: var(--amber);
      background: var(--amber-bg);
    }
  }

  .action-btns {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 4px 9px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);

    &--view {
      color: var(--text-secondary);

      &:hover {
        color: var(--el-color-primary);
        background: var(--accent-dim);
        transform: translateY(-0.5px);
      }
    }

    &--edit {
      color: var(--el-color-primary);

      &:hover {
        background: var(--accent-dim);
        transform: translateY(-0.5px);
      }
    }

    &--del {
      color: var(--red);

      &:hover {
        background: var(--red-bg);
        transform: translateY(-0.5px);
      }
    }
  }

  // ─── 分页 ──────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border-top: 1px solid var(--bc-border);
  }

  .pagination-total {
    margin-right: auto;
    font-size: 13px;
    color: var(--text-muted);
  }

  .bc-pagination {
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      line-height: 28px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 6px;
      transition:
        color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);

      &:hover {
        color: var(--el-color-primary);
      }

      &.is-active {
        font-weight: 700;
        color: var(--el-color-white);
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--el-color-primary) 94%, black 6%),
          color-mix(in srgb, var(--el-color-primary) 82%, black 18%)
        );
        box-shadow: 0 4px 12px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: color-mix(in srgb, var(--default-box-color) 65%, transparent) !important;
      border: 1px solid var(--bc-border) !important;
      border-radius: 6px;
      transition:
        color var(--duration-fast) var(--ease-out),
        border-color var(--duration-fast) var(--ease-out),
        background-color var(--duration-fast) var(--ease-out);

      &:hover {
        color: var(--el-color-primary) !important;
        border-color: color-mix(in srgb, var(--el-color-primary) 45%, transparent) !important;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .stat-card:hover {
      transform: none;
    }

    .action-btn:hover {
      transform: none;
    }
  }

  @media (width <= 1200px) {
    .stat-cards {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (width <= 560px) {
    .stat-cards {
      grid-template-columns: 1fr;
    }

    .pagination-bar {
      justify-content: center;
    }

    .pagination-total {
      flex: 1 1 100%;
      margin-right: 0;
      text-align: center;
    }
  }
</style>
