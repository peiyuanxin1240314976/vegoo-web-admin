<template>
  <div class="cockpit-pace-kpi">
    <div class="pace-border-spin" aria-hidden="true" />
    <div class="pace-header">
      <span class="pace-title">消耗节奏监控</span>
    </div>
    <div class="pace-body">
      <template v-if="mainList.length || managedList.length">
        <!-- 第一区块：自投（与代投同时存在时显示分区标题） -->
        <div v-if="mainList.length" class="pace-section">
          <div v-if="managedList.length" class="pace-section-title pace-section-title--self"
            >自投</div
          >
          <div v-for="(item, index) in mainList" :key="'main-' + index" class="pace-item">
            <div class="pace-item-top">
              <span class="pace-name">{{ item.name }}</span>
              <span
                class="pace-budget tabular-nums"
                :class="{ 'is-warning': item.tagType === 'danger' }"
              >
                {{ formatMoney(item.current) }} / {{ formatMoney(item.budget) }}
              </span>
            </div>
            <div class="pace-item-bottom">
              <div
                class="pace-icon-placeholder"
                :class="{ 'pace-icon-placeholder--iconfont': paceIconDisplay(item).iconClass }"
                :title="item.name"
              >
                <i
                  v-if="paceIconDisplay(item).iconClass"
                  class="iconfont"
                  :class="paceIconDisplay(item).iconClass"
                  aria-hidden="true"
                />
                <span v-else class="pace-icon-fallback-letter">{{
                  paceIconDisplay(item).letter
                }}</span>
              </div>
              <div class="pace-bar-wrap">
                <div class="pace-bar-track" :style="barFillStyle(item)">
                  <span class="pace-bar-percent tabular-nums">{{
                    formatPercent(item.percent)
                  }}</span>
                </div>
              </div>
              <span class="pace-tag" :class="'pace-tag--' + item.tagType">
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
        <!-- 第二区块：代投 -->
        <div v-if="managedList.length" class="pace-section">
          <div class="pace-section-title pace-section-title--managed">代投</div>
          <div v-for="(item, index) in managedList" :key="'managed-' + index" class="pace-item">
            <div class="pace-item-top">
              <span class="pace-name">{{ item.name }}</span>
              <span
                class="pace-budget tabular-nums"
                :class="{ 'is-warning': item.tagType === 'danger' }"
              >
                {{ formatMoney(item.current) }} / {{ formatMoney(item.budget) }}
              </span>
            </div>
            <div class="pace-item-bottom">
              <div
                class="pace-icon-placeholder"
                :class="{ 'pace-icon-placeholder--iconfont': paceIconDisplay(item).iconClass }"
                :title="item.name"
              >
                <i
                  v-if="paceIconDisplay(item).iconClass"
                  class="iconfont"
                  :class="paceIconDisplay(item).iconClass"
                  aria-hidden="true"
                />
                <span v-else class="pace-icon-fallback-letter">{{
                  paceIconDisplay(item).letter
                }}</span>
              </div>
              <div class="pace-bar-wrap">
                <div class="pace-bar-track" :style="barFillStyle(item)">
                  <span class="pace-bar-percent tabular-nums">{{
                    formatPercent(item.percent)
                  }}</span>
                </div>
              </div>
              <span class="pace-tag" :class="'pace-tag--' + item.tagType">
                {{ item.status }}
              </span>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="pace-empty">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getAdPlatformIconDisplay } from '@/utils/ui/ad-platform-iconfont'
  import type { CockpitSpendPaceItem } from '../types'
  import { MOCK_COCKPIT_OVERVIEW } from '../mock/data'

  defineOptions({ name: 'CockpitSpendPaceMonitor' })

  const props = withDefaults(defineProps<{ list?: CockpitSpendPaceItem[] }>(), {
    list: () => []
  })

  const displayList = computed(() =>
    Array.isArray(props.list) ? props.list : MOCK_COCKPIT_OVERVIEW.spendPace
  )

  const mainList = computed(() => displayList.value.filter((i) => i.section !== 'managed'))
  const managedList = computed(() => displayList.value.filter((i) => i.section === 'managed'))

  function formatMoney(n: number): string {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function formatPercent(n: number): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
  }

  function paceIconDisplay(item: CockpitSpendPaceItem) {
    return getAdPlatformIconDisplay({ platform: item.platform, name: item.name })
  }

  function barFillStyle(item: CockpitSpendPaceItem) {
    const pct = Math.min(100, Math.max(0, item.percent))
    const gradient =
      item.tagType === 'danger'
        ? 'linear-gradient(90deg, var(--art-success) 0%, var(--art-warning) 50%, var(--art-danger) 100%)'
        : 'linear-gradient(90deg, var(--art-success) 0%, var(--art-warning) 100%)'
    return {
      width: pct + '%',
      background: gradient
    }
  }
