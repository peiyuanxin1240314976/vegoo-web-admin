<template>
  <div class="cd-page">
    <!-- ── 顶部导航栏 ─────────────────────────────────────── -->
    <div class="cd-topbar campaign-detail-filters">
      <div class="cd-topbar__left">
        <button type="button" class="cd-back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </button>
        <el-breadcrumb separator="›" class="cd-breadcrumb">
          <el-breadcrumb-item>广告系列详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <AppDatePicker
        v-model="dateRangeValue"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="~"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        class="ap-date-picker"
      />
    </div>

    <!-- ── 首屏骨架（远程加载中不展示本地 Mock）── -->
    <template v-if="loading">
      <div class="cd-title-row cd-title-row--skeleton">
        <div class="cd-title-row__left cd-sk-title-left">
          <ElSkeleton animated :throttle="0">
            <template #template>
              <div class="cd-sk-title-line">
                <ElSkeletonItem variant="h1" style="width: min(320px, 55vw); height: 28px" />
                <ElSkeletonItem variant="button" style="width: 72px; height: 26px" />
              </div>
            </template>
          </ElSkeleton>
        </div>
        <div class="cd-title-row__actions cd-sk-actions">
          <ElSkeletonItem variant="button" style="width: 92px; height: 28px" />
          <ElSkeletonItem variant="button" style="width: 72px; height: 28px" />
          <ElSkeletonItem variant="button" style="width: 56px; height: 28px" />
          <ElSkeletonItem variant="button" style="width: 56px; height: 28px" />
        </div>
      </div>
      <div class="cd-body cd-body--skeleton">
        <div class="cd-col cd-col--left">
          <ElCard v-for="i in 3" :key="i" class="cd-sk-card" shadow="never">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <ElSkeletonItem variant="text" style="width: 40%; margin-bottom: 16px" />
                <ElSkeletonItem v-for="j in 4" :key="j" variant="text" style="margin-top: 10px" />
              </template>
            </ElSkeleton>
          </ElCard>
        </div>
        <div class="cd-col cd-col--mid">
          <ElCard class="cd-sk-card cd-sk-card--chart" shadow="never">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <ElSkeletonItem variant="text" style="width: 120px; margin-bottom: 12px" />
                <ElSkeletonItem variant="image" style="width: 100%; height: 280px" />
              </template>
            </ElSkeleton>
          </ElCard>
          <ElCard class="cd-sk-card cd-sk-card--table" shadow="never">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <ElSkeletonItem variant="text" style="width: 100px; margin-bottom: 12px" />
                <ElSkeletonItem v-for="k in 5" :key="k" variant="text" style="margin-top: 12px" />
              </template>
            </ElSkeleton>
          </ElCard>
        </div>
        <div class="cd-col cd-col--right">
          <ElCard class="cd-sk-card" shadow="never">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <ElSkeletonItem variant="text" style="width: 50%; margin-bottom: 12px" />
                <ElSkeletonItem
                  v-for="n in 3"
                  :key="n"
                  variant="image"
                  style="height: 72px; margin-top: 10px"
                />
              </template>
            </ElSkeleton>
          </ElCard>
          <ElCard class="cd-sk-card" shadow="never">
            <ElSkeleton animated :throttle="0">
              <template #template>
                <ElSkeletonItem variant="text" style="width: 40%; margin-bottom: 12px" />
                <ElSkeletonItem v-for="m in 3" :key="m" variant="p" style="margin-top: 10px" />
              </template>
            </ElSkeleton>
          </ElCard>
        </div>
      </div>
    </template>

    <template v-else>
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
          <!-- <ElButton type="primary" size="small" plain round @click="goToEdit">
            <el-icon><Edit /></el-icon>
            编辑系列
          </ElButton> -->
          <!-- <ElButton
            size="small"
            plain
            round
            class="cd-btn-pause"
            @click="onCampaignAction('pause')"
          >
            <el-icon><VideoPause /></el-icon>
            暂停
          </ElButton>
          <ElButton size="small" plain round @click="onCampaignAction('copy')">复制</ElButton>
          <ElButton size="small" plain round @click="onCampaignAction('archive')">归档</ElButton> -->
        </div>
      </div>

      <!-- ── 主体三列 ────────────────────────────────────────── -->
      <div class="cd-body">
        <div class="cd-col cd-col--left">
          <CampaignInfoCards
            :basic-info="data.basicInfo"
            :budget-info="data.budgetInfo"
            :target-info="data.targetInfo"
          />
        </div>
        <div class="cd-col cd-col--mid">
          <CampaignCoreTrend :data="data.trendData" />
          <CampaignAdList
            :rows="data.adRows"
            :campaign-id="String(route.query.id ?? '')"
            :status="adListStatus"
            @refresh-ad-list="reloadAdList"
            @change-status="onChangeAdListStatus"
          />
        </div>
        <div class="cd-col cd-col--right">
          <CampaignCreativeTop5 :items="data.creativeTop5" />
          <CampaignAiInsights :insights="data.aiInsights" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    ArrowLeft,
    SuccessFilled
    // Edit
    // VideoPause
  } from '@element-plus/icons-vue'
  import {
    fetchCampaignDetailAdList,
    fetchCampaignDetailAiInsights,
    // fetchCampaignDetailCampaignAction,
    fetchCampaignDetailCreativeTop5,
    fetchCampaignDetailOverview
  } from '@/api/user-growth/ad-performance'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { getAppTodayYYYYMMDD } from '@/utils/app-now'
  import CampaignInfoCards from './modules/campaign-info-cards.vue'
  import CampaignCoreTrend from './modules/campaign-core-trend.vue'
  import CampaignAdList from './modules/campaign-ad-list.vue'
  import CampaignCreativeTop5 from './modules/campaign-creative-top5.vue'
  import CampaignAiInsights from './modules/campaign-ai-insights.vue'
  import {
    createEmptyCampaignDetail,
    normalizeCampaignDetailFromApi,
    // type CampaignDetailCampaignActionType,
    type CampaignDetailData,
    type CampaignStatus
  } from './types'

  defineOptions({ name: 'CampaignDetail' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(true)
  const data = reactive<CampaignDetailData>(createEmptyCampaignDetail())
  const adListStatus = ref<'all' | 'active' | 'paused' | 'completed'>('all')
  const queryStartDate = String(route.query.startDate ?? '').trim()
  const queryEndDate = String(route.query.endDate ?? '').trim()
  const filterStartDate = ref(queryStartDate || getAppTodayYYYYMMDD())
  const filterEndDate = ref(queryEndDate || getAppTodayYYYYMMDD())

  const dateRangeValue = computed<[string, string]>({
    get() {
      return [filterStartDate.value, filterEndDate.value]
    },
    set(v) {
      const nextStart = String(v?.[0] ?? '').trim()
      const nextEnd = String(v?.[1] ?? '').trim()
      if (!nextStart || !nextEnd) return
      filterStartDate.value = nextStart
      filterEndDate.value = nextEnd
    }
  })

  // function goToEdit() {
  //   router.push({
  //     path: '/campaign-detail/ad-edit',
  //     query: {
  //       campaignId: String(route.query.id ?? ''),
  //       appId: String(route.query.appId ?? ''),
  //       appName: String(route.query.appName ?? '')
  //     }
  //   })
  // }

  async function loadCampaignDetail() {
    const campaignId = String(route.query.id ?? '')
    if (!campaignId) {
      ElMessage.error('缺少广告系列 ID')
      return
    }
    const dateFilter = {
      startDate: filterStartDate.value,
      endDate: filterEndDate.value
    }
    const [o, ads, cr, ai] = await Promise.all([
      fetchCampaignDetailOverview({ campaignId, ...dateFilter }),
      fetchCampaignDetailAdList({ campaignId, status: adListStatus.value, ...dateFilter }),
      fetchCampaignDetailCreativeTop5({ campaignId, ...dateFilter }),
      fetchCampaignDetailAiInsights({ campaignId, ...dateFilter })
    ])
    Object.assign(data, normalizeCampaignDetailFromApi(o, ads, cr, ai))
  }

  async function reloadAdList() {
    const campaignId = String(route.query.id ?? '')
    if (!campaignId) return
    try {
      const adListBody = {
        campaignId,
        status: adListStatus.value,
        startDate: filterStartDate.value,
        endDate: filterEndDate.value
      }
      const ads = await fetchCampaignDetailAdList(adListBody)
      data.adRows = Array.isArray(ads?.rows) ? ads.rows : []
    } catch {
      ElMessage.error('刷新广告列表失败')
    }
  }

  async function onChangeAdListStatus(v: 'all' | 'active' | 'paused' | 'completed') {
    adListStatus.value = v
    await reloadAdList()
  }

  watch([filterStartDate, filterEndDate], async ([nextStart, nextEnd], [prevStart, prevEnd]) => {
    if (!nextStart || !nextEnd) return
    if (nextStart === prevStart && nextEnd === prevEnd) return
    try {
      await loadCampaignDetail()
    } catch {
      ElMessage.error('按日期刷新系列详情失败')
    }
  })

  // async function onCampaignAction(actionType: CampaignDetailCampaignActionType) {
  //   const campaignId = String(route.query.id ?? '')
  //   if (!campaignId) {
  //     ElMessage.error('缺少广告系列 ID')
  //     return
  //   }
  //   try {
  //     const res = await fetchCampaignDetailCampaignAction({ campaignId, actionType })
  //     if (res.message) ElMessage.success(res.message)
  //     else ElMessage.success('操作成功')
  //     if (actionType === 'copy' && res.newCampaignId) {
  //       ElMessage.info(`新系列 ID：${res.newCampaignId}`)
  //     }
  //     await loadCampaignDetail()
  //   } catch {
  //     ElMessage.error('操作失败')
  //   }
  // }

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
    // flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
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

  .cd-title-row--skeleton {
    .cd-sk-title-line {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }

    .cd-sk-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
  }

  .cd-body--skeleton {
    .cd-sk-card {
      --el-card-bg-color: rgb(24 24 27 / 72%);

      border: 1px solid rgb(96 165 250 / 22%);
    }

    .cd-sk-card--chart :deep(.el-skeleton__item) {
      border-radius: 10px;
    }
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

  .ap-date-picker {
    flex: 0 0 250px;
    width: 250px;
    min-width: 250px;
    max-width: 250px;

    @media (width <=768px) {
      flex: 1 1 100%;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
  }

  .campaign-detail-filters :deep(.ap-date-picker.el-date-editor.el-date-editor--daterange) {
    flex: 0 0 250px !important;
    width: 250px !important;
    min-width: 250px !important;
    max-width: 250px !important;

    @media (width <=768px) {
      flex: 1 1 100% !important;
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
  }
</style>
