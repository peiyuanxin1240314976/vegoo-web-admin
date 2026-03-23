<template>
  <ElCard class="adtg" shadow="never">
    <template #header>
      <span class="adtg__title">受众定位</span>
    </template>
    <div class="adtg__grid">
      <!-- 地理位置 -->
      <div class="adtg__cell">
        <el-icon class="adtg__icon"><LocationFilled /></el-icon>
        <div class="adtg__info">
          <span class="adtg__label">地理位置</span>
          <span class="adtg__value">
            <span
              v-if="targeting.geoCode"
              :class="['fi', `fi-${targeting.geoCode.toLowerCase()}`]"
              class="adtg__flag"
            ></span>
            {{ targeting.geoCode }} {{ targeting.geoName }}
          </span>
        </div>
      </div>

      <!-- 平台 -->
      <div class="adtg__cell">
        <el-icon class="adtg__icon"><Monitor /></el-icon>
        <div class="adtg__info">
          <span class="adtg__label">平台</span>
          <span class="adtg__value">{{ targeting.platform }}</span>
        </div>
      </div>

      <!-- 性别 -->
      <div class="adtg__cell">
        <el-icon class="adtg__icon"><UserFilled /></el-icon>
        <div class="adtg__info">
          <span class="adtg__label">性别</span>
          <span class="adtg__value">{{ targeting.gender }}</span>
        </div>
      </div>

      <!-- 年龄 -->
      <div class="adtg__cell">
        <el-icon class="adtg__icon"><Avatar /></el-icon>
        <div class="adtg__info">
          <span class="adtg__label">年龄</span>
          <span class="adtg__value">{{ targeting.ageRange }}</span>
        </div>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { LocationFilled, Monitor, UserFilled, Avatar } from '@element-plus/icons-vue'
  import 'flag-icons/css/flag-icons.min.css'
  import type { AdTargeting } from '../types'

  defineOptions({ name: 'AdDetailTargeting' })

  defineProps<{
    targeting: AdTargeting
  }>()
</script>

<style scoped lang="scss">
  .adtg {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 16px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 14px 16px;
    }
  }

  .adtg__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .adtg__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .adtg__cell {
    display: flex;
    gap: 18px;
    align-items: center;
    padding: 22px 20px;
    background: var(--default-bg-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .adtg__icon {
    flex-shrink: 0;
    font-size: 48px;
    color: var(--el-text-color-secondary);
  }

  .adtg__info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .adtg__label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .adtg__value {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .adtg__flag {
    flex-shrink: 0;
    width: 16px;
    height: 12px;
    border-radius: 2px;
  }
</style>
