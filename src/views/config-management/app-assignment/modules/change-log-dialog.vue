<template>
  <el-dialog
    v-model="dialogVisible"
    class="change-log-dialog"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="bc-root">系统配置</span>
            <span class="bc-sep">›</span>
            <span class="bc-root" @click="handleClose">应用分配</span>
            <span class="bc-sep">›</span>
            <span class="bc-current">变更记录</span>
          </div>
          <div class="dialog-title">应用分配变更记录</div>
          <div v-if="assignment" class="subtitle-tags">
            <span class="subtitle-tag">{{ assignment.appName }}</span>
            <span class="subtitle-x">×</span>
            <span class="subtitle-tag">{{
              assignment.platform === 'Android' ? '安卓' : 'iOS'
            }}</span>
            <span class="subtitle-x">×</span>
            <span class="subtitle-tag">{{ assignment.adPlatform }}</span>
          </div>
        </div>
        <div class="header-right">
          <ElButton round class="btn-back" @click="handleClose">
            <ElIcon><ArrowLeft /></ElIcon>返回应用分配
          </ElButton>
          <ElButton round class="btn-export" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出记录
          </ElButton>
        </div>
      </div>
    </template>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="filterType" class="dark-select" clearable placeholder="变更类型：全部">
        <el-option
          v-for="opt in typeOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
      <el-select v-model="filterOperator" class="dark-select" clearable placeholder="操作人：全部">
        <el-option v-for="opt in operatorOptions" :key="opt" :label="opt" :value="opt" />
      </el-select>
      <AppDatePicker
        v-model="filterDateRange"
        type="daterange"
        range-separator="—"
        class="dark-date-picker"
        unlink-panels
        clearable
      />
      <div class="search-wrap">
        <el-input v-model="filterKeyword" placeholder="搜索内容..." class="dark-input" clearable>
          <template #suffix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <span class="total-count">共 {{ filteredLogs.length }} 条记录</span>
    </div>

    <!-- 表格 -->
    <el-table :data="pagedLogs" class="log-table">
      <el-table-column prop="time" label="变更时间" width="175" />
      <el-table-column label="变更类型" width="120">
        <template #default="{ row }">
          <span :class="['type-badge', typeClass(row.type)]">{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operator" label="操作人" width="90" />
      <el-table-column label="变更内容" min-width="260">
        <template #default="{ row }">
          <span :class="['content-text', row.status === '已删除' ? 'content-text--deleted' : '']">
            {{ row.content }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="note" label="备注" width="130" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="note-text">{{ row.note }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <span
            :class="[
              'status-dot',
              row.status === '有效' ? 'status-dot--valid' : 'status-dot--deleted'
            ]"
          >
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部 -->
    <div class="log-footer">
      <div class="footer-note">
        <el-icon class="footer-note-icon"><InfoFilled /></el-icon>
        变更记录仅支持逻辑删除，删除后记录仍可查看但不参与绩效计算
      </div>
      <div class="footer-pagination">
        <span class="page-total">共 {{ filteredLogs.length }} 条</span>
        <el-select v-model="pageSize" class="dark-select dark-select--sm" @change="currentPage = 1">
          <el-option label="每页 20 条" :value="20" />
          <el-option label="每页 50 条" :value="50" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredLogs.length"
          layout="prev, pager, next"
          class="log-pagination"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { ArrowLeft, Download, Search, InfoFilled } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { AppAssignmentItem, ChangeLogType } from '../types'

  defineOptions({ name: 'ChangeLogDialog' })

  const props = defineProps<{
    visible: boolean
    assignment: AppAssignmentItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  // ─── 筛选 ────────────────────────────────────────────────
  const filterType = ref<ChangeLogType | ''>('')
  const filterOperator = ref('')
  const filterDateRange = ref<[Date, Date] | null>(null)
  const filterKeyword = ref('')
  const currentPage = ref(1)
  const pageSize = ref(20)

  const typeOptions = [
    { label: '配置变更', value: '配置变更' },
    { label: '优化师变更', value: '优化师变更' },
    { label: '备注更新', value: '备注更新' },
    { label: '初始分配', value: '初始分配' },
    { label: '已删除', value: '已删除' }
  ]

  const operatorOptions = computed(() => {
    if (!props.assignment) return []
    return [...new Set(props.assignment.changeLogs.map((l) => l.operator))]
  })

  watch(
    () => props.visible,
    () => {
      filterType.value = ''
      filterOperator.value = ''
      filterDateRange.value = null
      filterKeyword.value = ''
      currentPage.value = 1
    }
  )

  const filteredLogs = computed(() => {
    const logs = props.assignment?.changeLogs ?? []
    return logs.filter((l) => {
      if (filterType.value && l.type !== filterType.value) return false
      if (filterOperator.value && l.operator !== filterOperator.value) return false
      if (
        filterKeyword.value &&
        !l.content.includes(filterKeyword.value) &&
        !l.note.includes(filterKeyword.value)
      )
        return false
      return true
    })
  })

  const pagedLogs = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredLogs.value.slice(start, start + pageSize.value)
  })

  const typeClass = (type: ChangeLogType) =>
    ({
      配置变更: 'type-badge--config',
      优化师变更: 'type-badge--optimizer',
      备注更新: 'type-badge--note',
      初始分配: 'type-badge--init',
      已删除: 'type-badge--deleted'
    })[type] ?? ''

  const handleClose = () => emit('update:visible', false)

  const handleExport = () => ElMessage.success('导出成功')
</script>

<style lang="scss">
  .change-log-dialog {
    --bg-dialog: #0f1829;
    --bg-header: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --red: #ef4444;

    .el-dialog {
      overflow: hidden;
      background: var(--bg-dialog) !important;
      border: 1px solid var(--border);
      border-radius: 12px !important;
      box-shadow: 0 32px 80px rgb(0 0 0 / 65%) !important;
    }

    .el-dialog__header {
      padding: 0 !important;
      margin: 0;
    }

    .el-dialog__body {
      padding: 0 !important;
    }

    .el-dialog__headerbtn {
      top: 16px;
      right: 20px;

      .el-icon {
        color: var(--text-muted) !important;

        &:hover {
          color: var(--text-primary) !important;
        }
      }
    }
  }
</style>

<style lang="scss" scoped>
  // ─── 对话框头部 ──────────────────────────────────────────
  .dialog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 18px 52px 16px 24px;
    background: #131c2e;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .breadcrumb {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .bc-root {
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: #2dd4bf;
    }
  }

  .bc-sep {
    color: #334155;
  }

  .bc-current {
    color: #94a3b8;
  }

  .dialog-title {
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .subtitle-tags {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .subtitle-tag {
    font-size: 13px;
    font-weight: 600;
    color: #2dd4bf;
  }

  .subtitle-x {
    font-size: 13px;
    color: #334155;
  }

  .header-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding-top: 28px;
  }

  .btn-back {
    height: 32px !important;
    padding: 0 14px !important;
    font-size: 13px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 7px !important;

    &:hover {
      color: #e2e8f0 !important;
      border-color: rgb(255 255 255 / 20%) !important;
    }
  }

  .btn-export {
    height: 32px !important;
    padding: 0 14px !important;
    font-size: 13px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 7px !important;

    &:hover {
      color: #2dd4bf !important;
      border-color: rgb(45 212 191 / 30%) !important;
    }
  }

  // ─── 筛选栏 ─────────────────────────────────────────────
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 14px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .search-wrap {
    flex: 1;
    min-width: 160px;
  }

  .total-count {
    margin-left: auto;
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  // ─── 表格 ───────────────────────────────────────────────
  .log-table {
    --el-table-bg-color: transparent;
    --el-table-header-bg-color: #0a1120;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 3%);
    --el-table-border-color: rgb(255 255 255 / 7%);
    --el-table-text-color: #e2e8f0;
    --el-table-header-text-color: #94a3b8;
    --el-table-border: 1px solid rgb(255 255 255 / 7%);

    width: 100%;
    background: transparent !important;

    :deep(th.el-table__cell) {
      padding: 10px 12px;
      font-size: 12px;
      font-weight: 500;
      background: #0a1120 !important;
      border-bottom: 1px solid rgb(255 255 255 / 7%) !important;
    }

    :deep(td.el-table__cell) {
      padding: 10px 12px;
      font-size: 13px;
      border-bottom: 1px solid rgb(255 255 255 / 5%) !important;
    }

    :deep(tr) {
      background: transparent !important;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }
  }

  .type-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;

    &--config {
      color: #2dd4bf;
      background: rgb(45 212 191 / 12%);
    }

    &--optimizer {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }

    &--note {
      color: #f59e0b;
      background: rgb(245 158 11 / 12%);
    }

    &--init {
      color: #60a5fa;
      background: rgb(96 165 250 / 12%);
    }

    &--deleted {
      color: #ef4444;
      background: rgb(239 68 68 / 12%);
    }
  }

  .content-text {
    font-size: 13px;
    color: #e2e8f0;

    &--deleted {
      color: #475569;
      text-decoration: line-through;
    }
  }

  .note-text {
    font-size: 12px;
    color: #64748b;
  }

  .status-dot {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;

    &::before {
      display: inline-block;
      width: 6px;
      height: 6px;
      content: '';
      border-radius: 50%;
    }

    &--valid {
      color: #22c55e;

      &::before {
        background: #22c55e;
      }
    }

    &--deleted {
      color: #475569;

      &::before {
        background: #475569;
      }
    }
  }

  // ─── 底部 ───────────────────────────────────────────────
  .log-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #131c2e;
    border-top: 1px solid rgb(255 255 255 / 7%);
  }

  .footer-note {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: #64748b;
  }

  .footer-note-icon {
    color: #475569;
  }

  .footer-pagination {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .page-total {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  // ─── 深色控件通用 ────────────────────────────────────────
  .dark-select {
    width: 140px;

    :deep(.el-select__wrapper) {
      font-size: 12px;
      color: #94a3b8;
      background: rgb(255 255 255 / 3%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(45 212 191 / 30%) !important;
      }
    }

    &--sm {
      width: 110px;
    }
  }

  .dark-date-picker {
    width: 230px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 3%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 7px;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: #94a3b8;
    }

    :deep(.el-range-separator) {
      color: #475569;
    }
  }

  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 3%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover,
      &.is-focus {
        border-color: rgb(45 212 191 / 30%) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: #94a3b8;
    }
  }

  .log-pagination {
    :deep(.el-pager li) {
      min-width: 26px;
      height: 26px;
      font-size: 12px;
      line-height: 26px;
      color: #94a3b8;
      background: transparent;
      border-radius: 5px;

      &:hover {
        color: #2dd4bf;
      }

      &.is-active {
        font-weight: 700;
        color: #0b1120;
        background: #2dd4bf;
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: #94a3b8 !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 5px;
    }
  }
</style>
