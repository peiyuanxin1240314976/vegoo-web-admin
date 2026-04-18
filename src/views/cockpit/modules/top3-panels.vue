<template>
  <div class="cockpit-top3-panels">
    <!-- Top3 收入应用 - 黄色 -->
    <div
      :class="[
        'top3-module',
        'top3-module--revenue',
        { 'top3-module--fills': dateRange === 'today' }
      ]"
    >
      <div class="top3-border-spin" aria-hidden="true" />
      <div class="top3-module__header">
        <span class="top3-module__icon top3-module__icon--trophy">
          <i class="iconfont icon-jinjiangbei" />
        </span>
        <span class="top3-module__title">Top3收入应用</span>
        <!-- <a class="top3-module__more" href="javascript:;">查看更多</a> -->
      </div>
      <div class="top3-module__list">
        <template v-if="displayTopRevenue.length">
          <div v-for="(item, i) in displayTopRevenue" :key="'revenue-' + i" class="top3-row">
            <span class="top3-row__medal iconfont" :class="medalIconClasses[i]"></span>
            <div class="top3-row__app-icon" title="应用" />
            <span class="top3-row__name">{{ item.name }}</span>
            <span class="top3-row__value">{{ item.revenue ?? item.roas }}</span>
            <span v-if="item.trendPercent" class="top3-row__trend up">
              <ElIcon><Top /></ElIcon>{{ item.trendPercent }}
            </span>
          </div>
        </template>
        <div v-else class="top3-empty">暂无数据</div>
      </div>
    </div>

    <!-- Top3 差评数据（与收入/用户增长同排榜样式；昨日 Tab 同源 topBadReview / badApp） -->
    <div
      :class="[
        'top3-module',
        'top3-module--badreview',
        { 'top3-module--fills': dateRange === 'today' }
      ]"
    >
      <div class="top3-border-spin" aria-hidden="true" />
      <div class="top3-module__header">
        <span class="top3-module__icon top3-module__icon--dislike">
          <DislikeIcon />
        </span>
        <span class="top3-module__title">Top3差评数据</span>
        <!-- <a class="top3-module__more" href="javascript:;">查看更多</a> -->
      </div>
      <div class="top3-module__list">
        <template v-if="displayTopBadReview.length">
          <div
            v-for="(item, i) in displayTopBadReview"
            :key="'bad-' + i"
            class="top3-row top3-row--name-only"
          >
            <span class="top3-row__medal iconfont" :class="medalIconClasses[i]"></span>
            <div class="top3-row__app-icon" title="应用" />
            <span class="top3-row__name">{{ item.name }}</span>
          </div>
        </template>
        <div v-else class="top3-empty">暂无数据</div>
      </div>
    </div>

    <!-- Top3 用户增长 - 绿色 -->
    <div
      :class="[
        'top3-module',
        'top3-module--growth',
        { 'top3-module--fills': dateRange === 'today' }
      ]"
    >
      <div class="top3-border-spin" aria-hidden="true" />
      <div class="top3-module__header">
        <span class="top3-module__icon top3-module__icon--trend">
          <TrendIcon />
        </span>
        <span class="top3-module__title">Top3用户增长</span>
        <!-- <a class="top3-module__more" href="javascript:;">查看更多</a> -->
      </div>
      <div class="top3-module__list">
        <template v-if="displayTopUser.length">
          <div v-for="(item, i) in displayTopUser" :key="'user-' + i" class="top3-row">
            <span class="top3-row__medal iconfont" :class="medalIconClasses[i]"></span>
            <div class="top3-row__app-icon" title="应用" />
            <span class="top3-row__name">{{ item.name }}</span>
            <span class="top3-row__value">{{ item.growth ?? item.dau }}</span>
            <span v-if="item.trendPercent" class="top3-row__trend up">
              <ElIcon><Top /></ElIcon>{{ item.trendPercent }}
            </span>
          </div>
        </template>
        <div v-else class="top3-empty">暂无数据</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, defineComponent, h } from 'vue'
  import { Top } from '@element-plus/icons-vue'
  import type { CockpitTopRevenueItem, CockpitTopBadReviewItem, CockpitTopUserItem } from '../types'

  defineOptions({ name: 'CockpitTop3Panels' })

  /** 奖牌图标：第一、二、三名对应阿里 iconfont */
  const medalIconClasses = ['icon-jiangbei-', 'icon-jiangbei-1', 'icon-jiangbei-2']

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
      dateRange?: string
    }>(),
    { topRevenue: () => [], topBadReview: () => [], topUser: () => [], dateRange: '' }
  )

  type DisplayTopBadReviewItem = { name: string }

  const displayTopRevenue = computed(() =>
    Array.isArray(props.topRevenue) ? props.topRevenue : []
  )

  const displayTopBadReview = computed<DisplayTopBadReviewItem[]>(() => {
    const raw = Array.isArray(props.topBadReview) ? props.topBadReview : []
    return raw.map((i) => ({
      name: i.sAppName ?? i.name ?? '—'
    }))
  })
  const displayTopUser = computed(() => (Array.isArray(props.topUser) ? props.topUser : []))
