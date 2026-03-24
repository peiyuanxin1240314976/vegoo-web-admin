<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑代理商' : '新增代理商'"
    width="560px"
    :close-on-click-modal="false"
    header-class="agency-form-dialog-hd"
    body-class="agency-form-dialog-bd"
    footer-class="agency-form-dialog-ft"
  >
    <!-- 编辑模式信息栏 -->
    <div v-if="isEdit" class="edit-info-bar">
      <div class="edit-info-item">
        <span class="edit-info-key">代理商ID</span>
        <span class="edit-info-val">{{ editData?.id }}</span>
      </div>
      <div class="edit-info-item">
        <span class="edit-info-key">广告平台</span>
        <span class="platform-chip" :style="getPlatformStyle(editData?.source ?? '')">
          {{ editData?.source }}
        </span>
      </div>
      <div class="edit-info-item">
        <span class="edit-info-key">合作开始</span>
        <span class="edit-info-val">{{ editData?.startDate || '--' }}</span>
      </div>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="agency-form">
      <!-- 代理商名称 -->
      <el-form-item label="代理商名称" prop="agencyName">
        <el-input
          v-model="form.agencyName"
          placeholder="请输入代理商名称"
          class="form-input"
          clearable
        />
      </el-form-item>

      <!-- 广告平台（新增时可选） -->
      <el-form-item v-if="!isEdit" label="广告平台" prop="source">
        <el-select v-model="form.source" placeholder="请选择广告平台" class="form-select" clearable>
          <el-option
            v-for="p in PLATFORM_CONFIGS"
            :key="p.value"
            :label="p.label"
            :value="p.value"
          />
        </el-select>
      </el-form-item>

      <!-- 合作模式 -->
      <el-form-item label="合作模式" prop="coopMode">
        <div class="radio-group">
          <div
            v-for="m in coopModeOptions"
            :key="m.value"
            :class="['radio-card', { 'radio-card--active': form.coopMode === m.value }]"
            @click="form.coopMode = m.value"
          >
            <div class="radio-dot-wrap">
              <span :class="['radio-dot', { 'radio-dot--checked': form.coopMode === m.value }]" />
            </div>
            <div class="radio-content">
              <div class="radio-label">{{ m.label }}</div>
              <div class="radio-desc">{{ m.desc }}</div>
            </div>
          </div>
        </div>
      </el-form-item>

      <!-- 联系人 & 联系电话 -->
      <div class="form-row">
        <el-form-item label="联系人" prop="contact" class="form-col">
          <el-input v-model="form.contact" placeholder="联系人姓名" class="form-input" clearable />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone" class="form-col">
          <el-input
            v-model="form.phone"
            placeholder="+86 138-0000-0000"
            class="form-input"
            clearable
          />
        </el-form-item>
      </div>

      <!-- 联系邮箱 -->
      <el-form-item label="联系邮箱" prop="email">
        <el-input
          v-model="form.email"
          placeholder="example@company.com"
          class="form-input"
          clearable
        />
      </el-form-item>

      <!-- 合作开始日期 & 合作到期日期 -->
      <div class="form-row">
        <el-form-item label="合作开始日期" prop="startDate" class="form-col">
          <el-date-picker
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
          <el-date-picker
            v-model="form.expireDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="form-datepicker"
            popper-class="dark-datepicker"
          />
        </el-form-item>
      </div>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
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
        {{ isEdit ? '保存修改' : '确认新增' }}
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AgencyItem, AgencyFormModel, AgencyCoopMode } from '../types'

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

  const coopModeOptions: Array<{ value: AgencyCoopMode; label: string; desc: string }> = [
    { value: '授权代理', label: '授权代理', desc: '通过代理商账号体系管理广告账户' },
    { value: '直接开户', label: '直接开户', desc: '通过平台直接开设广告账户' }
  ]

  const defaultForm = (): AgencyFormModel => ({
    agencyName: '',
    source: '',
    coopMode: '授权代理',
    contact: '',
    email: '',
    phone: '',
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
    email: [
      { required: true, message: '请输入联系邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
    ],
    phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }]
  }

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color, background: cfg.bg }
  }

  const handleCancel = () => emit('update:visible', false)

  const handleSubmit = async () => {
    await formRef.value?.validate()
    submitting.value = true
    try {
      // 此处对接 createAgency / updateAgency API
      await new Promise((r) => setTimeout(r, 600))
      emit('success', { ...form.value })
    } finally {
      submitting.value = false
    }
  }
</script>

<!-- 非 scoped：利用 :has() 定向覆盖 ElDialog 样式 -->
<style lang="scss">
  .el-dialog:has(.agency-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__header.agency-form-dialog-hd {
    padding: 18px 20px 16px;
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
    padding: 20px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.agency-form-dialog-bd) .el-dialog__footer.agency-form-dialog-ft {
    padding: 14px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  // ─── 编辑信息栏 ──────────────────────────────────────
  .edit-info-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: rgb(59 130 246 / 6%);
    border: 1px solid rgb(59 130 246 / 18%);
    border-radius: 8px;
  }

  .edit-info-item {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .edit-info-key {
    font-size: 12px;
    color: #64748b;
  }

  .edit-info-val {
    font-size: 13px;
    color: #93c5fd;
  }

  .platform-chip {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
  }

  // ─── 表单 ────────────────────────────────────────────
  .agency-form {
    :deep(.el-form-item__label) {
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
    }

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }
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
    :deep(.el-select__placeholder) {
      font-size: 13px;
      color: #e2e8f0;

      &::placeholder {
        color: #475569;
      }
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

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
  }

  .form-col {
    min-width: 0;
  }

  // ─── 合作模式 radio 卡片 ──────────────────────────────
  .radio-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .radio-card {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;
    transition: all 0.18s;

    &:hover {
      border-color: rgb(255 255 255 / 15%);
    }

    &--active {
      background: rgb(59 130 246 / 8%);
      border-color: rgb(59 130 246 / 35%);
    }
  }

  .radio-dot-wrap {
    flex-shrink: 0;
    padding-top: 2px;
  }

  .radio-dot {
    display: block;
    width: 14px;
    height: 14px;
    background: rgb(255 255 255 / 10%);
    border: 2px solid rgb(255 255 255 / 20%);
    border-radius: 50%;
    transition: all 0.18s;

    &--checked {
      background: #3b82f6;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgb(59 130 246 / 20%);
    }
  }

  .radio-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .radio-label {
    font-size: 13px;
    font-weight: 500;
    color: #e2e8f0;
  }

  .radio-desc {
    font-size: 11px;
    line-height: 1.4;
    color: #64748b;
  }

  // ─── 底部按钮 ────────────────────────────────────────
  .dialog-btn {
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
      background: #3b82f6 !important;
      border: none !important;

      &:hover {
        filter: brightness(1.1);
      }
    }
  }
</style>
