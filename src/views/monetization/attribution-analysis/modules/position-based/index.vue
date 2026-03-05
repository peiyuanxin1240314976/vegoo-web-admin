<template>
  <div class="attribution-placeholder art-card">
    <p class="placeholder-text">位置基础（占位，后续实现）</p>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AttributionPositionBased' })
</script>

<style scoped lang="scss">
  .attribution-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    padding: 24px;

    .placeholder-text {
      margin: 0;
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }
</style>
