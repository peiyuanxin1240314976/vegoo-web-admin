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
        ref="permissionPanelRef"
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
  import { getMockRoleDescription } from './mock/data'
  import {
    fetchRoleList,
    fetchRolePermissionsUpdate,
    fetchRolePermissionSummary,
    fetchRoleUsers,
    type RolePermissionSummary,
    type RolePermissionUpdatePayload
  } from '@/api/config-management/role'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  /** 左侧角色列表：现在从 API 请求，而不是直接使用本地假数据常量 */
  const roleList = ref<RoleListItem[]>([])
  /** 当前选中的角色，默认选中第一项以保证中间列、右侧列有内容展示 */
  const selectedRole = ref<RoleListItem | null>(null)
  const dialogVisible = ref(false)
  const permissionDialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRoleData = ref<RoleListItem | undefined>(undefined)
  const permissionPanelRef = ref<InstanceType<typeof RolePermissionPanel> | null>(null)

  /** 角色对应用户数（若接口未返回，可来自单独接口或 mock） */
  const roleUserCountMap = ref<Record<number, number>>({
    1: 1,
    2: 3,
    3: 3,
    4: 3,
    5: 3,
    6: 3
  })

  /** 当前选中角色下的用户列表数据（通过监听选中角色后从 API 获取） */
  const currentRoleUsers = ref<RoleUserItem[]>([])
  /** 权限摘要数据（通过监听选中角色后从 API 获取） */
  const permissionSummary = ref<RolePermissionSummary | undefined>(undefined)

  /** 角色说明（假数据，见 @/views/config-management/role/mock/data.ts） */
  const roleDescription = computed(() => {
    if (!selectedRole.value) return ''
    return selectedRole.value.description || getMockRoleDescription(selectedRole.value.roleName)
  })

  async function loadSelectedRoleSideData(roleId: number) {
    const [usersRes, summaryRes] = await Promise.all([
      fetchRoleUsers({ roleId }),
      fetchRolePermissionSummary({ roleId })
    ])

    currentRoleUsers.value = usersRes.items || []
    permissionSummary.value = summaryRes.summary || undefined
  }

  /** 监听选中角色的变化，获取该角色下的用户与摘要数据 */
  watch(
    () => selectedRole.value,
    async (newVal) => {
      if (newVal) {
        const { roleId } = newVal
        try {
          await loadSelectedRoleSideData(roleId)
        } catch (error) {
          console.error('获取角色详情数据失败', error)
        }
      } else {
        currentRoleUsers.value = []
        permissionSummary.value = undefined
      }
    }
  )

  /** 刷新角色列表（调用接口并根据结果重新选中第一项） */
  async function loadRoleList() {
    try {
      const res = await fetchRoleList()
      roleList.value = res.items || []
      // 只要有数据且当前未选中或选中的不在新列表中，就默认选中第一个
      if (roleList.value.length) {
        const currentId = selectedRole.value?.roleId
        if (!currentId || !roleList.value.some((r) => r.roleId === currentId)) {
          selectedRole.value = roleList.value[0]
        }
      } else {
        selectedRole.value = null
      }
    } catch (error) {
      console.error('获取角色列表失败', error)
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

  async function handleSavePermission() {
    const payload =
      permissionPanelRef.value?.getSavePayload?.() as RolePermissionUpdatePayload | null
    if (!payload || !payload.roleId) {
      ElMessage.warning('请先选择角色后再保存权限配置')
      return
    }

    try {
      const res = await fetchRolePermissionsUpdate(payload)
      if (res.success) {
        ElMessage.success('权限配置已保存')
        permissionPanelRef.value?.reset?.()
        await loadSelectedRoleSideData(payload.roleId)
      }
    } catch (error) {
      console.error('保存权限配置失败', error)
    }
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
