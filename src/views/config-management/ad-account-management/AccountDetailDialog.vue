<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Edit, View, CopyDocument } from '@element-plus/icons-vue'
  import type { AdAccount } from './types'

  // ─── Props & Emits ─────────────────────────────────────────────────────────
  const props = defineProps<{
    visible: boolean
    account: AdAccount | null
  }>()
  const emit = defineEmits<{
    'update:visible': [val: boolean]
    update: [data: Partial<AdAccount>]
  }>()

  // ─── State ─────────────────────────────────────────────────────────────────
  const isEditing = ref(false)
  const showToken = ref(false)
  const newAccountId = ref('')
  const form = ref<Partial<AdAccount>>({})

  watch(
    () => props.account,
    (val) => {
      if (val) form.value = { ...val, adAccounts: [...(val.adAccounts || [])] }
      isEditing.value = false
      showToken.value = false
    },
    { immediate: true }
  )

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        isEditing.value = false
        showToken.value = false
      }
    }
  )

  // ─── Computed ──────────────────────────────────────────────────────────────
  const dialogTitle = computed(() =>
    props.account
      ? `${props.account.appName} / ${props.account.platform} / ${props.account.adPlatform}`
      : ''
  )

  const maskedToken = computed(() => {
    if (!form.value.token) return ''
    if (showToken.value) return form.value.token
    return form.value.token.substring(0, 8) + '••••••••••••••••••••••••••••••••'
  })

  // ─── Methods ───────────────────────────────────────────────────────────────
  const close = () => emit('update:visible', false)

  const handleEdit = () => {
    isEditing.value = true
  }

  const handleCancel = () => {
    if (props.account)
      form.value = { ...props.account, adAccounts: [...(props.account.adAccounts || [])] }
    isEditing.value = false
  }

  const handleSave = () => {
    emit('update', { ...form.value })
    isEditing.value = false
  }

  const addAccountId = () => {
    const val = newAccountId.value.trim()
    if (!val) return
    if (!form.value.adAccounts) form.value.adAccounts = []
    form.value.adAccounts.push(val)
    newAccountId.value = ''
  }

  const removeAccountId = (idx: number) => {
    form.value.adAccounts?.splice(idx, 1)
  }

  const copyToken = async () => {
    if (!form.value.token) return
    await navigator.clipboard.writeText(form.value.token)
    ElMessage.success('Token 已复制')
  }

  const operationLogs = [
    { date: '2024-01-15', text: '账户状态已启用' },
    { date: '2024-01-10', text: 'Token 已更新' }
  ]
</script>

