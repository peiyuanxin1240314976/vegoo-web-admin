<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑优化师' : '新建优化师'"
    width="640px"
    :close-on-click-modal="false"
    header-class="optimizer-form-dialog-hd"
    body-class="optimizer-form-dialog-bd"
    footer-class="optimizer-form-dialog-ft"
    @update:model-value="$emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="opt-form">
      <!-- ═══ 新建模式：关联用户 ═══════════════════════════════════ -->
      <template v-if="!isEdit">
        <div class="form-row">
          <!-- 关联用户 -->
          <el-form-item label="关联用户" prop="userId" class="form-item--wide">
            <el-select
              v-model="form.userId"
              placeholder="搜索并选择系统用户..."
              filterable
              class="full-width"
              popper-class="user-select-popper"
            >
              <el-option v-for="u in userOptions" :key="u.id" :label="u.userName" :value="u.id">
                <div class="user-option">
                  <div class="user-avatar" :style="{ background: u.avatarColor }">{{
                    u.userName.charAt(0)
                  }}</div>
                  <div class="user-info">
                    <span class="user-name">{{ u.userName }}</span>
                    <span class="user-email">{{ u.email }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
          <!-- 版本号 -->
          <el-form-item label="版本号" prop="version" class="form-item--narrow">
            <div class="version-input-wrap">
              <el-input-number
                v-model="form.version"
                :min="0"
                :step="1"
                controls-position="right"
                class="full-width"
              />
              <div class="version-hint">默认为 0</div>
            </div>
          </el-form-item>
        </div>

        <div class="form-row">
          <!-- 代号2 -->
          <el-form-item label="代号2" prop="sCode2" class="form-item--half">
            <el-input v-model="form.sCode2" placeholder="可选，请输入副代号" class="full-width" />
          </el-form-item>
          <!-- 代号 -->
          <el-form-item label="代号" prop="sCode" class="form-item--half">
            <el-input
              v-model="form.sCode"
              placeholder="请输入代号，如 FB-OPT-001"
              class="full-width"
            />
          </el-form-item>
        </div>

        <div class="form-row">
          <!-- 最低消耗要求 -->
          <el-form-item label="最低消耗要求" prop="minConsumption" class="form-item--half">
            <el-input-number
              v-model="form.minConsumption"
              :min="0"
              :precision="2"
              :step="100"
              controls-position="right"
              class="full-width"
            >
              <template #prefix>$</template>
            </el-input-number>
          </el-form-item>
          <!-- 检验码 -->
          <el-form-item label="检验码" prop="checkCode" class="form-item--half">
            <div class="checkcode-wrap">
              <el-input
                v-model="form.checkCode"
                type="textarea"
                :rows="3"
                :maxlength="200"
                show-word-limit
                placeholder="请输入检验码（最多 200 字符）"
                class="full-width checkcode-textarea"
                resize="none"
              />
            </div>
          </el-form-item>
        </div>
      </template>

      <!-- ═══ 编辑模式 ═══════════════════════════════════════════ -->
      <template v-else>
        <!-- 关联用户（锁定） -->
        <el-form-item label="关联用户">
          <div class="locked-user">
            <div class="user-avatar" :style="{ background: editData?.avatarColor }">
              {{ editData?.userName?.charAt(0) }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ editData?.userName }}</span>
              <span class="user-email">{{ editData?.email }}</span>
            </div>
            <el-icon class="lock-icon"><Lock /></el-icon>
          </div>
          <div class="locked-hint">已绑定用户，不可更改</div>
        </el-form-item>

        <div class="form-row">
          <!-- 版本号 -->
          <el-form-item label="版本号" prop="version" class="form-item--half">
            <el-input v-model.number="form.version" type="number" class="full-width" />
          </el-form-item>
          <!-- 状态 -->
          <el-form-item label="状态" prop="status" class="form-item--half">
            <div class="status-toggle">
              <button
                :class="['toggle-btn', form.status === '在职' && 'toggle-btn--active']"
                type="button"
                @click="form.status = '在职'"
                >在职</button
              >
              <button
                :class="['toggle-btn', form.status === '离职' && 'toggle-btn--inactive']"
                type="button"
                @click="form.status = '离职'"
                >离职</button
              >
            </div>
          </el-form-item>
        </div>

        <div class="form-row">
          <!-- 代号 -->
          <el-form-item label="代号" prop="sCode" class="form-item--half">
            <el-input v-model="form.sCode" class="full-width input-scode" />
          </el-form-item>
          <!-- 代号2 -->
          <el-form-item label="代号2" prop="sCode2" class="form-item--half">
            <el-input v-model="form.sCode2" class="full-width" />
          </el-form-item>
        </div>

        <!-- 最低消耗要求 -->
        <el-form-item label="最低消耗要求" prop="minConsumption">
          <el-input v-model.number="form.minConsumption" type="number" class="full-width">
            <template #prefix>$</template>
          </el-input>
        </el-form-item>

        <!-- 检验码 -->
        <el-form-item label="检验码" prop="checkCode">
          <el-input
            v-model="form.checkCode"
            type="textarea"
            :rows="3"
            :maxlength="200"
            show-word-limit
            class="full-width"
            resize="none"
          />
        </el-form-item>

        <!-- 最后修改时间 -->
        <div class="last-modify-hint" v-if="editData?.lastModifyTime">
          最后修改：{{ editData.lastModifyTime }}
        </div>
      </template>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button class="btn-cancel" @click="$emit('update:visible', false)">取消</el-button>
        <el-button class="btn-save" :loading="saving" @click="handleSave">
          {{ isEdit ? '保存修改' : '保存' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import { Lock } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { OptimizerItem, OptimizerFormPayload, SystemUser } from '../types'
  import { systemUsers as seedSystemUsers } from '../mock/data'

  defineOptions({ name: 'OptimizerFormDialog' })

  const props = withDefaults(
    defineProps<{
      visible: boolean
      editData?: OptimizerItem | null
      /** 关联用户下拉；默认使用 mock 种子 */
      systemUsers?: SystemUser[]
    }>(),
    { systemUsers: undefined }
  )

  const userOptions = computed(() => props.systemUsers ?? seedSystemUsers)

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [payload: OptimizerFormPayload]
  }>()

  const isEdit = computed(() => !!props.editData)
  const saving = ref(false)
  const formRef = ref<FormInstance>()

  const defaultForm = (): OptimizerFormPayload => ({
    userId: '',
    version: 0,
    sCode: '',
    sCode2: '',
    minConsumption: 0,
    checkCode: '',
    status: '在职'
  })

  const form = reactive<OptimizerFormPayload>(defaultForm())

  watch(
    () => props.editData,
    (val) => {
      Object.assign(form, defaultForm())
      if (val) {
        form.id = val.id
        form.userId = val.userId
        form.version = val.version
        form.sCode = val.sCode
        form.sCode2 = val.sCode2 ?? ''
        form.minConsumption = val.minConsumption
        form.checkCode = val.checkCode
        form.status = val.status
      }
    },
    { immediate: true }
  )

  const rules = computed<FormRules>(() => ({
    userId: isEdit.value ? [] : [{ required: true, message: '请选择关联用户', trigger: 'change' }],
    sCode: [{ required: true, message: '请输入代号', trigger: 'blur' }],
    minConsumption: [{ required: true, message: '请输入最低消耗要求', trigger: 'blur' }],
    checkCode: [{ required: true, message: '请输入检验码', trigger: 'blur' }]
  }))

  const handleSave = async () => {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    saving.value = true
    setTimeout(() => {
      saving.value = false
      emit('success', { ...form })
    }, 300)
  }

  const handleClosed = () => {
    Object.assign(form, defaultForm())
    formRef.value?.clearValidate()
  }
</script>

<style lang="scss" scoped>
  .opt-form {
    --ofd-text-primary: var(--text-primary);
    --ofd-text-secondary: var(--text-secondary);
    --ofd-text-tertiary: var(--text-tertiary);
    --ofd-surface-soft: color-mix(in srgb, var(--default-box-color) 74%, transparent);
    --ofd-surface-muted: color-mix(in srgb, var(--default-box-color) 64%, transparent);
    --ofd-border: color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    --ofd-border-strong: color-mix(in srgb, var(--el-color-primary) 40%, transparent);
    --ofd-primary-soft: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --ofd-primary-mid: color-mix(in srgb, var(--el-color-primary) 24%, transparent);
    --ofd-success-soft: color-mix(in srgb, var(--art-success) 22%, transparent);
    --ofd-danger-soft: color-mix(in srgb, var(--art-danger) 22%, transparent);

    :deep(.el-form-item__label) {
      padding-bottom: 6px;
      font-size: 13px;
      line-height: 1.4;
      color: var(--ofd-text-secondary);
    }

    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      color: var(--ofd-text-primary);
      background: var(--ofd-surface-soft) !important;
      border: 1px solid var(--ofd-border) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: var(--ofd-border-strong) !important;
      }
    }

    :deep(.el-input__inner) {
      color: var(--ofd-text-primary);
    }

    :deep(.el-textarea__inner) {
      color: var(--ofd-text-primary);
      resize: none;
    }

    :deep(.el-input__prefix) {
      color: var(--ofd-text-tertiary);
    }

    :deep(.el-input-number__wrapper) {
      background: var(--ofd-surface-soft) !important;
      border: 1px solid var(--ofd-border) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover {
        border-color: var(--ofd-border-strong) !important;
      }
    }

    :deep(.el-input-number .el-input__inner) {
      color: var(--ofd-text-primary);
    }

    /* 右侧步进按钮：覆盖主题默认的偏褐/灰填充，与弹窗冷色背景统一 */
    :deep(.el-input-number__increase),
    :deep(.el-input-number__decrease) {
      color: var(--ofd-text-secondary) !important;
      background: var(--ofd-surface-muted) !important;
      border-color: var(--ofd-border) !important;

      .el-icon {
        color: inherit !important;
      }

      &:hover:not(.is-disabled) {
        color: var(--el-color-primary) !important;
        background: var(--ofd-primary-soft) !important;
      }
    }

    :deep(.el-input-number__increase.is-disabled),
    :deep(.el-input-number__decrease.is-disabled) {
      color: color-mix(in srgb, var(--ofd-text-tertiary) 70%, transparent) !important;
      background: color-mix(in srgb, var(--default-box-color) 58%, transparent) !important;
    }

    :deep(.el-input-number.is-controls-right .el-input-number__increase),
    :deep(.el-input-number.is-controls-right .el-input-number__decrease) {
      background-color: var(--ofd-surface-muted) !important;
      background-image: none !important;
    }

    :deep(.el-input__count) {
      font-size: 12px;
      color: var(--ofd-text-tertiary);
      background: transparent;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-item--wide {
    flex: 2;
  }

  .form-item--narrow {
    flex: 1;
  }

  .full-width {
    width: 100%;
  }

  .version-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .version-hint {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .checkcode-wrap {
    width: 100%;
  }

  .checkcode-textarea {
    :deep(.el-textarea__inner) {
      min-height: 76px !important;
    }
  }

  // ─── 用户下拉选项 ────────────────────────────────────────────────
  .user-option {
    box-sizing: border-box;
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    min-height: 40px;
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    border-radius: 50%;
  }

  .user-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    justify-content: center;
    min-width: 0;
  }

  .user-name {
    display: block;
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.45;
    color: var(--text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-email {
    display: block;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-tertiary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // ─── 编辑模式：锁定用户 ─────────────────────────────────────────
  .locked-user {
    display: flex;
    gap: 12px;
    align-items: center;
    width: 100%;
    padding: 12px 14px;
    background: color-mix(in srgb, var(--default-box-color) 64%, transparent);
    border: 1px dashed color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    border-radius: 8px;
  }

  .lock-icon {
    margin-left: auto;
    font-size: 16px;
    color: var(--text-tertiary);
  }

  .locked-hint {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-warning);
  }

  // ─── 状态切换 ────────────────────────────────────────────────────
  .status-toggle {
    display: flex;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    border-radius: 8px;
  }

  .toggle-btn {
    flex: 1;
    padding: 8px 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-tertiary);
    cursor: pointer;
    background: transparent;
    border: none;
    transition:
      color var(--duration-fast) var(--ease-default),
      background-color var(--duration-fast) var(--ease-default);

    &:hover {
      color: var(--text-primary);
    }

    &.toggle-btn--active {
      color: var(--art-success);
      background: var(--ofd-success-soft);
    }

    &.toggle-btn--inactive {
      color: var(--art-danger);
      background: var(--ofd-danger-soft);
    }
  }

  // ─── 代号输入（编辑时高亮） ──────────────────────────────────────
  .input-scode {
    :deep(.el-input__inner) {
      color: var(--el-color-primary) !important;
    }
  }

  // ─── 最后修改时间 ───────────────────────────────────────────────
  .last-modify-hint {
    margin-top: -8px;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  // ─── 弹窗底部 ───────────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn-cancel {
    padding: 8px 20px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 26%, transparent) !important;
    border-radius: 8px !important;

    &:hover {
      color: var(--text-primary) !important;
      background: color-mix(in srgb, var(--el-color-primary) 10%, transparent) !important;
      border-color: color-mix(in srgb, var(--el-color-primary) 44%, transparent) !important;
    }
  }

  .btn-save {
    padding: 8px 24px !important;
    font-weight: 600 !important;
    color: var(--el-text-color-primary) !important;
    background: color-mix(in srgb, var(--el-color-primary) 86%, #fff 14%) !important;
    border: none !important;
    border-radius: 8px !important;
    transition:
      filter var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default);

    &:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
  }
</style>

<!--
  ElDialog 默认 teleport 到 body，且写在 el-dialog 上的 class 未必合并到 .el-dialog 根节点；
  scoped 下的 .optimizer-dialog :deep(.el-dialog) 也会误选成「子元素 .el-dialog」，导致样式不生效。
  使用官方 header-class / body-class / footer-class + :has 仅命中本弹窗。
-->
<style lang="scss">
  .el-dialog:has(.optimizer-form-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.optimizer-form-dialog-bd) .el-dialog__header.optimizer-form-dialog-hd {
    padding: 20px 24px 16px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.optimizer-form-dialog-bd) .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary);
  }

  .el-dialog:has(.optimizer-form-dialog-bd) .el-dialog__headerbtn .el-dialog__close {
    font-size: 18px;
    color: var(--cm-dialog-text-muted);

    &:hover {
      color: var(--cm-dialog-text-primary);
    }
  }

  .el-dialog:has(.optimizer-form-dialog-bd) .el-dialog__body.optimizer-form-dialog-bd {
    padding: 20px 24px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.optimizer-form-dialog-bd) .el-dialog__footer.optimizer-form-dialog-ft {
    padding: 12px 24px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<!-- 下拉弹出层全局样式（不能 scoped） -->
<style>
  .user-select-popper.el-select__popper {
    background: color-mix(in srgb, var(--default-box-color) 92%, #000 8%) !important;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 22%, transparent) !important;
  }

  /* 限制高度，列表过长时内部滚动 */
  .user-select-popper .el-select-dropdown__wrap {
    max-height: min(300px, 48vh) !important;
  }

  /* 列表整体左右留白，避免头像贴边 */
  .user-select-popper .el-select-dropdown__list {
    box-sizing: border-box;
    padding: 8px !important;
  }

  .user-select-popper .el-scrollbar__bar.is-vertical {
    width: 6px;
  }

  .user-select-popper .el-scrollbar__thumb {
    background-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent) !important;
  }

  /*
   * 默认项为单行固定高度；自定义双行 + 头像需独占行高。
   * 禁用 overflow:visible，否则文字会画出 li 边界叠到下一行。
   */
  .user-select-popper .el-select-dropdown__item {
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    height: auto !important;
    min-height: 56px !important;
    padding: 10px 14px !important;
    overflow: hidden !important;
    line-height: normal !important;
    white-space: normal !important;
  }

  .user-select-popper .el-select-dropdown__item.is-hovering,
  .user-select-popper .el-select-dropdown__item:hover {
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent) !important;
  }

  .user-select-popper .el-select-dropdown__item.is-selected {
    background: color-mix(in srgb, var(--el-color-primary) 18%, transparent) !important;
  }
</style>
