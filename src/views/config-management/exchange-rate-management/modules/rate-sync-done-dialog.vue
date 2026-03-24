<template>
  <ElDialog
    :model-value="visible"
    title="同步完成"
    width="420px"
    :close-on-click-modal="false"
    header-class="cm-er-done-hd"
    body-class="cm-er-done-bd"
    footer-class="cm-er-done-ft"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="done-icon">
      <div class="check-circle">
        <span class="check-mark">✓</span>
      </div>
    </div>
    <div class="done-title">成功同步 {{ result.total }} 个货币对</div>
    <div class="done-time">同步时间：{{ result.syncTime }}</div>
    <div class="done-stats">
      <div class="stat-item">
        <span class="stat-label">成功</span>
        <span class="stat-value stat-value--success">{{ result.success }}个</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <span class="stat-label">覆盖手动</span>
        <span class="stat-value stat-value--warn">{{ result.overrideManual }}个</span>
      </div>
      <div class="stat-divider" />
      <div class="stat-item">
        <span class="stat-label">失败</span>
        <span class="stat-value stat-value--danger">{{ result.failed }}个</span>
      </div>
    </div>

    <template #footer>
      <ElButton round type="primary" @click="emit('update:visible', false)">关闭</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { SyncResult } from '../types'

  defineOptions({ name: 'RateSyncDoneDialog' })

  interface Props {
    visible: boolean
    result: SyncResult
  }

  defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
  }>()
</script>

<style lang="scss" scoped>
  .done-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .check-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgb(34 197 94 / 15%);
    border: 2px solid #22c55e;
    border-radius: 50%;
  }

  .check-mark {
    font-size: 28px;
    font-weight: 700;
    color: #22c55e;
  }

  .done-title {
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
    text-align: center;
  }

  .done-time {
    margin-bottom: 20px;
    font-size: 12px;
    color: #64748b;
    text-align: center;
  }

  .done-stats {
    display: flex;
    gap: 0;
    align-items: center;
    justify-content: center;
    padding: 14px 20px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 8px;
  }

  .stat-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .stat-label {
    font-size: 12px;
    color: #64748b;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 700;

    &--success { color: #22c55e; }
    &--warn    { color: #f59e0b; }
    &--danger  { color: #ef4444; }
  }

  .stat-divider {
    width: 1px;
    height: 32px;
    background: rgb(255 255 255 / 8%);
    flex-shrink: 0;
    margin: 0 8px;
  }
</style>

<style lang="scss">
  :has(.cm-er-done-bd) {
    --cm-dialog-bg: #111827;
    --cm-dialog-border: rgb(255 255 255 / 8%);

    .cm-er-done-hd {
      padding: 18px 20px 14px;
      background: var(--cm-dialog-bg) !important;
      border-bottom: 1px solid var(--cm-dialog-border);

      .el-dialog__title {
        font-size: 15px;
        font-weight: 600;
        color: #e2e8f0;
      }

      .el-dialog__headerbtn .el-dialog__close {
        color: #64748b;

        &:hover { color: #e2e8f0; }
      }
    }

    .cm-er-done-bd {
      padding: 24px 20px 16px;
      background: var(--cm-dialog-bg) !important;
    }

    .cm-er-done-ft {
      display: flex;
      justify-content: center;
      padding: 12px 20px 20px;
      background: var(--cm-dialog-bg) !important;
      border-top: 1px solid var(--cm-dialog-border);
    }
  }
</style>
