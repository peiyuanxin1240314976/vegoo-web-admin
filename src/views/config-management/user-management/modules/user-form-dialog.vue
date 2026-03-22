<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新建用户'"
    width="480px"
    :close-on-click-modal="false"
    class="user-form-dialog"
    @closed="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="user-form">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="form.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入邮箱地址" :disabled="isEdit" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
          <el-option
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="可访问应用" prop="accessibleApps">
        <el-select
          v-model="form.accessibleApps"
          multiple
          placeholder="请选择可访问的应用"
          style="width: 100%"
        >
          <el-option
            v-for="opt in appOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选，输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <ElButton round @click="visible = false">取消</ElButton>
      <ElButton round type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { UserFormPayload, UserItem } from '../types'
  import { userRoleOptions, userAppOptions } from '../mock/data'

  defineOptions({ name: 'UserFormDialog' })

  interface Props {
    visible: boolean
    editData: UserItem | null
  }

  interface Emits {
    (e: 'update:visible', val: boolean): void
    (e: 'success', payload: UserFormPayload): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const visible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const isEdit = computed(() => !!props.editData)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()
  const roleOptions = userRoleOptions
  const appOptions = userAppOptions

  const form = reactive<UserFormPayload>({
    userName: '',
    email: '',
    role: '投放人员',
    accessibleApps: [],
    remark: ''
  })

  const rules: FormRules = {
    userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    email: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
    ],
    role: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  watch(
    () => props.editData,
    (data) => {
      if (data) {
        form.id = data.id
        form.userName = data.userName
        form.email = data.email
        form.role = data.role
        form.accessibleApps = [...data.accessibleApps]
        form.remark = data.remark
      }
    },
    { immediate: true }
  )

  function resetForm() {
    form.id = undefined
    form.userName = ''
    form.email = ''
    form.role = '投放人员'
    form.accessibleApps = []
    form.remark = ''
    formRef.value?.clearValidate()
  }

  async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    submitting.value = true
    try {
      emit('success', { ...form })
    } finally {
      submitting.value = false
    }
  }

  function handleClose() {
    if (!props.editData) resetForm()
  }
</script>

<style lang="scss" scoped>
  .user-form-dialog {
    :deep(.el-dialog) {
      background: #0f1829;
      border: 1px solid rgb(255 255 255 / 8%);
      border-radius: 12px;
    }

    :deep(.el-dialog__header) {
      padding: 20px 24px 16px;
      border-bottom: 1px solid rgb(255 255 255 / 7%);

      .el-dialog__title {
        font-size: 15px;
        font-weight: 600;
        color: #e2e8f0;
      }
    }

    :deep(.el-dialog__body) {
      padding: 20px 24px;
    }

    :deep(.el-dialog__footer) {
      padding: 12px 24px 20px;
      border-top: 1px solid rgb(255 255 255 / 7%);
    }

    :deep(.el-form-item__label) {
      font-size: 13px;
      color: #94a3b8;
    }

    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      box-shadow: none !important;

      &:focus,
      &:focus-within {
        border-color: #2dd4bf !important;
      }
    }

    :deep(.el-select__wrapper) {
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 8%) !important;
      box-shadow: none !important;
    }
  }
</style>
