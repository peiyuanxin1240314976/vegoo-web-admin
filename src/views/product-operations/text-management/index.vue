<script setup lang="ts">
  import { ref, computed, provide } from 'vue'
  import TextReview from './TextReview.vue'
  import AutoFill from './AutoFill.vue'
  import PreviewFramework from './PreviewFramework.vue'
  import type { Step, AppContent, Translation } from './types'

  // ─── Current step ────────────────────────────────────────────────────────────
  const currentStep = ref<Step>(1)

  // ─── Shared app content ───────────────────────────────────────────────────────
  const appContent = ref<AppContent>({
    appName: 'People Search, People Finder',
    shortDesc: 'AI People Search, People Finder, Find People by Name with Smart Search App',
    fullDesc:
      'information across multiple open sources. Simply enter a name, and the system will discover relevant public data, organize it clearly, and present it in one place. Instead of endless manual searching, PeopleSearch uses AI to recognise meaningful patterns and deliver clear results through safe search practices.\n\nPeopleSearch combines AI, people finder, and smart search into one simple tool. It helps you search, discover, and Facebook, TikTok, and fucking find people efficiently while keeping everything clear and responsible.'
  })

  // ─── Translation list ────────────────────────────────────────────────────────
  const translations = ref<Translation[]>([
    {
      id: '1',
      lang: '简体中文',
      langCode: 'zh-CN',
      status: 'completed',
      appName: '人物搜索，人物查找器',
      shortDesc: 'AI人物搜索，按姓名查找人物，智能搜索应用',
      fullDesc:
        '跨多个公开来源的信息。只需输入姓名，系统就会发现相关的公开数据，清晰地整理并呈现在一个地方。无需无尽地手动搜索，PeopleSearch 使用 AI 识别有意义的模式并通过安全搜索实践提供清晰的结果。',
      appNameCount: 8,
      shortDescCount: 45,
      fullDescCount: 1876,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false,
      aiSuggestion: '可将"智能搜索"替换为"智能查找"以更符合居民表达'
    },
    {
      id: '2',
      lang: '日语',
      langCode: 'ja',
      status: 'completed',
      appName: '人物検索、人物ファインダー',
      shortDesc: 'AI人物検索、名前で人物を探す、スマート検索',
      fullDesc: '複数のオープンソースからの情報を提供します。名前を入力するだけで...',
      appNameCount: 12,
      shortDescCount: 52,
      fullDescCount: 2103,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '3',
      lang: '韩语',
      langCode: 'ko',
      status: 'completed',
      appName: '인물 검색, 인물 파인더',
      shortDesc: 'AI 인물 검색, 이름으로 사람 찾기',
      fullDesc: '여러 공개 소스의 정보를 제공합니다...',
      appNameCount: 15,
      shortDescCount: 61,
      fullDescCount: 1954,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '4',
      lang: '法语',
      langCode: 'fr',
      status: 'completed',
      appName: 'Recherche de personnes, chercheur de personnes',
      shortDesc: 'Recherche de personnes par IA, trouver des gens par nom',
      fullDesc: 'Informations provenant de plusieurs sources ouvertes...',
      appNameCount: 22,
      shortDescCount: 78,
      fullDescCount: 3876,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '5',
      lang: '德语',
      langCode: 'de',
      status: 'over_limit',
      appName: 'Personensuche, Personenfinder und Smart-Suche',
      shortDesc: 'KI-Personensuche, Personen nach Name finden',
      fullDesc: 'Informationen aus mehreren offenen Quellen...',
      appNameCount: 31,
      shortDescCount: 65,
      fullDescCount: 2234,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '6',
      lang: '西班牙语',
      langCode: 'es',
      status: 'completed',
      appName: 'Búsqueda de personas, buscador',
      shortDesc: 'Búsqueda de personas con IA, encontrar por nombre',
      fullDesc: 'Información de múltiples fuentes abiertas...',
      appNameCount: 19,
      shortDescCount: 72,
      fullDescCount: 2567,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '7',
      lang: '阿拉伯语',
      langCode: 'ar',
      status: 'completed',
      appName: 'بحث الأشخاص، محدد الأشخاص',
      shortDesc: 'بحث الأشخاص بالذكاء الاصطناعي، ابحث عن الناس بالاسم',
      fullDesc: 'معلومات من مصادر مفتوحة متعددة...',
      appNameCount: 18,
      shortDescCount: 58,
      fullDescCount: 1823,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '8',
      lang: '葡萄牙语',
      langCode: 'pt-BR',
      status: 'translating',
      appName: '',
      shortDesc: '',
      fullDesc: '',
      appNameCount: 0,
      shortDescCount: 0,
      fullDescCount: 0,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '9',
      lang: '印度尼西亚语',
      langCode: 'id',
      status: 'pending',
      appName: '',
      shortDesc: '',
      fullDesc: '',
      appNameCount: 0,
      shortDescCount: 0,
      fullDescCount: 0,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    },
    {
      id: '10',
      lang: '意大利语',
      langCode: 'it',
      status: 'pending',
      appName: '',
      shortDesc: '',
      fullDesc: '',
      appNameCount: 0,
      shortDescCount: 0,
      fullDescCount: 0,
      appNameLimit: 30,
      shortDescLimit: 80,
      fullDescLimit: 4000,
      selected: false
    }
  ])

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
  const headerBtns = computed(() => {
    if (currentStep.value === 1)
      return [
        { label: '保存草稿', type: 'secondary' },
        { label: '通过审核，进入自动填充 →', type: 'primary' }
      ]
    if (currentStep.value === 2)
      return [
        { label: '保存草稿', type: 'secondary' },
        { label: '导出译文', type: 'secondary', dropdown: true },
        { label: '进入预演框架 →', type: 'primary' }
      ]
    return [
      { label: '导入译文', type: 'secondary' },
      { label: '导出译文', type: 'secondary', dropdown: true },
      { label: '提交到商店后台', type: 'primary' }
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

  const handleSaveDraft = () => {
    ElMessage.success('草稿已保存')
  }

  import { ElMessage } from 'element-plus'
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
          <el-dropdown v-if="btn.dropdown" trigger="click">
            <el-button :class="btn.type === 'primary' ? 'btn-primary' : 'btn-secondary'">
              {{ btn.label }}
              <span class="dropdown-arrow">▼</span>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>全部导出</el-dropdown-item>
                <el-dropdown-item>选择语种导出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button
            v-else
            :class="btn.type === 'primary' ? 'btn-primary' : 'btn-secondary'"
            @click="
              btn.label.includes('审核')
                ? handleAuditPass()
                : btn.label.includes('预演')
                  ? handleGoPreview()
                  : handleSaveDraft()
            "
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
            @update:app-content="(v) => Object.assign(appContent, v)"
            @audit-pass="handleAuditPass"
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
