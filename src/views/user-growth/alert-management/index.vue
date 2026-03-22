<template>
  <div v-loading="loading" class="am-page art-full-height">
    <header class="am-header">
      <div class="am-header__left">
        <span class="am-breadcrumb">
          {{ $t('menus.userGrowth.title') }} &gt; {{ $t('menus.userGrowth.alertManagement') }}
        </span>
        <h1 class="am-title">智能预警中心</h1>
      </div>
      <div class="am-header__right">
        <ElButton round type="primary" @click="onCreateRule">+ 创建新规则</ElButton>
      </div>
    </header>

    <template v-if="pageData">
      <SectionKpi class="am-block" :summary-cards="pageData.summaryCards" />

      <AlertToolbar
        class="am-block"
        v-model:severity="filters.severity"
        v-model:category="filters.category"
        v-model:status="filters.status"
        v-model:date="filters.date"
      />

      <ElRow :gutter="16" class="am-block am-row-main">
        <ElCol :xs="24" :lg="15">
          <AlertFeed class="am-feed-wrap" :alerts="pageData.alerts" @action="onFeedAction" />
        </ElCol>
        <ElCol :xs="24" :lg="9">
          <div class="am-right-col">
            <SectionTrend :block="pageData.trendPrimary" />
            <SectionClassification
              :slices="pageData.classification"
              :center-title="pageData.classificationCenterTitle"
              :center-value="pageData.classificationCenterValue"
            />
            <SectionRules :rule-groups="pageData.ruleGroups" />
          </div>
        </ElCol>
      </ElRow>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { AlertManagementOverview, AlertManagementOverviewParams } from './types'
  import { fetchAlertManagementOverview } from '@/api/user-growth'
  import { getAppNow } from '@/utils/app-now'
  import SectionKpi from './modules/section-kpi.vue'
  import AlertToolbar from './modules/alert-toolbar.vue'
  import SectionTrend from './modules/section-trend.vue'
  import SectionClassification from './modules/section-classification.vue'
  import SectionRules from './modules/section-rules.vue'
  import AlertFeed from './modules/alert-feed.vue'

  defineOptions({ name: 'AlertManagement' })

  function formatDateYmd(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const loading = ref(false)
  const pageData = ref<AlertManagementOverview | null>(null)

  const filters = reactive<AlertManagementOverviewParams>({
    severity: 'all',
    category: 'all',
    status: 'all',
    date: formatDateYmd(getAppNow())
  })

  async function load() {
    loading.value = true
    try {
      pageData.value = await fetchAlertManagementOverview({ ...filters })
    } finally {
      loading.value = false
    }
  }

  watch(filters, load, { deep: true, immediate: true })

  function onCreateRule() {
    ElMessage.info('创建规则：后续接入表单与保存接口')
  }

  function onFeedAction(payload: { id: string; action: string }) {
    const map: Record<string, string> = {
      detail: '查看详情',
      markDone: '标记已处理',
      ignore: '忽略',
      reopen: '重新打开'
    }
    ElMessage.success(`${map[payload.action] ?? payload.action}（${payload.id}）待接接口`)
  }
</script>

<style scoped lang="scss">
  .am-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 16px 24px;
    overflow: auto;
    background: var(--default-bg-color);
  }

  .am-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .am-breadcrumb {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--art-gray-600);
  }

  .am-title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .am-block {
    margin-bottom: 16px;
  }

  .am-row-main {
    align-items: stretch;
  }

  .am-feed-wrap {
    min-height: 200px;
  }

  .am-right-col {
    display: flex;
    flex-direction: column;
    gap: 14px;
    height: 100%;
  }
</style>
