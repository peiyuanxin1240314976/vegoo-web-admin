<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { View } from '@element-plus/icons-vue'
  import type { AdAccountForm } from './types'

  // ─── Props & Emits ─────────────────────────────────────────────────────────
  defineProps<{ visible: boolean }>()
  const emit = defineEmits<{
    'update:visible': [val: boolean]
    save: [data: AdAccountForm]
  }>()

  // ─── State ─────────────────────────────────────────────────────────────────
  const showToken = ref(false)
  const newAccountId = ref('')

  const form = reactive<AdAccountForm>({
    appName: 'Weather5',
    platform: 'Android',
    adPlatform: 'Google',
    managerAccount: '',
    credential: '',
    adAccounts: [],
    token: ''
  })

  const appOptions = ['Weather5', 'Weather6', 'Weather8', 'Weather9']
  const adPlatformOptions = [
    { label: 'Google', icon: '🇬', color: '#4285F4' },
    { label: 'TikTok', icon: '♪', color: '#ffffff' },
    { label: 'Mintegral', icon: 'M', color: '#00C896' },
    { label: 'NewsBreak', icon: 'NB', color: '#FF4B4B' }
  ]

  // ─── Methods ───────────────────────────────────────────────────────────────
  const close = () => emit('update:visible', false)

  const handleSave = () => {
    emit('save', { ...form, adAccounts: [...form.adAccounts] })
    resetForm()
    close()
  }

  const resetForm = () => {
    form.appName = 'Weather5'
    form.platform = 'Android'
    form.adPlatform = 'Google'
    form.managerAccount = ''
    form.credential = ''
    form.adAccounts = []
    form.token = ''
    newAccountId.value = ''
    showToken.value = false
  }

  const addAccountId = () => {
    const val = newAccountId.value.trim()
    if (!val) return
    form.adAccounts.push(val)
    newAccountId.value = ''
  }

  const removeAccountId = (idx: number) => {
    form.adAccounts.splice(idx, 1)
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAccountId()
    }
  }
</script>

