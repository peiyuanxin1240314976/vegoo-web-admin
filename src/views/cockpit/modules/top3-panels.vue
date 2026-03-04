<template>
  <ElCard class="cockpit-panel" shadow="never">
    <template #header>
      <span>Top 排行</span>
    </template>
    <ElRow :gutter="12">
      <ElCol :span="8">
        <div class="top3-block">
          <div class="top3-title">Top3收入应用</div>
          <div v-for="(item, i) in topRevenue" :key="i" class="top3-item">
            <span class="name">{{ item.name }}</span>
            <span class="extra">({{ item.roas }} ROAS)</span>
          </div>
        </div>
      </ElCol>
      <ElCol :span="8">
        <div class="top3-block">
          <div class="top3-title">Top3消耗渠道</div>
          <div v-for="(item, i) in topSpend" :key="i" class="top3-item">
            <span class="name">{{ item.name }}</span>
            <span class="extra">({{ item.roi }} ROI)</span>
          </div>
        </div>
      </ElCol>
      <ElCol :span="8">
        <div class="top3-block">
          <div class="top3-title">Top3用户增长</div>
          <div v-for="(item, i) in topUser" :key="i" class="top3-item">
            <span class="name">{{ item.name }}</span>
            <span class="extra">({{ item.dau }})</span>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </ElCard>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CockpitTopRevenueItem, CockpitTopSpendItem, CockpitTopUserItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitTop3Panels' })

  const props = withDefaults(
    defineProps<{
      topRevenue?: CockpitTopRevenueItem[]
      topSpend?: CockpitTopSpendItem[]
      topUser?: CockpitTopUserItem[]
    }>(),
    { topRevenue: () => [], topSpend: () => [], topUser: () => [] }
  )

  const topRevenue = computed(() =>
    props.topRevenue?.length ? props.topRevenue : MOCK_COCKPIT_OVERVIEW.topRevenue
  )
  const topSpend = computed(() =>
    props.topSpend?.length ? props.topSpend : MOCK_COCKPIT_OVERVIEW.topSpend
  )
  const topUser = computed(() =>
    props.topUser?.length ? props.topUser : MOCK_COCKPIT_OVERVIEW.topUser
  )
</script>

<style scoped lang="scss">
  .cockpit-panel {
    height: 100%;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .top3-block {
    .top3-title {
      margin-bottom: 8px;
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }

    .top3-item {
      padding: 4px 0;
      font-size: 13px;

      .name {
        color: var(--el-text-color-regular);
      }

      .extra {
        margin-left: 4px;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
