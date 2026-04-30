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
        <!-- <ElButton type="primary" plain round class="export-btn">{{ exportLabel }}</ElButton> -->
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
  import { cloneAppDate, getAppNow } from '@/utils/app-now'
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
      // exportLabel?: string
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
      // exportLabel: '导出绩效报告',
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

  const MY_PERFORMANCE_NOW_OFFSET_DAYS = -2

  function getMyPerformanceNow() {
    const now = cloneAppDate(getAppNow())
    now.setDate(now.getDate() + MY_PERFORMANCE_NOW_OFFSET_DAYS)
    return now
  }

  function pickAppNowQuarterLabel(options: MyPerformancePeriodOption[]): string {
    const now = getMyPerformanceNow()
    const targetYear = now.getFullYear()
    const targetQuarter = Math.floor(now.getMonth() / 3) + 1
    const parseQuarter = (value: string) => {
      const m = String(value).match(/(\d{4})\s*-?\s*[Qq]([1-4])/)
      if (!m) return null
      return { year: Number(m[1]), quarter: Number(m[2]) }
    }

    const exact = options.find((o) => {
      const parsed = parseQuarter(o.value)
      return parsed?.year === targetYear && parsed.quarter === targetQuarter
    })
    if (exact) return exact.value

    const sameQuarter = options.find((o) => {
      const parsed = parseQuarter(o.value)
      return parsed?.quarter === targetQuarter
    })
    if (sameQuarter) return sameQuarter.value

    return options[0]?.value ?? ''
  }

  const activeQuarterLabel = computed(() => {
    const quarterOpts = props.periodOptions?.quarter ?? []
    const found = quarterOpts.find((o) => o.value === props.periodValue)
    if (props.periodType === 'quarter') return found?.value ?? ''
    return pickAppNowQuarterLabel(quarterOpts)
  })

  const activeMonthLabel = computed(() => {
    const monthOpts = props.periodOptions?.month ?? []
    const found = monthOpts.find((o) => o.value === props.periodValue)
    if (props.periodType === 'month') return found?.value ?? ''

    const now = getMyPerformanceNow()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const appNowMonth = `${y}-${m}`
    return monthOpts.find((o) => o.value === appNowMonth)?.value ?? monthOpts[0]?.value ?? ''
  })

  const personLabel = computed(() => props.personLabel)
  const personPlaceholder = computed(() => props.personPlaceholder)
  // const exportLabel = computed(() => props.exportLabel)
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
    min-height: 36px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
  }

  :deep(.person-select .el-select__wrapper.is-hovering) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  :deep(.person-select .el-select__wrapper.is-focused) {
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent);
  }

  :deep(.person-select .el-select__placeholder) {
    color: rgb(244 244 245 / 65%);
  }

  :deep(.person-select .el-select__selected-item) {
    color: rgb(244 244 245 / 92%);
  }

  :deep(.person-select .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.my-performance-person-popper) {
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-fill-color-light: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 10%,
      transparent
    );
  }

  :deep(.my-performance-person-popper .el-select-dropdown__item.is-selected) {
    font-weight: 650;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.my-performance-person-popper .el-select-dropdown__item:hover) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 12%,
      transparent
    );
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
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 8%, transparent);
    backdrop-filter: blur(10px);
    border: 1px solid
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 55%, transparent);
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow:
      0 4px 20px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent),
      inset 0 1px 0 rgb(244 244 245 / 4%);
    transition:
      box-shadow 0.35s var(--ease-out),
      border-color 0.35s;

    &:hover {
      border-color: var(--theme-color, var(--art-primary, #3b82f6));
      box-shadow:
        0 8px 28px
          color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 16%, transparent),
        0 0 36px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 8%, transparent),
        inset 0 1px 0 rgb(244 244 245 / 6%);
    }

    &::before {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 8%, transparent) 50%,
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
    border-radius: var(--el-border-radius-base, 4px);
    transition:
      background-color 0.3s var(--ease-out),
      color 0.3s var(--ease-out),
      border-color 0.3s var(--ease-out),
      box-shadow 0.3s var(--ease-out);
  }

  .period-tab__value {
    font-weight: 650;
    font-variant-numeric: tabular-nums;
    color: rgb(244 244 245 / 85%);
    opacity: 0.9;
  }

  .period-tab.is-active {
    color: rgb(244 244 245 / 98%);
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 12%,
      transparent
    );
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow:
      0 4px 16px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 15%, transparent),
      0 0 24px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent),
      inset 0 0 12px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
  }

  .period-tab.is-active .period-tab__value {
    color: var(--theme-color, var(--art-primary, #3b82f6));
    text-shadow: 0 0 12px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 30%, transparent);
  }

  .period-tab:hover:not(.is-active) {
    color: rgb(244 244 245 / 90%);
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 8%, transparent);
    border-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 45%,
      transparent
    );
    box-shadow: 0 4px 14px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent);
  }

  :deep(.export-btn.el-button--success) {
    --el-button-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    );
    --el-button-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-text-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-hover-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 8%,
      transparent
    );
    --el-button-hover-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-button-active-bg-color: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 10%,
      transparent
    );
    --el-button-active-border-color: var(--theme-color, var(--art-primary, #3b82f6));

    backdrop-filter: blur(8px);
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow:
      0 4px 18px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 12%, transparent),
      0 0 24px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    transition:
      background-color 0.3s var(--ease-out),
      box-shadow 0.3s var(--ease-out);

    &:hover {
      box-shadow:
        0 8px 28px
          color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent),
        0 0 36px
          color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 10%, transparent);
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
