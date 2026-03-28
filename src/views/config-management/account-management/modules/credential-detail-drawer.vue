<template>
  <!-- 遮罩 -->
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <!-- 抽屉主体 -->
  <transition name="drawer-slide">
    <div v-if="visible" class="credential-detail-drawer">
      <!-- ── 头部 ─────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-left">
          <span class="cred-name">{{ credData?.name }}</span>
          <span :class="['status-badge', getStatusClass(credData?.status)]">
            <span class="status-dot" />
            {{ credData?.status }}
          </span>
        </div>
        <div class="header-right">
          <ElButton round size="small" class="btn-edit" @click="handleEdit">编辑凭据</ElButton>
          <ElButton round size="small" class="btn-delete" @click="handleDelete">删除</ElButton>
          <button class="close-btn" @click="handleClose">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- ── 正文 ──────────────────────────── -->
      <div class="drawer-body">
        <!-- 凭据基本信息 -->
        <section class="detail-section">
          <div class="section-title">凭据基本信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span class="platform-cell">
                <span
                  class="platform-icon"
                  :style="{ color: getPlatformColor(credData?.source ?? '') }"
                >
                  {{ getPlatformShort(credData?.source ?? '') }}
                </span>
                <span class="info-val">{{ credData?.source }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">分组</span>
              <span class="info-val">{{ credData?.group }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">凭据类型</span>
              <span class="info-val">{{ credData?.credentialType }}</span>
            </div>
            <div v-if="credData?.remark" class="info-item">
              <span class="info-key">备注</span>
              <span class="info-val">{{ credData.remark }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">关联应用</span>
              <div class="apps-wrap">
                <span v-for="app in credData?.apps" :key="app" class="app-tag">{{ app }}</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-key">关联账户数</span>
              <span class="info-val info-val--blue">{{ credData?.accountCount }}个</span>
            </div>
          </div>
        </section>

        <!-- 凭据配置 -->
        <section class="detail-section">
          <div class="section-header">
            <span class="section-title">凭据配置</span>
            <div class="show-toggle">
              <span class="toggle-label">显示内容</span>
              <el-switch v-model="showSecret" size="small" class="secret-switch" />
            </div>
          </div>
          <div class="config-list">
            <template v-if="credData?.config.account">
              <div class="config-row">
                <span class="config-key">账号</span>
                <div class="config-val-wrap">
                  <span class="config-val">{{
                    showSecret ? credData.config.account : maskStr(credData.config.account)
                  }}</span>
                  <button class="copy-btn" @click="handleCopy(credData.config.account ?? '')">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                      <path
                        d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                    </svg>
                  </button>
                </div>
                <span v-if="credData.config.password" class="config-key ml">密码</span>
                <div v-if="credData.config.password" class="config-val-wrap">
                  <span class="config-val">{{
                    showSecret ? credData.config.password : '••••••••'
                  }}</span>
                  <button class="copy-btn" @click="handleCopy(credData.config.password ?? '')">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                      <path
                        d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
            <template v-if="credData?.config.clientId">
              <div class="config-row">
                <span class="config-key">客户端 ID</span>
                <div class="config-val-wrap">
                  <span class="config-val">{{
                    showSecret ? credData.config.clientId : maskStr(credData.config.clientId)
                  }}</span>
                  <button class="copy-btn" @click="handleCopy(credData.config.clientId ?? '')">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                      <path
                        d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                    </svg>
                  </button>
                </div>
                <span v-if="credData.config.clientSecret" class="config-key ml">客户端密码</span>
                <div v-if="credData.config.clientSecret" class="config-val-wrap">
                  <span class="config-val">••••••••</span>
                  <button class="copy-btn" @click="handleCopy(credData.config.clientSecret ?? '')">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                      <path
                        d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
            <template v-if="credData?.config.accessToken">
              <div class="config-row">
                <span class="config-key">访问令牌</span>
                <div class="config-val-wrap">
                  <span class="config-val">{{
                    showSecret ? credData.config.accessToken : maskStr(credData.config.accessToken)
                  }}</span>
                  <button class="copy-btn" @click="handleCopy(credData.config.accessToken ?? '')">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                      <path
                        d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                    </svg>
                  </button>
                </div>
                <span v-if="credData.config.refreshToken" class="config-key ml">刷新令牌</span>
                <div v-if="credData.config.refreshToken" class="config-val-wrap">
                  <span class="config-val">••••••••</span>
                  <button class="copy-btn" @click="handleCopy(credData.config.refreshToken ?? '')">
                    <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
                      <rect
                        x="5"
                        y="5"
                        width="9"
                        height="9"
                        rx="2"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                      <path
                        d="M3 11H2a1 1 0 01-1-1V2a1 1 0 011-1h8a1 1 0 011 1v1"
                        stroke="currentColor"
                        stroke-width="1.4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- 验证记录 -->
        <section class="detail-section">
          <div class="section-title"
            >验证记录 <span class="section-subtitle">（最近 5 条）</span></div
          >
          <div v-if="credData?.validateHistory.length" class="validate-history">
            <div
              v-for="(rec, i) in credData.validateHistory.slice(0, 5)"
              :key="i"
              class="history-item"
            >
              <span
                :class="[
                  'history-dot',
                  rec.status === '验证成功' ? 'history-dot--ok' : 'history-dot--fail'
                ]"
              />
              <span class="history-time">{{ rec.time }}</span>
              <span
                :class="[
                  'history-status',
                  rec.status === '验证成功' ? 'history-status--ok' : 'history-status--fail'
                ]"
              >
                {{ rec.status }}
                <span v-if="rec.detail" class="history-detail">{{ rec.detail }}</span>
              </span>
              <span class="history-trigger">{{ rec.operator ? rec.operator : rec.trigger }}</span>
            </div>
          </div>
          <div v-else class="no-history">暂无验证记录</div>
        </section>
      </div>

      <!-- ── 底部操作 ──────────────────────── -->
      <div class="drawer-footer">
        <ElButton round class="footer-btn footer-btn--validate" @click="handleValidate"
          >立即验证</ElButton
        >
        <ElButton round class="footer-btn footer-btn--edit" @click="handleEdit">编辑凭据</ElButton>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import type { CredentialItem } from '../types'

  defineOptions({ name: 'CredentialDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    credData: CredentialItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [row: CredentialItem]
    delete: [row: CredentialItem]
    validate: [row: CredentialItem]
  }>()

  const showSecret = ref(false)

  const handleClose = () => {
    showSecret.value = false
    emit('update:visible', false)
  }
  const handleEdit = () => {
    if (props.credData) emit('edit', props.credData)
  }
  const handleDelete = () => {
    if (props.credData) emit('delete', props.credData)
  }
  const handleValidate = () => {
    if (props.credData) emit('validate', props.credData)
  }

  function getPlatformColor(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.color ?? '#94a3b8'
  }

  function getPlatformShort(source: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === source)?.shortLabel ?? source[0]
  }

  function getStatusClass(status?: string) {
    if (status === '验证正常') return 'status-badge--ok'
    if (status === '验证失败') return 'status-badge--fail'
    return 'status-badge--pending'
  }

  function maskStr(val: string) {
    if (!val) return ''
    if (val.includes('••')) return val
    const show = Math.min(6, Math.floor(val.length / 2))
    return val.slice(0, show) + '••••••••'
  }

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text).then(() => ElMessage.success('已复制'))
  }
