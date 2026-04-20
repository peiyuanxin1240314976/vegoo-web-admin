<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '角色详情 / 编辑角色'"
    width="640px"
    align-center
    header-class="role-edit-dialog-hd"
    body-class="role-edit-dialog-bd"
    footer-class="role-edit-dialog-ft"
    @close="handleClose"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="110px" class="role-edit-form">
      <div class="role-edit-grid">
        <ElFormItem label="角色名称" prop="roleName">
          <ElInput v-model="form.roleName" placeholder="请输入角色名称，例如：投放经理" />
        </ElFormItem>

        <ElFormItem label="角色编码" prop="roleCode">
          <ElInput v-model="form.roleCode" placeholder="请输入角色编码，例如：DeliveryManager" />
        </ElFormItem>
      </div>

      <ElFormItem label="角色说明" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="4"
          maxlength="120"
          show-word-limit
          placeholder="请输入角色定位说明，便于成员理解该角色负责哪些业务。"
        />
      </ElFormItem>

      <ElFormItem label="启用状态">
        <ElSwitch v-model="form.enabled" active-text="启用" inactive-text="停用" />
      </ElFormItem>

      <ElFormItem label="权限配置">
        <div class="role-edit-note">
          <ElAlert
            title="页面权限和日期权限请在主面板中配置，按钮级权限本期仅预留字段。"
            type="info"
            :closable="false"
            show-icon
          />
          <div class="role-edit-note__tips">
            <p>角色编码会作为用户接口中的 `permissions / roles` 返回值使用。</p>
            <p>建议编码使用稳定英文标识，避免后续改名影响权限识别。</p>
          </div>
        </div>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton round @click="handleClose">取消</ElButton>
      <ElButton
        type="primary"
        round
        :loading="submitting"
        :disabled="submitting"
        @click="handleSubmit"
      >
        {{ dialogType === 'add' ? '创建角色' : '保存角色信息' }}
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchRoleDetailSave, type RoleDetailSavePayload } from '@/api/config-management/role'

  defineOptions({ name: 'RoleEditDialog' })

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success', payload: { roleId: number; dialogType: 'add' | 'edit' }): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const form = reactive<RoleDetailSavePayload>({
    roleId: undefined,
    roleName: '',
    roleCode: '',
    description: '',
    enabled: true
  })

  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 20, message: '角色名称长度需在 2 到 20 个字符之间', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      {
        pattern: /^[A-Za-z][A-Za-z0-9]+$/,
        message: '角色编码需以字母开头，且只包含字母和数字',
        trigger: 'blur'
      },
      { min: 2, max: 50, message: '角色编码长度需在 2 到 50 个字符之间', trigger: 'blur' }
    ],
    description: [
      { required: true, message: '请输入角色说明', trigger: 'blur' },
      { min: 4, max: 120, message: '角色说明长度需在 4 到 120 个字符之间', trigger: 'blur' }
    ]
  })

  function initForm() {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, {
        roleId: props.roleData.roleId,
        roleName: props.roleData.roleName,
        roleCode: props.roleData.roleCode,
        description: props.roleData.description,
        enabled: props.roleData.enabled
      })
      return
    }

    Object.assign(form, {
      roleId: undefined,
      roleName: '',
      roleCode: '',
      description: '',
      enabled: true
    })
  }

  function handleClose() {
    visible.value = false
    formRef.value?.resetFields()
  }

  async function handleSubmit() {
    if (!formRef.value) return
    if (submitting.value) return

    try {
      submitting.value = true
      await formRef.value.validate()
      const res = await fetchRoleDetailSave({
        roleId: form.roleId,
        roleName: form.roleName.trim(),
        roleCode: form.roleCode.trim(),
        description: form.description.trim(),
        enabled: form.enabled
      })

      if (res.success) {
        ElMessage.success(props.dialogType === 'add' ? '角色创建成功' : '角色信息已更新')
        emit('success', { roleId: res.roleId, dialogType: props.dialogType })
        handleClose()
      }
    } catch (error) {
      console.error('角色信息提交失败', error)
    } finally {
      submitting.value = false
    }
  }

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  watch(
    () => props.roleData,
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true }
  )
</script>

<style scoped lang="scss">
  .role-edit-form {
    padding-top: 8px;
  }

  .role-edit-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 12px;
  }

  .role-edit-note {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .role-edit-note__tips {
    font-size: 12px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);

    p {
      margin: 0;
    }
  }

  @media (width <= 768px) {
    .role-edit-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<style lang="scss">
  .el-dialog:has(.role-edit-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.role-edit-dialog-bd) .el-dialog__header.role-edit-dialog-hd {
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .el-dialog:has(.role-edit-dialog-bd) .el-dialog__body.role-edit-dialog-bd {
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.role-edit-dialog-bd) .el-dialog__footer.role-edit-dialog-ft {
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
  }

  .el-dialog:has(.role-edit-dialog-bd) .el-dialog__title {
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.role-edit-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }
</style>
