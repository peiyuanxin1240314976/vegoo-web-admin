<template>
  <el-dialog
    v-model="dialogVisible"
    title="删除应用"
    class="app-delete-dialog"
    width="520px"
    :close-on-click-modal="false"
    align-center
  >
    <div class="delete-body">
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

      <!-- 提示文本 -->
      <div class="confirm-title">确定要删除该应用吗?</div>
      <div class="confirm-subtitle">删除后该应用的所有配置将被清除</div>

      <!-- 应用信息卡片 -->
      <div class="app-info-card">
        <div class="app-info-icon" :style="{ background: props.appData?.iconColor || '#2dd4bf' }">
          {{ props.appData?.appName?.charAt(0) || 'A' }}
        </div>
        <div class="app-info-detail">
          <div class="app-info-row">
            <span class="app-info-label">应用名称</span>
            <span class="app-info-name">{{ props.appData?.appName || '—' }}</span>
          </div>
          <div class="app-info-row">
            <span class="app-info-id">ID: {{ props.appData?.id || '—' }}</span>
          </div>
        </div>
        <span
          :class="[
            'platform-badge',
            props.appData?.platform === 'Android'
              ? 'platform-badge--android'
              : 'platform-badge--ios'
          ]"
        >
          <span class="platform-dot" />{{ props.appData?.platform || 'Android' }}
        </span>
        <span class="category-badge">{{ props.appData?.category || '' }}</span>
      </div>

      <!-- 不可恢复警告 -->
      <div class="irreversible-warning">
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
        <span>此操作不可恢复，请谨慎操作</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="delete-footer">
        <ElButton round class="btn-cancel" @click="handleCancel">取消</ElButton>
        <ElButton round class="btn-confirm-delete" :loading="loading" @click="handleConfirm">
          确认删除
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { ApplicationAppItem } from '../types'

  defineOptions({ name: 'AppDeleteDialog' })

  const props = defineProps<{
    visible: boolean
    appData?: ApplicationAppItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
    cancel: []
  }>()

  // ─── 响应式 ────────────────────────────────────────────
  const loading = ref(false)
  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  // ─── 处理函数 ──────────────────────────────────────────
  const handleConfirm = async () => {
    loading.value = true
    // 模拟异步操作，实际接入时替换为 API 调用
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
  // ─── 全局覆盖（非 scoped） ─────────────────────────────
  .app-delete-dialog {
    --bg-dialog: #131c2e;
    --bg-inner: #0f1829;
    --border: rgb(255 255 255 / 8%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --amber: #f59e0b;
    --android-green: #22c55e;
    --ios-blue: #60a5fa;
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 15%);

    .el-dialog {
      overflow: hidden;
      background: var(--bg-dialog) !important;
      border: 1px solid var(--border);
      border-radius: 14px !important;
      box-shadow: 0 32px 80px rgb(0 0 0 / 65%) !important;
    }

    .el-dialog__header {
      padding: 18px 24px 16px;
      margin: 0;
      background: var(--bg-inner);
      border-bottom: 1px solid var(--border);
    }

    .el-dialog__title {
      font-size: 15px !important;
      font-weight: 600 !important;
      color: var(--text-primary) !important;
    }

    .el-dialog__headerbtn .el-icon {
      color: var(--text-muted) !important;

      &:hover {
        color: var(--text-primary) !important;
      }
    }

    .el-dialog__body {
      padding: 0 !important;
    }

    .el-dialog__footer {
      padding: 0 !important;
      background: var(--bg-inner);
      border-top: 1px solid var(--border);
    }
  }
</style>

<style lang="scss" scoped>
  // ─── 弹窗主体 ──────────────────────────────────────────
  .delete-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 32px 24px;
    text-align: center;
  }

  // ─── 警告图标动画 ──────────────────────────────────────
  .warning-icon-wrap {
    position: relative;
    width: 72px;
    height: 72px;
    margin-bottom: 20px;
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
    0% {
      opacity: 0.8;
      transform: scale(0.92);
    }

    50% {
      opacity: 0.3;
      transform: scale(1.04);
    }

    100% {
      opacity: 0.8;
      transform: scale(0.92);
    }
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
    width: 28px;
    height: 28px;
    color: #f59e0b;
  }

  // ─── 文字 ──────────────────────────────────────────────
  .confirm-title {
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .confirm-subtitle {
    margin-bottom: 20px;
    font-size: 13px;
    color: #64748b;
  }

  // ─── 应用信息卡 ────────────────────────────────────────
  .app-info-card {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    padding: 14px 16px;
    margin-bottom: 16px;
    text-align: left;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 10px;
  }

  .app-info-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    border-radius: 9px;
  }

  .app-info-detail {
    flex: 1;
  }

  .app-info-row {
    display: flex;
    gap: 6px;
    align-items: center;

    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  .app-info-label {
    font-size: 11px;
    color: #64748b;
  }

  .app-info-name {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .app-info-id {
    font-size: 12px;
    color: #64748b;
  }

  .platform-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 4px 9px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 5px;

    &--android {
      color: #22c55e;
      background: rgb(34 197 94 / 10%);
    }

    &--ios {
      color: #60a5fa;
      background: rgb(96 165 250 / 10%);
    }
  }

  .platform-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .platform-badge--android & {
      background: #22c55e;
    }

    .platform-badge--ios & {
      background: #60a5fa;
    }
  }

  .category-badge {
    padding: 3px 8px;
    font-size: 11px;
    color: #94a3b8;
    background: rgb(255 255 255 / 5%);
    border-radius: 4px;
  }

  // ─── 不可恢复提示 ──────────────────────────────────────
  .irreversible-warning {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    padding: 11px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #f59e0b;
    background: rgb(245 158 11 / 8%);
    border: 1px solid rgb(245 158 11 / 25%);
    border-radius: 8px;
  }

  .warn-icon {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }

  // ─── 底部按钮 ──────────────────────────────────────────
  .delete-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
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
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0 !important;
      background: rgb(255 255 255 / 4%) !important;
      border-color: rgb(255 255 255 / 20%) !important;
    }
  }

  .btn-confirm-delete {
    flex: 1;
    height: 40px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: #ef4444 !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.15s;

    &:hover {
      background: #dc2626 !important;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }

    &.is-loading {
      opacity: 0.8;
    }
  }
</style>
