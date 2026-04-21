<template>
  <div class="account-sub-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">Ad Account</span>
            <span class="account-sub-page__toolbar-title">快捷操作</span>
          </div>
          <span class="account-sub-page__toolbar-hint">新建、导入导出与搜索定位账户</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary"
            @click="handleNewAccount"
          >
            <ElIcon><Plus /></ElIcon>新建广告账户
          </ElButton>
          <!-- <ElButton round class="account-sub-page__btn-secondary" @click="handleBatchImport">
            <ElIcon><Upload /></ElIcon>批量导入
          </ElButton> -->
          <!-- <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton> -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索账户名称/ID..."
            class="account-sub-page__search"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>
    </div>

    <!-- 主体：左列表 + 右详情 -->
    <div class="main-content">
      <div class="list-side">
        <section class="account-sub-page__list-panel" aria-label="广告账户列表">
          <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
          <div class="account-sub-page__list-panel-body">
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
        </section>
      </div>
      <div class="detail-side">
        <section class="account-sub-page__detail-panel" aria-label="账户详情">
          <div class="account-sub-page__detail-panel-fx" aria-hidden="true" />
          <div class="account-sub-page__detail-panel-body">
            <AccountDetailPanel
              :account-data="currentAccount"
              @edit="handleEdit"
              @recharge="handleRecharge"
              @disable="handleDisable"
            />
          </div>
        </section>
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
  import {
    Plus,
    //  Upload, Download,
    Search
  } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import {
    createAccount,
    disableAccount,
    // exportAccountList,
    // importAccountList,
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

  // const handleBatchImport = () => {
  //   if (!AccountApiSource.importAccount) {
  //     importAccountList({ items: [] })
  //       .then(() => ElMessage.success('批量导入任务已提交'))
  //       .catch(() => ElMessage.error('批量导入任务提交失败'))
  //     return
  //   }
  //   ElMessage.info('批量导入功能开发中')
  // }

  // const handleExport = () => {
  //   if (!AccountApiSource.exportAccount) {
  //     exportAccountList({})
  //       .then(() => ElMessage.success('导出成功'))
  //       .catch(() => ElMessage.error('导出失败'))
  //     return
  //   }
  //   ElMessage.success('导出成功')
  // }

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
    /* 与设置里「系统主题色」一致：运行时写入 --el-color-primary */
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-border-strong: color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);

    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow-x: clip;
    color: var(--page-text-main);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .account-sub-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 55% 40% at 88% 0%,
        color-mix(in srgb, var(--theme-color) 22%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 40% 32% at 12% 6%,
        color-mix(in srgb, var(--el-color-primary) 16%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 55%);
  }

  .account-sub-page > * {
    position: relative;
    z-index: 1;
  }

  .account-sub-page__toolbar {
    position: relative;
    flex-shrink: 0;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 18%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .account-sub-page__toolbar-fx {
    position: absolute;
    inset: -50% -10% 35%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 200deg at 70% 40%,
      color-mix(in srgb, var(--el-color-primary) 14%, transparent),
      color-mix(in srgb, var(--theme-color) 12%, transparent),
      color-mix(in srgb, var(--art-success) 8%, transparent),
      color-mix(in srgb, var(--el-color-primary) 14%, transparent)
    );
    filter: blur(40px);
    opacity: 0.5;
  }

  .account-sub-page__toolbar-row {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 16px 20px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-box-color) 76%, transparent)
      ),
      linear-gradient(
        118deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent),
        color-mix(in srgb, var(--el-color-primary) 6%, transparent)
      );
  }

  .account-sub-page__toolbar-row::after {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary) 45%, transparent) 35%,
      color-mix(in srgb, var(--theme-color) 38%, transparent) 65%,
      transparent 100%
    );
    opacity: 0.85;
  }

  .account-sub-page__toolbar-copy {
    display: grid;
    flex: 1 1 220px;
    grid-template-rows: auto auto;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 4px 12px;
    align-items: center;
    min-width: 0;
  }

  .account-sub-page__toolbar-line {
    display: inline-block;
    grid-row: 1 / span 2;
    align-self: center;
    width: 4px;
    height: 36px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--el-color-primary) 70%, transparent),
      color-mix(in srgb, var(--theme-color) 55%, transparent)
    );
    border-radius: 999px;
    box-shadow: 0 0 18px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  }

  .account-sub-page__toolbar-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .account-sub-page__toolbar-hint {
    grid-column: 2;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-tertiary);
  }

  .account-sub-page__toolbar-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    opacity: 0.65;
  }

  .account-sub-page__toolbar-title {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    background-color: transparent;
    background-image: linear-gradient(
      105deg,
      var(--page-text-main) 0%,
      color-mix(in srgb, var(--el-color-primary) 72%, var(--page-text-main) 28%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .account-sub-page__toolbar-actions {
    display: flex;
    flex: 1 1 320px;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .main-content {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
  }

  .list-side {
    display: flex;
    flex: 1;
    min-width: 0;
    min-height: 0;
  }

  .account-sub-page__list-panel {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 93%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 86%, transparent) 100%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 5%, transparent),
        color-mix(in srgb, var(--theme-color) 4%, transparent)
      );
    isolation: isolate;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 16%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 2;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 42%, transparent) 40%,
        color-mix(in srgb, var(--theme-color) 32%, transparent) 70%,
        transparent 100%
      );
      border-radius: 20px 20px 0 0;
      opacity: 0.8;
    }
  }

  .account-sub-page__list-panel-fx {
    position: absolute;
    inset: -35% 20% 40%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 55% at 18% 0%,
      color-mix(in srgb, var(--el-color-primary) 18%, transparent) 0%,
      transparent 62%
    );
    filter: blur(32px);
    opacity: 0.55;
  }

  .account-sub-page__list-panel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 14px 16px;
    overflow: auto;
    scrollbar-gutter: stable;
  }

  .detail-side {
    display: flex;
    flex-shrink: 0;
    align-items: stretch;
    min-height: 0;
  }

  .account-sub-page__detail-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background:
      linear-gradient(
        198deg,
        color-mix(in srgb, var(--default-box-color) 92%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 86%, transparent) 100%
      ),
      linear-gradient(
        125deg,
        color-mix(in srgb, var(--theme-color) 6%, transparent),
        color-mix(in srgb, var(--el-color-primary) 5%, transparent)
      );
    isolation: isolate;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 16%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 2;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--theme-color) 34%, transparent) 38%,
        color-mix(in srgb, var(--el-color-primary) 42%, transparent) 62%,
        transparent 100%
      );
      border-radius: 20px 20px 0 0;
      opacity: 0.8;
    }
  }

  .account-sub-page__detail-panel-fx {
    position: absolute;
    inset: -35% -15% 38%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 78% 52% at 92% 0%,
      color-mix(in srgb, var(--theme-color) 16%, transparent) 0%,
      color-mix(in srgb, var(--el-color-primary) 14%, transparent) 42%,
      transparent 62%
    );
    filter: blur(34px);
    opacity: 0.52;
  }

  .account-sub-page__detail-panel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 12px 12px 14px;
    overflow: auto;
    scrollbar-gutter: stable;
  }

  /* 主色走 Element primary（--el-color-primary），仅补充层次与动效 */
  .account-sub-page__btn-primary.el-button--primary {
    font-weight: 600 !important;
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent) !important;
    transition:
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out),
      filter var(--duration-normal) var(--ease-out);

    &:hover {
      filter: brightness(1.04);
      box-shadow:
        0 12px 28px color-mix(in srgb, var(--el-color-primary) 34%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 18%, transparent) !important;
      transform: translateY(-1px);
    }
  }

  .account-sub-page__btn-secondary.el-button {
    --el-button-bg-color: color-mix(in srgb, var(--default-box-color) 52%, transparent);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    --el-button-text-color: var(--text-secondary);
    --el-button-hover-text-color: var(--el-color-primary);
    --el-button-hover-border-color: color-mix(in srgb, var(--el-color-primary) 48%, transparent);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 9%, transparent);
    --el-button-active-text-color: var(--el-color-primary);
    --el-button-active-border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
    --el-button-active-bg-color: color-mix(in srgb, var(--el-color-primary) 12%, transparent);

    font-weight: 500;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &:hover {
      box-shadow: 0 8px 18px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
      transform: translateY(-1px);
    }
  }

  .account-sub-page__search {
    flex: 1 1 200px;
    min-width: 160px;
    max-width: 280px;

    :deep(.el-input__wrapper) {
      background: color-mix(in srgb, var(--default-box-color) 52%, transparent) !important;
      border: 1px solid var(--page-border) !important;
      border-radius: 10px;
      box-shadow: none !important;
      transition:
        border-color var(--duration-normal) var(--ease-out),
        box-shadow var(--duration-normal) var(--ease-out);

      &:hover,
      &:focus-within {
        border-color: color-mix(in srgb, var(--el-color-primary) 40%, transparent) !important;
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 16%, transparent) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    :deep(.el-input__prefix) {
      color: var(--text-tertiary);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover {
      transform: none;
    }
  }

  @media (width <= 768px) {
    .account-sub-page {
      padding: 16px;
    }

    .account-sub-page__toolbar {
      border-radius: 16px;
    }

    .account-sub-page__list-panel {
      border-radius: 16px;

      &::before {
        border-radius: 16px 16px 0 0;
      }
    }

    .account-sub-page__detail-panel {
      border-radius: 16px;

      &::before {
        border-radius: 16px 16px 0 0;
      }
    }

    .account-sub-page__search {
      flex: 1 1 100%;
      max-width: none;
    }
  }
</style>
