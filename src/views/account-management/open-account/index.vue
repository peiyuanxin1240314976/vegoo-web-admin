<template>
  <div class="oa-page art-full-height">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleNew">
          <ElIcon><Plus /></ElIcon>新建开户记录
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索开户记录..."
          class="header-search"
          clearable
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
      </div>
    </div>

    <!-- 主体：左列表 + 右详情 -->
    <div class="main-content">
      <div class="list-side">
        <OpenAccountTab
          ref="openAccountTabRef"
          :search-keyword="searchKeyword"
          :selected-id="currentRecord?.id"
          @select="handleSelect"
          @assign="handleAssignOpen"
          @delete="handleDeleteOpen"
        />
      </div>
      <div class="detail-side">
        <OpenAccountDetailPanel
          :data="currentRecord"
          @assign="handleAssignOpen"
          @delete="handleDeleteOpen"
        />
      </div>
    </div>

    <!-- 新建弹窗 -->
    <OpenAccountFormDialog
      v-model:visible="formVisible"
      @success="handleFormSuccess"
    />

    <!-- 分配凭据弹窗 -->
    <OpenAccountAssignDialog
      v-model:visible="assignVisible"
      :data="assignTarget"
      @success="handleAssignSuccess"
    />

    <!-- 删除确认弹窗 -->
    <OpenAccountDeleteDialog
      v-model:visible="deleteVisible"
      :data="deleteTarget"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import OpenAccountTab from '@/views/config-management/account-management/modules/open-account-tab.vue'
  import OpenAccountDetailPanel from '@/views/config-management/account-management/modules/open-account-detail-panel.vue'
  import OpenAccountFormDialog from '@/views/config-management/account-management/modules/open-account-form-dialog.vue'
  import OpenAccountAssignDialog from '@/views/config-management/account-management/modules/open-account-assign-dialog.vue'
  import OpenAccountDeleteDialog from '@/views/config-management/account-management/modules/open-account-delete-dialog.vue'
  import type { OpenAccountItem } from '@/views/config-management/account-management/types'

  defineOptions({ name: 'OpenAccount' })

  const openAccountTabRef = ref<InstanceType<typeof OpenAccountTab> | null>(null)

  const searchKeyword = ref('')
  const formVisible = ref(false)
  const assignVisible = ref(false)
  const deleteVisible = ref(false)
  const currentRecord = ref<OpenAccountItem | null>(null)
  const assignTarget = ref<OpenAccountItem | null>(null)
  const deleteTarget = ref<OpenAccountItem | null>(null)

  const handleSelect = (row: OpenAccountItem) => {
    currentRecord.value = row
  }

  const handleNew = () => {
    formVisible.value = true
  }

  const handleExport = () => {
    ElMessage.success('导出成功')
  }

  const handleAssignOpen = (row: OpenAccountItem) => {
    assignTarget.value = row
    assignVisible.value = true
  }

  const handleDeleteOpen = (row: OpenAccountItem) => {
    deleteTarget.value = row
    deleteVisible.value = true
  }

  const handleFormSuccess = () => {
    formVisible.value = false
    openAccountTabRef.value?.reloadList?.()
    ElMessage.success('开户记录已创建，飞书通知已发送')
  }

  const handleAssignSuccess = () => {
    assignVisible.value = false
    assignTarget.value = null
    openAccountTabRef.value?.reloadList?.()
    ElMessage.success('凭据已分配，账户状态已激活')
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget.value) return
    openAccountTabRef.value?.removeFromList?.(deleteTarget.value.id)
    if (currentRecord.value?.id === deleteTarget.value.id) currentRecord.value = null
    deleteTarget.value = null
    ElMessage.success('开户记录已删除')
  }
</script>

<style lang="scss" scoped>
  .oa-page {
    --bg-page: #0b1120;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --teal: #0d9488;

    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  .page-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    padding: 20px 0 16px;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .main-content {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
  }

  .list-side {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .detail-side {
    display: flex;
    flex-shrink: 0;
    align-items: stretch;
  }

  .btn-add {
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: var(--teal) !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }

  .btn-secondary {
    padding: 8px 14px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  .header-search {
    width: 220px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;
      &:hover, &:focus-within { border-color: var(--accent) !important; }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
      &::placeholder { color: var(--text-muted); }
    }

    :deep(.el-input__prefix) { color: var(--text-muted); }
  }
</style>
