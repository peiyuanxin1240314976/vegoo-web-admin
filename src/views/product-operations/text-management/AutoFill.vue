<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { AppContent, Translation, AIModel } from './types'
  import { fetchTextManagementTranslate } from './api/text-management'

  const props = defineProps<{
    appContent: AppContent
    translations: Translation[]
  }>()

  const emit = defineEmits<{
    'update:translations': [val: Translation[]]
    goPreview: []
  }>()

  // ─── Local copies ─────────────────────────────────────────────────────────────
  const localTranslations = ref<Translation[]>(JSON.parse(JSON.stringify(props.translations)))
  watch(
    () => props.translations,
    (v) => {
      localTranslations.value = JSON.parse(JSON.stringify(v))
    },
    { deep: true }
  )

  const syncTranslationsToParent = () => emit('update:translations', [...localTranslations.value])

  // ─── Config state ─────────────────────────────────────────────────────────────
  const selectedAgent = ref('Store Listing Agent 1')
  const agentPrompt = ref(
    'Please work as a transcreation in English and Arabic, French (France), German, Indonesian...'
  )
  const selectedModel = ref<AIModel>('claude-sonnet')
  const showPromptEdit = ref(false)

  const AI_MODELS = [
    { value: 'claude-sonnet' as AIModel, label: 'Claude 3.5 Sonnet' },
    { value: 'gpt4o' as AIModel, label: 'GPT-4o' },
    { value: 'gemini-15-pro' as AIModel, label: 'Gemini 1.5 Pro' }
  ]

  // ─── Language config（与中间列表 selected 联动）────────────────────────────────────
  const chipSelectedCount = computed(() => localTranslations.value.filter((t) => t.selected).length)

  const toggleLangChipSelect = (t: Translation) => {
    t.selected = !t.selected
    syncTranslationsToParent()
  }

  const removeLangChip = (t: Translation) => {
    ElMessageBox.confirm(
      `确定从译化列表中移除「${t.lang}（${t.langCode}）」吗？移除后可在「管理语种」中重新添加。`,
      '移除语种',
      {
        type: 'warning',
        confirmButtonText: '移除',
        cancelButtonText: '取消'
      }
    )
      .then(() => {
        const idx = localTranslations.value.findIndex((x) => x.id === t.id)
        if (idx === -1) return
        if (editorLang.value?.id === t.id) {
          editorLang.value = null
        }
        localTranslations.value.splice(idx, 1)
        if (editorLang.value === null && localTranslations.value.length > 0) {
          openEditor(localTranslations.value[0])
        } else if (localTranslations.value.length === 0) {
          editingName.value = ''
          editingShort.value = ''
          editingFull.value = ''
        }
        emit('update:translations', [...localTranslations.value])
        ElMessage.success('已移除该语种')
      })
      .catch(() => {})
  }

  // 「管理语种」：从预设中追加尚未出现在列表中的语种
  const langManageVisible = ref(false)
  const addLangCode = ref('')

  const PRESET_LANG_ADD: { code: string; lang: string }[] = [
    { code: 'en', lang: '英语' },
    { code: 'ru', lang: '俄语' },
    { code: 'tr', lang: '土耳其语' },
    { code: 'vi', lang: '越南语' },
    { code: 'pl', lang: '波兰语' },
    { code: 'nl', lang: '荷兰语' },
    { code: 'th', lang: '泰语' },
    { code: 'ms', lang: '马来语' },
    { code: 'hi', lang: '印地语' },
    { code: 'uk', lang: '乌克兰语' },
    { code: 'cs', lang: '捷克语' },
    { code: 'sv', lang: '瑞典语' },
    { code: 'da', lang: '丹麦语' },
    { code: 'no', lang: '挪威语' },
    { code: 'fi', lang: '芬兰语' }
  ]

  const addablePreset = computed(() =>
    PRESET_LANG_ADD.filter((p) => !localTranslations.value.some((t) => t.langCode === p.code))
  )

  const newEmptyTranslation = (lang: string, langCode: string): Translation => ({
    id: `lang-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    lang,
    langCode,
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
  })

  const confirmAddLang = () => {
    const opt = PRESET_LANG_ADD.find((p) => p.code === addLangCode.value)
    if (!opt) {
      ElMessage.warning('请选择要添加的语言')
      return
    }
    localTranslations.value.push(newEmptyTranslation(opt.lang, opt.code))
    addLangCode.value = ''
    langManageVisible.value = false
    emit('update:translations', [...localTranslations.value])
    ElMessage.success(`已添加 ${opt.lang}（${opt.code}）`)
  }

  const openLangManage = () => {
    addLangCode.value = addablePreset.value[0]?.code ?? ''
    langManageVisible.value = true
  }

  const onManageLangClick = () => {
    if (addablePreset.value.length === 0) {
      ElMessage.info('暂无可添加的预设语种')
      return
    }
    openLangManage()
  }

  // ─── Translation list filter / search ─────────────────────────────────────────
  const searchQuery = ref('')
  const statusFilter = ref<'all' | 'completed' | 'over_limit' | 'translating' | 'pending'>('all')

  const STATUS_OPTIONS = [
    { value: 'all', label: '全部' },
    { value: 'completed', label: '已完成' },
    { value: 'over_limit', label: '超限警告' },
    { value: 'translating', label: '译化中' },
    { value: 'pending', label: '待执行' }
  ]

  const filteredTranslations = computed(() =>
    localTranslations.value.filter((t) => {
      const matchQuery =
        searchQuery.value === '' ||
        t.lang.includes(searchQuery.value) ||
        t.langCode.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchStatus = statusFilter.value === 'all' || t.status === statusFilter.value
      return matchQuery && matchStatus
    })
  )

  const selectAll = computed({
    get: () =>
      filteredTranslations.value.length > 0 && filteredTranslations.value.every((t) => t.selected),
    set: (val: boolean) => {
      filteredTranslations.value.forEach((t) => {
        t.selected = val
      })
      syncTranslationsToParent()
    }
  })

  const selectedCount = computed(() => filteredTranslations.value.filter((t) => t.selected).length)

  const completedCount = computed(
    () => localTranslations.value.filter((t) => t.status === 'completed').length
  )
  const overLimitCount = computed(
    () => localTranslations.value.filter((t) => t.status === 'over_limit').length
  )

  // ─── Translation editor ───────────────────────────────────────────────────────
  const editorLang = ref<Translation | null>(localTranslations.value[0] || null)
  const editingName = ref(editorLang.value?.appName || '')
  const editingShort = ref(editorLang.value?.shortDesc || '')
  const editingFull = ref(editorLang.value?.fullDesc || '')

  const openEditor = (t: Translation) => {
    editorLang.value = t
    editingName.value = t.appName
    editingShort.value = t.shortDesc
    editingFull.value = t.fullDesc
  }

  const saveEdit = () => {
    if (!editorLang.value) return
    editorLang.value.appName = editingName.value
    editorLang.value.shortDesc = editingShort.value
    editorLang.value.fullDesc = editingFull.value
    editorLang.value.appNameCount = editingName.value.length
    editorLang.value.shortDescCount = editingShort.value.length
    editorLang.value.fullDescCount = editingFull.value.length
    emit('update:translations', [...localTranslations.value])
    ElMessage.success('译文已保存')
  }

  const discardEdit = () => {
    if (!editorLang.value) return
    editingName.value = editorLang.value.appName
    editingShort.value = editorLang.value.shortDesc
    editingFull.value = editorLang.value.fullDesc
  }

  const closeEditor = () => {
    editorLang.value = null
  }

  // ─── Translation execution ─────────────────────────────────────────────────────
  // 契约与 Mock：见 mock/backend-api/03-translate.json、config/data-source.ts
  const translateSingle = async (t: Translation) => {
    if (t.status === 'translating') return
    t.status = 'translating'

    try {
      const res = await fetchTextManagementTranslate({
        model: selectedModel.value,
        agent: selectedAgent.value,
        targetLang: t.langCode,
        content: {
          appName: props.appContent.appName,
          shortDesc: props.appContent.shortDesc,
          fullDesc: props.appContent.fullDesc
        }
      })

      t.appName = res.appName
      t.shortDesc = res.shortDesc
      t.fullDesc = res.fullDesc
      t.appNameCount = res.appName.length
      t.shortDescCount = res.shortDesc.length
      t.fullDescCount = res.fullDesc.length
      t.status = t.appNameCount > t.appNameLimit ? 'over_limit' : 'completed'
    } catch {
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800))
      const mockAppName = `[${t.langCode}] ` + props.appContent.appName.substring(0, 12)
      const mockShort = `[${t.langCode}] ` + props.appContent.shortDesc.substring(0, 40)
      const mockFull = `[${t.langCode}] ` + props.appContent.fullDesc.substring(0, 200)
      t.appName = mockAppName
      t.shortDesc = mockShort
      t.fullDesc = mockFull
      t.appNameCount = mockAppName.length
      t.shortDescCount = mockShort.length
      t.fullDescCount = mockFull.length
      t.status = t.appNameCount > t.appNameLimit ? 'over_limit' : 'completed'
    }

    emit('update:translations', [...localTranslations.value])
  }

  const executeSelected = async () => {
    const targets = filteredTranslations.value.filter((t) => t.selected)
    for (const t of targets) await translateSingle(t)
  }

  const executeAll = async () => {
    for (const t of localTranslations.value) await translateSingle(t)
  }

  // ─── Export ───────────────────────────────────────────────────────────────────
  const exportSelected = () => {
    const selected = localTranslations.value.filter((t) => t.selected)
    const data = JSON.stringify(selected, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'translations.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // 点击行空白区域切换选中，与左侧语种标签联动（避免与按钮、勾选框重复触发）
  const onListRowClick = (t: Translation, e: MouseEvent) => {
    const el = e.target as HTMLElement
    if (el.closest('button') || el.closest('.el-checkbox') || el.closest('.el-button')) return
    t.selected = !t.selected
    syncTranslationsToParent()
  }

  // ─── Char helpers ─────────────────────────────────────────────────────────────
  const charStatus = (count: number, limit: number) =>
    count > limit ? 'error' : count > limit * 0.9 ? 'warn' : 'ok'

  const editNameCount = computed(() => editingName.value.length)
  const editShortCount = computed(() => editingShort.value.length)
  const editFullCount = computed(() => editingFull.value.length)
</script>

<template>
  <div class="auto-fill">
    <!-- Left: config panel -->
    <div class="config-panel">
      <div class="section-title">译化配置</div>

      <!-- App info -->
      <div class="config-block">
        <div class="block-label">应用信息</div>
        <div class="app-info-row">
          <span class="app-name">PeopleSearch - People Finder</span>
          <span class="platform-badge gplay">▶ Google Play</span>
        </div>
      </div>

      <!-- Agent -->
      <div class="config-block">
        <div class="block-label">Agent 选择</div>
        <el-select v-model="selectedAgent" class="tm-select full-width">
          <el-option value="Store Listing Agent 1" label="Store Listing Agent 1" />
          <el-option value="Store Listing Agent 2" label="Store Listing Agent 2" />
        </el-select>
        <div class="prompt-preview" :class="{ expanded: showPromptEdit }">
          <p>{{ agentPrompt }}</p>
        </div>
        <div class="link-btn" @click="showPromptEdit = !showPromptEdit">编辑 Prompt</div>
        <Transition name="slide-down">
          <el-input
            v-if="showPromptEdit"
            v-model="agentPrompt"
            type="textarea"
            :rows="4"
            class="tm-input mt8"
          />
        </Transition>
      </div>

      <!-- AI model -->
      <div class="config-block">
        <div class="block-label">AI API 选择</div>
        <div class="model-list">
          <label
            v-for="model in AI_MODELS"
            :key="model.value"
            class="model-option"
            :class="{ active: selectedModel === model.value }"
          >
            <input v-model="selectedModel" type="radio" :value="model.value" />
            <span class="radio-dot" />
            <span>{{ model.label }}</span>
          </label>
        </div>
      </div>

      <!-- Languages（与中间表格勾选同一字段 selected） -->
      <div class="config-block lang-block">
        <div class="block-label-row">
          <span class="block-label">语种配置</span>
          <span class="lang-count">
            共 {{ localTranslations.length }} 种 · 已选 {{ chipSelectedCount }} 种
          </span>
          <span
            class="link-btn"
            :class="{ disabled: addablePreset.length === 0 }"
            @click="onManageLangClick"
          >
            管理语种
          </span>
        </div>
        <div v-if="localTranslations.length === 0" class="lang-empty"
          >暂无语种，请点击「管理语种」添加</div
        >
        <div v-else class="lang-chips">
          <div
            v-for="t in localTranslations"
            :key="t.id"
            class="lang-chip"
            role="button"
            tabindex="0"
            :class="{ 'is-selected': t.selected, 'is-editor': editorLang?.id === t.id }"
            @click="toggleLangChipSelect(t)"
            @keydown.enter.prevent="toggleLangChipSelect(t)"
          >
            <span class="chip-code">{{ t.langCode }}</span>
            <span v-if="t.selected" class="chip-mark">✓</span>
            <button
              type="button"
              class="chip-remove"
              title="从列表移除"
              @click.stop="removeLangChip(t)"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="config-actions">
        <el-button class="btn-full teal" @click="executeAll">全部执行译化</el-button>
        <el-button class="btn-full secondary" @click="executeSelected">选中语种重译</el-button>
      </div>
    </div>

    <!-- Middle: translation list -->
    <div class="translation-list">
      <!-- Search & filter -->
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索语言..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-select v-model="statusFilter" class="tm-select status-select">
          <el-option
            v-for="opt in STATUS_OPTIONS"
            :key="opt.value"
            :value="opt.value"
            :label="'状态：' + opt.label"
          />
        </el-select>
        <label class="check-all">
          <el-checkbox v-model="selectAll" />
          <span>全选</span>
        </label>
      </div>

      <!-- Column headers -->
      <div class="list-header">
        <span class="col-check" />
        <span class="col-lang">语言</span>
        <span class="col-status">译文状态</span>
        <span class="col-chars">字符监测</span>
        <span class="col-ops">操作</span>
      </div>

      <!-- Rows -->
      <TransitionGroup name="row-fade" tag="div" class="list-rows">
        <div
          v-for="t in filteredTranslations"
          :key="t.id"
          class="list-row"
          :class="{
            'is-selected': t.selected,
            'is-over': t.status === 'over_limit',
            'is-active': editorLang?.id === t.id
          }"
          @click="onListRowClick(t, $event)"
        >
          <span class="col-check" @click.stop>
            <el-checkbox v-model="t.selected" @change="syncTranslationsToParent" />
          </span>
          <span class="col-lang">{{ t.lang }} ({{ t.langCode }})</span>
          <span class="col-status">
            <span v-if="t.status === 'completed'" class="status-badge completed">已完成</span>
            <span v-else-if="t.status === 'over_limit'" class="status-badge over-limit"
              >超限警告</span
            >
            <span v-else-if="t.status === 'translating'" class="status-badge translating">
              <span class="spin">⟳</span> 译化中
            </span>
            <span v-else class="status-badge pending">待执行</span>
          </span>
          <span class="col-chars">
            <template v-if="t.status !== 'pending' && t.status !== 'translating'">
              <span :class="'cc-' + charStatus(t.appNameCount, t.appNameLimit)"
                >App:{{ t.appNameCount }}/{{ t.appNameLimit }}</span
              >
              <span v-if="charStatus(t.appNameCount, t.appNameLimit) === 'ok'" class="tick">✓</span>
              <span v-else class="cross">✗</span>
              &nbsp;
              <span :class="'cc-' + charStatus(t.shortDescCount, t.shortDescLimit)"
                >Short:{{ t.shortDescCount }}/{{ t.shortDescLimit }}</span
              >
              <span v-if="charStatus(t.shortDescCount, t.shortDescLimit) === 'ok'" class="tick"
                >✓</span
              >
              <span v-else class="warn-tri">▲</span>
              &nbsp;
              <span :class="'cc-' + charStatus(t.fullDescCount, t.fullDescLimit)"
                >Full:{{ t.fullDescCount }}/{{ t.fullDescLimit }}</span
              >
              <span v-if="charStatus(t.fullDescCount, t.fullDescLimit) === 'ok'" class="tick"
                >✓</span
              >
              <span v-else class="warn-tri">▲</span>
            </template>
            <span v-else class="dim">-</span>
          </span>
          <span class="col-ops">
            <template v-if="t.status === 'translating'">
              <el-button size="small" class="op-btn danger" @click="t.status = 'pending'"
                >取消</el-button
              >
            </template>
            <template v-else-if="t.status === 'pending'">
              <el-button size="small" class="op-btn teal" @click="translateSingle(t)"
                >执行</el-button
              >
            </template>
            <template v-else>
              <el-button
                size="small"
                class="op-btn"
                :class="{ 'over-warn': t.status === 'over_limit' }"
                @click="openEditor(t)"
                >编辑</el-button
              >
              <el-button
                size="small"
                class="op-btn"
                :class="{ 'over-warn': t.status === 'over_limit' }"
                @click="translateSingle(t)"
                >重译</el-button
              >
            </template>
          </span>
        </div>
      </TransitionGroup>

      <!-- Bottom action bar -->
      <div class="list-footer">
        <div class="footer-left">
          <el-checkbox v-model="selectAll" />
          已选 {{ selectedCount }} 种
          <el-button
            v-if="selectedCount > 0"
            size="small"
            class="op-btn teal"
            @click="executeSelected"
            >批量重译</el-button
          >
          <el-button v-if="selectedCount > 0" size="small" class="op-btn" @click="exportSelected"
            >批量导出</el-button
          >
        </div>
        <div class="footer-right">
          已完成 <span class="hl-teal">{{ completedCount }}</span
          >/{{ localTranslations.length }} 种语言
          <span v-if="overLimitCount" class="hl-warn">超限 {{ overLimitCount }} 种</span>
          待执行 {{ localTranslations.filter((t) => t.status === 'pending').length }} 种
        </div>
      </div>
    </div>

    <!-- Right: translation editor -->
    <Transition name="slide-left">
      <div v-if="editorLang" class="translation-editor">
        <div class="editor-header">
          <span class="editor-title">译文编辑器</span>
          <div class="lang-badge">编辑译文 {{ editorLang.lang }} ({{ editorLang.langCode }})</div>
          <span class="close-btn" @click="closeEditor">✕</span>
        </div>

        <!-- Toggle reference -->
        <details class="ref-toggle">
          <summary>原文参考 ▾</summary>
          <div class="ref-content">
            <div class="ref-row"><b>App name:</b> {{ appContent.appName }}</div>
            <div class="ref-row"><b>Short:</b> {{ appContent.shortDesc }}</div>
          </div>
        </details>

        <!-- App name -->
        <div class="editor-field">
          <div class="ef-label">
            App name 标题
            <span class="ef-count" :class="'cc-' + charStatus(editNameCount, 30)"
              >{{ editNameCount }} / 30</span
            >
            <span v-if="editNameCount <= 30" class="ef-ok" />
          </div>
          <el-input v-model="editingName" class="tm-input" :maxlength="35" />
          <div class="ef-limit-bar">
            <div
              class="ef-limit-fill"
              :style="{
                width: Math.min((editNameCount / 30) * 100, 100) + '%',
                background: editNameCount > 30 ? '#f85149' : '#3de8c4'
              }"
            />
          </div>
        </div>

        <!-- Short desc -->
        <div class="editor-field">
          <div class="ef-label">
            Short description 短描述
            <span class="ef-count" :class="'cc-' + charStatus(editShortCount, 80)"
              >{{ editShortCount }} / 80</span
            >
          </div>
          <el-input v-model="editingShort" class="tm-input" :maxlength="85" />
        </div>

        <!-- Full desc -->
        <div class="editor-field full-field">
          <div class="ef-label">
            Full description 长描述
            <span class="ef-count" :class="'cc-' + charStatus(editFullCount, 4000)"
              >{{ editFullCount }} / 4000</span
            >
          </div>
          <el-input v-model="editingFull" type="textarea" :rows="8" class="tm-input" />
        </div>

        <!-- AI suggestion -->
        <div v-if="editorLang.aiSuggestion" class="ai-suggestion">
          <span class="ai-icon">✦</span>
          <span>AI建议：{{ editorLang.aiSuggestion }}</span>
        </div>

        <!-- Actions -->
        <div class="editor-actions">
          <el-button class="btn-primary-sm" @click="saveEdit">保存修改</el-button>
          <el-button class="btn-secondary-sm" @click="discardEdit">放弃修改</el-button>
          <el-button class="btn-ghost-sm" @click="translateSingle(editorLang!)">重新生成</el-button>
        </div>
      </div>
    </Transition>

    <el-dialog
      v-model="langManageVisible"
      title="管理语种"
      width="400px"
      class="tm-lang-dialog"
      append-to-body
      destroy-on-close
      @open="addLangCode = addablePreset[0]?.code ?? ''"
    >
      <p class="lang-dialog-hint">添加需要参与译化的语种（与中间列表一一对应）</p>
      <el-select
        v-model="addLangCode"
        filterable
        placeholder="选择语言"
        class="lang-dialog-select"
        style="width: 100%"
      >
        <el-option
          v-for="o in addablePreset"
          :key="o.code"
          :value="o.code"
          :label="`${o.lang} (${o.code})`"
        />
      </el-select>
      <p v-if="addablePreset.length === 0" class="lang-dialog-empty">当前预设语种均已添加</p>
      <template #footer>
        <el-button round @click="langManageVisible = false">取消</el-button>
        <el-button
          round
          type="primary"
          :disabled="addablePreset.length === 0"
          @click="confirmAddLang"
        >
          添加
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .auto-fill {
    display: grid;
    flex: 1;
    grid-template-rows: minmax(0, 1fr);
    grid-template-columns: 300px 1fr auto;
    align-items: stretch;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  // ─── Config panel ─────────────────────────────────────────────────────────────
  .config-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    padding: 16px;
    overflow: hidden auto;
    border-right: 1px solid #30363d;

    .section-title {
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: 600;
      color: #e6edf3;
    }
  }

  .config-block {
    padding: 12px;
    margin-bottom: 10px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;

    .block-label {
      margin-bottom: 8px;
      font-size: 12px;
      font-weight: 500;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .block-label-row {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;

      .block-label {
        margin-bottom: 0;
      }

      .lang-count {
        font-size: 11px;
        color: #8b949e;
      }
    }
  }

  .app-info-row {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    .app-name {
      font-size: 12px;
      color: #e6edf3;
    }

    .platform-badge {
      padding: 2px 7px;
      font-size: 10px;
      font-weight: 500;
      border-radius: 4px;

      &.gplay {
        color: #34c759;
        background: rgb(52 199 89 / 15%);
        border: 1px solid rgb(52 199 89 / 30%);
      }
    }
  }

  .prompt-preview {
    p {
      display: -webkit-box;
      margin: 0;
      overflow: hidden;
      font-size: 11px;
      line-height: 1.5;
      color: #8b949e;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }
  }

  .link-btn {
    margin-top: 6px;
    font-size: 11px;
    color: #3de8c4;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .mt8 {
    margin-top: 8px;
  }

  .model-list {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .model-option {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: 13px;
      color: #8b949e;
      cursor: pointer;
      transition: color 0.2s;

      input {
        display: none;
      }

      .radio-dot {
        width: 14px;
        height: 14px;
        border: 2px solid #30363d;
        border-radius: 50%;
        transition: all 0.2s;
      }

      &.active {
        color: #e6edf3;

        .radio-dot {
          background: #3de8c4;
          border-color: #3de8c4;
          box-shadow: 0 0 0 3px rgb(61 232 196 / 15%);
        }
      }
    }
  }

  .lang-empty {
    padding: 8px 0;
    font-size: 12px;
    color: #8b949e;
  }

  .lang-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .lang-chip {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      padding: 4px 6px 4px 8px;
      font-size: 11px;
      color: #8b949e;
      cursor: pointer;
      background: rgb(61 232 196 / 6%);
      border: 1px solid #30363d;
      border-radius: 6px;
      outline: none;
      transition:
        border-color 0.15s,
        background 0.15s;

      &:hover {
        background: rgb(61 232 196 / 10%);
        border-color: #484f58;
      }

      &.is-selected {
        color: #3de8c4;
        background: rgb(61 232 196 / 12%);
        border-color: rgb(61 232 196 / 45%);
      }

      &.is-editor {
        box-shadow: 0 0 0 1px rgb(61 232 196 / 35%);
      }

      .chip-code {
        font-family: 'SF Mono', ui-monospace, monospace;
        font-weight: 500;
      }

      .chip-mark {
        font-size: 10px;
        color: #3fb950;
      }

      .chip-remove {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        padding: 0;
        margin: 0 -2px 0 0;
        font-size: 14px;
        line-height: 1;
        color: #8b949e;
        cursor: pointer;
        background: transparent;
        border: none;
        border-radius: 4px;
        transition:
          color 0.15s,
          background 0.15s;

        &:hover {
          color: #f85149;
          background: rgb(248 81 73 / 12%);
        }
      }
    }
  }

  .lang-block .block-label-row .link-btn {
    margin-top: 0;
    margin-left: auto;

    &.disabled {
      color: #484f58;
      pointer-events: auto;
      cursor: not-allowed;

      &:hover {
        text-decoration: none;
      }
    }
  }

  .lang-dialog-hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: #8b949e;
  }

  .lang-dialog-empty {
    margin: 10px 0 0;
    font-size: 12px;
    color: #d29922;
  }

  .lang-block {
    flex-shrink: 0;
  }

  .config-actions {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 8px;
    margin-top: 4px;
  }

  :deep(.btn-full) {
    width: 100%;
    height: 36px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 8px;

    &.teal {
      color: #3de8c4 !important;
      background: rgb(61 232 196 / 12%) !important;
      border: 1px solid rgb(61 232 196 / 30%) !important;

      &:hover {
        background: rgb(61 232 196 / 20%) !important;
      }
    }

    &.secondary {
      color: #8b949e !important;
      background: transparent !important;
      border: 1px solid #30363d !important;

      &:hover {
        color: #e6edf3 !important;
        border-color: #484f58 !important;
      }
    }
  }

  :deep(.tm-select .el-input__wrapper) {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    box-shadow: none !important;

    .el-input__inner {
      font-size: 13px;
      color: #e6edf3;
    }
  }

  :deep(.full-width) {
    width: 100%;
  }

  // ─── Translation list ─────────────────────────────────────────────────────────
  .translation-list {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border-right: 1px solid #30363d;
  }

  .list-toolbar {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #30363d;

    .check-all {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      color: #8b949e;
      cursor: pointer;
    }
  }

  :deep(.search-input) {
    flex: 1;

    .el-input__wrapper {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover,
      &.is-focus {
        border-color: #3de8c4 !important;
      }

      input {
        font-size: 13px;
        color: #e6edf3;

        &::placeholder {
          color: #484f58;
        }
      }

      .el-input__prefix {
        color: #8b949e;
      }
    }
  }

  :deep(.status-select) {
    width: 130px;

    .el-input__wrapper {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      box-shadow: none !important;

      .el-input__inner {
        font-size: 12px;
        color: #e6edf3;
      }
    }
  }

  .list-header {
    display: grid;
    flex-shrink: 0;
    grid-template-columns: 36px 150px 90px 1fr 120px;
    align-items: center;
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 500;
    color: #8b949e;
    background: #161b22;
    border-bottom: 1px solid #30363d;
  }

  .list-rows {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .list-row {
    display: grid;
    grid-template-columns: 36px 150px 90px 1fr 120px;
    align-items: center;
    padding: 10px 16px;
    font-size: 12px;
    cursor: pointer;
    border-bottom: 1px solid #1c2130;
    transition: background 0.15s;

    &:hover {
      background: #1c2130;
    }

    &.is-selected {
      background: rgb(61 232 196 / 4%);
    }

    &.is-active {
      background: rgb(61 232 196 / 8%);
      border-left: 2px solid #3de8c4;
    }

    &.is-over {
      border-left: 2px solid #d29922;
    }
  }

  .col-lang {
    font-size: 13px;
    font-weight: 500;
    color: #e6edf3;
  }

  .status-badge {
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &.completed {
      color: #3fb950;
      background: rgb(63 185 80 / 15%);
    }

    &.over-limit {
      color: #d29922;
      background: rgb(210 153 34 / 15%);
    }

    &.translating {
      color: #3de8c4;
      background: rgb(61 232 196 / 12%);
      animation: pulse-badge 1.5s infinite;
    }

    &.pending {
      color: #8b949e;
      background: rgb(139 148 158 / 10%);
    }
  }

  @keyframes pulse-badge {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.6;
    }
  }

  .spin {
    display: inline-block;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .col-chars {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: center;
    font-size: 11px;
    color: #8b949e;
  }

  .cc-ok {
    color: #8b949e;
  }

  .cc-warn {
    color: #d29922;
  }

  .cc-error {
    color: #f85149;
  }

  .tick {
    color: #3fb950;
  }

  .cross {
    color: #f85149;
  }

  .warn-tri {
    color: #d29922;
  }

  .dim {
    color: #484f58;
  }

  .col-ops {
    display: flex;
    gap: 4px;
  }

  :deep(.op-btn) {
    height: 24px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
    color: #8b949e !important;
    background: transparent !important;
    border: 1px solid #30363d !important;
    border-radius: 4px !important;

    &:hover {
      color: #e6edf3 !important;
      border-color: #484f58 !important;
    }

    &.teal {
      color: #3de8c4 !important;
      border-color: rgb(61 232 196 / 30%) !important;

      &:hover {
        background: rgb(61 232 196 / 10%) !important;
      }
    }

    &.danger {
      color: #f85149 !important;
      border-color: rgb(248 81 73 / 30%) !important;

      &:hover {
        background: rgb(248 81 73 / 10%) !important;
      }
    }

    &.over-warn {
      color: #d29922 !important;
      border-color: rgb(210 153 34 / 30%) !important;
    }
  }

  .list-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    font-size: 12px;
    color: #8b949e;
    background: #161b22;
    border-top: 1px solid #30363d;

    .footer-left {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .hl-teal {
      font-weight: 600;
      color: #3de8c4;
    }

    .hl-warn {
      margin-left: 8px;
      color: #d29922;
    }
  }

  // ─── Translation editor ───────────────────────────────────────────────────────
  .translation-editor {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 340px;
    min-height: 0;
    padding: 16px;
    overflow: hidden auto;
    background: #0d1117;
  }

  .editor-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;

    .editor-title {
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: #e6edf3;
    }

    .lang-badge {
      padding: 3px 8px;
      font-size: 11px;
      color: #3de8c4;
      background: rgb(61 232 196 / 10%);
      border: 1px solid rgb(61 232 196 / 20%);
      border-radius: 4px;
    }

    .close-btn {
      font-size: 14px;
      color: #8b949e;
      cursor: pointer;

      &:hover {
        color: #f85149;
      }
    }
  }

  .ref-toggle {
    padding: 8px 12px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 6px;

    summary {
      font-size: 12px;
      color: #8b949e;
      cursor: pointer;
      user-select: none;
    }

    .ref-content {
      margin-top: 6px;
    }

    .ref-row {
      margin-bottom: 4px;
      font-size: 11px;
      color: #8b949e;

      b {
        color: #e6edf3;
      }
    }
  }

  .editor-field {
    .ef-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 12px;
      color: #8b949e;

      .ef-count {
        font-size: 11px;

        &.cc-ok {
          color: #3fb950;
        }

        &.cc-warn {
          color: #d29922;
        }

        &.cc-error {
          color: #f85149;
        }
      }

      .ef-ok {
        display: inline-block;
        width: 10px;
        height: 10px;
        background: #3fb950;
        border-radius: 50%;
      }
    }

    .ef-limit-bar {
      height: 2px;
      margin-top: 4px;
      overflow: hidden;
      background: #30363d;
      border-radius: 1px;

      .ef-limit-fill {
        height: 100%;
        border-radius: 1px;
        transition: width 0.3s;
      }
    }
  }

  :deep(.tm-input .el-input__wrapper),
  :deep(.tm-input .el-textarea__inner) {
    font-size: 13px;
    color: #e6edf3;
    caret-color: #3de8c4;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    box-shadow: none !important;
    transition: border-color 0.2s;

    &:hover {
      border-color: #484f58;
    }

    &:focus {
      border-color: #3de8c4;
    }

    &::placeholder {
      color: #484f58;
    }
  }

  .ai-suggestion {
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.5;
    color: #8b949e;
    background: rgb(61 232 196 / 6%);
    border: 1px solid rgb(61 232 196 / 20%);
    border-radius: 8px;

    .ai-icon {
      flex-shrink: 0;
      font-size: 14px;
      color: #3de8c4;
    }
  }

  .editor-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  :deep(.btn-primary-sm) {
    height: 32px;
    font-size: 12px;
    font-weight: 600;
    color: #0d1117 !important;
    background: #3de8c4 !important;
    border: none !important;
    border-radius: 6px;

    &:hover {
      background: #5af0d0 !important;
    }
  }

  :deep(.btn-secondary-sm) {
    height: 32px;
    font-size: 12px;
    color: #8b949e !important;
    background: transparent !important;
    border: 1px solid #30363d !important;
    border-radius: 6px;

    &:hover {
      color: #e6edf3 !important;
    }
  }

  :deep(.btn-ghost-sm) {
    height: 32px;
    padding: 0 8px !important;
    font-size: 12px;
    color: #8b949e !important;
    background: transparent !important;
    border: none !important;

    &:hover {
      color: #3de8c4 !important;
    }
  }

  // ─── Animations ───────────────────────────────────────────────────────────────
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: all 0.25s ease;
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(20px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  .slide-down-enter-active,
  .slide-down-leave-active {
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .slide-down-enter-to {
    max-height: 200px;
    opacity: 1;
  }

  .row-fade-enter-active,
  .row-fade-leave-active {
    transition: all 0.2s ease;
  }

  .row-fade-enter-from,
  .row-fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }
</style>