</script>

<style scoped lang="scss">
  /* 与驾驶舱第一排「预估利润」KPI 同系：accent 为 primary+danger / primary+success 混色，紫为低透明度叠层 */
  @property --pace-border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  .cockpit-pace-kpi {
    /* 与 global-kpi-cards「预估利润」.cockpit-kpi-card--profit 一致 */
    --pace-accent: color-mix(in srgb, var(--art-primary) 65%, var(--art-danger));
    --pace-accent-2: color-mix(in srgb, var(--art-primary) 55%, var(--art-success));
    --pace-base: color-mix(in srgb, var(--default-bg-color) 92%, black);
    --pace-spin-a: color-mix(in srgb, var(--pace-accent) 42%, transparent);
    --pace-spin-b: color-mix(in srgb, var(--pace-accent-2) 34%, transparent);
    --pace-spin-c: color-mix(in srgb, var(--pace-accent) 26%, transparent);

    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background-color: color-mix(in srgb, var(--default-bg-color) 86%, black);
    background-image:
      radial-gradient(
        ellipse 120% 80% at 50% -18%,
        color-mix(in srgb, var(--pace-accent) 45%, transparent) 0%,
        color-mix(in srgb, var(--pace-accent-2) 22%, transparent) 30%,
        transparent 58%
      ),
      linear-gradient(
        172deg,
        color-mix(in srgb, var(--pace-accent) 18%, var(--pace-base)) 0%,
        color-mix(in srgb, var(--pace-accent) 28%, var(--pace-base)) 60%,
        color-mix(in srgb, var(--pace-accent-2) 14%, var(--pace-base)) 100%
      );
    border: 1px solid color-mix(in srgb, var(--pace-accent) 55%, transparent);
    border-radius: 14px;
    box-shadow:
      0 8px 40px color-mix(in srgb, black 52%, transparent),
      0 0 0 1px color-mix(in srgb, var(--pace-accent) 18%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 16%, transparent),
      inset 0 -10px 28px color-mix(in srgb, black 38%, transparent),
      0 0 28px color-mix(in srgb, var(--pace-accent) 12%, transparent);
    transition:
      box-shadow 0.4s var(--ease-out),
      border-color 0.28s var(--ease-default);

    > *:not(.pace-border-spin) {
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
        var(--pace-accent),
        var(--pace-accent-2),
        transparent
      );
      opacity: 0.55;
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
      background: linear-gradient(90deg, transparent, var(--pace-accent), transparent);
      opacity: 0.28;
      transform: translateX(-50%);
    }

    &:hover {
      border-color: color-mix(in srgb, var(--pace-accent) 85%, transparent);
      box-shadow:
        0 28px 72px color-mix(in srgb, black 55%, transparent),
        0 0 0 1px color-mix(in srgb, var(--pace-accent) 40%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 20%, transparent),
        0 0 60px color-mix(in srgb, var(--pace-accent) 35%, transparent),
        0 0 100px color-mix(in srgb, var(--pace-accent) 18%, transparent),
        0 0 140px color-mix(in srgb, var(--pace-accent-2) 12%, transparent);
    }

    &:active {
      transition-duration: 0.12s;
    }
  }

  .pace-border-spin {
    position: absolute;
    inset: -1px;
    z-index: 2;
    padding: 1.5px;
    pointer-events: none;
    background: conic-gradient(
      from var(--pace-border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      var(--pace-spin-a) 45deg,
      transparent 95deg,
      transparent 145deg,
      var(--pace-spin-b) 195deg,
      transparent 250deg,
      transparent 300deg,
      var(--pace-spin-c) 340deg,
      transparent 360deg
    );
    filter: blur(0.3px);
    border-radius: inherit;
    opacity: 0.52;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: pace-border-spin 4s linear infinite;

    --pace-border-angle: 0deg;
  }

  @keyframes pace-border-spin {
    to {
      --pace-border-angle: 360deg;
    }
  }

  html:not(.dark) .cockpit-pace-kpi {
    --pace-accent: color-mix(in srgb, var(--art-primary) 65%, var(--art-danger));
    --pace-accent-2: color-mix(in srgb, var(--art-primary) 55%, var(--art-success));

    background:
      linear-gradient(135deg, rgb(255 255 255 / 68%) 0%, rgb(255 255 255 / 45%) 100%),
      linear-gradient(135deg, rgb(114 46 209 / 18%) 0%, rgb(114 46 209 / 8%) 100%);
    border: 1px solid rgb(0 0 0 / 10%);
    box-shadow:
      0 8px 24px rgb(15 23 42 / 8%),
      inset 0 1px 0 rgb(255 255 255 / 90%);

    &::before {
      opacity: 0.42;
    }

    &::after {
      opacity: 0.2;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--pace-accent) 38%, rgb(0 0 0 / 10%));
      box-shadow:
        0 14px 36px rgb(15 23 42 / 12%),
        0 0 0 1px color-mix(in srgb, var(--pace-accent) 16%, transparent);
    }

    .pace-border-spin {
      opacity: 0.24;
    }
  }

  .pace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px;
    font-size: 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--pace-accent) 28%, transparent);
  }

  html.dark .pace-title {
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    letter-spacing: 0.02em;
  }

  html:not(.dark) .pace-title {
    font-weight: 600;
    color: #722ed1;
    letter-spacing: 0.02em;
  }

  .pace-body {
    flex: 1;
    padding: 9px 12px;
    overflow-y: auto;
  }

  .pace-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    text-align: center;
  }

  .pace-section {
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .pace-section-title {
    padding: 4px 10px;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0.04em;
    border-radius: 8px;

    &--self {
      background: linear-gradient(
        90deg,
        rgb(114 46 209 / 16%) 0%,
        rgb(114 46 209 / 5%) 48%,
        transparent 100%
      );
      border: 1px solid rgb(114 46 209 / 22%);
    }

    &--managed {
      background: linear-gradient(
        90deg,
        rgb(114 46 209 / 12%) 0%,
        rgb(59 130 246 / 6%) 52%,
        transparent 100%
      );
      border: 1px solid rgb(114 46 209 / 18%);
    }
  }

  .pace-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px 10px;
    margin-bottom: 6px;
    border-radius: 10px;
    transition:
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default);

    html.dark & {
      background: rgb(4 4 4 / 35%);
      border: 1px solid color-mix(in srgb, var(--pace-accent) 22%, transparent);
    }

    html:not(.dark) & {
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border-color: color-mix(in srgb, var(--pace-accent) 38%, transparent);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--pace-accent) 18%, transparent);
    }
  }

  .pace-item-top {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
  }

  .pace-name {
    overflow: hidden;
    font-size: 13px;
    color: var(--text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pace-budget {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--text-secondary);

    &.is-warning {
      color: var(--text-danger);
    }
  }

  .pace-item-bottom {
    display: flex;
    gap: 8px 10px;
    align-items: center;
  }

  .pace-icon-placeholder {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    overflow: hidden;
    background: var(--el-fill-color-dark);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    html.dark & {
      background: linear-gradient(145deg, rgb(39 39 42 / 85%), rgb(24 24 27 / 55%));
      border-color: color-mix(in srgb, var(--pace-accent) 28%, transparent);
      box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
    }

    &--iconfont {
      padding: 0;
      color: var(--text-secondary);
    }

    & .iconfont {
      font-size: 16px;
      line-height: 1;
    }

    .pace-icon-fallback-letter {
      font-size: 12px;
      font-weight: 700;
      line-height: 1;
      color: var(--text-secondary);
    }
  }

  .pace-bar-wrap {
    flex: 1;
    min-width: 80px;
    height: 16px;
    overflow: hidden;
    background: var(--el-fill-color-dark);
    border-radius: 999px;

    html.dark & {
      background: rgb(0 0 0 / 38%);
      border: 1px solid color-mix(in srgb, var(--pace-accent) 18%, transparent);
      box-shadow: inset 0 1px 2px rgb(0 0 0 / 40%);
    }
  }

  .pace-bar-track {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
    height: 100%;
    padding-right: 6px;
    border-radius: 999px;
    transition: width var(--duration-normal) var(--ease-default);
  }

  .pace-bar-percent {
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    color: #fff;
    text-shadow: 0 1px 2px rgb(0 0 0 / 45%);
    white-space: nowrap;
  }

  .pace-tag {
    flex-shrink: 0;
    padding: 1px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 999px;

    &.pace-tag--success {
      color: var(--text-success);
      background: rgb(16 185 129 / 14%);
      border: 1px solid rgb(16 185 129 / 38%);
    }

    &.pace-tag--warning {
      color: var(--text-warning);
      background: rgb(249 115 22 / 14%);
      border: 1px solid rgb(249 115 22 / 38%);
    }

    &.pace-tag--danger {
      color: var(--text-danger);
      background: rgb(239 68 68 / 14%);
      border: 1px solid rgb(239 68 68 / 38%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pace-border-spin {
      opacity: 0;
      animation: none;
    }

    .cockpit-pace-kpi {
      transition: none;

      &:hover,
      &:active {
        transform: none;
      }
    }

    .pace-bar-track {
      transition: none;
    }

    .pace-item {
      transition: none;
    }
  }
</style>
