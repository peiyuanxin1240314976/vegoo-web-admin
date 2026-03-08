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
  import { ACCOUNT_TABLE_DATA } from '@/mock/temp/formData'
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

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'danger' as const, text: '注销' }
  } as const

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
            return h('div', { class: 'user flex-c' }, [
              h(ElImage, {
                class: 'size-9.5 rounded-md',
                src: row.avatar,
                previewSrcList: [row.avatar],
                // 图片预览是否插入至 body 元素上，用于解决表格内部图片预览样式异常
                previewTeleported: true
              }),
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.userName),
                h('p', { class: 'email' }, row.userEmail)
              ])
            ])
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
    },
    // 数据处理
    transform: {
      // 数据转换器 - 替换头像
      dataTransformer: (records) => {
        // 类型守卫检查
        if (!Array.isArray(records)) {
          console.warn('数据转换器: 期望数组类型，实际收到:', typeof records)
          return []
        }

        // 使用本地头像替换接口返回的头像
        return records.map((item, index: number) => {
          return {
            ...item,
            avatar: ACCOUNT_TABLE_DATA[index % ACCOUNT_TABLE_DATA.length].avatar
          }
        })
      }
    }
  })

  // 用户统计（左侧面板展示，可与接口对齐后改为接口数据）
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
      // role 若接口支持可在此传入
    })
    if (params.role != null && params.role !== '') {
      Object.assign(searchParams, { role: params.role })
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
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(() => {
      ElMessage.success('注销成功')
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
  /* 覆盖 art-full-height 的 flex-direction: column，改为左右分栏 */
  .user-page {
    flex-direction: row;
    gap: 16px;
    width: 100%;
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
    min-width: 360px;
    overflow: auto;
  }
</style>
