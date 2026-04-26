<!-- 用户管理 - 右侧面板：用户详情、分配角色、可访问应用、备注 -->
<template>
  <div class="user-right-panel">
    <template v-if="mode === 'create' || user">
      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">用户信息</span>
        </template>
        <div v-if="mode !== 'create'" class="user-info">
          <div class="user-name">{{ user!.userName }}</div>
          <div v-if="user!.nickName" class="user-nick">昵称：{{ user!.nickName }}</div>
          <div class="user-email">{{ user!.userEmail }}</div>
        </div>
        <div v-else class="user-info">
          <div class="user-name">新建用户</div>
          <div class="user-email">填写基础信息并分配角色与可访问应用</div>
        </div>
      </ElCard>

      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">基础信息</span>
        </template>
        <ElForm :model="baseForm" label-width="72px">
          <ElFormItem label="姓名" required>
            <ElInput v-model="baseForm.nickName" placeholder="请输入姓名" />
          </ElFormItem>
          <ElFormItem label="用户名" required>
            <ElInput
              v-model="baseForm.userName"
              :disabled="mode !== 'create'"
              placeholder="请输入用户名（仅支持英文/数字/下划线）"
            />
          </ElFormItem>
          <ElFormItem label="手机号" required>
            <ElInput v-model="baseForm.userPhone" placeholder="请输入手机号" />
          </ElFormItem>
          <ElFormItem label="性别" required>
            <ElSelect v-model="baseForm.userGender" class="full-width">
              <ElOption label="男" value="男" />
              <ElOption label="女" value="女" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </ElCard>

      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">分配角色</span>
        </template>
        <ElSelect
          v-model="form.roleId"
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
          <AppPlatformSearchSelect
            v-model="form.apps"
            mode="app"
            :multiple="true"
            placeholder="搜索并选择应用"
            search-placeholder="搜索类别/应用名称/应用简称/商店ID"
            :disabled="appsLoading || !appsLoaded"
            :setting-apps="settingApps"
            :max-display-tags="24"
            :panel-width="920"
            :panel-body-max-height="520"
            :height="44"
            :auto-height="true"
            :auto-max-rows="6"
            placement="bottom-end"
            @change="$emit('change')"
          />
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
        <ElButton @click="handleCancelEdit">取消</ElButton>
        <ElButton v-if="mode !== 'create'" type="danger" plain @click="$emit('disable')"
          >禁用</ElButton
        >
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
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterOptions } from '@/composables/use-cockpit-meta-filter'

  defineOptions({ name: 'UserRightPanel' })

  const props = withDefaults(
    defineProps<{
      mode?: 'edit' | 'create'
      user?: Api.SystemManage.UserListItem | null
      editing?: boolean
      roleOptions?: { label: string; value: number }[]
    }>(),
    {
      mode: 'edit',
      editing: false,
      roleOptions: () => [
        { label: '投放经理', value: 3 },
        { label: '超级管理员', value: 1 }
      ]
    }
  )

  const emit = defineEmits<{
    (
      e: 'save',
      payload: {
        nickName: string
        userName: string
        userPhone: string
        userGender: string
        roleId: number | ''
        accessibleApps: string[]
        remark: string
      }
    ): void
    (e: 'cancel'): void
    (e: 'disable'): void
    (e: 'change'): void
  }>()

  const baseForm = ref({
    nickName: '',
    userName: '',
    userPhone: '',
    userGender: '男'
  })

  function normalizeGender(input: unknown): '男' | '女' {
    if (input == null) return '男'
    const s = String(input).trim()
    if (!s) return '男'
    if (s === '男' || s.toLowerCase() === 'm' || s === '1' || s === 'male') return '男'
    if (s === '女' || s.toLowerCase() === 'f' || s === '2' || s === 'female') return '女'
    return '男'
  }

  const form = ref({
    roleId: '' as number | '',
    apps: [] as string[],
    remark: ''
  })

  const { cockpitMeta, ensureCockpitMetaLoaded } = useCockpitMetaFilterOptions()
  const appsLoading = ref(false)
  const appsLoadError = ref('')
  const loadedPermittedUserId = ref<number>(0)

  const cockpitApps = computed(() => cockpitMeta.value?.settingApps ?? [])
  const settingApps = computed(() => cockpitApps.value)

  const appsLoaded = computed(() => settingApps.value.length > 0)

  function normalizeRoleId(input: unknown): number | '' {
    if (input == null) return ''
    const n = typeof input === 'number' ? input : Number(String(input).trim())
    if (!Number.isFinite(n)) return ''
    return n
  }

  watch(
    () => [props.mode, props.user] as const,
    ([mode, u]) => {
      if (mode === 'create') {
        baseForm.value = { nickName: '', userName: '', userPhone: '', userGender: '男' }
        form.value = { roleId: '' as number | '', apps: [] as string[], remark: '' }
        appsLoadError.value = ''
        loadedPermittedUserId.value = 0
        if (!cockpitApps.value.length && !appsLoading.value) {
          appsLoading.value = true
          Promise.resolve()
            .then(() => ensureCockpitMetaLoaded())
            .catch(() => {
              appsLoadError.value = '加载应用列表失败，请稍后重试'
            })
            .finally(() => {
              appsLoading.value = false
            })
        }
        return
      }
      if (u) {
        const nameFromTable = String((u as any)?.name ?? '').trim()
        baseForm.value = {
          nickName: nameFromTable || (u.nickName ?? ''),
          userName: u.userName ?? '',
          userPhone: u.userPhone ?? '',
          userGender: normalizeGender(u.userGender)
        }
        form.value.roleId = normalizeRoleId((u as any)?.userRoles?.[0])
        form.value.remark = u.remark ?? ''
        form.value.apps = [...(u.accessibleApps ?? [])]

        // 候选列表兜底：若尚无 appOptions，则确保 cockpit settingApps 已加载（避免选择器被禁用）
        if (!cockpitApps.value.length && !appsLoading.value) {
          appsLoading.value = true
          Promise.resolve()
            .then(() => ensureCockpitMetaLoaded())
            .catch(() => {
              appsLoadError.value = '加载应用列表失败，请稍后重试'
            })
            .finally(() => {
              appsLoading.value = false
            })
        }

        // 回显兜底：table 未返回 accessibleApps 或返回空数组时，才去 options 拉 permitted 回显
        const needFallback =
          (u.accessibleApps == null ||
            (Array.isArray(u.accessibleApps) && u.accessibleApps.length === 0)) &&
          u.id > 0
        if (needFallback && loadedPermittedUserId.value !== u.id) {
          void loadPermittedAppsFallback(u.id)
        }
      } else {
        baseForm.value = { nickName: '', userName: '', userPhone: '', userGender: '男' }
        form.value = { roleId: '', apps: [], remark: '' }
        appsLoadError.value = ''
        loadedPermittedUserId.value = 0
      }
    },
    { immediate: true }
  )

  async function loadPermittedAppsFallback(userId: number) {
    if (!(userId > 0)) return
    appsLoading.value = true
    appsLoadError.value = ''
    try {
      // 先确保 cockpit 应用列表存在，便于做 appUuid/appId → sAppId 的映射
      if (!cockpitApps.value.length) {
        await ensureCockpitMetaLoaded()
      }

      const data = await fetchUserAppPermissionsOptions(userId)
      const permitted = (data.apps ?? []).filter((a) => a && a.permitted)

      // AppPlatformSearchSelect 多选的 modelValue 需要是 settingApps 的 sAppId
      const mapped = permitted
        .map((a) => {
          const uuid = String((a as any).appUuid ?? '').trim()
          const appId = String((a as any).appId ?? '').trim()
          const hitByUuid = uuid
            ? cockpitApps.value.find((c) => String((c as any).sAppUUId ?? '').trim() === uuid)
            : undefined
          if (hitByUuid?.sAppId) return String(hitByUuid.sAppId)
          const hitByAppId = appId
            ? cockpitApps.value.find((c) => String(c.sAppId ?? '').trim() === appId)
            : undefined
          if (hitByAppId?.sAppId) return String(hitByAppId.sAppId)
          return appId || uuid
        })
        .map((v) => String(v ?? '').trim())
        .filter(Boolean)

      if (mapped.length) {
        form.value.apps = Array.from(new Set(mapped))
      }
      loadedPermittedUserId.value = userId
    } catch {
      appsLoadError.value = '加载可访问应用回显失败，请稍后重试'
      loadedPermittedUserId.value = userId
    } finally {
      appsLoading.value = false
    }
  }

  function handleSave() {
    emit('save', {
      nickName: baseForm.value.nickName,
      userName: baseForm.value.userName,
      userPhone: baseForm.value.userPhone,
      userGender: baseForm.value.userGender,
      roleId: form.value.roleId,
      accessibleApps: form.value.apps,
      remark: form.value.remark
    })
  }

  function handleCancelEdit() {
    emit('cancel')
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
  }

  .full-width {
    width: 100%;
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
