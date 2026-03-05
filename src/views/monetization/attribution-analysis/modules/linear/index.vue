<template>
  <div class="attribution-placeholder art-card">
    <p class="placeholder-text">线性分析（占位，后续实现）</p>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AttributionLinear' })
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
