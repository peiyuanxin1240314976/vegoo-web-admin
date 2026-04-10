<template>
  <div class="bc-page art-full-height">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleNew">
          <ElIcon><Plus /></ElIcon>新建 BC
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索 BM ID / 名称..."
          class="header-search"
          clearable
        >
          <template #prefix
            ><el-icon><Search /></el-icon
          ></template>
        </el-input>
      </div>
    </div>

    <!-- 主体：左列表 + 右详情 -->
    <div class="main-content">
      <div class="list-side">
        <BcTab
          ref="bcTabRef"
          :search-keyword="searchKeyword"
          :selected-id="currentBc?.id"
          @select="handleSelect"
          @edit="handleEdit"
          @delete="handleDeleteOpen"
        />
      </div>
      <div class="detail-side">
        <BcDetailPanel :bc-data="currentBc" @edit="handleEdit" />
      </div>
    </div>

    <!-- 新建 / 编辑弹窗 -->
    <BcFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      @success="handleFormSuccess"
    />

    <!-- 删除确认弹窗 -->
    <BcDeleteDialog
      v-model:visible="deleteVisible"
      :bc-data="deleteTarget"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createBc,
    deleteBc,
    exportBcList,
    updateBc
  } from '@/api/config-management/account-management'
  import { BcManagementEndpoint, isBcManagementEndpointMock } from './config/data-source'
  import {
    mockCreateBc,
    mockDeleteBc,
    mockExportBcList,
    mockUpdateBc
  } from './mock/bc-management-api-mock'
  import BcTab from '@/views/config-management/account-management/modules/bc-tab.vue'
  import BcDetailPanel from '@/views/config-management/account-management/modules/bc-detail-panel.vue'
  import BcFormDialog from '@/views/config-management/account-management/modules/bc-form-dialog.vue'
  import BcDeleteDialog from '@/views/config-management/account-management/modules/bc-delete-dialog.vue'
  import type { BcItem } from '@/views/config-management/account-management/types'

  defineOptions({ name: 'BcManagement' })

  const bcTabRef = ref<InstanceType<typeof BcTab> | null>(null)

  const searchKeyword = ref('')
  const formVisible = ref(false)
  const deleteVisible = ref(false)
  const currentBc = ref<BcItem | null>(null)
  const editData = ref<BcItem | null>(null)
  const deleteTarget = ref<BcItem | null>(null)

  const handleSelect = (row: BcItem) => {
    currentBc.value = row
  }

  const handleNew = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleExport = () => {
    const useMock = isBcManagementEndpointMock(BcManagementEndpoint.Export)
    if (import.meta.env.DEV) {
      console.debug('[bc-management] export click, useMock =', useMock)
    }
    if (!useMock) {
      exportBcList({})
        .then(() => ElMessage.success('导出成功'))
        .catch(() => ElMessage.error('导出失败'))
      return
    }
    mockExportBcList()
    ElMessage.success('导出成功')
  }

  const handleEdit = (row: BcItem) => {
    editData.value = { ...row }
    formVisible.value = true
  }

  const handleDeleteOpen = (row: BcItem) => {
    deleteTarget.value = row
    deleteVisible.value = true
  }

  const handleFormSuccess = async (data: any) => {
    const wasEditing = !!editData.value
    if (wasEditing && editData.value?.id) {
      try {
        if (isBcManagementEndpointMock(BcManagementEndpoint.Update)) {
          await mockUpdateBc(editData.value.id, data)
        } else {
          await updateBc(editData.value.id, data)
        }
      } catch {
        /* backend not ready */
      }
    }
    if (!wasEditing) {
      try {
        if (isBcManagementEndpointMock(BcManagementEndpoint.Create)) {
          await mockCreateBc(data)
        } else {
          await createBc(data)
        }
      } catch {
        /* backend not ready */
      }
    }
    formVisible.value = false
    editData.value = null
    bcTabRef.value?.reloadList?.()
    ElMessage.success(wasEditing ? '保存成功' : '新增成功')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget.value) return
    try {
      if (isBcManagementEndpointMock(BcManagementEndpoint.Delete)) {
        await mockDeleteBc(deleteTarget.value.id)
      } else {
        await deleteBc(deleteTarget.value.id)
      }
    } catch {
      /* backend not ready */
    }
    bcTabRef.value?.removeFromList?.(deleteTarget.value.id)
    if (currentBc.value?.id === deleteTarget.value.id) currentBc.value = null
    deleteTarget.value = null
    ElMessage.success('删除成功')
  }
</script>

<style lang="scss" scoped>
  .bc-page {
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
</style>
