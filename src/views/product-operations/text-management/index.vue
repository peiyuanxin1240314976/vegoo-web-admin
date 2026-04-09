<script setup lang="ts">
  import { ref, computed, provide, onMounted } from 'vue'
  import TextReview from './TextReview.vue'
  import AutoFill from './AutoFill.vue'
  import PreviewFramework from './PreviewFramework.vue'
  import type { Step, AppContent, Translation } from './types'
  import {
    fetchAuditWordLists,
    fetchGetStoreListingDraft,
    fetchSaveStoreListingDraft,
    fetchSubmitStore,
    fetchTranslationsExport,
    type StoreListingDraft
  } from './api/text-management'
  import { ElMessage } from 'element-plus'

  // ─── Current step ────────────────────────────────────────────────────────────
  const currentStep = ref<Step>(1)

  // ─── Shared app content ───────────────────────────────────────────────────────
  const appContent = ref<AppContent>({
    appName: '',
    shortDesc: '',
    fullDesc: ''
  })
  const auditWordLists = ref<{ bannedWords: string[]; brandWords: string[] }>({
    bannedWords: [],
    brandWords: []
  })

  // ─── Translation list ────────────────────────────────────────────────────────
  const translations = ref<Translation[]>([])

  // ─── Provide shared state to children ────────────────────────────────────────
  provide('appContent', appContent)
  provide('translations', translations)
  provide('currentStep', currentStep)

  // ─── Step tabs config ─────────────────────────────────────────────────────────
  const tabs = [
    { step: 1 as Step, label: '文本审核' },
    { step: 2 as Step, label: '自动填充' },
    { step: 3 as Step, label: '预演框架' }
  ]

  // ─── Computed: steps completed ────────────────────────────────────────────────
  const step1Done = ref(false)
  const step2Done = ref(false)

  const stepStatus = (step: Step) => {
    if (step === 1) return step1Done.value ? 'done' : currentStep.value === 1 ? 'active' : 'pending'
    if (step === 2) return step2Done.value ? 'done' : currentStep.value === 2 ? 'active' : 'pending'
    return currentStep.value === 3 ? 'active' : 'pending'
  }

  // ─── Header button labels ─────────────────────────────────────────────────────
  type HeaderAction = 'saveDraft' | 'auditPass' | 'goPreview' | 'export' | 'import' | 'submitStore'
  const headerBtns = computed(() => {
    if (currentStep.value === 1)
      return [
        { label: '保存草稿', type: 'secondary', action: 'saveDraft' as HeaderAction },
        { label: '通过审核，进入自动填充 →', type: 'primary', action: 'auditPass' as HeaderAction }
      ]
    if (currentStep.value === 2)
      return [
        { label: '保存草稿', type: 'secondary', action: 'saveDraft' as HeaderAction },
        { label: '导出译文', type: 'secondary', action: 'export' as HeaderAction, dropdown: true },
        { label: '进入预演框架 →', type: 'primary', action: 'goPreview' as HeaderAction }
      ]
    return [
      { label: '导入译文', type: 'secondary', action: 'import' as HeaderAction },
      { label: '导出译文', type: 'secondary', action: 'export' as HeaderAction, dropdown: true },
      { label: '提交到商店后台', type: 'primary', action: 'submitStore' as HeaderAction }
    ]
  })

  // ─── Navigation ───────────────────────────────────────────────────────────────
  const goToStep = (step: Step) => {
    currentStep.value = step
  }

  const handleAuditPass = () => {
    step1Done.value = true
    currentStep.value = 2
  }

  const handleGoPreview = () => {
    step2Done.value = true
    currentStep.value = 3
  }

  const handleSaveDraft = async () => {
    try {
      const payload: StoreListingDraft = {
        appContent: appContent.value,
        translations: translations.value,
        step1Done: step1Done.value,
        step2Done: step2Done.value
      }
      await fetchSaveStoreListingDraft(payload)
      ElMessage.success('草稿已保存')
    } catch {
      ElMessage.error('保存失败，请检查接口或稍后重试')
    }
  }

  const handleExport = async (scope: 'completed' | 'selected' = 'completed') => {
    try {
      const res = await fetchTranslationsExport({
        format: 'xlsx',
        scope,
        langCodes:
          scope === 'selected'
            ? translations.value.filter((t) => t.selected).map((t) => t.langCode)
            : translations.value.filter((t) => t.status === 'completed').map((t) => t.langCode)
      })
      ElMessage.success(`导出任务已生成：${res.fileName}`)
    } catch {
      ElMessage.error('导出失败，请检查接口后重试')
    }
  }

  const handleImport = () => {
    ElMessage.info('请在右侧“导入译文”区域选择文件，导入会触发接口')
  }

  const handleSubmitStore = async () => {
    try {
      const res = await fetchSubmitStore({
        appContent: appContent.value,
        translations: translations.value,
        platform: 'google_play'
      })
      ElMessage.success(`已提交到商店后台，任务ID：${res.taskId}`)
    } catch {
      ElMessage.error('提交失败，请检查接口后重试')
    }
  }

  const handleHeaderAction = async (action: HeaderAction) => {
    if (action === 'saveDraft') return handleSaveDraft()
    if (action === 'auditPass') return handleAuditPass()
    if (action === 'goPreview') return handleGoPreview()
    if (action === 'export') return handleExport()
    if (action === 'import') return handleImport()
    if (action === 'submitStore') return handleSubmitStore()
  }

  const loadDraftByApp = async (appId = '') => {
    const draft = await fetchGetStoreListingDraft(appId)
    appContent.value = {
      appName: draft.appContent?.appName ?? '',
      shortDesc: draft.appContent?.shortDesc ?? '',
      fullDesc: draft.appContent?.fullDesc ?? ''
    }
    translations.value = Array.isArray(draft.translations) ? draft.translations : []
    step1Done.value = draft.step1Done === true
    step2Done.value = draft.step2Done === true
    currentStep.value = step2Done.value ? 3 : step1Done.value ? 2 : 1
  }

  const handleAppChange = async (appId: string) => {
    try {
      await loadDraftByApp(appId)
      ElMessage.success('应用草稿已切换')
    } catch {
      ElMessage.error('切换应用失败，请检查接口后重试')
    }
  }

  onMounted(async () => {
    try {
      const [, words] = await Promise.all([loadDraftByApp(''), fetchAuditWordLists()])
      auditWordLists.value = {
        bannedWords: words.bannedWords ?? [],
        brandWords: words.brandWords ?? []
      }
    } catch {
      ElMessage.warning('初始化接口拉取失败，当前展示为本地内容')
    }
  })
