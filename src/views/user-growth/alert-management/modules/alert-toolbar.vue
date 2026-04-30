<template>
  <div class="am-toolbar">
    <div class="am-toolbar__row">
      <span class="am-toolbar__label">严重性</span>
      <div class="am-toolbar__seg">
        <ElButton
          v-for="opt in severityOpts"
          :key="opt.value"
          round
          size="small"
          :type="localSeverity === opt.value ? 'primary' : 'default'"
          @click="localSeverity = opt.value"
        >
          {{ opt.label }}
        </ElButton>
      </div>
    </div>
    <div class="am-toolbar__row">
      <span class="am-toolbar__label">分类</span>
      <div class="am-toolbar__seg">
        <ElButton
          v-for="opt in categoryOpts"
          :key="opt.value"
          round
          size="small"
          :type="localCategory === opt.value ? 'primary' : 'default'"
          @click="localCategory = opt.value"
        >
          {{ opt.label }}
        </ElButton>
      </div>
    </div>
    <div class="am-toolbar__row am-toolbar__row--compact">
      <span class="am-toolbar__label">状态</span>
      <div class="am-toolbar__seg">
        <ElButton
          v-for="opt in statusOpts"
          :key="opt.value"
          round
          size="small"
          :type="localStatus === opt.value ? 'primary' : 'default'"
          @click="localStatus = opt.value"
        >
          {{ opt.label }}
        </ElButton>
      </div>
    </div>
    <div class="am-toolbar__row am-toolbar__row--date">
      <span class="am-toolbar__label">时间范围</span>
      <AppDatePicker
        v-model="localDate"
        type="date"
        :shortcuts="dateShortcuts"
        value-format="YYYY-MM-DD"
        placeholder="选择日期"
        size="default"
        class="am-toolbar__picker"
        :teleported="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { dateShortcuts } from '@/utils/form/date-shortcuts'
  import type { AlertFilterCategory, AlertFilterSeverity, AlertFilterStatus } from '../types'

  defineOptions({ name: 'AmAlertToolbar' })

  const props = defineProps<{
    severity: AlertFilterSeverity
    category: AlertFilterCategory
    status: AlertFilterStatus
    date: string | null
  }>()

  const emit = defineEmits<{
    'update:severity': [v: AlertFilterSeverity]
    'update:category': [v: AlertFilterCategory]
    'update:status': [v: AlertFilterStatus]
    'update:date': [v: string | null]
  }>()

  const severityOpts: { label: string; value: AlertFilterSeverity }[] = [
    { label: '全部', value: 'all' },
    { label: '高优先级', value: 'high' },
    { label: '中优先级', value: 'medium' },
    { label: '低优先级', value: 'low' }
  ]

  const categoryOpts: { label: string; value: AlertFilterCategory }[] = [
    { label: '全部', value: 'all' },
    { label: '成本异常', value: 'cost' },
    { label: '收入异常', value: 'revenue' },
    { label: 'ROI异常', value: 'roi' },
    { label: '流量异常', value: 'traffic' },
    { label: '留存异常', value: 'retention' },
    { label: '其他', value: 'other' }
  ]

  const statusOpts: { label: string; value: AlertFilterStatus }[] = [
    { label: '全部', value: 'all' },
    { label: '未处理', value: 'pending' },
    { label: '处理中', value: 'processing' },
    { label: '已关闭', value: 'closed' }
  ]

  const localSeverity = computed({
    get: () => props.severity,
    set: (v) => emit('update:severity', v)
  })
  const localCategory = computed({
    get: () => props.category,
    set: (v) => emit('update:category', v)
  })
  const localStatus = computed({
    get: () => props.status,
    set: (v) => emit('update:status', v)
  })
  const localDate = computed({
    get: () => props.date,
    set: (v) => emit('update:date', v)
  })
</script>

<style scoped lang="scss">
  .am-toolbar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 14px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .am-toolbar__row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;

    &--compact .am-toolbar__seg {
      flex: 1;
      min-width: 0;
    }

    &--date {
      flex-wrap: nowrap;
    }
  }

  .am-toolbar__label {
    flex-shrink: 0;
    width: 56px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .am-toolbar__seg {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .am-toolbar__picker {
    flex: 1;
    min-width: 200px;
    max-width: 280px;
  }
</style>
