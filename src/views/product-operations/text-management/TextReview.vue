<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { fetchAuditConfirm, fetchAuditRerun } from './api/text-management'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { AppContent } from './types'

  const props = defineProps<{
    appContent: AppContent
    auditWordLists?: {
      bannedWords: string[]
      brandWords: string[]
    }
  }>()

  const emit = defineEmits<{
    'update:appContent': [val: AppContent]
    auditPass: []
    appChange: [appId: string]
  }>()

  // ─── Local editable state ────────────────────────────────────────────────────
  const appName = ref(props.appContent.appName ?? '')
  const shortDesc = ref(props.appContent.shortDesc ?? '')
  const fullDesc = ref(props.appContent.fullDesc ?? '')

  watch(
    () => props.appContent,
    (v) => {
      appName.value = v.appName ?? ''
      shortDesc.value = v.shortDesc ?? ''
      fullDesc.value = v.fullDesc ?? ''
    },
    { deep: true }
  )

  // Sync back up
  watch([appName, shortDesc, fullDesc], () => {
    emit('update:appContent', {
      appName: appName.value,
      shortDesc: shortDesc.value,
      fullDesc: fullDesc.value
    })
  })

  // ─── Word lists (configurable, would come from API in production) ─────────────
  const BANNED_WORDS_DB = computed(() => props.auditWordLists?.bannedWords ?? [])
  const BRAND_WORDS_DB = computed(() => props.auditWordLists?.brandWords ?? [])

  // ─── Issue status tracking ────────────────────────────────────────────────────
  type IssueStatus = 'pending' | 'ignored' | 'located'

  interface RepeatWordIssue {
    id: string
    word: string
    count: number
    isAdjacent: boolean
    status: IssueStatus
  }
  interface BannedWordIssue {
    id: string
    word: string
    status: IssueStatus
  }
  interface BrandWordIssue {
    id: string
    word: string
    status: IssueStatus
  }

  const repeatIssues = ref<RepeatWordIssue[]>([])
  const bannedIssues = ref<BannedWordIssue[]>([])
  const brandIssues = ref<BrandWordIssue[]>([])

  // Ignored sets (persist across re-audits so user doesn't lose work)
  const ignoredRepeat = ref(new Set<string>())
  const ignoredBanned = ref(new Set<string>())
  const ignoredBrand = ref(new Set<string>())

  // ─── Audit algorithm ──────────────────────────────────────────────────────────
  const runAudit = () => {
    const allText = [appName.value, shortDesc.value, fullDesc.value].join(' ')

    // --- A. Repeat words (3+ chars, 2+ occurrences, filter common stop words) ---
    const stopWords = new Set([
      'the',
      'and',
      'for',
      'with',
      'this',
      'that',
      'from',
      'are',
      'have',
      'will',
      'your',
      'our',
      'its',
      'into',
      'not',
      'you',
      'use',
      'can'
    ])
    const wordMap = new Map<string, number>()
    const wordRegex = /\b[a-zA-Z]{3,}\b/g
    let m
    while ((m = wordRegex.exec(allText)) !== null) {
      const w = m[0].toLowerCase()
      if (!stopWords.has(w)) wordMap.set(w, (wordMap.get(w) || 0) + 1)
    }

    repeatIssues.value = Array.from(wordMap.entries())
      .filter(([, c]) => c >= 2)
      .map(([word, count]) => ({
        id: `r-${word}`,
        word,
        count,
        isAdjacent: checkAdjacent(allText, word),
        status: (ignoredRepeat.value.has(word) ? 'ignored' : 'pending') as IssueStatus
      }))

    // --- B. Banned words ---
    bannedIssues.value = BANNED_WORDS_DB.value
      .filter((w) => allText.toLowerCase().includes(w.toLowerCase()))
      .map((word) => ({
        id: `b-${word}`,
        word,
        status: (ignoredBanned.value.has(word) ? 'ignored' : 'pending') as IssueStatus
      }))

    // --- C. Brand words ---
    brandIssues.value = BRAND_WORDS_DB.value
      .filter((w) => allText.includes(w))
      .map((word) => ({
        id: `br-${word}`,
        word,
        status: (ignoredBrand.value.has(word) ? 'ignored' : 'pending') as IssueStatus
      }))
  }

  // Run on mount and on content change
  runAudit()
  watch([appName, shortDesc, fullDesc, BANNED_WORDS_DB, BRAND_WORDS_DB], runAudit, {
    deep: true
  })

  // ─── Adjacent word check ──────────────────────────────────────────────────────
  function checkAdjacent(text: string, word: string): boolean {
    const re = new RegExp(`\\b${word}\\b[^.!?\\n]{0,60}\\b${word}\\b`, 'i')
    return re.test(text)
  }

  // ─── Char counts ──────────────────────────────────────────────────────────────
  const appNameCount = computed(() => appName.value.length)
  const shortDescCount = computed(() => shortDesc.value.length)
  const fullDescCount = computed(() => fullDesc.value.length)

  // ─── Audit summary counts ─────────────────────────────────────────────────────
  const pendingRepeat = computed(
    () => repeatIssues.value.filter((i) => i.status === 'pending').length
  )
  const pendingBanned = computed(
    () => bannedIssues.value.filter((i) => i.status === 'pending').length
  )
  const pendingBrand = computed(
    () => brandIssues.value.filter((i) => i.status === 'pending').length
  )
  const totalPending = computed(
    () => pendingRepeat.value + pendingBanned.value + pendingBrand.value
  )

  // ─── Issue actions ────────────────────────────────────────────────────────────
  const ignoreRepeat = (word: string) => {
    ignoredRepeat.value.add(word)
    const it = repeatIssues.value.find((i) => i.word === word)
    if (it) it.status = 'ignored'
  }
  const locateRepeat = (word: string) => scrollToWord(word)

  const ignoreBanned = (word: string) => {
    ignoredBanned.value.add(word)
    const it = bannedIssues.value.find((i) => i.word === word)
    if (it) it.status = 'ignored'
  }
  const deleteBanned = (word: string) => {
    fullDesc.value = fullDesc.value.replace(new RegExp(word, 'gi'), '')
    shortDesc.value = shortDesc.value.replace(new RegExp(word, 'gi'), '')
    appName.value = appName.value.replace(new RegExp(word, 'gi'), '')
    bannedIssues.value = bannedIssues.value.filter((i) => i.word !== word)
  }
  const locateBanned = (word: string) => scrollToWord(word)

  const ignoreBrand = (word: string) => {
    ignoredBrand.value.add(word)
    const it = brandIssues.value.find((i) => i.word === word)
    if (it) it.status = 'ignored'
  }

  // ─── Confirm all ─────────────────────────────────────────────────────────────
  const confirmAll = async () => {
    try {
      await fetchAuditConfirm({
        appContent: {
          appName: appName.value,
          shortDesc: shortDesc.value,
          fullDesc: fullDesc.value
        },
        repeatWords: repeatIssues.value.filter((i) => i.status === 'pending').map((i) => i.word),
        bannedWords: bannedIssues.value.filter((i) => i.status === 'pending').map((i) => i.word),
        brandWords: brandIssues.value.filter((i) => i.status === 'pending').map((i) => i.word)
      })
    } catch {
      ElMessage.error('审核确认接口失败，请检查后重试')
      return
    }
    repeatIssues.value.forEach((i) => {
      i.status = 'ignored'
      ignoredRepeat.value.add(i.word)
    })
    bannedIssues.value.forEach((i) => {
      i.status = 'ignored'
      ignoredBanned.value.add(i.word)
    })
    brandIssues.value.forEach((i) => {
      i.status = 'ignored'
      ignoredBrand.value.add(i.word)
    })
  }

  const reAudit = async () => {
    try {
      await fetchAuditRerun({
        appContent: {
          appName: appName.value,
          shortDesc: shortDesc.value,
          fullDesc: fullDesc.value
        }
      })
    } catch {
      ElMessage.error('重新审核接口失败，请检查后重试')
      return
    }
    ignoredRepeat.value.clear()
    ignoredBanned.value.clear()
    ignoredBrand.value.clear()
    runAudit()
  }

  // ─── Highlight backdrop for fullDesc ─────────────────────────────────────────
  const backdropRef = ref<HTMLDivElement | null>(null)

  const buildHighlightHtml = (text: string): string => {
    const escapedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    let result = escapedText

    // Banned words → purple
    for (const issue of bannedIssues.value) {
      if (issue.status === 'ignored') continue
      const re = new RegExp(`(${escRe(issue.word)})`, 'gi')
      result = result.replace(re, `<mark class="hl-banned">$1</mark>`)
    }

    // Repeat words → yellow
    for (const issue of repeatIssues.value) {
      if (issue.status === 'ignored') continue
      const re = new RegExp(`(\\b${escRe(issue.word)}\\b)`, 'gi')
      result = result.replace(re, `<mark class="hl-repeat">$1</mark>`)
    }

    // Brand words → green
    for (const issue of brandIssues.value) {
      if (issue.status === 'ignored') continue
      const re = new RegExp(`(${escRe(issue.word)})`, 'g')
      result = result.replace(re, `<mark class="hl-brand">$1</mark>`)
    }

    return result.replace(/\n/g, '<br>')
  }

  function escRe(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const highlightedHtml = computed(() => buildHighlightHtml(fullDesc.value))

  const syncScroll = (e: Event) => {
    const ta = e.target as HTMLTextAreaElement
    if (backdropRef.value) backdropRef.value.scrollTop = ta.scrollTop
  }

  // Scroll to first occurrence of word in fullDesc textarea
  const fullDescRef = ref<HTMLTextAreaElement | null>(null)
  const scrollToWord = (word: string) => {
    if (!fullDescRef.value) return
    const idx = fullDesc.value.toLowerCase().indexOf(word.toLowerCase())
    if (idx === -1) return
    // Approximate line position
    const linesBeforeIdx = fullDesc.value.substring(0, idx).split('\n').length
    const lineHeight = 22 // px, matches CSS
    fullDescRef.value.scrollTop = (linesBeforeIdx - 2) * lineHeight
    fullDescRef.value.focus()
  }

  // ─── App switcher (cockpit meta filter options) ───────────────────────────────
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const selectedAppId = ref('')
  const appOptions = computed(() => cockpitMetaFilterStore.data?.appOptions ?? [])
  const selectedAppLabel = computed(() => {
    const hit = appOptions.value.find((o) => o.value === selectedAppId.value)
    return hit?.label || appName.value || '--'
  })

  if (!cockpitMetaFilterStore.data) {
    void cockpitMetaFilterStore.ensureLoaded()
  }

  watch(selectedAppId, (val) => {
    emit('appChange', val || '')
  })
</script>

<template>
  <div class="text-review">
    <!-- Left: editor panel -->
    <div class="editor-panel">
      <div class="panel-title">原文编辑区</div>

      <!-- App selector -->
      <div class="app-selector">
        <span class="label">当前应用：</span>
        <div class="app-chip">
          <span class="app-icon">📱</span>
          <el-select
            v-model="selectedAppId"
            class="app-select"
            clearable
            placeholder="请选择应用"
            size="small"
          >
            <el-option
              v-for="opt in appOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </div>
        <span class="switch-link">{{ selectedAppLabel }}</span>
      </div>

      <!-- App name -->
      <div class="field-group">
        <div class="field-label">
          App name 标题
          <span class="badge-required">必填</span>
          <span class="char-limit">字符限制30字</span>
        </div>
        <div class="input-wrap" :class="{ 'over-limit': appNameCount > 30 }">
          <el-input
            v-model="appName"
            placeholder="请输入 App name"
            :maxlength="35"
            class="tm-input"
          />
          <span class="char-counter" :class="{ warn: appNameCount > 25, error: appNameCount > 30 }">
            {{ appNameCount }} / 30
          </span>
        </div>
        <div class="field-status">
          <span v-if="appNameCount <= 30" class="status-ok">✅ 字符数合规</span>
          <span v-else class="status-err">⚠ 超出限制</span>
        </div>
      </div>

      <!-- Short description -->
      <div class="field-group">
        <div class="field-label">
          Short description 短描述
          <span class="badge-required">必填</span>
          <span class="char-limit">字符限制80字</span>
        </div>
        <div class="input-wrap" :class="{ 'over-limit': shortDescCount > 80 }">
          <el-input
            v-model="shortDesc"
            placeholder="请输入短描述"
            :maxlength="85"
            class="tm-input"
          />
          <span
            class="char-counter"
            :class="{ warn: shortDescCount > 70, error: shortDescCount > 80 }"
          >
            {{ shortDescCount }} / 80
          </span>
        </div>
        <div class="field-status">
          <span v-if="shortDescCount <= 80" class="status-ok">✅ 字符数合规</span>
          <span v-else class="status-err">⚠ 超出限制</span>
        </div>
      </div>

      <!-- Full description with highlight overlay -->
      <div class="field-group full-desc-group">
        <div class="field-label">
          Full description 长描述
          <span class="badge-required">必填</span>
          <span class="char-limit">字符限制4000字</span>
        </div>
        <div class="highlight-wrapper" :class="{ 'over-limit': fullDescCount > 4000 }">
          <!-- Backdrop highlight layer -->
          <div ref="backdropRef" class="highlight-backdrop" v-html="highlightedHtml" />
          <!-- Actual textarea -->
          <textarea
            ref="fullDescRef"
            v-model="fullDesc"
            class="highlight-textarea"
            placeholder="请输入长描述"
            @scroll="syncScroll"
          />
        </div>
        <div class="full-desc-footer">
          <div class="field-status inline">
            <span v-if="fullDescCount <= 4000" class="status-ok">✅ 字符数合规</span>
            <span v-else class="status-err">⚠ 超出限制</span>
          </div>
          <span
            class="char-counter"
            :class="{ warn: fullDescCount > 3600, error: fullDescCount > 4000 }"
          >
            {{ fullDescCount }} / 4000
          </span>
        </div>
      </div>

      <!-- Issue summary bar -->
      <div class="issue-summary">
        <span class="sum-label">审核问题摘要：</span>
        <span v-if="repeatIssues.length" class="sum-tag repeat"
          >{{ repeatIssues.length }} 叠词</span
        >
        <span v-if="bannedIssues.length" class="sum-tag banned"
          >{{ bannedIssues.length }} 禁用词</span
        >
        <span v-if="brandIssues.length" class="sum-tag brand">{{ brandIssues.length }} 品牌词</span>
        <span class="sum-tag none">0 超限</span>
      </div>
    </div>

    <!-- Right: audit results panel -->
    <div class="audit-panel">
      <div class="audit-header">
        <span class="audit-title">审核结果</span>
        <div class="audit-actions">
          <el-button class="btn-sm-secondary" @click="confirmAll">全部确认</el-button>
          <el-button class="btn-sm-primary" @click="reAudit">重新审核</el-button>
        </div>
      </div>

      <!-- A: Repeat words -->
      <div class="audit-section">
        <div class="section-header">
          <span class="section-label">A. 叠词检测</span>
          <span class="section-desc">前后相邻出现的重复词语，建议修改</span>
        </div>
        <div v-if="repeatIssues.length === 0" class="no-issue">无叠词问题 ✓</div>
        <div
          v-for="(issue, idx) in repeatIssues"
          :key="issue.id"
          class="issue-row"
          :class="{ ignored: issue.status === 'ignored' }"
        >
          <span class="issue-num">{{ idx + 1 }}.</span>
          <span class="issue-word repeat-word">'{{ issue.word }}'</span>
          <span class="issue-desc">
            出现 {{ issue.count }} 次，{{ issue.isAdjacent ? '前后相邻' : '非前后相邻' }}
          </span>
          <div class="issue-btns">
            <template v-if="issue.status !== 'ignored'">
              <el-button size="small" class="tag-btn" @click="ignoreRepeat(issue.word)"
                >忽略</el-button
              >
              <el-button size="small" class="tag-btn teal" @click="locateRepeat(issue.word)"
                >定位</el-button
              >
            </template>
            <span v-else class="already-ignored">已忽略</span>
          </div>
        </div>
      </div>

      <!-- B: Banned words -->
      <div class="audit-section">
        <div class="section-header">
          <span class="section-label">B. 禁用词检测</span>
          <span class="section-desc red">包含平台禁用词，必须修改</span>
        </div>
        <div v-if="bannedIssues.length === 0" class="no-issue">无禁用词 ✓</div>
        <div
          v-for="issue in bannedIssues"
          :key="issue.id"
          class="issue-row"
          :class="{ ignored: issue.status === 'ignored' }"
        >
          <span class="issue-word banned-word">'{{ issue.word }}'</span>
          <div class="issue-btns">
            <template v-if="issue.status !== 'ignored'">
              <el-button size="small" class="tag-btn" @click="ignoreBanned(issue.word)"
                >忽略</el-button
              >
              <el-button size="small" class="tag-btn teal" @click="locateBanned(issue.word)"
                >定位</el-button
              >
              <el-button size="small" class="tag-btn danger" @click="deleteBanned(issue.word)"
                >手动删除</el-button
              >
            </template>
            <span v-else class="already-ignored">已忽略</span>
          </div>
        </div>
        <div class="section-note">禁用词库可自定义管理</div>
      </div>

      <!-- C: Brand words -->
      <div class="audit-section">
        <div class="section-header">
          <span class="section-label">C. 品牌词检测</span>
          <span class="section-desc">可能涉及商标侵权的品牌词</span>
        </div>
        <div v-if="brandIssues.length === 0" class="no-issue">无品牌词 ✓</div>
        <div class="brand-tags">
          <span
            v-for="issue in brandIssues"
            :key="issue.id"
            class="brand-tag"
            :class="{ ignored: issue.status === 'ignored' }"
          >
            {{ issue.word }}
            <span class="tag-ignore" @click="ignoreBrand(issue.word)">忽略</span>
          </span>
        </div>
        <div class="section-note">品牌词库可自定义管理</div>
      </div>

      <!-- D: Char monitor -->
      <div class="audit-section char-section">
        <div class="section-header"><span class="section-label">D. 字符监测</span></div>
        <div class="char-rows">
          <div class="char-row">
            <span>App name</span>
            <span :class="appNameCount > 30 ? 'over' : 'ok'">{{ appNameCount }}/30</span>
            <span class="dot" :class="appNameCount <= 30 ? 'green' : 'red'" />
          </div>
          <div class="char-row">
            <span>Short description</span>
            <span :class="shortDescCount > 80 ? 'over' : 'ok'">{{ shortDescCount }}/80</span>
            <span class="dot" :class="shortDescCount <= 80 ? 'green' : 'red'" />
          </div>
          <div class="char-row">
            <span>Full description</span>
            <span :class="fullDescCount > 4000 ? 'over' : 'ok'">{{ fullDescCount }}/4000</span>
            <span class="dot" :class="fullDescCount <= 4000 ? 'green' : 'red'" />
          </div>
        </div>
        <div class="char-note">超限时标红显示</div>
      </div>

      <!-- Status bar -->
      <div class="audit-status">
        <span v-if="totalPending > 0" class="status-pending">
          审核状态：<span class="hl">待用户确认 {{ totalPending }} 个问题</span>
        </span>
        <span v-else class="status-clear">审核状态：✅ 无待确认问题</span>
      </div>

      <el-button class="btn-confirm-all" @click="emit('auditPass')">确认全部审核结果</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .text-review {
    display: grid;
    flex: 1;
    grid-template-columns: 1fr 360px;
    gap: 0;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  // ─── Editor panel ─────────────────────────────────────────────────────────────
  .editor-panel {
    min-height: 0;
    padding: 20px 24px;
    overflow-y: auto;
    border-right: 1px solid #30363d;

    .panel-title {
      margin-bottom: 20px;
      font-size: 15px;
      font-weight: 600;
      color: #e6edf3;
    }
  }

  .app-selector {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;

    .label {
      font-size: 13px;
      color: #8b949e;
    }

    .app-chip {
      display: flex;
      gap: 6px;
      align-items: center;
      padding: 5px 12px;
      font-size: 13px;
      color: #e6edf3;
      cursor: pointer;
      background: #1c2130;
      border: 1px solid #30363d;
      border-radius: 8px;
      transition: border-color 0.2s;

      &:hover {
        border-color: #3de8c4;
      }

      :deep(.app-select) {
        width: 240px;
      }

      :deep(.app-select .el-input__wrapper) {
        background: transparent;
        border: none;
        box-shadow: none !important;
      }

      :deep(.app-select .el-input__inner) {
        font-size: 13px;
        color: #e6edf3;
      }
    }

    .switch-link {
      font-size: 13px;
      color: #3de8c4;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .field-group {
    margin-bottom: 20px;

    .field-label {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #e6edf3;
    }
  }

  .badge-required {
    padding: 1px 5px;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    background: #f85149;
    border-radius: 4px;
  }

  .char-limit {
    font-size: 11px;
    font-weight: 400;
    color: #8b949e;
  }

  .input-wrap {
    position: relative;

    &.over-limit :deep(.el-input__wrapper) {
      border-color: #f85149 !important;
    }

    .char-counter {
      position: absolute;
      top: 50%;
      right: 12px;
      font-size: 12px;
      color: #8b949e;
      pointer-events: none;
      transform: translateY(-50%);

      &.warn {
        color: #d29922;
      }

      &.error {
        color: #f85149;
      }
    }
  }

  :deep(.tm-input .el-input__wrapper) {
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    box-shadow: none !important;
    transition: border-color 0.2s;

    &:hover,
    &.is-focus {
      border-color: #3de8c4 !important;
    }

    input {
      padding-right: 60px;
      font-size: 14px;
      color: #e6edf3;

      &::placeholder {
        color: #484f58;
      }
    }
  }

  .field-status {
    margin-top: 6px;

    .status-ok {
      font-size: 12px;
      color: #3fb950;
    }

    .status-err {
      font-size: 12px;
      color: #f85149;
    }

    &.inline {
      display: inline;
    }
  }

  // ─── Highlight textarea ───────────────────────────────────────────────────────
  .full-desc-group {
    flex: 1;
  }

  .highlight-wrapper {
    position: relative;
    overflow: hidden;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:focus-within {
      border-color: #3de8c4;
    }

    &.over-limit {
      border-color: #f85149;
    }
  }

  .highlight-backdrop {
    position: absolute;
    inset: 0;
    z-index: 0;
    box-sizing: border-box;
    padding: 12px 16px;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: transparent;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    pointer-events: none;

    :deep(.hl-repeat) {
      color: transparent;
      background: rgb(245 158 11 / 38%);
      border-radius: 3px;
    }

    :deep(.hl-banned) {
      color: transparent;
      background: rgb(139 92 246 / 45%);
      border-radius: 3px;
    }

    :deep(.hl-brand) {
      color: transparent;
      background: rgb(52 211 153 / 35%);
      border-radius: 3px;
    }
  }

  .highlight-textarea {
    position: relative;
    z-index: 1;
    box-sizing: border-box;
    width: 100%;
    min-height: 220px;
    max-height: 300px;
    padding: 12px 16px;
    overflow-y: auto;
    font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #e6edf3;
    caret-color: #3de8c4;
    resize: none;
    background: transparent;
    border: none;
    outline: none;

    &::placeholder {
      color: #484f58;
    }
  }

  .full-desc-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 12px;
    background: #161b22;
    border-top: 1px solid #30363d;

    .char-counter {
      font-size: 12px;
      color: #3de8c4;

      &.warn {
        color: #d29922;
      }

      &.error {
        color: #f85149;
      }
    }
  }

  // ─── Issue summary bar ────────────────────────────────────────────────────────
  .issue-summary {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 0 4px;

    .sum-label {
      font-size: 12px;
      color: #8b949e;
    }

    .sum-tag {
      padding: 3px 10px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 12px;

      &.repeat {
        color: #f59e0b;
        background: rgb(245 158 11 / 15%);
        border: 1px solid rgb(245 158 11 / 30%);
      }

      &.banned {
        color: #f85149;
        background: rgb(248 81 73 / 15%);
        border: 1px solid rgb(248 81 73 / 30%);
      }

      &.brand {
        color: #34d399;
        background: rgb(52 211 153 / 15%);
        border: 1px solid rgb(52 211 153 / 30%);
      }

      &.none {
        color: #8b949e;
        background: rgb(139 148 158 / 10%);
        border: 1px solid rgb(139 148 158 / 20%);
      }
    }
  }

  // ─── Audit panel ──────────────────────────────────────────────────────────────
  .audit-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    padding: 16px;
    overflow-y: auto;
    background: #0d1117;
  }

  .audit-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    .audit-title {
      font-size: 14px;
      font-weight: 600;
      color: #e6edf3;
    }

    .audit-actions {
      display: flex;
      gap: 8px;
    }
  }

  :deep(.btn-sm-secondary) {
    height: 28px;
    padding: 4px 10px;
    font-size: 12px;
    color: #8b949e !important;
    background: transparent !important;
    border: 1px solid #30363d !important;
    border-radius: 6px;

    &:hover {
      color: #3de8c4 !important;
      border-color: #3de8c4 !important;
    }
  }

  :deep(.btn-sm-primary) {
    height: 28px;
    padding: 4px 10px;
    font-size: 12px;
    color: #3de8c4 !important;
    background: transparent !important;
    border: 1px solid #3de8c4 !important;
    border-radius: 6px;

    &:hover {
      background: rgb(61 232 196 / 10%) !important;
    }
  }

  .audit-section {
    padding: 12px;
    margin-bottom: 8px;
    background: #161b22;
    border: 1px solid #30363d;
    border-radius: 8px;

    .section-header {
      display: flex;
      gap: 8px;
      align-items: baseline;
      margin-bottom: 10px;

      .section-label {
        font-size: 13px;
        font-weight: 600;
        color: #e6edf3;
      }

      .section-desc {
        font-size: 11px;
        color: #8b949e;

        &.red {
          color: #f85149;
        }
      }
    }
  }

  .no-issue {
    padding: 4px 0;
    font-size: 12px;
    color: #3fb950;
  }

  .issue-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    padding: 5px 0;
    border-bottom: 1px solid #1c2130;
    transition: opacity 0.2s;

    &:last-child {
      border-bottom: none;
    }

    &.ignored {
      opacity: 0.4;
    }

    .issue-num {
      min-width: 14px;
      font-size: 12px;
      color: #8b949e;
    }

    .issue-desc {
      flex: 1;
      font-size: 11px;
      color: #8b949e;
    }

    .issue-btns {
      display: flex;
      gap: 4px;
      margin-left: auto;
    }

    .already-ignored {
      font-size: 11px;
      color: #484f58;
    }
  }

  .issue-word {
    padding: 2px 7px;
    font-family: 'SF Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;

    &.repeat-word {
      color: #f59e0b;
      background: rgb(245 158 11 / 20%);
    }

    &.banned-word {
      color: #a78bfa;
      background: rgb(139 92 246 / 20%);
    }
  }

  :deep(.tag-btn) {
    height: 22px !important;
    padding: 0 8px !important;
    font-size: 11px !important;
    color: #8b949e !important;
    background: rgb(139 148 158 / 10%) !important;
    border: 1px solid #30363d !important;
    border-radius: 4px !important;

    &:hover {
      color: #e6edf3 !important;
      border-color: #484f58 !important;
    }

    &.teal {
      color: #3de8c4 !important;
      background: rgb(61 232 196 / 8%) !important;
      border-color: rgb(61 232 196 / 30%) !important;

      &:hover {
        background: rgb(61 232 196 / 15%) !important;
      }
    }

    &.danger {
      color: #f85149 !important;
      background: rgb(248 81 73 / 8%) !important;
      border-color: rgb(248 81 73 / 30%) !important;

      &:hover {
        background: rgb(248 81 73 / 15%) !important;
      }
    }
  }

  .section-note {
    margin-top: 8px;
    font-size: 11px;
    color: #484f58;
  }

  .brand-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .brand-tag {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 3px 8px;
      font-size: 12px;
      color: #34d399;
      background: rgb(52 211 153 / 12%);
      border: 1px solid rgb(52 211 153 / 25%);
      border-radius: 6px;
      transition: opacity 0.2s;

      &.ignored {
        opacity: 0.35;
      }

      .tag-ignore {
        margin-left: 2px;
        font-size: 10px;
        color: #8b949e;
        cursor: pointer;

        &:hover {
          color: #f85149;
        }
      }
    }
  }

  .char-section .char-rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .char-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: #8b949e;

    .ok {
      color: #3fb950;
    }

    .over {
      color: #f85149;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;

      &.green {
        background: #3fb950;
      }

      &.red {
        background: #f85149;
      }
    }
  }

  .char-note {
    margin-top: 8px;
    font-size: 11px;
    color: #484f58;
  }

  .audit-status {
    padding: 10px 0 4px;
    font-size: 12px;
    color: #8b949e;

    .status-pending .hl {
      color: #f59e0b;
    }

    .status-clear {
      color: #3fb950;
    }
  }

  .btn-confirm-all {
    width: 100%;
    height: 40px;
    margin-top: 4px;
    font-size: 14px;
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
</style>
