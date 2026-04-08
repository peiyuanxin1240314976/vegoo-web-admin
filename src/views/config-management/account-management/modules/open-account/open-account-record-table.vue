<template>
  <div class="oa-table-wrap">
    <el-table
      :data="pagedList"
      class="oa-table"
      table-layout="auto"
      :row-class-name="getRowClass"
      @row-click="emit('rowClick', $event)"
    >
      <el-table-column prop="id" label="申请ID" min-width="90">
        <template #default="{ row }">
          <span
            class="oa-table__id"
            :style="{ color: row.id === selectedRowId ? '#22d3ee' : 'var(--art-primary)' }"
          >
            {{ row.id }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="广告平台" min-width="140">
        <template #default="{ row }">
          <div class="oa-table__platform">
            <span
              class="oa-table__platform-icon"
              :style="{
                color: getPlatformColor(row.source),
                background: getPlatformBg(row.source)
              }"
            >
              {{ getPlatformShort(row.source) }}
            </span>
            <span class="oa-table__platform-name">{{ row.source }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="app" label="应用" min-width="120" show-overflow-tooltip />
      <el-table-column label="平台" min-width="70" align="center">
        <template #default="{ row }">
          <span
            :class="[
              'oa-table__plat-badge',
              row.platform === 'iOS' ? 'oa-table__plat-badge--ios' : 'oa-table__plat-badge--android'
            ]"
          >
            {{ row.platform }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="accountType" label="开户类型" min-width="90" align="center" />
      <el-table-column label="归属代理商" min-width="110" show-overflow-tooltip>
        <template #default="{ row }">
          <span
            :class="[
              'oa-table__agency',
              isHighlightAgency(row.agency) ? 'oa-table__agency--hl' : ''
            ]"
          >
            {{ row.agency }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="开户金额" min-width="90" align="right">
        <template #default="{ row }">
          <span class="oa-table__amount tabular-nums">${{ formatAmount(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="applicant" label="申请人" min-width="70" align="center" />
      <el-table-column label="登记时间" min-width="90" align="center">
        <template #default="{ row }">
          <span class="oa-table__time">{{ row.registerTime.slice(5, 10) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" min-width="100" align="center">
        <template #default="{ row }">
          <span :class="['oa-table__status', getStatusClass(row.status)]">
            <span class="oa-table__status-icon">{{ getStatusIcon(row.status) }}</span>
            {{ row.status }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="160" fixed="right" align="center">
        <template #default="{ row }">
          <div class="oa-table__actions">
            <button type="button" class="oa-table__link" @click.stop="emit('rowClick', row)">
              [查看]
            </button>
            <button
              v-if="row.status === '待分配'"
              type="button"
              class="oa-table__link oa-table__link--assign"
              @click.stop="emit('assign', row)"
            >
              [分配凭据]
            </button>
            <button
              type="button"
              class="oa-table__link oa-table__link--del"
              @click.stop="emit('delete', row)"
            >
              [删除]
            </button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="oa-table__pager">
      <span class="oa-table__total">共 {{ total }} 条</span>
      <el-pagination
        v-model:current-page="currentPageProxy"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        class="oa-pagination"
      />
      <span class="oa-table__jumper">
        跳转至
        <el-input
          v-model="jumpPageProxy"
          class="oa-table__jumper-input"
          @keyup.enter="emit('jump')"
        />
        页
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { PLATFORM_CONFIGS } from '../../types'
  import type { OpenAccountItem } from '../../types'

  defineOptions({ name: 'OpenAccountRecordTable' })

  const props = defineProps<{
    pagedList: OpenAccountItem[]
    selectedRowId: string
    total: number
    currentPage: number
    pageSize: number
    jumpPage: string
  }>()

  const emit = defineEmits<{
    rowClick: [row: OpenAccountItem]
    assign: [row: OpenAccountItem]
    delete: [row: OpenAccountItem]
    'update:currentPage': [v: number]
    'update:jumpPage': [v: string]
    jump: []
  }>()

  const currentPageProxy = computed({
    get: () => props.currentPage,
    set: (v: number) => emit('update:currentPage', v)
  })

  const jumpPageProxy = computed({
    get: () => props.jumpPage,
    set: (v: string) => emit('update:jumpPage', v)
  })

  function formatAmount(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function getPlatformColor(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.color ?? '#94a3b8'
  }
  function getPlatformBg(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.bg ?? 'rgb(148 163 184 / 12%)'
  }
  function getPlatformShort(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.shortLabel ?? source[0]
  }

  function getStatusClass(status: string) {
    if (status === '已激活') return 'oa-table__status--ok'
    if (status === '待分配') return 'oa-table__status--pending'
    return 'oa-table__status--fail'
  }

  function getStatusIcon(status: string) {
    if (status === '已激活') return '●'
    if (status === '开户失败') return '✕'
    return '✓'
  }

  function isHighlightAgency(agency: string) {
    return ['星达传媒', '天联广告'].includes(agency)
  }

  function getRowClass({ row }: { row: OpenAccountItem }) {
    return row.id === props.selectedRowId ? 'oa-row--selected' : ''
  }
</script>

<style lang="scss" scoped>
  .oa-table-wrap {
    padding: var(--space-4);
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
    box-shadow: var(--shadow-xs);
  }

  .oa-table {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: transparent;
    --el-table-row-hover-bg-color: rgb(255 255 255 / 3%);
    --el-table-border-color: rgb(255 255 255 / 6%);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-tertiary);

    cursor: pointer;

    :deep(th.el-table__cell) {
      font-size: 12px;
      text-transform: uppercase;
      background: transparent;
    }

    :deep(td.el-table__cell) {
      font-size: 13px;
    }

    :deep(.el-table__inner-wrapper::before) {
      display: none;
    }

    :deep(.oa-row--selected td.el-table__cell) {
      background: rgb(34 211 238 / 5%) !important;
    }

    :deep(.oa-row--selected td.el-table__cell:first-child) {
      border-left: 3px solid #22d3ee !important;
    }
  }

  .oa-table__id {
    font-family: 'SF Mono', ui-monospace, monospace;
    font-size: 13px;
    font-weight: 600;
  }

  .oa-table__platform {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .oa-table__platform-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
  }

  .oa-table__platform-name {
    font-size: 13px;
    color: var(--text-primary);
  }

  .oa-table__plat-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--android {
      color: var(--text-secondary);
      background: rgb(148 163 184 / 12%);
      border: 1px solid rgb(148 163 184 / 20%);
    }

    &--ios {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
      border: 1px solid rgb(167 139 250 / 20%);
    }
  }

  .oa-table__agency {
    font-size: 13px;
    color: var(--text-secondary);

    &--hl {
      color: #22d3ee;
    }
  }

  .oa-table__amount {
    font-weight: 500;
    color: var(--text-primary);
  }

  .oa-table__time {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .oa-table__status {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;

    &--ok {
      color: var(--art-success);
    }

    &--pending {
      color: var(--art-warning);
    }

    &--fail {
      color: var(--art-danger);
    }
  }

  .oa-table__status-icon {
    font-size: 10px;
  }

  .oa-table__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
  }

  .oa-table__link {
    padding: 2px 4px;
    font-size: 12px;
    color: var(--art-primary);
    cursor: pointer;
    background: none;
    border: none;
    transition: color var(--duration-fast) var(--ease-default);

    &:hover {
      color: #60a5fa;
    }

    &--assign {
      color: #22d3ee;

      &:hover {
        color: #67e8f9;
      }
    }

    &--del {
      color: var(--art-danger);

      &:hover {
        color: #fca5a5;
      }
    }
  }

  .oa-table__pager {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    justify-content: flex-end;
    padding-top: var(--space-4);
    margin-top: var(--space-1);
    border-top: 1px solid var(--default-border);
  }

  .oa-table__total {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .oa-pagination {
    :deep(.el-pager li) {
      color: var(--text-secondary);
      background: transparent;

      &.is-active {
        color: var(--art-primary);
        background: rgb(59 130 246 / 15%);
        border-radius: 4px;
      }

      &:hover:not(.is-active) {
        color: var(--text-primary);
      }
    }

    :deep(.btn-prev),
    :deep(.btn-next) {
      color: var(--text-secondary);
      background: transparent;

      &:hover {
        color: var(--text-primary);
      }

      &:disabled {
        opacity: 0.4;
      }
    }
  }

  .oa-table__jumper {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .oa-table__jumper-input {
    width: 52px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--default-border) !important;
      border-radius: 5px;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      font-size: 12px;
      color: var(--text-primary);
      text-align: center;
    }
  }
</style>
