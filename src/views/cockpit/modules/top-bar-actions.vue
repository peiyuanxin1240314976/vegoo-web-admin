<template>
  <div class="cockpit-top-bar">
    <ElInput
      :model-value="displayDate"
      size="default"
      class="cockpit-date-display"
      placeholder="选择日期"
      :prefix-icon="Calendar"
      readonly
      tabindex="-1"
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
  import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
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

  const displayDate = computed(() => {
    const v = selectedDate.value
    // v 形如：YYYY-MM-DD
    if (!v) return ''
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
    if (!m) return v
    return `${m[1]}年${m[2]}月${m[3]}日`
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

    :deep(.cockpit-date-display) {
      width: 150px !important;
    }

    /* 纯展示：看起来像输入框，但不允许编辑/聚焦交互 */
    :deep(.cockpit-date-display .el-input__wrapper) {
      cursor: default;
    }

    :deep(.cockpit-date-display .el-input__inner) {
      cursor: default;
      user-select: none;
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
