<!-- 用户管理 - 右侧面板：用户详情、分配角色、可访问应用、备注 -->
<template>
  <div class="user-right-panel">
    <template v-if="user">
      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">用户信息</span>
        </template>
        <div class="user-info">
          <div class="user-name">{{ user.userName }}</div>
          <div v-if="user.nickName" class="user-nick">昵称：{{ user.nickName }}</div>
          <div class="user-email">{{ user.userEmail }}</div>
          <div class="user-meta">
            <span class="status-dot" :class="statusDotClass"></span>
            <span class="status-text">{{ statusText }}</span>
            <span class="meta-sep">|</span>
            <span class="meta-date">{{ user.createTime || '--' }}</span>
            <span class="meta-actions">
              <span class="meta-sep">|</span>
              <ElLink type="primary" :underline="false" @click="$emit('edit')">编辑</ElLink>
              <span class="meta-sep">|</span>
              <ElLink type="danger" :underline="false" @click="$emit('disable')">禁用</ElLink>
            </span>
          </div>
        </div>
      </ElCard>

      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">分配角色</span>
        </template>
        <ElSelect
          v-model="form.role"
          placeholder="投放人员"
          clearable
          class="full-width"
          @change="$emit('change')"
        >
          <ElOption
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElCard>

      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">可访问应用</span>
        </template>
        <div v-loading="appsLoading">
          <ElSelect
            v-model="form.apps"
            multiple
            filterable
            collapse-tags
            collapse-tags-tooltip
            :fit-input-width="false"
            :popper-options="appPermSelectPopperOptions"
            placeholder="搜索并选择应用"
            :disabled="appsLoading || !appsLoaded"
            popper-class="user-app-perm-select-dropdown"
            class="full-width apps-select dark-select"
            @change="$emit('change')"
          >
            <ElOption
              v-for="app in appOptions"
              :key="app.appUuid"
              :label="app.appName"
              :value="app.appUuid"
            />
          </ElSelect>
          <p v-if="appsLoadError" class="field-hint field-hint--error">{{ appsLoadError }}</p>
        </div>
      </ElCard>

      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">备注</span>
        </template>
        <ElInput
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注"
          class="full-width"
          @input="$emit('change')"
        />
      </ElCard>

      <div class="panel-actions">
        <ElButton type="primary" @click="handleSave">保存</ElButton>
        <ElButton @click="$emit('cancel')">取消</ElButton>
      </div>
    </template>

    <ElCard v-else class="panel-section panel-empty" shadow="never">
      <div class="empty-tip">
        <p class="empty-text">请从左侧列表选择用户</p>
        <p class="empty-desc">查看或编辑用户详情</p>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchUserAppPermissionsOptions } from '@/api/config-management/user-management'
  import type { UserAppPermissionAppItem } from '../types'

  defineOptions({ name: 'UserRightPanel' })

  const appPermSelectPopperOptions = {
    modifiers: [{ name: 'computeStyles', options: { adaptive: false, gpuAcceleration: false } }]
  }

  const props = withDefaults(
    defineProps<{
      user?: Api.SystemManage.UserListItem | null
      roleOptions?: { label: string; value: string }[]
    }>(),
    {
      roleOptions: () => [
        { label: '投放人员', value: 'ops' },
        { label: '管理员/老板', value: 'admin' }
      ]
    }
  )

  const emit = defineEmits<{
    (e: 'save', payload: { role: string; apps: string[]; remark: string }): void
    (e: 'cancel'): void
    (e: 'edit'): void
    (e: 'disable'): void
    (e: 'change'): void
  }>()

  const form = ref({
    role: '',
    apps: [] as string[],
    remark: ''
  })

  const appOptions = ref<UserAppPermissionAppItem[]>([])
  const appsLoading = ref(false)
  const appsLoaded = ref(false)
  const appsLoadError = ref('')

  const statusMap: Record<string, { text: string; dot: string }> = {
    '1': { text: '在线', dot: 'active' },
    '2': { text: '离线', dot: 'offline' },
    '3': { text: '异常', dot: 'warning' },
    '4': { text: '已禁用', dot: 'disabled' }
  }

  const statusText = computed(() =>
    props.user ? (statusMap[props.user.status]?.text ?? '未知') : ''
  )
  const statusDotClass = computed(() =>
    props.user ? `status-dot--${statusMap[props.user.status]?.dot ?? 'default'}` : ''
  )

  watch(
    () => props.user,
    (u) => {
      if (u) {
        form.value.role = u.userRoles?.[0] ?? ''
        form.value.remark = u.remark ?? ''
        void loadAppOptions(u.id, u.accessibleApps ?? [])
      } else {
        form.value = { role: '', apps: [], remark: '' }
        appOptions.value = []
        appsLoaded.value = false
        appsLoadError.value = ''
      }
    },
    { immediate: true }
  )

  async function loadAppOptions(userId: number, accessibleApps: string[]) {
    if (!(userId > 0)) {
      appOptions.value = []
      form.value.apps = [...accessibleApps]
      appsLoaded.value = false
      appsLoadError.value = ''
      return
    }

    appsLoading.value = true
    appsLoaded.value = false
    appsLoadError.value = ''

    try {
      const data = await fetchUserAppPermissionsOptions(userId)
      const list = (data.apps ?? []).filter((a) => String(a.appUuid ?? '').trim() !== '')
      const selected = list.filter((a) => a.permitted).map((a) => a.appUuid)

      appOptions.value = list
      form.value.apps = selected.length ? selected : [...accessibleApps]
      appsLoaded.value = true
    } catch {
      appOptions.value = []
      form.value.apps = [...accessibleApps]
      appsLoadError.value = '加载应用列表失败，请稍后重试'
    } finally {
      appsLoading.value = false
    }
  }

  function handleSave() {
    emit('save', {
      role: form.value.role,
      apps: form.value.apps,
      remark: form.value.remark
    })
  }
