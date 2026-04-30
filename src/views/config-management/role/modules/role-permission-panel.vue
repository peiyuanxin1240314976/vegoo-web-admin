<template>
  <div class="role-permission-panel flex h-full min-h-0 min-w-0 flex-col">
    <template v-if="selectedRole">
      <div class="panel-header">
        <div class="header-title-wrap">
          <h2 class="panel-title">权限配置 - {{ selectedRole.roleName }}</h2>
          <p class="panel-desc">第一版聚焦页面访问与日期权限，按钮级权限先预留编码位。</p>
        </div>
        <ElTag type="info" effect="plain" round>按钮权限预留</ElTag>
      </div>

      <ElTabs v-model="activeTab" class="permission-tabs">
        <ElTabPane label="页面权限" name="pages">
          <RolePermissionFunc ref="pagesRef" :role-id="selectedRole.roleId" />
        </ElTabPane>
        <ElTabPane label="日期权限" name="date">
          <RolePermissionData ref="dateRef" :role-id="selectedRole.roleId" />
        </ElTabPane>
      </ElTabs>

      <div class="panel-footer">
        <ElButton
          class="btn-save"
          type="primary"
          round
          :loading="saving"
          :disabled="saving"
          @click="emit('save')"
          >保存权限配置</ElButton
        >
        <ElButton round @click="handleReset">重置</ElButton>
      </div>
    </template>

    <ElCard v-else class="panel-empty" shadow="never">
      <div class="empty-tip">
        <p class="empty-text">请先从左侧选择角色</p>
        <p class="empty-desc">当前页会展示该角色的页面访问范围与日期查询范围。</p>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import type { RolePermissionUpdatePayload } from '@/api/config-management/role'
  import RolePermissionData from './role-permission-data.vue'
  import RolePermissionFunc from './role-permission-func.vue'

  defineOptions({ name: 'RolePermissionPanel' })

  type RoleListItem = Api.SystemManage.RoleListItem

  const props = defineProps<{
    selectedRole?: RoleListItem | null
    saving?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'save'): void
  }>()

  const activeTab = ref('pages')
  const pagesRef = ref<InstanceType<typeof RolePermissionFunc> | null>(null)
  const dateRef = ref<InstanceType<typeof RolePermissionData> | null>(null)

  function handleReset() {
    pagesRef.value?.reset?.()
    dateRef.value?.reset?.()
  }

  function getSavePayload(): RolePermissionUpdatePayload | null {
    if (!props.selectedRole?.roleId) return null

    return {
      roleId: props.selectedRole.roleId,
      routePermissions: {
        routeNames: pagesRef.value?.getRouteNames?.() ?? []
      },
      datePermissions: dateRef.value?.getDatePermissionPayload?.() ?? {
        defaultDateScope: {
          maxHistoryDays: 30,
          defaultRangeDays: 7,
          allowCustomRange: true
        },
        pageDateScopes: []
      },
      buttonPermissions: {
        codes: []
      }
    }
  }

  defineExpose({
    reset: handleReset,
    getSavePayload
  })
</script>

<style scoped lang="scss">
  .role-permission-panel {
    box-sizing: border-box;
    padding: 16px;
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .panel-header {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .header-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .panel-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .panel-desc {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .permission-tabs {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
    }
  }

  .panel-footer {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
    padding-top: 16px;
    margin-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .btn-save {
    min-width: 120px;
  }

  .panel-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;

    :deep(.el-card__body) {
      width: 100%;
      text-align: center;
    }
  }

  .empty-text {
    margin-bottom: 6px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .empty-desc {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    opacity: 0.8;
  }
</style>
