<template>
  <div class="user-management-page art-full-height">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-title-block">
        <h1 class="page-title">用户管理</h1>
        <p class="page-subtitle">管理平台所有成员的账号与权限</p>
      </div>
      <ElButton round class="btn-add" @click="handleAdd">
        <ElIcon><Plus /></ElIcon>新建用户
      </ElButton>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card stat-card--total">
        <div class="stat-icon-wrap stat-icon-wrap--total">
          <ElIcon size="22"><User /></ElIcon>
        </div>
        <div class="stat-body">
          <div class="stat-label">总用户数</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
      </div>
      <div class="stat-card stat-card--active">
        <div class="stat-icon-wrap stat-icon-wrap--active">
          <ElIcon size="22"><UserFilled /></ElIcon>
        </div>
        <div class="stat-body">
          <div class="stat-label">活跃用户</div>
          <div class="stat-value">{{ stats.active }}</div>
        </div>
      </div>
      <div class="stat-card stat-card--disabled">
        <div class="stat-icon-wrap stat-icon-wrap--disabled">
          <ElIcon size="22"><CircleClose /></ElIcon>
        </div>
        <div class="stat-body">
          <div class="stat-label">禁用用户</div>
          <div class="stat-value">{{ stats.disabled }}</div>
        </div>
      </div>
      <div class="stat-card stat-card--pending">
        <div class="stat-icon-wrap stat-icon-wrap--pending">
          <ElIcon size="22"><Clock /></ElIcon>
        </div>
        <div class="stat-body">
          <div class="stat-label">待激活用户</div>
          <div class="stat-value">{{ stats.pending }}</div>
        </div>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-input
        v-model="filterForm.keyword"
        placeholder="搜索维度..."
        class="filter-search"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="filterForm.role" placeholder="所有角色" class="filter-select" clearable>
        <el-option
          v-for="opt in roleOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select v-model="filterForm.status" placeholder="所有状态" class="filter-select" clearable>
        <el-option label="活跃" value="活跃" />
        <el-option label="待激活" value="待激活" />
        <el-option label="已禁用" value="已禁用" />
      </el-select>
      <ElButton round class="btn-batch">批量操作</ElButton>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper" v-loading="tableLoading">
      <el-table :data="tableRecords" class="user-table" @row-click="handleRowClick">
        <el-table-column label="用户" min-width="200">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-avatar" :style="{ background: row.avatarColor }">
                {{ row.userName.slice(0, 2).toUpperCase() }}
              </div>
              <div class="user-info">
                <div class="user-name">{{ row.userName }}</div>
                <div class="user-email">{{ row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="130">
          <template #default="{ row }">
            <span :class="['role-badge', getRoleBadgeClass(row.role)]">
              {{ row.role }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <span :class="['status-badge', getStatusBadgeClass(row.status)]">
              <span class="status-dot" />
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastLogin" label="最近登录" width="100" />
        <el-table-column prop="joinTime" label="加入时间" width="110" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <button class="action-btn action-btn--edit" @click.stop="handleEdit(row)">
                编辑
              </button>
              <span class="action-sep">|</span>
              <template v-if="row.status === '待激活'">
                <button
                  class="action-btn action-btn--send"
                  @click.stop="handleResendActivation(row)"
                >
                  发送激活邮件
                </button>
                <span class="action-sep">|</span>
                <button
                  class="action-btn action-btn--danger"
                  @click.stop="handleDeleteConfirm(row)"
                >
                  删除
                </button>
              </template>
              <template v-else-if="row.status === '已禁用'">
                <button class="action-btn action-btn--enable" @click.stop="handleToggleStatus(row)">
                  启用
                </button>
              </template>
              <template v-else>
                <button class="action-btn action-btn--reset" @click.stop="handleResetPassword(row)">
                  重置密码
                </button>
                <span class="action-sep">|</span>
                <button class="action-btn action-btn--danger" @click.stop="handleToggleStatus(row)">
                  禁用
                </button>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <span class="pagination-total">共 {{ serverTotal }} 条</span>
        <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <el-option label="每页 10 条" :value="10" />
          <el-option label="每页 20 条" :value="20" />
          <el-option label="每页 50 条" :value="50" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="serverTotal"
          layout="prev, pager, next"
          class="user-pagination"
        />
        <span class="pagination-jumper">
          跳转至
          <el-input v-model="jumpPage" class="jumper-input" @keyup.enter="handleJump" />
          页
        </span>
      </div>
    </div>

    <!-- 右侧用户信息抽屉 -->
    <UserDetailDrawer
      v-model:visible="drawerVisible"
      :user-data="selectedUser"
      @edit="handleEdit"
      @toggle-status="handleToggleStatus"
      @save="handleDrawerSave"
    />

    <!-- 新增/编辑弹窗 -->
    <UserFormDialog
      v-model:visible="formVisible"
      :edit-data="editData"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch, onMounted } from 'vue'
  import { Plus, Search, User, UserFilled, CircleClose, Clock } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import UserDetailDrawer from './modules/user-detail-drawer.vue'
  import UserFormDialog from './modules/user-form-dialog.vue'
  import { userRoleOptions } from './mock/data'
  import { type UserItem, type UserFormPayload, type UserRole } from './types'
  import {
    createUser,
    deleteUser,
    fetchUserTable,
    resendUserActivation,
    resetUserPassword,
    updateUser,
    updateUserStatus
  } from '@/api/config-management/user-management'

  defineOptions({ name: 'UserManagement' })

  const filterForm = reactive({ keyword: '', role: '', status: '' })

  const tableRecords = ref<UserItem[]>([])
  const serverTotal = ref(0)
  const tableLoading = ref(false)
  const stats = ref({ total: 0, active: 0, disabled: 0, pending: 0 })
  const currentPage = ref(1)
  const pageSize = ref(20)
  const jumpPage = ref('')
  const drawerVisible = ref(false)
  const formVisible = ref(false)
  const selectedUser = ref<UserItem | null>(null)
  const editData = ref<UserItem | null>(null)

  const roleOptions = userRoleOptions

  function syncSelectedUserFromTable() {
    if (!selectedUser.value) return
    const row = tableRecords.value.find((u) => u.id === selectedUser.value!.id)
    if (row) selectedUser.value = { ...row }
  }

  async function loadStats() {
    try {
      const res = await fetchUserTable({
        current: 1,
        size: 10000,
        keyword: '',
        role: '',
        status: ''
      })
      const list = res.records
      stats.value = {
        total: res.total,
        active: list.filter((u) => u.status === '活跃').length,
        disabled: list.filter((u) => u.status === '已禁用').length,
        pending: list.filter((u) => u.status === '待激活').length
      }
    } catch {
      /* request 层已处理错误提示 */
    }
  }

  async function loadTable() {
    tableLoading.value = true
    try {
      const res = await fetchUserTable({
        current: currentPage.value,
        size: pageSize.value,
        ...(filterForm.keyword.trim() ? { keyword: filterForm.keyword.trim() } : {}),
        ...(filterForm.role ? { role: filterForm.role } : {}),
        ...(filterForm.status ? { status: filterForm.status } : {})
      })
      const maxPage = Math.max(1, Math.ceil(res.total / pageSize.value) || 1)
      if (currentPage.value > maxPage) {
        currentPage.value = maxPage
        tableLoading.value = false
        return loadTable()
      }
      tableRecords.value = res.records
      serverTotal.value = res.total
      syncSelectedUserFromTable()
    } catch {
      tableRecords.value = []
      serverTotal.value = 0
    } finally {
      tableLoading.value = false
    }
  }

  onMounted(() => {
    loadStats()
    loadTable()
  })

  watch(
    () => ({ ...filterForm }),
    () => {
      if (currentPage.value !== 1) currentPage.value = 1
      else loadTable()
    },
    { deep: true }
  )

  watch([currentPage, pageSize], () => {
    loadTable()
  })

  function getRoleBadgeClass(role: UserRole) {
    const map: Record<UserRole, string> = {
      '管理层/老板': 'role-badge--boss',
      投放人员: 'role-badge--media',
      变现人员: 'role-badge--monetize',
      素材设计师: 'role-badge--design',
      运营维护: 'role-badge--ops'
    }
    return map[role] ?? ''
  }

  function getStatusBadgeClass(status: string) {
    if (status === '活跃') return 'status-badge--active'
    if (status === '待激活') return 'status-badge--pending'
    return 'status-badge--disabled'
  }

  function handleAdd() {
    editData.value = null
    formVisible.value = true
  }

  function handleEdit(row: UserItem) {
    editData.value = { ...row }
    drawerVisible.value = false
    formVisible.value = true
  }

  function handleRowClick(row: UserItem) {
    selectedUser.value = row
    drawerVisible.value = true
  }

  function handleToggleStatus(row: UserItem) {
    const label = row.status === '已禁用' ? '启用' : '禁用'
    const next = row.status === '已禁用' ? '活跃' : ('已禁用' as const)
    ElMessageBox.confirm(`确定要${label}用户「${row.userName}」吗？`, '操作确认', {
      confirmButtonText: label,
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await updateUserStatus(row.id, next)
        ElMessage.success(`${label}成功`)
        await loadStats()
        await loadTable()
        syncSelectedUserFromTable()
      })
      .catch(() => {})
  }

  function handleResetPassword(row: UserItem) {
    ElMessageBox.confirm(
      `确定要重置「${row.userName}」的密码吗？新密码将发送至用户邮箱。`,
      '重置密码',
      { confirmButtonText: '确认重置', cancelButtonText: '取消', type: 'warning' }
    )
      .then(async () => {
        await resetUserPassword(row.id)
        ElMessage.success('密码重置邮件已发送')
      })
      .catch(() => {})
  }

  function handleResendActivation(row: UserItem) {
    resendUserActivation(row.id)
      .then(() => {
        ElMessage.success(`激活邮件已发送至 ${row.email}`)
      })
      .catch(() => {})
  }

  function handleDeleteConfirm(row: UserItem) {
    ElMessageBox.confirm(`确定要删除用户「${row.userName}」吗？此操作不可恢复。`, '删除确认', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await deleteUser(row.id)
        if (selectedUser.value?.id === row.id) {
          selectedUser.value = null
          drawerVisible.value = false
        }
        ElMessage.success('删除成功')
        await loadStats()
        await loadTable()
      })
      .catch(() => {})
  }

  async function handleDrawerSave(
    data: Pick<UserItem, 'id' | 'role' | 'accessibleApps' | 'remark'>
  ) {
    if (!selectedUser.value || selectedUser.value.id !== data.id) return
    try {
      await updateUser({
        id: data.id,
        userName: selectedUser.value.userName,
        email: selectedUser.value.email,
        role: data.role,
        accessibleApps: data.accessibleApps,
        remark: data.remark
      })
      ElMessage.success('保存成功')
      await loadStats()
      await loadTable()
      syncSelectedUserFromTable()
    } catch {
      /* request 已提示 */
    }
  }

  function handlePageSizeChange() {
    currentPage.value = 1
  }

  function handleJump() {
    const raw = parseInt(jumpPage.value, 10)
    jumpPage.value = ''
    if (Number.isNaN(raw) || raw < 1) return
    const maxPage = Math.max(1, Math.ceil(serverTotal.value / pageSize.value))
    currentPage.value = Math.min(raw, maxPage)
  }

  async function handleFormSuccess(payload: UserFormPayload) {
    try {
      const isEdit = !!payload.id
      if (isEdit) {
        await updateUser(payload)
        ElMessage.success('保存成功')
      } else {
        await createUser(payload)
        ElMessage.success('用户创建成功，激活邮件已发送')
      }
      await loadStats()
      await loadTable()
      if (isEdit && selectedUser.value?.id === payload.id) syncSelectedUserFromTable()
    } catch {
      /* request 已提示 */
      return
    }
    formVisible.value = false
    editData.value = null
  }
</script>

<style lang="scss" scoped>
  .user-management-page {
    --bg-page: #0b1120;
    --bg-card: #131c2e;
    --bg-row-hover: #162035;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 12%);
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 12%);
    --green: #22c55e;
    --green-dim: rgb(34 197 94 / 12%);
    --amber: #f59e0b;
    --amber-dim: rgb(245 158 11 / 12%);
    --blue: #60a5fa;
    --blue-dim: rgb(96 165 250 / 12%);
    --purple: #a78bfa;
    --purple-dim: rgb(167 139 250 / 12%);

    position: relative;
    min-height: 100vh;
    padding: 0 24px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    color: var(--text-primary);
    background: var(--bg-page);
  }

  // ─── 页面头部 ───────────────────────────────────────────
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 0 16px;
  }

  .page-title {
    margin: 0 0 4px;
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .page-subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
  }

  .btn-add {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 18px !important;
    font-size: 13px;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }

  // ─── 统计卡片 ───────────────────────────────────────────
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat-card {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 18px 20px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .stat-icon-wrap {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    border-radius: 10px;

    &--total {
      color: var(--blue);
      background: var(--blue-dim);
    }

    &--active {
      color: var(--green);
      background: var(--green-dim);
    }

    &--disabled {
      color: var(--red);
      background: var(--red-dim);
    }

    &--pending {
      color: var(--amber);
      background: var(--amber-dim);
    }
  }

  .stat-label {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
  }

  // ─── 筛选栏 ────────────────────────────────────────────
  .filter-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 12px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .filter-search {
    width: 220px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: var(--accent) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
    }

    :deep(.el-input__prefix) {
      color: var(--text-muted);
    }
  }

  .filter-select {
    width: 120px;

    :deep(.el-select__wrapper) {
      color: var(--text-primary);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover {
        border-color: var(--accent) !important;
      }
    }
  }

  .btn-batch {
    padding: 8px 16px !important;
    margin-left: auto;
    font-size: 13px;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    transition: all 0.2s;

    &:hover {
      color: var(--accent) !important;
      border-color: var(--accent) !important;
    }
  }

  // ─── 表格 ──────────────────────────────────────────────
  .table-wrapper {
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .user-table {
    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0f1829;
    --el-table-row-hover-bg-color: var(--bg-row-hover);
    --el-table-border-color: var(--border);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

    cursor: pointer;
    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 12px 8px;
      font-size: 12px;
      font-weight: 500;
      background: #0f1829 !important;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 8px;
      font-size: 12px;
      border-bottom: 1px solid var(--border) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .user-cell {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 50%;
  }

  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .user-email {
    font-size: 11px;
    color: var(--text-muted);
  }

  // ─── 角色徽章 ──────────────────────────────────────────
  .role-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 5px;

    &--boss {
      color: #fbbf24;
      background: rgb(251 191 36 / 15%);
    }

    &--media {
      color: var(--accent);
      background: var(--accent-dim);
    }

    &--monetize {
      color: var(--green);
      background: var(--green-dim);
    }

    &--design {
      color: var(--purple);
      background: var(--purple-dim);
    }

    &--ops {
      color: var(--text-secondary);
      background: rgb(148 163 184 / 12%);
    }
  }

  // ─── 状态徽章 ──────────────────────────────────────────
  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;

    &--active {
      color: var(--green);
    }

    &--pending {
      color: var(--amber);
    }

    &--disabled {
      color: var(--red);
    }
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    .status-badge--active & {
      background: var(--green);
    }

    .status-badge--pending & {
      background: var(--amber);
    }

    .status-badge--disabled & {
      background: var(--red);
    }
  }

  // ─── 操作按钮 ──────────────────────────────────────────
  .action-btns {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .action-btn {
    padding: 2px 4px;
    font-size: 12px;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: all 0.15s;

    &--edit {
      color: var(--accent);

      &:hover {
        background: var(--accent-dim);
      }
    }

    &--reset {
      color: var(--blue);

      &:hover {
        background: var(--blue-dim);
      }
    }

    &--send {
      color: var(--blue);

      &:hover {
        background: var(--blue-dim);
      }
    }

    &--enable {
      color: var(--green);

      &:hover {
        background: var(--green-dim);
      }
    }

    &--danger {
      color: var(--red);

      &:hover {
        background: var(--red-dim);
      }
    }
  }

  .action-sep {
    font-size: 11px;
    color: var(--border);
    user-select: none;
  }

  // ─── 分页 ──────────────────────────────────────────────
  .pagination-bar {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .pagination-total {
    font-size: 13px;
    color: var(--text-muted);
  }

  .page-size-select {
    width: 110px;

    :deep(.el-select__wrapper) {
      font-size: 12px;
      color: var(--text-secondary);
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }
  }

  .user-pagination {
    :deep(.el-pager li) {
      min-width: 28px;
      height: 28px;
      font-size: 13px;
      line-height: 28px;
      color: var(--text-secondary);
      background: transparent;
      border-radius: 5px;

      &:hover {
        color: var(--accent);
      }

      &.is-active {
        font-weight: 700;
        color: #0b1120;
        background: var(--accent);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary) !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      border-radius: 5px;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  .pagination-jumper {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-muted);
  }

  .jumper-input {
    width: 48px;

    :deep(.el-input__wrapper) {
      height: 28px;
      padding: 0 6px;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);
      text-align: center;
    }
  }

  // ─── Element Plus 下拉覆盖 ─────────────────────────────
  :deep(.el-select-dropdown) {
    background: #1a2540 !important;
    border: 1px solid var(--border) !important;
  }

  :deep(.el-select-dropdown__item) {
    color: var(--text-secondary) !important;

    &:hover,
    &.is-hovering {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 8%) !important;
    }

    &.is-selected {
      color: var(--accent) !important;
      background: rgb(45 212 191 / 12%) !important;
    }
  }
</style>
