<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑代理商' : '新建代理商'"
    width="520px"
    :close-on-click-modal="false"
    header-class="agency-form-dialog-hd"
    body-class="agency-form-dialog-bd"
    footer-class="agency-form-dialog-ft"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="agency-form">
      <!-- 广告平台 + 合作模式 -->
      <div class="form-row">
        <el-form-item label="广告平台" prop="source" class="form-col">
          <el-select
            v-if="!isEdit"
            v-model="form.source"
            placeholder="请选择广告平台"
            class="form-select"
          >
            <el-option
              v-for="p in PLATFORM_CONFIGS"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
          <div v-else class="readonly-field" :style="getPlatformStyle(form.source)">
            {{ form.source }}
          </div>
        </el-form-item>
        <el-form-item label="合作模式" prop="coopMode" class="form-col">
          <el-select v-model="form.coopMode" placeholder="请选择合作模式" class="form-select">
            <el-option label="授权代理" value="授权代理" />
            <el-option label="直接开户" value="直接开户" />
          </el-select>
        </el-form-item>
      </div>

      <!-- 代理商名称 -->
      <el-form-item label="代理商名称" prop="agencyName">
        <el-input
          v-model="form.agencyName"
          placeholder="请输入代理商名称"
          class="form-input"
          clearable
        />
      </el-form-item>

      <!-- 联系人 + 联系邮箱 -->
      <div class="form-row">
        <el-form-item label="联系人" prop="contact" class="form-col">
          <el-input
            v-model="form.contact"
            placeholder="请输入联系人"
            class="form-input"
            clearable
          />
        </el-form-item>
        <el-form-item label="联系邮箱" prop="email" class="form-col">
          <el-input
            v-model="form.email"
            placeholder="请输入联系邮箱"
            class="form-input"
            clearable
          />
        </el-form-item>
      </div>

      <!-- 联系电话 + 广告平台账号 -->
      <div class="form-row">
        <el-form-item label="联系电话" class="form-col">
          <el-input
            v-model="form.phone"
            placeholder="请输入联系电话"
            class="form-input"
            clearable
          />
        </el-form-item>
        <el-form-item label="广告平台账号" class="form-col">
          <el-input
            v-model="form.agencyAccount"
            placeholder="代理商平台账号"
            class="form-input"
            clearable
          />
        </el-form-item>
      </div>

      <!-- 合作开始日期 + 合作到期日期 -->
      <div class="form-row">
        <el-form-item label="合作开始日期" prop="startDate" class="form-col">
          <AppDatePicker
            v-model="form.startDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="form-datepicker"
            popper-class="dark-datepicker"
          />
        </el-form-item>
        <el-form-item label="合作到期日期" prop="expireDate" class="form-col">
          <AppDatePicker
            v-model="form.expireDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="form-datepicker"
            :class="{ 'datepicker--warn': isEdit && isExpiringSoon(form.expireDate) }"
            popper-class="dark-datepicker"
          />
        </el-form-item>
      </div>

      <!-- 备注 -->
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder="可填写代理商相关备注信息"
          :rows="3"
          class="form-textarea"
          resize="none"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
      <ElButton
        round
        class="dialog-btn dialog-btn--submit"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存修改' : '保存' }}
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { getAppNowMs } from '@/utils/app-now'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AgencyItem, AgencyFormModel } from '../types'

  defineOptions({ name: 'AgencyFormDialog' })

  const props = defineProps<{
    visible: boolean
    editData: AgencyItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: AgencyFormModel]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const isEdit = computed(() => !!props.editData?.id)

  const defaultForm = (): AgencyFormModel => ({
    agencyName: '',
    source: '',
    coopMode: '授权代理',
    contact: '',
    email: '',
    phone: '',
    agencyAccount: '',
    startDate: '',
    expireDate: '',
    remark: ''
  })

  const form = ref<AgencyFormModel>(defaultForm())
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  watch(
    () => props.visible,
    (v) => {
      if (v) {
        if (props.editData) {
          form.value = {
            agencyName: props.editData.agencyName,
            source: props.editData.source,
            coopMode: props.editData.coopMode,
            contact: props.editData.contact,
            email: props.editData.email,
            phone: props.editData.phone,
            agencyAccount: (props.editData as any).agencyAccount ?? '',
            startDate: props.editData.startDate,
            expireDate: props.editData.expireDate,
            remark: props.editData.remark
          }
        } else {
          form.value = defaultForm()
        }
        formRef.value?.clearValidate()
      }
    }
  )

  const rules: FormRules = {
    agencyName: [{ required: true, message: '请输入代理商名称', trigger: 'blur' }],
    source: [{ required: true, message: '请选择广告平台', trigger: 'change' }],
    coopMode: [{ required: true, message: '请选择合作模式', trigger: 'change' }],
    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    startDate: [{ required: true, message: '请选择合作开始日期', trigger: 'change' }],
    expireDate: [{ required: true, message: '请选择合作到期日期', trigger: 'change' }]
  }

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color }
  }

  function isExpiringSoon(date: string) {
    if (!date) return false
    const d = new Date(date)
    const diff = (d.getTime() - getAppNowMs()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }

  const handleCancel = () => emit('update:visible', false)

  const handleSubmit = async () => {
    await formRef.value?.validate()
    submitting.value = true
    try {
      await new Promise((r) => setTimeout(r, 500))
      emit('success', { ...form.value })
    } finally {
      submitting.value = false
    }
  }
</script>

<!-- 非 scoped -->
<style lang="scss">
  .el-dialog:has(.agency-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__header.agency-form-dialog-hd {
    padding: 20px 24px 16px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__body.agency-form-dialog-bd {
    padding: 20px 24px 8px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__footer.agency-form-dialog-ft {
    padding: 14px 24px 20px;
    text-align: right;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  .agency-form {
    :deep(.el-form-item__label) {
      margin-bottom: 6px;
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
    }

    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
  }

  .form-col {
    min-width: 0;
  }

  .form-input,
  .form-select,
  .form-datepicker {
    width: 100%;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px;
      box-shadow: none !important;
      transition: border-color 0.18s;

      &:hover {
        border-color: rgb(255 255 255 / 18%) !important;
      }

      &:focus-within {
        border-color: #3b82f6 !important;
      }
    }

    :deep(.el-input__inner),
    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      font-size: 13px;
      color: #e2e8f0;

      &::placeholder {
        color: #475569;
      }
    }
  }

  .form-datepicker {
    :deep(.el-input__suffix) {
      color: #64748b;
    }

    &.datepicker--warn :deep(.el-input__inner) {
      color: #f59e0b !important;
    }
  }

  .form-textarea {
    :deep(.el-textarea__inner) {
      font-size: 13px;
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%);
      border: 1px solid rgb(255 255 255 / 10%);
      border-radius: 7px;
      box-shadow: none;
      transition: border-color 0.18s;

      &:hover {
        border-color: rgb(255 255 255 / 18%);
      }

      &:focus {
        border-color: #3b82f6;
      }

      &::placeholder {
        color: #475569;
      }
    }
  }

  // 只读广告平台展示
  .readonly-field {
    display: flex;
    align-items: center;
    min-height: 36px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: not-allowed;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 7px;
  }

  // 底部按钮
  .dialog-btn {
    padding: 8px 20px !important;
    border-radius: 8px !important;

    &--cancel {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;

      &:hover {
        color: #e2e8f0 !important;
        border-color: rgb(255 255 255 / 20%) !important;
      }
    }

    &--submit {
      color: #fff !important;
      background: #0d9488 !important;
      border: none !important;

      &:hover {
        filter: brightness(1.1);
      }
    }
  }
</style>
