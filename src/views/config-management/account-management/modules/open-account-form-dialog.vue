<template>
  <el-dialog
    v-model="dialogVisible"
    title="新建开户记录"
    width="500px"
    :close-on-click-modal="false"
    header-class="oa-form-dialog-hd"
    body-class="oa-form-dialog-bd"
    footer-class="oa-form-dialog-ft"
  >
    <p class="dialog-subtitle">登记广告平台开户信息，开户完成后自动推送飞书通知</p>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="oa-form">
      <!-- 广告平台 -->
      <el-form-item label="广告平台" prop="source">
        <el-select v-model="form.source" placeholder="请选择广告平台" class="form-select" clearable>
          <el-option
            v-for="p in PLATFORM_CONFIGS"
            :key="p.value"
            :label="p.label"
            :value="p.value"
          >
            <span class="opt-platform">
              <span :style="{ color: p.color, fontWeight: 700, fontSize: '12px' }">{{ p.shortLabel }}</span>
              {{ p.label }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 应用 -->
      <el-form-item label="应用" prop="app">
        <el-select v-model="form.app" placeholder="请选择应用" class="form-select" clearable>
          <el-option v-for="a in appOptions" :key="a" :label="a" :value="a" />
        </el-select>
      </el-form-item>

      <!-- 平台 -->
      <el-form-item label="平台" prop="platform">
        <div class="radio-inline">
          <label
            v-for="p in platformOptions"
            :key="p"
            :class="['radio-item', { 'radio-item--active': form.platform === p }]"
            @click="form.platform = p"
          >
            <span :class="['radio-dot', { 'radio-dot--checked': form.platform === p }]" />
            {{ p }}
          </label>
        </div>
      </el-form-item>

      <!-- 开户类型 -->
      <el-form-item label="开户类型" prop="accountType">
        <div class="radio-inline">
          <label
            v-for="t in accountTypeOptions"
            :key="t"
            :class="['radio-item', { 'radio-item--active': form.accountType === t }]"
            @click="form.accountType = t"
          >
            <span :class="['radio-dot', { 'radio-dot--checked': form.accountType === t }]" />
            {{ t }}
          </label>
        </div>
      </el-form-item>

      <!-- 归属代理商 -->
      <el-form-item label="归属代理商" prop="agency">
        <el-select v-model="form.agency" placeholder="请选择代理商" class="form-select" clearable>
          <el-option v-for="a in agencyOptions" :key="a" :label="a" :value="a" />
        </el-select>
      </el-form-item>

      <!-- 开户金额 -->
      <el-form-item label="开户金额" prop="amount">
        <el-input v-model="form.amount" placeholder="$500" class="form-input">
          <template #prefix><span class="input-prefix">$</span></template>
        </el-input>
      </el-form-item>

      <!-- 申请人 -->
      <el-form-item label="申请人" prop="applicant">
        <el-input v-model="form.applicant" placeholder="申请人姓名" class="form-input" clearable />
      </el-form-item>

      <!-- 广告账户信息分割线 -->
      <div class="section-divider">
        <span class="section-divider-text">广告账户信息</span>
        <span class="section-divider-hint">（开户后填写，可空置）</span>
      </div>

      <!-- 广告账户ID -->
      <el-form-item label="广告账户ID" prop="adAccountId">
        <el-input v-model="form.adAccountId" placeholder="平台分配的账户ID" class="form-input" clearable />
      </el-form-item>

      <!-- 广告账户名称 -->
      <el-form-item label="广告账户名称" prop="adAccountName">
        <el-input v-model="form.adAccountName" placeholder="账户名称" class="form-input" clearable />
      </el-form-item>

      <!-- 关联凭据 -->
      <el-form-item label="关联凭据" prop="credential">
        <el-select v-model="form.credential" placeholder="请选择凭据 分配后可进行API调用" class="form-select" clearable>
          <el-option v-for="c in credentialOptions" :key="c" :label="c" :value="c" />
        </el-select>
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          type="textarea"
          placeholder=""
          :rows="3"
          class="form-textarea"
          resize="none"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-tip">保存后自动推送飞书通知到广告账户群</span>
        <div class="footer-btns">
          <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
          <ElButton round class="dialog-btn dialog-btn--submit" :loading="submitting" @click="handleSubmit">
            保存
          </ElButton>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import { appOptions, agencyOptions, credentialOptions } from '../mock/data'
  import type { OpenAccountFormModel } from '../types'

  defineOptions({ name: 'OpenAccountFormDialog' })

  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: OpenAccountFormModel]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const platformOptions = ['安卓', 'iOS', '网页'] as const
  const accountTypeOptions = ['企业户', '个人户', '小额广告户'] as const

  const defaultForm = (): OpenAccountFormModel => ({
    source: '', app: '', platform: '安卓', accountType: '企业户',
    agency: '', amount: '', applicant: '',
    adAccountId: '', adAccountName: '', credential: '', remark: ''
  })

  const form = ref<OpenAccountFormModel>(defaultForm())
  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  watch(() => props.visible, (v) => {
    if (v) { form.value = defaultForm(); formRef.value?.clearValidate() }
  })

  const rules: FormRules = {
    source:      [{ required: true, message: '请选择广告平台', trigger: 'change' }],
    app:         [{ required: true, message: '请选择应用', trigger: 'change' }],
    platform:    [{ required: true, message: '请选择平台', trigger: 'change' }],
    accountType: [{ required: true, message: '请选择开户类型', trigger: 'change' }],
    agency:      [{ required: true, message: '请选择代理商', trigger: 'change' }],
    applicant:   [{ required: true, message: '请输入申请人', trigger: 'blur' }]
  }

  const handleCancel = () => emit('update:visible', false)
  const handleSubmit = async () => {
    await formRef.value?.validate()
    submitting.value = true
    try {
      await new Promise((r) => setTimeout(r, 600))
      emit('success', { ...form.value })
    } finally {
      submitting.value = false
    }
  }
