<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { AppContent, Translation } from './types'
  import { fetchTranslationsExport, fetchTranslationsImport } from './api/text-management'

  const props = defineProps<{
    appContent: AppContent
    translations: Translation[]
  }>()

  const emit = defineEmits<{
    'update:translations': [val: Translation[]]
  }>()

  type Platform = 'google_play' | 'app_store' | 'huawei'
  type FilterTab = 'all' | 'completed' | 'over_limit' | 'pending'
  type ExportFormat = 'xlsx' | 'csv' | 'json'
  type ExportScope = 'completed' | 'selected' | 'custom'

  // ─── 本地可编辑副本（与自动填充页一致，通过 emit 同步父级）────────────────────────
  const localTranslations = ref<Translation[]>(JSON.parse(JSON.stringify(props.translations)))
  const selectedLang = ref<Translation | null>(localTranslations.value[0] ?? null)

  watch(
    () => props.translations,
    () => {
      localTranslations.value = JSON.parse(JSON.stringify(props.translations))
      const sid = selectedLang.value?.id
      const found = sid ? localTranslations.value.find((t) => t.id === sid) : undefined
      selectedLang.value = found ?? localTranslations.value[0] ?? null
    },
    { deep: true }
  )

  const emitTranslations = () => emit('update:translations', [...localTranslations.value])

  // ─── Language list ────────────────────────────────────────────────────────────
  const searchLang = ref('')
  const filterTab = ref<FilterTab>('all')

  const filteredLangs = computed(() => {
    return localTranslations.value.filter((t) => {
      const matchSearch =
        searchLang.value === '' ||
        t.lang.includes(searchLang.value) ||
        t.langCode.toLowerCase().includes(searchLang.value.toLowerCase())

      const matchTab =
        filterTab.value === 'all'
          ? true
          : filterTab.value === 'completed'
            ? t.status === 'completed'
            : filterTab.value === 'over_limit'
              ? t.status === 'over_limit'
              : t.status === 'pending' || t.status === 'translating'

      return matchSearch && matchTab
    })
  })

  const tabCounts = computed(() => ({
    all: localTranslations.value.length,
    completed: localTranslations.value.filter((t) => t.status === 'completed').length,
    over_limit: localTranslations.value.filter((t) => t.status === 'over_limit').length,
    pending: localTranslations.value.filter(
      (t) => t.status === 'pending' || t.status === 'translating'
    ).length
  }))

  // ─── Preview UI ───────────────────────────────────────────────────────────────
  const selectedPlatform = ref<Platform>('google_play')
  const fullscreenPreviewVisible = ref(false)
  const previewCardRef = ref<HTMLElement | null>(null)

  const previewAppName = computed({
    get: () => selectedLang.value?.appName ?? '',
    set: (v: string) => {
      if (!selectedLang.value) return
      selectedLang.value.appName = v
      selectedLang.value.appNameCount = v.length
      emitTranslations()
    }
  })

  const previewShortDesc = computed({
    get: () => selectedLang.value?.shortDesc ?? '',
    set: (v: string) => {
      if (!selectedLang.value) return
      selectedLang.value.shortDesc = v
      selectedLang.value.shortDescCount = v.length
      emitTranslations()
    }
  })

  const previewFullDesc = computed({
    get: () => selectedLang.value?.fullDesc ?? '',
    set: (v: string) => {
      if (!selectedLang.value) return
      selectedLang.value.fullDesc = v
      selectedLang.value.fullDescCount = v.length
      emitTranslations()
    }
  })

  const focusPreviewFirstInput = () => {
    nextTick(() => {
      previewCardRef.value?.querySelector<HTMLInputElement>('.preview-input')?.focus()
    })
  }

  const openFullscreenPreview = () => {
    if (!selectedLang.value) {
      ElMessage.warning('请先选择一种语言')
      return
    }
    fullscreenPreviewVisible.value = true
  }

  const selectLang = (t: Translation) => {
    selectedLang.value = t
  }

  // Selected for export
  const selectForExport = ref(new Set<string>())
  const toggleExportSelect = (id: string) => {
    if (selectForExport.value.has(id)) selectForExport.value.delete(id)
    else selectForExport.value.add(id)
  }

  const selectAll = () => {
    filteredLangs.value.forEach((t) => selectForExport.value.add(t.id))
  }
  const clearSelect = () => {
    selectForExport.value.clear()
  }

  const onFooterSelectAllChange = (val: string | number | boolean) => {
    if (val) selectAll()
    else clearSelect()
  }

  // ─── Platform config ──────────────────────────────────────────────────────────
  const PLATFORMS = [
    { key: 'google_play' as Platform, label: 'Google Play', icon: '▶' },
    { key: 'app_store' as Platform, label: 'App Store', icon: '🍎' },
    { key: 'huawei' as Platform, label: 'Huawei', icon: '🌺' }
  ]

  const platformLimits = {
    google_play: { appName: 30, shortDesc: 80, fullDesc: 4000 },
    app_store: { appName: 30, shortDesc: 100, fullDesc: 4000 },
    huawei: { appName: 30, shortDesc: 80, fullDesc: 4000 }
  }

  const currentLimits = computed(() => platformLimits[selectedPlatform.value])

  // ─── Export ───────────────────────────────────────────────────────────────────
  const exportFormat = ref<ExportFormat>('xlsx')
  const exportScope = ref<ExportScope>('completed')
  const customLangs = ref<string[]>(['zh-CN', 'ja', 'ko'])

  const exportFormatOptions: { value: ExportFormat; label: string }[] = [
    { value: 'xlsx', label: 'Excel (.xlsx)' },
    { value: 'csv', label: 'CSV (.csv)' },
    { value: 'json', label: 'JSON' }
  ]

  const doExport = async () => {
    const langs =
      exportScope.value === 'completed'
        ? localTranslations.value.filter((t) => t.status === 'completed')
        : exportScope.value === 'selected'
          ? localTranslations.value.filter((t) => selectForExport.value.has(t.id))
          : localTranslations.value.filter((t) => customLangs.value.includes(t.langCode))
    try {
      const res = await fetchTranslationsExport({
        format: exportFormat.value,
        scope: exportScope.value,
        langCodes: langs.map((t) => t.langCode)
      })
      ElMessage.success(`导出任务已生成：${res.fileName}`)
    } catch {
      ElMessage.error('导出失败，请检查接口后重试')
    }
  }

  // ─── Import ───────────────────────────────────────────────────────────────────
  const importDragOver = ref(false)
  const importFileRef = ref<HTMLInputElement | null>(null)

  const onImportDrop = (e: DragEvent) => {
    importDragOver.value = false
    const file = e.dataTransfer?.files[0]
    if (file) handleImportFile(file)
  }

  const onImportChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) handleImportFile(file)
  }

  const handleImportFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['xlsx', 'csv', 'json'].includes(ext || '')) {
      ElMessage.error('仅支持 .xlsx .csv .json 格式')
      return
    }
    const payload = await file.text()
    try {
      const res = await fetchTranslationsImport({
        fileName: file.name,
        fileType: ext || 'json',
        payload
      })
      localTranslations.value = JSON.parse(JSON.stringify(res.translations))
      selectedLang.value = localTranslations.value[0] ?? null
      emitTranslations()
      ElMessage.success(`导入成功：${res.importedCount} 条，覆盖 ${res.overwrittenCount} 条`)
    } catch {
      ElMessage.error('导入失败，请检查接口后重试')
    }
  }

  // ─── Preview helpers ──────────────────────────────────────────────────────────
  const charStatus = (count: number, limit: number) =>
    count > limit ? 'error' : count > limit * 0.9 ? 'warn' : 'ok'

  // Task summary
  const taskSummary = computed(() => {
    const total = Math.max(1, localTranslations.value.length)
    return {
      appName: props.appContent.appName || '--',
      store: PLATFORMS.find((p) => p.key === selectedPlatform.value)?.label || '--',
      progress: tabCounts.value.completed,
      total: localTranslations.value.length,
      percent: Math.round((tabCounts.value.completed / total) * 100),
      overLimit: tabCounts.value.over_limit,
      lastSaved: '--'
    }
  })
