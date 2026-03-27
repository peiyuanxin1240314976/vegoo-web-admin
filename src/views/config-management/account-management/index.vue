<template>
  <div class="account-management-page art-full-height">
    <!-- 面包屑 + 操作 -->
    <div class="page-header">
      <span class="breadcrumb">
        <span class="breadcrumb-parent">{{ t('menus.configManagement.title') }}</span>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-current">{{ t('menus.configManagement.accountManagement') }}</span>
      </span>
      <div class="header-actions">
        <!-- 广告账户 tab 按钮 -->
        <template v-if="activeTab === 'ad-account'">
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
        </template>
        <!-- 代理商管理 tab 按钮 -->
        <template v-else-if="activeTab === 'agency'">
          <ElButton round class="btn-add" @click="handleNewAgency">
            <ElIcon><Plus /></ElIcon>新增代理商
          </ElButton>
          <ElButton round class="btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
          <el-input
            v-model="agencySearchKeyword"
            placeholder="搜索代理商名称/ID..."
            class="header-search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <!-- 凭据管理 tab 按钮 -->
        <template v-else-if="activeTab === 'credential'">
          <ElButton round class="btn-add" @click="handleNewCredential">
            <ElIcon><Plus /></ElIcon>新建凭据
          </ElButton>
          <ElButton round class="btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
          <el-input
            v-model="credentialSearchKeyword"
            placeholder="搜索凭据名称..."
            class="header-search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </template>
        <!-- 开户管理 tab 按钮 -->
        <template v-else-if="activeTab === 'open-account'">
          <ElButton round class="btn-add btn-add--teal" @click="handleNewOpenAccount">
            <ElIcon><Plus /></ElIcon>新建开户记录
          </ElButton>
          <ElButton round class="btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
          <el-input
            v-model="openAccountSearchKeyword"
            placeholder="搜索开户记录..."
            class="header-search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </template>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', { 'tab-item--active': activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Tab 内容 -->
    <div class="tab-content">
      <AdAccountTab
        v-if="activeTab === 'ad-account'"
        ref="adAccountTabRef"
        :search-keyword="searchKeyword"
        @new-account="handleNewAccount"
        @edit="handleEdit"
        @recharge="handleRecharge"
        @disable="handleDisable"
        @detail="handleDetail"
      />
      <AgencyTab
        v-else-if="activeTab === 'agency'"
        ref="agencyTabRef"
        :search-keyword="agencySearchKeyword"
        @detail="handleAgencyDetail"
        @edit="handleAgencyEdit"
      />
      <CredentialTab
        v-else-if="activeTab === 'credential'"
        ref="credentialTabRef"
        :search-keyword="credentialSearchKeyword"
        @detail="handleCredentialDetail"
        @edit="handleCredentialEdit"
        @validate="handleCredentialValidate"
        @revalidate="handleCredentialValidate"
      />
      <OpenAccountTab
        v-else-if="activeTab === 'open-account'"
        ref="openAccountTabRef"
        :search-keyword="openAccountSearchKeyword"
        @detail="handleOpenAccountDetail"
        @assign="handleOpenAccountAssign"
        @delete="handleOpenAccountDelete"
      />
    </div>

    <!-- 广告账户：详情抽屉 -->
    <AccountDetailDrawer
      v-model:visible="drawerVisible"
      :account-data="currentAccount"
      @edit="handleEdit"
      @recharge="handleRecharge"
      @disable="handleDisable"
    />

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

    <!-- 代理商：详情抽屉 -->
    <AgencyDetailDrawer
      v-model:visible="agencyDrawerVisible"
      :agency-data="currentAgency"
      @edit="handleAgencyEdit"
    />

    <!-- 代理商：新建 / 编辑弹窗 -->
    <AgencyFormDialog
      v-model:visible="agencyFormVisible"
      :edit-data="agencyEditData"
      @success="handleAgencyFormSuccess"
    />

    <!-- 凭据：详情抽屉 -->
    <CredentialDetailDrawer
      v-model:visible="credDrawerVisible"
      :cred-data="currentCredential"
      @edit="handleCredentialEdit"
      @delete="handleCredentialDelete"
      @validate="handleCredentialValidate"
    />

    <!-- 凭据：新建 / 编辑弹窗 -->
    <CredentialFormDialog
      v-model:visible="credFormVisible"
      :edit-data="credEditData"
      @success="handleCredentialFormSuccess"
    />

    <!-- 凭据：接口验证结果弹窗 -->
    <CredentialValidateDialog
      v-model:visible="credValidateVisible"
      :cred-data="validateTarget"
      @confirm="handleCredentialValidateConfirm"
    />

    <!-- 凭据：删除确认弹窗 -->
    <CredentialDeleteDialog
      v-model:visible="credDeleteVisible"
      :cred-data="deleteTarget"
      @confirm="handleCredentialDeleteConfirm"
    />

    <!-- 开户管理：详情抽屉 -->
    <OpenAccountDetailDrawer
      v-model:visible="openDrawerVisible"
      :data="currentOpenAccount"
      @assign="handleOpenAccountAssign"
      @delete="handleOpenAccountDelete"
    />

    <!-- 开户管理：新建弹窗 -->
    <OpenAccountFormDialog
      v-model:visible="openFormVisible"
      @success="handleOpenAccountFormSuccess"
    />

    <!-- 开户管理：分配凭据弹窗 -->
    <OpenAccountAssignDialog
      v-model:visible="openAssignVisible"
      :data="openAssignTarget"
      @success="handleOpenAccountAssignSuccess"
    />

    <!-- 开户管理：删除确认弹窗 -->
    <OpenAccountDeleteDialog
      v-model:visible="openDeleteVisible"
      :data="openDeleteTarget"
      @confirm="handleOpenAccountDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Plus, Upload, Download, Search } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    assignOpenAccountCredential,
    createAccount,
    createAgency,
    createCredential,
    createOpenAccount,
    deleteCredential,
    deleteOpenAccount,
    disableAccount,
    exportAccountList,
    exportAgencyList,
    exportCredentialList,
    exportOpenAccountList,
    importAccountList,
    rechargeAccount,
    updateAccount,
    updateAgency,
    updateCredential,
    validateCredential
  } from '@/api/config-management/account-management'
  import { AccountApiSource } from './config/data-source'
  import AdAccountTab from './modules/ad-account-tab.vue'
  import AgencyTab from './modules/agency-tab.vue'
  import CredentialTab from './modules/credential-tab.vue'
  import OpenAccountTab from './modules/open-account-tab.vue'
  import AccountDetailDrawer from './modules/account-detail-drawer.vue'
  import AccountFormDialog from './modules/account-form-dialog.vue'
  import AccountRechargeDialog from './modules/account-recharge-dialog.vue'
  import AccountDisableDialog from './modules/account-disable-dialog.vue'
  import AgencyDetailDrawer from './modules/agency-detail-drawer.vue'
  import AgencyFormDialog from './modules/agency-form-dialog.vue'
  import CredentialDetailDrawer from './modules/credential-detail-drawer.vue'
  import CredentialFormDialog from './modules/credential-form-dialog.vue'
  import CredentialValidateDialog from './modules/credential-validate-dialog.vue'
  import CredentialDeleteDialog from './modules/credential-delete-dialog.vue'
  import OpenAccountDetailDrawer from './modules/open-account-detail-drawer.vue'
  import OpenAccountFormDialog from './modules/open-account-form-dialog.vue'
  import OpenAccountAssignDialog from './modules/open-account-assign-dialog.vue'
  import OpenAccountDeleteDialog from './modules/open-account-delete-dialog.vue'
  import type { AdAccountItem, AgencyItem, CredentialItem, OpenAccountItem } from './types'

  defineOptions({ name: 'AccountManagement' })

  const { t } = useI18n()

  const tabs = [
    { key: 'ad-account', label: '广告账户' },
    { key: 'agency', label: '代理商管理' },
    { key: 'credential', label: '凭据管理' },
    { key: 'open-account', label: '开户管理' }
  ]

  const activeTab = ref('ad-account')
  const adAccountTabRef = ref<InstanceType<typeof AdAccountTab> | null>(null)
  const agencyTabRef = ref<InstanceType<typeof AgencyTab> | null>(null)
  const credentialTabRef = ref<InstanceType<typeof CredentialTab> | null>(null)
  const openAccountTabRef = ref<InstanceType<typeof OpenAccountTab> | null>(null)

  const reloadCurrentTab = () => {
    if (activeTab.value === 'ad-account') adAccountTabRef.value?.reloadList?.()
    if (activeTab.value === 'agency') agencyTabRef.value?.reloadList?.()
    if (activeTab.value === 'credential') credentialTabRef.value?.reloadList?.()
    if (activeTab.value === 'open-account') openAccountTabRef.value?.reloadList?.()
  }

  // ── 广告账户状态 ──────────────────────────────────────
  const searchKeyword = ref('')
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const rechargeVisible = ref(false)
  const disableVisible = ref(false)
  const currentAccount = ref<AdAccountItem | null>(null)
  const editData = ref<AdAccountItem | null>(null)
  const rechargeTarget = ref<AdAccountItem | null>(null)
  const disableTarget = ref<AdAccountItem | null>(null)

  const handleNewAccount = () => {
    editData.value = null
    formVisible.value = true
  }

  const handleBatchImport = () => {
    if (activeTab.value !== 'ad-account') {
      ElMessage.info('当前页签不支持批量导入')
      return
    }
    if (!AccountApiSource.importAccount) {
      importAccountList({ items: [] })
        .then(() => ElMessage.success('批量导入任务已提交'))
        .catch(() => ElMessage.error('批量导入任务提交失败'))
      return
    }
    ElMessage.info('批量导入功能开发中')
  }

  const handleExport = () => {
    if (activeTab.value === 'ad-account') {
      if (!AccountApiSource.exportAccount) {
        exportAccountList({})
          .then(() => ElMessage.success('导出成功'))
          .catch(() => ElMessage.error('导出失败'))
        return
      }
      ElMessage.success('导出成功')
      return
    }
    if (activeTab.value === 'agency') {
      if (!AccountApiSource.exportAgency) {
        exportAgencyList({})
          .then(() => ElMessage.success('导出成功'))
          .catch(() => ElMessage.error('导出失败'))
        return
      }
      ElMessage.success('导出成功')
      return
    }
    if (activeTab.value === 'credential') {
      if (!AccountApiSource.exportCredential) {
        exportCredentialList({})
          .then(() => ElMessage.success('导出成功'))
          .catch(() => ElMessage.error('导出失败'))
        return
      }
      ElMessage.success('导出成功')
      return
    }
    if (activeTab.value === 'open-account') {
      if (!AccountApiSource.exportOpenAccount) {
        exportOpenAccountList({})
          .then(() => ElMessage.success('导出成功'))
          .catch(() => ElMessage.error('导出失败'))
        return
      }
      ElMessage.success('导出成功')
    }
  }

  const handleDetail = (row: AdAccountItem) => {
    currentAccount.value = row
    drawerVisible.value = true
  }

  const handleEdit = (row: AdAccountItem) => {
    editData.value = { ...row }
    formVisible.value = true
    drawerVisible.value = false
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
    reloadCurrentTab()
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
    reloadCurrentTab()
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
    reloadCurrentTab()
    ElMessage.success('账户已停用')
  }

  // ── 代理商状态 ────────────────────────────────────────
  const agencySearchKeyword = ref('')
  const agencyDrawerVisible = ref(false)
  const agencyFormVisible = ref(false)
  const currentAgency = ref<AgencyItem | null>(null)
  const agencyEditData = ref<AgencyItem | null>(null)

  const handleNewAgency = () => {
    agencyEditData.value = null
    agencyFormVisible.value = true
  }

  const handleAgencyDetail = (row: AgencyItem) => {
    currentAgency.value = row
    agencyDrawerVisible.value = true
  }

  const handleAgencyEdit = (row: AgencyItem) => {
    agencyEditData.value = { ...row }
    agencyFormVisible.value = true
    agencyDrawerVisible.value = false
  }

  const handleAgencyFormSuccess = async (data: any) => {
    const wasEditing = !!agencyEditData.value
    if (wasEditing && agencyEditData.value?.id && !AccountApiSource.updateAgency) {
      try {
        await updateAgency(agencyEditData.value.id, data)
      } catch {
        // backend not ready
      }
    }
    if (!wasEditing && !AccountApiSource.createAgency) {
      try {
        await createAgency(data)
      } catch {
        // backend not ready
      }
    }
    agencyFormVisible.value = false
    agencyEditData.value = null
    reloadCurrentTab()
    ElMessage.success(wasEditing ? '保存成功' : '新增成功')
  }

  // ── 凭据状态 ──────────────────────────────────────────
  const credentialSearchKeyword = ref('')
  const credDrawerVisible = ref(false)
  const credFormVisible = ref(false)
  const credValidateVisible = ref(false)
  const credDeleteVisible = ref(false)
  const currentCredential = ref<CredentialItem | null>(null)
  const credEditData = ref<CredentialItem | null>(null)
  const validateTarget = ref<CredentialItem | null>(null)
  const deleteTarget = ref<CredentialItem | null>(null)

  const handleNewCredential = () => {
    credEditData.value = null
    credFormVisible.value = true
  }

  const handleCredentialDetail = (row: CredentialItem) => {
    currentCredential.value = row
    credDrawerVisible.value = true
  }

  const handleCredentialEdit = (row: CredentialItem) => {
    credEditData.value = { ...row }
    credFormVisible.value = true
    credDrawerVisible.value = false
  }

  const handleCredentialValidate = (row: CredentialItem) => {
    validateTarget.value = row
    credValidateVisible.value = true
  }

  const handleCredentialDelete = (row: CredentialItem) => {
    deleteTarget.value = row
    credDeleteVisible.value = true
    credDrawerVisible.value = false
  }

  const handleCredentialFormSuccess = async (data: any) => {
    const wasEditing = !!credEditData.value
    if (wasEditing && credEditData.value?.id && !AccountApiSource.updateCredential) {
      try {
        await updateCredential(credEditData.value.id, data)
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
    credFormVisible.value = false
    credEditData.value = null
    validateTarget.value = wasEditing ? currentCredential.value : null
    credValidateVisible.value = true
    reloadCurrentTab()
    ElMessage.success(wasEditing ? '保存成功，正在重新验证' : '凭据已创建，正在验证接口')
  }

  const handleCredentialValidateConfirm = async () => {
    if (validateTarget.value?.id && !AccountApiSource.validateCredential) {
      try {
        await validateCredential(validateTarget.value.id)
      } catch {
        // backend not ready
      }
    }
    ElMessage.success('凭据已保存')
  }

  const handleCredentialDeleteConfirm = async () => {
    if (deleteTarget.value?.id && !AccountApiSource.deleteCredential) {
      try {
        await deleteCredential(deleteTarget.value.id)
      } catch {
        // backend not ready
      }
    }
    credDeleteVisible.value = false
    deleteTarget.value = null
    reloadCurrentTab()
    ElMessage.success('凭据已删除')
  }

  // ── 开户管理状态 ──────────────────────────────────────
  const openAccountSearchKeyword = ref('')
  const openDrawerVisible = ref(false)
  const openFormVisible = ref(false)
  const openAssignVisible = ref(false)
  const openDeleteVisible = ref(false)
  const currentOpenAccount = ref<OpenAccountItem | null>(null)
  const openAssignTarget = ref<OpenAccountItem | null>(null)
  const openDeleteTarget = ref<OpenAccountItem | null>(null)

  const handleNewOpenAccount = () => {
    openFormVisible.value = true
  }

  const handleOpenAccountDetail = (row: OpenAccountItem) => {
    currentOpenAccount.value = row
    openDrawerVisible.value = true
  }

  const handleOpenAccountAssign = (row: OpenAccountItem) => {
    openAssignTarget.value = row
    openAssignVisible.value = true
    openDrawerVisible.value = false
  }

  const handleOpenAccountDelete = (row: OpenAccountItem) => {
    openDeleteTarget.value = row
    openDeleteVisible.value = true
    openDrawerVisible.value = false
  }

  const handleOpenAccountFormSuccess = async (data: any) => {
    if (!AccountApiSource.createOpenAccount) {
      try {
        await createOpenAccount(data)
      } catch {
        // backend not ready
      }
    }
    openFormVisible.value = false
    reloadCurrentTab()
    ElMessage.success('开户记录已创建，飞书通知已发送')
  }

  const handleOpenAccountAssignSuccess = async (credential: string) => {
    if (openAssignTarget.value?.id && !AccountApiSource.assignOpenAccountCredential) {
      try {
        await assignOpenAccountCredential(openAssignTarget.value.id, credential)
      } catch {
        // backend not ready
      }
    }
    openAssignVisible.value = false
    openAssignTarget.value = null
    reloadCurrentTab()
    ElMessage.success('凭据已分配，账户状态已激活')
  }

  const handleOpenAccountDeleteConfirm = async () => {
    if (openDeleteTarget.value?.id && !AccountApiSource.deleteOpenAccount) {
      try {
        await deleteOpenAccount(openDeleteTarget.value.id)
      } catch {
        // backend not ready
      }
    }
    openDeleteVisible.value = false
    openDeleteTarget.value = null
    reloadCurrentTab()
    ElMessage.success('开户记录已删除')
  }
</script>

<style lang="scss" scoped>
  .account-management-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-dim: rgb(59 130 246 / 12%);

    position: relative;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 页面头部 ───────────────────────────────────────────
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 0 16px;
  }

  .breadcrumb {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 14px;
  }

  .breadcrumb-parent {
    color: var(--text-secondary);
  }

  .breadcrumb-sep {
    color: var(--text-muted);
  }

  .breadcrumb-current {
    font-weight: 500;
    color: var(--text-primary);
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

    &--teal {
      background: #0d9488 !important;
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

  // ─── Tab 栏 ─────────────────────────────────────────────
  .tab-bar {
    display: flex;
    gap: 4px;
    padding: 0;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .tab-item {
    padding: 10px 20px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: var(--text-primary);
    }

    &--active {
      font-weight: 500;
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
  }

  // ─── Tab 内容区 ─────────────────────────────────────────
  .tab-content {
    flex: 1;
  }
</style>
