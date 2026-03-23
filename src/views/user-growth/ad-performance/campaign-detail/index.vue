<template>
  <div v-loading="loading" class="cd-page art-full-height">
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
        <ElButton size="small" plain round class="cd-btn-pause">
          <el-icon><VideoPause /></el-icon>
          暂停
        </ElButton>
        <ElButton size="small" plain round>复制</ElButton>
        <ElButton size="small" plain round>归档</ElButton>
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
        <CampaignAdList :rows="data.adRows" :campaign-id="String(route.query.id ?? '')" />
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
    fetchCampaignDetailCreativeTop5,
    fetchCampaignDetailOverview
  } from '@/api/user-growth/ad-performance'
  import CampaignInfoCards from './modules/campaign-info-cards.vue'
  import CampaignCoreTrend from './modules/campaign-core-trend.vue'
  import CampaignAdList from './modules/campaign-ad-list.vue'
  import CampaignCreativeTop5 from './modules/campaign-creative-top5.vue'
  import CampaignAiInsights from './modules/campaign-ai-insights.vue'
  import { MOCK_CAMPAIGN_DETAIL } from './mock/data'
  import type { CampaignDetailData, CampaignStatus } from './types'

  defineOptions({ name: 'CampaignDetail' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(true)
  const data = reactive<CampaignDetailData>({ ...MOCK_CAMPAIGN_DETAIL })

  function goToEdit() {
    router.push({
      path: '/user-growth/ad-performance/campaign-detail/ad-edit',
      query: { campaignId: String(route.query.id ?? '') }
    })
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
    } catch {
      ElMessage.error('加载系列详情失败')
    } finally {
      loading.value = false
    }
  })
</script>

<style scoped lang="scss">
  .cd-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px 20px;
    overflow: auto;
    background: var(--default-bg-color);
  }

  // ── 顶部导航栏 ──────────────────────────────────────────────
  .cd-topbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
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
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 20px;
    transition: all 0.15s ease;

    &:hover {
      color: var(--el-text-color-primary);
      border-color: var(--art-primary);
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

  // ── 系列标题行 ───────────────────────────────────────────────
  .cd-title-row {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
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
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
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
    gap: 14px;
    align-items: start;
    min-height: 0;
  }

  .cd-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
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
</style>
