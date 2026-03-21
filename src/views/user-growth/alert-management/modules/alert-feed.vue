<template>
  <div class="am-feed">
    <div class="am-feed__grid">
      <div
        v-for="item in alerts"
        :key="item.id"
        class="am-feed__card"
        :class="severityBorderClass(item.severity)"
      >
        <div class="am-feed__head">
          <div class="am-feed__tags">
            <ElTag size="small" :type="severityTagType(item.severity)" round>
              {{ severityLabel(item.severity) }}
            </ElTag>
            <ElTag size="small" type="info" round>{{ statusLabel(item.status) }}</ElTag>
          </div>
        </div>
        <h3 class="am-feed__title">{{ item.title }}</h3>
        <p class="am-feed__summary">{{ item.summary }}</p>
        <div class="am-feed__metrics">
          <div
            v-for="(m, i) in item.metrics"
            :key="i"
            class="am-feed__metric"
            :class="toneClass(m.tone)"
          >
            <span class="am-feed__metric-k">{{ m.label }}</span>
            <span class="am-feed__metric-v">{{ m.value }}</span>
          </div>
        </div>
        <div class="am-feed__foot">
          <span class="am-feed__time">{{ item.timeLabel }}</span>
          <div class="am-feed__actions">
            <ElButton
              v-if="item.actions.includes('detail')"
              size="small"
              round
              @click="emit('action', { id: item.id, action: 'detail' })"
            >
              查看详情
            </ElButton>
            <ElButton
              v-if="item.actions.includes('markDone')"
              size="small"
              round
              type="primary"
              plain
              @click="emit('action', { id: item.id, action: 'markDone' })"
            >
              标记已处理
            </ElButton>
            <ElButton
              v-if="item.actions.includes('reopen')"
              size="small"
              round
              plain
              @click="emit('action', { id: item.id, action: 'reopen' })"
            >
              重新打开
            </ElButton>
            <ElButton
              v-if="item.actions.includes('ignore')"
              size="small"
              round
              @click="emit('action', { id: item.id, action: 'ignore' })"
            >
              忽略
            </ElButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AlertFeedItem, AlertHandleStatus, AlertSeverity } from '../types'

  defineOptions({ name: 'AmAlertFeed' })

  defineProps<{
    alerts: AlertFeedItem[]
  }>()

  const emit = defineEmits<{
    action: [payload: { id: string; action: string }]
  }>()

  function severityLabel(s: AlertSeverity) {
    return { high: '高优先级', medium: '中优先级', low: '低优先级' }[s]
  }

  function severityTagType(s: AlertSeverity): 'danger' | 'warning' | 'primary' {
    if (s === 'high') return 'danger'
    if (s === 'medium') return 'warning'
    return 'primary'
  }

  function severityBorderClass(s: AlertSeverity) {
    if (s === 'high') return 'is-sev-high'
    if (s === 'medium') return 'is-sev-medium'
    return 'is-sev-low'
  }

  function statusLabel(st: AlertHandleStatus) {
    return { pending: '未处理', processing: '处理中', closed: '已关闭' }[st]
  }

  function toneClass(tone?: string) {
    if (tone === 'danger') return 'is-danger'
    if (tone === 'warning') return 'is-warning'
    if (tone === 'success') return 'is-success'
    if (tone === 'primary') return 'is-primary'
    return ''
  }
</script>

<style scoped lang="scss">
  .am-feed__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;

    @media (width <= 900px) {
      grid-template-columns: 1fr;
    }
  }

  .am-feed__card {
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-left-width: 4px;
    border-radius: 12px;

    &.is-sev-high {
      border-left-color: var(--art-danger);
    }

    &.is-sev-medium {
      border-left-color: var(--art-warning);
    }

    &.is-sev-low {
      border-left-color: var(--art-primary);
    }
  }

  .am-feed__head {
    margin-bottom: 8px;
  }

  .am-feed__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .am-feed__title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.35;
    color: var(--art-gray-900);
  }

  .am-feed__summary {
    margin: 0 0 10px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--art-gray-600);
  }

  .am-feed__metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 16px;
    margin-bottom: 12px;
  }

  .am-feed__metric {
    font-size: 12px;

    &.is-danger .am-feed__metric-v {
      color: var(--art-danger);
    }

    &.is-warning .am-feed__metric-v {
      color: var(--art-warning);
    }

    &.is-success .am-feed__metric-v {
      color: var(--art-success);
    }

    &.is-primary .am-feed__metric-v {
      color: var(--art-primary);
    }
  }

  .am-feed__metric-k {
    margin-right: 4px;
    color: var(--art-gray-500);
  }

  .am-feed__foot {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .am-feed__time {
    font-size: 12px;
    color: var(--art-gray-500);
  }

  .am-feed__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
</style>
