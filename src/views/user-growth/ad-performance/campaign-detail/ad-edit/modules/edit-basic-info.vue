<template>
  <ElCard class="ebi" shadow="never">
    <template #header>
      <span class="ebi__title">基本信息</span>
    </template>
    <div class="ebi__form">
      <div class="ebi__field">
        <label class="ebi__label">Campaign 名称</label>
        <ElInput v-model="basic.name" class="ebi__input" />
      </div>
      <div class="ebi__field">
        <label class="ebi__label">应用</label>
        <ElSelect v-model="basic.app" style="width: 100%">
          <ElOption label="Weather 5" value="Weather5" />
          <ElOption label="BloodSugar2" value="BloodSugar2" />
          <ElOption label="PhoneTracker" value="PhoneTracker" />
        </ElSelect>
      </div>
      <div class="ebi__field">
        <label class="ebi__label">投放地区</label>
        <ElSelect v-model="basic.region" style="width: 100%">
          <ElOption label="US 美国" value="US" />
          <ElOption label="UK 英国" value="UK" />
          <ElOption label="CA 加拿大" value="CA" />
          <ElOption label="JP 日本" value="JP" />
        </ElSelect>
      </div>
      <div class="ebi__field">
        <label class="ebi__label">投放渠道</label>
        <ElSelect v-model="basic.channel" style="width: 100%">
          <ElOption label="Google Ads" value="google" />
          <ElOption label="Facebook" value="facebook" />
          <ElOption label="TikTok" value="tiktok" />
          <ElOption label="Mintegral" value="mintegral" />
        </ElSelect>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { AdEditBasicInfo } from '../types'

  defineOptions({ name: 'EditBasicInfo' })

  const basic = defineModel<AdEditBasicInfo>({ required: true })
</script>

<style scoped lang="scss">
  .ebi {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .ebi__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ebi__form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .ebi__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ebi__label {
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .ebi__input {
    :deep(.el-input__wrapper) {
      background: var(--default-bg-color);
    }
  }

  :deep(.el-select .el-input__wrapper) {
    background: var(--default-bg-color);
  }
</style>
