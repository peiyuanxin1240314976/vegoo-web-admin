<template>
  <div class="cockpit-pace-panel">
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
              <div class="pace-icon-placeholder" title="APP 图标占位" />
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
              <div class="pace-icon-placeholder" title="APP 图标占位" />
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
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as *;

  .cockpit-pace-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    border-radius: 12px;
  }

  html:not(.dark) .cockpit-pace-panel {
    border: 1px solid var(--el-border-color-lighter);
  }

  .pace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    html.dark & {
      border-bottom-color: rgb(96 165 250 / 14%);
    }
  }

  html.dark .pace-title {
    @include ap-title-gradient;
  }

  html:not(.dark) .pace-title {
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0.02em;
  }

  .pace-body {
    flex: 1;
    padding: 12px 16px;
    overflow-y: auto;
  }

  .pace-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    text-align: center;
  }

  .pace-section {
    margin-bottom: 14px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .pace-section-title {
    padding: 6px 12px;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0.04em;
    border-radius: 8px;

    &--self {
      background: linear-gradient(
        90deg,
        rgb(59 130 246 / 24%) 0%,
        rgb(6 182 212 / 8%) 45%,
        transparent 100%
      );
      border: 1px solid rgb(96 165 250 / 18%);
    }

    &--managed {
      background: linear-gradient(
        90deg,
        rgb(16 185 129 / 20%) 0%,
        rgb(168 85 247 / 12%) 55%,
        transparent 100%
      );
      border: 1px solid rgb(52 211 153 / 16%);
    }
  }

  .pace-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 12px;
    margin-bottom: 10px;
    border-radius: 10px;
    transition:
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default);

    html.dark & {
      background: rgb(255 255 255 / 4%);
      border: 1px solid rgb(96 165 250 / 14%);
    }

    html:not(.dark) & {
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
    }

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      border-color: rgb(96 165 250 / 32%);
      box-shadow: 0 0 0 1px rgb(59 130 246 / 12%);
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
    gap: 10px 12px;
    align-items: center;
  }

  .pace-icon-placeholder {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    background: var(--el-fill-color-dark);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;

    html.dark & {
      background: linear-gradient(145deg, rgb(39 39 42 / 85%), rgb(24 24 27 / 55%));
      border-color: rgb(96 165 250 / 22%);
      box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
    }
  }

  .pace-bar-wrap {
    flex: 1;
    min-width: 80px;
    height: 18px;
    overflow: hidden;
    background: var(--el-fill-color-dark);
    border-radius: 999px;

    html.dark & {
      background: rgb(0 0 0 / 38%);
      border: 1px solid rgb(96 165 250 / 12%);
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
    padding: 2px 8px;
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
    .pace-bar-track {
      transition: none;
    }

    .pace-item {
      transition: none;
    }
  }
</style>
