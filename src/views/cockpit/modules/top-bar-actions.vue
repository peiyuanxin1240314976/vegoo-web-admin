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
      <ElButton size="default" type="primary" @click="emit('openScenarioSimulation')">
        <ElIcon class="btn-icon"><DataAnalysis /></ElIcon>
        模拟分析
      </ElButton>
      <ElButton size="default" @click="toggleFullScreen">
        <ElIcon class="btn-icon"><FullScreen /></ElIcon>
        {{ isFullScreen ? '退出全屏' : '全屏' }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { Calendar, DataAnalysis, FullScreen } from '@element-plus/icons-vue'
  import { useTableStore } from '@/store/modules/table'
  import { formatYYYYMMDD, getAppNow } from '@/utils/app-now'

  defineOptions({ name: 'CockpitTopBarActions' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      fullClass?: string
    }>(),
    {
      modelValue: undefined,
      fullClass: 'cockpit-page'
    }
  )
  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
    (e: 'openScenarioSimulation'): void
  }>()

  const tableStore = useTableStore()
  const isFullScreen = ref(false)
  const originalOverflow = ref('')

  function todayStr(): string {
    return formatYYYYMMDD(getAppNow())
  }

  const selectedDate = ref(props.modelValue || todayStr())

  watch(
    () => props.modelValue,
    (v) => {
      if (v && v !== selectedDate.value) selectedDate.value = v
    }
  )

  watch(selectedDate, (v) => {
    if (v && v !== props.modelValue) emit('update:modelValue', v)
  })

  const toggleFullScreen = () => {
    const el = document.querySelector(`.${props.fullClass}`)
    if (!el) return

    isFullScreen.value = !isFullScreen.value
    const appMain = document.getElementById('app-main')

    if (isFullScreen.value) {
      originalOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      if (appMain) appMain.style.overflow = 'hidden'
      el.classList.add('el-full-screen')
      tableStore.setIsFullScreen(true)
    } else {
      document.body.style.overflow = originalOverflow.value
      if (appMain) appMain.style.overflow = ''
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
      const appMain = document.getElementById('app-main')
      if (appMain) appMain.style.overflow = ''
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
