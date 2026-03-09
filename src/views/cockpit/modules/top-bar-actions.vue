<template>
  <div class="cockpit-top-bar">
    <span class="current-date">
      <ElIcon class="date-icon"><Calendar /></ElIcon>
      {{ dateText }}
    </span>
    <div class="actions">
      <ElButton size="small" type="primary">
        <ElIcon class="btn-icon"><DataAnalysis /></ElIcon>
        模拟分析
      </ElButton>
      <ElButton size="small" @click="toggleFullScreen">
        <ElIcon class="btn-icon"><FullScreen /></ElIcon>
        {{ isFullScreen ? '退出全屏' : '全屏' }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue'
  import { Calendar, DataAnalysis, FullScreen } from '@element-plus/icons-vue'
  import { useTableStore } from '@/store/modules/table'

  defineOptions({ name: 'CockpitTopBarActions' })

  const props = withDefaults(defineProps<{ fullClass?: string }>(), { fullClass: 'cockpit-page' })

  const tableStore = useTableStore()
  const isFullScreen = ref(false)
  const originalOverflow = ref('')

  const dateText = computed(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `今天, ${y}年${m}月${day}日`
  })

  const toggleFullScreen = () => {
    const el = document.querySelector(`.${props.fullClass}`)
    if (!el) return

    isFullScreen.value = !isFullScreen.value

    if (isFullScreen.value) {
      originalOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      el.classList.add('el-full-screen')
      tableStore.setIsFullScreen(true)
    } else {
      document.body.style.overflow = originalOverflow.value
      el.classList.remove('el-full-screen')
      tableStore.setIsFullScreen(false)
    }
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isFullScreen.value) {
      toggleFullScreen()
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleEscapeKey)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscapeKey)
    if (isFullScreen.value) {
      document.body.style.overflow = originalOverflow.value
      const el = document.querySelector(`.${props.fullClass}`)
      if (el) el.classList.remove('el-full-screen')
      tableStore.setIsFullScreen(false)
    }
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
      display: inline-flex;
      gap: 6px;
      align-items: center;
      font-size: 14px;
      color: var(--el-text-color-regular);

      .date-icon {
        font-size: 16px;
        color: var(--el-text-color-secondary);
      }
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;

      .btn-icon {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }
</style>
