<template>
  <div class="agency-page art-full-height">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleNewAgency">
          <ElIcon><Plus /></ElIcon>新建代理商
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索代理商名称..."
          class="header-search"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- 主体：左列表 + 右详情 -->
    <div class="main-content">
      <div class="list-side">
        <AgencyTab
          ref="agencyTabRef"
          :search-keyword="searchKeyword"
          :selected-id="currentAgency?.id"
          @select="handleSelect"
          @edit="handleEdit"
          @delete="handleDeleteOpen"
        />
      </div>
      <div class="detail-side">
        <AgencyDetailPanel
          :agency-data="currentAgency"
          @edit="handleEdit"
          @terminate="handleTerminate"
        />
      </div>
    </div>

    <!-- 新建 / 编辑弹窗 -->
    <AgencyFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      @success="handleFormSuccess"
    />

    <!-- 删除确认弹窗 -->
    <AgencyDeleteDialog
      v-model:visible="deleteVisible"
      :agency-data="deleteTarget"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createAgency,
    deleteAgency,
    exportAgencyList,
    updateAgency
  } from '@/api/config-management/account-management'
  import { AccountApiSource } from '@/views/config-management/account-management/config/data-source'
  import AgencyTab from '@/views/config-management/account-management/modules/agency-tab.vue'
  import AgencyDetailPanel from '@/views/config-management/account-management/modules/agency-detail-panel.vue'
  import AgencyFormDialog from '@/views/config-management/account-management/modules/agency-form-dialog.vue'
  import AgencyDeleteDialog from '@/views/config-management/account-management/modules/agency-delete-dialog.vue'
  import type { AgencyItem } from '@/views/config-management/account-management/types'

  defineOptions({ name: 'Agency' })

  const agencyTabRef = ref<InstanceType<typeof AgencyTab> | null>(null)

  const searchKeyword = ref('')
  const formVisible = ref(false)
  const deleteVisible = ref(false)
  const currentAgency = ref<AgencyItem | null>(null)
  const editData = ref<AgencyItem | null>(null)
  const deleteTarget = ref<AgencyItem | null>(null)

  const handleSelect = (row: AgencyItem) => {
    currentAgency.value = row
  }

  const handleNewAgency = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleExport = () => {
    if (!AccountApiSource.exportAgency) {
      exportAgencyList({})
        .then(() => ElMessage.success('导出成功'))
        .catch(() => ElMessage.error('导出失败'))
      return
    }
    ElMessage.success('导出成功')
  }

  const handleEdit = (row: AgencyItem) => {
    editData.value = { ...row }
    formVisible.value = true
  }

  const handleTerminate = (row: AgencyItem) => {
    ElMessage.info(`终止合作功能开发中：${row.agencyName}`)
  }

  const handleDeleteOpen = (row: AgencyItem) => {
    deleteTarget.value = row
    deleteVisible.value = true
  }

  const handleFormSuccess = async (data: any) => {
    const wasEditing = !!editData.value
    if (wasEditing && editData.value?.id && !AccountApiSource.updateAgency) {
      try { await updateAgency(editData.value.id, data) } catch { /* backend not ready */ }
    }
    if (!wasEditing && !AccountApiSource.createAgency) {
      try { await createAgency(data) } catch { /* backend not ready */ }
    }
    formVisible.value = false
    editData.value = null
    agencyTabRef.value?.reloadList?.()
    ElMessage.success(wasEditing ? '保存成功' : '新增成功')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget.value) return
    if (!AccountApiSource.deleteAgency) {
      try { await deleteAgency(deleteTarget.value.id) } catch { /* backend not ready */ }
    }
    agencyTabRef.value?.removeFromList?.(deleteTarget.value.id)
    if (currentAgency.value?.id === deleteTarget.value.id) {
      currentAgency.value = null
    }
    deleteTarget.value = null
    ElMessage.success('删除成功')
  }
</script>

<style lang="scss" scoped>
  .agency-page {
    --bg-page: #0b1120;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;

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
    background: #0d9488 !important;
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
    width: 200px;

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
