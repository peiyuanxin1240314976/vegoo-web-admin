<!-- 根路径重定向：由路由守卫或此处重定向到首页 -->
<template>
  <div class="redirect-home" />
</template>

<script setup lang="ts">
  defineOptions({ name: 'RedirectHome' })
</script>

<style scoped>
  .redirect-home {
    display: none;
  }
</style>
