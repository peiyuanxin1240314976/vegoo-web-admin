<!-- 权限管理 - 右侧：用户列表、权限摘要、角色说明 -->
<template>
  <div class="role-user-panel art-full-height flex flex-col">
    <template v-if="selectedRole">
      <div class="panel-header">
        <h2 class="panel-title">用户列表-{{ selectedRole.roleName }}({{ roleUsers.length }}人)</h2>
      </div>

      <ElScrollbar class="user-list-scroll">
        <div class="user-cards">
          <div v-for="user in roleUsers" :key="user.id" class="user-card">
            <div class="user-card__avatar">{{ user.avatarText }}</div>
            <div class="user-card__body">
              <div class="user-card__name-row">
                <span class="user-name">{{ user.userName }}</span>
                <ElButton v-if="user.isLast" link type="primary" size="small">+ 邀请成员</ElButton>
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
          <ElButton size="small" @click="$emit('batch-assign')">批量分配角色</ElButton>
          <ElButton size="small" @click="$emit('batch-export')">批量导出</ElButton>
          <ElButton size="small" @click="$emit('batch-disable')">批量禁用</ElButton>
        </div>

        <!-- 权限摘要 -->
        <ElCard class="summary-card" shadow="never">
          <template #header>
            <span class="section-title">权限摘要</span>
          </template>
          <div class="summary-content">
            <p class="summary-line"
              >功能权限: {{ permissionSummary.funcEnabled }}/{{
                permissionSummary.funcTotal
              }}
              项已开启</p
            >
            <p class="summary-line">数据权限: {{ permissionSummary.dataScope }}</p>
            <ElProgress
              :percentage="permissionSummary.percent"
              :stroke-width="8"
              class="summary-progress"
            />
            <div class="role-percent-list">
              <div
                v-for="r in permissionSummary.rolePercentList"
                :key="r.roleId"
                class="role-percent-row"
                :class="{ 'role-percent-row--current': r.isCurrent }"
              >
                <span class="role-percent-name">{{ r.roleName }}</span>
                <ElProgress :percentage="r.percent" :stroke-width="6" class="role-percent-bar" />
                <span v-if="r.isCurrent" class="current-tag">←当前角色</span>
              </div>
            </div>
          </div>
        </ElCard>

        <!-- 角色说明 -->
        <ElCard class="summary-card" shadow="never">
          <template #header>
            <span class="section-title">角色说明</span>
            <ElLink
              type="primary"
              :underline="false"
              class="edit-desc-link"
              @click="$emit('edit-desc')"
            >
              编辑说明
            </ElLink>
          </template>
          <p class="role-desc">{{ roleDescription }}</p>
        </ElCard>
      </ElScrollbar>
    </template>

    <ElCard v-else class="panel-empty" shadow="never">
      <div class="empty-tip">
        <p class="empty-text">请从左侧选择角色</p>
        <p class="empty-desc">查看该角色下的用户与权限摘要</p>
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
        funcEnabled: number
        funcTotal: number
        dataScope: string
        percent: number
        rolePercentList: Array<{
          roleId: number
          roleName: string
          percent: number
          isCurrent?: boolean
        }>
      }
      roleDescription?: string
    }>(),
    {
      roleUsers: () => [],
      permissionSummary: () => ({
        funcEnabled: 32,
        funcTotal: 58,
        dataScope: '中等范围',
        percent: 55,
        rolePercentList: [
          { roleId: 1, roleName: '超级管理员', percent: 100 },
          { roleId: 2, roleName: 'CEO管理', percent: 85 },
          { roleId: 3, roleName: '投放人员', percent: 55, isCurrent: true },
          { roleId: 4, roleName: '变现人员', percent: 40 },
          { roleId: 5, roleName: '素材设计师', percent: 35 },
          { roleId: 6, roleName: '运营维护', percent: 30 }
        ]
      }),
      roleDescription: () =>
        '可查看所有投放数据，可创建和编辑自己负责的广告系列，可调整预算，但不能删除广告，不能访问变现配置和系统管理功能。'
    }
  )

  defineEmits<{
    (e: 'edit-user', user: RoleUserItem): void
    (e: 'disable-user', user: RoleUserItem): void
    (e: 'batch-assign'): void
    (e: 'batch-export'): void
    (e: 'batch-disable'): void
    (e: 'edit-desc'): void
  }>()
</script>

<style scoped lang="scss">
  .role-user-panel {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 380px;
    min-width: 320px;
    padding: 16px;
    background: var(--el-bg-color);
  }

  .panel-header {
    flex-shrink: 0;
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

  .user-email {
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .user-meta {
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .meta-sep {
      margin: 0 6px;
      opacity: 0.7;
    }
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

  .section-title {
    color: var(--el-text-color-primary);
  }

  .edit-desc-link {
    font-size: 13px;
    font-weight: 400;
  }

  .summary-content {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .summary-line {
    margin: 0 0 8px;
  }

  .summary-progress {
    margin: 12px 0;
  }

  .role-percent-list {
    margin-top: 12px;
  }

  .role-percent-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    &--current {
      color: var(--el-text-color-primary);
    }
  }

  .role-percent-name {
    flex-shrink: 0;
    width: 80px;
  }

  .role-percent-bar {
    flex: 1;
    min-width: 0;
  }

  .current-tag {
    flex-shrink: 0;
    font-size: 11px;
    color: var(--el-color-primary);
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
    min-height: 200px;

    :deep(.el-card__body) {
      width: 100%;
      text-align: center;
    }
  }

  .empty-tip {
    color: var(--el-text-color-secondary);
  }

  .empty-text {
    margin-bottom: 6px;
    font-size: 14px;
  }

  .empty-desc {
    font-size: 12px;
    opacity: 0.8;
  }
</style>
