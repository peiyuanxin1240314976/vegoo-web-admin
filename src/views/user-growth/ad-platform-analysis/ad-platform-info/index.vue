<template>
  <div class="ad-platform-info-page art-full-height">
    <ElSkeleton :loading="isLoading" animated>
      <template #template>
        <div class="api-skeleton">
          <div class="api-skeleton__row api-skeleton__row--header">
            <div class="api-skeleton__block api-skeleton__block--title"></div>
            <div class="api-skeleton__block api-skeleton__block--filters"></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--kpis">
            <div
              v-for="i in 8"
              :key="i"
              class="api-skeleton__block api-skeleton__block--card"
            ></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--mid">
            <div class="api-skeleton__block api-skeleton__block--panel"></div>
            <div class="api-skeleton__block api-skeleton__block--panel"></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--mid">
            <div class="api-skeleton__block api-skeleton__block--panel"></div>
            <div class="api-skeleton__block api-skeleton__block--panel"></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--big">
            <div class="api-skeleton__block api-skeleton__block--big"></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--big">
            <div class="api-skeleton__block api-skeleton__block--big"></div>
          </div>
        </div>
      </template>

      <template #default>
        <template v-if="pageData">
          <div class="api-page">
            <ApiPageHeader
              v-model:date-range="filtersDraft.dateRange"
              :updated-at-text="pageData.updatedAtText"
              :summary="pageData.summary"
              @query="onQuery"
              @refresh="load"
              @export="onExport"
            />

            <ApiKpiGrid :kpis="pageData.kpis" class="api-section" />

            <div class="api-row api-row--mid api-section">
              <ApiRoiMapPanel :points="pageData.mapPoints" />
              <ApiTop10Table :rows="pageData.top10" />
            </div>

            <div class="api-row api-row--mid api-section">
              <ApiRetentionHeatmap :data="pageData.heatmap" />
              <ApiConversionFunnel :stages="pageData.funnel" />
            </div>

            <ApiTrendPanel :data="pageData.trend" class="api-section" />

            <ApiCampaignTable :rows="pageData.campaigns" class="api-section" />
          </div>
        </template>

        <template v-else>
          <ElEmpty :description="emptyDescription" />
        </template>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useAdPlatformInfo } from './composables/useAdPlatformInfo'
  import ApiPageHeader from './modules/page-header.vue'
  import ApiKpiGrid from './modules/kpi-grid.vue'
  import ApiRoiMapPanel from './modules/roi-map-panel.vue'
  import ApiTop10Table from './modules/top10-table.vue'
  import ApiRetentionHeatmap from './modules/retention-heatmap.vue'
  import ApiConversionFunnel from './modules/conversion-funnel.vue'
  import ApiTrendPanel from './modules/trend-panel.vue'
  import ApiCampaignTable from './modules/campaign-table.vue'
  import 'flag-icons/css/flag-icons.min.css'

  defineOptions({ name: 'AdPlatformInfo' })

  const { filtersDraft, applyDraftFilters, isLoading, data, errorMsg, load } = useAdPlatformInfo()
  const pageData = computed(() => data.value)
  const emptyDescription = computed(() => errorMsg.value || '暂无数据')

  function onQuery() {
    applyDraftFilters()
    void load()
  }

  function onExport() {
    ElMessage.info('导出功能待接入（已完成 UI 与交互）')
  }
</script>

<style scoped lang="scss">
  .ad-platform-info-page {
    flex: 1;
    min-height: 0;
    padding: 16px;
    overflow: auto;
    background: var(--default-bg-color);
  }

  .api-page {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
  }

  .api-section {
    animation: apiFadeIn 380ms ease-out both;
  }

  .api-row {
    display: grid;
    gap: 16px;
    align-items: stretch;

    &--mid {
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);

      @media (width <= 1100px) {
        grid-template-columns: 1fr;
      }
    }
  }

  @keyframes apiFadeIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .api-skeleton {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .api-skeleton__row {
    display: grid;
    gap: 16px;

    &--header {
      grid-template-columns: minmax(0, 1fr) 420px;

      @media (width <= 1100px) {
        grid-template-columns: 1fr;
      }
    }

    &--kpis {
      grid-template-columns: repeat(4, minmax(0, 1fr));

      @media (width <= 900px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    &--mid {
      grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);

      @media (width <= 1100px) {
        grid-template-columns: 1fr;
      }
    }
  }

  .api-skeleton__block {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .api-skeleton__block--title {
    height: 88px;
  }

  .api-skeleton__block--filters {
    height: 88px;
  }

  .api-skeleton__block--card {
    height: 110px;
  }

  .api-skeleton__block--panel {
    height: 320px;
  }

  .api-skeleton__block--big {
    height: 360px;
  }
</style>