</script>

<style scoped lang="scss">
  /* 与广告成效 KPI 卡片一致：旋转渐变边框（Houdini @property） */
  @property --top3-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .cockpit-top3-panels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .top3-module {
    --top3-accent: #3b82f6;

    position: relative;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    overflow: hidden;
    background-color: rgb(8 8 12 / 98%);
    background-image:
      radial-gradient(
        ellipse 120% 80% at 50% -18%,
        var(--top3-glow) 0%,
        var(--top3-glow-2) 30%,
        transparent 58%
      ),
      linear-gradient(
        172deg,
        color-mix(in srgb, var(--top3-accent) 22%, rgb(8 8 12)) 0%,
        color-mix(in srgb, var(--top3-accent) 38%, rgb(8 8 12)) 60%,
        color-mix(in srgb, var(--top3-accent-2) 15%, rgb(8 8 12)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--top3-accent) 55%, transparent);
    border-radius: 14px;
    box-shadow:
      0 8px 40px rgb(0 0 0 / 52%),
      0 0 0 1px color-mix(in srgb, var(--top3-accent) 18%, transparent),
      inset 0 1px 0 rgb(255 255 255 / 16%),
      inset 0 -10px 28px rgb(0 0 0 / 38%),
      0 0 28px color-mix(in srgb, var(--top3-accent) 12%, transparent);
    transition:
      box-shadow 0.4s var(--ease-out),
      border-color 0.28s var(--ease-default);

    &.top3-module--fills {
      flex: 1;
    }

    --top3-accent-2: #06b6d4;
    --top3-glow: rgb(59 130 246 / 45%);
    --top3-glow-2: rgb(6 182 212 / 25%);
    --top3-spin-a: rgb(16 185 129 / 55%);
    --top3-spin-b: rgb(59 130 246 / 48%);
    --top3-spin-c: rgb(168 85 247 / 38%);

    > *:not(.top3-border-spin) {
      position: relative;
      z-index: 1;
    }

    &::before {
      position: absolute;
      top: 0;
      left: 50%;
      z-index: 0;
      width: 80%;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        var(--top3-accent),
        var(--top3-accent-2),
        transparent
      );
      opacity: 0.8;
      transform: translateX(-50%);
    }

    &::after {
      position: absolute;
      bottom: 0;
      left: 50%;
      z-index: 0;
      width: 60%;
      height: 1px;
      pointer-events: none;
      content: '';
      background: linear-gradient(90deg, transparent, var(--top3-accent), transparent);
      opacity: 0.45;
      transform: translateX(-50%);
    }

    &:hover {
      border-color: color-mix(in srgb, var(--top3-accent) 85%, transparent);
      box-shadow:
        0 28px 72px rgb(0 0 0 / 55%),
        0 0 0 1px color-mix(in srgb, var(--top3-accent) 40%, transparent),
        inset 0 1px 0 rgb(255 255 255 / 20%),
        0 0 60px color-mix(in srgb, var(--top3-accent) 35%, transparent),
        0 0 100px color-mix(in srgb, var(--top3-accent) 18%, transparent),
        0 0 140px color-mix(in srgb, var(--top3-accent-2) 12%, transparent);
    }

    &:active {
      transition-duration: 0.12s;
    }

    &--revenue {
      --top3-accent: #f97316;
      --top3-accent-2: #fbbf24;
      --top3-glow: rgb(249 115 22 / 45%);
      --top3-glow-2: rgb(251 191 36 / 22%);
      --top3-spin-a: rgb(249 115 22 / 62%);
      --top3-spin-b: rgb(239 68 68 / 48%);
      --top3-spin-c: rgb(251 191 36 / 42%);
    }

    &--badreview {
      --top3-accent: #ef4444;
      --top3-accent-2: #f97316;
      --top3-glow: rgb(239 68 68 / 45%);
      --top3-glow-2: rgb(249 115 22 / 22%);
      --top3-spin-a: rgb(239 68 68 / 62%);
      --top3-spin-b: rgb(249 115 22 / 48%);
      --top3-spin-c: rgb(251 191 36 / 38%);
    }

    &--growth {
      --top3-accent: #10b981;
      --top3-accent-2: #22d3ee;
      --top3-glow: rgb(16 185 129 / 45%);
      --top3-glow-2: rgb(34 211 238 / 22%);
      --top3-spin-a: rgb(16 185 129 / 62%);
      --top3-spin-b: rgb(34 211 238 / 48%);
      --top3-spin-c: rgb(59 130 246 / 38%);
    }

    &__header {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 12px 14px;
      border-bottom: 1px solid color-mix(in srgb, var(--top3-accent) 28%, transparent);
    }

    &__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--top3-accent);
    }

    &__title {
      flex: 1;
      font-size: 14px;
      font-weight: 700;
      color: var(--text-secondary);
      letter-spacing: 0.02em;
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
      flex: 1;
      padding: 8px 12px 12px;
    }

    .top3-empty {
      padding: 24px 12px;
      font-size: 13px;
      color: var(--text-secondary);
      text-align: center;
    }
  }

  /* 旋转渐变边框层（与 ad-performance-kpi-cards 一致） */
  .top3-border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1.5px;
    pointer-events: none;
    background: conic-gradient(
      from var(--top3-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--top3-spin-a) 45deg,
      transparent 95deg,
      transparent 145deg,
      var(--top3-spin-b) 195deg,
      transparent 250deg,
      transparent 300deg,
      var(--top3-spin-c) 340deg,
      transparent 360deg
    );
    filter: blur(0.3px);
    border-radius: inherit;
    opacity: 0.92;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: top3-border-spin 4s linear infinite;

    --top3-border-angle: 0deg;
  }

  @keyframes top3-border-spin {
    to {
      --top3-border-angle: 360deg;
    }
  }

  /* 浅色：同结构，轻量底与边框，避免驾驶舱浅色页过暗 */
  html:not(.dark) .top3-module {
    background-color: #fff;
    background-image: none;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow:
      0 8px 24px rgb(15 23 42 / 8%),
      inset 0 1px 0 rgb(255 255 255 / 90%);

    &::before {
      opacity: 0.7;
    }

    &::after {
      opacity: 0.35;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--top3-accent) 45%, var(--el-border-color-lighter));
      box-shadow:
        0 14px 36px rgb(15 23 42 / 12%),
        0 0 0 1px color-mix(in srgb, var(--top3-accent) 22%, transparent);
    }

    .top3-module__title {
      color: #303133;
    }

    .top3-border-spin {
      opacity: 0.45;
    }

    .top3-row__name {
      color: #303133;
    }

    .top3-row__value {
      color: #606266;
    }
  }

  html.dark .top3-module {
    .top3-row__name {
      color: #e5e7eb;
    }

    .top3-row__value {
      color: #cbd5e1;
    }

    .top3-empty {
      color: #94a3b8;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .top3-border-spin {
      opacity: 0;
      animation: none;
    }

    .top3-module {
      transition: none;

      &:hover,
      &:active {
        transform: none;
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
      display: inline-flex;
      // flex-shrink: 0;
      align-items: center;
      justify-content: center;
      // width: 20px;
      // height: 20px;
      font-size: 22px;
      font-style: normal;
      // font-weight: 700;
      // color: #b8860b;
      // text-align: center;
      // background: linear-gradient(180deg, #f0e68c 0%, #daa520 100%);
      // border-radius: 50%;
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

    &--name-only &__name {
      flex: 1;
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
  }
</style>
