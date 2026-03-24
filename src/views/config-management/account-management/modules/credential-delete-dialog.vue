<template>
  <el-dialog
    v-model="dialogVisible"
    title="删除凭据"
    width="440px"
    :close-on-click-modal="false"
    header-class="cred-delete-dialog-hd"
    body-class="cred-delete-dialog-bd"
    footer-class="cred-delete-dialog-ft"
  >
    <!-- 红色 X 图标 -->
    <div class="delete-icon-wrap">
      <div class="delete-icon-ring">
        <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
          <circle cx="24" cy="24" r="22" fill="rgb(248 113 113 / 15%)" stroke="#f87171" stroke-width="2" />
          <path d="M16 16l16 16M32 16L16 32" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" />
        </svg>
      </div>
    </div>

    <!-- 标题 -->
    <p class="delete-title">确认删除以下凭据？</p>
    <p class="delete-cred-name">{{ credData?.name }}</p>

    <!-- 警告列表 -->
    <div class="warn-list">
      <div class="warn-item warn-item--amber">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
          <path d="M8 2L14 13H2L8 2Z" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M8 6v4" stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="8" cy="12" r="0.6" fill="#f59e0b"/>
        </svg>
        该凭据当前关联 <strong>{{ credData?.accountCount }}</strong> 个广告账户
      </div>
      <div class="warn-item warn-item--amber">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
          <path d="M8 2L14 13H2L8 2Z" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M8 6v4" stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="8" cy="12" r="0.6" fill="#f59e0b"/>
        </svg>
        删除后这 <strong>{{ credData?.accountCount }}</strong> 个账户将无法进行API调用
      </div>
      <div class="warn-item warn-item--blue">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
          <circle cx="8" cy="8" r="7" stroke="#3b82f6" stroke-width="1.4"/>
          <path d="M8 7v4M8 5v.5" stroke="#3b82f6" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        建议先将账户更换为其他凭据再删除
      </div>
    </div>

    <!-- 关联账户列表 -->
    <div v-if="credData?.accountIds?.length" class="affected-section">
      <div class="affected-label">Affected accounts list:</div>
      <div class="affected-chips">
        <span v-for="acc in credData.accountIds.slice(0, 6)" :key="acc" class="acc-chip">{{ acc }}</span>
        <span v-if="credData.accountIds.length > 6" class="acc-more">+{{ credData.accountIds.length - 6 }}</span>
      </div>
    </div>

    <!-- 输入凭据名确认 -->
    <div class="confirm-input-section">
      <div class="confirm-input-label">请输入凭据名称确认</div>
      <el-input
        v-model="confirmName"
        :placeholder="credData?.name"
        class="confirm-input"
        clearable
      />
    </div>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
      <ElButton
        round
        :disabled="!canConfirm"
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
  import type { CredentialItem } from '../types'

  defineOptions({ name: 'CredentialDeleteDialog' })

  const props = defineProps<{
    visible: boolean
    credData: CredentialItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const confirmName = ref('')
  const deleting = ref(false)

  watch(() => props.visible, (v) => {
    if (v) confirmName.value = ''
  })

  const canConfirm = computed(
    () => confirmName.value.trim() === props.credData?.name
  )

  const handleCancel = () => emit('update:visible', false)

  const handleConfirm = async () => {
    if (!canConfirm.value) return
    deleting.value = true
    try {
      await new Promise((r) => setTimeout(r, 600))
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
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__header.cred-delete-dialog-hd {
    padding: 18px 20px 16px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__body.cred-delete-dialog-bd {
    padding: 20px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.cred-delete-dialog-bd) .el-dialog__footer.cred-delete-dialog-ft {
    padding: 14px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
    text-align: right;
  }
</style>

<style lang="scss" scoped>
  // ─── 图标 ────────────────────────────────────────────
  .delete-icon-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .delete-icon-ring {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '';
      position: absolute;
      width: 72px;
      height: 72px;
      background: rgb(248 113 113 / 8%);
      border-radius: 50%;
    }
  }

  // ─── 标题 ────────────────────────────────────────────
  .delete-title {
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    text-align: center;
  }

  .delete-cred-name {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 700;
    color: #34d399;
    text-align: center;
  }

  // ─── 警告列表 ────────────────────────────────────────
  .warn-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .warn-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 13px;

    &--amber { color: #fcd34d; strong { color: #f59e0b; } }
    &--blue  { color: #93c5fd; }
  }

  .warn-icon { flex-shrink: 0; margin-top: 1px; }

  // ─── 受影响账户 ──────────────────────────────────────
  .affected-section {
    margin-bottom: 20px;
  }

  .affected-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .affected-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .acc-chip {
    padding: 3px 10px;
    font-size: 12px;
    color: #94a3b8;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 4px;
  }

  .acc-more {
    font-size: 12px;
    color: #64748b;
    line-height: 24px;
  }

  // ─── 输入确认 ────────────────────────────────────────
  .confirm-input-section {
    margin-top: 4px;
  }

  .confirm-input-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: #94a3b8;
  }

  .confirm-input {
    width: 100%;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px;
      box-shadow: none !important;
      transition: border-color 0.18s;

      &:focus-within { border-color: #f87171 !important; }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0;
      &::placeholder { color: #475569; }
    }
  }

  // ─── 底部按钮 ────────────────────────────────────────
  .dialog-btn {
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

      &:not(:disabled):hover { filter: brightness(1.1); }

      &.is-disabled {
        opacity: 0.4 !important;
        cursor: not-allowed !important;
      }
    }
  }
</style>
