<template>
  <div class="oa-page art-full-height">
    <div class="oa-page-fx" aria-hidden="true"></div>
    <OpenAccountToolbar
      v-model:search-keyword="searchKeyword"
      @new="handleNew"
      @export="handleExport"
    />

    <div class="oa-page__main">
      <div class="oa-page__list">
        <OpenAccountTab
          ref="openAccountTabRef"
          :search-keyword="searchKeyword"
          :selected-id="currentRecord?.id"
          @select="handleSelect"
          @assign="handleAssignOpen"
          @delete="handleDeleteOpen"
        />
      </div>
      <div class="oa-page__detail">
        <OpenAccountDetailPanel
          :data="currentRecord"
          @assign="handleAssignOpen"
          @delete="handleDeleteOpen"
        />
      </div>
    </div>

    <OpenAccountFormDialog v-model:visible="formVisible" @success="handleFormSuccess" />

    <OpenAccountAssignDialog
      v-model:visible="assignVisible"
      :data="assignTarget"
      @success="handleAssignSuccess"
    />

    <OpenAccountDeleteDialog
      v-model:visible="deleteVisible"
      :data="deleteTarget"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import OpenAccountToolbar from './modules/open-account-toolbar.vue'
  import OpenAccountTab from './modules/open-account-tab.vue'
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
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 0 var(--space-6) var(--space-6);
    overflow-x: clip;
    color: var(--text-primary);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .oa-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(ellipse 72% 52% at 6% 6%, rgb(16 185 129 / 26%) 0%, transparent 58%),
      radial-gradient(ellipse 58% 44% at 94% 8%, rgb(59 130 246 / 26%) 0%, transparent 58%),
      radial-gradient(ellipse 42% 34% at 50% 14%, rgb(168 85 247 / 12%) 0%, transparent 55%);
    mask-image: linear-gradient(to bottom, black 0%, black 36%, transparent 66%);
    animation: oa-aurora-drift 14s ease-in-out infinite alternate;
  }

  .oa-page::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: linear-gradient(to bottom, black 0%, black 24%, transparent 48%);
  }

  .oa-page > *:not(.oa-page-fx) {
    position: relative;
    z-index: 1;
  }

  .oa-page-fx {
    position: absolute;
    inset: -12% -12% 52%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 10%) 55deg,
      rgb(6 182 212 / 7%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 8%) 200deg,
      transparent 285deg,
      rgb(168 85 247 / 7%) 330deg,
      transparent 360deg
    );
    opacity: 0.78;
    mask-image: linear-gradient(to bottom, black 0%, black 46%, transparent 82%);
    animation: oa-fx-spin 52s linear infinite;
    will-change: transform;
  }

  @keyframes oa-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1%, -0.8%);
    }
  }

  @keyframes oa-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .oa-page__main {
    display: flex;
    flex: 1;
    gap: var(--space-4);
    min-height: 0;
  }

  .oa-page__list {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .oa-page__detail {
    display: flex;
    flex-shrink: 0;
    align-items: stretch;
  }

  @media (prefers-reduced-motion: reduce) {
    .oa-page::before,
    .oa-page-fx {
      animation: none;
    }
  }
</style>
