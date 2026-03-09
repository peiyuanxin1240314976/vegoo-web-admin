<template>
  <div class="cockpit-top3-panels">
    <!-- Top3 收入应用 - 黄色 -->
    <div class="top3-module top3-module--revenue">
      <div class="top3-module__header">
        <span class="top3-module__icon top3-module__icon--trophy">
          <TrophyIcon />
        </span>
        <span class="top3-module__title">Top3收入应用</span>
        <a class="top3-module__more" href="javascript:;">查看更多</a>
      </div>
      <div class="top3-module__list">
        <div v-for="(item, i) in displayTopRevenue" :key="'revenue-' + i" class="top3-row">
          <span class="top3-row__medal">{{ i + 1 }}</span>
          <div class="top3-row__app-icon" title="应用" />
          <span class="top3-row__name">{{ item.name }}</span>
          <span class="top3-row__value">{{ item.revenue ?? item.roas }}</span>
          <span v-if="item.trendPercent" class="top3-row__trend up">
            <ElIcon><Top /></ElIcon>{{ item.trendPercent }}
          </span>
        </div>
      </div>
    </div>

    <!-- Top3 差评产品 - 红色 -->
    <div class="top3-module top3-module--badreview">
      <div class="top3-module__header">
        <span class="top3-module__icon top3-module__icon--dislike">
          <DislikeIcon />
        </span>
        <span class="top3-module__title">Top3差评产品</span>
        <a class="top3-module__more" href="javascript:;">查看更多</a>
      </div>
      <div class="top3-module__list">
        <div v-for="(item, i) in displayTopBadReview" :key="'bad-' + i" class="top3-row">
          <div class="top3-row__app-icon" title="应用" />
          <span class="top3-row__name">{{ item.name }}</span>
          <span class="top3-row__tag" :class="item.trend === 'up' ? 'tag-orange' : 'tag-red'">
            {{ item.reasonTag }}
          </span>
          <span class="top3-row__metric" :class="item.trend === 'up' ? 'metric-up' : 'metric-down'">
            {{ item.metric }}
          </span>
        </div>
      </div>
    </div>

    <!-- Top3 用户增长 - 绿色 -->
    <div class="top3-module top3-module--growth">
      <div class="top3-module__header">
        <span class="top3-module__icon top3-module__icon--trend">
          <TrendIcon />
        </span>
        <span class="top3-module__title">Top3用户增长</span>
        <a class="top3-module__more" href="javascript:;">查看更多</a>
      </div>
      <div class="top3-module__list">
        <div v-for="(item, i) in displayTopUser" :key="'user-' + i" class="top3-row">
          <span class="top3-row__medal">{{ i + 1 }}</span>
          <div class="top3-row__app-icon" title="应用" />
          <span class="top3-row__name">{{ item.name }}</span>
          <span class="top3-row__value">{{ item.growth ?? item.dau }}</span>
          <span v-if="item.trendPercent" class="top3-row__trend up">
            <ElIcon><Top /></ElIcon>{{ item.trendPercent }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, defineComponent, h } from 'vue'
  import { Top } from '@element-plus/icons-vue'
  import type { CockpitTopRevenueItem, CockpitTopBadReviewItem, CockpitTopUserItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitTop3Panels' })

  const TrophyIcon = defineComponent({
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          width: '18',
          height: '18'
        },
        [
          h('path', {
            d: 'M12 2C10.9 2 10 2.9 10 4v1H6c-1.1 0-2 .9-2 2v2c0 2.2 1.8 4 4 4 .6 1.5 1.9 2.5 3.5 2.5V19H8v2h8v-2h-2v-3.5c1.6-.5 2.9-1.5 3.5-2.5 2.2 0 4-1.8 4-4V7c0-1.1-.9-2-2-2h-4V4c0-1.1-.9-2-2-2zm-2 6.5c1.2-.4 2.5-.9 3.5-1.5V7H4v2c0 1.1.9 2 2 2h4.5zM12 13c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-5h-2v1.5c.9.6 2.3 1.1 3.5 1.5H20V8z'
          })
        ]
      )
    }
  })
  const TrendIcon = defineComponent({
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          width: '18',
          height: '18'
        },
        [
          h('path', {
            d: 'M3.5 18.5l6-6 4 4 7-9v3.5H22v-7h-7v1.5H18.5L13.5 13l-4-4-6 6z'
          })
        ]
      )
    }
  })
  const DislikeIcon = defineComponent({
    render() {
      return h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'currentColor',
          width: '18',
          height: '18'
        },
        [
          h('path', {
            d: 'M10 15v4c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-4h-4zm8.5-10.5L16 3V2c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v5l-1.5 1.5H4v7c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-5h8v5c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-7h-2.5z'
          })
        ]
      )
    }
  })

  const props = withDefaults(
    defineProps<{
      topRevenue?: CockpitTopRevenueItem[]
      topBadReview?: CockpitTopBadReviewItem[]
      topUser?: CockpitTopUserItem[]
    }>(),
    { topRevenue: () => [], topBadReview: () => [], topUser: () => [] }
  )

  const displayTopRevenue = computed(() =>
    props.topRevenue?.length ? props.topRevenue : MOCK_COCKPIT_OVERVIEW.topRevenue
  )
  const displayTopBadReview = computed(() =>
    props.topBadReview?.length
      ? props.topBadReview
      : ((MOCK_COCKPIT_OVERVIEW as { topBadReview?: CockpitTopBadReviewItem[] }).topBadReview ?? [])
  )
  const displayTopUser = computed(() =>
    props.topUser?.length ? props.topUser : MOCK_COCKPIT_OVERVIEW.topUser
  )
