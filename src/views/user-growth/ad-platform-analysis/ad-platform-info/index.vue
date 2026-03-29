<template>
  <div class="ad-platform-info-page ad-platform-info-page--ap-fx art-full-height">
    <div class="api-page-fx" aria-hidden="true"></div>
    <ElSkeleton :loading="isLoading" animated class="api-skeleton-root">
      <template #template>
        <div class="api-skeleton">
          <div class="api-skeleton__row api-skeleton__row--header api-skel-entry-1">
            <div
              class="api-skeleton__block api-skeleton__block--title api-skeleton__block--fx"
            ></div>
            <div
              class="api-skeleton__block api-skeleton__block--filters api-skeleton__block--fx"
            ></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--kpis api-skel-entry-2">
            <div
              v-for="i in 8"
              :key="i"
              class="api-skeleton__block api-skeleton__block--card api-skeleton__block--fx"
            ></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--mid api-skel-entry-3">
            <div
              class="api-skeleton__block api-skeleton__block--panel api-skeleton__block--fx"
            ></div>
            <div
              class="api-skeleton__block api-skeleton__block--panel api-skeleton__block--fx"
            ></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--mid api-skel-entry-3">
            <div
              class="api-skeleton__block api-skeleton__block--panel api-skeleton__block--fx"
            ></div>
            <div
              class="api-skeleton__block api-skeleton__block--panel api-skeleton__block--fx"
            ></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--big api-skel-entry-3">
            <div class="api-skeleton__block api-skeleton__block--big api-skeleton__block--fx"></div>
          </div>
          <div class="api-skeleton__row api-skeleton__row--big api-skel-entry-3">
            <div class="api-skeleton__block api-skeleton__block--big api-skeleton__block--fx"></div>
          </div>
        </div>
      </template>

      <template #default>
        <template v-if="pageData">
          <div class="api-page api-page--fx">
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
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 0;
    padding: 16px 20px 24px;
    overflow: clip auto;
    background: var(--default-bg-color);
  }

  .ad-platform-info-page--ap-fx {
    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          ellipse 70% 50% at 6% 6%,
          rgb(16 185 129 / 38%) 0%,
          rgb(6 182 212 / 18%) 38%,
          transparent 58%
        ),
        radial-gradient(
          ellipse 55% 42% at 94% 8%,
          rgb(59 130 246 / 36%) 0%,
          rgb(139 92 246 / 16%) 38%,
          transparent 58%
        ),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 16%) 0%, transparent 55%),
        radial-gradient(
          ellipse 55% 42% at 76% 4%,
          rgb(34 211 238 / 18%) 0%,
          rgb(59 130 246 / 10%) 40%,
          transparent 58%
        );
      mask-image: linear-gradient(to bottom, black 0%, black 30%, transparent 62%);
      animation:
        api-aurora-drift 14s ease-in-out infinite alternate,
        api-bg-flow 22s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px),
        radial-gradient(circle, rgb(6 182 212 / 8%) 1px, transparent 1px);
      background-size:
        40px 40px,
        40px 40px,
        80px 80px;
      mask-image: linear-gradient(to bottom, black 0%, black 20%, transparent 48%);
    }

    > *:not(.api-page-fx) {
      position: relative;
      z-index: 1;
    }
  }

  .api-page-fx {
    position: absolute;
    inset: -14% -14% 42%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 12%) 55deg,
      rgb(6 182 212 / 8%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 10%) 200deg,
      rgb(52 211 153 / 6%) 225deg,
      transparent 285deg,
      rgb(168 85 247 / 8%) 330deg,
      rgb(249 115 22 / 5%) 350deg,
      transparent 360deg
    );
    filter: blur(2px);
    opacity: 0.82;
    mask-image: linear-gradient(to bottom, black 0%, black 52%, transparent 88%);
    animation: api-fx-spin 52s linear infinite;
  }

  @keyframes api-aurora-drift {
    0% {
      filter: hue-rotate(0deg);
      opacity: 0.7;
      transform: scale(1) translate(0, 0);
    }

    50% {
      filter: hue-rotate(16deg);
      opacity: 1;
      transform: scale(1.05) translate(1%, -1%);
    }

    100% {
      filter: hue-rotate(-10deg);
      opacity: 0.78;
      transform: scale(1) translate(-1%, 1%);
    }
  }

  @keyframes api-bg-flow {
    0% {
      opacity: 0.68;
      transform: scaleY(1) skewX(0deg);
    }

    100% {
      opacity: 0.95;
      transform: scaleY(1.06) skewX(0.8deg);
    }
  }

  @keyframes api-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes api-shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }

  .api-skeleton-root {
    min-height: 100%;
  }

  .api-page {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 16px;
    min-height: 100%;
  }

  .api-section {
    animation: apiFadeIn 420ms cubic-bezier(0, 0, 0.2, 1) both;
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

    &--big {
      grid-template-columns: 1fr;
    }
  }

  .api-skeleton__block {
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .api-skeleton__block--fx {
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      100deg,
      rgb(10 10 14 / 92%) 0%,
      rgb(30 58 95 / 35%) 42%,
      rgb(16 185 129 / 12%) 100%
    );
    background-size: 220% 100%;
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 14px;
    box-shadow:
      0 0 24px rgb(59 130 246 / 8%),
      inset 0 1px 0 rgb(186 230 253 / 8%);
    animation: api-shimmer 1.35s ease-in-out infinite;
  }

  .api-skel-entry-1 {
    animation: apiFadeIn 0.5s cubic-bezier(0, 0, 0.2, 1) both;
  }

  .api-skel-entry-2 {
    animation: apiFadeIn 0.5s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.08s;
  }

  .api-skel-entry-3 {
    animation: apiFadeIn 0.5s cubic-bezier(0, 0, 0.2, 1) both;
    animation-delay: 0.14s;
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

  @keyframes apiFadeIn {
    from {
      opacity: 0;
      transform: translateY(14px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ad-platform-info-page--ap-fx::before,
    .ad-platform-info-page--ap-fx::after,
    .api-page-fx {
      animation: none;
    }

    .api-skeleton__block--fx {
      animation: none;
    }

    .api-section,
    .api-skel-entry-1,
    .api-skel-entry-2,
    .api-skel-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }
  }
</style>

<style lang="scss">
  /* DatePicker 弹层挂 body，与广告成效筛选下拉一致 */
  .api-info-filter-popper.el-popper,
  .api-info-filter-popper.el-picker__popper {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 28%) !important;

    --el-datepicker-border-color: rgb(96 165 250 / 35%);
    --el-datepicker-text-color: #e2e8f0;
    --el-datepicker-off-text-color: #64748b;
    --el-datepicker-header-text-color: #f1f5f9;

    border-radius: 12px !important;
    box-shadow:
      0 16px 48px rgb(0 0 0 / 55%),
      0 0 0 1px rgb(16 185 129 / 12%),
      0 0 32px rgb(59 130 246 / 15%) !important;
  }

  .api-info-filter-popper .el-popper__arrow::before {
    background: rgb(10 10 14 / 96%) !important;
    border: 1px solid rgb(96 165 250 / 25%) !important;
  }
</style>