</script>

<template>
  <div class="preview-framework">
    <!-- Left: language list -->
    <div class="lang-panel">
      <div class="panel-header">
        <span class="panel-title">语言列表</span>
        <span class="total-count">{{ localTranslations.length }} 种语言</span>
      </div>

      <!-- Search -->
      <div class="lang-search">
        <el-input
          v-model="searchLang"
          placeholder="搜索语言..."
          prefix-icon="Search"
          clearable
          class="search-input"
        />
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <div
          v-for="tab in [
            { key: 'all', label: '全部' },
            { key: 'completed', label: `已完成${tabCounts.completed}` },
            { key: 'over_limit', label: `超限${tabCounts.over_limit}` },
            { key: 'pending', label: `待完成${tabCounts.pending}` }
          ]"
          :key="tab.key"
          class="filter-tab"
          :class="{
            active: filterTab === tab.key,
            'warn-tab': tab.key === 'over_limit' && tabCounts.over_limit > 0
          }"
          @click="filterTab = tab.key as FilterTab"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- Language items -->
      <div class="lang-list">
        <TransitionGroup name="row-fade">
          <div
            v-for="t in filteredLangs"
            :key="t.id"
            class="lang-item"
            :class="{
              'is-selected': selectedLang?.id === t.id,
              'is-over': t.status === 'over_limit',
              'is-pending': t.status === 'pending'
            }"
            @click="selectLang(t)"
          >
            <div class="lang-radio">
              <span class="radio-circle" :class="{ filled: selectedLang?.id === t.id }" />
            </div>
            <div class="lang-info">
              <span class="lang-name">{{ t.lang }} {{ t.langCode }}</span>
            </div>
            <div class="lang-status">
              <span
                class="status-dot"
                :class="
                  t.status === 'completed' ? 'green' : t.status === 'over_limit' ? 'orange' : 'gray'
                "
              />
            </div>
            <div class="lang-checkbox">
              <el-checkbox
                :model-value="selectForExport.has(t.id)"
                @change="toggleExportSelect(t.id)"
                @click.stop
              />
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Select all footer -->
      <div class="lang-footer">
        <label class="check-row">
          <el-checkbox
            :model-value="selectForExport.size === filteredLangs.length && filteredLangs.length > 0"
            @change="onFooterSelectAllChange"
          />
          <span>全选</span>
        </label>
        <span class="sel-count">已选 {{ selectForExport.size }} 种</span>
        <el-button
          v-if="selectForExport.size > 0"
          size="small"
          class="op-btn-teal"
          @click="doExport"
        >
          导出已选
        </el-button>
      </div>
    </div>

    <!-- Middle: store preview -->
    <div class="preview-panel">
      <!-- Platform switcher -->
      <div class="platform-tabs">
        <div
          v-for="p in PLATFORMS"
          :key="p.key"
          class="platform-tab"
          :class="{ active: selectedPlatform === p.key }"
          @click="selectedPlatform = p.key"
        >
          <span class="p-icon">{{ p.icon }}</span>
          {{ p.label }}
        </div>
        <div class="platform-lang-indicator">
          语言 shown:
          <span class="lang-label">{{ selectedLang?.lang }} ({{ selectedLang?.langCode }})</span>
          <span class="switch-lang" @click="filterTab = 'all'">切换语言</span>
        </div>
      </div>

      <!-- Preview card -->
      <div ref="previewCardRef" class="preview-card">
        <div class="preview-card-header">
          Default - {{ selectedLang?.lang }} ({{ selectedLang?.langCode }})
        </div>

        <div v-if="!selectedLang" class="preview-empty">请从左侧选择一种语言</div>

        <div v-else class="preview-fields">
          <!-- App name -->
          <div class="preview-field">
            <label>App name 标题 <span class="required">*</span></label>
            <div
              class="preview-input-wrap"
              :class="{ over: (selectedLang?.appNameCount || 0) > currentLimits.appName }"
            >
              <input
                v-model="previewAppName"
                class="preview-input"
                maxlength="35"
                autocomplete="off"
              />
              <span class="preview-status-icon">
                <span
                  v-if="(selectedLang?.appNameCount || 0) <= currentLimits.appName"
                  class="ok-badge"
                />
              </span>
            </div>
            <div
              class="preview-char-count"
              :class="charStatus(selectedLang?.appNameCount || 0, currentLimits.appName)"
            >
              {{ selectedLang?.appNameCount || 0 }} / {{ currentLimits.appName }}
            </div>
          </div>

          <!-- Short description -->
          <div class="preview-field">
            <label>Short description 短描述 <span class="required">*</span></label>
            <div
              class="preview-input-wrap"
              :class="{ over: (selectedLang?.shortDescCount || 0) > currentLimits.shortDesc }"
            >
              <input
                v-model="previewShortDesc"
                class="preview-input"
                maxlength="120"
                autocomplete="off"
              />
              <span class="preview-status-icon">
                <span
                  v-if="(selectedLang?.shortDescCount || 0) <= currentLimits.shortDesc"
                  class="ok-badge"
                />
              </span>
            </div>
            <div
              class="preview-char-count"
              :class="charStatus(selectedLang?.shortDescCount || 0, currentLimits.shortDesc)"
            >
              {{ selectedLang?.shortDescCount || 0 }} / {{ currentLimits.shortDesc }}
            </div>
          </div>

          <!-- Full description -->
          <div class="preview-field full-field">
            <label>Full description 长描述 <span class="required">*</span></label>
            <div
              class="preview-textarea-wrap"
              :class="{ over: (selectedLang?.fullDescCount || 0) > currentLimits.fullDesc }"
            >
              <textarea
                v-model="previewFullDesc"
                class="preview-textarea"
                :maxlength="currentLimits.fullDesc + 200"
                rows="10"
                spellcheck="false"
              />
              <span class="preview-status-icon top-right">
                <span
                  v-if="(selectedLang?.fullDescCount || 0) <= currentLimits.fullDesc"
                  class="ok-badge"
                />
              </span>
            </div>
            <div
              class="preview-char-count"
              :class="charStatus(selectedLang?.fullDescCount || 0, currentLimits.fullDesc)"
            >
              {{ selectedLang?.fullDescCount || 0 }} / {{ currentLimits.fullDesc }}
            </div>
          </div>
        </div>

        <div class="preview-footer">
          <span class="preview-action" role="button" tabindex="0" @click="focusPreviewFirstInput">
            ✏️ 聚焦到输入框
          </span>
          <span class="preview-action" role="button" tabindex="0" @click="openFullscreenPreview">
            ⛶ 全屏预览
          </span>
        </div>
      </div>
    </div>

    <!-- Right: import/export panel -->
    <div class="io-panel">
      <!-- Export section -->
      <div class="io-section">
        <div class="io-title">1. 导出译文</div>
        <div class="io-sub">选择要导出的语种和格式</div>

        <!-- Format -->
        <div class="radio-group">
          <label
            v-for="fmt in exportFormatOptions"
            :key="fmt.value"
            class="radio-option"
            :class="{ active: exportFormat === fmt.value }"
          >
            <input v-model="exportFormat" type="radio" :value="fmt.value" />
            <span class="radio-dot" />
            <span>{{ fmt.label }}</span>
          </label>
        </div>

        <!-- Scope -->
        <div class="io-sub mt10">导出范围：</div>
        <div class="radio-group">
          <label class="radio-option" :class="{ active: exportScope === 'completed' }">
            <input v-model="exportScope" type="radio" value="completed" />
            <span class="radio-dot" />
            <span>已完成的语种 ({{ tabCounts.completed }}种)</span>
          </label>
          <label class="radio-option" :class="{ active: exportScope === 'selected' }">
            <input v-model="exportScope" type="radio" value="selected" />
            <span class="radio-dot" />
            <span>已选语种 ({{ selectForExport.size }}种)</span>
          </label>
          <label class="radio-option" :class="{ active: exportScope === 'custom' }">
            <input v-model="exportScope" type="radio" value="custom" />
            <span class="radio-dot" />
            <span>自定义选择</span>
          </label>
        </div>

        <!-- Custom lang tags -->
        <Transition name="slide-down">
          <div v-if="exportScope === 'custom'" class="custom-lang-tags">
            <span v-for="lc in customLangs" :key="lc" class="custom-tag">
              {{ lc }}
              <span @click="customLangs = customLangs.filter((x) => x !== lc)">✕</span>
            </span>
            <span class="add-lang" @click="customLangs.push('en')">+ 添加</span>
          </div>
        </Transition>

        <el-button class="btn-export" @click="doExport">导出译文</el-button>
      </div>

      <!-- Divider -->
      <div class="io-divider" />

      <!-- Import section -->
      <div class="io-section">
        <div class="io-title">2. 导入译文</div>
        <div class="io-sub">将外部译文文件导入并覆盖当前数据</div>

        <!-- Drop zone -->
        <div
          class="drop-zone"
          :class="{ 'drag-over': importDragOver }"
          @dragover.prevent="importDragOver = true"
          @dragleave="importDragOver = false"
          @drop.prevent="onImportDrop"
          @click="importFileRef?.click()"
        >
          <div class="dz-text">拖拽文件到此处，或点击选择</div>
          <div class="dz-hint">支持 .xlsx .csv .json 格式</div>
        </div>
        <input
          ref="importFileRef"
          type="file"
          accept=".xlsx,.csv,.json"
          style="display: none"
          @change="onImportChange"
        />
        <el-button class="btn-secondary-sm mt8" @click="importFileRef?.click()">选择文件</el-button>

        <div class="import-warn"> ⚠ 导入后将覆盖当前译文，请确认后操作 </div>
      </div>

      <!-- Divider -->
      <div class="io-divider" />

      <!-- Task summary -->
      <div class="io-section">
        <div class="io-title">3. 任务概况</div>
        <div class="summary-rows">
          <div class="summary-row"
            ><span>应用：</span><span>{{ taskSummary.appName }}</span></div
          >
          <div class="summary-row"
            ><span>商店：</span><span>{{ taskSummary.store }}</span></div
          >
          <div class="summary-row">
            <span>译化进度：</span>
            <span class="prog-text">{{ taskSummary.progress }}/{{ taskSummary.total }} 种语言</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: taskSummary.percent + '%' }" />
          </div>
          <div class="summary-row pct-row">
            <span />
            <span class="pct">{{ taskSummary.percent }}%</span>
          </div>
          <div class="summary-row">
            <span>超限语种：</span>
            <span class="over-text">{{ taskSummary.overLimit }} 种</span>
          </div>
          <div class="summary-row">
            <span>最后保存：</span>
            <span class="dim">{{ taskSummary.lastSaved }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="fullscreenPreviewVisible"
      fullscreen
      append-to-body
      destroy-on-close
      class="pf-fullscreen-dialog"
      :title="`商店预览 · ${PLATFORMS.find((p) => p.key === selectedPlatform)?.label ?? ''} · ${selectedLang?.lang ?? ''} (${selectedLang?.langCode ?? ''})`"
    >
      <div v-if="selectedLang" class="pf-fs-preview">
        <div class="pf-fs-fields">
          <div class="preview-field">
            <label>App name 标题 <span class="required">*</span></label>
            <div
              class="preview-input-wrap"
              :class="{ over: (selectedLang.appNameCount || 0) > currentLimits.appName }"
            >
              <input
                v-model="previewAppName"
                class="preview-input"
                maxlength="35"
                autocomplete="off"
              />
              <span class="preview-status-icon">
                <span v-if="selectedLang.appNameCount <= currentLimits.appName" class="ok-badge" />
              </span>
            </div>
            <div
              class="preview-char-count"
              :class="charStatus(selectedLang.appNameCount, currentLimits.appName)"
            >
              {{ selectedLang.appNameCount }} / {{ currentLimits.appName }}
            </div>
          </div>
          <div class="preview-field">
            <label>Short description 短描述 <span class="required">*</span></label>
            <div
              class="preview-input-wrap"
              :class="{ over: (selectedLang.shortDescCount || 0) > currentLimits.shortDesc }"
            >
              <input
                v-model="previewShortDesc"
                class="preview-input"
                maxlength="120"
                autocomplete="off"
              />
              <span class="preview-status-icon">
                <span
                  v-if="selectedLang.shortDescCount <= currentLimits.shortDesc"
                  class="ok-badge"
                />
              </span>
            </div>
            <div
              class="preview-char-count"
              :class="charStatus(selectedLang.shortDescCount, currentLimits.shortDesc)"
            >
              {{ selectedLang.shortDescCount }} / {{ currentLimits.shortDesc }}
            </div>
          </div>
          <div class="preview-field full-field">
            <label>Full description 长描述 <span class="required">*</span></label>
            <div
              class="preview-textarea-wrap"
              :class="{ over: (selectedLang.fullDescCount || 0) > currentLimits.fullDesc }"
            >
              <textarea
                v-model="previewFullDesc"
                class="preview-textarea pf-fs-textarea"
                :maxlength="currentLimits.fullDesc + 200"
                rows="16"
                spellcheck="false"
              />
              <span class="preview-status-icon top-right">
                <span
                  v-if="selectedLang.fullDescCount <= currentLimits.fullDesc"
                  class="ok-badge"
                />
              </span>
            </div>
            <div
              class="preview-char-count"
              :class="charStatus(selectedLang.fullDescCount, currentLimits.fullDesc)"
            >
              {{ selectedLang.fullDescCount }} / {{ currentLimits.fullDesc }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .preview-framework {
    display: grid;
    flex: 1;
    grid-template-columns: 260px 1fr 280px;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  // ─── Language panel ────────────────────────────────────────────────────────────
  .lang-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    border-right: 1px solid #30363d;
  }

  .panel-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 14px 16px 10px;

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #e6edf3;
    }

    .total-count {
      font-size: 12px;
      color: #8b949e;
    }
  }

  .lang-search {
    padding: 0 12px 10px;

    :deep(.search-input .el-input__wrapper) {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover,
      &.is-focus {
        border-color: #3de8c4 !important;
      }

      input {
        font-size: 12px;
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

  .filter-tabs {
    display: flex;
    flex-shrink: 0;
    padding: 0 8px;
    border-bottom: 1px solid #30363d;

    .filter-tab {
      flex: 1;
      padding: 7px 4px;
      font-size: 11px;
      color: #8b949e;
      text-align: center;
      white-space: nowrap;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;

      &.active {
        color: #3de8c4;
        border-bottom-color: #3de8c4;
      }

      &.warn-tab {
        color: #d29922;
      }

      &.warn-tab.active {
        border-bottom-color: #d29922;
      }

      &:hover:not(.active) {
        color: #e6edf3;
      }
    }
  }

  .lang-list {
    flex: 1;
    overflow-y: auto;
  }

  .lang-item {
    display: grid;
    grid-template-columns: 24px 1fr 20px 24px;
    gap: 6px;
    align-items: center;
    padding: 9px 12px;
    cursor: pointer;
    border-bottom: 1px solid #1c2130;
    transition: background 0.15s;

    &:hover {
      background: #1c2130;
    }

    &.is-selected {
      background: rgb(61 232 196 / 6%);
    }

    &.is-over {
      border-left: 2px solid #d29922;
    }

    &.is-pending {
      opacity: 0.6;
    }
  }

  .radio-circle {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #30363d;
    border-radius: 50%;
    transition: all 0.2s;

    &.filled {
      background: #3de8c4;
      border-color: #3de8c4;
      box-shadow: 0 0 0 3px rgb(61 232 196 / 12%);
    }
  }

  .lang-name {
    font-size: 12px;
    color: #e6edf3;
  }

  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.green {
      background: #3fb950;
    }

    &.orange {
      background: #d29922;
    }

    &.gray {
      background: #484f58;
    }
  }

  .lang-footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    background: #161b22;
    border-top: 1px solid #30363d;

    .check-row {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 12px;
      color: #8b949e;
      cursor: pointer;
    }

    .sel-count {
      flex: 1;
      font-size: 11px;
      color: #8b949e;
    }
  }

  :deep(.op-btn-teal) {
    height: 26px !important;
    padding: 0 10px !important;
    font-size: 11px !important;
    color: #3de8c4 !important;
    background: rgb(61 232 196 / 10%) !important;
    border: 1px solid rgb(61 232 196 / 30%) !important;
    border-radius: 6px !important;

    &:hover {
      background: rgb(61 232 196 / 20%) !important;
    }
  }

  // ─── Preview panel ────────────────────────────────────────────────────────────
  .preview-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #0d1117;
  }

  .platform-tabs {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    align-items: center;
    padding: 0 16px;
    background: #161b22;
    border-bottom: 1px solid #30363d;

    .platform-tab {
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 10px 14px;
      font-size: 13px;
      color: #8b949e;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;

      &.active {
        color: #3de8c4;
        border-bottom-color: #3de8c4;
      }

      &:hover:not(.active) {
        color: #e6edf3;
      }

      .p-icon {
        font-size: 14px;
      }
    }

    .platform-lang-indicator {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-left: auto;
      font-size: 12px;
      color: #8b949e;

      .lang-label {
        font-weight: 500;
        color: #e6edf3;
      }

      .switch-lang {
        font-size: 11px;
        color: #3de8c4;
        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .preview-card {
    flex: 1;
    margin: 16px;
    overflow-y: auto;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 12px;

    .preview-card-header {
      padding: 14px 20px;
      font-size: 13px;
      font-weight: 500;
      color: #3de8c4;
      border-bottom: 1px solid #30363d;
    }
  }

  .preview-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }

  .preview-field {
    label {
      display: block;
      margin-bottom: 6px;
      font-size: 12px;
      color: #8b949e;

      .required {
        color: #f85149;
      }
    }
  }

  .preview-input-wrap,
  .preview-textarea-wrap {
    position: relative;
    overflow: hidden;
    border: 1px solid #30363d;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #484f58;
    }

    &.over {
      border-color: #f85149;
    }

    .preview-status-icon {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);

      &.top-right {
        top: 12px;
        transform: none;
      }

      .ok-badge {
        position: relative;
        display: block;
        width: 16px;
        height: 16px;
        background: #3fb950;
        border-radius: 50%;

        &::after {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #0d1117;
          content: '✓';
        }
      }
    }
  }

  .preview-empty {
    padding: 24px 20px;
    font-size: 13px;
    color: #8b949e;
    text-align: center;
  }

  .preview-input {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 36px 10px 12px;
    font-family: inherit;
    font-size: 13px;
    color: #e6edf3;
    cursor: text;
    background: transparent;
    border: none;
    outline: none;
  }

  .preview-textarea {
    box-sizing: border-box;
    width: 100%;
    min-height: 160px;
    padding: 10px 36px 10px 12px;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.6;
    color: #e6edf3;
    cursor: text;
    resize: none;
    background: transparent;
    border: none;
    outline: none;
  }

  .pf-fs-preview {
    max-width: 960px;
    padding: 0 8px 24px;
    margin: 0 auto;
  }

  .pf-fs-textarea {
    min-height: 42vh;
  }

  :deep(.pf-fullscreen-dialog.el-dialog) {
    --el-dialog-bg-color: #0d1117;
    --el-dialog-margin-top: 0;
  }

  :deep(.pf-fullscreen-dialog .el-dialog__header) {
    margin-right: 0;
    border-bottom: 1px solid #30363d;
  }

  :deep(.pf-fullscreen-dialog .el-dialog__body) {
    padding-top: 16px;
    background: #0d1117;
  }

  .preview-char-count {
    margin-top: 4px;
    font-size: 11px;
    color: #3de8c4;
    text-align: right;

    &.warn {
      color: #d29922;
    }

    &.error {
      color: #f85149;
    }
  }

  .preview-footer {
    display: flex;
    gap: 16px;
    padding: 12px 20px;
    border-top: 1px solid #30363d;

    .preview-action {
      font-size: 12px;
      color: #8b949e;
      cursor: pointer;
      transition: color 0.2s;

      &:hover {
        color: #3de8c4;
      }
    }
  }

  // ─── IO panel ─────────────────────────────────────────────────────────────────
  .io-panel {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 16px;
    overflow-y: auto;
    background: #0d1117;
    border-left: 1px solid #30363d;
  }

  .io-section {
    padding: 4px 0 12px;
  }

  .io-title {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #e6edf3;
  }

  .io-sub {
    margin-bottom: 10px;
    font-size: 11px;
    color: #8b949e;

    &.mt10 {
      margin-top: 10px;
    }
  }

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .radio-option {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: #8b949e;
    cursor: pointer;
    transition: color 0.2s;

    input {
      display: none;
    }

    .radio-dot {
      flex-shrink: 0;
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
        box-shadow: 0 0 0 3px rgb(61 232 196 / 12%);
      }
    }
  }

  .custom-lang-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 8px 0;

    .custom-tag {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 3px 8px;
      font-size: 11px;
      color: #3de8c4;
      background: rgb(61 232 196 / 8%);
      border: 1px solid rgb(61 232 196 / 20%);
      border-radius: 4px;

      span {
        color: #8b949e;
        cursor: pointer;

        &:hover {
          color: #f85149;
        }
      }
    }

    .add-lang {
      padding: 3px 8px;
      font-size: 11px;
      color: #8b949e;
      cursor: pointer;
      border: 1px dashed #30363d;
      border-radius: 4px;

      &:hover {
        color: #3de8c4;
        border-color: #3de8c4;
      }
    }
  }

  .btn-export {
    width: 100%;
    height: 36px;
    margin-top: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #0d1117 !important;
    background: #3de8c4 !important;
    border: none !important;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: #5af0d0 !important;
    }
  }

  .io-divider {
    height: 1px;
    margin: 8px 0 16px;
    background: #30363d;
  }

  .drop-zone {
    padding: 20px;
    text-align: center;
    cursor: pointer;
    border: 2px dashed #30363d;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover,
    &.drag-over {
      background: rgb(61 232 196 / 4%);
      border-color: #3de8c4;
    }

    .dz-text {
      margin-bottom: 4px;
      font-size: 12px;
      color: #8b949e;
    }

    .dz-hint {
      font-size: 11px;
      color: #484f58;
    }
  }

  .mt8 {
    margin-top: 8px;
  }

  :deep(.btn-secondary-sm) {
    height: 30px;
    font-size: 12px;
    color: #8b949e !important;
    background: transparent !important;
    border: 1px solid #30363d !important;
    border-radius: 6px;

    &:hover {
      color: #e6edf3 !important;
    }
  }

  .import-warn {
    margin-top: 8px;
    font-size: 11px;
    line-height: 1.5;
    color: #d29922;
  }

  .summary-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;

    span:first-child {
      color: #8b949e;
    }

    span:last-child {
      max-width: 160px;
      overflow: hidden;
      font-size: 11px;
      color: #e6edf3;
      text-align: right;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .prog-text {
      color: #3de8c4;
    }

    .over-text {
      color: #d29922;
    }

    .dim {
      color: #484f58;
    }

    &.pct-row span:last-child.pct {
      font-weight: 600;
      color: #3de8c4;
    }
  }

  .progress-bar {
    height: 4px;
    margin: 2px 0;
    overflow: hidden;
    background: #30363d;
    border-radius: 2px;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3de8c4, #5af0d0);
      border-radius: 2px;
      transition: width 0.5s ease;
    }
  }

  // ─── Transitions ──────────────────────────────────────────────────────────────
  .row-fade-enter-active,
  .row-fade-leave-active {
    transition: all 0.2s;
  }

  .row-fade-enter-from,
  .row-fade-leave-to {
    opacity: 0;
    transform: translateX(-8px);
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
    max-height: 100px;
  }
</style>
