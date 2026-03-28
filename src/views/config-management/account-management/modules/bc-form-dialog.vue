<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑 BC' : '新建 BC'"
    width="480px"
    :close-on-click-modal="false"
    header-class="bc-form-dialog-hd"
    body-class="bc-form-dialog-bd"
    footer-class="bc-form-dialog-ft"
  >
    <el-form ref="formRef" :model="form" :rules="rules" class="bc-form">
      <!-- 广告平台 -->
      <div class="form-item" :class="{ 'is-error': errors.source }">
        <label class="form-label"><span class="req">*</span>广告平台</label>
        <div class="form-control">
          <el-select
            v-if="!isEdit"
            v-model="form.source"
            placeholder="请选择广告平台"
            class="form-select"
            @change="errors.source = ''"
          >
            <el-option v-for="p in bcPlatforms" :key="p.value" :label="p.label" :value="p.value" />
          </el-select>
          <div v-else class="readonly-field" :style="getPlatformStyle(form.source)">{{
            form.source
          }}</div>
          <div v-if="errors.source" class="err-msg">{{ errors.source }}</div>
        </div>
      </div>

      <!-- BM ID -->
      <div class="form-item" :class="{ 'is-error': errors.bmId }">
        <label class="form-label"><span class="req">*</span>BM ID</label>
        <div class="form-control">
          <el-input
            v-if="!isEdit"
            v-model="form.bmId"
            placeholder="请输入BM ID"
            class="form-input"
            clearable
            @input="errors.bmId = ''"
          />
          <div v-else class="readonly-field readonly-field--id">{{ form.bmId }}</div>
          <div v-if="errors.bmId" class="err-msg">{{ errors.bmId }}</div>
        </div>
      </div>

      <!-- BM名称 -->
      <div class="form-item" :class="{ 'is-error': errors.bmName }">
        <label class="form-label"><span class="req">*</span>BM名称</label>
        <div class="form-control">
          <el-input
            v-model="form.bmName"
            placeholder="请输入BM名称"
            class="form-input"
            clearable
            @input="errors.bmName = ''"
          />
          <div v-if="errors.bmName" class="err-msg">{{ errors.bmName }}</div>
        </div>
      </div>

      <!-- 归属组 -->
      <div class="form-item" :class="{ 'is-error': errors.group }">
        <label class="form-label"><span class="req">*</span>归属组</label>
        <div class="form-control">
          <el-select
            v-model="form.group"
            placeholder="请选择归属组"
            class="form-select"
            @change="errors.group = ''"
          >
            <el-option v-for="g in groupOptions" :key="g" :label="g" :value="g" />
          </el-select>
          <div v-if="errors.group" class="err-msg">{{ errors.group }}</div>
        </div>
      </div>

      <!-- 状态 -->
      <div class="form-item">
        <label class="form-label"><span class="req">*</span>状态</label>
        <div class="form-control">
          <el-select v-model="form.status" class="form-select">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </div>
      </div>

      <!-- 开户主体 -->
      <div class="form-item">
        <label class="form-label"><span class="req">*</span>开户主体</label>
        <div class="form-control">
          <div class="radio-row">
            <label v-for="o in ownerOptions" :key="o" class="radio-item">
              <span
                :class="['radio-dot', { 'radio-dot--checked': form.ownerType === o }]"
                @click="form.ownerType = o"
              />
              <span class="radio-label" @click="form.ownerType = o">{{ o }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 管理员 -->
      <div class="form-item" :class="{ 'is-error': errors.manager }">
        <label class="form-label"><span class="req">*</span>管理员</label>
        <div class="form-control">
          <el-select
            v-model="form.manager"
            placeholder="请选择管理员"
            class="form-select"
            @change="errors.manager = ''"
          >
            <el-option v-for="m in managerOptions" :key="m" :label="m" :value="m" />
          </el-select>
          <div v-if="errors.manager" class="err-msg">{{ errors.manager }}</div>
        </div>
      </div>

      <!-- 封户记录 -->
      <div class="form-item">
        <label class="form-label"><span class="req">*</span>封户记录</label>
        <div class="form-control">
          <div class="radio-row">
            <label class="radio-item">
              <span
                :class="['radio-dot', { 'radio-dot--checked': form.banRecord === '无' }]"
                @click="form.banRecord = '无'"
              />
              <span class="radio-label" @click="form.banRecord = '无'">无</span>
            </label>
            <label class="radio-item">
              <span
                :class="['radio-dot', { 'radio-dot--checked': form.banRecord === '有' }]"
                @click="form.banRecord = '有'"
              />
              <span class="radio-label" @click="form.banRecord = '有'">有</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 封户记录说明（条件显示） -->
      <div v-if="form.banRecord === '有'" class="form-item form-item--nostar">
        <label class="form-label">封户记录说明</label>
        <div class="form-control">
          <el-input
            v-model="form.banDesc"
            type="textarea"
            placeholder="请输入封户记录说明"
            :rows="2"
            class="form-textarea"
            resize="none"
          />
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
            :rows="3"
            class="form-textarea"
            resize="none"
          />
        </div>
      </div>
    </el-form>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
      <ElButton
        round
        class="dialog-btn dialog-btn--submit"
        :loading="submitting"
        @click="handleSubmit"
      >
        {{ isEdit ? '保存' : '保存' }}
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch, reactive } from 'vue'
  import type { FormInstance } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import type { BcItem, BcFormModel, BcOwnerType } from '../types'

  defineOptions({ name: 'BcFormDialog' })

  const props = defineProps<{
    visible: boolean
    editData: BcItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: BcFormModel]
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const isEdit = computed(() => !!props.editData?.id)

  const bcPlatforms = PLATFORM_CONFIGS.filter((p) => ['Meta Ads', 'TikTok Ads'].includes(p.value))

  const statusOptions = ['健康', '可用', '不再使用', '封禁', '其他']
  const ownerOptions: BcOwnerType[] = ['企业户', '个人户', '小额广告户']
  const managerOptions = ['张三', '李四', '王五', '赵六']
  const groupOptions = ['Google组', 'TikTok组', 'Agency-A组', 'Agency-B组']

  const defaultForm = (): BcFormModel => ({
    source: '',
    bmId: '',
    bmName: '',
    group: '',
    status: '健康',
    ownerType: '企业户',
    manager: '',
    banRecord: '无',
    banDesc: '',
    remark: ''
  })

  const form = ref<BcFormModel>(defaultForm())
  const formRef = ref<FormInstance>()
  const submitting = ref(false)
  const errors = reactive({ source: '', bmId: '', bmName: '', group: '', manager: '' })

  watch(
    () => props.visible,
    (v) => {
      if (v) {
        if (props.editData) {
          form.value = {
            source: props.editData.source,
            bmId: props.editData.bmId,
            bmName: props.editData.bmName,
            group: props.editData.group,
            status: props.editData.status,
            ownerType: props.editData.ownerType,
            manager: props.editData.manager,
            banRecord: props.editData.banRecord,
            banDesc: props.editData.banDesc,
            remark: props.editData.remark
          }
        } else {
          form.value = defaultForm()
        }
        Object.assign(errors, { source: '', bmId: '', bmName: '', group: '', manager: '' })
      }
    }
  )

  const rules = {}

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    return cfg ? { color: cfg.color } : {}
  }

  const handleCancel = () => emit('update:visible', false)

  const handleSubmit = async () => {
    // 简单校验
    let valid = true
    if (!isEdit.value && !form.value.source) {
      errors.source = '请选择广告平台'
      valid = false
    }
    if (!isEdit.value && !form.value.bmId.trim()) {
      errors.bmId = '请输入BM ID'
      valid = false
    }
    if (!form.value.bmName.trim()) {
      errors.bmName = '请输入BM名称'
      valid = false
    }
    if (!form.value.group) {
      errors.group = '请选择归属组'
      valid = false
    }
    if (!form.value.manager) {
      errors.manager = '请选择管理员'
      valid = false
    }
    if (!valid) return

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
  .el-dialog:has(.bc-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.bc-form-dialog-bd) .el-dialog__header.bc-form-dialog-hd {
    padding: 20px 24px 16px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.bc-form-dialog-bd) .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.bc-form-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.bc-form-dialog-bd) .el-dialog__body.bc-form-dialog-bd {
    padding: 16px 24px 8px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.bc-form-dialog-bd) .el-dialog__footer.bc-form-dialog-ft {
    padding: 14px 24px 20px;
    text-align: right;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  .bc-form {
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
    width: 80px;
    padding-top: 6px;
    font-size: 13px;
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
      transition: border-color 0.15s;

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

  .readonly-field {
    display: flex;
    align-items: center;
    min-height: 34px;
    padding: 0 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: not-allowed;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 6px;

    &--id {
      font-family: 'SF Mono', monospace;
      font-size: 12px;
      color: #64748b;
    }
  }

  // radio
  .radio-row {
    display: flex;
    gap: 20px;
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

  // 底部按钮
  .dialog-btn {
    padding: 8px 20px !important;
    border-radius: 7px !important;

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
