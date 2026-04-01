<template>
  <ElDialog
    :model-value="visible"
    :title="$t('conversionManagement.deleteDialogTitle')"
    width="520px"
    destroy-on-close
    top="10vh"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="conversion-delete-dialog">
      <div class="conversion-delete-dialog__icon">
        <div class="conversion-delete-dialog__icon-circle">
          <ArtSvgIcon icon="ri:delete-bin-5-fill" class="conversion-delete-dialog__icon-svg" />
        </div>
      </div>

      <div class="conversion-delete-dialog__title">
        {{ $t('conversionManagement.deleteDialogConfirmTitle') }}
      </div>

      <div class="conversion-delete-dialog__card">
        <div class="conversion-delete-dialog__row">
          <span class="conversion-delete-dialog__label"
            >{{ $t('conversionManagement.conversionName') }}：</span
          >
          <span class="conversion-delete-dialog__value">{{ row?.conversionName || '-' }}</span>
        </div>
        <div class="conversion-delete-dialog__row">
          <span class="conversion-delete-dialog__label"
            >{{ $t('conversionManagement.conversionId') }}：</span
          >
          <span class="conversion-delete-dialog__value">{{ row?.conversionId || '-' }}</span>
        </div>
        <div class="conversion-delete-dialog__row">
          <span class="conversion-delete-dialog__label"
            >{{ $t('conversionManagement.systemDisplayName') }}：</span
          >
          <span class="conversion-delete-dialog__value">{{ row?.systemDisplayName || '-' }}</span>
        </div>
        <div class="conversion-delete-dialog__row">
          <span class="conversion-delete-dialog__label"
            >{{ $t('conversionManagement.conversionType') }}：</span
          >
          <span class="conversion-delete-dialog__value">{{ conversionTypeText }}</span>
        </div>
      </div>

      <div class="conversion-delete-dialog__danger">
        <ArtSvgIcon icon="ri:error-warning-fill" class="conversion-delete-dialog__danger-icon" />
        <span class="conversion-delete-dialog__danger-text">
          {{ $t('conversionManagement.deleteDialogDangerLine1') }}
        </span>
      </div>
      <div class="conversion-delete-dialog__danger-sub">
        {{ $t('conversionManagement.deleteDialogDangerLine2') }}
      </div>
    </div>

    <template #footer>
      <div class="conversion-delete-dialog__footer">
        <ElButton plain @click="handleClose">{{ $t('conversionManagement.cancel') }}</ElButton>
        <ElButton type="danger" @click="handleConfirm">
          {{ $t('conversionManagement.deleteDialogConfirmButton') }}
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { ConversionMappingItem } from '../types'

  defineOptions({ name: 'ConversionDeleteDialog' })

  const props = defineProps<{
    visible: boolean
    row: ConversionMappingItem | null
  }>()

  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void
    (e: 'confirm', row: ConversionMappingItem): void
  }>()

  const conversionTypeText = computed(() => props.row?.platformConversionType || '-')

  function handleClose() {
    emit('update:visible', false)
  }

  function handleConfirm() {
    if (!props.row) return
    emit('confirm', props.row)
    handleClose()
  }
</script>

<style scoped lang="scss">
  .conversion-delete-dialog {
    padding-top: 8px;
  }

  .conversion-delete-dialog__icon {
    display: flex;
    justify-content: center;
    margin-bottom: 12px;
  }

  .conversion-delete-dialog__icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: color-mix(in srgb, var(--el-color-danger) 20%, transparent);
    border-radius: 9999px;
  }

  .conversion-delete-dialog__icon-svg {
    font-size: 28px;
    color: var(--el-color-danger);
  }

  .conversion-delete-dialog__title {
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-align: center;
  }

  .conversion-delete-dialog__card {
    padding: 14px 16px;
    background: color-mix(in srgb, var(--el-bg-color-overlay) 88%, transparent);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
  }

  .conversion-delete-dialog__row {
    display: grid;
    grid-template-columns: 88px 1fr;
    gap: 8px;
    align-items: baseline;
    padding: 6px 0;
  }

  .conversion-delete-dialog__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .conversion-delete-dialog__value {
    font-size: 13px;
    color: var(--el-text-color-primary);
    word-break: break-all;
  }

  .conversion-delete-dialog__danger {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    margin-top: 14px;
    font-weight: 600;
    color: var(--el-color-danger);
  }

  .conversion-delete-dialog__danger-icon {
    font-size: 14px;
  }

  .conversion-delete-dialog__danger-text {
    font-size: 13px;
  }

  .conversion-delete-dialog__danger-sub {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .conversion-delete-dialog__footer {
    display: flex;
    gap: 12px;
    align-items: center;
  }
</style>

<style lang="scss">
  .conversion-delete-dialog__footer {
    .el-button {
      flex: 1;
      border-radius: 9999px;
    }

    .el-button--danger {
      --el-button-bg-color: var(--el-color-danger);
      --el-button-border-color: var(--el-color-danger);
      --el-button-text-color: var(--el-color-white);
      --el-button-hover-bg-color: var(--el-color-danger-light-3);
      --el-button-hover-border-color: var(--el-color-danger-light-3);
      --el-button-hover-text-color: var(--el-color-white);
      --el-button-active-bg-color: var(--el-color-danger-dark-2);
      --el-button-active-border-color: var(--el-color-danger-dark-2);
      --el-button-active-text-color: var(--el-color-white);
    }

    .el-button.is-plain {
      --el-button-border-color: var(--el-color-success);
      --el-button-text-color: var(--el-color-success);
    }

    .el-button.is-plain:hover,
    .el-button.is-plain:focus {
      --el-button-hover-border-color: var(--el-color-success);
      --el-button-hover-text-color: var(--el-color-success);
      --el-button-hover-bg-color: var(--el-color-success-light-9);
    }
  }
</style>
