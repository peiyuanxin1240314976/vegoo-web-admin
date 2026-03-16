<template>
  <div class="user-growth-placeholder art-full-height flex items-center justify-center">
    <div class="placeholder-content text-center">
      <p class="text-lg text-gray-500">{{ $t('menus.userGrowth.adPlatformDetail') }}</p>
      <p class="text-sm text-gray-400 mt-2">占位页面，待开发</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'AdPlatformDetail' })
</script>

<style scoped>
  .user-growth-placeholder {
    min-height: 200px;
  }
</style>
