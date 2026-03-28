<template>
  <div v-loading="loading" class="add-page">
    <!-- ── 顶部面包屑 ───────────────────────────────────────── -->
    <div class="add-topbar">
      <div class="add-topbar__left">
        <button type="button" class="add-back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </button>
        <el-breadcrumb separator="/" class="add-breadcrumb">
          <el-breadcrumb-item>投放管理</el-breadcrumb-item>
          <el-breadcrumb-item
            :to="{
              path: '/user-growth/ad-performance/campaign-detail',
              query: { id: campaignId, appId: route.query.appId, appName: route.query.appName }
            }"
          >
            {{ data.campaignName || '广告系列详情' }}
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ data.adGroupName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- ── 标题行 ──────────────────────────────────────────── -->
    <div class="add-title-row">
      <div class="add-title-row__left">
        <h1 class="add-ad-name">{{ data.adGroupName }}</h1>
        <span class="add-status-badge" :class="`add-status-badge--${data.status}`">
          {{ statusText(data.status) }}
        </span>
      </div>
      <div class="add-title-row__actions">
        <ElButton type="primary" size="large" round @click="goToEdit">
          <el-icon><Edit /></el-icon>
          编辑系列
        </ElButton>
        <ElButton size="large" round class="add-btn-pause" @click="onPauseAd">
          <el-icon><VideoPause /></el-icon>
          暂停
        </ElButton>
      </div>
    </div>

    <!-- ── 主体双列 ─────────────────────────────────────────── -->
    <div class="add-body">
      <!-- 左列：核心指标 + 趋势图 + 受众定位 -->
      <div class="add-col add-col--left">
        <AdDetailKpiCards :metrics="data.kpiMetrics" :trends="data.kpiTrends" />
        <AdDetailTrendChart :data="data.trendData" />
        <AdDetailTargeting :targeting="data.targeting" />
      </div>

      <!-- 右列：广告素材表现（占满整列高度） -->
      <div class="add-col add-col--right">
        <AdDetailCreative :creatives="data.creatives" :suggestion="data.creativeSuggestion" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, Edit, VideoPause } from '@element-plus/icons-vue'
  import {
    fetchAdDetailOverview,
    fetchCampaignDetailAdGroupAction
  } from '@/api/user-growth/ad-performance'
  import AdDetailKpiCards from './modules/ad-detail-kpi-cards.vue'
  import AdDetailTrendChart from './modules/ad-detail-trend-chart.vue'
  import AdDetailTargeting from './modules/ad-detail-targeting.vue'
  import AdDetailCreative from './modules/ad-detail-creative.vue'
  import { MOCK_AD_DETAIL } from '../../mock/ad-detail-data'
  import type { AdDetailData, AdDetailStatus } from './types'

  defineOptions({ name: 'AdDetail' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(true)
  const campaignId = ref('')
  const data = reactive<AdDetailData>({ ...MOCK_AD_DETAIL })

  function goToEdit() {
    router.push({
      path: '/user-growth/ad-performance/campaign-detail/ad-edit',
      query: {
        campaignId: campaignId.value,
        adId: String(route.query.id ?? ''),
        appId: route.query.appId,
        appName: route.query.appName
      }
    })
  }

  function statusText(s: AdDetailStatus): string {
    const map: Record<AdDetailStatus, string> = {
      active: '启用中',
      paused: '已暂停',
      completed: '已完成'
    }
    return map[s] ?? s
  }

  async function onPauseAd() {
    const adId = String(route.query.id ?? '')
    const cid = campaignId.value
    if (!adId || !cid) {
      ElMessage.error('缺少广告或系列 ID')
      return
    }
    try {
      const res = await fetchCampaignDetailAdGroupAction({
        campaignId: cid,
        adId,
        actionType: 'pause'
      })
      if (res.message) ElMessage.success(res.message)
      else ElMessage.success('操作成功')
      data.status = 'paused'
    } catch {
      ElMessage.error('操作失败')
    }
  }

  onMounted(async () => {
    const adId = String(route.query.id ?? '')
    campaignId.value = String(route.query.campaignId ?? '')

    if (!adId || !campaignId.value) {
      ElMessage.error('缺少广告 ID 或系列 ID')
      loading.value = false
      return
    }

    try {
      const res = await fetchAdDetailOverview({ adId, campaignId: campaignId.value })
      Object.assign(data, res)
    } catch {
      ElMessage.error('加载广告详情失败')
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped lang="scss">
  .add-page {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 28px 32px;
    overflow-x: clip;
    background: rgb(6 6 10);

    /* 极光层 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 60% 48% at 5% 5%,
          rgb(59 130 246 / 35%) 0%,
          rgb(6 182 212 / 16%) 38%,
          transparent 55%
        ),
        radial-gradient(
          ellipse 50% 42% at 95% 90%,
          rgb(16 185 129 / 32%) 0%,
          rgb(52 211 153 / 14%) 38%,
          transparent 55%
        ),
        radial-gradient(ellipse 38% 30% at 70% 48%, rgb(168 85 247 / 16%) 0%, transparent 52%),
        radial-gradient(ellipse 40% 34% at 10% 88%, rgb(249 115 22 / 14%) 0%, transparent 50%);
      animation: add-aurora 16s ease-in-out infinite alternate;
    }

    /* 网格层 */
    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 4%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 4%) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(ellipse 88% 72% at 50% 25%, black 12%, transparent 68%);
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  @keyframes add-aurora {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.75;
      transform: scale(1);
    }

    50% {
      filter: hue-rotate(14deg);
      opacity: 1;
      transform: scale(1.03);
    }

    100% {
      filter: hue-rotate(-10deg);
      opacity: 0.8;
      transform: scale(1);
    }
  }

  // ── 顶部面包屑 ──────────────────────────────────────────────
  .add-topbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    animation: add-slide-down 0.42s var(--ease-out) both;
  }

  @keyframes add-slide-down {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes add-slide-up {
    from {
      opacity: 0;
      transform: translateY(14px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .add-topbar__left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .add-back-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: linear-gradient(135deg, rgb(59 130 246 / 8%) 0%, rgb(10 10 16 / 80%) 100%);
    border: 1px solid rgb(82 82 91 / 50%);
    border-radius: 20px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;

    &:hover {
      color: #7dd3fc;
      background: linear-gradient(135deg, rgb(59 130 246 / 16%) 0%, rgb(10 10 16 / 90%) 100%);
      border-color: rgb(96 165 250 / 55%);
      box-shadow: 0 0 12px rgb(59 130 246 / 22%);
    }
  }

  .add-breadcrumb {
    :deep(.el-breadcrumb__item) {
      font-size: 13px;
    }

    :deep(.el-breadcrumb__inner.is-link:hover) {
      color: #22d3ee;
    }
  }

  // ── 标题行 ──────────────────────────────────────────────────
  .add-title-row {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    background:
      radial-gradient(ellipse 80% 100% at 0% 50%, rgb(59 130 246 / 16%) 0%, transparent 55%),
      linear-gradient(135deg, rgb(20 25 40 / 88%) 0%, rgb(10 10 16 / 82%) 100%);
    border: 1px solid rgb(96 165 250 / 32%);
    border-radius: 14px;
    box-shadow:
      0 6px 32px rgb(0 0 0 / 42%),
      0 0 0 1px rgb(59 130 246 / 10%),
      inset 0 1px 0 rgb(186 230 253 / 12%);
    animation: add-slide-up 0.48s var(--ease-out) 0.1s both;
  }

  .add-title-row__left {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .add-ad-name {
    overflow: hidden;
    font-size: 20px;
    font-weight: 800;
    text-overflow: ellipsis;
    white-space: nowrap;
    background-color: transparent;
    background-image: linear-gradient(92deg, #f0f9ff 0%, #7dd3fc 35%, #22d3ee 65%, #34d399 100%);
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 100%;
    -webkit-text-fill-color: transparent;
  }

  .add-status-badge {
    display: inline-flex;
    flex-shrink: 0;
    gap: 5px;
    align-items: center;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;

    &--active {
      color: #34d399;
      background: rgb(16 185 129 / 14%);
      border: 1px solid rgb(16 185 129 / 38%);
      box-shadow: 0 0 10px rgb(16 185 129 / 20%);
    }

    &--paused {
      color: #fbbf24;
      background: rgb(249 115 22 / 12%);
      border: 1px solid rgb(249 115 22 / 35%);
    }

    &--completed {
      color: var(--el-text-color-secondary);
      background: color-mix(in srgb, var(--default-border) 40%, transparent);
      border: 1px solid var(--default-border);
    }
  }

  .add-title-row__actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  .add-btn-pause {
    color: #f87171 !important;
    border-color: rgb(239 68 68 / 45%) !important;

    &:hover {
      background: rgb(239 68 68 / 10%) !important;
      box-shadow: 0 0 12px rgb(239 68 68 / 20%) !important;
    }
  }

  // ── 主体双列 ─────────────────────────────────────────────────
  .add-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    animation: add-slide-up 0.52s var(--ease-out) 0.2s both;
  }

  .add-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  @media (width <= 1100px) {
    .add-body {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .add-page::before {
      animation: none;
    }

    .add-topbar,
    .add-title-row,
    .add-body {
      animation: none;
    }

    .add-back-btn {
      transition: none;
    }
  }
</style>