<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="add-dialog">
        <!-- ── 头部 ── -->
        <div class="dlg-header">
          <div>
            <div class="dlg-title">新增广告账户</div>
            <div class="dlg-sub">添加新的广告平台账户配置</div>
          </div>
          <button class="btn-close" @click="close">关闭 ×</button>
        </div>

        <!-- ── 表单 ── -->
        <div class="dlg-body">
          <!-- 基本信息 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />基本信息</div>

            <!-- 应用名 -->
            <div class="form-item">
              <label class="form-label">应用名 <span class="required">*</span></label>
              <el-select v-model="form.appName" class="form-select" placeholder="选择应用">
                <el-option v-for="app in appOptions" :key="app" :label="app" :value="app" />
              </el-select>
            </div>

            <!-- 平台 -->
            <div class="form-item">
              <label class="form-label">平台 <span class="required">*</span></label>
              <div class="platform-toggle">
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--active': form.platform === 'Android' }"
                  @click="form.platform = 'Android'"
                  >Android</button
                >
                <button
                  class="toggle-btn"
                  :class="{ 'toggle-btn--active': form.platform === 'iOS' }"
                  @click="form.platform = 'iOS'"
                  >iOS</button
                >
              </div>
            </div>

            <!-- 广告平台 -->
            <div class="form-item">
              <label class="form-label">广告平台 <span class="required">*</span></label>
              <el-select v-model="form.adPlatform" class="form-select" placeholder="选择广告平台">
                <el-option
                  v-for="opt in adPlatformOptions"
                  :key="opt.label"
                  :label="opt.label"
                  :value="opt.label"
                >
                  <span style="display: inline-flex; gap: 8px; align-items: center">
                    <span :style="{ color: opt.color, fontWeight: 700, fontSize: '12px' }">{{
                      opt.icon
                    }}</span>
                    {{ opt.label }}
                  </span>
                </el-option>
              </el-select>
            </div>
          </section>

          <!-- 账户信息 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />账户信息</div>

            <div class="form-item">
              <label class="form-label">管理账户 <span class="required">*</span></label>
              <el-input
                v-model="form.managerAccount"
                class="form-input"
                placeholder="输入管理账户 ID"
              />
            </div>

            <div class="form-item">
              <label class="form-label">凭据</label>
              <el-input v-model="form.credential" class="form-input" placeholder="输入凭据名称" />
            </div>

            <!-- 广告账户 ID -->
            <div class="form-item">
              <label class="form-label">广告账户 ID</label>
              <div class="account-input-wrap">
                <div class="account-tags-input">
                  <span v-for="(acc, idx) in form.adAccounts" :key="idx" class="account-tag">
                    {{ acc }}
                    <span class="tag-remove" @click="removeAccountId(idx)">×</span>
                  </span>
                  <input
                    v-model="newAccountId"
                    class="tag-input"
                    placeholder="输入账户 ID 后按 Enter 添加"
                    @keydown="handleKeydown"
                  />
                </div>
                <div class="input-hint">支持添加多个广告账户 ID</div>
              </div>
            </div>
          </section>

          <!-- Token 认证 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />Token 认证</div>

            <div class="form-item">
              <label class="form-label">Token</label>
              <el-input
                v-model="form.token"
                class="form-input"
                placeholder="输入 API Token（可选）"
                :type="showToken ? 'text' : 'password'"
              >
                <template #suffix>
                  <el-icon
                    style="color: #6b7280; cursor: pointer; transition: color 0.2s"
                    @click="showToken = !showToken"
                    ><View
                  /></el-icon>
                </template>
              </el-input>
              <div class="input-hint" style="margin-top: 4px">用于 API 数据同步认证</div>
            </div>
          </section>
        </div>

        <!-- ── 底部 ── -->
        <div class="dlg-footer">
          <button class="btn-cancel" @click="close">取消</button>
          <button class="btn-save" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
  .dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 60%);
    backdrop-filter: blur(4px);
  }

  .add-dialog {
    display: flex;
    flex-direction: column;
    width: 480px;
    max-height: 90vh;
    overflow: hidden;
    background: #161b27;
    border: 1px solid #2d3a50;
    border-radius: 16px;
    box-shadow: 0 24px 80px rgb(0 0 0 / 60%);
  }

  /* ── header ── */
  .dlg-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid #1e2535;
  }

  .dlg-title {
    font-size: 16px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .dlg-sub {
    margin-top: 4px;
    font-size: 12px;
    color: #6b7280;
  }

  .btn-close {
    padding: 6px 14px;
    font-size: 13px;
    color: #6b7280;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2d3a50;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-close:hover {
    color: #94a3b8;
    border-color: #4b5563;
  }

  /* ── body ── */
  .dlg-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 24px;
    padding: 20px 24px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #2d3a50 transparent;
  }

  /* ── section ── */
  .dlg-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .section-bar {
    display: inline-block;
    width: 3px;
    height: 14px;
    background: #3b82f6;
    border-radius: 2px;
  }

  /* ── form ── */
  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 13px;
    color: #94a3b8;
  }

  .required {
    margin-left: 2px;
    color: #ef4444;
  }

  .input-hint {
    font-size: 12px;
    color: #4b5563;
  }

  .platform-toggle {
    display: flex;
    gap: 0;
    width: fit-content;
    overflow: hidden;
    background: #1a2030;
    border: 1px solid #2d3a50;
    border-radius: 8px;
  }

  .toggle-btn {
    padding: 8px 24px;
    font-size: 13px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    background: transparent;
    border: none;
    transition: all 0.2s;
  }

  .toggle-btn--active {
    color: #fff;
    background: #3b82f6;
  }

  .toggle-btn:not(.toggle-btn--active):hover {
    color: #94a3b8;
    background: rgb(255 255 255 / 4%);
  }

  /* ── account tags input ── */
  .account-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .account-tags-input {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    min-height: 42px;
    padding: 6px 10px;
    cursor: text;
    background: #1a2030;
    border: 1px solid #2d3a50;
    border-radius: 8px;
    transition: border-color 0.2s;
  }

  .account-tags-input:focus-within {
    border-color: #3b82f6;
  }

  .account-tag {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #93c5fd;
    background: rgb(59 130 246 / 15%);
    border: 1px solid rgb(59 130 246 / 30%);
    border-radius: 6px;
    animation: tagIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes tagIn {
    from {
      opacity: 0;
      transform: scale(0.8);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .tag-remove {
    font-size: 14px;
    line-height: 1;
    color: #6b7280;
    cursor: pointer;
    transition: color 0.15s;
  }

  .tag-remove:hover {
    color: #ef4444;
  }

  .tag-input {
    flex: 1;
    min-width: 160px;
    padding: 2px 0;
    font-size: 13px;
    color: #e2e8f0;
    background: transparent;
    border: none;
    outline: none;
  }

  .tag-input::placeholder {
    color: #4b5563;
  }

  /* ── footer ── */
  .dlg-footer {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    justify-content: flex-end;
    padding: 16px 24px;
    border-top: 1px solid #1e2535;
  }

  .btn-cancel {
    min-width: 90px;
    padding: 9px 28px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    background: #1a2030;
    border: 1px solid #2d3a50;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-cancel:hover {
    color: #e2e8f0;
    border-color: #4b5563;
  }

  .btn-save {
    min-width: 90px;
    padding: 9px 40px;
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    background: #3b82f6;
    border: none;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-save:hover {
    background: #2563eb;
    box-shadow: 0 4px 16px rgb(59 130 246 / 40%);
    transform: translateY(-1px);
  }

  .btn-save:active {
    transform: translateY(0);
  }

  /* ── input override ── */
  :deep(.form-select),
  :deep(.form-input) {
    width: 100% !important;
  }

  :deep(.form-select .el-input__wrapper),
  :deep(.form-input .el-input__wrapper) {
    background: #1a2030 !important;
    border: 1px solid #2d3a50 !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    transition: border-color 0.2s !important;
  }

  :deep(.form-select .el-input__wrapper:hover),
  :deep(.form-input .el-input__wrapper:hover),
  :deep(.form-select .el-input__wrapper.is-focus),
  :deep(.form-input .el-input__wrapper.is-focus) {
    border-color: #3b82f6 !important;
  }

  :deep(.form-select .el-input__inner),
  :deep(.form-input .el-input__inner) {
    font-size: 13px !important;
    color: #e2e8f0 !important;
    background: transparent !important;
  }

  :deep(.form-select .el-input__inner::placeholder),
  :deep(.form-input .el-input__inner::placeholder) {
    color: #4b5563 !important;
  }

  :deep(.el-select__placeholder.is-transparent) {
    color: #4b5563 !important;
  }

  /* ── transition ── */
  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .dialog-fade-enter-active .add-dialog,
  .dialog-fade-leave-active .add-dialog {
    transition:
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.2s ease;
  }

  .dialog-fade-enter-from {
    opacity: 0;
  }

  .dialog-fade-enter-from .add-dialog {
    opacity: 0;
    transform: scale(0.93) translateY(10px);
  }

  .dialog-fade-leave-to {
    opacity: 0;
  }

  .dialog-fade-leave-to .add-dialog {
    opacity: 0;
    transform: scale(0.95) translateY(5px);
  }
</style>