</script>

<style lang="scss">
  .el-dialog:has(.oa-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }
  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__header.oa-form-dialog-hd {
    padding: 18px 20px 12px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }
  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__title {
    font-size: 15px; font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }
  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }
  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__body.oa-form-dialog-bd {
    padding: 16px 20px 4px;
    background: var(--cm-dialog-bg-inner);
    max-height: 70vh;
    overflow-y: auto;
  }
  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__footer.oa-form-dialog-ft {
    padding: 12px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  .dialog-subtitle {
    margin-bottom: 14px;
    font-size: 12px;
    color: #64748b;
  }

  .oa-form {
    :deep(.el-form-item__label) { font-size: 12px; font-weight: 500; color: #94a3b8; }
    :deep(.el-form-item) { margin-bottom: 14px; }
  }

  .form-select, .form-input {
    width: 100%;
    :deep(.el-input__wrapper), :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px; box-shadow: none !important;
      &:focus-within { border-color: #3b82f6 !important; }
    }
    :deep(.el-input__inner), :deep(.el-select__placeholder) {
      font-size: 13px; color: #e2e8f0;
      &::placeholder { color: #475569; }
    }
  }

  .form-textarea {
    :deep(.el-textarea__inner) {
      font-size: 13px; color: #e2e8f0;
      background: rgb(255 255 255 / 4%);
      border: 1px solid rgb(255 255 255 / 10%);
      border-radius: 7px; box-shadow: none;
      &:focus { border-color: #3b82f6; }
      &::placeholder { color: #475569; }
    }
  }

  .input-prefix { font-size: 13px; color: #94a3b8; }

  .opt-platform { display: flex; gap: 8px; align-items: center; }

  .radio-inline { display: flex; gap: 16px; flex-wrap: wrap; }

  .radio-item {
    display: flex; gap: 6px; align-items: center;
    font-size: 13px; color: #94a3b8; cursor: pointer;
    &--active { color: #e2e8f0; }
  }

  .radio-dot {
    display: block; width: 14px; height: 14px;
    background: rgb(255 255 255 / 10%);
    border: 2px solid rgb(255 255 255 / 20%);
    border-radius: 50%; transition: all 0.15s;
    &--checked { background: #0d9488; border-color: #0d9488; }
  }

  .section-divider {
    display: flex; gap: 8px; align-items: center;
    margin: 4px 0 14px;
  }

  .section-divider-text {
    font-size: 12px; font-weight: 600;
    color: #0d9488; white-space: nowrap;
  }

  .section-divider-hint {
    font-size: 12px; color: #475569;
  }

  .dialog-footer {
    display: flex; align-items: center; justify-content: space-between;
  }

  .footer-tip { font-size: 11px; color: #475569; }

  .footer-btns { display: flex; gap: 8px; }

  .dialog-btn {
    border-radius: 8px !important;
    &--cancel {
      color: #94a3b8 !important; background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      &:hover { color: #e2e8f0 !important; border-color: rgb(255 255 255 / 20%) !important; }
    }
    &--submit {
      color: #fff !important; background: #0d9488 !important; border: none !important;
      &:hover { filter: brightness(1.1); }
    }
  }
</style>
