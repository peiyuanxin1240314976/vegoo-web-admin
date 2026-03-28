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

    <div class="oa-form">
      <!-- 广告平台 -->
      <div class="form-item" :class="{ 'is-error': errors.source }">
        <label class="form-label"><span class="req">*</span>广告平台</label>
        <div class="form-control">
          <el-select
            v-model="form.source"
            placeholder="请选择广告平台"
            class="form-select"
            @change="errors.source = ''"
          >
            <el-option
              v-for="p in PLATFORM_CONFIGS"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            >
              <span class="opt-platform">
                <span :style="{ color: p.color, fontWeight: 700, fontSize: '12px' }">{{
                  p.shortLabel
                }}</span>
                {{ p.label }}
              </span>
            </el-option>
          </el-select>
          <div v-if="errors.source" class="err-msg">{{ errors.source }}</div>
        </div>
      </div>

      <!-- 应用 -->
      <div class="form-item" :class="{ 'is-error': errors.app }">
        <label class="form-label"><span class="req">*</span>应用</label>
        <div class="form-control">
          <el-select
            v-model="form.app"
            placeholder="请选择应用"
            class="form-select"
            @change="errors.app = ''"
          >
            <el-option v-for="a in appOptions" :key="a" :label="a" :value="a" />
          </el-select>
          <div v-if="errors.app" class="err-msg">{{ errors.app }}</div>
        </div>
      </div>

      <!-- 投放平台 -->
      <div class="form-item">
        <label class="form-label"><span class="req">*</span>投放平台</label>
        <div class="form-control">
          <div class="radio-row">
            <label v-for="p in platformOptions" :key="p" class="radio-item">
              <span
                :class="['radio-dot', { 'radio-dot--checked': form.platform === p }]"
                @click="form.platform = p"
              />
              <span class="radio-label" @click="form.platform = p">{{ p }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 开户类型 -->
      <div class="form-item">
        <label class="form-label"><span class="req">*</span>开户类型</label>
        <div class="form-control">
          <div class="radio-row">
            <label v-for="t in accountTypeOptions" :key="t" class="radio-item">
              <span
                :class="['radio-dot', { 'radio-dot--checked': form.accountType === t }]"
                @click="form.accountType = t"
              />
              <span class="radio-label" @click="form.accountType = t">{{ t }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 归属代理商 -->
      <div class="form-item" :class="{ 'is-error': errors.agency }">
        <label class="form-label"><span class="req">*</span>归属代理商</label>
        <div class="form-control">
          <el-select
            v-model="form.agency"
            placeholder="请选择代理商"
            class="form-select"
            @change="errors.agency = ''"
          >
            <el-option v-for="a in agencyOptions" :key="a" :label="a" :value="a" />
          </el-select>
          <div v-if="errors.agency" class="err-msg">{{ errors.agency }}</div>
        </div>
      </div>

      <!-- 开户金额 -->
      <div class="form-item">
        <label class="form-label"><span class="req">*</span>开户金额</label>
        <div class="form-control">
          <el-input v-model="form.amount" placeholder="500" class="form-input">
            <template #prefix><span class="input-prefix">$</span></template>
          </el-input>
        </div>
      </div>

      <!-- 申请人 -->
      <div class="form-item" :class="{ 'is-error': errors.applicant }">
        <label class="form-label"><span class="req">*</span>申请人</label>
        <div class="form-control">
          <el-input
            v-model="form.applicant"
            placeholder="申请人姓名"
            class="form-input"
            clearable
            @input="errors.applicant = ''"
          />
          <div v-if="errors.applicant" class="err-msg">{{ errors.applicant }}</div>
        </div>
      </div>

      <!-- 分割线 -->
      <div class="section-divider">
        <span class="section-divider-text">广告账户信息</span>
        <span class="section-divider-hint">（开户后填写，可空置）</span>
      </div>

      <!-- 广告账户ID -->
      <div class="form-item form-item--nostar">
        <label class="form-label">账户ID</label>
        <div class="form-control">
          <el-input
            v-model="form.adAccountId"
            placeholder="平台分配的账户ID"
            class="form-input"
            clearable
          />
        </div>
      </div>

      <!-- 广告账户名称 -->
      <div class="form-item form-item--nostar">
        <label class="form-label">账户名称</label>
        <div class="form-control">
          <el-input
            v-model="form.adAccountName"
            placeholder="账户名称"
            class="form-input"
            clearable
          />
        </div>
      </div>

      <!-- 关联凭据 -->
      <div class="form-item form-item--nostar">
        <label class="form-label">关联凭据</label>
        <div class="form-control">
          <el-select v-model="form.credential" placeholder="请选择凭据" class="form-select">
            <el-option v-for="c in credentialOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
      </div>

      <!-- 备注 -->
      <div class="form-item form-item--nostar">
        <label class="form-label">备注</label>
        <div class="form-control">
          <el-input
            v-model="form.remark"
            type="textarea"
            placeholder="请输入备注信息"
            :rows="2"
            class="form-textarea"
            resize="none"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <span class="footer-tip">保存后自动推送飞书通知到广告账户群</span>
        <div class="footer-btns">
          <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel"
            >取消</ElButton
          >
          <ElButton
            round
            class="dialog-btn dialog-btn--submit"
            :loading="submitting"
            @click="handleSubmit"
            >保存</ElButton
          >
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive } from 'vue'
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
    source: '',
    app: '',
    platform: '安卓',
    accountType: '企业户',
    agency: '',
    amount: '',
    applicant: '',
    adAccountId: '',
    adAccountName: '',
    credential: '',
    remark: ''
  })

  const form = ref<OpenAccountFormModel>(defaultForm())
  const submitting = ref(false)
  const errors = reactive({ source: '', app: '', agency: '', applicant: '' })

  watch(
    () => props.visible,
    (v) => {
      if (v) {
        form.value = defaultForm()
        Object.assign(errors, { source: '', app: '', agency: '', applicant: '' })
      }
    }
  )

  const handleCancel = () => emit('update:visible', false)

  const handleSubmit = async () => {
    let valid = true
    if (!form.value.source) {
      errors.source = '请选择广告平台'
      valid = false
    }
    if (!form.value.app) {
      errors.app = '请选择应用'
      valid = false
    }
    if (!form.value.agency) {
      errors.agency = '请选择代理商'
      valid = false
    }
    if (!form.value.applicant.trim()) {
      errors.applicant = '请输入申请人'
      valid = false
    }
    if (!valid) return

    submitting.value = true
    try {
      await new Promise((r) => setTimeout(r, 600))
      emit('success', { ...form.value })
    } finally {
      submitting.value = false
    }
  }
