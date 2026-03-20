<template>
  <div class="ap-placeholder">
    <div class="ap-placeholder-title">账户视图（占位）</div>
    <div class="ap-placeholder-desc">将展示“应用”维度的数据与表格。</div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AppPerformancePlaceholder' })
</script>

<style scoped lang="scss">
  .ap-placeholder {
    padding: 24px 0;
    text-align: center;
  }

  .ap-placeholder-title {
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ap-placeholder-desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
</style>
