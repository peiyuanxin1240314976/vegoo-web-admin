<!-- 权限管理 - 三列：角色列表 | 权限配置 | 用户列表 -->
<template>
  <div class="role-page art-full-height flex">
    <!-- 第一列：角色列表 -->
    <div class="role-page-left">
      <RoleListPanel
        :role-list="roleList"
        :selected-role="selectedRole"
        :role-user-count-map="roleUserCountMap"
        @add-role="showDialog('add')"
        @select-role="selectedRole = $event"
      />
    </div>

    <!-- 第二列：权限配置 -->
    <div class="role-page-center">
      <RolePermissionPanel
        :selected-role="selectedRole"
        @save="handleSavePermission"
        @compare="showCompareDialog"
      />
    </div>

    <!-- 第三列：用户列表 -->
    <div class="role-page-right">
      <RoleUserPanel
        :selected-role="selectedRole"
        :role-users="currentRoleUsers"
        :permission-summary="permissionSummary"
        :role-description="roleDescription"
        @edit-user="handleEditUser"
        @disable-user="handleDisableUser"
        @batch-assign="handleBatchAssign"
        @batch-export="handleBatchExport"
        @batch-disable="handleBatchDisable"
        @edit-desc="handleEditDesc"
      />
    </div>

    <!-- 角色新增/编辑弹窗 -->
    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshRoleList"
    />

    <!-- 对比其他角色（可选，沿用原菜单权限弹窗或新弹窗） -->
    <RolePermissionDialog
      v-model="permissionDialogVisible"
      :role-data="currentRoleData"
      @success="refreshRoleList"
    />
  </div>
</template>

<script setup lang="ts">
  import RoleListPanel from './modules/role-list-panel.vue'
  import RolePermissionPanel from './modules/role-permission-panel.vue'
  import RoleUserPanel from './modules/role-user-panel.vue'
  import type { RoleUserItem } from './modules/role-user-panel.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RolePermissionDialog from './modules/role-permission-dialog.vue'
  import {
    getMockRoleUsers,
    getMockPermissionSummary,
    getMockRoleDescription,
    MOCK_ROLE_LIST
  } from './mock/data'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  /** 左侧角色列表：使用假数据，见 @/views/config-management/role/mock/data.ts */
  const roleList = ref<RoleListItem[]>(MOCK_ROLE_LIST as RoleListItem[])
  /** 当前选中的角色，默认选中第一项以保证中间列、右侧列有内容展示 */
  const selectedRole = ref<RoleListItem | null>(MOCK_ROLE_LIST[0] as RoleListItem)
  const dialogVisible = ref(false)
  const permissionDialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRoleData = ref<RoleListItem | undefined>(undefined)

  /** 角色对应用户数（若接口未返回，可来自单独接口或 mock） */
  const roleUserCountMap = ref<Record<number, number>>({
    1: 1,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 3
  })

  /** 当前选中角色下的用户（假数据，见 @/views/config-management/role/mock/data.ts） */
  const currentRoleUsers = computed<RoleUserItem[]>(() => {
    if (!selectedRole.value) return []
    return getMockRoleUsers(selectedRole.value.roleId)
  })

  /** 权限摘要（假数据，见 @/views/config-management/role/mock/data.ts） */
  const permissionSummary = computed(() => getMockPermissionSummary(selectedRole.value?.roleId))

  /** 角色说明（假数据，见 @/views/config-management/role/mock/data.ts） */
  const roleDescription = computed(() => {
    if (!selectedRole.value) return ''
    return selectedRole.value.description || getMockRoleDescription(selectedRole.value.roleName)
  })

  /** 刷新角色列表（当前用假数据，仅重置为 mock 列表并选中第一项） */
  function loadRoleList() {
    roleList.value = MOCK_ROLE_LIST as RoleListItem[]
    if (roleList.value.length && !selectedRole.value) {
      selectedRole.value = roleList.value[0]
    }
  }

  function refreshRoleList() {
    loadRoleList()
  }

  function showDialog(type: 'add' | 'edit', row?: RoleListItem) {
    dialogType.value = type
    currentRoleData.value = row
    dialogVisible.value = true
  }

  function showCompareDialog() {
    currentRoleData.value = selectedRole.value ?? undefined
    permissionDialogVisible.value = true
  }

  function handleSavePermission() {
    ElMessage.success('权限配置已保存')
  }

  function handleEditUser() {
    ElMessage.info('编辑用户（可跳转用户管理或打开弹窗）')
  }

  function handleDisableUser() {
    ElMessage.info('禁用用户')
  }

  function handleBatchAssign() {
    ElMessage.info('批量分配角色')
  }

  function handleBatchExport() {
    ElMessage.info('批量导出')
  }

  function handleBatchDisable() {
    ElMessage.info('批量禁用')
  }

  function handleEditDesc() {
    ElMessage.info('编辑角色说明（可打开弹窗或内联编辑）')
  }

  onMounted(() => {
    loadRoleList()
  })
</script>

<style scoped lang="scss">
  /* 三列横向分栏：为整页与左列提供确定高度，避免 ElScrollbar（flex:1）在父高为 auto 时被压成 0 */
  .role-page {
    flex-direction: row;
    width: 100%;
    min-width: 0;
    height: var(--art-full-height, calc(100vh - 120px));
    min-height: var(--art-full-height, calc(100vh - 120px));
    overflow: hidden;
  }

  .role-page-left {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-self: stretch;
    width: 280px;
    min-width: 240px;
    min-height: 0;
    overflow: hidden;
  }

  .role-page-center {
    flex: 1;
    min-width: 320px;
    min-height: 0;
    overflow: hidden;
  }

  .role-page-right {
    flex-shrink: 0;
    width: 380px;
    min-width: 320px;
    max-width: 420px;
    min-height: 0;
    overflow: hidden;
  }

  @media (width <= 1280px) {
    .role-page-right {
      width: 340px;
      min-width: 300px;
    }
  }

  @media (width <= 1024px) {
    .role-page {
      flex-direction: column;
      height: auto;
      min-height: var(--art-full-height, calc(100vh - 120px));
      overflow: auto;
    }

    .role-page-left {
      flex: none;
      width: 100%;
      min-height: 240px;
    }

    .role-page-center {
      flex: none;
      min-height: 360px;
    }

    .role-page-right {
      flex: none;
      width: 100%;
      min-width: 0;
      max-width: none;
      min-height: 360px;
    }
  }
</style>
