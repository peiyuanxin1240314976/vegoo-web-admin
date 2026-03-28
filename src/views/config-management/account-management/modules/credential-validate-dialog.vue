<template>
  <el-dialog
    v-model="dialogVisible"
    title="接口验证结果"
    width="440px"
    :close-on-click-modal="false"
    header-class="cred-validate-dialog-hd"
    body-class="cred-validate-dialog-bd"
    footer-class="cred-validate-dialog-ft"
  >
    <!-- 凭据标识 -->
    <div class="cred-chip">
      <span class="chip-platform-icon" :style="{ color: getPlatformColor(credData?.source ?? '') }">
        {{ getPlatformShort(credData?.source ?? '') }}
      </span>
      <span class="chip-name">{{ credData?.name }}</span>
      <span class="chip-sep">|</span>
      <span class="chip-type">{{ credData?.credentialType }}</span>
    </div>

    <!-- 验证中 / 验证完成 -->
    <div v-if="validating" class="validating-wrap">
      <div class="validating-spin">
        <svg viewBox="0 0 40 40" width="48" height="48">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgb(59 130 246 / 20%)" stroke-width="3" />
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="#3b82f6"
            stroke-width="3"
            stroke-dasharray="60 40"
            stroke-linecap="round"
          >
            <animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.9s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <p class="validating-text">正在验证接口连通性…</p>
    </div>

    <template v-else-if="result">
      <!-- 验证结果图标 -->
      <div :class="['result-icon-wrap', result.success ? 'result-icon-wrap--ok' : 'result-icon-wrap--fail']">
        <svg v-if="result.success" viewBox="0 0 48 48" fill="none" width="48" height="48">
          <circle cx="24" cy="24" r="22" fill="rgb(34 197 94 / 15%)" stroke="#22c55e" stroke-width="2" />
          <path d="M14 24l8 8 12-14" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <svg v-else viewBox="0 0 48 48" fill="none" width="48" height="48">
          <circle cx="24" cy="24" r="22" fill="rgb(248 113 113 / 15%)" stroke="#f87171" stroke-width="2" />
          <path d="M16 16l16 16M32 16L16 32" stroke="#f87171" stroke-width="2.5" stroke-linecap="round" />
        </svg>
        <p :class="['result-text', result.success ? 'result-text--ok' : 'result-text--fail']">
          {{ result.success ? '验证成功' : '验证失败' }}
        </p>
      </div>

      <!-- 验证详情 -->
      <div class="result-info">
        <div class="info-row">
          <span class="info-key">验证时间</span>
          <span class="info-val">{{ result.validateTime }}</span>
        </div>
        <div class="info-row">
          <span class="info-key">响应时间</span>
          <span class="info-val">{{ result.responseTime }}ms</span>
        </div>
        <div class="info-row">
          <span class="info-key">接口版本</span>
          <span class="info-val">{{ result.apiVersion }}</span>
        </div>
      </div>

      <!-- 账户权限 -->
      <div v-if="result.permissions?.length" class="perm-section">
        <div class="perm-title">账户权限</div>
        <div class="perm-list">
          <div v-for="perm in result.permissions" :key="perm.label" class="perm-item">
            <span :class="['perm-icon', perm.granted ? 'perm-icon--ok' : 'perm-icon--no']">
              {{ perm.granted ? '✓' : '✗' }}
            </span>
            <span class="perm-label">{{ perm.label }}</span>
          </div>
        </div>
      </div>

      <!-- 可访问账户 -->
      <div v-if="result.accessibleAccounts?.length" class="account-access-section">
        <span class="account-access-label">可访问账户：</span>
        <span class="account-access-count">{{ result.totalAccountCount }}个</span>
        <span v-for="acc in result.accessibleAccounts.slice(0, 3)" :key="acc" class="acc-chip">
          {{ acc }}
        </span>
        <span v-if="result.totalAccountCount > 3" class="acc-more">
          +{{ result.totalAccountCount - 3 }}个
        </span>
      </div>
    </template>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--close" @click="handleClose">关闭</ElButton>
      <ElButton
        v-if="result?.success"
        round
        class="dialog-btn dialog-btn--confirm"
        @click="handleConfirm"
      >
        确认保存
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { PLATFORM_CONFIGS } from '../types'
  import type { CredentialItem, CredentialValidateResult } from '../types'

  defineOptions({ name: 'CredentialValidateDialog' })

  const props = defineProps<{
    visible: boolean
    credData: CredentialItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const validating = ref(false)
  const result = ref<CredentialValidateResult | null>(null)

  watch(
    () => props.visible,
    async (v) => {
      if (!v) { result.value = null; return }
      validating.value = true
      result.value = null
      // 模拟验证请求
      await new Promise((r) => setTimeout(r, 1600))
      validating.value = false
      const success = props.credData?.status !== '验证失败'
      result.value = {
        success,
        validateTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        responseTime: Math.floor(Math.random() * 300 + 100),
        apiVersion: 'v18.0',
        permissions: success
          ? [
              { label: '广告账户管理员', granted: true },
              { label: '广告主', granted: true },
              { label: '公共页面管理员', granted: true },
              { label: '广告创意上传', granted: false }
            ]
          : [],
        accessibleAccounts: success ? (props.credData?.accountIds?.slice(0, 3) ?? []) : [],
        totalAccountCount: success ? (props.credData?.accountCount ?? 0) : 0
      }
    }
  )

  function getPlatformColor(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.color ?? '#94a3b8'
  }

  function getPlatformShort(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.shortLabel ?? source[0]
  }

  const handleClose = () => emit('update:visible', false)
  const handleConfirm = () => { emit('confirm'); emit('update:visible', false) }
</script>

<!-- 非 scoped -->
<style lang="scss">
  .el-dialog:has(.cred-validate-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }

  .el-dialog:has(.cred-validate-dialog-bd) .el-dialog__header.cred-validate-dialog-hd {
    padding: 18px 20px 16px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.cred-validate-dialog-bd) .el-dialog__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.cred-validate-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }

  .el-dialog:has(.cred-validate-dialog-bd) .el-dialog__body.cred-validate-dialog-bd {
    padding: 20px;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.cred-validate-dialog-bd) .el-dialog__footer.cred-validate-dialog-ft {
    padding: 14px 20px;
    text-align: right;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  // ─── 凭据 Chip ───────────────────────────────────────
  .cred-chip {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 6px 14px;
    margin-bottom: 20px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 20px;
  }

  .chip-platform-icon {
    font-size: 12px;
    font-weight: 700;
  }

  .chip-name {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .chip-sep { color: #334155; }

  .chip-type {
    font-size: 12px;
    color: #64748b;
  }

  // ─── 验证中 ──────────────────────────────────────────
  .validating-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    padding: 24px 0;
  }

  .validating-spin { color: #3b82f6; }

  .validating-text {
    font-size: 14px;
    color: #64748b;
  }

  // ─── 验证结果图标 ────────────────────────────────────
  .result-icon-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    padding: 8px 0 16px;
  }

  .result-text {
    font-size: 18px;
    font-weight: 700;

    &--ok   { color: #22c55e; }
    &--fail { color: #f87171; }
  }

  // ─── 验证详情 ────────────────────────────────────────
  .result-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    margin-bottom: 16px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 8px;
  }

  .info-row {
    display: flex;
    gap: 16px;
    align-items: center;
    font-size: 13px;
  }

  .info-key {
    flex-shrink: 0;
    width: 70px;
    color: #64748b;
  }

  .info-val { color: #e2e8f0; }

  // ─── 权限列表 ────────────────────────────────────────
  .perm-section { margin-bottom: 16px; }

  .perm-title {
    margin-bottom: 10px;
    font-size: 12px;
    color: #64748b;
  }

  .perm-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .perm-item {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: #cbd5e1;
  }

  .perm-icon {
    font-size: 13px;
    font-weight: 700;

    &--ok  { color: #22c55e; }
    &--no  { color: #f87171; }
  }

  // ─── 可访问账户 ──────────────────────────────────────
  .account-access-section {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .account-access-label { color: #64748b; }

  .account-access-count {
    font-weight: 600;
    color: #3b82f6;
  }

  .acc-chip {
    padding: 2px 8px;
    color: #94a3b8;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 4px;
  }

  .acc-more {
    color: #64748b;
  }

  // ─── 底部按钮 ────────────────────────────────────────
  .dialog-btn {
    border-radius: 8px !important;

    &--close {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      &:hover { color: #e2e8f0 !important; border-color: rgb(255 255 255 / 20%) !important; }
    }

    &--confirm {
      color: #fff !important;
      background: #3b82f6 !important;
      border: none !important;
      &:hover { filter: brightness(1.1); }
    }
  }
</style>
