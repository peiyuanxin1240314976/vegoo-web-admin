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
    { value: 'yesterday', label: '昨日' }
  ]

  const rangeIndex = computed(() => rangeOptions.findIndex((o) => o.value === props.modelValue))

  function selectRange(value: CockpitDateRange) {
    emit('update:modelValue', value)
  }
</script>

<style scoped lang="scss">
  .cockpit-date-range {
    --toolbar-theme: var(--theme-color, var(--art-primary, var(--el-color-primary, #3b82f6)));
    --toolbar-theme-soft: color-mix(in srgb, var(--toolbar-theme) 72%, #8b5cf6);
    --toolbar-theme-cyan: color-mix(in srgb, var(--toolbar-theme) 82%, #38bdf8);
    --toolbar-surface: linear-gradient(180deg, rgb(9 16 34 / 92%), rgb(7 12 26 / 88%));
    --toolbar-border: color-mix(in srgb, var(--toolbar-theme) 24%, transparent);
    --toolbar-border-strong: color-mix(in srgb, var(--toolbar-theme) 38%, transparent);
    --toolbar-shadow: 0 12px 28px rgb(2 6 23 / 26%), inset 0 1px 0 rgb(255 255 255 / 6%);
    --toolbar-active: linear-gradient(
      135deg,
      color-mix(in srgb, var(--toolbar-theme) 78%, white 22%) 0%,
      var(--toolbar-theme-soft) 54%,
      var(--toolbar-theme-cyan) 100%
    );

    .date-range-box {
      position: relative;
      display: inline-flex;
      padding: 4px;
      background: var(--toolbar-surface);
      backdrop-filter: blur(16px);
      border: 1px solid var(--toolbar-border);
      border-radius: 14px;
      box-shadow:
        var(--toolbar-shadow),
        0 0 0 1px rgb(24 36 72 / 72%),
        0 0 18px color-mix(in srgb, var(--toolbar-theme) 10%, transparent);
    }

    .date-range-slider {
      position: absolute;
      top: 4px;
      left: 4px;
      width: calc((100% - 8px) / 2);
      height: calc(100% - 8px);
      pointer-events: none;
      background: var(--toolbar-active);
      border: 1px solid color-mix(in srgb, var(--toolbar-theme) 34%, white 16%);
      border-radius: 11px;
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 24%),
        0 10px 22px color-mix(in srgb, var(--toolbar-theme) 24%, transparent),
        0 0 22px color-mix(in srgb, var(--toolbar-theme) 20%, transparent);
      transition:
        transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.2s ease;
    }

    .date-range-btn {
      position: relative;
      z-index: 1;
      flex: 1;
      min-width: 66px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.1;
      color: rgb(203 213 225 / 84%);
      letter-spacing: 0.02em;
      cursor: pointer;
      background: transparent;
      border: none;
      border-radius: 11px;
      transition:
        color 0.2s ease,
        transform 0.16s ease,
        text-shadow 0.2s ease;

      &:hover {
        color: rgb(244 247 255 / 96%);
        text-shadow: 0 0 12px color-mix(in srgb, var(--toolbar-theme) 18%, transparent);
      }

      &.active {
        color: #fff;
        text-shadow: 0 0 18px color-mix(in srgb, var(--toolbar-theme) 22%, white 6%);
      }

      &:active {
        transform: translateY(1px);
      }
    }
  }
</style>
