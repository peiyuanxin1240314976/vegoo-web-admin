<template>
  <el-dialog
    v-model="dialogVisible"
    width="440px"
    :close-on-click-modal="false"
    :show-close="true"
    header-class="cred-delete-dialog-hd"
    body-class="cred-delete-dialog-bd"
    footer-class="cred-delete-dialog-ft"
  >
    <template #header>
      <span />
    </template>

    <!-- 红色 X 图标 -->
    <div class="delete-icon-wrap">
      <div class="delete-icon-ring">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
          <circle cx="24" cy="24" r="22" fill="rgb(239 68 68 / 12%)" stroke="#ef4444" stroke-width="1.8" />
          <path d="M17 17l14 14M31 17L17 31" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <!-- 标题 -->
    <p class="delete-title">确认删除</p>
    <p class="delete-subtitle">删除后数据无法恢复，请谨慎操作</p>

    <!-- 凭证信息卡片 -->
    <div class="info-card">
      <div class="info-card__header">将要删除的凭证</div>
      <div class="info-card__body">
        <div class="info-row">
          <span class="info-label">凭证名称</span>
          <span class="info-value">{{ credData?.name ?? '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">凭证类型</span>
          <span class="info-value">{{ credData?.credentialType ?? '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">关联账户</span>
          <span class="info-value">{{ relatedAccountText }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
      <ElButton
        round
        class="dialog-btn dialog-btn--delete"
        :loading="deleting"
        @click="handleConfirm"
      >
        确认删除
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { CredentialItem, AdAccountItem } from '../types'

  defineOptions({ name: 'CredentialDeleteDialog' })

  const props = defineProps<{
    visible: boolean
    credData: CredentialItem | null
    accountData?: AdAccountItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const deleting = ref(false)

  watch(() => props.visible, (v) => {
    if (!v) deleting.value = false
  })

  const relatedAccountText = computed(() => {
    if (props.accountData) {
      return `${props.accountData.accountName}（${props.accountData.id}）`
    }
    if (props.credData?.accountCount) {
      return `${props.credData.accountCount} 个广告账户`
    }
    return '—'
  })

  const handleCancel = () => emit('update:visible', false)

  const handleConfirm = async () => {
    deleting.value = true
    try {
      await new Promise((r) => setTimeout(r, 500))
      emit('confirm')
      emit('update:visible', false)
    } finally {
      deleting.value = false
    }
  }
</script>

<!-- 非 scoped -->
<style lang="scss">
  .el-dialog:has(.cred-delete-dialog-bd) {
    overflow: hidden;
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__header.cred-delete-dialog-hd {
    padding: 12px 16px 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: none;

    .el-dialog__headerbtn {
      top: 12px;
      right: 16px;
      .el-icon { color: var(--cm-dialog-text-muted) !important; }
      &:hover .el-icon { color: var(--cm-dialog-text-primary) !important; }
    }
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__body.cred-delete-dialog-bd {
    padding: 8px 28px 20px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__footer.cred-delete-dialog-ft {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 0 28px 24px;
    background: var(--cm-dialog-bg-inner);
    border-top: none;
  }
</style>

<style lang="scss" scoped>
  // ─── 图标 ────────────────────────────────────────────
  .delete-icon-wrap {
    display: flex;
    justify-content: center;
    margin-top: 8px;
    margin-bottom: 16px;
  }

  .delete-icon-ring {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    background: rgb(239 68 68 / 8%);
    border-radius: 50%;
  }

  // ─── 标题 ────────────────────────────────────────────
  .delete-title {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    text-align: center;
  }

  .delete-subtitle {
    margin: 0 0 24px;
    font-size: 13px;
    color: #64748b;
    text-align: center;
  }

  // ─── 信息卡片 ────────────────────────────────────────
  .info-card {
    margin-bottom: 4px;
    overflow: hidden;
    border: 1px solid rgb(245 158 11 / 35%);
    border-radius: 8px;
  }

  .info-card__header {
    padding: 9px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #f59e0b;
    letter-spacing: 0.02em;
    background: rgb(245 158 11 / 10%);
    border-bottom: 1px solid rgb(245 158 11 / 20%);
  }

  .info-card__body {
    padding: 4px 0;
    background: rgb(245 158 11 / 5%);
  }

  .info-row {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 9px 14px;

    & + & {
      border-top: 1px solid rgb(245 158 11 / 10%);
    }
  }

  .info-label {
    flex-shrink: 0;
    width: 72px;
    font-size: 12px;
    color: #94a3b8;
  }

  .info-value {
    flex: 1;
    font-size: 13px;
    color: #e2e8f0;
    word-break: break-all;
  }

  // ─── 底部按钮 ────────────────────────────────────────
  .dialog-btn {
    padding: 8px 20px !important;
    border-radius: 8px !important;

    &--cancel {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      &:hover { color: #e2e8f0 !important; border-color: rgb(255 255 255 / 20%) !important; }
    }

    &--delete {
      color: #fff !important;
      background: #ef4444 !important;
      border: none !important;
      &:hover { filter: brightness(1.1); }
    }
  }
</style>
