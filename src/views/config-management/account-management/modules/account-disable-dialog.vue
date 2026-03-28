<template>
  <el-dialog
    v-model="dialogVisible"
    title="停用广告账户"
    width="480px"
    :close-on-click-modal="false"
    align-center
    header-class="acc-disable-dialog-hd"
    body-class="acc-disable-dialog-bd"
    footer-class="acc-disable-dialog-ft"
    @close="handleCancel"
  >
    <div class="disable-body">
      <!-- 警告图标 -->
      <div class="warning-icon-wrap">
        <div class="warning-ring warning-ring--outer" />
        <div class="warning-ring warning-ring--inner" />
        <div class="warning-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" class="warning-svg">
            <path d="M12 9v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" />
          </svg>
        </div>
      </div>

      <!-- 确认文本 -->
      <div class="confirm-title">确认停用以下账户?</div>
      <div class="confirm-account-name">
        {{ accountData?.accountName }}
        <span class="confirm-account-id">({{ accountData?.id }})</span>
      </div>

      <!-- 警告信息列表 -->
      <div class="warning-list">
        <div class="warning-item warning-item--warn">
          <svg class="warn-icon" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2L14.9 14H1.1L8 2Z"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
            <path d="M8 7v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
          <span>该账户当前余额：${{ (accountData?.balance ?? 0).toLocaleString('en-US') }}</span>
        </div>
        <div class="warning-item warning-item--warn">
          <svg class="warn-icon" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 2L14.9 14H1.1L8 2Z"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
            <path d="M8 7v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
          </svg>
          <span>关联广告系列：0 个在投</span>
        </div>
        <div class="warning-item warning-item--info">
          <svg class="info-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
            <path d="M8 7v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            <circle cx="8" cy="5" r="0.75" fill="currentColor" />
          </svg>
          <span>停用后可随时重启用</span>
        </div>
      </div>

      <!-- 输入确认 -->
      <div class="confirm-input-wrap">
        <div class="confirm-input-label">
          请输入账户名称确认
        </div>
        <el-input
          v-model="confirmName"
          :placeholder="accountData?.accountName"
          class="dark-input confirm-input"
        />
      </div>
    </div>

    <template #footer>
      <div class="disable-footer">
        <ElButton round class="btn-cancel" @click="handleCancel">取消</ElButton>
        <ElButton
          round
          class="btn-confirm-disable"
          :disabled="!isConfirmValid"
          :loading="loading"
          @click="handleConfirm"
        >
          确认停用
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { AdAccountItem } from '../types'

  defineOptions({ name: 'AccountDisableDialog' })

  const props = defineProps<{
    visible: boolean
    accountData?: AdAccountItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
    cancel: []
  }>()

  const loading = ref(false)
  const confirmName = ref('')

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const isConfirmValid = computed(
    () => confirmName.value.trim() === (props.accountData?.accountName ?? '')
  )

  watch(
    () => props.visible,
    (v) => {
      if (v) confirmName.value = ''
    }
  )

  const handleConfirm = async () => {
    if (!isConfirmValid.value) return
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 600))
    loading.value = false
    emit('confirm')
  }

  const handleCancel = () => {
    emit('cancel')
    emit('update:visible', false)
  }
</script>

<style lang="scss">
  .el-dialog:has(.acc-disable-dialog-bd) {
    overflow: hidden;
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 14px !important;
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }

  .el-dialog:has(.acc-disable-dialog-bd) .el-dialog__header.acc-disable-dialog-hd {
    padding: 18px 24px 16px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 14px 14px 0 0;
  }

  .el-dialog:has(.acc-disable-dialog-bd) .el-dialog__title {
    font-size: 15px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.acc-disable-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }

  .el-dialog:has(.acc-disable-dialog-bd) .el-dialog__body.acc-disable-dialog-bd {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.acc-disable-dialog-bd) .el-dialog__footer.acc-disable-dialog-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 14px 14px;
  }
</style>

<style lang="scss" scoped>
  .disable-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 32px 20px;
    text-align: center;
  }

  // ─── 警告图标 ──────────────────────────────────────────
  .warning-icon-wrap {
    position: relative;
    width: 68px;
    height: 68px;
    margin-bottom: 18px;
  }

  .warning-ring {
    position: absolute;
    border: 1.5px solid rgb(245 158 11 / 30%);
    border-radius: 50%;
    animation: pulse-ring 2s ease-out infinite;

    &--outer {
      inset: -8px;
      animation-delay: 0.3s;
    }

    &--inner {
      inset: -2px;
    }
  }

  @keyframes pulse-ring {
    0% { opacity: 0.8; transform: scale(0.92); }
    50% { opacity: 0.3; transform: scale(1.04); }
    100% { opacity: 0.8; transform: scale(0.92); }
  }

  .warning-icon-circle {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 40% 35%, rgb(245 158 11 / 25%), rgb(245 158 11 / 10%));
    border: 1.5px solid rgb(245 158 11 / 50%);
    border-radius: 50%;
  }

  .warning-svg {
    width: 26px;
    height: 26px;
    color: #f59e0b;
  }

  // ─── 确认文本 ──────────────────────────────────────────
  .confirm-title {
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .confirm-account-name {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 700;
    color: #f59e0b;
  }

  .confirm-account-id {
    margin-left: 4px;
    font-size: 13px;
    font-weight: 400;
    color: #94a3b8;
  }

  // ─── 警告列表 ──────────────────────────────────────────
  .warning-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    margin-bottom: 20px;
  }

  .warning-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 7px;

    &--warn {
      color: #f59e0b;
      background: rgb(245 158 11 / 8%);
      border: 1px solid rgb(245 158 11 / 20%);
    }

    &--info {
      color: #60a5fa;
      background: rgb(59 130 246 / 8%);
      border: 1px solid rgb(59 130 246 / 20%);
    }
  }

  .warn-icon,
  .info-icon {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }

  // ─── 确认输入 ──────────────────────────────────────────
  .confirm-input-wrap {
    width: 100%;
  }

  .confirm-input-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: #64748b;
    text-align: left;
  }

  .confirm-input {
    width: 100%;
  }

  // ─── 底部 ──────────────────────────────────────────────
  .disable-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px;
  }

  .btn-cancel {
    flex: 1;
    height: 40px !important;
    font-size: 14px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #e2e8f0 !important;
      background: rgb(255 255 255 / 4%) !important;
    }
  }

  .btn-confirm-disable {
    flex: 1;
    height: 40px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: #ef4444 !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.15s;

    &:not(:disabled):hover {
      background: #dc2626 !important;
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed !important;
      opacity: 0.4 !important;
    }
  }

  // ─── 深色输入框 ────────────────────────────────────────
  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover { border-color: rgb(245 158 11 / 40%) !important; }
      &.is-focus { border-color: #f59e0b !important; }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;

      &::placeholder { color: #475569 !important; }
    }
  }
</style>