</script>

<style scoped lang="scss">
  .cockpit-top3-panels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .top3-module {
    position: relative;
    overflow: hidden;
    background: var(--el-fill-color-dark);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 8px;
      content: '';
      border-radius: 8px 8px 0 0;
    }

    &__header {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 10px 12px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }

    &__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
    }

    &__title {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    &__more {
      font-size: 12px;
      color: var(--el-color-success);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    &__list {
      padding: 8px 12px 12px;
    }

    &--revenue {
      &::before {
        background: linear-gradient(180deg, #e6a23c 0%, rgb(230 162 60 / 35%) 100%);
      }

      .top3-module__header {
        color: #e6a23c;
      }

      .top3-module__icon--trophy {
        color: #e6a23c;
      }
    }

    &--badreview {
      &::before {
        background: linear-gradient(180deg, #f56c6c 0%, rgb(245 108 108 / 35%) 100%);
      }

      .top3-module__header {
        color: #f56c6c;
      }

      .top3-module__icon--dislike {
        color: #f56c6c;
      }
    }

    &--growth {
      &::before {
        background: linear-gradient(180deg, #67c23a 0%, rgb(103 194 58 / 35%) 100%);
      }

      .top3-module__header {
        color: #67c23a;
      }

      .top3-module__icon--trend {
        color: #67c23a;
      }
    }
  }

  .top3-row {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 36px;
    padding: 6px 0;
    font-size: 13px;

    &__medal {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      font-size: 11px;
      font-weight: 700;
      line-height: 20px;
      color: #b8860b;
      text-align: center;
      background: linear-gradient(180deg, #f0e68c 0%, #daa520 100%);
      border-radius: 50%;
    }

    &__app-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      font-size: 12px;
      font-weight: bold;
      color: #fff;
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      border-radius: 6px;

      &::after {
        content: 'A';
      }
    }

    &__name {
      flex: 0 1 auto;
      min-width: 0;
      color: var(--el-text-color-primary);
    }

    &__value {
      margin-left: auto;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    &__trend {
      display: inline-flex;
      gap: 2px;
      align-items: center;
      white-space: nowrap;

      &.up {
        color: var(--el-color-success);
      }

      &.down {
        color: var(--el-color-danger);
      }
    }

    &__tag {
      padding: 2px 8px;
      font-size: 12px;
      border-radius: 4px;

      &.tag-red {
        color: #f56c6c;
        background: rgb(245 108 108 / 20%);
      }

      &.tag-orange {
        color: #e6a23c;
        background: rgb(230 162 60 / 20%);
      }
    }

    &__metric {
      margin-left: auto;
      font-size: 12px;
      white-space: nowrap;

      &.metric-up,
      &.metric-down {
        color: var(--el-color-danger);
      }
    }
  }
</style>
