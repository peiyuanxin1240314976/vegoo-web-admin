<template>
  <div class="cockpit-date-range">
    <div class="date-range-box">
      <div
        class="date-range-slider"
        :style="{ transform: `translateX(${Math.max(0, rangeIndex) * 100}%)` }"
      />
      <button
        v-for="opt in rangeOptions"
        :key="opt.value"
        type="button"
        class="date-range-btn"
        :class="{ active: modelValue === opt.value }"
        @click="selectRange(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { CockpitDateRange } from '../types'

  defineOptions({ name: 'CockpitDateRangeTabs' })

  const props = withDefaults(defineProps<{ modelValue?: CockpitDateRange }>(), {
    modelValue: 'today'
  })
  const emit = defineEmits<{ (e: 'update:modelValue', value: CockpitDateRange): void }>()

  const rangeOptions: { value: CockpitDateRange; label: string }[] = [
    { value: 'today', label: '今日' },
    { value: 'yesterday', label: '昨日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' }
  ]

  const rangeIndex = computed(() => rangeOptions.findIndex((o) => o.value === props.modelValue))

  function selectRange(value: CockpitDateRange) {
    emit('update:modelValue', value)
  }
</script>

<style scoped lang="scss">
  .cockpit-date-range {
    .date-range-box {
      position: relative;
      display: inline-flex;
      padding: 3px;
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color-lighter);
      border-radius: 8px;
    }

    .date-range-slider {
      position: absolute;
      top: 3px;
      left: 3px;
      width: calc((100% - 6px) / 4);
      height: calc(100% - 6px);
      pointer-events: none;
      background: var(--el-color-primary);
      border-radius: 6px;
      transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .date-range-btn {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 60px;
      padding: 6px 12px;
      font-size: 13px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      background: transparent;
      border: none;
      border-radius: 6px;
      transition: color 0.2s ease;

      &:hover {
        color: var(--el-text-color-primary);
      }

      &.active {
        color: #fff;
      }
    }
  }
</style>
