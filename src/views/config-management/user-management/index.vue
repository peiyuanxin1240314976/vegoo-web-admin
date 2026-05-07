<!-- 用户管理页面 - 左右分栏：左侧统计/筛选/列表，右侧详情占位 -->
<template>
  <div class="user-page art-full-height flex">
    <!-- 左侧：统计卡片 + 筛选 + 列表 -->
    <div class="user-page-left flex-1 min-h-0 min-w-0 flex flex-col">
      <UserLeftPanel
        :stats="userStats"
        :filter-form="filterForm"
        :batch-mode="batchMode"
        :role-options="roleOptions"
        @add-user="openCreateDrawer"
        @search="handleSearch"
        @reset="resetSearchParams"
        @toggle-batch="toggleBatchMode"
      >
        <template #table>
          <ArtTableHeader
            v-model:columns="columnChecks"
            :loading="loading"
            @refresh="refreshData"
          />
          <ArtTable
            :loading="loading"
            :data="data"
            :columns="columns"
            :pagination="pagination"
            :pagination-options="USER_TABLE_PAGINATION_OPTIONS"
            @row-click="handleTableRowClick"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          />
        </template>
      </UserLeftPanel>
    </div>

    <!-- 右侧：抽屉（查看/编辑） -->
    <ElDrawer
      v-model="rightDrawerVisible"
      :title="rightDrawerTitle"
      size="50%"
      :append-to-body="true"
      :close-on-click-modal="false"
      destroy-on-close
      @closed="handleRightDrawerClosed"
    >
      <UserRightPanel
        :mode="rightPanelMode"
        :user="currentDetailUser"
        :editing="rightPanelEditing"
        :role-options="assignRoleOptions"
        @save="handleRightPanelSave"
        @cancel="handleRightPanelCancel"
        @disable="handleRightPanelDisable"
      />
    </ElDrawer>

    <!-- 用户弹窗 -->
    <UserDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :user-data="currentUserData"
      :submitting="dialogSubmitting"
      @submit="handleDialogSubmit"
    />

    <UserAppPermissionsDialog
      v-model:visible="appPermDialogVisible"
      :user-id="appPermDialogUserId"
      @success="refreshData"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchStats,
    fetchUserList,
    createUser,
    updateUser,
    disableUser,
    resetUserPassword
  } from '@/api/config-management'
  import UserLeftPanel from './modules/user-left-panel.vue'
  import UserRightPanel from './modules/user-right-panel.vue'
  import UserDialog from './modules/user-dialog.vue'
  import UserAppPermissionsDialog from './modules/user-app-permissions-dialog.vue'
  import { ElTag, ElMessageBox, ElImage, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'
  import type { UserFilterForm } from './modules/user-left-panel.vue'
  import type { UserStats } from './types'
  import { useConfigRoleListStore } from '@/store/modules/config-role-list'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  /** 本页列表每页最多 10 条（与分页器选项一致） */
  const USER_LIST_MAX_PAGE_SIZE = 10
  const USER_TABLE_PAGINATION_OPTIONS = { pageSizes: [USER_LIST_MAX_PAGE_SIZE] as number[] }

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})
  const dialogSubmitting = ref(false)

  const appPermDialogVisible = ref(false)
  const appPermDialogUserId = ref(0)

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 右侧详情当前选中的用户（点击表格行时设置）
  const currentDetailUser = ref<UserListItem | null>(null)
  const rightPanelEditing = ref(false)
  const rightDrawerVisible = ref(false)
  const rightPanelMode = ref<'edit' | 'create'>('edit')

  const rightDrawerTitle = computed(() => {
    if (rightPanelMode.value === 'create') return '新建用户'
    const u = currentDetailUser.value
    if (!u) return '用户详情'
    const name = String(u.userName ?? '').trim()
    return name ? `用户：${name}` : '用户详情'
  })

  // 批量选择模式：为 true 时表格显示勾选列，可批量选择
  const batchMode = ref(false)

  // 筛选表单（左侧面板：姓名、角色、状态）
  const filterForm = ref<UserFilterForm>({
    userName: undefined,
    role: undefined,
    status: undefined
  })

  const roleListStore = useConfigRoleListStore()
  const roleOptions = computed(() => [
    { label: '所有角色', value: '' as const },
    ...roleListStore.items.map((r) => ({ label: r.roleName, value: r.roleId }))
  ])

  // 右侧「分配角色」用 roleId 作为 value，用于回显 userRoles[0]（来自 user/table）
  const assignRoleOptions = computed(() =>
    roleListStore.items
      .filter((r) => typeof r.roleId === 'number' && !Number.isNaN(r.roleId))
      .map((r) => ({ label: r.roleName, value: r.roleId }))
  )

  const roleIdNameMap = computed<Record<string, string>>(() => {
    const pairs = roleListStore.items
      .map((r) => [String(r.roleId ?? ''), String(r.roleName ?? '')] as const)
      .filter(([id, name]) => id.trim() !== '' && name.trim() !== '')
    return Object.fromEntries(pairs)
  })

  /** 列表状态标签类型（文案直接用后端 status 字段） */
  const USER_STATUS_TAG_TYPE: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    活跃: 'success',
    待激活: 'warning',
    禁用: 'danger'
  }

  /** 无头像或空 URL 时使用 SVG 占位（不发起网络请求） */
  const USER_AVATAR_PLACEHOLDER =
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">' +
        '<rect width="80" height="80" rx="10" fill="#E4E4E7"/>' +
        '<circle cx="40" cy="32" r="14" fill="#A1A1AA"/>' +
        '<ellipse cx="40" cy="72" rx="26" ry="18" fill="#A1A1AA"/>' +
        '</svg>'
    )

  function resolveUserAvatarUrl(avatar?: string | null): string {
    const u = avatar?.trim()
    return u && u.length > 0 ? u : USER_AVATAR_PLACEHOLDER
  }

  function hasRealUserAvatar(avatar?: string | null): boolean {
    return Boolean(avatar?.trim())
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    toggleColumn
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchUserList,
      apiParams: {
        current: 1,
        size: USER_LIST_MAX_PAGE_SIZE,
        ...filterForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection', visible: false }, // 勾选列，默认隐藏，点击「批量操作」后显示
        {
          prop: 'userInfo',
          label: '用户名',
          width: 280,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            const src = resolveUserAvatarUrl(row.avatar)
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src,
                previewSrcList: hasRealUserAvatar(row.avatar) ? [row.avatar!.trim()] : [src],
                previewTeleported: true,
                fit: 'cover'
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.userName),
                h('p', { class: 'email' }, row.userEmail)
              ])
            ])
          }
        },
        {
          prop: 'name',
          label: '昵称',
          width: 100,
          showOverflowTooltip: true,
          formatter: (row) => row.name || '—'
        },
        {
          prop: 'userRoles',
          label: '角色',
          width: 140,
          showOverflowTooltip: true,
          formatter: (row) => {
            const ids = (row.userRoles ?? []).map((v) => String(v).trim()).filter(Boolean)
            if (!ids.length) return '—'
            const names = ids
              .map((id) => roleIdNameMap.value[id])
              .filter((name) => String(name ?? '').trim() !== '')
            return names.length ? names.join('，') : ids.join('，')
          }
        },
        {
          prop: 'userGender',
          label: '性别',
          sortable: true,
          formatter: (row) => row.userGender
        },
        { prop: 'userPhone', label: '手机号' },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const text = String(row.status ?? '').trim()
            const type = text ? (USER_STATUS_TAG_TYPE[text] ?? 'info') : 'info'
            return h(ElTag, { type }, () => text || '—')
          }
        },
        {
          prop: 'joinTime',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 150,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => {
                  currentDetailUser.value = row
                  rightPanelEditing.value = true
                  rightDrawerVisible.value = true
                }
              }),
              h(ArtButtonTable, {
                icon: 'ri:lock-password-line',
                iconClass: 'bg-warning/12 text-warning',
                onClick: () => resetPassword(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
              // h(ArtButtonTable, {
              //   type: 'view',
              //   onClick: () => userRoleList(row)
              // })
            ])
        }
      ]
    }
  })

  /**
   * 用户统计：来自独立接口
   */
  const userStats = ref<UserStats>({ total: 0, active: 0, disabled: 0, pending: 0 })

  /** 加载统计卡片 */
  const loadStats = async () => {
    try {
      const res = await fetchStats()
      userStats.value = res
    } catch {
      // 统计接口失败不影响主流程
    }
  }

  /** 初始化 */
  onMounted(() => {
    loadStats()
    roleListStore.loadRoleList({ force: false })
  })

  // const userRoleList = (row: UserListItem) => {
  //   appPermDialogUserId.value = row.id
  //   appPermDialogVisible.value = true
  // }

  /**
   * 搜索处理
   * @param params 筛选参数（姓名、角色、状态）
   */
  const handleSearch = (params: UserFilterForm) => {
    Object.assign(searchParams, {
      userName: params.userName,
      status: params.status
    })
    const sp = searchParams as Record<string, unknown>
    if (params.role != null && params.role !== '') {
      sp.role = params.role
    } else {
      delete sp.role
    }
    getData()
  }

  /** 切换批量选择模式：显示/隐藏表格勾选列 */
  const toggleBatchMode = () => {
    batchMode.value = !batchMode.value
    toggleColumn?.('__selection__', batchMode.value)
    if (!batchMode.value) {
      selectedRows.value = []
    }
  }

  /**
   * 删除用户（禁用）
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('禁用用户:', row)
    ElMessageBox.confirm(`确定要禁用该用户吗？`, '禁用用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      await disableUser({ id: row.id, operator: 'current_user' })
      ElMessage.success('已禁用')
      if (currentDetailUser.value?.id === row.id) {
        currentDetailUser.value = null
      }
      refreshData()
      loadStats()
    })
  }

  const resetPassword = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要重置用户「${row.userName}」的密码吗？`, '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await resetUserPassword({ id: row.id, operator: 'current_user' })
      ElMessage.success('重置成功')
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async (formData: Record<string, unknown>) => {
    if (dialogSubmitting.value) return
    try {
      dialogSubmitting.value = true
      const userRoles = (Array.isArray(formData.role) ? formData.role : [])
        .map((id) => Number(id))
        .filter((id) => !Number.isNaN(id))
      const payload = {
        userName: String(formData.username),
        userPhone: String(formData.phone),
        userGender: String(formData.gender),
        userRoles
      }
      if (dialogType.value === 'add') {
        const res = await createUser(payload as any)
        // 兼容两种常见返回：
        // 1) 直返业务体：{ id, ... }
        // 2) 包一层：{ code: 200, data: { id, ... }, message? }
        const wrappedCode = (res as any)?.code
        const wrappedData = (res as any)?.data
        const created = wrappedData ?? res

        if (wrappedCode != null && Number(wrappedCode) !== 200) {
          throw new Error(String((res as any)?.message || '创建用户失败'))
        }
        // 兼容 id 为 string/number：只要有值即可视为创建成功
        const createdId = (created as any)?.id
        if (createdId == null || String(createdId).trim() === '') {
          throw new Error('创建用户失败：接口未返回 id')
        }
        ElMessage.success('创建成功')
      } else {
        const res = await updateUser({ id: Number(currentUserData.value?.id), ...payload })
        // 兼容两种常见返回：
        // 1) 直返：{ success: true, updatedUser: {...} }
        // 2) 包一层：{ code: 200, data: {...}, message? }
        const wrappedCode = (res as any)?.code
        if (wrappedCode != null) {
          if (Number(wrappedCode) !== 200) {
            throw new Error(String((res as any)?.message || '更新用户失败'))
          }
        } else if (!(res as any)?.success) {
          throw new Error('更新用户失败：接口未返回 success=true')
        }
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      currentUserData.value = {}
      refreshData()
      loadStats()
    } catch (error) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请确认接口返回或稍后重试')
    } finally {
      dialogSubmitting.value = false
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }

  /** 列表有数据时默认选中第一行，在右侧展示 */
  watch(
    () => data.value,
    (list) => {
      if (list?.length && list[0]) {
        currentDetailUser.value = list[0]
      }
    },
    { immediate: true, deep: true }
  )

  /** 点击表格行：在右侧展示该用户详情 */
  const handleTableRowClick = (row: UserListItem) => {
    currentDetailUser.value = row
    rightPanelEditing.value = true
    rightPanelMode.value = 'edit'
    rightDrawerVisible.value = true
  }

  const openCreateDrawer = () => {
    currentDetailUser.value = null
    rightPanelEditing.value = true
    rightPanelMode.value = 'create'
    rightDrawerVisible.value = true
  }

  /** 右侧面板取消：关闭抽屉 */
  const handleRightPanelCancel = () => {
    rightDrawerVisible.value = false
  }

  const handleRightDrawerClosed = () => {
    rightPanelEditing.value = false
    currentDetailUser.value = null
    rightPanelMode.value = 'edit'
  }

  /** 右侧面板保存（基础信息 + 权限） */
  const handleRightPanelSave = async (payload: {
    nickName: string
    userName: string
    userPhone: string
    userGender: string
    roleId: number | ''
    accessibleApps: string[]
    remark: string
  }) => {
    try {
      const nextUserRoles =
        payload.roleId !== '' ? [Number(payload.roleId)].filter((n) => Number.isFinite(n)) : []

      const name = String(payload.nickName ?? '').trim()
      const userName = String(payload.userName ?? '').trim()
      const userPhone = String(payload.userPhone ?? '').trim()
      const userGender = String(payload.userGender ?? '').trim()

      const hasChinese = /[\u4e00-\u9fa5]/.test(userName)
      const hasSpace = /\s/.test(userName)
      if (hasChinese || hasSpace) {
        ElMessage.warning('用户名仅支持英文/数字/下划线，且不能包含中文或空格')
        return
      }

      if (!name) {
        ElMessage.warning('请填写姓名')
        return
      }
      if (!userName) {
        ElMessage.warning('请填写用户名')
        return
      }
      if (!userPhone) {
        ElMessage.warning('请填写手机号')
        return
      }
      if (payload.roleId === '' || !nextUserRoles.length) {
        ElMessage.warning('请选择角色')
        return
      }

      if (rightPanelMode.value === 'create') {
        await createUser({
          // 以你说的 table 字段为准：name 对应姓名
          name,
          // 兼容旧字段：后端若仍用 nickName 也可接
          nickName: name,
          userName,
          userPhone,
          userGender,
          userRoles: nextUserRoles,
          accessibleApps: payload.accessibleApps,
          remark: payload.remark
        } as any)
        ElMessage.success('创建成功')
        rightDrawerVisible.value = false
      } else {
        if (!currentDetailUser.value) return
        // 仅走 updateUser：将角色/可访问应用/备注一并提交
        const updatePayload = {
          id: currentDetailUser.value.id,
          name,
          nickName: name,
          userName,
          userPhone,
          userGender,
          userRoles: nextUserRoles,
          accessibleApps: payload.accessibleApps,
          remark: payload.remark
        } as any
        await updateUser(updatePayload)
        currentDetailUser.value = {
          ...currentDetailUser.value,
          nickName: name,
          userName,
          userPhone,
          userGender,
          accessibleApps: [...payload.accessibleApps],
          remark: payload.remark,
          userRoles: nextUserRoles.length
            ? [String(nextUserRoles[0])]
            : [...(currentDetailUser.value.userRoles ?? [])]
        }
        ElMessage.success('保存成功')
        rightPanelEditing.value = false
      }
      refreshData()
      loadStats()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  /** 右侧面板禁用当前用户 */
  const handleRightPanelDisable = () => {
    if (!currentDetailUser.value) return
    ElMessageBox.confirm(`确定要禁用用户「${currentDetailUser.value.userName}」吗？`, '禁用用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await disableUser({ id: currentDetailUser.value!.id, operator: 'current_user' })
      ElMessage.success('已禁用')
      currentDetailUser.value = null
      rightPanelEditing.value = false
      rightDrawerVisible.value = false
      refreshData()
      loadStats()
    })
  }
</script>

<style scoped lang="scss">
  /* 覆盖 art-full-height 的 flex-direction: column，改为左右分栏；小屏自适应为上下布局 */
  .user-page {
    flex-direction: row;
    gap: 16px;
    width: 100%;
    min-width: 0;

    /* 首帧 --art-full-height 可能尚未写入，避免 height 失效导致整页随内容被撑高 */
    height: var(--art-full-height, calc(100vh - 120px));
    min-height: 0;
    max-height: var(--art-full-height, calc(100vh - 120px));
    overflow: hidden;
  }

  .user-page-left {
    flex: 1;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  /* 小屏：改为上下布局，右侧占满宽 */
  @media (width <= 1024px) {
    .user-page {
      flex-direction: column;
      overflow: auto;
    }

    .user-page-left {
      flex: none;
      min-height: 400px;
    }
  }

  /* 超小屏：与全局 .art-full-height 一致改为自然高度，避免 max-height 限制可滚动内容 */
  @media (width <= 640px) {
    .user-page {
      gap: 12px;
      height: auto;
      max-height: none;
    }
  }
</style>
