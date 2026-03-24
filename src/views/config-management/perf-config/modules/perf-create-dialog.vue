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
        <div v-if="i < STEPS.length - 1" class="step-line" :class="i < currentStep && 'step-line--done'" />
      </div>
    </div>

    <!-- ══════ STEP 0: 基本信息 ══════════════════════════ -->
    <div v-if="currentStep === 0" class="step-body">
      <div class="step-section-title">基本信息</div>

      <el-form ref="form1Ref" :model="step1" :rules="rules1" label-position="top" class="pf-form">
        <!-- 应用名称 -->
        <el-form-item label="应用名称" prop="appName" required>
          <el-select
            v-model="step1.appName"
            filterable
            placeholder="请选择应用..."
            class="full-w"
            popper-class="pc-popper"
          >
            <el-option v-for="a in APP_LIST" :key="a" :value="a" :label="a">
              <div class="app-opt">
                <span class="app-opt-icon" :style="{ background: APP_ICON_COLORS[a] ?? '#475569' }">
                  {{ a.charAt(0) }}
                </span>
                {{ a }}
              </div>
            </el-option>
          </el-select>
          <div class="field-hint">应用列表来自应用管理</div>
        </el-form-item>

        <!-- 平台 + 广告平台 -->
        <div class="form-row-2">
          <el-form-item label="平台" prop="appPlatform" required>
            <div class="radio-group">
              <label
                v-for="p in APP_PLATFORMS"
                :key="p.value"
                :class="['radio-card', step1.appPlatform === p.value && 'radio-card--active']"
              >
                <input v-model="step1.appPlatform" type="radio" :value="p.value" class="hidden-radio" />
                {{ p.label }}
              </label>
            </div>
          </el-form-item>

          <el-form-item label="广告平台" prop="adPlatforms" required>
            <div class="ad-platform-tags">
              <span
                v-for="p in VISIBLE_AD_PLATFORMS"
                :key="p"
                :class="['ad-tag', step1.adPlatforms.includes(p) && 'ad-tag--active']"
                @click="toggleAdPlatform(p)"
              >
                {{ p }}
                <ElIcon v-if="step1.adPlatforms.includes(p)" class="ad-tag-check"><Check /></ElIcon>
              </span>
              <span class="ad-tag ad-tag--more" @click="showMorePlatforms = !showMorePlatforms">+ 更多</span>
            </div>
            <div v-if="showMorePlatforms" class="ad-platform-more">
              <span
                v-for="p in MORE_AD_PLATFORMS"
                :key="p"
                :class="['ad-tag', step1.adPlatforms.includes(p) && 'ad-tag--active']"
                @click="toggleAdPlatform(p)"
              >
                {{ p }}
              </span>
            </div>
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
              <input v-model="step1.allowMulti" type="radio" :value="false" class="hidden-radio" />否
            </label>
          </div>
          <div class="field-hint">是否允许一个优化师同时负责该应用的多个广告平台</div>
        </el-form-item>
      </el-form>

      <!-- 提示条 -->
      <div class="tip-bar">
        <ElIcon class="tip-icon"><InfoFilled /></ElIcon>
        应用名称 × 平台 × 广告平台 构成唯一配置记录，重复组合将提示已存在配置
      </div>
    </div>

    <!-- ══════ STEP 1: 绩效指标 ══════════════════════════ -->
    <div v-else-if="currentStep === 1" class="step-body">
      <!-- 已选摘要 -->
      <div class="selected-bar">
        <span class="selected-text">
          已选择：{{ step1.appName }} | {{ step1.appPlatform === 'android' ? '安卓' : 'iOS' }} | {{ step1.adPlatforms.join('、') }}
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
              >[ROI]</button>
              <button
                :class="['eval-btn', step2.evalMethod === 'CPA' && 'eval-btn--active']"
                @click="step2.evalMethod = 'CPA'"
              >[CPA]</button>
            </div>
          </el-form-item>

          <!-- 难度系数 -->
          <el-form-item label="难度系数" prop="difficultyFactor">
            <div class="input-suffix-wrap">
              <el-input-number
                v-model="step2.difficultyFactor"
                :min="0.1" :max="5" :step="0.1" :precision="1"
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
                :min="1" :max="365" :step="1"
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
                :min="0" :max="9999" :step="1"
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
              :min="0" :max="9999" :step="1"
              controls-position="right"
              class="full-w"
            />
            <span class="input-suffix">{{ step2.evalMethod === 'ROI' ? '%' : '$' }}</span>
          </div>
          <div class="field-hint">绩效基础门槛</div>
        </el-form-item>

        <!-- 校验提示 -->
        <div :class="['validate-hint', step2.targetRate > step2.minRate ? 'validate-hint--ok' : 'validate-hint--err']">
          <ElIcon><CircleCheckFilled v-if="step2.targetRate > step2.minRate" /><WarningFilled v-else /></ElIcon>
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
          <span class="preview-app-icon" :style="{ background: APP_ICON_COLORS[step1.appName] ?? '#475569' }">
            {{ step1.appName.charAt(0) }}
          </span>
          <div class="preview-app-info">
            <span class="preview-app-name">{{ step1.appName }}</span>
            <div class="preview-app-tags">
              <span class="preview-tag">{{ step1.appPlatform === 'android' ? '安卓' : 'iOS' }}</span>
              <span v-for="p in step1.adPlatforms" :key="p" class="preview-tag">{{ p }}</span>
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
            <span class="pi-value">{{ step2.minProfit != null ? '$' + step2.minProfit : '-' }}</span>
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
      <div class="step-section-title" style="margin-top: 20px;">保存方式</div>
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
      <ElButton
        v-if="currentStep < 2"
        class="btn-next"
        @click="handleNext"
      >
        下一步：{{ STEPS[currentStep + 1] }} →
      </ElButton>
      <ElButton
        v-else
        class="btn-save"
        @click="handleSave"
      >
        保存配置
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue'
  import {
    Check, InfoFilled, Edit, CircleCheckFilled, WarningFilled, Promotion
  } from '@element-plus/icons-vue'
  import { APP_LIST, AD_PLATFORMS, APP_ICON_COLORS } from '../mock/data'
  import type { PerfConfigItem, PerfStep1Form, PerfStep2Form, SaveMode } from '../types'
  import { getAppNow } from '@/utils/app-now'

  defineOptions({ name: 'PerfCreateDialog' })

  const props = defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void
    (e: 'success', item: PerfConfigItem): void
  }>()

  // ─── 步骤 ──────────────────────────────────────────────
  const STEPS = ['基本信息', '绩效指标', '确认保存']
  const currentStep = ref(0)
  const saveMode = ref<SaveMode>('draft')

  const stepClass = (i: number) => ({
    'step--done':    i < currentStep.value,
    'step--current': i === currentStep.value,
    'step--pending': i > currentStep.value
  })

  // ─── 静态选项 ──────────────────────────────────────────
  const APP_PLATFORMS = [
    { value: 'android', label: '安卓 🤖' },
    { value: 'ios',     label: 'iOS 🍎' }
  ]
  const RUN_STATUS_OPTIONS = [
    { value: 'running', label: '投放中' },
    { value: 'paused',  label: '未投放' },
    { value: 'stopped', label: '已停止' }
  ]
  const VISIBLE_AD_PLATFORMS = AD_PLATFORMS.slice(0, 6)
  const MORE_AD_PLATFORMS    = AD_PLATFORMS.slice(6)
  const showMorePlatforms    = ref(false)

  const toggleAdPlatform = (p: string) => {
    const idx = step1.adPlatforms.indexOf(p as any)
    if (idx >= 0) step1.adPlatforms.splice(idx, 1)
    else step1.adPlatforms.push(p as any)
  }

  // ─── 表单数据 ──────────────────────────────────────────
  const step1 = reactive<PerfStep1Form>({
    appName: '',
    appPlatform: 'android',
    adPlatforms: ['Google'],
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

  // ─── 校验规则 ──────────────────────────────────────────
  const form1Ref = ref()
  const form2Ref = ref()

  const rules1 = {
    appName:    [{ required: true, message: '请选择应用名称', trigger: 'change' }],
    adPlatforms:[{ required: true, type: 'array', min: 1, message: '请至少选择一个广告平台', trigger: 'change' }]
  }

  const rules2 = {
    evalDays:   [{ required: true, message: '请输入评估天数', trigger: 'blur' }],
    targetRate: [{ required: true, message: '请输入达标要求', trigger: 'blur' }],
    minRate:    [{ required: true, message: '请输入最低要求',  trigger: 'blur' }]
  }

  // ─── 计算属性 ──────────────────────────────────────────
  const runStatusLabel = computed(() =>
    ({ running: '投放中', paused: '未投放', stopped: '已停止' }[step1.runStatus])
  )

  // ─── 步骤切换 ──────────────────────────────────────────
  const handleNext = async () => {
    if (currentStep.value === 0) {
      await form1Ref.value?.validate()
      if (!step1.appName) { ElMessage.warning('请选择应用名称'); return }
      if (!step1.adPlatforms.length) { ElMessage.warning('请至少选择一个广告平台'); return }
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
      status: saveMode.value === 'publish' ? 'published' as const : 'draft' as const,
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

    const newItem: PerfConfigItem = {
      id: String(Date.now()),
      appName: step1.appName,
      appIcon: APP_ICON_COLORS[step1.appName] ?? '#475569',
      appPlatform: step1.appPlatform,
      adPlatform: step1.adPlatforms[0],
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
      appName: '', appPlatform: 'android', adPlatforms: ['Google'],
      runStatus: 'running', allowMulti: true
    })
    Object.assign(step2, {
      evalMethod: 'ROI', evalDays: 3, targetRate: 53, minRate: 50,
      difficultyFactor: 1.2, minProfit: null, extraCondition: ''
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
    align-items: center;
    justify-content: center;
    padding: 0 0 24px;
    gap: 0;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    position: relative;
    flex: 1;

    &:last-child .step-line { display: none; }
  }

  .step-circle {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 600;
    border: 2px solid;
    transition: all 0.25s;
    z-index: 1;
  }

  .step--done .step-circle    { border-color: var(--accent); background: var(--accent); color: #0b1120; }
  .step--current .step-circle { border-color: var(--accent); background: transparent; color: var(--accent); }
  .step--pending .step-circle { border-color: #334155; background: transparent; color: #334155; }

  .step-label {
    font-size: 12px;
    &.step--done    { color: var(--accent); }
    &.step--current { color: var(--accent); font-weight: 600; }
    &.step--pending { color: var(--text-muted); }
  }

  .step--done    .step-label { color: var(--accent); }
  .step--current .step-label { color: var(--accent); font-weight: 600; }
  .step--pending .step-label { color: var(--text-muted); }

  .step-line {
    position: absolute;
    top: 16px; left: 50%;
    width: 100%; height: 2px;
    background: #334155;
    z-index: 0;
    transition: background 0.25s;
    &--done { background: var(--accent); }
  }

  // ── 表单通用 ────────────────────────────────────────────
  .step-body { min-height: 320px; }

  .step-section-title {
    font-size: 14px; font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--cm-dialog-border);
  }

  .pf-form {
    :deep(.el-form-item__label) { color: var(--text-secondary) !important; font-size: 13px; margin-bottom: 4px; }
    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--cm-dialog-border) !important;
      box-shadow: none !important;
      color: var(--text-primary) !important;
      &:focus, &:focus-within { border-color: var(--accent) !important; }
    }
    :deep(.el-input-number .el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--cm-dialog-border) !important;
      box-shadow: none !important;
    }
  }

  .full-w  { width: 100%; }
  .half-w  { width: 50%; }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 20px;
  }

  .field-hint {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
    line-height: 1.4;
  }

  // ── Radio 卡片 ──────────────────────────────────────────
  .radio-group { display: flex; gap: 8px; flex-wrap: wrap; }

  .radio-card {
    padding: 6px 14px;
    font-size: 13px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 6px;
    cursor: pointer;
    user-select: none;
    transition: all 0.15s;

    &:hover { border-color: var(--accent); color: var(--accent); }
    &--active { border-color: var(--accent); color: var(--accent); background: rgb(45 212 191 / 10%); }
  }

  .hidden-radio { display: none; }

  // ── 广告平台 tags ───────────────────────────────────────
  .ad-platform-tags { display: flex; gap: 6px; flex-wrap: wrap; }

  .ad-tag {
    padding: 4px 10px;
    font-size: 12px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
    display: flex; gap: 4px; align-items: center;
    transition: all 0.15s;

    &:hover { border-color: var(--accent); color: var(--accent); }
    &--active { border-color: var(--accent); color: var(--accent); background: rgb(45 212 191 / 12%); }
    &--more { color: var(--text-muted); font-style: italic; }
  }

  .ad-tag-check { font-size: 10px; }

  .ad-platform-more {
    display: flex; gap: 6px; flex-wrap: wrap;
    margin-top: 6px;
    padding: 8px;
    background: rgb(255 255 255 / 2%);
    border: 1px dashed var(--cm-dialog-border);
    border-radius: 6px;
  }

  // ── 提示条 ──────────────────────────────────────────────
  .tip-bar {
    display: flex; gap: 8px; align-items: flex-start;
    padding: 10px 12px;
    margin-top: 16px;
    font-size: 12px; color: var(--text-secondary);
    background: rgb(59 130 246 / 8%);
    border: 1px solid rgb(59 130 246 / 20%);
    border-radius: 6px;
  }

  .tip-icon { color: #60a5fa; flex-shrink: 0; margin-top: 1px; }

  // ── Step2 ────────────────────────────────────────────────
  .selected-bar {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 14px; margin-bottom: 20px;
    font-size: 13px; color: var(--text-secondary);
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 8px;
  }

  .selected-text { flex: 1; }
  .selected-edit { color: var(--text-muted); cursor: pointer; &:hover { color: var(--accent); } }

  .eval-toggle { display: flex; gap: 0; }

  .eval-btn {
    flex: 1; padding: 8px 0;
    font-size: 13px; font-weight: 600;
    color: var(--text-muted);
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--cm-dialog-border); cursor: pointer;
    transition: all 0.15s;

    &:first-child { border-radius: 6px 0 0 6px; }
    &:last-child  { border-radius: 0 6px 6px 0; border-left: none; }

    &--active { color: var(--accent); background: rgb(45 212 191 / 12%); border-color: var(--accent); }
  }

  .input-suffix-wrap { display: flex; align-items: center; gap: 6px; }
  .input-suffix { font-size: 13px; color: var(--text-muted); white-space: nowrap; }

  .validate-hint {
    display: flex; gap: 6px; align-items: center;
    font-size: 12px; margin-top: 4px;
    justify-content: flex-end;
    &--ok  { color: #22c55e; }
    &--err { color: #ef4444; }
  }

  // ── Step3 预览卡 ────────────────────────────────────────
  .preview-card {
    padding: 18px;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 10px;
    margin-bottom: 4px;
  }

  .preview-card-header {
    display: flex; gap: 12px; align-items: flex-start;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--cm-dialog-border);
    margin-bottom: 14px;
  }

  .preview-app-icon {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; font-weight: 700; color: #fff;
    border-radius: 10px; flex-shrink: 0;
  }

  .preview-app-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
  .preview-app-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 4px; }
  .preview-tag {
    padding: 2px 7px; font-size: 11px;
    color: var(--text-secondary); background: rgb(255 255 255 / 6%); border-radius: 4px;
    &--run { color: #22c55e; background: rgb(34 197 94 / 12%); }
  }

  .preview-multi { margin-left: auto; font-size: 12px; color: var(--text-muted); }

  .preview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 20px;
  }

  .preview-item { display: flex; flex-direction: column; gap: 2px; }
  .pi-label { font-size: 11px; color: var(--text-muted); }
  .pi-value { font-size: 13px; color: var(--text-primary); &--accent { color: var(--accent); font-weight: 600; } }

  // ── 保存方式 ────────────────────────────────────────────
  .save-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .save-card {
    display: flex; gap: 12px; align-items: flex-start;
    padding: 16px;
    background: var(--cm-dialog-bg-inner);
    border: 1px solid var(--cm-dialog-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s;

    &:hover { border-color: var(--accent); }
    &--active { border-color: var(--accent); background: rgb(45 212 191 / 8%); }
  }

  .save-card-icon {
    font-size: 22px; flex-shrink: 0; margin-top: 2px;
    &--draft   { color: #f59e0b; }
    &--publish { color: var(--accent); }
  }

  .save-card-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
  .save-card-desc  { font-size: 12px; color: var(--text-muted); line-height: 1.4; }

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

  .btn-next, .btn-save {
    color: #0b1120 !important;
    font-weight: 600 !important;
    background: var(--accent) !important;
    border: none !important;
    border-radius: 8px !important;
    &:hover { filter: brightness(1.1); }
  }

  // ── app-opt ──────────────────────────────────────────────
  .app-opt { display: flex; gap: 8px; align-items: center; }
  .app-opt-icon {
    width: 22px; height: 22px; border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0;
  }
</style>