</script>

<!-- 非 scoped -->
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
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.oa-form-dialog-bd) .el-dialog__body.oa-form-dialog-bd {
    max-height: 70vh;
    padding: 16px 20px 4px;
    overflow-y: auto;
    background: var(--cm-dialog-bg-inner);
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
    margin-bottom: 12px;
    font-size: 12px;
    color: #64748b;
  }

  .oa-form {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .form-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 9px 0;
    border-bottom: 1px solid rgb(255 255 255 / 4%);

    &:last-child {
      border-bottom: none;
    }
    &.is-error .form-label {
      color: #f87171;
    }
  }

  .form-label {
    flex-shrink: 0;
    width: 72px;
    padding-top: 6px;
    font-size: 12px;
    line-height: 1.4;
    color: #94a3b8;
    text-align: right;
  }

  .req {
    margin-right: 2px;
    color: #f87171;
  }

  .form-control {
    flex: 1;
    min-width: 0;
  }

  .form-input,
  .form-select {
    width: 100%;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 6px;
      box-shadow: none !important;
      transition: border-color 0.15s;
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

  .form-textarea {
    :deep(.el-textarea__inner) {
      font-size: 13px;
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%);
      border: 1px solid rgb(255 255 255 / 10%);
      border-radius: 6px;
      box-shadow: none;
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

  .input-prefix {
    font-size: 13px;
    color: #94a3b8;
  }

  .opt-platform {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  // radio
  .radio-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    padding-top: 5px;
  }

  .radio-item {
    display: flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }

  .radio-dot {
    display: inline-block;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
    background: transparent;
    border: 2px solid rgb(255 255 255 / 25%);
    border-radius: 50%;
    transition: all 0.15s;

    &--checked {
      background: #3b82f6;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgb(59 130 246 / 20%);
    }
  }

  .radio-label {
    font-size: 13px;
    color: #e2e8f0;
    user-select: none;
  }

  .err-msg {
    margin-top: 4px;
    font-size: 11px;
    color: #f87171;
  }

  // 分割线
  .section-divider {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 0 6px;
  }

  .section-divider-text {
    font-size: 12px;
    font-weight: 600;
    color: #0d9488;
    white-space: nowrap;
  }

  .section-divider-hint {
    font-size: 12px;
    color: #475569;
  }

  // footer
  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-tip {
    font-size: 11px;
    color: #475569;
  }

  .footer-btns {
    display: flex;
    gap: 8px;
  }

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
      background: #0d9488 !important;
      border: none !important;
      &:hover {
        filter: brightness(1.1);
      }
    }
  }
</style>
