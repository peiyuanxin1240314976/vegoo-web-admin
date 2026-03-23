<template>
  <ElCard class="etg" shadow="never">
    <template #header>
      <span class="etg__title">定向设置</span>
    </template>
    <div class="etg__form">
      <!-- 设备类型 -->
      <div class="etg__field">
        <label class="etg__label">设备类型</label>
        <div class="etg__checkboxes">
          <ElCheckbox v-model="targeting.devicePhone" label="手机" />
          <ElCheckbox v-model="targeting.deviceTablet" label="平板" />
        </div>
      </div>

      <!-- OS 版本 -->
      <div class="etg__field">
        <label class="etg__label">OS 版本</label>
        <div class="etg__slider-row">
          <span class="etg__slider-val">iOS {{ targeting.iosMin }}+</span>
          <ElSlider v-model="targeting.iosMin" :min="10" :max="17" :step="1" class="etg__slider" />
        </div>
        <div class="etg__slider-row">
          <span class="etg__slider-val">Android {{ targeting.androidMin }}+</span>
          <ElSlider
            v-model="targeting.androidMin"
            :min="7"
            :max="14"
            :step="1"
            class="etg__slider"
          />
        </div>
      </div>

      <!-- 年龄范围 -->
      <div class="etg__field">
        <label class="etg__label">年龄范围</label>
        <div class="etg__slider-row">
          <span class="etg__slider-val"
            >{{ targeting.ageRange[0] }}–{{ targeting.ageRange[1] }}</span
          >
          <ElSlider
            v-model="targeting.ageRange"
            range
            :min="13"
            :max="65"
            :step="1"
            class="etg__slider"
          />
        </div>
      </div>

      <!-- 性别 -->
      <div class="etg__field">
        <label class="etg__label">性别</label>
        <ElRadioGroup v-model="targeting.gender" class="etg__radio-group">
          <ElRadio value="all">不限</ElRadio>
          <ElRadio value="male">男</ElRadio>
          <ElRadio value="female">女</ElRadio>
        </ElRadioGroup>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { AdEditTargeting } from '../types'

  defineOptions({ name: 'EditTargeting' })

  const targeting = defineModel<AdEditTargeting>({ required: true })
</script>

<style scoped lang="scss">
  .etg {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .etg__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .etg__form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .etg__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .etg__label {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .etg__checkboxes {
    display: flex;
    gap: 16px;
  }

  .etg__slider-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .etg__slider-val {
    flex-shrink: 0;
    min-width: 80px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .etg__slider {
    flex: 1;
  }

  .etg__radio-group {
    display: flex;
    gap: 20px;
  }

  :deep(.el-slider__runway) {
    background: var(--default-border);
  }
</style>
