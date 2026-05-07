<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ name: 'ProfitTip' })

  const props = withDefaults(
    defineProps<{
      /** 数值本体（用于判断上下箭头与正负色）；若传入 null 则不显示箭头 */
      value: number | null | undefined
      /** 正数颜色主题：profit=绿色；min=紫色（负数始终红色） */
      tone?: 'profit' | 'min'
      /** 是否展示 0 的箭头（默认不展示） */
      showZeroArrow?: boolean
    }>(),
    { tone: 'profit', showZeroArrow: false }
  )

  const dir = computed<'up' | 'down' | 'flat'>(() => {
    if (props.value == null) return 'flat'
    if (props.value > 0) return 'up'
    if (props.value < 0) return 'down'
    return props.showZeroArrow ? 'up' : 'flat'
  })

  const valueClass = computed(() => {
    if (props.value == null) return 'pt__value--muted'
    if (props.value < 0) return 'pt__value--neg'
    return props.tone === 'min' ? 'pt__value--min' : 'pt__value--pos'
  })

  const tipClass = computed(() => {
    if (props.value == null) return 'pt__tip--muted'
    if (props.value < 0) return 'pt__tip--neg'
    return props.tone === 'min' ? 'pt__tip--min' : 'pt__tip--pos'
  })

  defineExpose({ valueClass })
</script>

<template>
  <span class="pt">
    <span v-if="dir !== 'flat'" class="pt__tip" :class="[tipClass, `is-${dir}`]" aria-hidden="true">
      <span class="pt__arrow"></span>
    </span>
    <span class="pt__value" :class="valueClass">
      <slot />
    </span>
  </span>
</template>

<style scoped lang="scss">
  .pt {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    justify-content: flex-end;
    white-space: nowrap;
  }

  .pt__tip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    padding: 0 6px;
    border-radius: 9999px;
    box-shadow: 0 0 0 1px color-mix(in srgb, currentcolor 8%, transparent) inset;
  }

  .pt__arrow {
    width: 0;
    height: 0;
    opacity: 0.95;
  }

  .pt__tip.is-up .pt__arrow {
    border-right: 5px solid transparent;
    border-bottom: 7px solid currentcolor;
    border-left: 5px solid transparent;
  }

  .pt__tip.is-down .pt__arrow {
    border-top: 7px solid currentcolor;
    border-right: 5px solid transparent;
    border-left: 5px solid transparent;
  }

  .pt__tip--pos {
    color: var(--art-success);
    background: color-mix(in srgb, var(--art-success) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-success) 28%, transparent);
  }

  .pt__tip--min {
    color: #a78bfa;
    background: color-mix(in srgb, #a78bfa 10%, transparent);
    border: 1px solid color-mix(in srgb, #a78bfa 28%, transparent);
  }

  .pt__tip--neg {
    color: var(--art-danger);
    background: color-mix(in srgb, var(--art-danger) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-danger) 28%, transparent);
  }

  .pt__tip--muted {
    color: var(--el-text-color-secondary);
    background: color-mix(in srgb, var(--el-text-color-secondary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-text-color-secondary) 20%, transparent);
  }

  .pt__value {
    font-weight: 700;
  }

  .pt__value--pos {
    color: var(--art-success);
  }

  .pt__value--min {
    color: #a78bfa;
  }

  .pt__value--neg {
    color: var(--art-danger);
  }

  .pt__value--muted {
    font-weight: 600;
    color: var(--el-text-color-secondary);
  }
</style>
