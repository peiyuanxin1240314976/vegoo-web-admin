<template>
  <el-dialog
    :model-value="visible"
    title="确认删除"
    width="440px"
    :close-on-click-modal="false"
    header-class="cc-del-hd"
    body-class="cc-del-bd"
    footer-class="cc-del-ft"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="del-body">
      <div class="del-icon">⚠️</div>
      <div class="del-title">确认要删除该成本系数配置吗？</div>
      <div v-if="item" class="del-meta">
        <span>广告平台：{{ item.platformName }} (n_source={{ item.nSource }})</span>
        <span>生效日期：{{ item.tStart }} | 折算比例：{{ item.dCostRatio.toFixed(3) }}</span>
      </div>
      <div class="del-warning">
        <span class="warning-icon">ℹ</span>
        此操作为逻辑删除，数据将被标记为已失效并不再参与计算，可联系管理员恢复
      </div>
    </div>

    <template #footer>
      <ElButton round @click="emit('update:visible', false)">取消</ElButton>
      <ElButton round type="danger" :loading="deleting" @click="handleConfirm">确认删除</ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { CostCoefficientItem } from '../types'

  defineOptions({ name: 'CostDeleteDialog' })

  interface Props {
    visible: boolean
    item?: CostCoefficientItem | null
  }

  defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
  }>()

  const deleting = ref(false)

  const handleConfirm = async () => {
    deleting.value = true
    await new Promise((r) => setTimeout(r, 500))
    deleting.value = false
    emit('confirm')
    emit('update:visible', false)
    ElMessage.success('已删除（逻辑删除）')
  }
</script>

<style lang="scss" scoped>
  .del-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
  }

  .del-icon {
    font-size: 48px;
    line-height: 1;
  }

  .del-title {
    font-size: 15px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .del-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    color: #94a3b8;
  }

  .del-warning {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    width: 100%;
    padding: 10px 14px;
    font-size: 12px;
    color: #93c5fd;
    text-align: left;
    background: rgb(59 130 246 / 10%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 8px;
    line-height: 1.6;
  }

  .warning-icon {
    flex-shrink: 0;
    font-weight: 700;
    font-style: normal;
  }
</style>

<style lang="scss">
  .el-dialog:has(.cc-del-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }

  .el-dialog:has(.cc-del-bd) .el-dialog__header.cc-del-hd {
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .el-dialog:has(.cc-del-bd) .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cc-del-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.cc-del-bd) .el-dialog__body.cc-del-bd {
    padding: 24px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.cc-del-bd) .el-dialog__footer.cc-del-ft {
    padding: 12px 24px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
  }
</style>
