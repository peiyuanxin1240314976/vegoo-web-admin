<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑成本系数' : '新增成本系数'"
    width="560px"
    :close-on-click-modal="false"
    header-class="cc-form-hd"
    body-class="cc-form-bd"
    footer-class="cc-form-ft"
    @update:model-value="emit('update:visible', $event)"
    @close="handleClose"
  >
    <!-- 编辑模式副标题 -->
    <div v-if="isEdit && editData" class="dialog-subtitle">
      {{ editData.platformName }} · n_source: {{ editData.nSource }}
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <div class="form-grid">
        <!-- 广告平台 -->
        <el-form-item label="广告平台 (n_source)" prop="nSource" class="form-item">
          <el-select
            v-if="!isEdit"
            v-model="form.nSource"
            placeholder="请选择广告平台"
            class="full-width"
          >
            <el-option v-for="p in platformOptions" :key="p.nSource" :value="p.nSource">
              <div class="platform-opt">
                <span class="platform-icon" :style="{ background: p.color }">{{ p.abbr }}</span>
                <span>{{ p.name }} ({{ p.nSource }})</span>
              </div>
            </el-option>
            <template #prefix>
              <div v-if="selectedPlatform" class="select-prefix">
                <span class="platform-icon" :style="{ background: selectedPlatform.color }">
                  {{ selectedPlatform.abbr }}
                </span>
              </div>
            </template>
          </el-select>
          <!-- 编辑时锁定 -->
          <div v-else class="locked-platform">
            <span
              class="platform-icon"
              :style="{
                background: editData ? getPlatformBySource(editData.nSource).color : '#475569'
              }"
            >
              {{ editData ? getPlatformBySource(editData.nSource).abbr : '' }}
            </span>
            <span class="locked-name">
              {{ editData?.platformName }} ({{ editData?.nSource }})
            </span>
            <span class="lock-icon">🔒</span>
          </div>
        </el-form-item>

        <!-- 生效起始日期 -->
        <el-form-item label="生效起始日期 (t_start)" prop="tstart" class="form-item">
          <AppDatePicker
            v-model="form.tstart"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <!-- 折算比例 -->
        <el-form-item label="折算比例 (d_cost_ratio)" prop="dcostRatio" class="form-item">
          <el-input
            v-model="form.dcostRatio"
            placeholder="0.001 ~ 9.999"
            type="number"
            step="0.001"
          />
          <div class="field-hint">范围：0.001 ~ 9.999，3位小数</div>
        </el-form-item>

        <!-- 安装成本 -->
        <el-form-item label="安装成本 (d_install_cost)" prop="dinstallCost" class="form-item">
          <el-input
            v-model="form.dinstallCost"
            placeholder="0.00001 ~ 9.99999"
            type="number"
            step="0.00001"
          />
          <div class="field-hint">范围：0.00001 ~ 9.99999，5位小数</div>
        </el-form-item>
      </div>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选备注信息" />
      </el-form-item>

      <!-- 编辑模式：当前生效值 -->
      <div v-if="isEdit && editData" class="current-values">
        <span class="cv-label">当前生效值</span>
        <span class="cv-text">
          折算比例: {{ editData.dcostRatio.toFixed(3) }} | 安装成本:
          {{ editData.dinstallCost.toFixed(5) }}
        </span>
      </div>

      <!-- 新增模式：提示 -->
      <div v-if="!isEdit" class="info-tip">
        <span class="info-icon">ℹ</span>
        生效起始日期为 2000-01-01 表示永久生效，修改将对该平台所有新计算生效
      </div>
    </el-form>

    <template #footer>
      <ElButton round @click="emit('update:visible', false)">取消</ElButton>
      <ElButton round type="primary" :loading="saving" @click="handleSave">
        {{ isEdit ? '保存修改' : '保存' }}
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import { AD_PLATFORMS, getPlatform } from '../mock/data'
  import type { AdPlatform, CostCoefficientFormModel, CostCoefficientItem } from '../types'

  defineOptions({ name: 'CostFormDialog' })

  interface Props {
    visible: boolean
    editData?: CostCoefficientItem | null
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [payload: CostCoefficientFormModel, isEdit: boolean]
  }>()

  const isEdit = computed(() => !!props.editData)
  const cockpitMetaFilterStore = useCockpitMetaFilterStore()

  const platformOptions = computed<AdPlatform[]>(() => {
    const sourceOptions = cockpitMetaFilterStore.data?.sourceOptions ?? []
    const mapped = sourceOptions
      .map((item) => {
        const nSource = Number(item.value)
        if (!Number.isFinite(nSource) || nSource <= 0) return null
        const fallback = getPlatform(nSource)
        return {
          nSource,
          name: item.label || fallback.name,
          abbr: fallback.abbr,
          color: fallback.color
        } as AdPlatform
      })
      .filter((item): item is AdPlatform => item !== null)
    return mapped.length > 0 ? mapped : AD_PLATFORMS.map((item) => ({ ...item }))
  })

  const getPlatformBySource = (nSource: number): AdPlatform => {
    return platformOptions.value.find((item) => item.nSource === nSource) ?? getPlatform(nSource)
  }

  const formRef = ref<FormInstance>()
  const saving = ref(false)

  const form = reactive<CostCoefficientFormModel>({
    nSource: null,
    tstart: '2000-01-01',
    dcostRatio: '',
    dinstallCost: '',
    remark: ''
  })

  const selectedPlatform = computed(() => (form.nSource ? getPlatformBySource(form.nSource) : null))

  watch(
    () => props.editData,
    (data) => {
      if (data) {
        form.nSource = data.nSource
        form.tstart = data.tstart
        form.dcostRatio = data.dcostRatio
        form.dinstallCost = data.dinstallCost
        form.remark = data.remark
      } else {
        form.nSource = null
        form.tstart = '2000-01-01'
        form.dcostRatio = ''
        form.dinstallCost = ''
        form.remark = ''
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (!cockpitMetaFilterStore.data) {
      void cockpitMetaFilterStore.ensureLoaded()
    }
  })

  const rules: FormRules = {
    nSource: [{ required: true, message: '请选择广告平台', trigger: 'change' }],
    tstart: [{ required: true, message: '请选择生效起始日期', trigger: 'change' }],
    dcostRatio: [
      { required: true, message: '请输入折算比例', trigger: 'blur' },
      {
        validator: (_: unknown, value: number | '', cb: (e?: Error) => void) => {
          const v = Number(value)
          if (!value && value !== 0) {
            cb(new Error('请输入折算比例'))
            return
          }
          if (v < 0.001 || v > 9.999) {
            cb(new Error('范围 0.001 ~ 9.999'))
            return
          }
          cb()
        },
        trigger: 'blur'
      }
    ],
    dinstallCost: [
      { required: true, message: '请输入安装成本', trigger: 'blur' },
      {
        validator: (_: unknown, value: number | '', cb: (e?: Error) => void) => {
          const v = Number(value)
          if (!value && value !== 0) {
            cb(new Error('请输入安装成本'))
            return
          }
          if (v < 0.00001 || v > 9.99999) {
            cb(new Error('范围 0.00001 ~ 9.99999'))
            return
          }
          cb()
        },
        trigger: 'blur'
      }
    ]
  }

  const handleSave = async () => {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    saving.value = false
    emit('success', { ...form }, isEdit.value)
    emit('update:visible', false)
    ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
  }

  const handleClose = () => {
    formRef.value?.resetFields()
  }
</script>

<style lang="scss" scoped>
  .dialog-subtitle {
    margin: -4px 0 16px;
    font-size: 13px;
    font-weight: 600;
    color: #2dd4bf;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 16px;
  }

  .form-item {
    width: 100%;
  }

  .full-width {
    width: 100%;
  }

  .platform-opt {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .platform-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 5px;
  }

  .select-prefix {
    display: flex;
    align-items: center;
  }

  .locked-platform {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 6px;
  }

  .locked-name {
    flex: 1;
    font-size: 13px;
    color: #94a3b8;
  }

  .lock-icon {
    font-size: 14px;
    color: #64748b;
  }

  .field-hint {
    margin-top: 4px;
    font-size: 11px;
    color: #64748b;
  }

  .current-values {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    margin-top: 4px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 8px;
  }

  .cv-label {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  .cv-text {
    font-size: 13px;
    color: #94a3b8;
  }

  .info-tip {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 14px;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.6;
    color: #93c5fd;
    background: rgb(59 130 246 / 10%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 8px;
  }

  .info-icon {
    flex-shrink: 0;
    font-style: normal;
    font-weight: 700;
  }
</style>

<style lang="scss">
  .el-dialog:has(.cc-form-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.cc-form-bd) .el-dialog__header.cc-form-hd {
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .el-dialog:has(.cc-form-bd) .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cc-form-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover {
      color: var(--cm-dialog-text-primary) !important;
    }
  }

  .el-dialog:has(.cc-form-bd) .el-dialog__body.cc-form-bd {
    padding: 20px 24px 8px;
    background: var(--cm-dialog-bg-inner);

    .el-form-item__label {
      font-size: 12px;
      color: #94a3b8;
    }

    .el-input__wrapper,
    .el-textarea__inner,
    .el-select__wrapper {
      color: #e2e8f0;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: #2dd4bf !important;
      }
    }

    .el-input__inner,
    .el-textarea__inner {
      color: #e2e8f0;
    }

    .el-date-editor .el-input__wrapper {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      box-shadow: none !important;
    }
  }

  .el-dialog:has(.cc-form-bd) .el-dialog__footer.cc-form-ft {
    padding: 12px 24px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
  }
</style>
