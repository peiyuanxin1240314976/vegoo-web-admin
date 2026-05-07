<template>
  <el-dialog
    :model-value="visible"
    title="新建绩效配置"
    width="640px"
    :close-on-click-modal="false"
    class="perf-dialog"
    @update:model-value="emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <!-- ── 步骤条 ──────────────────────────────────────── -->
    <div class="stepper">
      <div v-for="(s, i) in STEPS" :key="i" class="step" :class="stepClass(i)">
        <div class="step-circle">
          <ElIcon v-if="i < currentStep"><Check /></ElIcon>
          <span v-else>{{ i + 1 }}</span>
        </div>
        <span class="step-label">{{ s }}</span>
        <div
          v-if="i < STEPS.length - 1"
          class="step-line"
          :class="i < currentStep && 'step-line--done'"
        />
      </div>
    </div>

    <!-- ══════ STEP 0: 基本信息 ══════════════════════════ -->
    <div v-if="currentStep === 0" class="step-body">
      <div class="step-section-title">基本信息</div>

      <el-form ref="form1Ref" :model="step1" :rules="rules1" label-position="top" class="pf-form">
        <!-- 应用 -->
        <el-form-item label="应用" prop="appId" required>
          <el-select
            v-model="step1.appId"
            filterable
            placeholder="请选择应用"
            class="full-w"
            popper-class="pc-popper"
            @change="onAppIdChange"
          >
            <el-option
              v-for="opt in metaAppOptions"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            >
              <div class="app-opt">
                <span class="app-opt-icon" :style="{ background: appOptionColor(opt.label) }">
                  {{ opt.label.charAt(0) }}
                </span>
                {{ opt.label }}
              </div>
            </el-option>
          </el-select>
        </el-form-item>

        <!-- 终端平台 + 广告平台 -->
        <div class="form-row-2">
          <el-form-item label="终端平台" prop="platform" required>
            <el-select v-model="step1.platform" placeholder="请选择终端平台" class="full-w">
              <el-option
                v-for="opt in metaPlatformOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="广告平台" prop="sourceList" required>
            <el-select
              v-model="step1.sourceList"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择广告平台（可多选）"
              class="full-w"
            >
              <el-option
                v-for="opt in metaSourceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <!-- 投放状态 -->
        <el-form-item label="当前投放状态" prop="runStatus" required>
          <div class="radio-group">
            <label
              v-for="s in RUN_STATUS_OPTIONS"
              :key="s.value"
              :class="['radio-card', step1.runStatus === s.value && 'radio-card--active']"
            >
              <input v-model="step1.runStatus" type="radio" :value="s.value" class="hidden-radio" />
              {{ s.label }}
            </label>
          </div>
        </el-form-item>

        <!-- 允许多投 -->
        <el-form-item label="允许多投" prop="allowMulti">
          <div class="radio-group">
            <label :class="['radio-card', step1.allowMulti === true && 'radio-card--active']">
              <input v-model="step1.allowMulti" type="radio" :value="true" class="hidden-radio" />是
            </label>
            <label :class="['radio-card', step1.allowMulti === false && 'radio-card--active']">
              <input
                v-model="step1.allowMulti"
                type="radio"
                :value="false"
                class="hidden-radio"
              />否
            </label>
          </div>
          <div class="field-hint">是否允许一个优化师同时负责该应用的多个广告平台</div>
        </el-form-item>
      </el-form>

      <!-- 提示条 -->
      <div class="tip-bar">
        <ElIcon class="tip-icon"><InfoFilled /></ElIcon>
        应用 × 终端平台 × 广告平台 构成唯一配置记录，重复组合将提示已存在配置
      </div>
    </div>

    <!-- ══════ STEP 1: 绩效指标 ══════════════════════════ -->
    <div v-else-if="currentStep === 1" class="step-body">
      <!-- 已选摘要 -->
      <div class="selected-bar">
        <span class="selected-text">
          已选择：{{ step1.appName }} | {{ platformStepLabel }} | {{ sourceStepLabels }}
        </span>
        <ElIcon class="selected-edit" @click="currentStep = 0"><Edit /></ElIcon>
      </div>

      <div class="step-section-title">绩效指标</div>

      <el-form ref="form2Ref" :model="step2" :rules="rules2" label-position="top" class="pf-form">
        <div class="form-row-2">
          <!-- 评估方式 -->
          <el-form-item label="评估方式" prop="evalMethod" required>
            <div class="eval-toggle">
              <button
                :class="['eval-btn', step2.evalMethod === 'ROI' && 'eval-btn--active']"
                @click="step2.evalMethod = 'ROI'"
                >[ROI]</button
              >
              <button
                :class="['eval-btn', step2.evalMethod === 'CPA' && 'eval-btn--active']"
                @click="step2.evalMethod = 'CPA'"
                >[CPA]</button
              >
            </div>
          </el-form-item>

          <!-- 难度系数 -->
          <el-form-item label="难度系数" prop="difficultyFactor">
            <div class="input-suffix-wrap">
              <el-input-number
                v-model="step2.difficultyFactor"
                :min="0.1"
                :max="5"
                :step="0.1"
                :precision="1"
                controls-position="right"
                class="full-w"
              />
              <span class="input-suffix">倍</span>
            </div>
            <div class="field-hint">用于绩效奖励计算的加权系数</div>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <!-- 评估天数 -->
          <el-form-item label="评估天数" prop="evalDays" required>
            <div class="input-suffix-wrap">
              <el-input-number
                v-model="step2.evalDays"
                :min="1"
                :max="365"
                :step="1"
                controls-position="right"
                class="full-w"
              />
              <span class="input-suffix">天</span>
            </div>
            <div class="field-hint">输入评估周期天数，如 1、3、7、30</div>
          </el-form-item>

          <!-- 最低利润 -->
          <el-form-item label="最低利润 ($)" prop="minProfit">
            <el-input v-model.number="step2.minProfit" placeholder="$" class="full-w">
              <template #prefix>$</template>
            </el-input>
            <div class="field-hint">如有要求，输入最低利润门槛，单位美元</div>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <!-- 达标要求 -->
          <el-form-item label="达标要求" prop="targetRate" required>
            <div class="input-suffix-wrap">
              <el-input-number
                v-model="step2.targetRate"
                :min="0"
                :max="9999"
                :step="1"
                controls-position="right"
                class="full-w"
              />
              <span class="input-suffix">{{ step2.evalMethod === 'ROI' ? '%' : '$' }}</span>
            </div>
            <div class="field-hint">绩效达标线，不低于最低要求</div>
          </el-form-item>

          <!-- 附加条件 -->
          <el-form-item label="附加条件" prop="extraCondition">
            <el-input
              v-model="step2.extraCondition"
              type="textarea"
              :rows="2"
              placeholder="如：CPA<=$15 且日耗>$5K，日韩为主等"
              class="full-w"
            />
            <div class="field-hint">可输入补充说明或特殊要求（选填）</div>
          </el-form-item>
        </div>

        <!-- 最低要求 -->
        <el-form-item label="最低要求" prop="minRate" required>
          <div class="input-suffix-wrap half-w">
            <el-input-number
              v-model="step2.minRate"
              :min="0"
              :max="9999"
              :step="1"
              controls-position="right"
              class="full-w"
            />
            <span class="input-suffix">{{ step2.evalMethod === 'ROI' ? '%' : '$' }}</span>
          </div>
          <div class="field-hint">绩效基础门槛</div>
        </el-form-item>

        <!-- 校验提示 -->
        <div
          :class="[
            'validate-hint',
            step2.targetRate > step2.minRate ? 'validate-hint--ok' : 'validate-hint--err'
          ]"
        >
          <ElIcon
            ><CircleCheckFilled v-if="step2.targetRate > step2.minRate" /><WarningFilled v-else
          /></ElIcon>
          达标要求 {{ step2.targetRate > step2.minRate ? '>' : '≤' }} 最低要求
          {{ step2.targetRate > step2.minRate ? '✓' : '（达标要求需大于最低要求）' }}
        </div>
      </el-form>
    </div>

    <!-- ══════ STEP 2: 确认保存 ══════════════════════════ -->
    <div v-else-if="currentStep === 2" class="step-body">
      <div class="step-section-title">配置预览</div>

      <!-- 预览卡 -->
      <div class="preview-card">
        <div class="preview-card-header">
          <span class="preview-app-icon" :style="{ background: appOptionColor(step1.appName) }">
            {{ (step1.appName || '?').charAt(0) }}
          </span>
          <div class="preview-app-info">
            <span class="preview-app-name">{{ step1.appName || '—' }}</span>
            <div class="preview-app-tags">
              <span class="preview-tag">{{ platformStepLabel }}</span>
              <span v-for="t in sourceStepLabelParts" :key="t" class="preview-tag">{{ t }}</span>
              <span class="preview-tag preview-tag--run">{{ runStatusLabel }}</span>
            </div>
          </div>
          <span class="preview-multi">允许多投：{{ step1.allowMulti ? '是' : '否' }}</span>
        </div>
        <div class="preview-grid">
          <div class="preview-item">
            <span class="pi-label">评估方式</span>
            <span class="pi-value pi-value--accent">{{ step2.evalMethod }}</span>
          </div>
          <div class="preview-item">
            <span class="pi-label">难度系数</span>
            <span class="pi-value">{{ step2.difficultyFactor }} 倍</span>
          </div>
          <div class="preview-item">
            <span class="pi-label">评估天数</span>
            <span class="pi-value">{{ step2.evalDays }} 天</span>
          </div>
          <div class="preview-item">
            <span class="pi-label">最低利润</span>
            <span class="pi-value">{{
              step2.minProfit != null ? '$' + step2.minProfit : '-'
            }}</span>
          </div>
          <div class="preview-item">
            <span class="pi-label">达标要求</span>
            <span class="pi-value pi-value--accent">
              {{ step2.evalMethod === 'ROI' ? step2.targetRate + '%' : '$' + step2.targetRate }}
            </span>
          </div>
          <div class="preview-item">
            <span class="pi-label">附加条件</span>
            <span class="pi-value">{{ step2.extraCondition || '-' }}</span>
          </div>
          <div class="preview-item">
            <span class="pi-label">最低要求</span>
            <span class="pi-value">
              {{ step2.evalMethod === 'ROI' ? step2.minRate + '%' : '$' + step2.minRate }}
            </span>
          </div>
        </div>
      </div>

      <!-- 保存方式 -->
      <div class="step-section-title" style="margin-top: 20px">保存方式</div>
      <div class="save-cards">
        <div
          :class="['save-card', saveMode === 'draft' && 'save-card--active']"
          @click="saveMode = 'draft'"
        >
          <ElIcon class="save-card-icon save-card-icon--draft"><Edit /></ElIcon>
          <div class="save-card-body">
            <div class="save-card-title">保存为草稿</div>
            <div class="save-card-desc">保存为 v1 草稿版本，可继续编辑后发布</div>
          </div>
        </div>
        <div
          :class="['save-card', saveMode === 'publish' && 'save-card--active']"
          @click="saveMode = 'publish'"
        >
          <ElIcon class="save-card-icon save-card-icon--publish"><Promotion /></ElIcon>
          <div class="save-card-body">
            <div class="save-card-title">直接发布</div>
            <div class="save-card-desc">直接发布为 v1 已发布版本，即刻生效</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Footer ──────────────────────────────────────── -->
    <template #footer>
      <ElButton class="btn-cancel" @click="emit('update:visible', false)">取消</ElButton>
      <ElButton v-if="currentStep > 0" class="btn-prev" @click="currentStep--">上一步</ElButton>
      <ElButton v-if="currentStep < 2" class="btn-next" @click="handleNext">
        下一步：{{ STEPS[currentStep + 1] }} →
      </ElButton>
      <ElButton v-else class="btn-save" @click="handleSave"> 保存配置 </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, watch, onMounted } from 'vue'
  import { ElMessage, type FormRules } from 'element-plus'
  import {
    Check,
    InfoFilled,
    Edit,
    CircleCheckFilled,
    WarningFilled,
    Promotion
  } from '@element-plus/icons-vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import { APP_ICON_COLORS } from '../mock/data'
  import type { PerfConfigItem, PerfStep1Form, PerfStep2Form, SaveMode } from '../types'
  import { getAppNow } from '@/utils/app-now'

  defineOptions({ name: 'PerfCreateDialog' })

  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void
    (e: 'success', item: PerfConfigItem): void
  }>()

  const cockpitMetaStore = useCockpitMetaFilterStore()

  const metaAppOptions = computed(() => cockpitMetaStore.data?.appOptions ?? [])
  const metaPlatformOptions = computed(() => cockpitMetaStore.data?.platformOptions ?? [])
  const metaSourceOptions = computed(() => cockpitMetaStore.data?.sourceOptions ?? [])

  function optionLabel(options: CockpitMetaOptionItem[], value: string): string {
    if (!value) return ''
    return options.find((o) => o.value === value)?.label ?? value
  }

  function appOptionColor(label: string) {
    if (!label) return '#475569'
    return APP_ICON_COLORS[label] ?? '#475569'
  }

  const step1 = reactive<PerfStep1Form>({
    appId: '',
    appName: '',
    platform: '',
    sourceList: [],
    runStatus: 'running',
    allowMulti: true
  })

  const step2 = reactive<PerfStep2Form>({
    evalMethod: 'ROI',
    evalDays: 3,
    targetRate: 53,
    minRate: 50,
    difficultyFactor: 1.2,
    minProfit: null,
    extraCondition: ''
  })

  const platformStepLabel = computed(
    () => optionLabel(metaPlatformOptions.value, step1.platform) || step1.platform || '—'
  )

  const sourceStepLabels = computed(() =>
    step1.sourceList
      .map((c) => optionLabel(metaSourceOptions.value, c) || c)
      .filter(Boolean)
      .join('、')
  )

  const sourceStepLabelParts = computed(() =>
    step1.sourceList.map((c) => optionLabel(metaSourceOptions.value, c) || c).filter(Boolean)
  )

  function applyStep1DefaultsFromMeta() {
    const apps = metaAppOptions.value
    const plats = metaPlatformOptions.value
    const srcs = metaSourceOptions.value
    if (!step1.appId && apps[0]) {
      step1.appId = apps[0].value
      step1.appName = apps[0].label
    }
    if (!step1.platform && plats[0]) step1.platform = plats[0].value
    if (!step1.sourceList.length && srcs[0]) step1.sourceList = [srcs[0].value]
  }

  function onAppIdChange() {
    const o = metaAppOptions.value.find((x) => x.value === step1.appId)
    step1.appName = o?.label ?? step1.appId
  }

  watch(
    () => props.visible,
    (v) => {
      if (v) {
        void cockpitMetaStore.ensureLoaded().then(() => applyStep1DefaultsFromMeta())
      }
    }
  )

  onMounted(() => {
    void cockpitMetaStore.ensureLoaded().then(() => applyStep1DefaultsFromMeta())
  })

  // ─── 步骤 ──────────────────────────────────────────────
  const STEPS = ['基本信息', '绩效指标', '确认保存']
  const currentStep = ref(0)
  const saveMode = ref<SaveMode>('draft')

  const stepClass = (i: number) => ({
    'step--done': i < currentStep.value,
    'step--current': i === currentStep.value,
    'step--pending': i > currentStep.value
  })

  // ─── 静态选项 ──────────────────────────────────────────
  const RUN_STATUS_OPTIONS = [
    { value: 'running', label: '投放中' },
    { value: 'paused', label: '未投放' },
    { value: 'stopped', label: '已停止' }
  ]

  // ─── 校验规则 ──────────────────────────────────────────
  const form1Ref = ref()
  const form2Ref = ref()

  const rules1: FormRules = {
    appId: [{ required: true, message: '请选择应用', trigger: 'change' }],
    platform: [{ required: true, message: '请选择终端平台', trigger: 'change' }],
    sourceList: [
      {
        required: true,
        type: 'array' as const,
        min: 1,
        message: '请至少选择一个广告平台',
        trigger: 'change'
      }
    ]
  }

  const rules2: FormRules = {
    evalDays: [{ required: true, message: '请输入评估天数', trigger: 'blur' }],
    targetRate: [{ required: true, message: '请输入达标要求', trigger: 'blur' }],
    minRate: [{ required: true, message: '请输入最低要求', trigger: 'blur' }]
  }

  // ─── 计算属性 ──────────────────────────────────────────
  const runStatusLabel = computed(
    () => ({ running: '投放中', paused: '未投放', stopped: '已停止' })[step1.runStatus]
  )

  // ─── 步骤切换 ──────────────────────────────────────────
  const handleNext = async () => {
    if (currentStep.value === 0) {
      await form1Ref.value?.validate()
      if (!step1.appId) {
        ElMessage.warning('请选择应用')
        return
      }
      if (!step1.platform) {
        ElMessage.warning('请选择终端平台')
        return
      }
      if (!step1.sourceList.length) {
        ElMessage.warning('请至少选择一个广告平台')
        return
      }
    }
    if (currentStep.value === 1) {
      if (step2.targetRate <= step2.minRate) {
        ElMessage.warning('达标要求必须大于最低要求')
        return
      }
    }
    currentStep.value++
  }

  // ─── 保存 ──────────────────────────────────────────────
  const handleSave = () => {
    const now = getAppNow()
    const pad = (n: number) => String(n).padStart(2, '0')
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

    const newVersion = {
      version: 1,
      status: saveMode.value === 'publish' ? ('published' as const) : ('draft' as const),
      publishedAt: dateStr,
      publishedBy: 'admin',
      evalMethod: step2.evalMethod,
      evalDays: step2.evalDays,
      targetRate: step2.targetRate,
      minRate: step2.minRate,
      difficultyFactor: step2.difficultyFactor,
      minProfit: step2.minProfit,
      extraCondition: step2.extraCondition,
      isActive: true
    }

    const primarySource = step1.sourceList[0] ?? ''
    const newItem: PerfConfigItem = {
      id: String(Date.now()),
      appId: step1.appId,
      appName: step1.appName,
      appIcon: appOptionColor(step1.appName),
      platform: step1.platform,
      source: primarySource,
      sourceList: [...step1.sourceList],
      runStatus: step1.runStatus,
      allowMulti: step1.allowMulti,
      activeVersion: newVersion,
      versions: [newVersion]
    }

    emit('success', newItem)
    emit('update:visible', false)
  }

  // ─── 重置 ──────────────────────────────────────────────
  const handleClosed = () => {
    currentStep.value = 0
    saveMode.value = 'draft'
    Object.assign(step1, {
      appId: '',
      appName: '',
      platform: '',
      sourceList: [],
      runStatus: 'running',
      allowMulti: true
    })
    void cockpitMetaStore.ensureLoaded().then(() => applyStep1DefaultsFromMeta())
    Object.assign(step2, {
      evalMethod: 'ROI',
      evalDays: 3,
      targetRate: 53,
      minRate: 50,
      difficultyFactor: 1.2,
      minProfit: null,
      extraCondition: ''
    })
  }
