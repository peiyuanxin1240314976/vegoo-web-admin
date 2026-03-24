<template>
  <el-dialog
    v-model="dialogVisible"
    title="分配凭据并激活"
    width="460px"
    :close-on-click-modal="false"
    header-class="oa-assign-dialog-hd"
    body-class="oa-assign-dialog-bd"
    footer-class="oa-assign-dialog-ft"
  >
    <!-- 开户记录信息卡 -->
    <div class="record-card">
      <div class="record-card-top">
        <span class="record-platform-icon" :style="{ color: getPlatformColor(data?.source ?? ''), background: getPlatformBg(data?.source ?? '') }">
          {{ getPlatformShort(data?.source ?? '') }}
        </span>
        <span class="record-id">{{ data?.id }}</span>
        <span class="record-meta">{{ data?.app }} {{ data?.platform }} {{ data?.accountType }}</span>
        <span class="record-agency">{{ data?.agency }}</span>
      </div>
      <div v-if="data?.adAccountId" class="record-account-info">
        <div class="record-account-item">
          <span class="record-account-key">广告账户ID</span>
          <span class="record-account-val">{{ data.adAccountId }}</span>
        </div>
        <div class="record-account-item">
          <span class="record-account-key">广告账户名称</span>
          <span class="record-account-val">{{ data.adAccountName }}</span>
        </div>
      </div>
    </div>

    <!-- 选择凭据 -->
    <div class="select-cred-label">选择凭据</div>
    <el-select
      v-model="selectedCred"
      placeholder="请选择凭据"
      class="cred-select"
      popper-class="cred-select-dropdown"
    >
      <el-option
        v-for="c in credentialList"
        :key="c.name"
        :label="c.name"
        :value="c.name"
      >
        <div class="cred-option">
          <span class="cred-option-icon" :style="{ color: getPlatformColor(c.source) }">
            {{ getPlatformShort(c.source) }}
          </span>
          <span class="cred-option-name">{{ c.name }}</span>
        </div>
      </el-option>
    </el-select>

    <!-- 选中凭据详情展示 -->
    <div v-if="selectedCredInfo" class="cred-detail-card">
      <div class="cred-detail-row">
        <span class="cred-detail-key">凭据类型</span>
        <span class="cred-detail-val">{{ selectedCredInfo.credentialType }}</span>
      </div>
      <div class="cred-detail-row">
        <span class="cred-detail-key">广告平台</span>
        <span class="cred-detail-val">{{ selectedCredInfo.source }}</span>
      </div>
      <div class="cred-detail-row">
        <span class="cred-detail-key">关联应用</span>
        <span class="cred-detail-val">{{ selectedCredInfo.apps.join('，') }}</span>
      </div>
      <div class="cred-detail-row">
        <span class="cred-detail-key">验证状态</span>
        <span :class="['cred-validate-status', selectedCredInfo.status === '验证正常' ? 'cred-validate-status--ok' : 'cred-validate-status--fail']">
          <span class="cred-validate-dot" />{{ selectedCredInfo.status }}
        </span>
      </div>
      <div class="cred-detail-row">
        <span class="cred-detail-key">可访问账户</span>
        <span class="cred-detail-val">{{ selectedCredInfo.accountCount }}个</span>
      </div>
    </div>

    <!-- 提示信息 -->
    <div v-if="selectedCredInfo" class="assign-hint">
      <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="hint-icon">
        <circle cx="8" cy="8" r="7" stroke="#3b82f6" stroke-width="1.4"/>
        <path d="M8 7v4M8 5v.5" stroke="#3b82f6" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      分配后该广告账户将可通过 <strong>{{ selectedCred }}</strong> 凭据进行API调用，状态将变更为「已激活」
    </div>

    <div class="feishu-tip">
      <span class="feishu-tip-dot" />分配完成后自动推送飞书通知
    </div>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
      <ElButton
        round
        :disabled="!selectedCred"
        class="dialog-btn dialog-btn--confirm"
        :loading="submitting"
        @click="handleConfirm"
      >
        确认分配并激活
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { cloneCredentialMockList } from '../mock/data'
  import { PLATFORM_CONFIGS } from '../types'
  import type { OpenAccountItem } from '../types'

  defineOptions({ name: 'OpenAccountAssignDialog' })

  const props = defineProps<{ visible: boolean; data: OpenAccountItem | null }>()
  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [credential: string]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const selectedCred = ref('')
  const submitting = ref(false)
  const credentialList = cloneCredentialMockList().filter((c) => c.status === '验证正常')

  watch(() => props.visible, (v) => {
    if (v) selectedCred.value = ''
  })

  const selectedCredInfo = computed(() =>
    credentialList.find((c) => c.name === selectedCred.value) ?? null
  )

  function getPlatformColor(s: string) { return PLATFORM_CONFIGS.find((p) => p.value === s)?.color ?? '#94a3b8' }
  function getPlatformBg(s: string)    { return PLATFORM_CONFIGS.find((p) => p.value === s)?.bg    ?? 'rgb(148 163 184 / 12%)' }
  function getPlatformShort(s: string) { return PLATFORM_CONFIGS.find((p) => p.value === s)?.shortLabel ?? s[0] }

  const handleCancel = () => emit('update:visible', false)
  const handleConfirm = async () => {
    if (!selectedCred.value) return
    submitting.value = true
    try {
      await new Promise((r) => setTimeout(r, 700))
      emit('success', selectedCred.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss">
  .el-dialog:has(.oa-assign-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }
  .el-dialog:has(.oa-assign-dialog-bd) .el-dialog__header.oa-assign-dialog-hd {
    padding: 18px 20px 14px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }
  .el-dialog:has(.oa-assign-dialog-bd) .el-dialog__title {
    font-size: 15px; font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }
  .el-dialog:has(.oa-assign-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }
  .el-dialog:has(.oa-assign-dialog-bd) .el-dialog__body.oa-assign-dialog-bd {
    padding: 18px 20px 8px;
    background: var(--cm-dialog-bg-inner);
  }
  .el-dialog:has(.oa-assign-dialog-bd) .el-dialog__footer.oa-assign-dialog-ft {
    padding: 14px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
    text-align: right;
  }
</style>

<style lang="scss" scoped>
  // ─── 开户记录卡 ──────────────────────────────────────
  .record-card {
    padding: 14px 16px;
    margin-bottom: 16px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 10px;
  }

  .record-card-top {
    display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
    margin-bottom: 10px;
  }

  .record-platform-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    font-size: 11px; font-weight: 700;
    border-radius: 6px; flex-shrink: 0;
  }

  .record-id {
    font-size: 15px; font-weight: 700;
    font-family: 'SF Mono', monospace; color: #e2e8f0;
  }

  .record-meta {
    font-size: 13px; color: #94a3b8;
  }

  .record-agency {
    font-size: 13px; color: #22d3ee; margin-left: auto;
  }

  .record-account-info {
    display: flex; flex-direction: column; gap: 6px;
    padding-top: 10px;
    border-top: 1px solid rgb(255 255 255 / 6%);
  }

  .record-account-item {
    display: flex; gap: 12px; align-items: center;
    font-size: 13px;
  }

  .record-account-key { width: 80px; color: #64748b; flex-shrink: 0; }
  .record-account-val { color: #e2e8f0; }

  // ─── 凭据选择 ────────────────────────────────────────
  .select-cred-label {
    margin-bottom: 8px;
    font-size: 13px; color: #94a3b8;
  }

  .cred-select {
    width: 100%;
    margin-bottom: 12px;

    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 8px; box-shadow: none !important;
      &:focus-within { border-color: #0d9488 !important; }
    }

    :deep(.el-select__placeholder) {
      font-size: 13px; color: #64748b;
    }
  }

  .cred-option {
    display: flex; gap: 8px; align-items: center;
  }

  .cred-option-icon {
    font-size: 11px; font-weight: 700;
  }

  .cred-option-name { font-size: 13px; color: #e2e8f0; }

  // ─── 凭据详情卡 ──────────────────────────────────────
  .cred-detail-card {
    padding: 12px 16px;
    margin-bottom: 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;
    display: flex; flex-direction: column; gap: 8px;
  }

  .cred-detail-row {
    display: flex; gap: 16px; align-items: center; font-size: 13px;
  }

  .cred-detail-key { width: 72px; color: #64748b; flex-shrink: 0; }
  .cred-detail-val { color: #e2e8f0; }

  .cred-validate-status {
    display: inline-flex; gap: 5px; align-items: center; font-size: 12px;
    &--ok { color: #22c55e; .cred-validate-dot { background: #22c55e; } }
    &--fail { color: #f87171; .cred-validate-dot { background: #f87171; } }
  }

  .cred-validate-dot {
    display: inline-block; width: 6px; height: 6px; border-radius: 50%;
  }

  // ─── 提示 ────────────────────────────────────────────
  .assign-hint {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 10px 14px; margin-bottom: 10px;
    font-size: 13px; color: #93c5fd;
    background: rgb(59 130 246 / 8%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 8px;

    strong { color: #60a5fa; }
  }

  .hint-icon { flex-shrink: 0; margin-top: 1px; }

  .feishu-tip {
    display: flex; gap: 6px; align-items: center;
    font-size: 12px; color: #22c55e;
    margin-bottom: 4px;
  }

  .feishu-tip-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e; flex-shrink: 0;
  }

  // ─── 底部按钮 ────────────────────────────────────────
  .dialog-btn {
    border-radius: 8px !important;
    &--cancel {
      color: #94a3b8 !important; background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      &:hover { color: #e2e8f0 !important; }
    }
    &--confirm {
      color: #fff !important; background: #0d9488 !important; border: none !important;
      &:not(.is-disabled):hover { filter: brightness(1.1); }
      &.is-disabled { opacity: 0.4 !important; cursor: not-allowed !important; }
    }
  }
</style>
