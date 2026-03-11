<template>
  <div class="map-detail-header">
    <div class="header-left">
      <ElButton text type="primary" class="back-btn" @click="goBack">
        <template #icon><ArrowLeft /></template>
        返回
      </ElButton>
      <h1 class="detail-title"> {{ countryName }} ({{ countryCode }}) - 地区详情 </h1>
    </div>
    <div v-if="$slots.right" class="header-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import { ArrowLeft } from '@element-plus/icons-vue'

  defineOptions({ name: 'MapDetailHeader' })

  defineProps<{
    countryCode: string
    countryName: string
  }>()

  const router = useRouter()

  function goBack() {
    router.push({ path: '/cockpit' })
  }
</script>

<style scoped lang="scss">
  .map-detail-header {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;

    .header-left {
      .back-btn {
        margin-bottom: 8px;
      }

      .detail-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .header-right {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
  }
</style>
