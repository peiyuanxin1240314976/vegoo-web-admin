<template>
  <div class="cockpit-pace-panel">
    <div class="pace-header">
      <span class="pace-title">消耗节奏监控</span>
      <a class="pace-more" href="javascript:;">查看更多</a>
    </div>
    <div class="pace-body">
      <template v-if="mainList.length || managedList.length">
        <!-- 第一区块：自投 -->
        <div class="pace-section">
          <div v-for="(item, index) in mainList" :key="'main-' + index" class="pace-item">
            <div class="pace-item-top">
              <span class="pace-name">{{ item.name }}</span>
              <span class="pace-budget" :class="{ 'is-warning': item.tagType === 'danger' }">
                {{ formatMoney(item.current) }} / {{ formatMoney(item.budget) }}
              </span>
            </div>
            <div class="pace-item-bottom">
              <div class="pace-icon-placeholder" title="APP 图标占位" />
              <div class="pace-bar-wrap">
                <div class="pace-bar-track" :style="barFillStyle(item)">
                  <span class="pace-bar-percent">{{ Math.round(item.percent) }}%</span>
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
          <div class="pace-section-title">代投</div>
          <div v-for="(item, index) in managedList" :key="'managed-' + index" class="pace-item">
            <div class="pace-item-top">
              <span class="pace-name">{{ item.name }}</span>
              <span class="pace-budget" :class="{ 'is-warning': item.tagType === 'danger' }">
                {{ formatMoney(item.current) }} / {{ formatMoney(item.budget) }}
              </span>
            </div>
            <div class="pace-item-bottom">
              <div class="pace-icon-placeholder" title="APP 图标占位" />
              <div class="pace-bar-wrap">
                <div class="pace-bar-track" :style="barFillStyle(item)">
                  <span class="pace-bar-percent">{{ Math.round(item.percent) }}%</span>
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
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function barFillStyle(item: CockpitSpendPaceItem) {
    const pct = Math.min(100, Math.max(0, item.percent))
    const gradient =
      item.tagType === 'danger'
        ? 'linear-gradient(90deg, #67c23a 0%, #e6a23c 50%, #f56c6c 100%)'
        : 'linear-gradient(90deg, #67c23a 0%, #e6a23c 100%)'
    return {
      width: pct + '%',
      background: gradient
    }
  }
</script>

<style scoped lang="scss">
  .cockpit-pace-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  /* 深色模式：渐变色背景 */
  html.dark .cockpit-pace-panel {
    background: linear-gradient(320deg, #000e29, #000);
  }

  .pace-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    font-size: 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .pace-title {
      font-weight: 500;
      color: var(--el-text-color-primary);
    }

    .pace-more {
      font-size: 13px;
      color: var(--el-text-color-secondary);
      text-decoration: none;

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .pace-body {
    flex: 1;
    padding: 12px 16px;
    overflow-y: auto;
  }

  .pace-empty {
    padding: 32px 16px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .pace-section {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .pace-section-title {
    padding: 5px 12px;
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--el-text-color-primary);
    background: linear-gradient(90deg, rgb(114 46 209 / 23%) 0%, rgb(114 46 209 / 0%) 100%);
    border-radius: 6px;
  }

  .pace-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 1px;

    &:last-child {
      margin-bottom: 0;
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
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pace-budget {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--el-text-color-regular);

    &.is-warning {
      color: var(--el-color-danger);
    }
  }

  .pace-item-bottom {
    display: flex;
    gap: 10px 12px;
    align-items: center;
  }

  /* APP 图标占位：暂无 ICON 时用方块替代 */
  .pace-icon-placeholder {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    background: var(--el-fill-color-dark);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
  }

  .pace-bar-wrap {
    flex: 1;
    min-width: 80px;
    height: 16px;
    overflow: hidden;
    background: var(--el-fill-color-dark);
    border-radius: 999px;
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
    transition: width 0.25s ease;
  }

  .pace-bar-percent {
    font-size: 11px;
    color: #fff;
    text-shadow: 0 0 1px rgb(0 0 0 / 50%);
    white-space: nowrap;
  }

  .pace-tag {
    flex-shrink: 0;
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 500;
    background: transparent;
    border-radius: 999px;

    &.pace-tag--success {
      color: var(--el-color-success);
      background: rgb(103 194 58 / 12%);
      border: 1px solid rgb(103 194 58 / 40%);
    }

    &.pace-tag--warning {
      color: var(--el-color-warning);
      background: rgb(230 162 60 / 12%);
      border: 1px solid rgb(230 162 60 / 40%);
    }

    &.pace-tag--danger {
      color: var(--el-color-danger);
      background: rgb(245 108 108 / 12%);
      border: 1px solid rgb(245 108 108 / 40%);
    }
  }
</style>
