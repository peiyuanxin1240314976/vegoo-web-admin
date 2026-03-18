<template>
  <div class="ad-performance-detail-tab">
    <div class="ad-performance-detail-tab__toolbar">
      <div class="ad-performance-detail-tab__toolbar-left">
        <span class="ad-performance-detail-tab__hint">{{ data?.marketSummaryText ?? '-' }}</span>
      </div>
      <div class="ad-performance-detail-tab__toolbar-right">
        <span class="ad-performance-detail-tab__hint">{{ data?.sortHintText ?? '' }}</span>
      </div>
    </div>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>广告组明细</template>
      <ElTable :data="data?.adGroups ?? []" size="small" class="ad-performance-detail-table">
        <ElTableColumn prop="name" label="广告组名称" min-width="210" />
        <ElTableColumn prop="statusText" label="状态" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="statusTagType(row.statusText)" size="small" effect="plain">
              {{ row.statusText }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="spend" label="消耗" width="110" align="right">
          <template #default="{ row }">{{ formatMoney(row.spend, 0) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="cpi" label="CPI" width="90" align="right">
          <template #default="{ row }">{{ formatMoney(row.cpi, 2) }}</template>
        </ElTableColumn>
        <ElTableColumn prop="ctr" label="点击率" width="90" align="right">
          <template #default="{ row }">{{ row.ctr }}%</template>
        </ElTableColumn>
        <ElTableColumn prop="cvr" label="转化率" width="90" align="right">
          <template #default="{ row }">{{ row.cvr }}%</template>
        </ElTableColumn>
        <ElTableColumn prop="roi1" label="首日ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roi1)">{{ row.roi1 }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn prop="roiTotal" label="累ROI" width="90" align="right">
          <template #default="{ row }"
            ><span :class="roiClass(row.roiTotal)">{{ row.roiTotal }}%</span></template
          >
        </ElTableColumn>
        <ElTableColumn label="操作" width="80" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton link type="primary" size="small">{{ row.actionText ?? '详情' }}</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <ElCard shadow="never" class="ad-performance-detail-card">
      <template #header>广告组消耗占比</template>
      <div class="ad-performance-detail-distribution">
        <div class="ad-performance-detail-distribution__bar">
          <div
            v-for="(seg, idx) in distributionSegments"
            :key="seg.name + idx"
            class="ad-performance-detail-distribution__seg"
            :style="{ width: `${seg.percent}%`, background: seg.color }"
          >
            <span class="ad-performance-detail-distribution__seg-text">{{ seg.percent }}%</span>
          </div>
        </div>
        <div class="ad-performance-detail-distribution__legend">
          <div
            v-for="(seg, idx) in distributionSegments"
            :key="seg.name + idx"
            class="ad-performance-detail-distribution__legend-item"
          >
            <span
              class="ad-performance-detail-distribution__dot"
              :style="{ background: seg.color }"
            />
            <span class="ad-performance-detail-distribution__legend-text">
              {{ seg.name }} {{ seg.percent }}%
            </span>
          </div>
        </div>
      </div>
    </ElCard>

    <div class="ad-performance-detail-quick">
      <div
        v-for="(card, idx) in data?.quickCards ?? []"
        :key="card.title + idx"
        class="ad-performance-detail-quick__card"
      >
        <div class="ad-performance-detail-quick__title">{{ card.title }}</div>
        <div class="ad-performance-detail-quick__value" :class="toneClass(card.tone)">
          {{ card.value }}
        </div>
        <div class="ad-performance-detail-quick__sub">{{ card.sub ?? '' }}</div>
      </div>
    </div>

    <ElCard shadow="never" class="ad-performance-detail-card ad-performance-detail-insight">
      <template #header>
        <div class="ad-performance-detail-insight__header">
          <span class="ad-performance-detail-insight__title">{{
            data?.insightTitle ?? 'AI洞察与建议'
          }}</span>
          <ElButton round size="small" class="ad-performance-detail-insight__btn"
            >应用建议</ElButton
          >
        </div>
      </template>
      <div class="ad-performance-detail-insight__text">{{ data?.insightText ?? '-' }}</div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type {
    AdPerformanceDetailAdGroupTabData,
    AdPerformanceDetailQuickMetricCard
  } from '../../types'

  defineOptions({ name: 'AdPerformanceDetailTabAdGroup' })

  const props = defineProps<{
    data?: AdPerformanceDetailAdGroupTabData
  }>()

  function formatMoney(n: number, digits: 0 | 2) {
    const num = Number.isFinite(n) ? n : 0
    return (
      '$' +
      num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function roiClass(roi: number): string {
    return roi >= 80 ? 'is-roi-up' : 'is-roi-down'
  }

  function statusTagType(text: string): 'success' | 'warning' | 'info' | 'danger' {
    if (text.includes('激活')) return 'success'
    if (text.includes('暂停')) return 'info'
    if (text.includes('超预算')) return 'danger'
    return 'warning'
  }

  function toneClass(tone?: AdPerformanceDetailQuickMetricCard['tone']) {
    if (tone === 'success') return 'is-tone-success'
    if (tone === 'warning') return 'is-tone-warning'
    if (tone === 'danger') return 'is-tone-danger'
    return ''
  }

  const distributionSegments = computed(() => {
    const colors = ['#10B981', '#3B82F6', '#A1A1AA', '#F97316', '#8B5CF6']
    const list = props.data?.spendDistribution ?? []
    return list.map((item, idx) => ({
      ...item,
      percent: Math.max(0, Math.min(100, Math.round(item.percent))),
      color: colors[idx] ?? '#10B981'
    }))
  })
</script>

<style scoped lang="scss">
  .ad-performance-detail-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .ad-performance-detail-tab__toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    padding: 0 4px;
  }

  .ad-performance-detail-tab__hint {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail-card {
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 12px;

    :deep(.el-card__header) {
      padding-bottom: 0;
      font-size: 14px;
      font-weight: 800;
      color: var(--el-text-color-primary);
      border-bottom: none;
    }

    :deep(.el-card__body) {
      padding-top: 12px;
    }
  }

  .ad-performance-detail-table {
    :deep(.el-table) {
      background: transparent;
    }
  }

  .is-roi-up {
    font-weight: 700;
    color: var(--art-success);
  }

  .is-roi-down {
    font-weight: 700;
    color: var(--art-warning);
  }

  .ad-performance-detail-distribution__bar {
    display: flex;
    align-items: center;
    height: 38px;
    overflow: hidden;
    background: color-mix(in srgb, var(--default-border) 55%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 14px;
  }

  .ad-performance-detail-distribution__seg {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    font-size: 12px;
    font-weight: 800;
    color: rgb(255 255 255 / 92%);
  }

  .ad-performance-detail-distribution__seg-text {
    mix-blend-mode: screen;
  }

  .ad-performance-detail-distribution__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail-distribution__legend-item {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .ad-performance-detail-distribution__dot {
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
  }

  .ad-performance-detail-distribution__legend-text {
    max-width: 320px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-detail-quick {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .ad-performance-detail-quick__card {
    min-width: 0;
    padding: 14px;
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 12px;
  }

  .ad-performance-detail-quick__title {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail-quick__value {
    font-size: 18px;
    font-weight: 800;
    color: var(--el-text-color-primary);
  }

  .ad-performance-detail-quick__sub {
    min-height: 16px;
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .is-tone-success {
    color: var(--art-success);
  }

  .is-tone-warning {
    color: var(--art-warning);
  }

  .is-tone-danger {
    color: var(--art-danger);
  }

  .ad-performance-detail-insight {
    border-color: color-mix(in srgb, var(--art-success) 25%, var(--default-border));
  }

  .ad-performance-detail-insight__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
  }

  .ad-performance-detail-insight__title {
    font-weight: 900;
  }

  .ad-performance-detail-insight__btn {
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 55%, transparent);
  }

  .ad-performance-detail-insight__text {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-primary);
  }

  @media (width <= 1200px) {
    .ad-performance-detail-quick {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