</script>

<style lang="scss" scoped>
  .el-dialog {
    --cm-dialog-bg: #0f1829;
    --cm-dialog-bg-inner: #131c2e;
    --cm-dialog-border: rgb(255 255 255 / 8%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
  }

  // ── 步骤条 ──────────────────────────────────────────────
  .stepper {
    display: flex;
    gap: 0;
    align-items: center;
    justify-content: center;
    padding: 0 0 24px;
  }

  .step {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    align-items: center;

    &:last-child .step-line {
      display: none;
    }
  }

  .step-circle {
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 14px;
    font-weight: 600;
    border: 2px solid;
    border-radius: 50%;
    transition: all 0.25s;
  }

  .step--done .step-circle {
    color: #0b1120;
    background: var(--accent);
    border-color: var(--accent);
  }

  .step--current .step-circle {
    color: var(--accent);
    background: transparent;
    border-color: var(--accent);
  }

  .step--pending .step-circle {
    color: #334155;
    background: transparent;
    border-color: #334155;
  }

  .step-label {
    font-size: 12px;

    &.step--done {
      color: var(--accent);
    }

    &.step--current {
      font-weight: 600;
      color: var(--accent);
    }

    &.step--pending {
      color: var(--text-muted);
    }
  }

  .step--done .step-label {
    color: var(--accent);
  }

  .step--current .step-label {
    font-weight: 600;
    color: var(--accent);
  }

  .step--pending .step-label {
    color: var(--text-muted);
  }

  .step-line {
    position: absolute;
    top: 16px;
    left: 50%;
    z-index: 0;
    width: 100%;
    height: 2px;
    background: #334155;
    transition: background 0.25s;

    &--done {
      background: var(--accent);
    }
  }

  // ── 表单通用 ────────────────────────────────────────────
  .step-body {
    min-height: 320px;
  }

  .step-section-title {
    padding-bottom: 8px;
    margin-bottom: 16px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .pf-form {
    :deep(.el-form-item__label) {
      margin-bottom: 4px;
      font-size: 13px;
      color: var(--text-secondary) !important;
    }

    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      color: var(--text-primary) !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--cm-dialog-border) !important;
      box-shadow: none !important;

      &:focus,
      &:focus-within {
        border-color: var(--accent) !important;
      }
    }

    :deep(.el-input-number .el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--cm-dialog-border) !important;
      box-shadow: none !important;
    }
  }

  .full-w {
    width: 100%;
  }

  .half-w {
    width: 50%;
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
  }

  .field-hint {
    margin-top: 4px;
    font-size: 11px;
    line-height: 1.4;
    color: var(--text-muted);
  }

  // ── Radio 卡片 ──────────────────────────────────────────
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .radio-card {
    padding: 6px 14px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: var(--accent);
      border-color: var(--accent);
    }

    &--active {
      color: var(--accent);
      background: rgb(45 212 191 / 10%);
      border-color: var(--accent);
    }
  }

  .hidden-radio {
    display: none;
  }

  // ── 广告平台 tags ───────────────────────────────────────
  .ad-platform-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .ad-tag {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    user-select: none;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      color: var(--accent);
      border-color: var(--accent);
    }

    &--active {
      color: var(--accent);
      background: rgb(45 212 191 / 12%);
      border-color: var(--accent);
    }

    &--more {
      font-style: italic;
      color: var(--text-muted);
    }
  }

  .ad-tag-check {
    font-size: 10px;
  }

  .ad-platform-more {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 8px;
    margin-top: 6px;
    background: rgb(255 255 255 / 2%);
    border: 1px dashed var(--cm-dialog-border);
    border-radius: 6px;
  }

  // ── 提示条 ──────────────────────────────────────────────
  .tip-bar {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 10px 12px;
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-secondary);
    background: rgb(59 130 246 / 8%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 6px;
  }

  .tip-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: #60a5fa;
  }

  // ── Step2 ────────────────────────────────────────────────
  .selected-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 14px;
    margin-bottom: 20px;
    font-size: 13px;
    color: var(--text-secondary);
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 8px;
  }

  .selected-text {
    flex: 1;
  }

  .selected-edit {
    color: var(--text-muted);
    cursor: pointer;

    &:hover {
      color: var(--accent);
    }
  }

  .eval-toggle {
    display: flex;
    gap: 0;
  }

  .eval-btn {
    flex: 1;
    padding: 8px 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--cm-dialog-border);
    transition: all 0.15s;

    &:first-child {
      border-radius: 6px 0 0 6px;
    }

    &:last-child {
      border-left: none;
      border-radius: 0 6px 6px 0;
    }

    &--active {
      color: var(--accent);
      background: rgb(45 212 191 / 12%);
      border-color: var(--accent);
    }
  }

  .input-suffix-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .input-suffix {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
  }

  .validate-hint {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
    margin-top: 4px;
    font-size: 12px;

    &--ok {
      color: #22c55e;
    }

    &--err {
      color: #ef4444;
    }
  }

  // ── Step3 预览卡 ────────────────────────────────────────
  .preview-card {
    padding: 18px;
    margin-bottom: 4px;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 10px;
  }

  .preview-card-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding-bottom: 14px;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .preview-app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    border-radius: 10px;
  }

  .preview-app-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .preview-app-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 4px;
  }

  .preview-tag {
    padding: 2px 7px;
    font-size: 11px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 6%);
    border-radius: 4px;

    &--run {
      color: #22c55e;
      background: rgb(34 197 94 / 12%);
    }
  }

  .preview-multi {
    margin-left: auto;
    font-size: 12px;
    color: var(--text-muted);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
  }

  .preview-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pi-label {
    font-size: 11px;
    color: var(--text-muted);
  }

  .pi-value {
    font-size: 13px;
    color: var(--text-primary);

    &--accent {
      font-weight: 600;
      color: var(--accent);
    }
  }

  // ── 保存方式 ────────────────────────────────────────────
  .save-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .save-card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 16px;
    cursor: pointer;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 10px;
    transition: all 0.15s;

    &:hover {
      border-color: var(--accent);
    }

    &--active {
      background: rgb(45 212 191 / 8%);
      border-color: var(--accent);
    }
  }

  .save-card-icon {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 22px;

    &--draft {
      color: #f59e0b;
    }

    &--publish {
      color: var(--accent);
    }
  }

  .save-card-title {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .save-card-desc {
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-muted);
  }

  // ── Footer 按钮 ──────────────────────────────────────────
  .btn-cancel {
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--cm-dialog-border) !important;
    border-radius: 8px !important;
  }

  .btn-prev {
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--cm-dialog-border) !important;
    border-radius: 8px !important;
  }

  .btn-next,
  .btn-save {
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover {
      filter: brightness(1.1);
    }
  }

  // ── app-opt ──────────────────────────────────────────────
  .app-opt {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .app-opt-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 5px;
  }
</style>