</script>

<template>
  <div class="text-management art-full-height">
    <!-- Breadcrumb + Header actions -->
    <div class="tm-header">
      <div class="breadcrumb">
        <span class="bc-parent">商店运营</span>
        <span class="bc-sep">›</span>
        <span class="bc-current">文本管理</span>
      </div>
      <div class="header-actions">
        <template v-for="btn in headerBtns" :key="btn.label">
          <el-dropdown
            v-if="btn.dropdown"
            trigger="click"
            @command="(scope) => void handleExport(scope as 'completed' | 'selected')"
          >
            <el-button :class="btn.type === 'primary' ? 'btn-primary' : 'btn-secondary'">
              {{ btn.label }}
              <span class="dropdown-arrow">▼</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="completed">全部导出</el-dropdown-item>
                <el-dropdown-item command="selected">选择语种导出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-else
            :class="btn.type === 'primary' ? 'btn-primary' : 'btn-secondary'"
            @click="void handleHeaderAction(btn.action)"
          >
            {{ btn.label }}
          </el-button>
        </template>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tm-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.step"
        class="tab-item"
        :class="{ active: currentStep === tab.step }"
        @click="goToStep(tab.step)"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Step indicator (shown inside child on Review page, here globally for steps 2-3) -->
    <div v-if="currentStep > 1" class="step-indicator">
      <div v-for="(tab, i) in tabs" :key="tab.step" class="step-item" :class="stepStatus(tab.step)">
        <span class="step-dot">
          <span v-if="stepStatus(tab.step) === 'done'" class="check">✓</span>
          <span v-else class="num">{{ tab.step }}</span>
        </span>
        <span class="step-label">{{ tab.label }}</span>
        <span
          v-if="i < tabs.length - 1"
          class="step-line"
          :class="{ done: stepStatus(tabs[i + 1].step) !== 'pending' || step1Done || step2Done }"
        />
      </div>
    </div>

    <!-- Page content -->
    <div class="tm-content">
      <Transition name="page-fade" mode="out-in">
        <div :key="currentStep" class="tm-step-shell">
          <TextReview
            v-if="currentStep === 1"
            :app-content="appContent"
            :audit-word-lists="auditWordLists"
            @update:app-content="(v) => Object.assign(appContent, v)"
            @audit-pass="handleAuditPass"
            @app-change="(appId) => void handleAppChange(appId)"
          />
          <AutoFill
            v-else-if="currentStep === 2"
            :app-content="appContent"
            :translations="translations"
            @update:translations="
              (v) => {
                translations.splice(0)
                translations.push(...v)
              }
            "
            @go-preview="handleGoPreview"
          />
          <PreviewFramework
            v-else
            :app-content="appContent"
            :translations="translations"
            @update:translations="
              (v) => {
                translations.splice(0)
                translations.push(...v)
              }
            "
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  :root {
    --tm-bg: #0d1117;
    --tm-surface: #161b22;
    --tm-surface2: #1c2130;
    --tm-border: #30363d;
    --tm-text: #e6edf3;
    --tm-text2: #8b949e;
    --tm-teal: #3de8c4;
    --tm-teal-dim: rgb(61 232 196 / 15%);
    --tm-success: #3fb950;
    --tm-warn: #d29922;
    --tm-error: #f85149;
  }

  .text-management {
    min-height: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
    color: #e6edf3;
    background: #0d1117;
  }

  .tm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: #0d1117;
    border-bottom: 1px solid #30363d;

    .breadcrumb {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 15px;

      .bc-parent {
        color: #8b949e;
        cursor: pointer;

        &:hover {
          color: #3de8c4;
        }
      }

      .bc-sep {
        color: #484f58;
      }

      .bc-current {
        font-weight: 600;
        color: #e6edf3;
      }
    }

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }

  :deep(.btn-primary) {
    padding: 8px 18px;
    font-weight: 600;
    color: #0d1117 !important;
    background: #3de8c4 !important;
    border: none !important;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: #5af0d0 !important;
      transform: translateY(-1px);
    }
  }

  :deep(.btn-secondary) {
    padding: 8px 18px;
    color: #e6edf3 !important;
    background: transparent !important;
    border: 1px solid #30363d !important;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      color: #3de8c4 !important;
      border-color: #3de8c4 !important;
    }

    .dropdown-arrow {
      margin-left: 4px;
      font-size: 10px;
    }
  }

  .tm-tabs {
    display: flex;
    padding: 0 24px;
    background: #0d1117;
    border-bottom: 1px solid #30363d;

    .tab-item {
      position: relative;
      padding: 12px 0;
      margin-right: 32px;
      font-size: 14px;
      color: #8b949e;
      cursor: pointer;
      transition: color 0.2s;

      &::after {
        position: absolute;
        right: 0;
        bottom: -1px;
        left: 0;
        height: 2px;
        content: '';
        background: transparent;
        transition: background 0.2s;
      }

      &.active {
        color: #3de8c4;

        &::after {
          background: #3de8c4;
        }
      }

      &:hover:not(.active) {
        color: #e6edf3;
      }
    }
  }

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 14px 24px;
    background: #0d1117;
    border-bottom: 1px solid #30363d;

    .step-item {
      display: flex;
      gap: 8px;
      align-items: center;

      .step-dot {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        font-size: 11px;
        color: #8b949e;
        border: 2px solid #30363d;
        border-radius: 50%;
        transition: all 0.3s;
      }

      .step-label {
        font-size: 13px;
        color: #8b949e;
      }

      &.active {
        .step-dot {
          color: #3de8c4;
          border-color: #3de8c4;
        }

        .step-label {
          color: #3de8c4;
        }
      }

      &.done {
        .step-dot {
          color: #0d1117;
          background: #3de8c4;
          border-color: #3de8c4;
        }

        .step-label {
          color: #e6edf3;
        }
      }

      .step-line {
        width: 80px;
        height: 2px;
        margin: 0 8px;
        background: #30363d;
        transition: background 0.3s;

        &.done {
          background: #3de8c4;
        }
      }
    }
  }

  .tm-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .tm-step-shell {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .page-fade-enter-from,
  .page-fade-leave-to {
    opacity: 0;
  }

  :deep(.el-dropdown-menu) {
    background: #1c2130;
    border: 1px solid #30363d;

    .el-dropdown-menu__item {
      color: #e6edf3;

      &:hover {
        color: #3de8c4;
        background: rgb(61 232 196 / 10%);
      }
    }
  }
</style>
