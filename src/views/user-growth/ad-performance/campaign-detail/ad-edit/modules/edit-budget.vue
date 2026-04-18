<template>
  <ElCard class="ebu" shadow="never">
    <template #header>
      <span class="ebu__title">预算设置</span>
    </template>
    <div class="ebu__form">
      <!-- 日预算 / 总预算 -->
      <div class="ebu__row">
        <div class="ebu__half">
          <label class="ebu__label">日预算</label>
          <div class="ebu__budget-val">${{ budget.dailyBudget.toLocaleString() }}</div>
          <ElSlider v-model="budget.dailyBudget" :min="100" :max="5000" :step="100" />
        </div>
        <div class="ebu__half">
          <label class="ebu__label">总预算</label>
          <ElInput v-model="budget.totalBudget" class="ebu__input">
            <template #prefix>¥</template>
          </ElInput>
        </div>
      </div>

      <!-- 投放时间 -->
      <div class="ebu__field">
        <ElRadioGroup v-model="budget.scheduleType" class="ebu__radio-group">
          <ElRadio value="always">持续投放</ElRadio>
          <ElRadio value="custom">自定义时间</ElRadio>
        </ElRadioGroup>
      </div>

      <div class="ebu__row">
        <div class="ebu__half">
          <label class="ebu__label">开始时间</label>
          <AppDatePicker
            v-model="budget.startDate"
            type="date"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </div>
        <div class="ebu__half">
          <label class="ebu__label">结束时间</label>
          <AppDatePicker
            v-model="budget.endDate"
            type="date"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </div>
      </div>

      <!-- 出价策略 -->
      <div class="ebu__field">
        <label class="ebu__label">出价策略</label>
        <ElSelect v-model="budget.bidStrategy" style="width: 100%">
          <ElOption label="目标CPI" value="target_cpi" />
          <ElOption label="Maximize Conversions" value="max_conv" />
          <ElOption label="Target ROAS" value="target_roas" />
        </ElSelect>
      </div>

      <div class="ebu__field">
        <ElInput v-model="budget.bidValue" class="ebu__input">
          <template #prefix>$</template>
        </ElInput>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import type { AdEditBudget } from '../types'

  defineOptions({ name: 'EditBudget' })

  const budget = defineModel<AdEditBudget>({ required: true })
</script>

<style scoped lang="scss">
  .ebu {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .ebu__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ebu__form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ebu__row {
    display: flex;
    gap: 16px;
  }

  .ebu__half {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .ebu__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ebu__label {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .ebu__budget-val {
    font-size: 18px;
    font-weight: 700;
    color: var(--el-text-color-primary);
  }

  .ebu__radio-group {
    display: flex;
    gap: 20px;
  }

  .ebu__input {
    :deep(.el-input__wrapper) {
      background: var(--default-bg-color);
    }
  }

  :deep(.el-slider__runway) {
    background: var(--default-border);
  }

  :deep(.el-date-editor .el-input__wrapper) {
    background: var(--default-bg-color);
  }

  :deep(.el-select .el-input__wrapper) {
    background: var(--default-bg-color);
  }
</style>
