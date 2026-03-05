<template>
  <div class="attribution-analysis-page">
    <h1 class="page-title">归因分析</h1>
    <ElTabs v-model="activeTab" class="attribution-tabs">
      <ElTabPane label="首次点击" name="first-click">
        <AttributionFirstClick />
      </ElTabPane>
      <ElTabPane label="末次点击" name="last-click">
        <AttributionLastClick />
      </ElTabPane>
      <ElTabPane label="线性分析" name="linear">
        <AttributionLinear />
      </ElTabPane>
      <ElTabPane label="时间衰减" name="time-decay">
        <AttributionTimeDecay />
      </ElTabPane>
      <ElTabPane label="位置基础" name="position-based">
        <AttributionPositionBased />
      </ElTabPane>
      <ElTabPane label="数据驱动" name="data-driven">
        <AttributionDataDriven />
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import AttributionFirstClick from './modules/first-click/index.vue'
  import AttributionLastClick from './modules/last-click/index.vue'
  import AttributionLinear from './modules/linear/index.vue'
  import AttributionTimeDecay from './modules/time-decay/index.vue'
  import AttributionPositionBased from './modules/position-based/index.vue'
  import AttributionDataDriven from './modules/data-driven/index.vue'

  defineOptions({ name: 'AttributionAnalysis' })

  const activeTab = ref('first-click')
</script>

<style scoped lang="scss">
  .attribution-analysis-page {
    padding-bottom: 20px;
  }

  .page-title {
    margin: 0 0 16px;
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .attribution-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 16px;
    }

    :deep(.el-tabs__item) {
      font-size: 14px;
    }

    :deep(.el-tabs__item.is-active) {
      font-weight: 600;
      color: var(--el-color-primary);
    }

    :deep(.el-tabs__ink-bar) {
      background-color: var(--el-color-primary);
    }

    :deep(.el-tabs__nav-wrap::after) {
      background-color: var(--el-border-color-lighter);
    }

    :deep(.el-tabs__active-bar) {
      background-color: var(--el-color-primary);
    }

    :deep(.el-tabs__item:hover),
    :deep(.el-tabs__item.is-active) {
      color: var(--el-color-primary);
    }

    :deep(.el-tabs__content) {
      overflow: visible;
    }
  }
</style>
