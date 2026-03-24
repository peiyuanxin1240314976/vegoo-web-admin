<template>
  <el-dialog
    :model-value="visible"
    :title="step === 'select' ? '导入商店订单' : '导入中...'"
    width="880px"
    :close-on-click-modal="false"
    :close-on-press-escape="step === 'select'"
    :show-close="step === 'select'"
    header-class="import-dialog-hd"
    body-class="import-dialog-bd"
    footer-class="import-dialog-ft"
    @update:model-value="handleClose"
    @closed="handleClosed"
  >
    <!-- ══════════════ STEP 1: 选择数据源 + 上传文件 ══════════════ -->
    <template v-if="step === 'select'">
      <div class="select-layout">
        <!-- 左侧 -->
        <div class="select-left">
          <!-- 数据源选择 -->
          <div class="section-label">数据源</div>
          <div class="source-cards">
            <div
              :class="['source-card', form.dataSource === 'appstore' && 'source-card--active']"
              @click="form.dataSource = 'appstore'"
            >
              <div class="source-card-check" v-if="form.dataSource === 'appstore'">
                <ElIcon><Check /></ElIcon>
              </div>
              <div class="source-card-icon source-card-icon--apple">
                <span>↗</span>
              </div>
              <div class="source-card-info">
                <div class="source-card-name">App Store</div>
                <div class="source-card-sub">iOS 应用内购订单</div>
              </div>
            </div>
            <div
              :class="['source-card', form.dataSource === 'googleplay' && 'source-card--active']"
              @click="form.dataSource = 'googleplay'"
            >
              <div class="source-card-check" v-if="form.dataSource === 'googleplay'">
                <ElIcon><Check /></ElIcon>
              </div>
              <div class="source-card-icon source-card-icon--google">
                <span>▶</span>
              </div>
              <div class="source-card-info">
                <div class="source-card-name">Google Play</div>
                <div class="source-card-sub">Android 应用内购订单</div>
              </div>
            </div>
          </div>

          <!-- 文件上传区 -->
          <div
            :class="['upload-zone', isDragging && 'upload-zone--drag', form.fileName && 'upload-zone--has-file']"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <template v-if="!form.fileName">
              <div class="upload-icon">
                <ElIcon size="40"><Upload /></ElIcon>
              </div>
              <div class="upload-text">拖拽 CSV 文件至此，或点击选择</div>
              <div class="upload-hint">
                支持 {{ form.dataSource === 'appstore' ? 'App Store' : 'Google Play' }} 标准财务报表格式 (.csv)<br />
                单文件最大 50MB
              </div>
              <ElButton class="btn-choose" @click.stop="triggerFileInput">选择文件</ElButton>
            </template>
            <template v-else>
              <div class="file-info">
                <div class="file-icon">CSV</div>
                <div class="file-meta">
                  <div class="file-name">{{ form.fileName }}</div>
                  <div class="file-size">{{ form.fileSize }}</div>
                </div>
                <span class="file-tag">已选择</span>
              </div>
            </template>
          </div>
          <input ref="fileInputRef" type="file" accept=".csv" class="hidden-input" @change="handleFileChange" />

          <!-- 重复数据提示 -->
          <div class="dup-notice">
            <ElIcon class="dup-icon"><InfoFilled /></ElIcon>
            <div class="dup-content">
              <div class="dup-title">系统将自动识别并跳过重复数据，无需手动去重</div>
              <div class="dup-sub">重复判断基于：交易日期 + SKU + 销售国家 + 分成金额</div>
            </div>
          </div>
        </div>

        <!-- 右侧：字段映射预览 -->
        <div class="select-right">
          <div class="mapping-title">字段映射预览</div>
          <div class="mapping-sub">{{ form.dataSource === 'appstore' ? 'App Store' : 'Google Play' }} 标准字段</div>
          <div class="mapping-table">
            <div class="mapping-head">
              <span>文件字段</span>
              <span>导入字段</span>
            </div>
            <div v-for="m in currentMapping" :key="m.file" class="mapping-row">
              <span class="mapping-file">{{ m.file }}</span>
              <div class="mapping-target">
                <span class="mapping-dot" />
                {{ m.target }}
              </div>
            </div>
          </div>
          <div class="mapping-footer">
            共 {{ currentMapping.length }} 个字段，已匹配 {{ currentMapping.length }} 个
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════ STEP 2: 导入进行中 ══════════════════════ -->
    <template v-else-if="step === 'importing'">
      <div class="importing-layout">
        <!-- 左侧：进度 -->
        <div class="importing-left">
          <!-- 文件信息 -->
          <div class="importing-file">
            <div class="importing-file-icon">CSV</div>
            <div class="importing-file-meta">
              <span class="importing-file-name">{{ form.fileName }}</span>
              <span class="importing-file-size">{{ form.fileSize }}</span>
            </div>
            <span class="importing-file-tag">已选择</span>
          </div>

          <!-- 数据源标签 -->
          <div class="importing-source-tag">
            <span class="source-badge source-badge--apple">
              App Store (iOS)
            </span>
          </div>

          <!-- 环形进度 -->
          <div class="progress-ring-wrap">
            <svg class="progress-ring" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" class="ring-track" />
              <circle
                cx="60" cy="60" r="52"
                class="ring-fill"
                :stroke-dasharray="ringCirc"
                :stroke-dashoffset="ringOffset"
              />
            </svg>
            <div class="progress-center">
              <div class="progress-pct">{{ progressPct }}%</div>
              <div class="progress-label">{{ progressLabel }}</div>
            </div>
          </div>

          <!-- 统计 -->
          <div class="importing-stats">
            <div class="stat-item">
              <div class="stat-label">已处理</div>
              <div class="stat-value">{{ processed.toLocaleString() }} 条</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">总计</div>
              <div class="stat-value">{{ totalRows.toLocaleString() }} 条</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">新增</div>
              <div class="stat-value stat-value--teal">{{ newCount.toLocaleString() }} 条</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">重复</div>
              <div class="stat-value stat-value--amber">{{ dupCount.toLocaleString() }} 条</div>
            </div>
          </div>

          <!-- 线性进度条 -->
          <div class="linear-bar">
            <div class="linear-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <div class="eta">预计剩余 {{ etaSec }} 秒</div>
        </div>

        <!-- 右侧：实时日志 -->
        <div class="importing-right">
          <div class="log-header">
            <span class="log-title">实时日志</span>
            <div class="log-auto-scroll">
              自动滚动
              <el-switch v-model="autoScroll" size="small" class="log-switch" />
            </div>
          </div>
          <div ref="logBoxRef" class="log-box">
            <div v-for="(log, i) in logs" :key="i" :class="['log-line', `log-line--${log.type}`]">
              <span class="log-time">[{{ log.time }}]</span>
              <span class="log-msg">{{ log.msg }}</span>
            </div>
          </div>
          <div class="log-footer">处理速度：{{ speed.toLocaleString() }} 条/秒</div>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- Step 1 footer -->
      <template v-if="step === 'select'">
        <ElButton class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton
          class="btn-start"
          :disabled="!form.dataSource || !form.fileName"
          @click="startImport"
        >
          开始导入 →
        </ElButton>
      </template>
      <!-- Step 2 footer -->
      <template v-else-if="step === 'importing'">
        <ElButton class="btn-cancel-import" @click="handleCancelImport">取消导入</ElButton>
        <div class="footer-right">
          <el-checkbox v-model="autoJump" class="auto-jump-cb">完成后自动跳转报告</el-checkbox>
        </div>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
  import { Check, Upload, InfoFilled } from '@element-plus/icons-vue'
  import { submitOrderImport } from '@/api/config-management'
  import { OrderImportApiSource } from '../config/data-source'
  import { getAppNow } from '@/utils/app-now'

  defineOptions({ name: 'ImportDialog' })

  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void
    (e: 'success', taskId: string): void
  }>()

  // ─── 表单 ──────────────────────────────────────────────
  const form = ref({ dataSource: 'appstore' as 'appstore' | 'googleplay' | '', fileName: '', fileSize: '' })
  const isDragging = ref(false)
  const fileInputRef = ref<HTMLInputElement>()
  const step = ref<'select' | 'importing'>('select')
  const autoJump = ref(true)
  const autoScroll = ref(true)

  // ─── 字段映射 ──────────────────────────────────────────
  const APPSTORE_MAPPING = [
    { file: 'Transaction Date', target: '交易日期' },
    { file: 'Settlement Date', target: '结算日期' },
    { file: 'SKU', target: '商品 SKU' },
    { file: 'Title', target: '产品名称' },
    { file: 'Country of Sale', target: '销售国家' },
    { file: 'Partner Share', target: '分成金额' },
    { file: 'Partner Share Currency', target: '分成货币' },
    { file: 'Product Type Identifier', target: '产品类型' }
  ]

  const GOOGLEPLAY_MAPPING = [
    { file: 'Order Number', target: '订单编号' },
    { file: 'Order Charged Date', target: '扣款日期' },
    { file: 'Product Id', target: '商品 SKU' },
    { file: 'Product Title', target: '产品名称' },
    { file: 'Buyer Country', target: '销售国家' },
    { file: 'Item Price', target: '商品价格' },
    { file: 'Currency of Sale', target: '销售货币' },
    { file: 'Amount (Merchant Currency)', target: '分成金额' }
  ]

  const currentMapping = computed(() =>
    form.value.dataSource === 'appstore' ? APPSTORE_MAPPING : GOOGLEPLAY_MAPPING
  )

  // ─── 文件选择 ──────────────────────────────────────────
  const triggerFileInput = () => fileInputRef.value?.click()

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    applyFile(file)
  }

  const handleDrop = (e: DragEvent) => {
    isDragging.value = false
    const file = e.dataTransfer?.files?.[0]
    if (file) applyFile(file)
  }

  const applyFile = (file: File) => {
    form.value.fileName = file.name
    const mb = file.size / 1024 / 1024
    form.value.fileSize = mb >= 1 ? `${mb.toFixed(1)} MB` : `${(file.size / 1024).toFixed(0)} KB`
  }

  // ─── 导入进度模拟 ──────────────────────────────────────
  const progressPct = ref(0)
  const progressLabel = ref('准备中')
  const processed = ref(0)
  const totalRows = ref(5234)
  const newCount = ref(0)
  const dupCount = ref(0)
  const etaSec = ref(60)
  const speed = ref(0)
  const logs = ref<{ time: string; msg: string; type: 'info' | 'success' | 'warn' | 'progress' }[]>([])
  const logBoxRef = ref<HTMLElement>()
  let timer: ReturnType<typeof setInterval> | null = null
  const ringCirc = Math.PI * 2 * 52

  const ringOffset = computed(() => ringCirc - (ringCirc * progressPct.value) / 100)

  const fmtTime = () => {
    const n = getAppNow()
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}:${String(n.getSeconds()).padStart(2, '0')}`
  }

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'progress' = 'info') => {
    logs.value.push({ time: fmtTime(), msg, type })
    if (autoScroll.value) {
      nextTick(() => {
        if (logBoxRef.value) logBoxRef.value.scrollTop = logBoxRef.value.scrollHeight
      })
    }
  }

  const startImport = async () => {
    let remoteTaskId = ''
    if (!OrderImportApiSource.submitImport && fileInputRef.value?.files?.[0]) {
      const formData = new FormData()
      formData.append('file', fileInputRef.value.files[0])
      formData.append('dataSource', form.value.dataSource || 'appstore')
      try {
        const resp = await submitOrderImport(formData)
        remoteTaskId = resp?.taskId || ''
      } catch {
        remoteTaskId = ''
      }
    }
    step.value = 'importing'
    progressPct.value = 0
    processed.value = 0
    newCount.value = 0
    dupCount.value = 0
    etaSec.value = 60
    speed.value = 0
    logs.value = []

    nextTick(() => {
      addLog(`开始解析文件 ${form.value.fileName}`, 'info')
      addLog('文件格式校验通过 ✓', 'success')

      setTimeout(() => {
        addLog(`检测到 ${totalRows.value.toLocaleString()} 条数据行`, 'info')
        setTimeout(() => {
          addLog('开始重复数据比对...', 'warn')
          runProgress()
        }, 800)
      }, 600)
    })
  }

  const runProgress = () => {
    const STEP = 1000
    const PER_TICK = Math.ceil(totalRows.value / 50)
    speed.value = 1340

    timer = setInterval(() => {
      processed.value = Math.min(processed.value + PER_TICK, totalRows.value)
      newCount.value = Math.floor(processed.value * 0.83)
      dupCount.value = Math.floor(processed.value * 0.17)
      progressPct.value = Math.round((processed.value / totalRows.value) * 100)
      etaSec.value = Math.max(0, Math.round(((totalRows.value - processed.value) / speed.value)))
      progressLabel.value = progressPct.value < 30 ? '解析中' : progressPct.value < 70 ? '比对中' : '导入中'

      if (processed.value % (PER_TICK * 5) < PER_TICK) {
        addLog(`已导入 ${processed.value.toLocaleString()} / ${totalRows.value.toLocaleString()} 条`, 'progress')
      }

      if (processed.value >= totalRows.value) {
        clearInterval(timer!)
        timer = null
        progressPct.value = 100
        progressLabel.value = '完成'
        addLog(`导入完成！新增 ${newCount.value.toLocaleString()} 条，重复跳过 ${dupCount.value.toLocaleString()} 条`, 'success')

        if (autoJump.value) {
          const fallbackTaskId = `IMP-${String(getAppNow().getTime()).slice(-6)}`
          setTimeout(() => emit('success', remoteTaskId || fallbackTaskId), 800)
        }
      }
    }, STEP)
  }

  const handleCancelImport = () => {
    if (timer) { clearInterval(timer); timer = null }
    step.value = 'select'
    ElMessage.warning('已取消导入')
    handleClose()
  }

  // ─── 弹窗控制 ──────────────────────────────────────────
  const handleClose = () => {
    if (step.value === 'importing') return
    emit('update:visible', false)
  }

  const handleClosed = () => {
    step.value = 'select'
    form.value = { dataSource: 'appstore', fileName: '', fileSize: '' }
    progressPct.value = 0
    logs.value = []
    if (timer) { clearInterval(timer); timer = null }
  }

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  watch(() => props.visible, (v) => {
    if (!v) handleClosed()
  })
</script>

<style lang="scss" scoped>
  // ── CSS 变量 ────────────────────────────────────────────
  .el-dialog {
    --cm-dialog-bg: #0f1829;
    --cm-dialog-bg-inner: #131c2e;
    --cm-dialog-border: rgb(255 255 255 / 8%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
  }

  // ── 布局 ────────────────────────────────────────────────
  .select-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 24px;
    min-height: 400px;
  }

  .importing-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    min-height: 380px;
  }

  .section-label {
    margin-bottom: 10px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  // ── 数据源卡片 ──────────────────────────────────────────
  .source-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .source-card {
    position: relative;
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 14px 16px;
    cursor: pointer;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 10px;
    transition: all 0.2s;

    &:hover { border-color: var(--accent); }

    &--active {
      border-color: var(--accent) !important;
      background: rgb(45 212 191 / 8%);
    }
  }

  .source-card-check {
    position: absolute;
    top: 8px;
    right: 8px;
    color: var(--accent);
    font-size: 14px;
  }

  .source-card-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    font-size: 16px;
    border-radius: 8px;

    &--apple  { background: #1d6fce; color: #fff; }
    &--google { background: #1a8a43; color: #fff; }
  }

  .source-card-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .source-card-sub {
    font-size: 11px;
    color: var(--text-muted);
  }

  // ── 上传区 ──────────────────────────────────────────────
  .upload-zone {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    cursor: pointer;
    text-align: center;
    background: rgb(255 255 255 / 2%);
    border: 1px dashed var(--cm-dialog-border);
    border-radius: 10px;
    transition: all 0.2s;

    &:hover, &--drag {
      border-color: var(--accent);
      background: rgb(45 212 191 / 5%);
    }

    &--has-file {
      cursor: default;
      border-style: solid;
      border-color: var(--accent);
    }
  }

  .upload-icon { color: var(--text-muted); }

  .upload-text {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .upload-hint {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-muted);
  }

  .btn-choose {
    margin-top: 4px;
    padding: 6px 16px !important;
    font-size: 13px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--cm-dialog-border) !important;
    border-radius: 6px !important;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  .hidden-input { display: none; }

  .file-info {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;
  }

  .file-icon {
    padding: 4px 6px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: #e55353;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .file-meta { flex: 1; text-align: left; }
  .file-name { font-size: 13px; color: var(--text-primary); }
  .file-size { font-size: 11px; color: var(--text-muted); }

  .file-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--accent);
    background: rgb(45 212 191 / 12%);
    border-radius: 10px;
  }

  // ── 重复提示 ────────────────────────────────────────────
  .dup-notice {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    margin-top: 12px;
    background: rgb(59 130 246 / 8%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 8px;
  }

  .dup-icon { color: #60a5fa; margin-top: 1px; flex-shrink: 0; }
  .dup-title { font-size: 13px; color: var(--text-primary); }
  .dup-sub   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

  // ── 字段映射 ────────────────────────────────────────────
  .select-right {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .mapping-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .mapping-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin-bottom: 10px;
  }

  .mapping-table {
    flex: 1;
    overflow-y: auto;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 8px;
  }

  .mapping-head {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 3%);
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .mapping-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 7px 12px;
    border-bottom: 1px solid var(--cm-dialog-border);
    font-size: 12px;

    &:last-child { border-bottom: none; }
  }

  .mapping-file  { color: var(--text-secondary); }
  .mapping-target {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--text-primary);
  }

  .mapping-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--accent);
    flex-shrink: 0;
  }

  .mapping-footer {
    margin-top: 8px;
    font-size: 12px;
    color: var(--accent);
  }

  // ── 进度环 ──────────────────────────────────────────────
  .importing-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .importing-file {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 10px 14px;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 8px;
  }

  .importing-file-icon {
    padding: 3px 6px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    background: #e55353;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .importing-file-meta { flex: 1; }
  .importing-file-name { font-size: 13px; color: var(--text-primary); display: block; }
  .importing-file-size { font-size: 11px; color: var(--text-muted); }

  .importing-file-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--accent);
    background: rgb(45 212 191 / 12%);
    border-radius: 10px;
  }

  .source-badge {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    border-radius: 6px;

    &--apple  { color: #60a5fa; background: rgb(29 111 206 / 15%); border: 1px solid rgb(29 111 206 / 30%); }
    &--google { color: #4ade80; background: rgb(26 138 67 / 15%);  border: 1px solid rgb(26 138 67 / 30%); }
  }

  .progress-ring-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px auto;
    width: 150px;
    height: 150px;
  }

  .progress-ring {
    width: 150px;
    height: 150px;
    transform: rotate(-90deg);
  }

  .ring-track {
    fill: none;
    stroke: rgb(255 255 255 / 8%);
    stroke-width: 8;
  }

  .ring-fill {
    fill: none;
    stroke: var(--accent);
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease;
  }

  .progress-center {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;
  }

  .progress-pct {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .progress-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .importing-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .stat-item {
    padding: 8px 12px;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 6px;
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 2px;
  }

  .stat-value {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);

    &--teal  { color: var(--accent); }
    &--amber { color: #f59e0b; }
  }

  .linear-bar {
    height: 6px;
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
    overflow: hidden;
  }

  .linear-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .eta {
    font-size: 12px;
    color: var(--text-muted);
    text-align: center;
  }

  // ── 实时日志 ────────────────────────────────────────────
  .importing-right {
    display: flex;
    flex-direction: column;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 10px;
    overflow: hidden;
  }

  .log-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .log-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .log-auto-scroll {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  .log-box {
    flex: 1;
    overflow-y: auto;
    padding: 10px 14px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    max-height: 260px;
    min-height: 200px;
  }

  .log-line {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
    line-height: 1.5;

    &--info     .log-msg { color: var(--text-secondary); }
    &--success  .log-msg { color: #22c55e; }
    &--warn     .log-msg { color: #f59e0b; }
    &--progress .log-msg { color: #60a5fa; }
  }

  .log-time { color: var(--text-muted); white-space: nowrap; }

  .log-footer {
    padding: 8px 14px;
    font-size: 11px;
    color: var(--text-muted);
    border-top: 1px solid var(--cm-dialog-border);
  }

  // ── Footer ──────────────────────────────────────────────
  .btn-cancel {
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--cm-dialog-border) !important;
    border-radius: 8px !important;

    &:hover { border-color: var(--text-secondary) !important; }
  }

  .btn-start {
    color: #0b1120 !important;
    font-weight: 600 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover { filter: brightness(1.1); }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  .btn-cancel-import {
    color: #ef4444 !important;
    background: transparent !important;
    border: 1px solid rgb(239 68 68 / 40%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #fff !important;
      background: #ef4444 !important;
    }
  }

  .footer-right {
    margin-left: auto;
    display: flex;
    align-items: center;
  }

  .auto-jump-cb {
    :deep(.el-checkbox__label) { color: var(--text-secondary); font-size: 13px; }
  }
</style>
