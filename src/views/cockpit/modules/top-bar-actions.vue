<template>
  <div class="cockpit-top-bar">
    <AppDatePicker
      v-model="selectedDate"
      type="date"
      value-format="YYYY-MM-DD"
      format="YYYY-MM-DD"
      :clearable="false"
      size="default"
      class="cockpit-date-display"
      placeholder="选择日期"
      :prefix-icon="Calendar"
      :disabled-date="disableNotToday"
      @update:model-value="onDateChange"
    />
    <div class="actions">
      <ElButton
        size="default"
        type="primary"
        class="toolbar-btn toolbar-btn--primary"
        @click="emit('openScenarioSimulation')"
      >
        <ElIcon class="btn-icon"><DataAnalysis /></ElIcon>
        模拟分析
      </ElButton>
      <ElButton size="default" class="toolbar-btn toolbar-btn--ghost" @click="toggleFullScreen">
        <ElIcon class="btn-icon"><FullScreen /></ElIcon>
        {{ isFullScreen ? '退出全屏' : '全屏' }}
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import { Calendar, DataAnalysis, FullScreen } from '@element-plus/icons-vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
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

  function disableNotToday(date: Date): boolean {
    const d = formatYYYYMMDD(date)
    return d !== todayStr()
  }

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
  .cockpit-top-bar {
    --toolbar-theme: var(--theme-color, var(--art-primary, var(--el-color-primary, #3b82f6)));
    --toolbar-theme-soft: color-mix(in srgb, var(--toolbar-theme) 72%, #8b5cf6);
    --toolbar-theme-cyan: color-mix(in srgb, var(--toolbar-theme) 82%, #38bdf8);
    --toolbar-surface: linear-gradient(180deg, rgb(9 16 34 / 92%), rgb(7 12 26 / 88%));
    --toolbar-border: color-mix(in srgb, var(--toolbar-theme) 24%, transparent);
    --toolbar-border-strong: color-mix(in srgb, var(--toolbar-theme) 38%, transparent);
    --toolbar-shadow: 0 12px 28px rgb(2 6 23 / 26%), inset 0 1px 0 rgb(255 255 255 / 6%);
    --toolbar-active: linear-gradient(
      135deg,
      color-mix(in srgb, var(--toolbar-theme) 78%, white 22%) 0%,
      var(--toolbar-theme-soft) 54%,
      var(--toolbar-theme-cyan) 100%
    );

    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;

    :deep(.cockpit-date-display) {
      width: 164px !important;
    }

    :deep(.cockpit-date-display .el-input__wrapper) {
      min-height: 40px;
      cursor: default;
      background: var(--toolbar-surface);
      border: 1px solid var(--toolbar-border);
      border-radius: 14px;
      box-shadow:
        var(--toolbar-shadow),
        0 0 0 1px rgb(24 36 72 / 72%),
        0 0 18px color-mix(in srgb, var(--toolbar-theme) 10%, transparent);
      transition:
        border-color 0.2s ease,
        box-shadow 0.2s ease,
        transform 0.16s ease;
    }

    :deep(.cockpit-date-display .el-input__wrapper:hover) {
      border-color: var(--toolbar-border-strong);
      box-shadow:
        var(--toolbar-shadow),
        0 0 0 1px rgb(24 36 72 / 72%),
        0 0 22px color-mix(in srgb, var(--toolbar-theme) 14%, transparent);
    }

    :deep(.cockpit-date-display .el-input__inner) {
      font-size: 13px;
      font-weight: 600;
      line-height: 1;
      color: rgb(234 242 255 / 94%);
      text-align: center;
      letter-spacing: 0.02em;
      cursor: default;
      user-select: none;
    }

    :deep(.cockpit-date-display .el-input__prefix) {
      margin-right: 4px;
      color: rgb(162 185 255 / 88%);
      color: color-mix(in srgb, var(--toolbar-theme) 42%, white 36%);
    }

    :deep(.cockpit-date-display .el-input__prefix-inner) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    :deep(.cockpit-date-display .el-input__icon) {
      font-size: 15px;
      filter: drop-shadow(0 0 10px color-mix(in srgb, var(--toolbar-theme) 18%, transparent));
    }

    .actions {
      display: flex;
      gap: 10px;
      align-items: center;

      :deep(.toolbar-btn) {
        min-height: 40px;
        padding: 0 16px;
        margin-left: 0;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.02em;
        border-radius: 14px;
        transition:
          transform 0.16s ease,
          box-shadow 0.22s ease,
          border-color 0.22s ease,
          background 0.22s ease;
      }

      :deep(.toolbar-btn .btn-icon) {
        margin-right: 6px;
        font-size: 15px;
        opacity: 0.96;
      }

      :deep(.toolbar-btn .el-icon) {
        filter: drop-shadow(0 0 10px color-mix(in srgb, var(--toolbar-theme) 18%, transparent));
      }

      :deep(.toolbar-btn--primary) {
        color: #f7fbff;
        background: var(--toolbar-active);
        border: 1px solid color-mix(in srgb, var(--toolbar-theme) 34%, white 16%);
        box-shadow:
          inset 0 1px 0 rgb(255 255 255 / 24%),
          0 10px 22px color-mix(in srgb, var(--toolbar-theme) 24%, transparent),
          0 0 24px color-mix(in srgb, var(--toolbar-theme) 20%, transparent);
      }

      :deep(.toolbar-btn--primary:hover) {
        border-color: color-mix(in srgb, var(--toolbar-theme) 42%, white 12%);
        box-shadow:
          inset 0 1px 0 rgb(255 255 255 / 28%),
          0 14px 30px color-mix(in srgb, var(--toolbar-theme) 30%, transparent),
          0 0 28px color-mix(in srgb, var(--toolbar-theme) 24%, transparent);
      }

      :deep(.toolbar-btn--ghost) {
        color: rgb(232 239 255 / 90%);
        background: var(--toolbar-surface);
        border: 1px solid var(--toolbar-border);
        box-shadow:
          var(--toolbar-shadow),
          0 0 0 1px rgb(24 36 72 / 72%),
          0 0 18px color-mix(in srgb, var(--toolbar-theme) 10%, transparent);
      }

      :deep(.toolbar-btn--ghost:hover) {
        color: #f7fbff;
        border-color: var(--toolbar-border-strong);
        box-shadow:
          var(--toolbar-shadow),
          0 0 0 1px rgb(24 36 72 / 72%),
          0 0 24px color-mix(in srgb, var(--toolbar-theme) 16%, transparent);
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
