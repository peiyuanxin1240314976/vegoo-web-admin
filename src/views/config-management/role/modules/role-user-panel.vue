<template>
  <div class="role-user-panel flex h-full min-h-0 min-w-0 flex-col">
    <template v-if="selectedRole">
      <div class="panel-header">
        <h2 class="panel-title">角色成员 - {{ selectedRole.roleName }} ({{ roleUsers.length }})</h2>
      </div>

      <ElScrollbar class="user-list-scroll">
        <div class="user-cards">
          <div v-for="user in roleUsers" :key="user.id" class="user-card">
            <div class="user-card__avatar">{{ user.avatarText }}</div>
            <div class="user-card__body">
              <div class="user-card__name-row">
                <span class="user-name">{{ user.userName }}</span>
              </div>
              <div class="user-email">{{ user.userEmail }}</div>
              <div class="user-meta">
                <span class="status-dot" :class="user.statusClass"></span>
                <span>{{ user.statusText }}</span>
                <span class="meta-sep">|</span>
                <span>{{ user.lastActive }}</span>
              </div>
            </div>
            <div class="user-card__actions">
              <ElButton link type="primary" size="small" @click="$emit('edit-user', user)"
                >编辑</ElButton
              >
              <ElButton link type="danger" size="small" @click="$emit('disable-user', user)"
                >禁用</ElButton
              >
            </div>
          </div>
        </div>

        <div class="batch-actions">
          <ElButton size="small" round @click="$emit('batch-assign')">批量分配角色</ElButton>
          <ElButton size="small" round @click="$emit('batch-export')">批量导出</ElButton>
          <ElButton size="small" round @click="$emit('batch-disable')">批量禁用</ElButton>
        </div>

        <ElCard class="summary-card" shadow="never">
          <template #header>
            <span class="section-title">权限摘要</span>
          </template>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-item__label">页面权限</span>
              <span class="summary-item__value">
                {{ permissionSummary.routeGrantedCount }}/{{ permissionSummary.routeTotalCount }}
              </span>
            </div>
            <div class="summary-item">
              <span class="summary-item__label">默认日期规则</span>
              <span class="summary-item__value">{{ permissionSummary.defaultDateScopeText }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-item__label">页面覆盖数</span>
              <span class="summary-item__value">{{ permissionSummary.overridePageCount }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-item__label">最近更新</span>
              <span class="summary-item__value">
                {{ permissionSummary.lastUpdatedBy }} / {{ permissionSummary.lastUpdatedAt }}
              </span>
            </div>
          </div>

          <div v-if="permissionSummary.highlightedRoutes.length" class="summary-tags">
            <ElTag
              v-for="routeName in permissionSummary.highlightedRoutes"
              :key="routeName"
              size="small"
              effect="plain"
              round
            >
              {{ routeName }}
            </ElTag>
          </div>
        </ElCard>

        <ElCard class="summary-card" shadow="never">
          <template #header>
            <span class="section-title">角色说明</span>
            <ElLink
              type="primary"
              :underline="false"
              class="edit-desc-link"
              @click="$emit('edit-role')"
            >
              编辑角色
            </ElLink>
          </template>
          <p class="role-desc">{{ roleDescription }}</p>
        </ElCard>
      </ElScrollbar>
    </template>

    <ElCard v-else class="panel-empty" shadow="never">
      <div class="empty-tip">
        <p class="empty-text">请先从左侧选择角色</p>
        <p class="empty-desc">右侧会展示角色成员、权限摘要与说明信息。</p>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'RoleUserPanel' })

  type RoleListItem = Api.SystemManage.RoleListItem

  export interface RoleUserItem {
    id: string | number
    userName: string
    userEmail: string
    avatarText: string
    statusText: string
    statusClass: string
    lastActive: string
    isLast?: boolean
  }

  withDefaults(
    defineProps<{
      selectedRole?: RoleListItem | null
      roleUsers?: RoleUserItem[]
      permissionSummary?: {
        routeGrantedCount: number
        routeTotalCount: number
        defaultDateScopeText: string
        overridePageCount: number
        allowCustomRange: boolean
        lastUpdatedAt: string
        lastUpdatedBy: string
        highlightedRoutes: string[]
      }
      roleDescription?: string
    }>(),
    {
      roleUsers: () => [],
      permissionSummary: () => ({
        routeGrantedCount: 0,
        routeTotalCount: 0,
        defaultDateScopeText: '-',
        overridePageCount: 0,
        allowCustomRange: false,
        lastUpdatedAt: '-',
        lastUpdatedBy: '-',
        highlightedRoutes: []
      }),
      roleDescription: () => '当前角色用于管理页面可见性与日期范围权限。'
    }
  )

  defineEmits<{
    (e: 'edit-user', user: RoleUserItem): void
    (e: 'disable-user', user: RoleUserItem): void
    (e: 'batch-assign'): void
    (e: 'batch-export'): void
    (e: 'batch-disable'): void
    (e: 'edit-role'): void
  }>()
</script>

<style scoped lang="scss">
  .role-user-panel {
    box-sizing: border-box;
    padding: 16px;
    background: var(--el-bg-color);
  }

  .panel-header {
    margin-bottom: 12px;
  }

  .panel-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .user-list-scroll {
    flex: 1;
    min-height: 0;
  }

  .user-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 12px;
  }

  .user-card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-extra-light);
    border-radius: 10px;
  }

  .user-card__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-color-primary);
    background: rgb(64 158 255 / 15%);
    border-radius: 50%;
  }

  .user-card__body {
    flex: 1;
    min-width: 0;
  }

  .user-card__name-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
  }

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .user-email,
  .user-meta {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .user-email {
    margin-bottom: 4px;
  }

  .meta-sep {
    margin: 0 6px;
    opacity: 0.7;
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 6px;
    vertical-align: middle;
    border-radius: 50%;

    &--active {
      background: var(--el-color-success);
    }

    &--offline {
      background: var(--el-color-info);
    }
  }

  .user-card__actions {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
  }

  .batch-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .summary-card {
    margin-bottom: 16px;

    :deep(.el-card__header) {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .summary-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .summary-item__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .summary-item__value {
    font-size: 13px;
    color: var(--el-text-color-primary);
  }

  .summary-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }

  .role-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .panel-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;

    :deep(.el-card__body) {
      width: 100%;
      text-align: center;
    }
  }

  .empty-text {
    margin-bottom: 6px;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }

  .empty-desc {
    margin: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    opacity: 0.8;
  }
</style>
