<template>
  <div class="role-page art-full-height flex">
    <div class="role-page-left">
      <RoleListPanel
        :role-list="roleList"
        :selected-role="selectedRole"
        :role-user-count-map="roleUserCountMap"
        @add-role="showDialog('add')"
        @edit-role="showDialog('edit', $event)"
        @select-role="selectedRole = $event"
      />
    </div>

    <div class="role-page-center">
      <RolePermissionPanel
        ref="permissionPanelRef"
        :selected-role="selectedRole"
        :saving="permissionSaving"
        @save="handleSavePermission"
      />
    </div>

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
        @edit-role="handleEditRole"
      />
    </div>

    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="handleRoleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import {
    fetchRolePermissionSummary,
    fetchRolePermissionsUpdate,
    fetchRoleUsers,
    type RolePermissionSummary,
    type RolePermissionUpdatePayload
  } from '@/api/config-management/role'
  import { useConfigRoleListStore } from '@/store/modules/config-role-list'
  import { getMockRoleDescription, getMockRoleUsers } from './mock/data'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import RoleListPanel from './modules/role-list-panel.vue'
  import RolePermissionPanel from './modules/role-permission-panel.vue'
  import RoleUserPanel from './modules/role-user-panel.vue'
  import type { RoleUserItem } from './modules/role-user-panel.vue'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  const roleListStore = useConfigRoleListStore()
  const roleList = computed(() => roleListStore.items)
  const selectedRole = ref<RoleListItem | null>(null)
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRoleData = ref<RoleListItem | undefined>(undefined)
  const permissionPanelRef = ref<InstanceType<typeof RolePermissionPanel> | null>(null)
  const permissionSaving = ref(false)
  const roleUserCountMap = ref<Record<number, number>>({})
  const currentRoleUsers = ref<RoleUserItem[]>([])
  const permissionSummary = ref<RolePermissionSummary | undefined>(undefined)
  const pendingFocusRoleId = ref<number | null>(null)

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

  watch(
    () => selectedRole.value,
    async (newVal) => {
      if (!newVal) {
        currentRoleUsers.value = []
        permissionSummary.value = undefined
        return
      }

      try {
        await loadSelectedRoleSideData(newVal.roleId)
      } catch (error) {
        console.error('获取角色详情数据失败', error)
      }
    }
  )

  async function loadRoleList(preferredRoleId?: number) {
    try {
      await roleListStore.loadRoleList({ force: true })
      const list = roleListStore.items
      roleUserCountMap.value = Object.fromEntries(
        list.map((item) => [item.roleId, getMockRoleUsers(item.roleId).length])
      )

      if (list.length) {
        const targetId = preferredRoleId ?? pendingFocusRoleId.value ?? selectedRole.value?.roleId
        const matchedRole = targetId ? list.find((item) => item.roleId === targetId) : undefined

        if (matchedRole) {
          selectedRole.value = matchedRole
        } else {
          selectedRole.value = list[0]
        }
      } else {
        selectedRole.value = null
      }

      pendingFocusRoleId.value = null
    } catch (error) {
      console.error('获取角色列表失败', error)
    }
  }

  async function refreshRoleList(preferredRoleId?: number) {
    await loadRoleList(preferredRoleId)
  }

  function showDialog(type: 'add' | 'edit', row?: RoleListItem) {
    dialogType.value = type
    currentRoleData.value = row
    dialogVisible.value = true
  }

  async function handleRoleDialogSuccess(payload: { roleId: number; dialogType: 'add' | 'edit' }) {
    pendingFocusRoleId.value = payload.roleId
    await refreshRoleList(payload.roleId)
  }

  async function handleSavePermission() {
    if (permissionSaving.value) return
    const payload =
      permissionPanelRef.value?.getSavePayload?.() as RolePermissionUpdatePayload | null
    if (!payload || !payload.roleId) {
      ElMessage.warning('请先选择角色后再保存权限配置')
      return
    }

    try {
      permissionSaving.value = true
      const res = await fetchRolePermissionsUpdate(payload)
      if (res.success) {
        ElMessage.success('权限配置已保存')
        permissionPanelRef.value?.reset?.()
        await loadSelectedRoleSideData(payload.roleId)
      }
    } catch (error) {
      console.error('保存权限配置失败', error)
    } finally {
      permissionSaving.value = false
    }
  }

  function handleEditUser() {
    ElMessage.info('后续可跳转到用户管理进行调整')
  }

  function handleDisableUser() {
    ElMessage.info('用户禁用能力待接入')
  }

  function handleBatchAssign() {
    ElMessage.info('批量分配角色能力待接入')
  }

  function handleBatchExport() {
    ElMessage.info('批量导出能力待接入')
  }

  function handleBatchDisable() {
    ElMessage.info('批量禁用能力待接入')
  }

  function handleEditRole() {
    if (!selectedRole.value) {
      ElMessage.warning('请先选择角色')
      return
    }
    showDialog('edit', selectedRole.value)
  }

  onMounted(() => {
    loadRoleList()
  })
</script>

<style scoped lang="scss">
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
      min-height: 420px;
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
