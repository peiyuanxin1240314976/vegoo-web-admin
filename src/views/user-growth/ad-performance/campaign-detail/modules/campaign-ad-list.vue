<template>
  <ElCard class="cal" shadow="never">
    <template #header>
      <div class="cal__header">
        <span class="cal__title">广告列表</span>
        <div class="cal__tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            class="cal__tab"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="activeStatus = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </template>

    <ElTable :data="filteredRows" size="small" style="width: 100%" stripe>
      <ElTableColumn prop="adGroupName" label="广告组" min-width="180">
        <template #default="{ row }">
          <span class="cal__ad-name">{{ row.adGroupName }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="状态" width="70" align="center">
        <template #default="{ row }">
          <span class="cal__status" :class="`cal__status--${row.status}`">
            <span class="cal__status-dot"></span>
            {{ statusLabel(row.status) }}
          </span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="消耗" width="72" align="right">
        <template #default="{ row }"> ${{ formatK(row.spend) }} </template>
      </ElTableColumn>

      <ElTableColumn label="安装" width="62" align="right">
        <template #default="{ row }">
          {{ formatK(row.installs) }}
        </template>
      </ElTableColumn>

      <ElTableColumn label="CPI" width="62" align="right">
        <template #default="{ row }"> ${{ row.cpi.toFixed(2) }} </template>
      </ElTableColumn>

      <ElTableColumn label="ROI" width="62" align="right">
        <template #default="{ row }">
          <span :class="row.roi >= 100 ? 'cal__roi--good' : 'cal__roi--warn'">
            {{ row.roi }}%
          </span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="70" align="center" fixed="right">
        <template #default="{ row }">
          <div class="cal__actions">
            <button type="button" class="cal__action-btn" title="查看" @click="goToAdDetail(row)">
              <el-icon><View /></el-icon>
            </button>
            <button type="button" class="cal__action-btn cal__action-btn--warn" title="暂停">
              <el-icon><VideoPause /></el-icon>
            </button>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { View, VideoPause } from '@element-plus/icons-vue'
  import type { CampaignAdRow } from '../types'

  defineOptions({ name: 'CampaignAdList' })

  const props = withDefaults(
    defineProps<{
      rows?: CampaignAdRow[]
      campaignId?: string
    }>(),
    { rows: () => [], campaignId: '' }
  )

  const router = useRouter()

  function goToAdDetail(row: CampaignAdRow) {
    router.push({
      path: '/user-growth/ad-performance/campaign-detail/ad-detail',
      query: { id: row.id, campaignId: props.campaignId }
    })
  }

  type StatusFilter = 'all' | 'active' | 'paused' | 'completed'

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '正常' },
    { value: 'paused', label: '暂停' },
    { value: 'completed', label: '完成' }
  ]

  const activeStatus = ref<StatusFilter>('all')

  const filteredRows = computed(() => {
    if (activeStatus.value === 'all') return props.rows
    return props.rows.filter((r) => r.status === activeStatus.value)
  })

  function statusLabel(s: string) {
    const map: Record<string, string> = { active: '启用', paused: '暂停', completed: '完成' }
    return map[s] ?? s
  }

  function formatK(v: number): string {
    return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
  }
</script>

<style scoped lang="scss">
  .cal {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 14px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 0;
    }
  }

  .cal__header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .cal__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .cal__tabs {
    display: flex;
    gap: 2px;
    padding: 3px;
    background: color-mix(in srgb, var(--default-border) 40%, transparent);
    border-radius: 8px;
  }

  .cal__tab {
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: all 0.15s ease;

    &.is-active {
      color: var(--el-text-color-primary);
      background: var(--default-box-color);
      box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
    }
  }

  .cal__ad-name {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .cal__status {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
  }

  .cal__status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .cal__status--active {
    color: var(--art-success);

    .cal__status-dot {
      background: var(--art-success);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--art-success) 20%, transparent);
    }
  }

  .cal__status--paused {
    color: var(--art-warning);

    .cal__status-dot {
      background: var(--art-warning);
    }
  }

  .cal__status--completed {
    color: var(--el-text-color-secondary);

    .cal__status-dot {
      background: var(--el-text-color-secondary);
    }
  }

  .cal__roi--good {
    font-weight: 600;
    color: var(--art-success);
  }

  .cal__roi--warn {
    font-weight: 600;
    color: var(--art-warning);
  }

  .cal__actions {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
  }

  .cal__action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--default-border);
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      color: var(--art-primary);
      border-color: var(--art-primary);
    }

    &--warn:hover {
      color: var(--art-warning);
      border-color: var(--art-warning);
    }
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table__header th) {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    background: var(--default-bg-color);
  }
</style>
