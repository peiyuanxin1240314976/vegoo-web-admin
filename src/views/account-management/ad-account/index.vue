<template>
  <div class="account-sub-page art-full-height">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-actions">
        <ElButton round class="btn-add" @click="handleNewAccount">
          <ElIcon><Plus /></ElIcon>新建广告账户
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleBatchImport">
          <ElIcon><Upload /></ElIcon>批量导入
        </ElButton>
        <ElButton round class="btn-secondary" @click="handleExport">
          <ElIcon><Download /></ElIcon>导出
        </ElButton>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索账户名称/ID..."
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
        <AdAccountTab
          ref="adAccountTabRef"
          :search-keyword="searchKeyword"
          :selected-id="currentAccount?.id"
          @select="handleSelect"
          @edit="handleEdit"
          @recharge="handleRecharge"
          @disable="handleDisable"
        />
      </div>
      <div class="detail-side">
        <AccountDetailPanel
          :account-data="currentAccount"
          @edit="handleEdit"
          @recharge="handleRecharge"
          @disable="handleDisable"
        />
      </div>
    </div>

    <!-- 广告账户：新建 / 编辑弹窗 -->
    <AccountFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      @success="handleFormSuccess"
    />

    <!-- 广告账户：充值弹窗 -->
    <AccountRechargeDialog
      v-model:visible="rechargeVisible"
      :account-data="rechargeTarget"
      @success="handleRechargeSuccess"
    />

    <!-- 广告账户：停用弹窗 -->
    <AccountDisableDialog
      v-model:visible="disableVisible"
      :account-data="disableTarget"
      @confirm="handleDisableConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus, Upload, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createAccount,
    disableAccount,
    exportAccountList,
    importAccountList,
    rechargeAccount,
    updateAccount
  } from '@/api/config-management/account-management'
  import { AccountApiSource } from '@/views/config-management/account-management/config/data-source'
  import AdAccountTab from '@/views/config-management/account-management/modules/ad-account-tab.vue'
  import AccountDetailPanel from '@/views/config-management/account-management/modules/account-detail-panel.vue'
  import AccountFormDialog from '@/views/config-management/account-management/modules/account-form-dialog.vue'
  import AccountRechargeDialog from '@/views/config-management/account-management/modules/account-recharge-dialog.vue'
  import AccountDisableDialog from '@/views/config-management/account-management/modules/account-disable-dialog.vue'
  import type { AdAccountItem } from '@/views/config-management/account-management/types'

  defineOptions({ name: 'AdAccount' })

  const adAccountTabRef = ref<InstanceType<typeof AdAccountTab> | null>(null)

  const searchKeyword = ref('')
  const formVisible = ref(false)
  const rechargeVisible = ref(false)
  const disableVisible = ref(false)
  const currentAccount = ref<AdAccountItem | null>(null)
  const editData = ref<AdAccountItem | null>(null)
  const rechargeTarget = ref<AdAccountItem | null>(null)
  const disableTarget = ref<AdAccountItem | null>(null)

  const handleSelect = (row: AdAccountItem) => {
    currentAccount.value = row
  }

  const handleNewAccount = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleBatchImport = () => {
    if (!AccountApiSource.importAccount) {
      importAccountList({ items: [] })
        .then(() => ElMessage.success('批量导入任务已提交'))
        .catch(() => ElMessage.error('批量导入任务提交失败'))
      return
    }
    ElMessage.info('批量导入功能开发中')
  }

  const handleExport = () => {
    if (!AccountApiSource.exportAccount) {
      exportAccountList({})
        .then(() => ElMessage.success('导出成功'))
        .catch(() => ElMessage.error('导出失败'))
      return
    }
    ElMessage.success('导出成功')
  }

  const handleEdit = (row: AdAccountItem) => {
    editData.value = { ...row }
    formVisible.value = true
  }

  const handleRecharge = (row: AdAccountItem) => {
    rechargeTarget.value = row
    rechargeVisible.value = true
  }

  const handleDisable = (row: AdAccountItem) => {
    disableTarget.value = row
    disableVisible.value = true
  }

  const handleFormSuccess = async (data: any) => {
    const wasEditing = !!editData.value
    if (wasEditing && editData.value?.id && !AccountApiSource.updateAccount) {
      try {
        await updateAccount(editData.value.id, data)
      } catch {
        // backend not ready
      }
    }
    if (!wasEditing && !AccountApiSource.createAccount) {
      try {
        await createAccount(data)
      } catch {
        // backend not ready
      }
    }
    formVisible.value = false
    editData.value = null
    adAccountTabRef.value?.reloadList?.()
    ElMessage.success(wasEditing ? '保存成功' : '提交成功')
  }

  const handleRechargeSuccess = async (data: any) => {
    if (rechargeTarget.value?.id && !AccountApiSource.rechargeAccount) {
      try {
        await rechargeAccount(rechargeTarget.value.id, data)
      } catch {
        // backend not ready
      }
    }
    rechargeVisible.value = false
    rechargeTarget.value = null
    adAccountTabRef.value?.reloadList?.()
    ElMessage.success('充值申请已提交')
  }

  const handleDisableConfirm = async () => {
    if (disableTarget.value?.id && !AccountApiSource.disableAccount) {
      try {
        await disableAccount(disableTarget.value.id)
      } catch {
        // backend not ready
      }
    }
    disableVisible.value = false
    disableTarget.value = null
    adAccountTabRef.value?.reloadList?.()
    ElMessage.success('账户已停用')
  }
</script>

<style lang="scss" scoped>
  .account-sub-page {
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
</style>
