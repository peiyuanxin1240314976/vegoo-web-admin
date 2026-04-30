<!-- 用户管理 - 左侧面板：标题、统计卡片、筛选、用户列表 -->
<template>
  <div class="user-left-panel flex min-h-0 h-full flex-col">
    <!-- 第一排：左侧标题 + 说明 + 右侧「新建用户」 -->
    <div class="panel-row header-row">
      <div class="header-title-wrap">
        <h1 class="page-title">用户管理</h1>
        <p class="page-desc">管理平台所有成员的账号与权限</p>
      </div>
      <ElButton type="primary" @click="$emit('add-user')" v-ripple>
        <ElIcon class="mr-1"><Plus /></ElIcon>
        新建用户
      </ElButton>
    </div>

    <!-- 第二排：4 个平铺统计模块 -->
    <div class="panel-row stats-row">
      <div
        v-for="item in statCards"
        :key="item.key"
        class="stat-card"
        :class="`stat-card--${item.key}`"
      >
        <div class="stat-icon">
          <ElIcon :size="44"><component :is="item.icon" /></ElIcon>
        </div>
        <div class="stat-right">
          <span class="stat-value">{{ item.value }}</span>
          <span class="stat-label">{{ item.label }}</span>
          <span v-if="item.sublabel" class="stat-sublabel">{{ item.sublabel }}</span>
        </div>
      </div>
    </div>

    <!-- 第三排：左侧三个筛选 + 右侧批量操作（与列表右对齐） -->
    <div class="panel-row filter-row">
      <div class="filter-left">
        <ElInput
          v-model="localFilter.userName"
          placeholder="搜索维度..."
          clearable
          class="filter-input"
          style="width: 200px"
          @clear="emitSearch"
          @keyup.enter="emitSearch"
        />
        <ElSelect
          v-model="localFilter.role"
          placeholder="所有角色"
          clearable
          class="filter-select"
          style="width: 140px"
          @change="emitSearch"
        >
          <ElOption
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
        <ElSelect
          v-model="localFilter.status"
          placeholder="所有状态"
          clearable
          class="filter-select"
          style="width: 140px"
          @change="emitSearch"
        >
          <ElOption
            v-for="opt in statusOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
      <ElButton :type="batchMode ? 'primary' : 'default'" @click="$emit('toggle-batch')">
        {{ batchMode ? '取消批量' : '批量操作' }}
      </ElButton>
    </div>

    <!-- 第四排：列表（由父组件通过插槽传入） -->
    <div class="panel-row table-row flex-1 min-h-0">
      <ElCard class="art-table-card table-card" shadow="never">
        <slot name="table"></slot>
      </ElCard>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus, User, UserFilled, CircleCloseFilled, Clock } from '@element-plus/icons-vue'

  defineOptions({ name: 'UserLeftPanel' })

  export interface UserStats {
    total: number
    active: number
    disabled: number
    pending: number
  }

  export interface UserFilterForm {
    userName?: string
    role?: number | ''
    status?: string
  }

  const props = withDefaults(
    defineProps<{
      stats: UserStats
      filterForm: UserFilterForm
      /** 是否处于批量选择模式（表格显示勾选列） */
      batchMode?: boolean
      roleOptions?: { label: string; value: number | '' }[]
      statusOptions?: { label: string; value: string }[]
    }>(),
    {
      batchMode: false,
      roleOptions: () => [{ label: '所有角色', value: '' }],
      statusOptions: () => [
        { label: '所有状态', value: '' },
        { label: '在线', value: '1' },
        { label: '离线', value: '2' },
        { label: '异常', value: '3' },
        { label: '已禁用', value: '4' }
      ]
    }
  )

  const emit = defineEmits<{
    (e: 'add-user'): void
    (e: 'search', params: UserFilterForm): void
    (e: 'reset'): void
    (e: 'toggle-batch'): void
  }>()

  const localFilter = ref<UserFilterForm>({ ...props.filterForm })

  watch(
    () => props.filterForm,
    (val) => {
      localFilter.value = { ...val }
    },
    { deep: true }
  )

  const statCards = computed(() => [
    {
      key: 'total',
      label: '用户总数',
      sublabel: '全量',
      value: props.stats.total,
      icon: User
    },
    {
      key: 'active',
      label: '在线',
      sublabel: '当前页',
      value: props.stats.active,
      icon: UserFilled
    },
    {
      key: 'disabled',
      label: '已禁用',
      sublabel: '当前页',
      value: props.stats.disabled,
      icon: CircleCloseFilled
    },
    {
      key: 'pending',
      label: '离线 / 异常',
      sublabel: '当前页',
      value: props.stats.pending,
      icon: Clock
    }
  ])

  function emitSearch() {
    emit('search', { ...localFilter.value })
  }
</script>

<style scoped lang="scss">
  .user-left-panel {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
  }

  .panel-row {
    flex-shrink: 0;

    &.table-row {
      flex-shrink: 1;
      min-height: 0;
    }
  }

  .header-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .header-title-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .page-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .page-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }

  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: stretch;
    width: 100%;
  }

  .stat-card {
    display: flex;
    flex: 1 1 140px;
    flex-direction: row;
    gap: 16px;
    align-items: stretch;
    min-width: 0;
    min-height: 88px;
    padding: 20px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 10px;

    .stat-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 72px;
      height: 72px;
      border-radius: 12px;
    }

    .stat-right {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
      min-height: 72px;
    }

    .stat-value {
      font-size: 30px;
      font-weight: 600;
      line-height: 1.2;
    }

    .stat-sublabel {
      display: block;
      margin-top: 2px;
      font-size: 11px;
      font-weight: 400;
      color: var(--el-text-color-placeholder);
    }

    .stat-label {
      font-size: 16px;
      line-height: 1.3;
      color: var(--el-text-color-secondary);
    }

    &--total .stat-icon {
      color: #409eff;
      background: rgb(64 158 255 / 15%);
    }

    &--active .stat-icon {
      color: #67c23a;
      background: rgb(103 194 58 / 15%);
    }

    &--disabled .stat-icon {
      color: #f56c6c;
      background: rgb(245 108 108 / 15%);
    }

    &--pending .stat-icon {
      color: #e6a23c;
      background: rgb(230 162 60 / 15%);
    }
  }

  .filter-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .filter-left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .table-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
  }
</style>
