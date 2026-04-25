<template>
  <div class="ad-performance-detail">
    <div class="ad-performance-detail__header">
      <div class="ad-performance-detail__header-left">
        <div class="ad-performance-detail__title">{{
          detail?.header.title ?? campaignRow.name
        }}</div>
        <div class="ad-performance-detail__status">
          <span class="ad-performance-detail__status-dot" />
          <span class="ad-performance-detail__status-text">
            {{ detail?.header.statusText ?? '激活' }}
          </span>
        </div>
      </div>

      <div class="ad-performance-detail__header-actions">
        <ElButton round class="ad-performance-detail__header-btn" @click="onEdit">详情</ElButton>
        <!-- <ElButton
          round
          class="ad-performance-detail__header-btn ad-performance-detail__header-btn--warn"
          @click="onPause"
        >
          暂停
        </ElButton> -->
        <ElButton text round class="ad-performance-detail__close" @click="emit('close')"
          >关闭</ElButton
        >
      </div>
    </div>

    <div class="ad-performance-detail__content">
      <div class="ad-performance-detail__top-kpi">
        <div class="ad-performance-detail__kpi-card ad-performance-detail__kpi-card--spend">
          <div class="ad-performance-detail__kpi-label">总消耗</div>
          <div class="ad-performance-detail__kpi-value">{{
            formatMoney(detail?.topKpi.totalSpend ?? 0, 0)
          }}</div>
        </div>
        <div class="ad-performance-detail__kpi-card ad-performance-detail__kpi-card--cpi">
          <div class="ad-performance-detail__kpi-label">CPI</div>
          <div class="ad-performance-detail__kpi-value">{{
            formatMoney(detail?.topKpi.cpi ?? 0, 2)
          }}</div>
        </div>
        <div class="ad-performance-detail__kpi-card ad-performance-detail__kpi-card--roi">
          <div class="ad-performance-detail__kpi-label">首日ROI</div>
          <div class="ad-performance-detail__kpi-value">{{ detail?.topKpi.roi1 ?? 0 }}%</div>
        </div>
        <div class="ad-performance-detail__kpi-card ad-performance-detail__kpi-card--progress">
          <div class="ad-performance-detail__kpi-label">预算进度</div>
          <div class="ad-performance-detail__kpi-progress">
            <div class="ad-performance-detail__kpi-progress-text">
              {{ detail?.topKpi.budgetProgressPercent ?? 0 }}%
            </div>
            <ElProgress
              :percentage="detail?.topKpi.budgetProgressPercent ?? 0"
              type="circle"
              :width="44"
              :stroke-width="6"
              :show-text="false"
              color="var(--art-warning)"
            />
          </div>
        </div>
      </div>

      <div class="ad-performance-detail__roi-row">
        <div class="ad-performance-detail__roi-item">
          <div class="ad-performance-detail__roi-k">首日ROI</div>
          <div class="ad-performance-detail__roi-v">{{ detail?.roiSummary.roi1 ?? 0 }}%</div>
        </div>
        <div class="ad-performance-detail__roi-item">
          <div class="ad-performance-detail__roi-k">3日ROI</div>
          <div class="ad-performance-detail__roi-v ad-performance-detail__roi-v--success">
            {{ detail?.roiSummary.roi3 ?? 0 }}%
          </div>
        </div>
        <div class="ad-performance-detail__roi-item">
          <div class="ad-performance-detail__roi-k">7日ROI</div>
          <div class="ad-performance-detail__roi-v ad-performance-detail__roi-v--success">
            {{ detail?.roiSummary.roi7 ?? 0 }}%
          </div>
        </div>
        <div class="ad-performance-detail__roi-item">
          <div class="ad-performance-detail__roi-k">累ROI</div>
          <div class="ad-performance-detail__roi-v ad-performance-detail__roi-v--success">
            {{ detail?.roiSummary.roiTotal ?? 0 }}%
          </div>
        </div>
        <div class="ad-performance-detail__roi-item">
          <div class="ad-performance-detail__roi-k">预估利润</div>
          <div
            class="ad-performance-detail__roi-v"
            :class="profitClass(detail?.roiSummary.estimatedProfit ?? 0)"
          >
            {{ (detail?.roiSummary.estimatedProfit ?? 0) >= 0 ? '+' : '' }}
            {{ formatMoney(detail?.roiSummary.estimatedProfit ?? 0, 0) }}
          </div>
        </div>
      </div>

      <div class="ad-performance-detail__dimension-tabs" role="tablist">
        <button
          v-for="tab in dimensionTabs"
          :key="tab.value"
          type="button"
          class="ad-performance-detail__dimension-tab"
          :class="{ 'is-active': activeDimension === tab.value }"
          role="tab"
          :aria-selected="activeDimension === tab.value"
          @click="activeDimension = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="ad-performance-detail__dimension-content" role="tabpanel">
        <DetailTabAdGroup v-if="activeDimension === 'adGroup'" :data="detail?.tabs.adGroup" />
        <DetailTabDate v-else-if="activeDimension === 'date'" :data="detail?.tabs.date" />
        <DetailTabCountry v-else :data="detail?.tabs.country" />
      </div>
    </div>

    <!-- <div class="ad-performance-detail__bottom-bar">
      <ElButton round class="ad-performance-detail__bottom-btn" @click="onAdd">添加市场</ElButton>
      <ElButton round class="ad-performance-detail__bottom-btn" @click="onAdjust"
        >调整预算</ElButton
      >
      <ElButton
        round
        class="ad-performance-detail__bottom-btn ad-performance-detail__bottom-btn--primary"
        @click="onExport"
      >
        导出数据
      </ElButton>
    </div> -->
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  // import { ElMessage } from 'element-plus'
  // import { fetchCampaignDetailCampaignAction } from '@/api/user-growth/ad-performance'
  import DetailTabAdGroup from './detail-tabs/detail-tab-adgroup.vue'
  import DetailTabDate from './detail-tabs/detail-tab-date.vue'
  import DetailTabCountry from './detail-tabs/detail-tab-country.vue'
  import type {
    AdPerformanceCampaignDetail,
    AdPerformanceCampaignRow,
    AdPerformanceDetailDimension
  } from '../types'

  defineOptions({ name: 'AdPerformanceDetailDrawer' })

  const props = defineProps<{
    campaignRow: AdPerformanceCampaignRow
    detail: AdPerformanceCampaignDetail | null
  }>()

  const router = useRouter()

  const emit = defineEmits<{
    (e: 'close'): void
    (e: 'data-mutated'): void
  }>()

  const activeDimension = ref<AdPerformanceDetailDimension>('adGroup')

  const dimensionTabs = [
    { value: 'adGroup' as const, label: '广告组维度' },
    { value: 'date' as const, label: '日期维度' },
    { value: 'country' as const, label: '国家维度' }
  ]

  function formatMoney(n: number, digits: 0 | 2) {
    const num = Number.isFinite(n) ? n : 0
    return (
      '$' +
      num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    )
  }

  function profitClass(profit: number): string {
    return profit >= 0 ? 'ad-performance-detail__profit--up' : 'ad-performance-detail__profit--down'
  }

  function onEdit() {
    emit('close')
    router.push({
      path: '/campaign-detail',
      query: {
        id: props.campaignRow.id,
        name: props.campaignRow.name,
        appId: props.campaignRow.appId ?? '',
        appName: props.campaignRow.appName
      }
    })
  }

  // async function onPause() {
  //   try {
  //     const res = await fetchCampaignDetailCampaignAction({
  //       campaignId: props.campaignRow.id,
  //       actionType: 'pause'
  //     })
  //     if (res.message) ElMessage.success(res.message)
  //     else ElMessage.success('操作成功')
  //     emit('data-mutated')
  //   } catch {
  //     ElMessage.error('操作失败')
  //   }
  // }

  // function onAdd() {
  //   // 占位：后续接添加市场
  // }

  // function onAdjust() {
  //   // 占位：后续接调整预算
  // }

  // function onExport() {
  //   // 占位：后续接导出
  // }
