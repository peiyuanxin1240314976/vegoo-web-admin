<!-- <template>
  <div class="my-ads-page">
    <MyAdsHeader
      :title="pageTitle"
      :person="data.user"
      :date-range="data.dateRange"
      @back="onBack"
      @update:date-range="data.dateRange = $event"
    />

    <div class="my-ads-top-card my-ads-panel">
      <div class="my-ads-top-card__body">
        <MyAdsUserCard :user="data.user" embedded />
        <div class="my-ads-kpi-wrap">
          <MyAdsKpiRow :kpi-list="data.kpi" embedded />
        </div>
      </div>
    </div>

    <ElTabs v-model="activeTab" class="my-ads-tabs">
      <ElTabPane :label="$t('myAds.tabs.summary')" name="summary">
        <MyAdsTabSummary
          :kpi-cards="data.summary.kpiCards"
          :trend="data.summary.trend"
          :channel-distribution="data.summary.channelDistribution"
          :app-spend="data.summary.appSpend"
          :pace-monitor="data.summary.paceMonitor"
          :pace-remaining-days="data.summary.paceRemainingDays"
        />
      </ElTabPane>
      <ElTabPane :label="$t('myAds.tabs.appPlatform')" name="appPlatform">
        <MyAdsTabAppPlatform
          :app-groups="data.appPlatform.appGroups"
          :view-desc="data.appPlatform.viewDesc"
          :group-by="data.appPlatform.groupBy"
          :footer="data.appPlatform.footer"
        />
      </ElTabPane>
      <ElTabPane :label="$t('myAds.tabs.campaignDetail')" name="campaignDetail">
        <MyAdsTabCampaignDetail
          :list="data.campaignDetail.list"
          :total="data.campaignDetail.total"
          :summary-bar="data.campaignDetail.summaryBar"
        />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import MyAdsHeader from './components/my-ads-header.vue'
  import MyAdsUserCard from './components/my-ads-user-card.vue'
  import MyAdsKpiRow from './components/my-ads-kpi-row.vue'
  import MyAdsTabSummary from './components/tab-summary.vue'
  import MyAdsTabAppPlatform from './components/tab-app-platform.vue'
  import MyAdsTabCampaignDetail from './components/tab-campaign-detail.vue'
  import { MOCK_MY_ADS_DATA } from './mock/data'
  import type { MyAdsPageData } from './types'

  defineOptions({ name: 'MyAds' })

  const { t } = useI18n()
  const router = useRouter()

  const pageTitle = computed(() => t('menus.userGrowth.myAds'))
  const activeTab = ref('summary')
  const data = ref<MyAdsPageData>(MOCK_MY_ADS_DATA)

  function onBack() {
    router.back()
  }
</script>

<style lang="scss" scoped>
  @use './styles/my-ads-common.scss' as *;

  .my-ads-page {
    min-height: 100%;
    padding: 16px 20px 24px;
  }

  .my-ads-top-card {
    margin-bottom: 16px;

    .my-ads-top-card__body {
      display: flex;
      gap: 18px;
      align-items: center;
      padding: 14px 16px;
    }
  }

  .my-ads-kpi-wrap {
    flex: 1;
    min-width: 0;
    min-width: 420px;
  }

  @media (width <= 1200px) {
    .my-ads-top-card {
      .my-ads-top-card__body {
        flex-direction: column;
        align-items: stretch;
      }
    }

    .my-ads-kpi-wrap {
      min-width: 0;
    }
  }
</style>

<style lang="scss">
  /* 我的广告 Tabs 全局样式，供子内容使用 */
  .my-ads-tabs {
    .el-tabs__header {
      margin-bottom: 16px;
    }

    .el-tabs__item {
      font-size: 14px;
      color: #9ca3af;
    }

    .el-tabs__item.is-active {
      font-weight: 500;
      color: #67c23a;
    }

    .el-tabs__ink-bar {
      background-color: #67c23a;
    }

    .el-tabs__nav-wrap::after {
      background-color: rgb(148 163 184 / 20%);
    }

    .el-tabs__active-bar {
      background-color: #67c23a;
    }

    .el-tabs__item:hover,
    .el-tabs__item.is-active {
      color: #67c23a;
    }

    .el-tabs__content {
      overflow: visible;
    }
  }
</style> -->
<script setup name="MyAds" lang="ts">
  import MyAds from './component/MyAds.vue'
</script>

<template>
  <MyAds />
</template>
