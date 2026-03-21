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
    :deep(.el-form-item__label) {
      padding-bottom: 6px;
      font-size: 13px;
      line-height: 1.4;
      color: #94a3b8;
    }

    :deep(.el-input__wrapper),
    :deep(.el-textarea__inner) {
      color: #e2e8f0;
      background: rgb(255 255 255 / 5%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: rgb(45 212 191 / 50%) !important;
      }
    }

    :deep(.el-input__inner) {
      color: #e2e8f0;
    }

    :deep(.el-textarea__inner) {
      color: #e2e8f0;
      resize: none;
    }

    :deep(.el-input__prefix) {
      color: #64748b;
    }

    :deep(.el-input-number__wrapper) {
      background: rgb(255 255 255 / 5%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 8px;
      box-shadow: none !important;

      &:hover {
        border-color: rgb(45 212 191 / 50%) !important;
      }
    }

    :deep(.el-input-number .el-input__inner) {
      color: #e2e8f0;
    }

    /* 右侧步进按钮：覆盖主题默认的偏褐/灰填充，与弹窗冷色背景统一 */
    :deep(.el-input-number__increase),
    :deep(.el-input-number__decrease) {
      color: #94a3b8 !important;
      background: rgb(255 255 255 / 6%) !important;
      border-color: rgb(255 255 255 / 10%) !important;

      .el-icon {
        color: inherit !important;
      }

      &:hover:not(.is-disabled) {
        color: #2dd4bf !important;
        background: rgb(45 212 191 / 12%) !important;
      }
    }

    :deep(.el-input-number__increase.is-disabled),
    :deep(.el-input-number__decrease.is-disabled) {
      color: #475569 !important;
      background: rgb(255 255 255 / 4%) !important;
    }

    :deep(.el-input-number.is-controls-right .el-input-number__increase),
    :deep(.el-input-number.is-controls-right .el-input-number__decrease) {
      background-color: rgb(255 255 255 / 6%) !important;
      background-image: none !important;
    }

    :deep(.el-input__count) {
      font-size: 12px;
      color: #64748b;
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

  .form-item--half {
    // inherits grid cell
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
    color: #64748b;
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
    color: #e2e8f0;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-email {
    display: block;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.45;
    color: #64748b;
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
    background: rgb(255 255 255 / 4%);
    border: 1px dashed rgb(255 255 255 / 15%);
    border-radius: 8px;
  }

  .lock-icon {
    margin-left: auto;
    font-size: 16px;
    color: #64748b;
  }

  .locked-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #f59e0b;
  }

  // ─── 状态切换 ────────────────────────────────────────────────────
  .status-toggle {
    display: flex;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 8px;
  }

  .toggle-btn {
    flex: 1;
    padding: 8px 0;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    cursor: pointer;
    background: transparent;
    border: none;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
    }

    &.toggle-btn--active {
      color: #22c55e;
      background: rgb(34 197 94 / 20%);
    }

    &.toggle-btn--inactive {
      color: #ef4444;
      background: rgb(239 68 68 / 20%);
    }
  }

  // ─── 代号输入（编辑时高亮） ──────────────────────────────────────
  .input-scode {
    :deep(.el-input__inner) {
      color: #2dd4bf !important;
    }
  }

  // ─── 最后修改时间 ───────────────────────────────────────────────
  .last-modify-hint {
    margin-top: -8px;
    font-size: 12px;
    color: #64748b;
  }

  // ─── 弹窗底部 ───────────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn-cancel {
    padding: 8px 20px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 12%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #e2e8f0 !important;
      border-color: rgb(255 255 255 / 25%) !important;
    }
  }

  .btn-save {
    padding: 8px 24px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: #2dd4bf !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover {
      filter: brightness(1.1);
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
    background: #1a2540 !important;
    border: 1px solid rgb(255 255 255 / 8%) !important;
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
    background-color: rgb(255 255 255 / 28%) !important;
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
    background: rgb(45 212 191 / 8%) !important;
  }

  .user-select-popper .el-select-dropdown__item.is-selected {
    background: rgb(45 212 191 / 12%) !important;
  }
</style>