</script>

<style scoped lang="scss">
  .ad-performance-detail {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background:
      radial-gradient(
        1200px 520px at 10% -10%,
        color-mix(in srgb, var(--art-primary) 16%, transparent),
        transparent 58%
      ),
      radial-gradient(
        900px 420px at 90% 0%,
        color-mix(in srgb, var(--art-success) 14%, transparent),
        transparent 60%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, rgb(255 255 255 / 10%) 40%, transparent),
        transparent 42%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 92%, transparent),
        var(--default-box-color)
      );
  }

  .ad-performance-detail__header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border-bottom: 1px solid var(--default-border);
  }

  .ad-performance-detail__header-left {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .ad-performance-detail__title {
    max-width: 560px;
    overflow: hidden;
    font-size: 18px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ad-performance-detail__status {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail__status-dot {
    width: 8px;
    height: 8px;
    background: var(--art-success);
    border-radius: 9999px;
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--art-success) 16%, transparent);
  }

  .ad-performance-detail__status-text {
    font-weight: 700;
    color: var(--art-success);
  }

  .ad-performance-detail__header-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 10px;
    align-items: center;
  }

  .ad-performance-detail__header-btn {
    color: var(--el-text-color-primary);
    background: rgb(255 255 255 / 4%);
    border: 1px solid color-mix(in srgb, var(--default-border) 80%, transparent);

    &:hover {
      background: rgb(255 255 255 / 6%);
      border-color: color-mix(in srgb, var(--art-success) 35%, var(--default-border));
    }
  }

  .ad-performance-detail__header-btn--warn {
    color: var(--art-warning);
    border-color: color-mix(in srgb, var(--art-warning) 55%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--art-warning) 12%, transparent);
      border-color: var(--art-warning);
    }
  }

  .ad-performance-detail__close {
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    padding: 14px 16px 18px;
    overflow: auto;
    background: var(--default-box-color);
  }

  .ad-performance-detail__top-kpi {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    min-height: 130px;
    padding: 12px;
    overflow: hidden;
    background:
      radial-gradient(
        900px 420px at 10% 0%,
        color-mix(in srgb, var(--art-primary) 14%, transparent),
        transparent 60%
      ),
      radial-gradient(
        760px 360px at 90% 10%,
        color-mix(in srgb, var(--art-warning) 12%, transparent),
        transparent 58%
      ),
      linear-gradient(
        180deg,
        color-mix(in srgb, rgb(255 255 255 / 12%) 40%, transparent),
        transparent 62%
      ),
      color-mix(in srgb, var(--default-box-color) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 14px;
  }

  .ad-performance-detail__kpi-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
    min-width: 0;
    padding: 14px;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 12px;
  }

  .ad-performance-detail__kpi-card--spend {
    background: transparent;
    border-color: color-mix(in srgb, var(--art-primary) 28%, var(--default-border));
  }

  .ad-performance-detail__kpi-card--roi {
    border-color: color-mix(in srgb, var(--art-warning) 32%, var(--default-border));
  }

  .ad-performance-detail__kpi-card--progress {
    border-color: color-mix(in srgb, var(--art-warning) 32%, var(--default-border));
  }

  .ad-performance-detail__kpi-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail__kpi-value {
    font-size: 20px;
    font-weight: 800;
    color: var(--el-text-color-primary);
  }

  .ad-performance-detail__kpi-card--spend .ad-performance-detail__kpi-value {
    color: var(--art-primary);
  }

  .ad-performance-detail__kpi-card--cpi {
    border-color: color-mix(in srgb, var(--art-success) 32%, var(--default-border));
  }

  .ad-performance-detail__kpi-card--cpi .ad-performance-detail__kpi-value {
    color: var(--art-success);
  }

  .ad-performance-detail__kpi-card--roi .ad-performance-detail__kpi-value {
    color: var(--art-warning);
  }

  .ad-performance-detail__kpi-progress {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .ad-performance-detail__kpi-progress-text {
    font-size: 16px;
    font-weight: 800;
    color: var(--art-warning);
  }

  .ad-performance-detail__roi-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 10px;
    padding: 12px;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, rgb(255 255 255 / 12%) 40%, transparent),
        transparent 62%
      ),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-success) 10%, transparent),
        transparent 55%
      ),
      color-mix(in srgb, var(--default-box-color) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--default-border) 75%, transparent);
    border-radius: 12px;
  }

  .ad-performance-detail__roi-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .ad-performance-detail__roi-k {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .ad-performance-detail__roi-v {
    font-size: 18px;
    font-weight: 800;
    color: var(--art-warning);
  }

  .ad-performance-detail__roi-v--success {
    color: var(--art-success);
  }

  .ad-performance-detail__profit--up {
    color: var(--art-success);
  }

  .ad-performance-detail__profit--down {
    color: var(--art-danger);
  }

  .ad-performance-detail__dimension-tabs {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
    padding: 4px;
    background: color-mix(in srgb, var(--default-box-color) 78%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 35%, var(--default-border));
    border-radius: 12px;
  }

  .ad-performance-detail__dimension-tab {
    flex: 0 0 auto;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 10px;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      box-shadow 0.15s ease;

    &.is-active {
      color: var(--el-text-color-primary);
      background: color-mix(in srgb, var(--art-success) 16%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--art-success) 40%, transparent) inset;
    }

    &:hover:not(.is-active) {
      color: var(--el-text-color-primary);
    }
  }

  .ad-performance-detail__dimension-content {
    min-width: 0;
  }

  .ad-performance-detail__bottom-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px 14px;
    background: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    border-top: 1px solid var(--default-border);
  }

  .ad-performance-detail__bottom-btn {
    flex: 1;
    color: var(--el-text-color-primary);
    background: rgb(255 255 255 / 4%);
    border: 1px solid color-mix(in srgb, var(--default-border) 80%, transparent);

    &:hover {
      background: rgb(255 255 255 / 6%);
      border-color: color-mix(in srgb, var(--art-success) 35%, var(--default-border));
    }
  }

  .ad-performance-detail__bottom-btn--primary {
    color: var(--art-success);
    border-color: color-mix(in srgb, var(--art-success) 55%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--art-success) 12%, transparent);
      border-color: var(--art-success);
    }
  }

  @media (width <= 1200px) {
    .ad-performance-detail__top-kpi {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .ad-performance-detail__roi-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
