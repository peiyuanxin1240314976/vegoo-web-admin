<template>
  <el-dialog
    v-model="dialogVisible"
    title="批量导入国家"
    width="600px"
    :close-on-click-modal="false"
    header-class="cm-country-import-hd"
    body-class="cm-country-import-bd"
    footer-class="cm-country-import-ft"
    @close="handleClose"
  >
    <div class="import-subtitle">支持 Excel / CSV 格式，请下载模板后填写并上传</div>

    <!-- 步骤条 -->
    <div class="steps-bar">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="step-item"
        :class="{ 'step-item--active': currentStep === idx, 'step-item--done': currentStep > idx }"
      >
        <div class="step-circle">
          <span v-if="currentStep > idx" class="step-check">✓</span>
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <span class="step-label">{{ step }}</span>
        <div v-if="idx < steps.length - 1" class="step-line" :class="{ 'step-line--done': currentStep > idx }" />
      </div>
    </div>

    <!-- Step 1: 下载模板 + 上传区域 -->
    <div v-if="currentStep === 0" class="step-content">
      <div class="download-section">
        <div class="download-title">下载导入模板</div>
        <div class="download-desc">模板包含所有必填字段，请严格按照模板格式填写</div>
        <div class="download-btns">
          <button class="tpl-btn tpl-btn--excel" @click="downloadTemplate('excel')">
            <span class="tpl-icon">📊</span>下载 Excel 模板
          </button>
          <button class="tpl-btn tpl-btn--csv" @click="downloadTemplate('csv')">
            <span class="tpl-icon">📄</span>下载 CSV 模板
          </button>
        </div>
      </div>

      <!-- 上传区域 -->
      <div
        class="upload-zone"
        :class="{ 'upload-zone--dragover': isDragOver, 'upload-zone--has-file': !!uploadFile }"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <template v-if="!uploadFile">
          <div class="upload-icon">☁</div>
          <div class="upload-text">拖拽文件到此处，或点击选择文件</div>
          <div class="upload-hint">支持 .xlsx, .csv 格式，文件大小不超过 10MB</div>
          <button class="select-file-btn" @click="triggerFileInput">选择文件</button>
        </template>
        <template v-else>
          <div class="file-selected">
            <span class="file-icon">📄</span>
            <span class="file-name">{{ uploadFile.name }}</span>
            <button class="file-remove-btn" @click="removeFile">
              <el-icon><Close /></el-icon>
            </button>
          </div>
        </template>
        <input
          ref="fileInputRef"
          type="file"
          accept=".xlsx,.csv"
          style="display: none"
          @change="handleFileChange"
        />
      </div>

      <div class="required-fields">
        必填字段：国家代码、中文名称、国家名称、时区、电话代码
      </div>
    </div>

    <!-- Step 2: 确认数据预览 -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="preview-info">
        <span class="preview-count">已解析 <strong>{{ previewRows }}</strong> 条记录</span>
        <span class="preview-hint">请确认数据无误后点击「确认导入」</span>
      </div>
      <div class="preview-table-wrap">
        <table class="preview-table">
          <thead>
            <tr>
              <th>国家代码</th>
              <th>中文名称</th>
              <th>国家名称</th>
              <th>时区</th>
              <th>电话代码</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in previewData" :key="i">
              <td>{{ row.code }}</td>
              <td>{{ row.nameCn }}</td>
              <td>{{ row.nameEn }}</td>
              <td>{{ row.timezone }}</td>
              <td>{{ row.phoneCode }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Step 3: 导入结果 -->
    <div v-if="currentStep === 2" class="step-content step-content--result">
      <div class="result-icon">✅</div>
      <div class="result-title">导入完成</div>
      <div class="result-desc">成功导入 {{ previewRows }} 条国家记录</div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton v-if="currentStep === 0" class="btn-next" :disabled="!uploadFile" @click="goNext">
          下一步
        </ElButton>
        <ElButton v-if="currentStep === 1" class="btn-next" @click="confirmImport">
          确认导入
        </ElButton>
        <ElButton v-if="currentStep === 2" class="btn-next" @click="handleClose">
          完成
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Close } from '@element-plus/icons-vue'
  import type { CountryFormModel } from '../types'

  defineOptions({ name: 'CountryImportDialog' })

  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [items: CountryFormModel[]]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const steps = ['下载模板', '上传文件', '确认导入']
  const currentStep = ref(0)
  const isDragOver = ref(false)
  const uploadFile = ref<File | null>(null)
  const fileInputRef = ref<HTMLInputElement>()

  // mock preview data
  const previewRows = ref(0)
  const previewData = ref<CountryFormModel[]>([])

  const triggerFileInput = () => fileInputRef.value?.click()

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) uploadFile.value = file
  }

  const handleDrop = (e: DragEvent) => {
    isDragOver.value = false
    const file = e.dataTransfer?.files?.[0]
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.csv'))) {
      uploadFile.value = file
    }
  }

  const removeFile = () => {
    uploadFile.value = null
    if (fileInputRef.value) fileInputRef.value.value = ''
  }

  const downloadTemplate = (type: 'excel' | 'csv') => {
    const header = 'code,nameCn,nameEn,timezone,phoneCode,code3,criteriaId,currency,currencySymbol,region,isMainMarket'
    const sample = 'US,美国,United States,GMT-5,1,840,2840,USD - 美元,$,北美,true'
    const content = `${header}\n${sample}`
    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `country_template.${type === 'csv' ? 'csv' : 'xlsx'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const goNext = () => {
    // mock parse: 真实接入后替换为文件解析结果
    previewData.value = Array.from({ length: 5 }, (_, i) => ({
      code: ['US', 'GB', 'DE', 'FR', 'JP'][i] ?? `C${i}`,
      code3: ['840', '826', '276', '250', '392'][i] ?? '',
      criteriaId: ['2840', '2826', '2276', '2250', '2392'][i] ?? '',
      nameCn: ['美国', '英国', '德国', '法国', '日本'][i] ?? `国家${i}`,
      nameEn: ['United States', 'United Kingdom', 'Germany', 'France', 'Japan'][i] ?? `Country${i}`,
      aliases: [],
      timezone: ['GMT-5', 'GMT+0', 'GMT+1', 'GMT+1', 'GMT+9'][i] ?? 'GMT+0',
      phoneCode: ['1', '44', '49', '33', '81'][i] ?? '0',
      currency: ['USD - 美元', 'GBP - 英镑', 'EUR - 欧元', 'EUR - 欧元', 'JPY - 日元'][i] ?? '',
      currencySymbol: ['$', '£', '€', '€', '¥'][i] ?? '',
      region: ['北美', '欧洲', '欧洲', '欧洲', '亚太'][i] ?? '其他',
      isMainMarket: i < 3
    }))
    previewRows.value = previewData.value.length
    currentStep.value = 1
  }

  const confirmImport = () => {
    emit('success', previewData.value)
    currentStep.value = 2
  }

  const handleClose = () => {
    emit('update:visible', false)
    setTimeout(() => {
      currentStep.value = 0
      uploadFile.value = null
      previewData.value = []
    }, 300)
  }
</script>

<style lang="scss">
  .el-dialog:has(.cm-country-import-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.cm-country-import-bd) .el-dialog__header.cm-country-import-hd {
    padding: 18px 24px 14px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.cm-country-import-bd) .el-dialog__title {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cm-country-import-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.cm-country-import-bd) .el-dialog__body.cm-country-import-bd {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.cm-country-import-bd) .el-dialog__footer.cm-country-import-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  .import-subtitle {
    padding: 10px 24px 0;
    font-size: 12px;
    color: #64748b;
  }

  // ─── 步骤条 ────────────────────────────────────────────
  .steps-bar {
    display: flex;
    gap: 0;
    align-items: center;
    justify-content: center;
    padding: 20px 40px 0;
  }

  .step-item {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    align-items: center;
  }

  .step-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    background: rgb(255 255 255 / 6%);
    border: 2px solid rgb(255 255 255 / 12%);
    border-radius: 50%;
    transition: all 0.25s;

    .step-item--active & {
      color: #0b1120;
      background: #2dd4bf;
      border-color: #2dd4bf;
    }

    .step-item--done & {
      color: #0b1120;
      background: #2dd4bf;
      border-color: #2dd4bf;
    }
  }

  .step-check {
    font-size: 14px;
  }

  .step-label {
    font-size: 12px;
    color: #64748b;
    transition: color 0.25s;

    .step-item--active & {
      color: #2dd4bf;
    }

    .step-item--done & {
      color: #2dd4bf;
    }
  }

  .step-line {
    position: absolute;
    top: 15px;
    left: calc(50% + 16px);
    width: calc(100% - 32px);
    height: 2px;
    background: rgb(255 255 255 / 8%);
    transition: background 0.25s;

    &--done {
      background: #2dd4bf;
    }
  }

  // ─── 内容区 ───────────────────────────────────────────
  .step-content {
    padding: 20px 24px 8px;
  }

  // ─── 下载区 ───────────────────────────────────────────
  .download-section {
    padding: 14px 16px;
    margin-bottom: 16px;
    background: rgb(255 255 255 / 2.5%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 9px;
  }

  .download-title {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .download-desc {
    margin-bottom: 12px;
    font-size: 12px;
    color: #64748b;
  }

  .download-btns {
    display: flex;
    gap: 10px;
  }

  .tpl-btn {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 7px 16px;
    font-size: 13px;
    cursor: pointer;
    border-radius: 7px;
    transition: all 0.15s;

    &--excel {
      color: #22c55e;
      background: rgb(34 197 94 / 8%);
      border: 1px solid rgb(34 197 94 / 25%);

      &:hover {
        background: rgb(34 197 94 / 14%);
      }
    }

    &--csv {
      color: #60a5fa;
      background: rgb(96 165 250 / 8%);
      border: 1px solid rgb(96 165 250 / 25%);

      &:hover {
        background: rgb(96 165 250 / 14%);
      }
    }
  }

  .tpl-icon {
    font-size: 15px;
  }

  // ─── 上传区 ───────────────────────────────────────────
  .upload-zone {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    padding: 24px;
    cursor: pointer;
    background: rgb(255 255 255 / 2%);
    border: 1.5px dashed rgb(255 255 255 / 12%);
    border-radius: 10px;
    transition: all 0.2s;

    &--dragover {
      background: rgb(45 212 191 / 5%);
      border-color: #2dd4bf;
    }

    &--has-file {
      cursor: default;
      border-style: solid;
      border-color: rgb(45 212 191 / 30%);
    }
  }

  .upload-icon {
    font-size: 36px;
    line-height: 1;
    color: #2dd4bf;
    opacity: 0.6;
  }

  .upload-text {
    font-size: 13px;
    color: #94a3b8;
  }

  .upload-hint {
    font-size: 12px;
    color: #475569;
  }

  .select-file-btn {
    padding: 6px 20px;
    font-size: 13px;
    color: #2dd4bf;
    cursor: pointer;
    background: none;
    border: 1px solid rgb(45 212 191 / 35%);
    border-radius: 7px;
    transition: all 0.15s;

    &:hover {
      background: rgb(45 212 191 / 8%);
    }
  }

  .file-selected {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .file-icon {
    font-size: 24px;
  }

  .file-name {
    font-size: 13px;
    color: #e2e8f0;
  }

  .file-remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: #64748b;
    cursor: pointer;
    background: rgb(255 255 255 / 5%);
    border: none;
    border-radius: 50%;

    &:hover {
      color: #ef4444;
    }
  }

  .required-fields {
    padding: 10px 12px;
    margin-top: 12px;
    font-size: 12px;
    color: #94a3b8;
    background: rgb(45 212 191 / 5%);
    border: 1px solid rgb(45 212 191 / 15%);
    border-radius: 7px;
  }

  // ─── 预览表格 ─────────────────────────────────────────
  .preview-info {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  .preview-count {
    font-size: 13px;
    color: #94a3b8;

    strong {
      color: #2dd4bf;
    }
  }

  .preview-hint {
    font-size: 12px;
    color: #64748b;
  }

  .preview-table-wrap {
    overflow: auto;
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 8px;
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;

    th {
      padding: 9px 12px;
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      text-align: left;
      background: rgb(255 255 255 / 3%);
      border-bottom: 1px solid rgb(255 255 255 / 7%);
    }

    td {
      padding: 9px 12px;
      font-size: 12px;
      color: #e2e8f0;
      border-bottom: 1px solid rgb(255 255 255 / 5%);
    }

    tr:last-child td {
      border-bottom: none;
    }
  }

  // ─── 导入结果 ─────────────────────────────────────────
  .step-content--result {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 40px 24px;
  }

  .result-icon {
    font-size: 48px;
    line-height: 1;
  }

  .result-title {
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .result-desc {
    font-size: 13px;
    color: #94a3b8;
  }

  // ─── 底部 ──────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 14px 24px;
  }

  .btn-cancel {
    padding: 8px 20px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #e2e8f0 !important;
    }
  }

  .btn-next {
    padding: 8px 24px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: #2dd4bf !important;
    border: none !important;
    border-radius: 8px !important;

    &:disabled {
      opacity: 0.4 !important;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      filter: brightness(1.1);
    }
  }
</style>
