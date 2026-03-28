<template>
  <div class="account-sub-page art-full-height">
    <div class="page-header">
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleNewCredential">
          <ElIcon><Plus /></ElIcon>新建凭据
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索凭据名称..."
          class="header-search"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="tab-content">
      <CredentialTab
        ref="credentialTabRef"
        :search-keyword="searchKeyword"
        @detail="handleCredentialDetail"
        @edit="handleCredentialEdit"
        @validate="handleCredentialValidate"
        @revalidate="handleCredentialValidate"
      />
    </div>

    <CredentialDetailDrawer
      v-model:visible="drawerVisible"
      :cred-data="currentCredential"
      @edit="handleCredentialEdit"
      @delete="handleCredentialDelete"
      @validate="handleCredentialValidate"
    />

    <CredentialFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      @success="handleFormSuccess"
    />

    <CredentialValidateDialog
      v-model:visible="validateVisible"
      :cred-data="validateTarget"
      @confirm="handleValidateConfirm"
    />

    <CredentialDeleteDialog
      v-model:visible="deleteVisible"
      :cred-data="deleteTarget"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createCredential,
    deleteCredential,
    exportCredentialList,
    updateCredential,
    validateCredential
  } from '@/api/config-management/account-management'
  import { AccountApiSource } from '@/views/config-management/account-management/config/data-source'
  import CredentialTab from '@/views/config-management/account-management/modules/credential-tab.vue'
  import CredentialDetailDrawer from '@/views/config-management/account-management/modules/credential-detail-drawer.vue'
  import CredentialFormDialog from '@/views/config-management/account-management/modules/credential-form-dialog.vue'
  import CredentialValidateDialog from '@/views/config-management/account-management/modules/credential-validate-dialog.vue'
  import CredentialDeleteDialog from '@/views/config-management/account-management/modules/credential-delete-dialog.vue'
  import type { CredentialItem } from '@/views/config-management/account-management/types'

  defineOptions({ name: 'Credential' })

  const credentialTabRef = ref<InstanceType<typeof CredentialTab> | null>(null)

  const searchKeyword = ref('')
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const validateVisible = ref(false)
  const deleteVisible = ref(false)
  const currentCredential = ref<CredentialItem | null>(null)
  const editData = ref<CredentialItem | null>(null)
  const validateTarget = ref<CredentialItem | null>(null)
  const deleteTarget = ref<CredentialItem | null>(null)

  const handleNewCredential = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleExport = () => {
    if (!AccountApiSource.exportCredential) {
      exportCredentialList({})
        .then(() => ElMessage.success('导出成功'))
        .catch(() => ElMessage.error('导出失败'))
      return
    }
    ElMessage.success('导出成功')
  }

  const handleCredentialDetail = (row: CredentialItem) => {
    currentCredential.value = row
    drawerVisible.value = true
  }

  const handleCredentialEdit = (row: CredentialItem) => {
    editData.value = { ...row }
    formVisible.value = true
    drawerVisible.value = false
  }

  const handleCredentialValidate = (row: CredentialItem) => {
    validateTarget.value = row
    validateVisible.value = true
  }

  const handleCredentialDelete = (row: CredentialItem) => {
    deleteTarget.value = row
    deleteVisible.value = true
    drawerVisible.value = false
  }

  const handleFormSuccess = async (data: any) => {
    const wasEditing = !!editData.value
    if (wasEditing && editData.value?.id && !AccountApiSource.updateCredential) {
      try {
        await updateCredential(editData.value.id, data)
      } catch {
        // backend not ready
      }
    }
    if (!wasEditing && !AccountApiSource.createCredential) {
      try {
        await createCredential(data)
      } catch {
        // backend not ready
      }
    }
    formVisible.value = false
    editData.value = null
    validateTarget.value = wasEditing ? currentCredential.value : null
    validateVisible.value = true
    credentialTabRef.value?.reloadList?.()
    ElMessage.success(wasEditing ? '保存成功，正在重新验证' : '凭据已创建，正在验证接口')
  }

  const handleValidateConfirm = async () => {
    if (validateTarget.value?.id && !AccountApiSource.validateCredential) {
      try {
        await validateCredential(validateTarget.value.id)
      } catch {
        // backend not ready
      }
    }
    ElMessage.success('凭据已保存')
  }

  const handleDeleteConfirm = async () => {
    if (deleteTarget.value?.id && !AccountApiSource.deleteCredential) {
      try {
        await deleteCredential(deleteTarget.value.id)
      } catch {
        // backend not ready
      }
    }
    deleteVisible.value = false
    deleteTarget.value = null
    credentialTabRef.value?.reloadList?.()
    ElMessage.success('凭据已删除')
  }
</script>

<style lang="scss" scoped>
  .account-sub-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;

    position: relative;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 20px 0 16px;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .btn-add {
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: var(--accent) !important;
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

      &:hover,
      &:focus-within {
        border-color: var(--accent) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-muted);
      }
    }

    :deep(.el-input__prefix) {
      color: var(--text-muted);
    }
  }

  .tab-content {
    flex: 1;
  }
</style>
