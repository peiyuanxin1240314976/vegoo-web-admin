<!-- 权限管理 - 左侧：角色列表 -->
<template>
  <div class="role-list-panel flex min-h-0 h-full min-w-0 flex-col">
    <div class="panel-header">
      <div class="header-title-wrap">
        <h1 class="page-title">{{ t('menus.configManagement.roleManagement') }}</h1>
        <p class="page-desc">管理用户账号、角色与数据访问权限</p>
      </div>
      <ElButton type="primary" @click="$emit('add-role')" v-ripple>+ 新建角色</ElButton>
    </div>

    <div class="panel-list-title">角色列表({{ roleList.length }})</div>
    <ElScrollbar class="role-list-scroll">
      <div
        v-for="(item, index) in roleList"
        :key="item.roleId"
        class="role-card"
        :class="{ 'role-card--active': selectedRole?.roleId === item.roleId }"
        @click="$emit('select-role', item)"
      >
        <div
          class="role-card__avatar"
          :class="`role-card__avatar--${avatarColors[index % avatarColors.length]}`"
        >
          <span class="avatar-num">{{ getUserCount(item) }}</span>
          <ElIcon class="avatar-icon" :size="20"><User /></ElIcon>
        </div>
        <div class="role-card__body">
          <div class="role-card__name">{{ item.roleName }} ({{ getUserCount(item) }}人)</div>
          <div class="role-card__desc">{{ item.description || '—' }}</div>
        </div>
      </div>
    </ElScrollbar>
    <ElLink type="primary" class="add-role-link" :underline="false" @click="$emit('add-role')">
      + 新建角色
    </ElLink>
  </div>
</template>

<script setup lang="ts">
  import { User } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'RoleListPanel' })

  const { t } = useI18n()

  type RoleListItem = Api.SystemManage.RoleListItem

  const props = defineProps<{
    roleList: RoleListItem[]
    selectedRole?: RoleListItem | null
    /** 角色对应用户数，若接口未返回则用此映射 */
    roleUserCountMap?: Record<number, number>
  }>()

  defineEmits<{
    (e: 'add-role'): void
    (e: 'select-role', role: RoleListItem): void
  }>()

  const avatarColors = ['blue', 'yellow', 'green', 'purple', 'cyan', 'red']

  function getUserCount(role: RoleListItem): number {
    if (props.roleUserCountMap && props.roleUserCountMap[role.roleId] !== undefined) {
      return props.roleUserCountMap[role.roleId]
    }
    return 0
  }
</script>

<style scoped lang="scss">
  .role-list-panel {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 16px;
    background: var(--el-bg-color);
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .panel-header {
    display: flex;
    flex-shrink: 0;
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

  .panel-list-title {
    flex-shrink: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .role-list-scroll {
    flex: 1;
    min-height: 0;
  }

  .role-card {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    background: var(--el-fill-color-light);
    border: 1px solid transparent;
    border-radius: 10px;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color);
    }

    &--active {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }
  }

  .role-card__avatar {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;

    .avatar-num {
      position: absolute;
      top: 2px;
      left: 50%;
      font-size: 12px;
      font-weight: 600;
      color: inherit;
      transform: translateX(-50%);
    }

    .avatar-icon {
      opacity: 0.8;
    }

    &--blue {
      color: #409eff;
      background: rgb(64 158 255 / 20%);
    }

    &--yellow {
      color: #e6a23c;
      background: rgb(230 162 60 / 20%);
    }

    &--green {
      color: #67c23a;
      background: rgb(103 194 58 / 20%);
    }

    &--purple {
      color: #9c27b0;
      background: rgb(156 39 176 / 20%);
    }

    &--cyan {
      color: #00bcd4;
      background: rgb(0 188 212 / 20%);
    }

    &--red {
      color: #f56c6c;
      background: rgb(245 108 108 / 20%);
    }
  }

  .role-card__body {
    flex: 1;
    min-width: 0;
  }

  .role-card__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .role-card__desc {
    margin-top: 2px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .add-role-link {
    flex-shrink: 0;
    font-size: 13px;
  }
</style>
