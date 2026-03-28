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
  @import '../../../styles/ap-card-fx';

  .adtg {
    @include ap-neon-bg;
    @include ap-panel-hover;

    position: relative;
    overflow: hidden;
    border-radius: 14px;

    &::before {
      position: absolute;
      top: 0;
      left: 5%;
      z-index: 0;
      width: 90%;
      height: 1.5px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent,
        rgb(16 185 129 / 72%),
        rgb(34 211 238 / 78%),
        rgb(59 130 246 / 65%),
        transparent
      );
      filter: blur(0.4px);
    }

    :deep(.el-card__header) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 12px;
      background: transparent;
      border-bottom: 1px solid rgb(16 185 129 / 16%);
    }

    :deep(.el-card__body) {
      position: relative;
      z-index: 1;
      padding: 14px 18px 16px;
      background: transparent;
    }
  }

  .adtg__title {
    @include ap-title-gradient;

    font-size: 13px;
  }

  .adtg__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .adtg__cell {
    display: flex;
    gap: 18px;
    align-items: center;
    padding: 20px 18px;
    background: rgb(16 185 129 / 6%);
    border: 1px solid rgb(16 185 129 / 20%);
    border-radius: 10px;
    transition:
      background 0.22s ease,
      border-color 0.22s ease,
      box-shadow 0.22s ease;

    &:hover {
      background: rgb(16 185 129 / 10%);
      border-color: rgb(52 211 153 / 40%);
      box-shadow: 0 0 16px rgb(16 185 129 / 14%);
    }
  }

  .adtg__icon {
    flex-shrink: 0;
    font-size: 40px;
    color: #22d3ee;
    filter: drop-shadow(0 0 8px rgb(34 211 238 / 45%));
  }

  .adtg__info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .adtg__label {
    font-size: 13px;
    color: #64748b;
  }

  .adtg__value {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    font-size: 17px;
    font-weight: 700;
    color: #e2e8f0;
    text-shadow: 0 0 8px rgb(34 211 238 / 20%);
  }

  .adtg__flag {
    flex-shrink: 0;
    width: 18px;
    height: 13px;
    border-radius: 2px;
  }
</style>
