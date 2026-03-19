<!-- 根路径重定向：由路由守卫或此处重定向到首页 -->
<template>
  <div class="redirect-home" />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'RedirectHome' })

  const router = useRouter()
  const { homePath } = useCommon()

  onMounted(() => {
    const target = homePath.value || '/cockpit'
    if (target && target !== '/') {
      router.replace(target)
    }
  })
</script>

<style scoped>
  .redirect-home {
    display: none;
  }
</style>
