<template>
  <div class="cic">
    <!-- 基本信息 -->
    <ElCard class="cic__card" shadow="never">
      <template #header><span class="cic__card-title">基本信息</span></template>
      <div class="cic__rows">
        <div class="cic__row">
          <span class="cic__label">系列ID</span>
          <span class="cic__value cic__value--mono">#{{ basicInfo.campaignId }}</span>
        </div>
        <div class="cic__row">
          <span class="cic__label">投放渠道</span>
          <span class="cic__value cic__value--icon-row">
            <span
              class="cic__channel-dot"
              :style="{ background: channelColor(basicInfo.channel) }"
            ></span>
            {{ basicInfo.channelName }}
          </span>
        </div>
        <div class="cic__row">
          <span class="cic__label">目标应用</span>
          <span class="cic__value cic__value--icon-row">
            <span class="cic__app-icon">{{ appInitial }}</span>
            {{ basicInfo.appName }}
          </span>
        </div>
        <div class="cic__row">
          <span class="cic__label">创建时间</span>
          <span class="cic__value">{{ basicInfo.createdAt }}</span>
        </div>
      </div>
    </ElCard>

    <!-- 预算与排期 -->
    <ElCard class="cic__card" shadow="never">
      <template #header><span class="cic__card-title">预算与排期</span></template>
      <div class="cic__rows">
        <div class="cic__row">
          <span class="cic__label">预算类型</span>
          <span class="cic__value">{{ budgetInfo.budgetType }}</span>
        </div>
        <div class="cic__row">
          <span class="cic__label">预算金额</span>
          <span class="cic__value cic__value--primary"
            >${{ budgetInfo.budgetAmount.toLocaleString() }}</span
          >
        </div>
        <div class="cic__row cic__row--col">
          <div class="cic__budget-progress-header">
            <span class="cic__label">今日消耗</span>
            <span class="cic__budget-progress-text">
              ${{ budgetInfo.todaySpend.toLocaleString() }}
              <span class="cic__budget-percent">({{ budgetInfo.todaySpendPercent }}%)</span>
            </span>
          </div>
          <ElProgress
            :percentage="budgetInfo.todaySpendPercent"
            :show-text="false"
            :stroke-width="6"
            color="var(--art-warning)"
            class="cic__progress"
          />
        </div>
        <div class="cic__row">
          <span class="cic__label">总消耗</span>
          <span class="cic__value">${{ budgetInfo.totalSpend.toLocaleString() }}</span>
        </div>
        <div class="cic__row">
          <span class="cic__label">排期</span>
          <span class="cic__value cic__value--sm"
            >{{ budgetInfo.scheduleStart }} 至 {{ budgetInfo.scheduleEnd }}</span
          >
        </div>
      </div>
    </ElCard>

    <!-- 目标与出价 -->
    <ElCard class="cic__card" shadow="never">
      <template #header><span class="cic__card-title">目标与出价</span></template>
      <div class="cic__rows">
        <div class="cic__row">
          <span class="cic__label">目标区域</span>
          <span class="cic__value">{{ targetInfo.regionCode }} {{ targetInfo.region }}</span>
        </div>
        <div class="cic__row">
          <span class="cic__label">目标平台</span>
          <span class="cic__value cic__value--icon-row">
            <span
              v-if="targetInfo.platform === 'android'"
              class="cic__platform-badge cic__platform-badge--android"
              >安卓</span
            >
            <span
              v-else-if="targetInfo.platform === 'ios'"
              class="cic__platform-badge cic__platform-badge--ios"
              >iOS</span
            >
            <span v-else class="cic__platform-badge cic__platform-badge--all">全平台</span>
          </span>
        </div>
        <div class="cic__row">
          <span class="cic__label">出价策略</span>
          <span class="cic__value">{{ targetInfo.bidStrategy }}</span>
        </div>
        <div class="cic__row">
          <span class="cic__label">目标CPI</span>
          <span class="cic__value cic__value--success">${{ targetInfo.targetCpi }}</span>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type {
    CampaignBasicInfo,
    CampaignBudgetInfo,
    CampaignTargetInfo,
    AdChannel
  } from '../types'

  defineOptions({ name: 'CampaignInfoCards' })

  const props = defineProps<{
    basicInfo: CampaignBasicInfo
    budgetInfo: CampaignBudgetInfo
    targetInfo: CampaignTargetInfo
  }>()

  const appInitial = computed(() => props.basicInfo.appName.charAt(0).toUpperCase())

  const CHANNEL_COLORS: Record<AdChannel, string> = {
    google: '#4285F4',
    facebook: '#1877F2',
    meta: '#1877F2',
    tiktok: '#10B981',
    mintegral: '#8B5CF6',
    kwai: '#F97316'
  }

  function channelColor(ch: AdChannel): string {
    return CHANNEL_COLORS[ch] ?? 'var(--art-primary)'
  }
</script>

<style scoped lang="scss">
  @import '../../styles/ap-card-fx';

  .cic {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cic__card {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    overflow: hidden;
    border-radius: 14px;

    /* 顶部蓝色高光线 */
    &::before {
      position: absolute;
      top: 0;
      left: 8%;
      z-index: 0;
      width: 84%;
      height: 1.5px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(59 130 246 / 70%),
        rgb(6 182 212 / 80%),
        transparent
      );
      filter: blur(0.4px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 12px;
      background: transparent;
      border-bottom: 1px solid rgb(59 130 246 / 18%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 16px;
      background: transparent;
    }
  }

  .cic__card-title {
    display: inline-block;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.03em;
    background-color: transparent;
    background-image: linear-gradient(92deg, #f0f9ff 0%, #7dd3fc 45%, #22d3ee 100%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100%;
    -webkit-text-fill-color: transparent;
  }

  .cic__rows {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .cic__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    font-size: 12px;
  }

  .cic__row--col {
    flex-direction: column;
    gap: 6px;
    align-items: stretch;
  }

  .cic__budget-progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .cic__budget-progress-text {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .cic__budget-percent {
    margin-left: 4px;
    font-weight: 400;
    color: var(--art-warning);
  }

  .cic__progress {
    width: 100%;
  }

  .cic__label {
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  .cic__value {
    max-width: 60%;
    overflow: hidden;
    font-weight: 500;
    color: var(--el-text-color-primary);
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cic__value--mono {
    font-family: monospace;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .cic__value--sm {
    font-size: 11px;
  }

  .cic__value--primary {
    font-weight: 700;
    color: var(--art-primary);
  }

  .cic__value--success {
    font-weight: 700;
    color: var(--art-success);
  }

  .cic__value--icon-row {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .cic__channel-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .cic__app-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    background: var(--art-primary);
    border-radius: 4px;
  }

  .cic__platform-badge {
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;

    &--android {
      color: #22c55e;
      background: rgb(34 197 94 / 15%);
      border: 1px solid rgb(34 197 94 / 30%);
    }

    &--ios {
      color: #3b82f6;
      background: rgb(59 130 246 / 15%);
      border: 1px solid rgb(59 130 246 / 30%);
    }

    &--all {
      color: var(--art-primary);
      background: color-mix(in srgb, var(--art-primary) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-primary) 30%, transparent);
    }
  }
</style>
