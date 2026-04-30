<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑应用分配' : '新建应用分配'"
    class="assignment-form-dialog"
    width="580px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 编辑模式：应用信息锁定条 -->
    <div v-if="isEdit && editData" class="app-lock-bar">
      <div class="app-lock-icon" :style="{ background: editData.iconColor }">
        {{ getAppInitial(editData.appName) }}
      </div>
      <span class="app-lock-name">{{ getDisplayAppName(editData.appName) }}</span>
      <span class="lock-sep">|</span>
      <span class="app-lock-meta">{{ editData.platform === 'Android' ? '安卓' : 'iOS' }}</span>
      <span class="lock-sep">|</span>
      <span class="app-lock-meta">{{ editData.adPlatform }}</span>
      <span class="lock-sep">|</span>
      <ElIcon class="lock-icon"><Lock /></ElIcon>
      <span class="lock-tip">应用信息不可修改</span>
    </div>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="0" class="assignment-form">
      <!-- ── 应用信息（仅新建） ─────────────────────────── -->
      <template v-if="!isEdit">
        <div class="form-section">
          <div class="section-title">应用信息</div>
          <div class="form-item">
            <div class="form-label">应用名称 <span class="required">*</span></div>
            <div class="form-hint">仅显示已配置绩效目标的应用</div>
            <el-form-item prop="appId">
              <el-select
                v-model="form.appId"
                filterable
                placeholder="请选择应用..."
                class="dark-select full-width"
                @change="handleAppChange"
              >
                <el-option
                  v-for="opt in assignableApps"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                >
                  <span class="app-opt-icon" :style="{ background: opt.iconColor }">
                    {{ getAppInitial(opt.appName) }}
                  </span>
                  <span class="app-opt-label">{{ getDisplayAppName(opt.appName) }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <div class="form-item">
              <div class="form-label">平台 <span class="required">*</span></div>
              <el-form-item prop="platform">
                <div class="platform-radio-group">
                  <label
                    :class="['platform-radio', form.platform === 'Android' ? 'is-checked' : '']"
                    @click="form.platform = 'Android'"
                  >
                    <span class="radio-dot" />Android（安卓）
                  </label>
                  <label
                    :class="['platform-radio', form.platform === 'iOS' ? 'is-checked' : '']"
                    @click="form.platform = 'iOS'"
                  >
                    <span class="radio-dot" />iOS
                  </label>
                </div>
              </el-form-item>
            </div>
            <div class="form-item">
              <div class="form-label">广告平台 <span class="required">*</span></div>
              <div class="form-hint">根据应用的绩效配置自动筛选</div>
              <el-form-item prop="source">
                <el-select
                  v-model="form.source"
                  placeholder="请选择广告平台..."
                  class="dark-select full-width"
                >
                  <el-option
                    v-for="opt in sourceOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>
      </template>

      <!-- ── 优化师分配 ──────────────────────────────────── -->
      <div class="form-section">
        <div class="section-title">优化师分配</div>
        <div class="form-item">
          <div class="form-label">负责优化师 <span class="required">*</span></div>
          <div class="form-hint">仅可选择一位优化师</div>
          <el-form-item prop="optimizer">
            <el-select
              v-model="form.optimizer"
              placeholder="请选择优化师..."
              class="dark-select full-width"
            >
              <el-option
                v-for="opt in optimizerOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <!-- 变更指示器（仅编辑且有变更时显示） -->
          <div v-if="isEdit && optimizerChanged" class="change-indicator">
            原：{{ editData?.optimizer }} → {{ form.optimizer }}
          </div>
        </div>
      </div>

      <!-- ── 分配备注 ────────────────────────────────────── -->
      <div class="form-section">
        <div class="section-title">分配备注</div>
        <div class="form-item">
          <el-form-item prop="note">
            <el-input
              v-model="form.note"
              type="textarea"
              :rows="3"
              placeholder="可输入分配说明或备注（选填）"
              class="dark-textarea"
              resize="none"
            />
          </el-form-item>
        </div>
      </div>

      <!-- ── 绩效配置 ────────────────────────────────────── -->
      <div class="form-section form-section--last">
        <div class="section-title">绩效配置</div>
        <div class="form-item">
          <div class="form-label">绩效配置版本 <span class="required">*</span></div>
          <div v-if="!isEdit" class="form-hint">可选择应用任意已发布版本为绩效计算基准</div>
          <el-form-item prop="configVersionId">
            <!-- 自定义版本选择器 -->
            <div
              ref="versionSelectorRef"
              class="version-selector"
              v-click-outside-custom="closeVersionDrop"
            >
              <button
                ref="versionTriggerRef"
                :class="['version-trigger', versionDropOpen ? 'is-open' : '']"
                type="button"
                @click="toggleVersionDrop"
              >
                <template v-if="selectedVersion">
                  <span class="trigger-label">
                    {{ selectedVersion.version }} {{ selectedVersion.status }}
                    <span v-if="selectedVersion.isActive" class="active-star">★ 当前激活</span>
                  </span>
                </template>
                <span v-else class="trigger-placeholder">请选择绩效配置版本...</span>
                <el-icon class="trigger-arrow"><ArrowDown /></el-icon>
              </button>

              <!-- 用 Teleport 挂到 body，避免被 dialog overflow 裁剪 -->
              <Teleport to="body">
                <div
                  v-show="versionDropOpen"
                  class="version-dropdown-portal"
                  :style="dropdownStyle"
                >
                  <!-- 空状态：未选择应用 -->
                  <div v-if="availableVersions.length === 0" class="ver-empty">
                    <span v-if="!isEdit">请先选择应用，版本列表将自动加载</span>
                    <span v-else>暂无可用版本</span>
                  </div>
                  <div
                    v-for="ver in availableVersions"
                    :key="ver.id"
                    :class="[
                      'version-option',
                      ver.status === '已归档' ? 'version-option--archived' : '',
                      form.configVersionId === ver.id ? 'version-option--selected' : ''
                    ]"
                    @click="ver.status !== '已归档' && selectVersion(ver)"
                  >
                    <div class="ver-opt-left">
                      <span class="ver-radio">
                        <span v-if="form.configVersionId === ver.id" class="ver-radio-dot" />
                      </span>
                    </div>
                    <div class="ver-opt-body">
                      <div class="ver-opt-top">
                        <span class="ver-label">{{ ver.version }}</span>
                        <span :class="['ver-status', `ver-status--${verStatusClass(ver.status)}`]">
                          {{ ver.status }}
                        </span>
                        <span v-if="ver.isActive" class="ver-active-badge">★ 当前激活 ★</span>
                        <span v-if="ver.status === '已归档'" class="ver-archived-badge"
                          >已归档</span
                        >
                        <el-icon v-if="form.configVersionId === ver.id" class="ver-check">
                          <Check />
                        </el-icon>
                      </div>
                      <div class="ver-opt-meta">
                        {{ ver.date }} | {{ ver.creator }} | {{ ver.evalMethod }}
                        {{ ver.evalDays }}天 达标{{ ver.targetRate }} 最低{{ ver.minRate }}
                      </div>
                    </div>
                  </div>
                </div>
              </Teleport>
            </div>
          </el-form-item>
        </div>

        <!-- 已选配置预览 -->
        <!-- <div v-if="selectedVersion" class="config-preview">
          <div class="preview-header">
            <span class="preview-title">已选配置预览：</span>
            <button class="preview-link" type="button">查看完整配置 →</button>
          </div>
          <div class="preview-tags">
            <span class="preview-tag">{{ selectedVersion.evalMethod }}</span>
            <span class="preview-tag">{{ selectedVersion.evalDays }}天</span>
            <span class="preview-tag">达标：{{ selectedVersion.targetRate }}</span>
            <span class="preview-tag">最低：{{ selectedVersion.minRate }}</span>
            <span class="preview-tag">系数：{{ selectedVersion.difficulty }}</span>
          </div>
        </div> -->

        <!-- 草稿版本警告 -->
        <div v-if="selectedVersion?.status === '草稿'" class="draft-warning">
          <el-icon><Warning /></el-icon>
          注意：选择草稿版本将导致分配状态为"草稿配置"，建议选择已发布版本
        </div>
      </div>

      <!-- ── 变更原因（编辑模式，有变更时必填） ──────────── -->
      <div v-if="isEdit" class="form-section form-section--reason">
        <div class="form-item">
          <div class="form-label">
            变更原因
            <span v-if="hasChanges" class="required">*</span>
          </div>
          <el-form-item prop="changeReason">
            <el-input
              v-model="form.changeReason"
              type="textarea"
              :rows="3"
              placeholder="请输入本次变更的原因，将被记录到变更日志中"
              :class="['dark-textarea', hasChanges ? 'dark-textarea--highlight' : '']"
              resize="none"
            />
          </el-form-item>
          <div v-if="hasChanges" class="change-count-hint">
            检测到 {{ changeCount }} 处变更，变更原因为必填项
          </div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="form-footer">
        <ElButton round class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton round class="btn-submit" @click="handleSubmit">
          {{ isEdit ? '保存变更' : '确认分配' }}
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, nextTick } from 'vue'
  import { Lock, ArrowDown, Check, Warning } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import type {
    AppAssignmentItem,
    AssignmentAssignableSelectOption,
    AssignmentFormModel,
    PerformanceVersion
  } from '../types'

  // 自定义 click-outside 指令
  const vClickOutsideCustom = {
    mounted(
      el: HTMLElement & { _clickOutside?: (e: MouseEvent) => void },
      binding: { value: () => void }
    ) {
      el._clickOutside = (event: MouseEvent) => {
        if (!el.contains(event.target as Node)) binding.value()
      }
      document.addEventListener('mousedown', el._clickOutside)
    },
    unmounted(el: HTMLElement & { _clickOutside?: (e: MouseEvent) => void }) {
      if (el._clickOutside) document.removeEventListener('mousedown', el._clickOutside)
    }
  }

  defineOptions({ name: 'AssignmentFormDialog' })

  const props = withDefaults(
    defineProps<{
      visible: boolean
      editData?: AppAssignmentItem | null
      sourceOptions: CockpitMetaOptionItem[]
      optimizerOptions: { label: string; value: string }[]
      assignableApps: AssignmentAssignableSelectOption[]
      loadVersions: (appId: string) => Promise<PerformanceVersion[]>
    }>(),
    {
      editData: null,
      sourceOptions: () => [],
      optimizerOptions: () => [],
      assignableApps: () => [],
      loadVersions: () => Promise.resolve([])
    }
  )

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: AssignmentFormModel]
  }>()

  // ─── 基础状态 ────────────────────────────────────────────
  const formRef = ref<FormInstance>()
  const versionTriggerRef = ref<HTMLButtonElement>()
  const versionSelectorRef = ref<HTMLDivElement>()
  const versionDropOpen = ref(false)
  const dropdownStyle = ref<Record<string, string>>({})

  const closeVersionDrop = () => {
    versionDropOpen.value = false
  }

  const toggleVersionDrop = () => {
    versionDropOpen.value = !versionDropOpen.value
    if (versionDropOpen.value) {
      nextTick(() => {
        const rect = versionTriggerRef.value?.getBoundingClientRect()
        if (!rect) return
        dropdownStyle.value = {
          position: 'fixed',
          top: `${rect.bottom + 4}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          zIndex: '9999'
        }
      })
    }
  }

  const isEdit = computed(() => !!props.editData)

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const defaultForm = (): AssignmentFormModel => ({
    appId: '',
    platform: 'Android',
    source: '',
    optimizer: '',
    note: '',
    configVersionId: '',
    changeReason: ''
  })

  const form = reactive<AssignmentFormModel>(defaultForm())

  // 编辑时当前可用版本列表（从 editData 取）
  const availableVersions = ref<PerformanceVersion[]>([])

  watch(
    () => props.editData,
    (val) => {
      Object.assign(form, defaultForm())
      versionDropOpen.value = false
      if (val) {
        form.appId = val.appId
        form.platform = val.platform
        form.source = val.source
        form.optimizer = val.optimizer
        form.note = val.note
        form.configVersionId = val.configVersionId
        availableVersions.value = val.availableVersions
      } else {
        availableVersions.value = []
      }
    },
    { immediate: true }
  )

  // 新建时，切换 app 时请求绩效版本列表
  const handleAppChange = async () => {
    form.source = ''
    form.configVersionId = ''
    if (!form.appId) {
      availableVersions.value = []
      return
    }
    availableVersions.value = await props.loadVersions(form.appId)
    const active = availableVersions.value.find((v) => v.isActive)
    if (active) form.configVersionId = active.id
  }

  const selectedVersion = computed(
    () => availableVersions.value.find((v) => v.id === form.configVersionId) ?? null
  )

  const selectVersion = (ver: PerformanceVersion) => {
    form.configVersionId = ver.id
    versionDropOpen.value = false
  }

  const verStatusClass = (status: string) =>
    ({ 已发布: 'published', 草稿: 'draft', 已归档: 'archived' })[status] ?? 'published'

  const getDisplayAppName = (appName?: string | null) => (appName?.trim() ? appName : '未命名应用')
  const getAppInitial = (appName?: string | null) => getDisplayAppName(appName).charAt(0)

  // ─── 变更检测（编辑模式） ─────────────────────────────────
  const optimizerChanged = computed(
    () => isEdit.value && form.optimizer !== props.editData?.optimizer
  )
  const noteChanged = computed(() => isEdit.value && form.note !== props.editData?.note)
  const versionChanged = computed(
    () => isEdit.value && form.configVersionId !== props.editData?.configVersionId
  )
  const hasChanges = computed(
    () => optimizerChanged.value || noteChanged.value || versionChanged.value
  )
  const changeCount = computed(
    () => [optimizerChanged.value, noteChanged.value, versionChanged.value].filter(Boolean).length
  )

  // ─── 表单验证 ────────────────────────────────────────────
  const rules = computed<FormRules>(() => ({
    appId: [{ required: !isEdit.value, message: '请选择应用', trigger: 'change' }],
    platform: [{ required: !isEdit.value, message: '请选择平台', trigger: 'change' }],
    source: [{ required: !isEdit.value, message: '请选择广告平台', trigger: 'change' }],
    optimizer: [{ required: true, message: '请选择负责优化师', trigger: 'change' }],
    configVersionId: [{ required: true, message: '请选择绩效配置版本', trigger: 'change' }],
    changeReason: [
      {
        validator: (_rule, value, callback) => {
          if (isEdit.value && hasChanges.value && !value?.trim()) {
            callback(new Error('检测到变更，请填写变更原因'))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }))

  // ─── 事件处理 ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate((valid) => {
      if (valid) emit('success', { ...form })
    })
  }

  const handleClose = () => {
    emit('update:visible', false)
    formRef.value?.resetFields()
    versionDropOpen.value = false
  }
</script>

<style lang="scss">
  .assignment-form-dialog {
    --afd-accent: var(--el-color-primary);
    --afd-accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --afd-border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --afd-border-soft: color-mix(in srgb, white 8%, transparent);
    --afd-surface: color-mix(in srgb, var(--default-box-color) 88%, black 8%);
    --afd-surface-2: color-mix(in srgb, var(--default-box-color) 78%, black 12%);
    --afd-text: var(--text-primary);
    --afd-text-2: var(--text-secondary);
    --afd-text-3: var(--text-tertiary);
    --afd-danger: var(--art-danger);
    --afd-warning: var(--art-warning);

    .el-dialog {
      overflow: hidden;
      background: linear-gradient(180deg, var(--afd-surface), var(--afd-surface-2)) !important;
      border: 1px solid var(--afd-border);
      border-radius: 12px !important;
      box-shadow:
        0 32px 80px color-mix(in srgb, black 62%, transparent),
        0 0 0 1px color-mix(in srgb, var(--el-color-primary) 9%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 7%, transparent) !important;
    }

    .el-dialog__header {
      padding: 18px 24px 16px;
      margin: 0;
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--default-box-color) 64%, transparent),
        color-mix(in srgb, var(--default-box-color) 46%, transparent)
      );
      border-bottom: 1px solid var(--afd-border);

      &::after {
        display: block;
        height: 2px;
        margin-top: 14px;
        content: '';
        background: linear-gradient(
          90deg,
          transparent 0%,
          color-mix(in srgb, var(--el-color-primary) 46%, transparent) 35%,
          color-mix(in srgb, var(--theme-color) 34%, transparent) 65%,
          transparent 100%
        );
        opacity: 0.9;
      }
    }

    .el-dialog__title {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: var(--afd-text) !important;
    }

    .el-dialog__headerbtn .el-icon {
      color: var(--afd-text-3) !important;

      &:hover {
        color: var(--afd-text) !important;
      }
    }

    .el-dialog__body {
      max-height: 70vh;
      padding: 0 !important;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--default-box-color) 50%, transparent);
        border-radius: 2px;
      }
    }

    .el-dialog__footer {
      padding: 0 !important;
      background: linear-gradient(
        180deg,
        transparent 0%,
        color-mix(in srgb, var(--default-box-color) 42%, transparent) 100%
      );
      border-top: 1px solid var(--afd-border);
    }

    .el-form-item {
      margin-bottom: 0;
    }

    .el-form-item__error {
      margin-top: 2px;
      font-size: 11px;
      color: var(--afd-danger);
    }
  }
</style>

<style lang="scss" scoped>
  // ─── 锁定信息条 ─────────────────────────────────────────
  .app-lock-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 24px;
    font-size: 13px;
    color: var(--afd-text-2);
    background: color-mix(in srgb, var(--afd-accent) 9%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--afd-accent) 18%, transparent);
  }

  .app-lock-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 700;
    color: white;
    border-radius: 5px;
    box-shadow:
      0 14px 36px color-mix(in srgb, black 48%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent);
  }

  .app-lock-name {
    font-weight: 600;
    color: var(--afd-text);
  }

  .lock-sep {
    color: color-mix(in srgb, var(--afd-accent) 12%, transparent);
  }

  .app-lock-meta {
    color: var(--afd-text-2);
  }

  .lock-icon {
    font-size: 12px;
    color: var(--afd-text-3);
  }

  .lock-tip {
    font-size: 12px;
    color: var(--afd-text-3);
  }

  // ─── 表单主体 ────────────────────────────────────────────
  .assignment-form {
    padding: 0;
  }

  .form-section {
    padding: 18px 24px;
    border-bottom: 1px solid color-mix(in srgb, var(--afd-accent) 10%, transparent);

    &--last {
      border-bottom: none;
    }

    &--reason {
      padding-top: 0;
      border-top: 1px solid color-mix(in srgb, var(--afd-accent) 10%, transparent);
      border-bottom: none;
    }
  }

  .section-title {
    padding-left: 8px;
    margin-bottom: 14px;
    font-size: 12px;
    font-weight: 600;
    color: var(--afd-accent);
    border-left: 3px solid var(--afd-accent);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 5px;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  .form-label {
    font-size: 12px;
    color: var(--afd-text-2);
  }

  .form-hint {
    margin-top: -3px;
    font-size: 11px;
    color: var(--afd-text-3);
  }

  .required {
    margin-left: 2px;
    color: var(--afd-danger);
  }

  // ─── 平台 Radio ──────────────────────────────────────────
  .platform-radio-group {
    display: flex;
    gap: 12px;
  }

  .platform-radio {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 7px 12px;
    font-size: 13px;
    color: var(--afd-text-2);
    cursor: pointer;
    background: color-mix(in srgb, var(--default-box-color) 28%, transparent);
    border: 1.5px solid color-mix(in srgb, var(--afd-accent) 16%, transparent);
    border-radius: 7px;
    transition:
      transform var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);

    &.is-checked {
      color: var(--afd-accent);
      background: color-mix(in srgb, var(--afd-accent) 10%, transparent);
      border-color: color-mix(in srgb, var(--afd-accent) 46%, transparent);
      box-shadow: 0 12px 26px color-mix(in srgb, var(--afd-accent) 14%, transparent);

      .radio-dot {
        background: var(--afd-accent);
        border-color: var(--afd-accent);

        &::after {
          opacity: 1;
        }
      }
    }
  }

  .radio-dot {
    position: relative;
    display: inline-block;
    width: 14px;
    height: 14px;
    background: transparent;
    border: 1.5px solid color-mix(in srgb, var(--afd-accent) 18%, transparent);
    border-radius: 50%;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out);

    &::after {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      content: '';
      background: white;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.15s;
      transform: translate(-50%, -50%);
    }
  }

  // ─── 变更指示器 ──────────────────────────────────────────
  .change-indicator {
    padding: 4px 8px;
    font-size: 11px;
    color: var(--afd-warning);
    background: color-mix(in srgb, var(--afd-warning) 10%, transparent);
    border-radius: 4px;
  }

  // ─── 版本选择器（Teleport 后仍依赖本 scoped 祖先时保留定位上下文）─────────
  .version-selector {
    position: relative;
    width: 100%;
  }

  .version-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 9px 12px;
    font-size: 13px;
    color: var(--afd-text);
    text-align: left;
    cursor: pointer;
    background: color-mix(in srgb, var(--default-box-color) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--afd-accent) 16%, transparent);
    border-radius: 7px;
    transition:
      transform var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);

    &:hover,
    &.is-open {
      border-color: color-mix(in srgb, var(--afd-accent) 46%, transparent);
      box-shadow: 0 12px 28px color-mix(in srgb, var(--afd-accent) 12%, transparent);
    }
  }

  .trigger-label {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .active-star {
    font-size: 11px;
    font-weight: 600;
    color: var(--afd-accent);
  }

  .trigger-placeholder {
    color: var(--afd-text-3);
  }

  .trigger-arrow {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--afd-text-3);
  }

  .version-option {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 14px;
    cursor: pointer;
    border-bottom: 1px solid color-mix(in srgb, var(--afd-accent) 10%, transparent);
    transition: background 0.12s;

    &:last-child {
      border-bottom: none;
    }

    &:hover:not(.version-option--archived) {
      background: color-mix(in srgb, var(--afd-accent) 8%, transparent);
    }

    &--selected {
      background: color-mix(in srgb, var(--afd-accent) 10%, transparent) !important;
    }

    &--archived {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  .ver-opt-left {
    padding-top: 2px;
  }

  .ver-radio {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    background: transparent;
    border: 1.5px solid color-mix(in srgb, var(--afd-accent) 18%, transparent);
    border-radius: 50%;

    .version-option--selected & {
      border-color: var(--afd-accent);
    }
  }

  .ver-radio-dot {
    display: block;
    width: 7px;
    height: 7px;
    background: var(--afd-accent);
    border-radius: 50%;
  }

  .ver-opt-body {
    flex: 1;
    min-width: 0;
  }

  .ver-opt-top {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    margin-bottom: 4px;
  }

  .ver-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--afd-text);
  }

  .ver-status {
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 3px;

    &--published {
      color: var(--afd-accent);
      background: color-mix(in srgb, var(--afd-accent) 12%, transparent);
    }

    &--draft {
      color: var(--afd-warning);
      background: color-mix(in srgb, var(--afd-warning) 12%, transparent);
    }

    &--archived {
      color: var(--afd-text-3);
      background: color-mix(in srgb, var(--default-box-color) 26%, transparent);
    }
  }

  .ver-active-badge {
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--afd-accent);
    background: color-mix(in srgb, var(--afd-accent) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--afd-accent) 30%, transparent);
    border-radius: 3px;
  }

  .ver-archived-badge {
    padding: 1px 6px;
    font-size: 11px;
    color: var(--afd-text-3);
    background: color-mix(in srgb, var(--default-box-color) 26%, transparent);
    border: 1px solid color-mix(in srgb, var(--afd-accent) 10%, transparent);
    border-radius: 3px;
  }

  .ver-check {
    margin-left: auto;
    font-size: 14px;
    color: var(--afd-accent);
  }

  .ver-opt-meta {
    font-size: 11px;
    color: var(--afd-text-3);
  }

  // ─── 配置预览 ────────────────────────────────────────────
  .config-preview {
    padding: 10px 12px;
    margin-top: 8px;
    background: color-mix(in srgb, var(--default-box-color) 18%, transparent);
    border: 1px solid color-mix(in srgb, var(--afd-accent) 10%, transparent);
    border-radius: 7px;
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .preview-title {
    font-size: 12px;
    color: var(--afd-text-3);
  }

  .preview-link {
    font-size: 12px;
    color: var(--afd-accent);
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .preview-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .preview-tag {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--afd-text-2);
    background: color-mix(in srgb, var(--default-box-color) 30%, transparent);
    border: 1px solid color-mix(in srgb, var(--afd-accent) 12%, transparent);
    border-radius: 4px;
  }

  // ─── 草稿警告 ────────────────────────────────────────────
  .draft-warning {
    display: flex;
    gap: 7px;
    align-items: center;
    padding: 9px 12px;
    margin-top: 8px;
    font-size: 12px;
    color: var(--afd-warning);
    background: color-mix(in srgb, var(--afd-warning) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--afd-warning) 28%, transparent);
    border-radius: 6px;
  }

  // ─── 变更数量提示 ────────────────────────────────────────
  .change-count-hint {
    padding: 4px 8px;
    font-size: 11px;
    color: var(--afd-warning);
    background: color-mix(in srgb, var(--afd-warning) 8%, transparent);
    border-radius: 4px;
  }

  // ─── 底部按钮 ────────────────────────────────────────────
  .form-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 24px;
  }

  .btn-cancel {
    padding: 8px 20px !important;
    color: var(--afd-text-2) !important;
    background: color-mix(in srgb, var(--default-box-color) 22%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--afd-accent) 16%, transparent) !important;
    border-radius: 8px !important;
    transition:
      transform var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out) !important;

    &:hover {
      color: var(--afd-text) !important;
      border-color: color-mix(in srgb, var(--afd-accent) 36%, transparent) !important;
      box-shadow: 0 14px 32px color-mix(in srgb, var(--afd-accent) 12%, transparent) !important;
      transform: translateY(-1px);
    }
  }

  .btn-submit {
    padding: 8px 28px !important;
    font-weight: 600 !important;
    color: color-mix(in srgb, black 78%, transparent) !important;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--el-color-primary) 88%, white 8%),
      color-mix(in srgb, var(--theme-color) 86%, white 10%)
    ) !important;
    border: none !important;
    border-radius: 8px !important;
    box-shadow:
      0 16px 36px color-mix(in srgb, var(--afd-accent) 22%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 18%, transparent) !important;

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }

  // ─── 应用选项样式 ────────────────────────────────────────
  .app-opt-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    margin-right: 8px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    vertical-align: middle;
    border-radius: 4px;
  }

  .app-opt-label {
    font-size: 13px;
    vertical-align: middle;
  }

  // ─── 深色控件 ────────────────────────────────────────────
  .dark-select {
    &.full-width {
      width: 100%;
    }

    :deep(.el-select__wrapper) {
      color: var(--afd-text);
      background: color-mix(in srgb, var(--default-box-color) 30%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--afd-accent) 16%, transparent) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover {
        border-color: color-mix(in srgb, var(--afd-accent) 46%, transparent) !important;
      }
    }

    :deep(.el-select__placeholder) {
      color: var(--afd-text-3) !important;
    }
  }

  .dark-textarea {
    :deep(.el-textarea__inner) {
      font-size: 13px;
      color: var(--afd-text);
      background: color-mix(in srgb, var(--default-box-color) 30%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--afd-accent) 16%, transparent) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &::placeholder {
        color: var(--afd-text-3);
      }

      &:hover,
      &:focus {
        border-color: color-mix(in srgb, var(--afd-accent) 46%, transparent) !important;
      }
    }

    &--highlight {
      :deep(.el-textarea__inner) {
        border-color: color-mix(in srgb, var(--afd-warning) 42%, transparent) !important;

        &:focus {
          border-color: var(--afd-warning) !important;
        }
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .platform-radio,
    .version-trigger,
    .btn-cancel,
    .btn-submit {
      transition: none !important;
    }

    .btn-cancel:hover,
    .btn-submit:hover {
      transform: none !important;
    }
  }
</style>

<!-- Teleport 渲染到 body，scoped 无效，需要全局样式 -->
<style lang="scss">
  .version-dropdown-portal {
    --vdp-accent: var(--el-color-primary);
    --vdp-accent-dim: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    --vdp-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --vdp-surface: color-mix(in srgb, var(--default-box-color) 86%, black 10%);
    --vdp-text: var(--text-primary);
    --vdp-text-2: var(--text-secondary);
    --vdp-text-3: var(--text-tertiary);
    --vdp-warning: var(--art-warning);

    overflow: hidden;
    background: linear-gradient(
      180deg,
      var(--vdp-surface),
      color-mix(in srgb, var(--vdp-surface) 88%, black 12%)
    );
    border: 1px solid var(--vdp-border);
    border-radius: 8px;
    box-shadow:
      0 12px 44px color-mix(in srgb, black 60%, transparent),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 9%, transparent);

    .version-option {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      padding: 12px 14px;
      cursor: pointer;
      border-bottom: 1px solid color-mix(in srgb, var(--vdp-accent) 10%, transparent);
      transition: background 0.12s;

      &:last-child {
        border-bottom: none;
      }

      &:hover:not(.version-option--archived) {
        background: color-mix(in srgb, var(--vdp-accent) 8%, transparent);
      }

      &--selected {
        background: color-mix(in srgb, var(--vdp-accent) 10%, transparent) !important;

        .ver-radio {
          border-color: var(--vdp-accent);
        }
      }

      &--archived {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }

    .ver-opt-left {
      padding-top: 2px;
    }

    .ver-radio {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      background: transparent;
      border: 1.5px solid color-mix(in srgb, var(--vdp-accent) 18%, transparent);
      border-radius: 50%;
    }

    .ver-radio-dot {
      display: block;
      width: 7px;
      height: 7px;
      background: var(--vdp-accent);
      border-radius: 50%;
    }

    .ver-opt-body {
      flex: 1;
      min-width: 0;
    }

    .ver-opt-top {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      align-items: center;
      margin-bottom: 4px;
    }

    .ver-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--vdp-text);
    }

    .ver-status {
      padding: 1px 6px;
      font-size: 11px;
      border-radius: 3px;

      &--published {
        color: var(--vdp-accent);
        background: color-mix(in srgb, var(--vdp-accent) 12%, transparent);
      }

      &--draft {
        color: var(--vdp-warning);
        background: color-mix(in srgb, var(--vdp-warning) 12%, transparent);
      }

      &--archived {
        color: var(--vdp-text-3);
        background: color-mix(in srgb, var(--default-box-color) 26%, transparent);
      }
    }

    .ver-active-badge {
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 600;
      color: var(--vdp-accent);
      background: color-mix(in srgb, var(--vdp-accent) 14%, transparent);
      border: 1px solid color-mix(in srgb, var(--vdp-accent) 30%, transparent);
      border-radius: 3px;
    }

    .ver-archived-badge {
      padding: 1px 6px;
      font-size: 11px;
      color: var(--vdp-text-3);
      background: color-mix(in srgb, var(--default-box-color) 26%, transparent);
      border: 1px solid color-mix(in srgb, var(--vdp-accent) 10%, transparent);
      border-radius: 3px;
    }

    .ver-check {
      margin-left: auto;
      font-size: 14px;
      color: var(--vdp-accent);
    }

    .ver-opt-meta {
      font-size: 11px;
      color: var(--vdp-text-3);
    }

    .ver-empty {
      padding: 16px 14px;
      font-size: 12px;
      color: var(--vdp-text-3);
      text-align: center;
    }
  }
</style>
