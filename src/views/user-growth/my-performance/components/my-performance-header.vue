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
    margin-bottom: 12px;
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
  }

  .left-info__sep {
    font-size: 12px;
    color: rgb(161 161 170 / 60%);
  }

  .left-info__hint {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px 10px;
    font-size: 12px;
    color: rgb(249 115 22 / 95%);
    background: rgb(39 39 42 / 25%);
    border: 1px solid rgb(39 39 42 / 45%);
    border-radius: 10px;
  }

  .hint-bar__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: rgb(245 158 11 / 95%);
  }

  .hint-bar__text {
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
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 3px;
    background: rgb(16 185 129 / 12%);
    border: 1px solid rgb(16 185 129 / 28%);
    border-radius: 9999px;
    box-shadow: 0 6px 18px rgb(16 185 129 / 10%);
  }

  .period-tab {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 7px 12px;
    font-size: 13px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9999px;
    transition:
      background-color 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .period-tab__value {
    font-weight: 650;
    color: rgb(244 244 245 / 85%);
    opacity: 0.9;
  }

  .period-tab.is-active {
    color: rgb(244 244 245 / 98%);
    background: rgb(16 185 129 / 26%);
    border-color: rgb(16 185 129 / 55%);
    box-shadow: 0 10px 18px rgb(16 185 129 / 12%);
  }

  .period-tab.is-active .period-tab__value {
    color: rgb(244 244 245 / 98%);
  }

  .period-tab:hover {
    color: rgb(244 244 245 / 90%);
    background: rgb(16 185 129 / 12%);
  }

  :deep(.export-btn.el-button--success) {
    --el-button-bg-color: rgb(16 185 129 / 20%);
    --el-button-border-color: rgb(16 185 129 / 55%);
    --el-button-text-color: rgb(244 244 245 / 95%);
    --el-button-hover-bg-color: rgb(16 185 129 / 26%);
    --el-button-hover-border-color: rgb(16 185 129 / 65%);
    --el-button-active-bg-color: rgb(16 185 129 / 30%);
    --el-button-active-border-color: rgb(16 185 129 / 70%);

    box-shadow: 0 10px 18px rgb(16 185 129 / 10%);
  }
</style>
