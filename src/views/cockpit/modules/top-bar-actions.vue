<template>
  <div class="cockpit-top-bar">
    <AppDatePicker
      v-model="selectedDate"
      type="date"
      :shortcuts="dateShortcuts"
      value-format="YYYY-MM-DD"
      format="YYYY-MM-DD"
      :clearable="false"
      size="default"
      class="cockpit-date-display"
      placeholder="选择日期"
      :prefix-icon="Calendar"
      @update:model-value="onDateChange"
    />
    <div class="actions">
      <!-- <ElButton
        size="default"
        type="primary"
        class="toolbar-btn toolbar-btn--primary"
        @click="emit('openScenarioSimulation')"
      >
        <ElIcon class="btn-icon"><DataAnalysis /></ElIcon>
        模拟分析
      </ElButton> -->
      <ElButton size="default" class="toolbar-btn toolbar-btn--ghost" @click="toggleFullScreen">
        <ElIcon class="btn-icon"><FullScreen /></ElIcon>
        {{ isFullScreen ? '退出全屏' : '全屏' }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import {
    Calendar,
    //  DataAnalysis,
    FullScreen
  } from '@element-plus/icons-vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useTableStore } from '@/store/modules/table'
  import { dateShortcuts } from '@/utils/form/date-shortcuts'
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

  function onDateChange(value: string | undefined) {
    if (!value) {
      selectedDate.value = todayStr()
      emit('update:modelValue', selectedDate.value)
      return
    }
    selectedDate.value = value
    emit('update:modelValue', value)
  }

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
  /* 日期框：对齐 user-growth/styles/filter-bar-theme.scss 中 date-trigger（宽度保留驾驶舱 164px） */
  .cockpit-top-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;

    :deep(.cockpit-date-display.el-date-editor) {
      flex: 0 0 164px !important;
      width: 164px !important;
      min-width: 164px !important;
      max-width: 164px !important;
    }

    :deep(.cockpit-date-display .el-input__wrapper) {
      width: 100% !important;
      min-height: 36px;
      cursor: pointer;
      background: color-mix(in srgb, var(--el-color-primary) 6%, transparent) !important;
      border: 1px solid var(--el-color-primary) !important;
      border-radius: var(--el-border-radius-base, 4px) !important;
      box-shadow: none !important;
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        background 0.2s ease;
    }

    :deep(.cockpit-date-display .el-input__wrapper:hover) {
      border-color: var(--el-border-color-hover) !important;
      box-shadow: none !important;
    }

    :deep(.cockpit-date-display .el-input__wrapper.is-focus),
    :deep(.cockpit-date-display .el-input__wrapper:focus-within) {
      background: color-mix(in srgb, var(--el-color-primary) 6%, transparent) !important;
      border-color: var(--el-input-focus-border-color) !important;
      box-shadow: none !important;
    }

    :deep(.cockpit-date-display .el-input__inner) {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.2;
      color: var(--el-text-color-primary);
      text-align: center;
    }

    :deep(.cockpit-date-display .el-input__inner::placeholder) {
      color: var(--el-text-color-placeholder);
    }

    :deep(.cockpit-date-display .el-input__prefix-inner),
    :deep(.cockpit-date-display .el-input__icon) {
      color: var(--el-color-primary);
    }

    :deep(.cockpit-date-display .el-input__prefix-inner) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .actions {
      display: flex;
      gap: 10px;
      align-items: center;

      /* 对齐 IAPAnalysis.vue .iap-search-btn */
      :deep(.toolbar-btn) {
        height: 36px;
        min-height: 36px;
        padding: 0 20px;
        margin-left: 0;
        font-size: 14px;
        font-weight: 500;
        border-radius: var(--el-border-radius-base, 4px);
        transition:
          transform 0.16s ease,
          box-shadow 0.22s ease,
          border-color 0.22s ease,
          background 0.22s ease;
      }

      :deep(.toolbar-btn .btn-icon) {
        margin-right: 6px;
        font-size: 15px;
      }

      :deep(.toolbar-btn--ghost) {
        color: var(--theme-color, var(--art-primary, #3b82f6));
        background: color-mix(
          in srgb,
          var(--theme-color, var(--art-primary, #3b82f6)) 6%,
          transparent
        );
        border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
        box-shadow: 0 0 18px
          color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 20%, transparent);
      }

      :deep(.toolbar-btn--ghost:hover) {
        background: color-mix(
          in srgb,
          var(--theme-color, var(--art-primary, #3b82f6)) 8%,
          transparent
        );
        border-color: var(--theme-color, var(--art-primary, #3b82f6));
        box-shadow: 0 0 26px
          color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 28%, transparent);
      }

      :deep(.toolbar-btn:active) {
        transform: translateY(1px);
      }

      .btn-icon {
        margin-right: 4px;
        font-size: 14px;
      }
    }
  }
</style>
