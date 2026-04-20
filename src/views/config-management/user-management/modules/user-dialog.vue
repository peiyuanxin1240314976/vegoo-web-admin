<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <div v-loading="initializing">
      <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="formData.username" placeholder="请输入用户名" />
        </ElFormItem>
        <ElFormItem label="手机号" prop="phone">
          <ElInput v-model="formData.phone" placeholder="请输入手机号" />
        </ElFormItem>
        <ElFormItem label="性别" prop="gender">
          <ElSelect v-model="formData.gender">
            <ElOption label="男" value="男" />
            <ElOption label="女" value="女" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="formData.role" multiple>
            <ElOption
              v-for="role in roleList"
              :key="role.roleId"
              :value="role.roleId"
              :label="role.roleName"
            />
          </ElSelect>
        </ElFormItem>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton :disabled="props.submitting" @click="dialogVisible = false">取消</ElButton>
        <ElButton
          type="primary"
          :loading="props.submitting"
          :disabled="props.submitting"
          @click="handleSubmit"
          >提交</ElButton
        >
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { useConfigRoleListStore } from '@/store/modules/config-role-list'

  interface Props {
    visible: boolean
    type: string
    userData?: Partial<Api.SystemManage.UserListItem>
    submitting?: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', payload: Record<string, unknown>): void
  }

  const props = withDefaults(defineProps<Props>(), {
    submitting: false
  })
  const emit = defineEmits<Emits>()

  const roleListStore = useConfigRoleListStore()
  const roleList = computed(() => roleListStore.items)

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  const initializing = ref(false)

  // 表单数据
  const formData = reactive({
    username: '',
    phone: '',
    gender: '男',
    role: [] as number[]
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
    ],
    gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
    role: [{ required: true, message: '请选择角色', trigger: 'blur' }]
  }

  /**
   * 初始化表单数据
   * 根据对话框类型（新增/编辑）填充表单
   */
  function pickFirst<T = unknown>(
    obj: Record<string, any> | undefined,
    keys: string[]
  ): T | undefined {
    if (!obj) return undefined
    for (const k of keys) {
      // 支持 a.b.c 的简单路径读取
      if (k.includes('.')) {
        const parts = k.split('.').filter(Boolean)
        let cur: any = obj
        for (const p of parts) {
          if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
          else {
            cur = undefined
            break
          }
        }
        if (cur !== undefined && cur !== null) return cur as T
        continue
      }
      const v = obj[k]
      if (v !== undefined && v !== null) return v as T
    }
    return undefined
  }

  function pickString(obj: Record<string, any> | undefined, keys: string[], fallback = ''): string {
    const v = pickFirst<unknown>(obj, keys)
    if (v === undefined || v === null) return fallback
    const s = String(v)
    return s.trim().length ? s : fallback
  }

  function scanFirstStringValue(
    obj: Record<string, any> | undefined,
    keyLike: RegExp,
    fallback = ''
  ): string {
    if (!obj) return fallback
    for (const k of Object.keys(obj)) {
      if (!keyLike.test(k)) continue
      const v = obj[k]
      if (v === undefined || v === null) continue
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        const s = String(v).trim()
        if (s) return s
      }
    }
    return fallback
  }

  function scanFirstArrayValue(
    obj: Record<string, any> | undefined,
    keyLike: RegExp
  ): unknown[] | undefined {
    if (!obj) return undefined
    for (const k of Object.keys(obj)) {
      if (!keyLike.test(k)) continue
      const v = obj[k]
      if (Array.isArray(v)) return v
    }
    return undefined
  }

  function mapUserRolesToRoleIds(raw: unknown, items: Api.SystemManage.RoleListItem[]): number[] {
    const list = Array.isArray(raw) ? raw : []
    if (!list.length) return []

    // 1) 直接是 roleId 数组
    if (list.every((r) => /^\d+$/.test(String(r)))) {
      return list.map((r) => Number(r))
    }

    // 2) 角色编码数组（或混合类型）
    const codes = new Set<string>()
    const ids: number[] = []

    for (const r of list) {
      if (r == null) continue
      if (typeof r === 'number' && Number.isFinite(r)) {
        ids.push(r)
        continue
      }
      if (typeof r === 'string') {
        const s = r.trim()
        if (!s) continue
        if (/^\d+$/.test(s)) ids.push(Number(s))
        else codes.add(s)
        continue
      }
      if (typeof r === 'object') {
        const obj = r as Record<string, any>
        const idLike = pickFirst<unknown>(obj, ['roleId', 'id', 'value', 'role_id'])
        if (idLike != null && /^\d+$/.test(String(idLike))) {
          ids.push(Number(idLike))
          continue
        }
        const codeLike = pickFirst<unknown>(obj, ['roleCode', 'code', 'key', 'role_code'])
        if (codeLike != null) {
          const s = String(codeLike).trim()
          if (s) codes.add(s)
        }
      }
    }

    const dedupIds = Array.from(new Set(ids)).filter((n) => Number.isFinite(n))
    if (dedupIds.length) return dedupIds
    return items.filter((item) => codes.has(item.roleCode)).map((item) => item.roleId)
  }

  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = (props.userData ?? {}) as Record<string, any>

    Object.assign(formData, {
      // 兼容后端字段别名：userName/username、userPhone/phone、userGender/gender、userRoles/roles
      username: isEdit ? pickString(row, ['userName', 'username'], '') : '',
      phone: isEdit
        ? pickString(row, [
            'userPhone',
            'user_phone',
            'user_phone_number',
            'userPhoneNumber',
            'phone',
            'phoneNumber',
            'mobile',
            'mobilePhone',
            'tel',
            'telephone',
            'userMobile',
            'contact.phone'
          ]) || scanFirstStringValue(row, /(phone|mobile|tel)/i, '')
        : '',
      gender: isEdit ? pickString(row, ['userGender', 'gender', 'sex'], '男') : '男',
      role: isEdit
        ? mapUserRolesToRoleIds(
            pickFirst(row, [
              'userRoles',
              'user_roles',
              'roles',
              'roleIds',
              'role_ids',
              'roleCodes',
              'role_codes',
              'roleList',
              'role_list'
            ]) ?? scanFirstArrayValue(row, /roles?|role(_?list|_?ids|_?codes)?/i),
            roleListStore.items
          )
        : []
    })
  }

  /**
   * 监听对话框状态变化
   * 当对话框打开时初始化表单数据并清除验证状态
   */
  watch(
    () => [props.visible, props.type, props.userData],
    async ([visible]) => {
      if (visible) {
        try {
          initializing.value = true
          await roleListStore.loadRoleList({ force: true })
          initFormData()
          await nextTick()
          formRef.value?.clearValidate()
        } finally {
          initializing.value = false
        }
      }
    },
    { immediate: true }
  )

  /**
   * 提交表单
   * 验证通过后触发提交事件
   */
  const handleSubmit = async () => {
    if (!formRef.value) return

    if (props.submitting) return
    const valid = await formRef.value.validate()
    if (!valid) return
    emit('submit', { ...formData })
  }
</script>