<template>
  <transition name="dialog-fade">
    <div v-if="visible" class="dialog-overlay" @click.self="close">
      <div class="detail-dialog" :class="{ 'detail-dialog--editing': isEditing }">
        <!-- ── 头部 ── -->
        <div class="dlg-header">
          <div>
            <div class="dlg-title">账户详情</div>
            <div class="dlg-sub">{{ dialogTitle }}</div>
          </div>
          <div class="dlg-header-actions">
            <button v-if="!isEditing" class="btn-edit-mode" @click="handleEdit">
              <el-icon><Edit /></el-icon> 编辑
            </button>
            <button class="btn-close" @click="close">关闭 ×</button>
          </div>
        </div>

        <!-- ── 正文 ── -->
        <div class="dlg-body">
          <!-- 基本信息 -->
          <section class="dlg-section">
            <div class="section-title"> <span class="section-bar" />基本信息 </div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">应用名</span>
                <span class="info-value">{{ form.appName }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">平台</span>
                <span class="info-value">
                  <span class="platform-chip">⚙ {{ form.platform }}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">广告平台</span>
                <span class="info-value">
                  <span class="google-chip">
                    <svg width="14" height="14" viewBox="0 0 48 48">
                      <path
                        fill="#4285F4"
                        d="M45.2 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.9c-.5 2.7-2 5-4.3 6.5v5.4h7c4.1-3.8 6.6-9.4 6.6-15.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 46c5.9 0 10.8-2 14.4-5.3l-7-5.4c-1.9 1.3-4.4 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.6v5.6C8.2 41.9 15.5 46 24 46z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M11.8 28.4c-.4-1.3-.7-2.7-.7-4.4s.3-3.1.7-4.4v-5.6H4.6C3 17.2 2 20.5 2 24s1 6.8 2.6 9.6l7.2-5.2z"
                      />
                      <path
                        fill="#EA4335"
                        d="M24 10.7c3.2 0 6.1 1.1 8.3 3.3l6.2-6.2C34.8 4.2 29.9 2 24 2 15.5 2 8.2 6.1 4.6 12.4l7.2 5.6c1.7-5.2 6.5-7.3 12.2-7.3z"
                      />
                    </svg>
                    {{ form.adPlatform }}
                  </span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">状态</span>
                <span class="info-value">
                  <span
                    class="status-chip"
                    :class="form.status === 'enabled' ? 'status-chip--on' : 'status-chip--off'"
                  >
                    <span class="status-dot-sm" />
                    {{ form.status === 'enabled' ? '已启用' : '已禁用' }}
                  </span>
                </span>
              </div>
            </div>
          </section>

          <!-- 账户信息 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />账户信息</div>
            <div class="info-grid">
              <div class="info-row">
                <span class="info-label">管理账户</span>
                <template v-if="isEditing">
                  <el-input
                    v-model="form.managerAccount"
                    class="edit-input"
                    placeholder="输入管理账户 ID"
                  />
                </template>
                <span v-else class="info-value mono">{{ form.managerAccount }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">凭据</span>
                <template v-if="isEditing">
                  <el-input
                    v-model="form.credential"
                    class="edit-input"
                    placeholder="输入凭据名称"
                  />
                </template>
                <span v-else class="info-value mono">{{ form.credential }}</span>
              </div>
            </div>
          </section>

          <!-- 广告账户 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />广告账户</div>
            <div class="section-desc">广告账户 ID 列表</div>
            <div class="account-tags">
              <span v-for="(acc, idx) in form.adAccounts" :key="idx" class="account-tag">
                {{ acc }}
                <span v-if="isEditing" class="tag-remove" @click="removeAccountId(idx)">×</span>
              </span>
              <span v-if="!form.adAccounts?.length" class="null-text">暂无账户 ID</span>
            </div>
            <div v-if="isEditing" class="add-account-row">
              <el-input
                v-model="newAccountId"
                class="edit-input"
                placeholder="输入账户 ID 后按 Enter 添加"
                @keyup.enter="addAccountId"
              />
            </div>
          </section>

          <!-- Token 认证 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />Token 认证</div>
            <div class="token-label-row">Token</div>
            <div v-if="form.token" class="token-box">
              <span class="token-value">{{ maskedToken }}</span>
              <div class="token-actions">
                <button class="token-btn" @click="showToken = !showToken">
                  <el-icon><View /></el-icon>
                  {{ showToken ? '点击隐藏' : '点击显示' }}
                </button>
                <button class="token-copy" @click="copyToken">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <div v-if="isEditing" class="token-edit-row">
              <el-input
                v-model="form.token"
                class="edit-input"
                placeholder="输入 API Token（可选）"
              >
                <template #suffix>
                  <el-icon style="color: #6b7280; cursor: pointer" @click="showToken = !showToken"
                    ><View
                  /></el-icon>
                </template>
              </el-input>
            </div>
            <div v-if="form.token && !isEditing" class="token-valid">
              <span class="valid-dot" />认证有效
            </div>
          </section>

          <!-- 操作日志 -->
          <section class="dlg-section">
            <div class="section-title"><span class="section-bar" />操作日志</div>
            <ul class="log-list">
              <li v-for="(log, i) in operationLogs" :key="i" class="log-item">
                <span class="log-dot" />
                <span class="log-date">{{ log.date }}</span>
                <span class="log-text">{{ log.text }}</span>
              </li>
            </ul>
          </section>
        </div>

        <!-- ── 底部操作（编辑模式） ── -->
        <div v-if="isEditing" class="dlg-footer dlg-footer--editing">
          <button class="btn-cancel" @click="handleCancel">取消</button>
          <button class="btn-save" @click="handleSave">保存</button>
        </div>
        <div v-else class="dlg-footer">
          <button class="btn-danger" @click="$emit('update:visible', false)">禁用账户</button>
          <button class="btn-danger btn-danger--delete">删除账户</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
  /* ── overlay ── */
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

  /* ── dialog box ── */
  .detail-dialog {
    display: flex;
    flex-direction: column;
    width: 520px;
    max-height: 88vh;
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
    color: #3b82f6;
  }

  .dlg-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .btn-edit-mode {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 6px 14px;
    font-size: 13px;
    color: #60a5fa;
    cursor: pointer;
    background: #253045;
    border: 1px solid #3b82f6;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-edit-mode:hover {
    background: #2d3a58;
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
    gap: 10px;
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

  .section-desc {
    margin-top: -4px;
    font-size: 12px;
    color: #6b7280;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .info-row {
    display: flex;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #1a2030;
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .info-label {
    flex-shrink: 0;
    width: 80px;
    font-size: 13px;
    color: #6b7280;
  }

  .info-value {
    font-size: 13px;
    color: #e2e8f0;
  }

  .info-value.mono {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    color: #94a3b8;
  }

  .platform-chip {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    color: #a3e635;
    background: rgb(163 230 53 / 10%);
    border: 1px solid rgb(163 230 53 / 20%);
    border-radius: 6px;
  }

  .google-chip {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    color: #93c5fd;
    background: rgb(66 133 244 / 10%);
    border: 1px solid rgb(66 133 244 / 25%);
    border-radius: 6px;
  }

  .status-chip {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 10px;
    font-size: 12px;
    border-radius: 6px;
  }

  .status-chip--on {
    color: #34d399;
    background: rgb(16 185 129 / 10%);
    border: 1px solid rgb(16 185 129 / 25%);
  }

  .status-chip--off {
    color: #f87171;
    background: rgb(239 68 68 / 10%);
    border: 1px solid rgb(239 68 68 / 25%);
  }

  .status-dot-sm {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    background: currentcolor;
    border-radius: 50%;
  }

  /* ── account tags ── */
  .account-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .account-tag {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    color: #93c5fd;
    background: rgb(59 130 246 / 12%);
    border: 1px solid rgb(59 130 246 / 25%);
    border-radius: 8px;
    transition: all 0.2s;
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

  .null-text {
    font-size: 13px;
    font-style: italic;
    color: #4b5563;
  }

  .add-account-row {
    margin-top: 8px;
  }

  /* ── token ── */
  .token-label-row {
    margin-bottom: 4px;
    font-size: 13px;
    color: #6b7280;
  }

  .token-box {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px 16px;
    background: #1a2030;
    border: 1px solid #2d3a50;
    border-radius: 10px;
  }

  .token-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #cbd5e1;
    word-break: break-all;
  }

  .token-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .token-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 12px;
    font-size: 12px;
    color: #6b7280;
    cursor: pointer;
    background: rgb(255 255 255 / 5%);
    border: 1px solid #2d3a50;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .token-btn:hover {
    color: #94a3b8;
    border-color: #4b5563;
  }

  .token-copy {
    padding: 4px 8px;
    color: #6b7280;
    cursor: pointer;
    background: rgb(255 255 255 / 5%);
    border: 1px solid #2d3a50;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .token-copy:hover {
    color: #3b82f6;
    border-color: #3b82f6;
  }

  .token-valid {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-top: 2px;
    font-size: 12px;
    color: #10b981;
  }

  .valid-dot {
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
  }

  .token-edit-row {
    margin-top: 8px;
  }

  /* ── log ── */
  .log-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .log-item {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
  }

  .log-dot {
    flex-shrink: 0;
    width: 5px;
    height: 5px;
    background: #4b5563;
    border-radius: 50%;
  }

  .log-date {
    flex-shrink: 0;
    width: 90px;
    color: #6b7280;
  }

  .log-text {
    color: #94a3b8;
  }

  /* ── footer ── */
  .dlg-footer {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #1e2535;
  }

  .dlg-footer--editing {
    justify-content: flex-end;
  }

  .btn-danger {
    padding: 8px 20px;
    font-size: 13px;
    color: #f87171;
    cursor: pointer;
    background: rgb(239 68 68 / 10%);
    border: 1px solid rgb(239 68 68 / 30%);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-danger:hover {
    background: rgb(239 68 68 / 20%);
  }

  .btn-cancel {
    padding: 8px 24px;
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
    padding: 8px 32px;
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
  }

  /* ── edit input override ── */
  :deep(.edit-input .el-input__wrapper) {
    background: #1a2030 !important;
    border: 1px solid #2d3a50 !important;
    border-radius: 8px !important;
    box-shadow: none !important;
    transition: border-color 0.2s !important;
  }

  :deep(.edit-input .el-input__wrapper:hover),
  :deep(.edit-input .el-input__wrapper.is-focus) {
    border-color: #3b82f6 !important;
  }

  :deep(.edit-input .el-input__inner) {
    font-size: 13px !important;
    color: #e2e8f0 !important;
    background: transparent !important;
  }

  /* ── transition ── */
  .dialog-fade-enter-active,
  .dialog-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .dialog-fade-enter-active .detail-dialog,
  .dialog-fade-leave-active .detail-dialog {
    transition:
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.2s ease;
  }

  .dialog-fade-enter-from {
    opacity: 0;
  }

  .dialog-fade-enter-from .detail-dialog {
    opacity: 0;
    transform: scale(0.93) translateY(10px);
  }

  .dialog-fade-leave-to {
    opacity: 0;
  }

  .dialog-fade-leave-to .detail-dialog {
    opacity: 0;
    transform: scale(0.95) translateY(5px);
  }
</style>
