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
            @click="onSwitchStatus(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </template>

    <ElTable :data="props.rows" size="small" style="width: 100%" stripe>
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

      <ElTableColumn label="ROI1" width="88" align="right">
        <template #default="{ row }">
          <span :class="roiToneClass(row.roi1)">{{ formatRoiPct(row.roi1) }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="总ROI" width="88" align="right">
        <template #default="{ row }">
          <span :class="roiToneClass(row.roiTotal)">{{ formatRoiPct(row.roiTotal) }}</span>
        </template>
      </ElTableColumn>

      <ElTableColumn label="操作" width="70" align="center" fixed="right">
        <template #default="{ row }">
          <div class="cal__actions">
            <button type="button" class="cal__action-btn" title="查看" @click="goToAdDetail(row)">
              <el-icon><View /></el-icon>
            </button>
            <!-- <button
              type="button"
              class="cal__action-btn cal__action-btn--warn"
              title="暂停"
              @click.stop="onPauseAd(row)"
            >
              <el-icon><VideoPause /></el-icon>
            </button> -->
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  // import { ElMessage } from 'element-plus'
  import {
    View
    // VideoPause
  } from '@element-plus/icons-vue'
  // import { fetchCampaignDetailAdGroupAction } from '@/api/user-growth/ad-performance'
  import type { CampaignAdRow } from '../types'

  defineOptions({ name: 'CampaignAdList' })

  type StatusFilter = 'all' | 'active' | 'paused' | 'completed'

  const emit = defineEmits<{
    'refresh-ad-list': []
    'change-status': [StatusFilter]
  }>()

  const props = withDefaults(
    defineProps<{
      rows?: CampaignAdRow[]
      campaignId?: string
      status?: StatusFilter
    }>(),
    { rows: () => [], campaignId: '', status: 'all' }
  )

  const router = useRouter()

  function goToAdDetail(row: CampaignAdRow) {
    router.push({
      path: '/campaign-detail/ad-detail',
      query: { id: row.id, campaignId: props.campaignId }
    })
  }

  // async function onPauseAd(row: CampaignAdRow) {
  //   const cid = props.campaignId
  //   if (!cid) {
  //     ElMessage.error('缺少广告系列 ID')
  //     return
  //   }
  //   try {
  //     const res = await fetchCampaignDetailAdGroupAction({
  //       campaignId: cid,
  //       adId: row.id,
  //       actionType: 'pause'
  //     })
  //     if (res.message) ElMessage.success(res.message)
  //     else ElMessage.success('操作成功')
  //     emit('refresh-ad-list')
  //   } catch {
  //     ElMessage.error('操作失败')
  //   }
  // }

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '正常' },
    { value: 'paused', label: '暂停' },
    { value: 'completed', label: '完成' }
  ]

  const activeStatus = ref<StatusFilter>(props.status)

  watch(
    () => props.status,
    (v) => {
      if (v && activeStatus.value !== v) activeStatus.value = v
    }
  )

  function onSwitchStatus(v: StatusFilter) {
    if (activeStatus.value === v) return
    activeStatus.value = v
    emit('change-status', v)
  }

  function statusLabel(s: string) {
    const map: Record<string, string> = { active: '启用', paused: '暂停', completed: '完成' }
    return map[s] ?? s
  }

  function formatK(v: number): string {
    return v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
  }

  function formatRoiPct(v: number): string {
    if (!Number.isFinite(v)) return '—'
    return `${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
  }

  function roiToneClass(v: number): string {
    return Number.isFinite(v) && v >= 100 ? 'cal__roi--good' : 'cal__roi--warn'
  }
</script>

<style scoped lang="scss">
  @use '../../styles/ap-card-fx.scss' as *;

  .cal {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    overflow: hidden;
    border-radius: 14px;

    /* 顶部青蓝高光线 */
    &::before {
      position: absolute;
      top: 0;
      left: 5%;
      z-index: 0;
      width: 90%;
      height: 1.5px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(6 182 212 / 78%),
        rgb(59 130 246 / 82%),
        rgb(16 185 129 / 65%),
        transparent
      );
      filter: blur(0.4px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 12px;
      background: transparent;
      border-bottom: 1px solid rgb(6 182 212 / 18%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 0;
      background: transparent;
    }

    :deep(.el-table) {
      background: transparent;

      --el-table-bg-color: transparent;
      --el-table-tr-bg-color: transparent;
      --el-table-header-bg-color: rgb(6 182 212 / 6%);
      --el-table-row-hover-bg-color: rgb(59 130 246 / 10%);
      --el-table-border-color: rgb(96 165 250 / 15%);
    }

    :deep(.el-table th.el-table__cell) {
      font-size: 12px;
      font-weight: 700;
      color: #7dd3fc;
      text-shadow: 0 0 8px rgb(125 211 252 / 40%);
      letter-spacing: 0.04em;
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
    @include ap-title-gradient;

    font-size: 13px;
  }

  .cal__tabs {
    display: flex;
    gap: 2px;
    padding: 3px;
    background: rgb(6 182 212 / 8%);
    border: 1px solid rgb(6 182 212 / 20%);
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
    transition:
      color 0.15s ease,
      background 0.15s ease,
      box-shadow 0.15s ease;

    &.is-active {
      color: #22d3ee;
      text-shadow: 0 0 8px rgb(34 211 238 / 45%);
      background: rgb(6 182 212 / 16%);
      box-shadow:
        0 1px 6px rgb(0 0 0 / 28%),
        0 0 10px rgb(6 182 212 / 20%);
    }

    &:not(.is-active):hover {
      color: var(--el-text-color-primary);
      background: rgb(255 255 255 / 5%);
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
    color: #10b981;
    text-shadow: 0 0 6px rgb(16 185 129 / 40%);

    .cal__status-dot {
      background: #10b981;
      box-shadow:
        0 0 0 3px rgb(16 185 129 / 20%),
        0 0 8px rgb(16 185 129 / 50%);
    }
  }

  .cal__status--paused {
    color: #f97316;

    .cal__status-dot {
      background: #f97316;
      box-shadow: 0 0 6px rgb(249 115 22 / 45%);
    }
  }

  .cal__status--completed {
    color: var(--el-text-color-secondary);

    .cal__status-dot {
      background: var(--el-text-color-secondary);
    }
  }

  .cal__roi--good {
    font-weight: 700;
    color: #10b981;
    text-shadow: 0 0 8px rgb(16 185 129 / 45%);
  }

  .cal__roi--warn {
    font-weight: 700;
    color: #f97316;
    text-shadow: 0 0 8px rgb(249 115 22 / 45%);
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