</script>

<style scoped lang="scss">
  .user-right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    height: 100%;
    min-height: 400px;
    overflow-y: auto;
  }

  .panel-section {
    flex-shrink: 0;

    :deep(.el-card__header) {
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

  .user-info {
    .user-name {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 500;
    }

    .user-nick {
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .user-email {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .user-meta {
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .meta-sep {
        margin: 0 8px;
        opacity: 0.6;
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

        &--warning {
          background: var(--el-color-warning);
        }

        &--disabled {
          background: var(--el-color-danger);
        }

        &--default {
          background: var(--el-text-color-placeholder);
        }
      }
    }
  }

  .full-width {
    width: 100%;
  }

  .apps-select {
    :deep(.el-select__wrapper) {
      align-items: flex-start;
      min-height: 96px !important;
      padding-top: 8px;
    }
  }

  .dark-select {
    :deep(.el-select__wrapper) {
      font-size: 13px;
      background: rgb(255 255 255 / 3%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(45 212 191 / 30%) !important;
      }
    }
  }

  .field-hint {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);

    &--error {
      color: #f87171;
    }
  }

  .panel-actions {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 8px;
    margin-top: auto;
  }

  .panel-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  }

  .empty-tip {
    color: var(--el-text-color-secondary);
    text-align: center;
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

<style lang="scss">
  .user-app-perm-select-dropdown.el-select-dropdown,
  .user-app-perm-select-dropdown {
    background: #1a2540 !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;

    .el-select-dropdown__item {
      color: #94a3b8 !important;
      background-color: transparent !important;
      transition: none !important;

      &.is-selected {
        font-weight: normal !important;
        color: #94a3b8 !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      &.is-hovering,
      &:hover {
        color: #2dd4bf !important;
        background: rgb(45 212 191 / 12%) !important;
        background-color: rgb(45 212 191 / 12%) !important;
      }
    }

    &.el-select__popper .el-select-dropdown__list .el-select-dropdown__item {
      margin-bottom: 0 !important;
    }

    &.el-select__popper .el-select-dropdown__list .el-select-dropdown__item.is-selected {
      margin-bottom: 0 !important;
      font-weight: 400 !important;
      color: #94a3b8 !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    &.el-select__popper .el-select-dropdown__list .el-select-dropdown__item.is-selected.is-hovering,
    &.el-select__popper .el-select-dropdown__list .el-select-dropdown__item.is-selected:hover {
      color: #2dd4bf !important;
      background: rgb(45 212 191 / 12%) !important;
      background-color: rgb(45 212 191 / 12%) !important;
    }

    .el-scrollbar__wrap {
      overflow-x: hidden;
    }
  }
</style>
