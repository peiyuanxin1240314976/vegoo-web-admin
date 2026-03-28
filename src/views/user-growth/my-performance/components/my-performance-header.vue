<template>
  <div class="my-performance-header">
    <div class="my-performance-header__left">
      <div class="left-info">
        <div class="left-info__row">
          <span class="left-info__text">{{ leftPrimary }}</span>
          <span v-if="leftSecondary" class="left-info__sep">|</span>
          <span v-if="leftSecondary" class="left-info__text">{{ leftSecondary }}</span>
          <span v-if="leftTertiary" class="left-info__sep">|</span>
          <span v-if="leftTertiary" class="left-info__text">{{ leftTertiary }}</span>
          <span v-if="leftQuaternary" class="left-info__sep">|</span>
          <span v-if="leftQuaternary" class="left-info__text">{{ leftQuaternary }}</span>
        </div>
        <div v-if="leftHint" class="left-info__hint hint-bar">
          <span class="hint-bar__icon">
            <ElIcon><WarningFilled /></ElIcon>
          </span>
          <span class="hint-bar__text">{{ leftHint }}</span>
        </div>
      </div>
    </div>
    <div class="my-performance-header__right">
      <div class="field">
        <span class="label">{{ personLabel }}</span>
        <ElSelect
          v-model="personIdModel"
          class="person-select"
          :placeholder="personPlaceholder"
          popper-class="my-performance-person-popper"
        >
          <ElOption v-for="p in personOptions" :key="p.id" :label="p.name" :value="p.id" />
        </ElSelect>
      </div>

      <div class="field">
        <ElButton type="success" round class="export-btn">{{ exportLabel }}</ElButton>
      </div>

      <div class="period-switch">
        <button
          type="button"
          class="period-tab"
          :class="{ 'is-active': periodTypeModel === 'quarter' }"
          @click="periodTypeModel = 'quarter'"
        >
          {{ quarterLabel }}
          <span class="period-tab__value">{{ activeQuarterLabel }}</span>
        </button>
        <button
          type="button"
          class="period-tab"
          :class="{ 'is-active': periodTypeModel === 'month' }"
          @click="periodTypeModel = 'month'"
        >
          {{ monthLabel }}
          <span class="period-tab__value">{{ activeMonthLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { WarningFilled } from '@element-plus/icons-vue'
  import type {
    MyPerformancePeriodOption,
    MyPerformancePeriodType,
    MyPerformancePersonOption
  } from '../types'

  defineOptions({ name: 'MyPerformanceHeader' })

  const props = withDefaults(
    defineProps<{
      personOptions: MyPerformancePersonOption[]
      personId: string
      periodType: MyPerformancePeriodType
      periodValue: string
      periodOptions: { quarter: MyPerformancePeriodOption[]; month: MyPerformancePeriodOption[] }
      leftPrimary?: string
      leftSecondary?: string
      leftTertiary?: string
      leftQuaternary?: string
      leftHint?: string
      personLabel?: string
      personPlaceholder?: string
      exportLabel?: string
      quarterLabel?: string
      monthLabel?: string
    }>(),
    {
      leftPrimary: '',
      leftSecondary: '',
      leftTertiary: '',
      leftQuaternary: '',
      leftHint: '',
      personLabel: '人员',
      personPlaceholder: '请选择',
      exportLabel: '导出绩效报告',
      quarterLabel: '当前季度',
      monthLabel: '当前月份'
    }
  )

  const emit = defineEmits<{
    'update:personId': [value: string]
    'update:periodType': [value: MyPerformancePeriodType]
    'update:periodValue': [value: string]
    export: []
  }>()

  const personIdModel = computed({
    get: () => props.personId,
    set: (v) => emit('update:personId', v)
  })

  const periodTypeModel = computed({
    get: () => props.periodType,
    set: (v) => emit('update:periodType', v as MyPerformancePeriodType)
  })

  const leftPrimary = computed(() => props.leftPrimary)
  const leftSecondary = computed(() => props.leftSecondary)
  const leftTertiary = computed(() => props.leftTertiary)
  const leftQuaternary = computed(() => props.leftQuaternary)
  const leftHint = computed(() => props.leftHint)

  const activeQuarterLabel = computed(() => {
    const quarterOpts = props.periodOptions?.quarter ?? []
    const found = quarterOpts.find((o) => o.value === props.periodValue)
    return (props.periodType === 'quarter' ? found?.value : quarterOpts[0]?.value) ?? ''
  })

  const activeMonthLabel = computed(() => {
    const monthOpts = props.periodOptions?.month ?? []
    const found = monthOpts.find((o) => o.value === props.periodValue)
    return (props.periodType === 'month' ? found?.value : monthOpts[0]?.value) ?? ''
  })

  const personLabel = computed(() => props.personLabel)
  const personPlaceholder = computed(() => props.personPlaceholder)
  const exportLabel = computed(() => props.exportLabel)
  const quarterLabel = computed(() => props.quarterLabel)
  const monthLabel = computed(() => props.monthLabel)
</script>

<style scoped lang="scss">
  .my-performance-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0;
  }

  .left-info {
    display: grid;
    gap: 6px;
    align-content: center;
  }

  .left-info__row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .left-info__text {
    font-size: 12px;
    color: var(--art-gray-600);
    transition:
      color 0.25s var(--ease-out),
      text-shadow 0.25s var(--ease-out);
  }

  .left-info__row:hover .left-info__text {
    color: rgb(228 228 231 / 92%);
    text-shadow: 0 0 12px rgb(244 244 245 / 8%);
  }

  .left-info__sep {
    font-size: 12px;
    color: rgb(161 161 170 / 60%);
  }

  .left-info__hint {
    position: relative;
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 14px;
    overflow: hidden;
    font-size: 12px;
    color: rgb(249 115 22 / 96%);
    background-color: rgb(24 24 27 / 65%);
    background-image:
      radial-gradient(ellipse 90% 80% at 100% 0%, rgb(249 115 22 / 12%) 0%, transparent 55%),
      linear-gradient(165deg, rgb(39 39 42 / 40%) 0%, rgb(24 24 27 / 72%) 100%);
    backdrop-filter: blur(10px) saturate(1.05);
    border: 1px solid rgb(249 115 22 / 28%);
    border-radius: 12px;
    box-shadow:
      0 6px 24px rgb(0 0 0 / 20%),
      0 0 24px rgb(249 115 22 / 8%),
      inset 0 1px 0 rgb(244 244 245 / 5%);

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(244 244 245 / 2.5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(244 244 245 / 2.5%) 1px, transparent 1px);
      background-size: 16px 16px;
      opacity: 0.18;
      mask-image: linear-gradient(90deg, black 0%, transparent 85%);
    }
  }

  .hint-bar__icon {
    position: relative;
    z-index: 1;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    color: rgb(245 158 11 / 95%);
    filter: drop-shadow(0 0 4px rgb(245 158 11 / 40%));
  }

  .hint-bar__text {
    position: relative;
    z-index: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .my-performance-header__right {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .field {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .label {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .person-select {
    width: 140px;
  }

  :deep(.person-select .el-select__wrapper) {
    background: rgb(16 185 129 / 10%);
    border: 1px solid rgb(16 185 129 / 28%);
    box-shadow: none;
  }

  :deep(.person-select .el-select__wrapper.is-hovering) {
    border-color: rgb(16 185 129 / 45%);
  }

  :deep(.person-select .el-select__wrapper.is-focused) {
    border-color: rgb(16 185 129 / 60%);
    box-shadow: 0 0 0 2px rgb(16 185 129 / 12%);
  }

  :deep(.person-select .el-select__placeholder) {
    color: rgb(244 244 245 / 65%);
  }

  :deep(.person-select .el-select__selected-item) {
    color: rgb(244 244 245 / 92%);
  }

  :deep(.person-select .el-select__caret) {
    color: rgb(16 185 129 / 85%);
  }

  :deep(.my-performance-person-popper) {
    --el-color-primary: rgb(16 185 129);
    --el-fill-color-light: rgb(16 185 129 / 10%);
  }

  :deep(.my-performance-person-popper .el-select-dropdown__item.is-selected) {
    font-weight: 650;
    color: rgb(16 185 129 / 95%);
  }

  :deep(.my-performance-person-popper .el-select-dropdown__item:hover) {
    background: rgb(16 185 129 / 12%);
  }

  .export-btn {
    min-width: 120px;
  }

  .period-switch {
    position: relative;
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 3px;
    overflow: hidden;
    background: rgb(16 185 129 / 12%);
    backdrop-filter: blur(10px);
    border: 1px solid rgb(16 185 129 / 25%);
    border-radius: 9999px;
    box-shadow:
      0 4px 20px rgb(16 185 129 / 10%),
      inset 0 1px 0 rgb(244 244 245 / 4%);
    transition:
      transform 0.35s var(--ease-out),
      box-shadow 0.35s var(--ease-out),
      border-color 0.35s;

    &:hover {
      border-color: rgb(16 185 129 / 38%);
      box-shadow:
        0 8px 28px rgb(16 185 129 / 16%),
        0 0 36px rgb(16 185 129 / 8%),
        inset 0 1px 0 rgb(244 244 245 / 6%);
      transform: translateY(-2px);
    }

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgb(16 185 129 / 8%) 50%,
        transparent 100%
      );
      animation: switch-shimmer 4s ease-in-out infinite;
    }
  }

  @keyframes switch-shimmer {
    0%,
    100% {
      opacity: 0;
      transform: translateX(-100%);
    }

    50% {
      opacity: 1;
      transform: translateX(100%);
    }
  }

  .period-tab {
    position: relative;
    z-index: 1;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 7px 14px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9999px;
    transition:
      background-color 0.3s var(--ease-out),
      color 0.3s var(--ease-out),
      border-color 0.3s var(--ease-out),
      box-shadow 0.3s var(--ease-out),
      transform 0.2s var(--ease-out);

    &:active {
      transform: scale(0.97);
    }
  }

  .period-tab__value {
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    color: rgb(244 244 245 / 85%);
    opacity: 0.9;
  }

  .period-tab.is-active {
    color: rgb(244 244 245 / 98%);
    background: rgb(16 185 129 / 25%);
    border-color: rgb(16 185 129 / 55%);
    box-shadow:
      0 4px 16px rgb(16 185 129 / 15%),
      0 0 24px rgb(16 185 129 / 10%),
      inset 0 0 12px rgb(16 185 129 / 6%);
  }

  .period-tab.is-active .period-tab__value {
    color: rgb(16 185 129 / 98%);
    text-shadow: 0 0 12px rgb(16 185 129 / 30%);
  }

  .period-tab:hover:not(.is-active) {
    color: rgb(244 244 245 / 90%);
    background: rgb(16 185 129 / 12%);
    border-color: rgb(16 185 129 / 22%);
    box-shadow: 0 4px 14px rgb(16 185 129 / 10%);
    transform: translateY(-2px);
  }

  :deep(.export-btn.el-button--success) {
    --el-button-bg-color: rgb(16 185 129 / 20%);
    --el-button-border-color: rgb(16 185 129 / 55%);
    --el-button-text-color: rgb(244 244 245 / 95%);
    --el-button-hover-bg-color: rgb(16 185 129 / 30%);
    --el-button-hover-border-color: rgb(16 185 129 / 70%);
    --el-button-active-bg-color: rgb(16 185 129 / 35%);
    --el-button-active-border-color: rgb(16 185 129 / 75%);

    backdrop-filter: blur(8px);
    box-shadow:
      0 4px 18px rgb(16 185 129 / 12%),
      0 0 24px rgb(16 185 129 / 6%);
    transition:
      background-color 0.3s var(--ease-out),
      box-shadow 0.3s var(--ease-out),
      transform 0.2s var(--ease-out);

    &:hover {
      box-shadow:
        0 8px 28px rgb(16 185 129 / 20%),
        0 0 36px rgb(16 185 129 / 10%);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .left-info__text {
      transition: none;
    }

    .left-info__row:hover .left-info__text {
      text-shadow: none;
    }

    .period-switch {
      transition: none;
    }

    .period-switch:hover {
      transform: none;
    }

    .period-switch::before {
      animation: none;
    }

    .period-tab:hover:not(.is-active) {
      transform: none;
    }

    :deep(.export-btn.el-button--success):hover {
      transform: none;
    }
  }
</style>
