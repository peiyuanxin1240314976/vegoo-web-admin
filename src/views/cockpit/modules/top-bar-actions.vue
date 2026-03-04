<template>
  <div class="cockpit-top-bar">
    <span class="current-date">{{ dateText }}</span>
    <div class="actions">
      <ElButton size="small" type="primary">模拟分析</ElButton>
      <ElButton size="small">全屏</ElButton>
      <ElButton size="small" :icon="Setting" circle />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Setting } from '@element-plus/icons-vue'

  defineOptions({ name: 'CockpitTopBarActions' })

  const dateText = computed(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
    return `今天${week}, ${y}年${m}月${day}日`
  })
</script>

<style scoped lang="scss">
  .cockpit-top-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    .current-date {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
</style>
