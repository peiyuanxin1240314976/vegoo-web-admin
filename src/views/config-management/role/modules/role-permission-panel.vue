<!-- 权限管理 - 中间：权限配置 -->
<template>
  <div class="role-permission-panel flex h-full min-h-0 min-w-0 flex-col">
    <template v-if="selectedRole">
      <div class="panel-header">
        <div class="header-title-wrap">
          <h2 class="panel-title">权限配置-{{ selectedRole.roleName }}</h2>
          <p class="panel-desc">配置该角色可访问的模块、操作权限与数据粒度</p>
        </div>
      </div>

      <ElTabs v-model="activeTab" class="permission-tabs">
        <ElTabPane label="功能权限" name="func">
          <template #label>
            <span class="tab-label">
              <ElIcon v-if="activeTab === 'func'" class="tab-icon"><CircleCheck /></ElIcon>
              功能权限
            </span>
          </template>
          <RolePermissionFunc
            :role-id="selectedRole?.roleId"
            ref="funcRef"
            @compare="emit('compare')"
          />
        </ElTabPane>
        <ElTabPane label="数据权限" name="data">
          <RolePermissionData
            ref="dataRef"
            :role-name="selectedRole?.roleName"
            preview-user-name="张三"
          />
        </ElTabPane>
      </ElTabs>

      <!-- 功能权限与数据权限共用的底部操作 -->
      <div class="panel-footer">
        <ElButton class="btn-save" type="primary" round @click="emit('save')"
          >保存权限配置</ElButton
        >
        <ElButton round @click="handleReset">重置</ElButton>
      </div>
    </template>

    <ElCard v-else class="panel-empty" shadow="never">
      <div class="empty-tip">
        <p class="empty-text">请从左侧选择角色</p>
        <p class="empty-desc">配置该角色的功能权限与数据权限</p>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { CircleCheck } from '@element-plus/icons-vue'
  import RolePermissionFunc from './role-permission-func.vue'
  import RolePermissionData from './role-permission-data.vue'

  defineOptions({ name: 'RolePermissionPanel' })

  type RoleListItem = Api.SystemManage.RoleListItem

  defineProps<{
    selectedRole?: RoleListItem | null
  }>()

  const emit = defineEmits<{
    (e: 'save'): void
    (e: 'compare'): void
  }>()

  const activeTab = ref('func')
  const funcRef = ref<InstanceType<typeof RolePermissionFunc> | null>(null)
  const dataRef = ref<InstanceType<typeof RolePermissionData> | null>(null)

  function handleReset() {
    funcRef.value?.reset?.()
    dataRef.value?.reset?.()
  }
</script>

<style scoped lang="scss">
  .role-permission-panel {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    padding: 16px;
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .panel-header {
    flex-shrink: 0;
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
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  }

  .tab-label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .tab-icon {
    color: var(--el-color-success);
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
    min-height: 200px;

    :deep(.el-card__body) {
      width: 100%;
      text-align: center;
    }
  }

  .empty-tip {
    color: var(--el-text-color-secondary);
  }

  .empty-text {
    margin-bottom: 6px;
    font-size: 14px;
  }

  .empty-desc {
    font-size: 12px;
    opacity: 0.8;
  }
</style>
