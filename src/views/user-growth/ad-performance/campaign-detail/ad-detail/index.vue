<template>
  <div v-loading="loading" class="add-page art-full-height">
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
              query: { id: campaignId }
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
        <ElButton size="large" round class="add-btn-pause">
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
  import { fetchAdDetailOverview } from '@/api/user-growth/ad-performance'
  import AdDetailKpiCards from './modules/ad-detail-kpi-cards.vue'
  import AdDetailTrendChart from './modules/ad-detail-trend-chart.vue'
  import AdDetailTargeting from './modules/ad-detail-targeting.vue'
  import AdDetailCreative from './modules/ad-detail-creative.vue'
  import { MOCK_AD_DETAIL } from './mock/data'
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
        adId: String(route.query.id ?? '')
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
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px 16px;
    overflow: hidden;
    background: var(--default-bg-color);
  }

  // ── 顶部面包屑 ──────────────────────────────────────────────
  .add-topbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
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
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 20px;
    transition: all 0.15s;

    &:hover {
      color: var(--el-text-color-primary);
      border-color: var(--art-primary);
    }
  }

  .add-breadcrumb {
    :deep(.el-breadcrumb__item) {
      font-size: 13px;
    }

    :deep(.el-breadcrumb__inner.is-link:hover) {
      color: var(--art-primary);
    }
  }

  // ── 标题行 ──────────────────────────────────────────────────
  .add-title-row {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .add-title-row__left {
    display: flex;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .add-ad-name {
    overflow: hidden;
    font-size: 20px;
    font-weight: 800;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .add-status-badge {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 20px;

    &--active {
      color: #fff;
      background: var(--art-success);
    }

    &--paused {
      color: var(--art-warning);
      background: color-mix(in srgb, var(--art-warning) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--art-warning) 40%, transparent);
    }

    &--completed {
      color: var(--el-text-color-secondary);
      background: color-mix(in srgb, var(--default-border) 50%, transparent);
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
    color: var(--art-danger) !important;
    border-color: color-mix(in srgb, var(--art-danger) 50%, transparent) !important;

    &:hover {
      background: color-mix(in srgb, var(--art-danger) 10%, transparent) !important;
    }
  }

  // ── 主体双列 ─────────────────────────────────────────────────
  .add-body {
    display: grid;
    flex: 1;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    min-height: 0;
    overflow: hidden;
  }

  .add-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    overflow: auto;
  }

  .add-col--left {
    height: 100%;
    overflow: hidden;
  }

  .add-col--right {
    overflow: hidden;

    :deep(.adcr) {
      min-height: 0;
    }
  }

  @media (width <= 1100px) {
    .add-body {
      grid-template-columns: 1fr;
      overflow: auto;
    }

    .add-col--right {
      overflow: visible;
    }
  }
</style>
