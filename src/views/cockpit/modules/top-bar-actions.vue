<template>
  <div class="cockpit-top-bar">
    <ElDatePicker
      v-model="selectedDate"
      type="date"
      size="default"
      class="cockpit-date-picker"
      placeholder="选择日期"
      format="YYYY年MM月DD日"
      value-format="YYYY-MM-DD"
      :prefix-icon="Calendar"
    />
    <div class="actions">
      <ElButton size="default" type="primary" @click="showSimulationDialog = true">
        <ElIcon class="btn-icon"><DataAnalysis /></ElIcon>
        模拟分析
      </ElButton>
      <ScenarioSimulationDialog v-model="showSimulationDialog" />
      <ElButton size="default" @click="toggleFullScreen">
        <ElIcon class="btn-icon"><FullScreen /></ElIcon>
        {{ isFullScreen ? '退出全屏' : '全屏' }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { Calendar, DataAnalysis, FullScreen } from '@element-plus/icons-vue'
  import { useTableStore } from '@/store/modules/table'
  import ScenarioSimulationDialog from './scenario-simulation-dialog.vue'

  defineOptions({ name: 'CockpitTopBarActions' })

  const showSimulationDialog = ref(false)

  const props = withDefaults(defineProps<{ fullClass?: string }>(), { fullClass: 'cockpit-page' })

  const tableStore = useTableStore()
  const isFullScreen = ref(false)
  const originalOverflow = ref('')

  const selectedDate = ref(
    (() => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()
  )

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

    :deep(.cockpit-date-picker) {
      width: 150px !important;
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
