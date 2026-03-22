<!-- 用户管理页面 - 左右分栏：左侧统计/筛选/列表，右侧详情占位 -->
<template>
  <div class="user-page art-full-height flex">
    <!-- 左侧：统计卡片 + 筛选 + 列表 -->
    <div class="user-page-left flex-1 min-w-0 flex flex-col">
      <UserLeftPanel
        :stats="userStats"
        :filter-form="filterForm"
        :batch-mode="batchMode"
        @add-user="showDialog('add')"
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
            @row-click="handleTableRowClick"
            @selection-change="handleSelectionChange"
            @pagination:size-change="handleSizeChange"
            @pagination:current-change="handleCurrentChange"
          />
        </template>
      </UserLeftPanel>
    </div>

    <!-- 右侧：用户详情 -->
    <div class="user-page-right">
      <UserRightPanel
        :user="currentDetailUser"
        @save="handleRightPanelSave"
        @cancel="currentDetailUser = null"
        @edit="() => currentDetailUser && showDialog('edit', currentDetailUser)"
        @disable="handleRightPanelDisable"
      />
    </div>

    <!-- 用户弹窗 -->
    <UserDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :user-data="currentUserData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetUserList } from '@/api/system-manage'
  import UserLeftPanel from './modules/user-left-panel.vue'
  import UserRightPanel from './modules/user-right-panel.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox, ElImage, ElMessage } from 'element-plus'
  import { DialogType } from '@/types'
  import type { UserStats, UserFilterForm } from './modules/user-left-panel.vue'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 右侧详情当前选中的用户（点击表格行时设置）
  const currentDetailUser = ref<UserListItem | null>(null)

  // 批量选择模式：为 true 时表格显示勾选列，可批量选择
  const batchMode = ref(false)

  // 筛选表单（左侧面板：姓名、角色、状态）
  const filterForm = ref<UserFilterForm>({
    userName: undefined,
    role: undefined,
    status: undefined
  })

  /** 列表状态标签（与 Api.SystemManage.UserListItem.status 约定一致） */
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '已禁用' }
  } as const

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

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
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
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
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
          prop: 'nickName',
          label: '昵称',
          width: 100,
          showOverflowTooltip: true,
          formatter: (row) => row.nickName || '—'
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
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 用户统计：total 为服务端分页总数；其余三项为「当前页」条数（与接口未返回全局分布时对齐）
   */
  const userStats = computed<UserStats>(() => {
    const list = data?.value ?? []
    const totalCount = pagination?.total ?? 0
    return {
      total: totalCount,
      active: list.filter((r: UserListItem) => r.status === '1').length,
      disabled: list.filter((r: UserListItem) => r.status === '4').length,
      pending: list.filter((r: UserListItem) => r.status === '2' || r.status === '3').length
    }
  })

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
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    console.log('删除用户:', row)
    ElMessageBox.confirm(`确定要禁用该用户吗？`, '禁用用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      ElMessage.success('已禁用')
    })
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentUserData.value = {}
    } catch (error) {
      console.error('提交失败:', error)
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
  }

  /** 右侧面板保存（角色、可访问应用、备注） */
  const handleRightPanelSave = (payload: { role: string; apps: string[]; remark: string }) => {
    console.log('保存用户详情:', currentDetailUser.value?.id, payload)
    ElMessage.success('保存成功')
  }

  /** 右侧面板禁用当前用户 */
  const handleRightPanelDisable = () => {
    if (!currentDetailUser.value) return
    ElMessageBox.confirm(`确定要禁用用户「${currentDetailUser.value.userName}」吗？`, '禁用用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      ElMessage.success('已禁用')
      currentDetailUser.value = null
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
    overflow: hidden;
  }

  .user-page-left {
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .user-page-right {
    flex-shrink: 0;
    width: 360px;
    min-width: 320px;
    max-width: 420px;
    overflow: auto;
  }

  /* 中等屏：右侧略收窄 */
  @media (width <= 1280px) {
    .user-page-right {
      width: 320px;
      min-width: 280px;
      max-width: 360px;
    }
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

    .user-page-right {
      flex-shrink: 0;
      width: 100%;
      min-width: 0;
      max-width: none;
      min-height: 360px;
    }
  }

  /* 超小屏：整体紧凑 */
  @media (width <= 640px) {
    .user-page {
      gap: 12px;
    }
  }
</style>
