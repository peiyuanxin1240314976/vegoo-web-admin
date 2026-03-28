<template>
  <el-dialog
    v-model="dialogVisible"
    width="400px"
    :close-on-click-modal="false"
    :show-close="true"
    header-class="agency-delete-dialog-hd"
    body-class="agency-delete-dialog-bd"
    footer-class="agency-delete-dialog-ft"
  >
    <template #header><span /></template>

    <!-- 红色 X 图标 -->
    <div class="delete-icon-wrap">
      <div class="delete-icon-ring">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
          <circle
            cx="24"
            cy="24"
            r="22"
            fill="rgb(239 68 68 / 12%)"
            stroke="#ef4444"
            stroke-width="1.8"
          />
          <path
            d="M17 17l14 14M31 17L17 31"
            stroke="#ef4444"
            stroke-width="2.2"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>

    <p class="delete-title">确认删除</p>
    <p class="delete-subtitle">删除后数据无法恢复，请谨慎操作</p>

    <!-- 代理商信息卡片 -->
    <div class="info-card">
      <div class="info-card__header">将要删除的代理商</div>
      <div class="info-card__body">
        <div class="info-row">
          <span class="info-label">代理商名称</span>
          <span class="info-value">{{ agencyData?.agencyName ?? '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">广告平台</span>
          <span class="info-value">{{ agencyData?.source ?? '—' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">关联账户数</span>
          <span class="info-value">{{ agencyData?.managedAccounts ?? 0 }} 个</span>
        </div>
      </div>
    </div>

    <!-- 提示 -->
    <div class="warn-tip">
      <svg
        viewBox="0 0 16 16"
        fill="none"
        width="14"
        height="14"
        style="flex-shrink: 0; margin-top: 1px"
      >
        <path d="M8 2L14 13H2L8 2Z" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round" />
        <path d="M8 6v3.5" stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round" />
        <circle cx="8" cy="11.5" r="0.6" fill="#f59e0b" />
      </svg>
      删除后关联账户将转为未分配状态
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
  import type { AgencyItem } from '../types'

  defineOptions({ name: 'AgencyDeleteDialog' })

  const props = defineProps<{
    visible: boolean
    agencyData: AgencyItem | null
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

  watch(
    () => props.visible,
    (v) => {
      if (!v) deleting.value = false
    }
  )

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

<style lang="scss">
  .el-dialog:has(.agency-delete-dialog-bd) {
    overflow: hidden;
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }

  .el-dialog:has(.agency-delete-dialog-bd) .el-dialog__header.agency-delete-dialog-hd {
    padding: 12px 16px 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: none;

    .el-dialog__headerbtn {
      top: 12px;
      right: 16px;
      .el-icon {
        color: var(--cm-dialog-text-muted) !important;
      }
      &:hover .el-icon {
        color: var(--cm-dialog-text-primary) !important;
      }
    }
  }

  .el-dialog:has(.agency-delete-dialog-bd) .el-dialog__body.agency-delete-dialog-bd {
    padding: 8px 28px 16px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.agency-delete-dialog-bd) .el-dialog__footer.agency-delete-dialog-ft {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 0 28px 24px;
    background: var(--cm-dialog-bg-inner);
    border-top: none;
  }
</style>

<style lang="scss" scoped>
  .delete-icon-wrap {
    display: flex;
    justify-content: center;
    margin: 8px 0 16px;
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

  .delete-title {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
    text-align: center;
  }

  .delete-subtitle {
    margin: 0 0 20px;
    font-size: 13px;
    color: #64748b;
    text-align: center;
  }

  .info-card {
    margin-bottom: 12px;
    overflow: hidden;
    border: 1px solid rgb(245 158 11 / 35%);
    border-radius: 8px;
  }

  .info-card__header {
    padding: 8px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #f59e0b;
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
    padding: 8px 14px;

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
  }

  .warn-tip {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    padding: 8px 12px;
    font-size: 12px;
    color: #f59e0b;
    background: rgb(245 158 11 / 8%);
    border: 1px solid rgb(245 158 11 / 20%);
    border-radius: 6px;
  }

  .dialog-btn {
    padding: 8px 20px !important;
    border-radius: 8px !important;

    &--cancel {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;

      &:hover {
        color: #e2e8f0 !important;
        border-color: rgb(255 255 255 / 20%) !important;
      }
    }

    &--delete {
      color: #fff !important;
      background: #ef4444 !important;
      border: none !important;
      &:hover {
        filter: brightness(1.1);
      }
    }
  }
</style>
