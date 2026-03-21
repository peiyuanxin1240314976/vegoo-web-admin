<script setup lang="ts">
  import { ArrowRight } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'

  defineOptions({ name: 'AdPlatformDetail' })

  const { t } = useI18n()
  const router = useRouter()

  function goAppAdPlatformPerformance() {
    router.push({ name: 'AppAdPlatformPerformance' })
  }
</script>

<template>
  <div class="ad-platform-detail-page art-full-height">
    <div class="apd-header">
      <div class="apd-breadcrumb">
        <span class="apd-breadcrumb__parent">{{ t('menus.businessInsight.title') }}</span>
        <ElIcon class="apd-breadcrumb__sep"><ArrowRight /></ElIcon>
        <span class="apd-breadcrumb__current">{{
          t('menus.businessInsight.adPlatformDetail')
        }}</span>
      </div>
    </div>
    <ElCard class="apd-card" shadow="never">
      <div class="apd-placeholder">
        <p class="apd-placeholder__text">{{ t('menus.businessInsight.adPlatformDetailEmpty') }}</p>
        <ElButton type="primary" round @click="goAppAdPlatformPerformance">
          {{ t('menus.businessInsight.appAdPlatformPerformance') }}
        </ElButton>
      </div>
    </ElCard>
  </div>
</template>

<style scoped lang="scss">
  .ad-platform-detail-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 0;
  }

  .apd-header {
    flex-shrink: 0;
  }

  .apd-breadcrumb {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    color: var(--art-gray-600);
  }

  .apd-breadcrumb__parent {
    color: var(--art-gray-600);
  }

  .apd-breadcrumb__sep {
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .apd-breadcrumb__current {
    font-weight: 500;
    color: var(--art-gray-900);
  }

  .apd-card {
    flex: 1;
    min-height: 320px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 280px;
    }
  }

  .apd-placeholder {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }

  .apd-placeholder__text {
    margin: 0;
    font-size: 14px;
    color: var(--art-gray-600);
  }
</style>
