<template>
  <div v-loading="loading" class="cd-page">
    <!-- ── 顶部导航栏 ─────────────────────────────────────── -->
    <div class="cd-topbar">
      <div class="cd-topbar__left">
        <button type="button" class="cd-back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </button>
        <el-breadcrumb separator="›" class="cd-breadcrumb">
          <el-breadcrumb-item>用户增长</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/user-growth/ad-performance' }"
            >广告成效</el-breadcrumb-item
          >
          <el-breadcrumb-item>广告系列详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- ── 系列标题行 ──────────────────────────────────────── -->
    <div class="cd-title-row">
      <div class="cd-title-row__left">
        <h1 class="cd-campaign-name">{{ data.campaignName }}</h1>
        <span class="cd-status-badge" :class="`cd-status-badge--${data.status}`">
          <el-icon><SuccessFilled /></el-icon>
          {{ statusText(data.status) }}
        </span>
      </div>
      <div class="cd-title-row__actions">
        <ElButton type="primary" size="small" plain round @click="goToEdit">
          <el-icon><Edit /></el-icon>
          编辑系列
        </ElButton>
        <ElButton size="small" plain round class="cd-btn-pause" @click="onCampaignAction('pause')">
          <el-icon><VideoPause /></el-icon>
          暂停
        </ElButton>
        <ElButton size="small" plain round @click="onCampaignAction('copy')">复制</ElButton>
        <ElButton size="small" plain round @click="onCampaignAction('archive')">归档</ElButton>
      </div>
    </div>

    <!-- ── 主体三列 ────────────────────────────────────────── -->
    <div class="cd-body">
      <!-- 左列：信息卡片 -->
      <div class="cd-col cd-col--left">
        <CampaignInfoCards
          :basic-info="data.basicInfo"
          :budget-info="data.budgetInfo"
          :target-info="data.targetInfo"
        />
      </div>

      <!-- 中列：趋势图 + 广告列表 -->
      <div class="cd-col cd-col--mid">
        <CampaignCoreTrend :data="data.trendData" />
        <CampaignAdList
          :rows="data.adRows"
          :campaign-id="String(route.query.id ?? '')"
          @refresh-ad-list="reloadAdList"
        />
      </div>

      <!-- 右列：素材Top5 + AI洞察 -->
      <div class="cd-col cd-col--right">
        <CampaignCreativeTop5 :items="data.creativeTop5" />
        <CampaignAiInsights :insights="data.aiInsights" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, SuccessFilled, Edit, VideoPause } from '@element-plus/icons-vue'
  import {
    fetchCampaignDetailAdList,
    fetchCampaignDetailAiInsights,
    fetchCampaignDetailCampaignAction,
    fetchCampaignDetailCreativeTop5,
    fetchCampaignDetailOverview
  } from '@/api/user-growth/ad-performance'
  import CampaignInfoCards from './modules/campaign-info-cards.vue'
  import CampaignCoreTrend from './modules/campaign-core-trend.vue'
  import CampaignAdList from './modules/campaign-ad-list.vue'
  import CampaignCreativeTop5 from './modules/campaign-creative-top5.vue'
  import CampaignAiInsights from './modules/campaign-ai-insights.vue'
  import { MOCK_CAMPAIGN_DETAIL } from '../mock/campaign-detail-data'
  import type {
    CampaignDetailCampaignActionType,
    CampaignDetailData,
    CampaignStatus
  } from './types'

  defineOptions({ name: 'CampaignDetail' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(true)
  const data = reactive<CampaignDetailData>({ ...MOCK_CAMPAIGN_DETAIL })

  function goToEdit() {
    router.push({
      path: '/user-growth/ad-performance/campaign-detail/ad-edit',
      query: {
        campaignId: String(route.query.id ?? ''),
        appId: String(route.query.appId ?? ''),
        appName: String(route.query.appName ?? '')
      }
    })
  }

  async function loadCampaignDetail() {
    const campaignId = String(route.query.id ?? '')
    if (!campaignId) {
      ElMessage.error('缺少广告系列 ID')
      return
    }
    const [o, ads, cr, ai] = await Promise.all([
      fetchCampaignDetailOverview({ campaignId }),
      fetchCampaignDetailAdList({ campaignId, status: 'all' }),
      fetchCampaignDetailCreativeTop5({ campaignId }),
      fetchCampaignDetailAiInsights({ campaignId })
    ])
    Object.assign(data, {
      campaignName: o.campaignName,
      status: o.status,
      basicInfo: o.basicInfo,
      budgetInfo: o.budgetInfo,
      targetInfo: o.targetInfo,
      trendData: o.trendData,
      adRows: ads.rows,
      creativeTop5: cr.items,
      aiInsights: ai.insights
    })
  }

  async function reloadAdList() {
    const campaignId = String(route.query.id ?? '')
    if (!campaignId) return
    try {
      const ads = await fetchCampaignDetailAdList({ campaignId, status: 'all' })
      data.adRows = ads.rows
    } catch {
      ElMessage.error('刷新广告列表失败')
    }
  }

  async function onCampaignAction(actionType: CampaignDetailCampaignActionType) {
    const campaignId = String(route.query.id ?? '')
    if (!campaignId) {
      ElMessage.error('缺少广告系列 ID')
      return
    }
    try {
      const res = await fetchCampaignDetailCampaignAction({ campaignId, actionType })
      if (res.message) ElMessage.success(res.message)
      else ElMessage.success('操作成功')
      if (actionType === 'copy' && res.newCampaignId) {
        ElMessage.info(`新系列 ID：${res.newCampaignId}`)
      }
      await loadCampaignDetail()
    } catch {
      ElMessage.error('操作失败')
    }
  }

  function statusText(s: CampaignStatus): string {
    const map: Record<CampaignStatus, string> = {
      active: '进行中',
      paused: '已暂停',
      completed: '已完成',
      archived: '已归档'
    }
    return map[s] ?? s
  }

  onMounted(async () => {
    const campaignId = String(route.query.id ?? '')
    if (!campaignId) {
      ElMessage.error('缺少广告系列 ID')
      loading.value = false
      return
    }
    try {
      await loadCampaignDetail()
    } catch {
      ElMessage.error('加载系列详情失败')
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped lang="scss">
  .cd-page {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px 28px 32px;
    overflow-x: clip;
    background: rgb(6 6 10);

    /* 极光层 ── 高饱和度 */
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 65% 52% at 4% 4%,
          rgb(59 130 246 / 38%) 0%,
          rgb(6 182 212 / 18%) 38%,
          transparent 56%
        ),
        radial-gradient(
          ellipse 55% 45% at 96% 92%,
          rgb(16 185 129 / 35%) 0%,
          rgb(52 211 153 / 15%) 38%,
          transparent 56%
        ),
        radial-gradient(ellipse 38% 32% at 68% 50%, rgb(168 85 247 / 18%) 0%, transparent 52%),
        radial-gradient(ellipse 42% 35% at 12% 88%, rgb(249 115 22 / 16%) 0%, transparent 50%);
      animation: cd-aurora 16s ease-in-out infinite alternate;
    }

    /* 网格层 ── 更亮 */
    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 7%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: radial-gradient(ellipse 88% 75% at 50% 25%, black 12%, transparent 68%);
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  @keyframes cd-aurora {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.75;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(15deg);
      opacity: 1;
      transform: scale(1.04) translate(0.8%, -0.8%);
    }

    100% {
      filter: hue-rotate(-10deg);
      opacity: 0.82;
      transform: scale(1) translate(-0.8%, 0.8%);
    }
  }

  // ── 顶部导航栏 ──────────────────────────────────────────────
  .cd-topbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    animation: cd-slide-down 0.45s var(--ease-out) both;
  }

  .cd-topbar__left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .cd-back-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 5px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: linear-gradient(135deg, rgb(59 130 246 / 8%) 0%, rgb(24 24 27 / 80%) 100%);
    border: 1px solid rgb(82 82 91 / 50%);
    border-radius: 20px;
    transition:
      color 0.2s var(--ease-out),
      border-color 0.2s var(--ease-out),
      box-shadow 0.2s var(--ease-out),
      background 0.2s var(--ease-out);

    &:hover {
      color: var(--el-text-color-primary);
      background: linear-gradient(135deg, rgb(59 130 246 / 16%) 0%, rgb(24 24 27 / 90%) 100%);
      border-color: rgb(96 165 250 / 55%);
      box-shadow: 0 0 12px rgb(59 130 246 / 20%);
    }
  }

  .cd-breadcrumb {
    :deep(.el-breadcrumb__item) {
      font-size: 13px;
    }

    :deep(.el-breadcrumb__inner.is-link:hover) {
      color: var(--art-primary);
    }
  }

  @keyframes cd-slide-down {
    from {
      opacity: 0;
      transform: translateY(-12px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cd-slide-up {
    from {
      opacity: 0;
      transform: translateY(16px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // ── 系列标题行 ───────────────────────────────────────────────
  .cd-title-row {
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
    animation: cd-slide-up 0.5s var(--ease-out) 0.1s both;
  }

  .cd-title-row__left {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .cd-campaign-name {
    overflow: hidden;
    font-size: 22px;
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

  .cd-status-badge {
    display: inline-flex;
    flex-shrink: 0;
    gap: 5px;
    align-items: center;
    padding: 4px 10px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 20px;

    &--active {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-success) 35%, transparent);
    }

    &--paused {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-warning) 35%, transparent);
    }

    &--completed {
      color: var(--el-text-color-secondary);
      background: color-mix(in srgb, var(--default-border) 50%, transparent);
      border: 1px solid var(--default-border);
    }

    &--archived {
      color: var(--el-text-color-secondary);
      background: color-mix(in srgb, var(--default-border) 50%, transparent);
      border: 1px solid var(--default-border);
    }
  }

  .cd-title-row__actions {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .cd-btn-pause {
    color: var(--art-danger) !important;
    border-color: color-mix(in srgb, var(--art-danger) 50%, transparent) !important;

    &:hover {
      background: color-mix(in srgb, var(--art-danger) 10%, transparent) !important;
    }
  }

  // ── 主体三列 ─────────────────────────────────────────────────
  .cd-body {
    display: grid;
    flex: 1;
    grid-template-columns: 220px 1fr 280px;
    gap: 16px;
    align-items: start;
    min-height: 0;
    animation: cd-slide-up 0.55s var(--ease-out) 0.2s both;
  }

  .cd-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  @media (width <= 1280px) {
    .cd-body {
      grid-template-columns: 200px 1fr 260px;
    }
  }

  @media (width <= 1024px) {
    .cd-body {
      grid-template-columns: 1fr 1fr;
    }

    .cd-col--left {
      flex-direction: row;
      grid-column: 1 / -1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-page::before {
      animation: none;
    }

    .cd-topbar,
    .cd-title-row,
    .cd-body {
      animation: none;
    }

    .cd-back-btn {
      transition: none;
    }
  }
</style>
