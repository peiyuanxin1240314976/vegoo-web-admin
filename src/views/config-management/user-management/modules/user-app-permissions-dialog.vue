<template>
  <ElDialog
    v-model="dialogVisible"
    title="应用权限"
    width="520px"
    align-center
    :close-on-click-modal="false"
    header-class="user-app-perm-dialog-hd"
    body-class="user-app-perm-dialog-bd"
    footer-class="user-app-perm-dialog-ft"
    @closed="handleClosed"
  >
    <div v-loading="loadingOptions" class="user-app-perm-dialog-body">
      <div class="field-label">可访问应用</div>
      <ElSelect
        v-model="selectedUuids"
        class="dark-select dark-select--full"
        multiple
        filterable
        collapse-tags
        collapse-tags-tooltip
        :fit-input-width="false"
        :popper-options="appPermSelectPopperOptions"
        placeholder="搜索并选择应用"
        :disabled="loadingOptions || !optionsLoaded"
        popper-class="user-app-perm-select-dropdown"
      >
        <ElOption
          v-for="app in apps"
          :key="app.appUuid"
          :label="app.appName"
          :value="app.appUuid"
        />
      </ElSelect>
      <p v-if="loadErrorHint" class="hint hint--error">{{ loadErrorHint }}</p>
    </div>
    <template #footer>
      <div class="dialog-footer-inner">
        <ElButton :disabled="saving" @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="saving" :disabled="!canSave" @click="handleSave">
          保存
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import {
    fetchUserAppPermissionsOptions,
    saveUserAppPermissions
  } from '@/api/config-management/user-management'
  import type { UserAppPermissionAppItem } from '../types'

  defineOptions({ name: 'UserAppPermissionsDialog' })

  /** 减轻多选全选时 Popper 与滚动容器合成层导致的选项区闪烁 */
  const appPermSelectPopperOptions = {
    modifiers: [{ name: 'computeStyles', options: { adaptive: false, gpuAcceleration: false } }]
  } as const

  interface Props {
    visible: boolean
    /** 列表行用户主键 */
    userId: number
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v: boolean) => emit('update:visible', v)
  })

  const apps = ref<UserAppPermissionAppItem[]>([])
  const selectedUuids = ref<string[]>([])
  const loadingOptions = ref(false)
  const saving = ref(false)
  const optionsLoaded = ref(false)
  const loadErrorHint = ref('')

  const canSave = computed(
    () => optionsLoaded.value && !loadingOptions.value && !saving.value && props.userId > 0
  )

  async function loadOptions() {
    if (!(props.userId > 0)) return
    loadingOptions.value = true
    optionsLoaded.value = false
    loadErrorHint.value = ''
    try {
      const data = await fetchUserAppPermissionsOptions(props.userId)
      const list = (data.apps ?? []).filter((a) => String(a.appUuid ?? '').trim() !== '')
      apps.value = list
      selectedUuids.value = list.filter((a) => a.permitted).map((a) => a.appUuid)
      optionsLoaded.value = true
    } catch {
      apps.value = []
      selectedUuids.value = []
      loadErrorHint.value = '加载应用列表失败，请稍后重试'
    } finally {
      loadingOptions.value = false
    }
  }

  watch(
    () => [props.visible, props.userId] as const,
    ([vis, uid]) => {
      if (!vis || uid == null || uid <= 0) return
      loadOptions()
    }
  )

  function handleClosed() {
    apps.value = []
    selectedUuids.value = []
    optionsLoaded.value = false
    loadErrorHint.value = ''
    saving.value = false
  }

  async function handleSave() {
    if (!canSave.value) return
    saving.value = true
    try {
      const res = await saveUserAppPermissions({
        userId: props.userId,
        allowedAppUuids: [...selectedUuids.value]
      })
      if (!res?.success) {
        ElMessage.error('保存失败')
        return
      }
      ElMessage.success('保存成功')
      emit('success')
      dialogVisible.value = false
    } catch {
      // request 已提示
    } finally {
      saving.value = false
    }
  }
</script>

<style lang="scss">
  .el-dialog:has(.user-app-perm-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.user-app-perm-dialog-bd) .el-dialog__header.user-app-perm-dialog-hd {
    padding: 18px 24px 14px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.user-app-perm-dialog-bd) .el-dialog__title {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.user-app-perm-dialog-bd) .el-dialog__headerbtn .el-icon {
    font-size: 16px;
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.user-app-perm-dialog-bd) .el-dialog__body.user-app-perm-dialog-bd {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.user-app-perm-dialog-bd) .el-dialog__footer.user-app-perm-dialog-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }

  .user-app-perm-select-dropdown.el-select-dropdown,
  .user-app-perm-select-dropdown {
    background: #1a2540 !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;

    .el-select-dropdown__item {
      color: #94a3b8 !important;
      background-color: transparent !important;
      transition: none !important;

      /* 选中：不铺灰/青底，避免「悬停一条、其它条底纹全消」的闪烁感；状态仅靠勾选与行为 */
      &.is-selected {
        font-weight: normal !important;
        color: #94a3b8 !important;
        background: transparent !important;
        background-color: transparent !important;
      }

      /* 仅当前悬停行高亮（含已选中项） */
      &.is-hovering,
      &:hover {
        color: #2dd4bf !important;
        background: rgb(45 212 191 / 12%) !important;
        background-color: rgb(45 212 191 / 12%) !important;
      }
    }

    /* 覆盖全局 el-ui.scss 的 is-selected 灰底 + margin-bottom 规则 */
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
      /* 减少滚动条显隐引起的横向 reflow */
      overflow-x: hidden;
    }
  }
</style>

<style lang="scss" scoped>
  .user-app-perm-dialog-body {
    padding: 20px 24px 22px;
  }

  .field-label {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 500;
    color: var(--cm-dialog-text-primary);
  }

  .hint {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--cm-dialog-text-muted);

    &--error {
      color: #f87171;
    }
  }

  .dialog-footer-inner {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 12px 20px 16px;
  }

  .dark-select--full {
    width: 100%;

    :deep(.el-select__wrapper) {
      min-height: 40px;
      font-size: 13px;
      color: #94a3b8;
      background: rgb(255 255 255 / 3%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(45 212 191 / 30%) !important;
      }
    }
  }
</style>