</script>

<style lang="scss" scoped>
  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgb(0 0 0 / 40%);
  }

  .credential-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    width: 440px;
    background: #131c2e;
    border-left: 1px solid rgb(255 255 255 / 7%);
    box-shadow: -8px 0 40px rgb(0 0 0 / 50%);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.22s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    transform: translateX(100%);
  }

  // ─── 头部 ────────────────────────────────────────────
  .drawer-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .header-left {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    min-width: 0;
  }

  .cred-name {
    font-size: 17px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .header-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  .btn-edit {
    padding: 5px 12px !important;
    font-size: 12px !important;
    color: #3b82f6 !important;
    background: rgb(59 130 246 / 10%) !important;
    border: 1px solid rgb(59 130 246 / 25%) !important;
    border-radius: 6px !important;
    &:hover {
      background: rgb(59 130 246 / 20%) !important;
    }
  }

  .btn-delete {
    padding: 5px 12px !important;
    font-size: 12px !important;
    color: #f87171 !important;
    background: rgb(248 113 113 / 10%) !important;
    border: 1px solid rgb(248 113 113 / 25%) !important;
    border-radius: 6px !important;
    &:hover {
      background: rgb(248 113 113 / 20%) !important;
    }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: #64748b;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;

    &:hover {
      color: #e2e8f0;
      background: rgb(255 255 255 / 6%);
    }
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 20px;

    &--ok {
      color: #22c55e;
      background: rgb(34 197 94 / 10%);

      .status-dot {
        background: #22c55e;
      }
    }

    &--fail {
      color: #f87171;
      background: rgb(248 113 113 / 10%);

      .status-dot {
        background: #f87171;
      }
    }

    &--pending {
      color: #f59e0b;
      background: rgb(245 158 11 / 10%);

      .status-dot {
        background: transparent;
        border: 1.5px solid #f59e0b;
      }
    }
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  // ─── 正文 ────────────────────────────────────────────
  .drawer-body {
    flex: 1;
    padding: 0 20px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 10%);
      border-radius: 2px;
    }
  }

  .detail-section {
    padding: 16px 0;
    border-bottom: 1px solid rgb(255 255 255 / 5%);
    &:last-child {
      border-bottom: none;
    }
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .section-title {
    margin-bottom: 14px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .section-header .section-title {
    margin-bottom: 0;
  }

  .section-subtitle {
    font-weight: 400;
    color: #334155;
    text-transform: none;
  }

  .show-toggle {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .toggle-label {
    font-size: 12px;
    color: #64748b;
  }

  .secret-switch {
    --el-switch-on-color: #3b82f6;
    --el-switch-off-color: rgb(255 255 255 / 15%);
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-item {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .info-key {
    flex-shrink: 0;
    width: 80px;
    font-size: 12px;
    color: #64748b;
  }

  .info-val {
    font-size: 13px;
    color: #e2e8f0;

    &--blue {
      font-weight: 600;
      color: #3b82f6;
    }
  }

  .platform-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .platform-icon {
    font-size: 11px;
    font-weight: 700;
  }

  .apps-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .app-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: #3b82f6;
    background: rgb(59 130 246 / 10%);
    border-radius: 4px;
  }

  // ─── 凭据配置 ────────────────────────────────────────
  .config-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .config-row {
    display: grid;
    grid-template-columns: 80px 1fr 80px 1fr;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 7px;
  }

  .config-key {
    font-size: 11px;
    color: #64748b;

    &.ml {
      margin-left: 4px;
    }
  }

  .config-val-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  .config-val {
    overflow: hidden;
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 12px;
    color: #cbd5e1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy-btn {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 2px;
    color: #475569;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 3px;
    transition: color 0.15s;
    &:hover {
      color: #94a3b8;
    }
  }

  // ─── 验证历史 ────────────────────────────────────────
  .validate-history {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .history-item {
    display: grid;
    grid-template-columns: 10px 130px 1fr auto;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .history-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--ok {
      background: #22c55e;
    }
    &--fail {
      background: #f87171;
    }
  }

  .history-time {
    font-family: monospace;
    color: #64748b;
  }

  .history-status {
    &--ok {
      color: #22c55e;
    }
    &--fail {
      color: #f87171;
    }
  }

  .history-detail {
    margin-left: 4px;
    font-size: 11px;
    color: #94a3b8;
  }

  .history-trigger {
    color: #475569;
    text-align: right;
  }

  .no-history {
    padding: 16px 0;
    font-size: 13px;
    color: #475569;
    text-align: center;
  }

  // ─── 底部 ────────────────────────────────────────────
  .drawer-footer {
    display: flex;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid rgb(255 255 255 / 7%);
  }

  .footer-btn {
    flex: 1;
    font-size: 13px !important;
    border-radius: 8px !important;

    &--validate {
      color: #fff !important;
      background: #3b82f6 !important;
      border: none !important;
      &:hover {
        filter: brightness(1.1);
      }
    }

    &--edit {
      color: #94a3b8 !important;
      background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;

      &:hover {
        color: #e2e8f0 !important;
        border-color: rgb(255 255 255 / 20%) !important;
      }
    }
  }
</style>
