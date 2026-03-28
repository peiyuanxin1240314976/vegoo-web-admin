<template>
  <!-- 遮罩层 -->
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <!-- 抽屉主体 -->
  <transition name="drawer-slide">
    <div v-if="visible" class="account-detail-drawer">
      <!-- ── 头部 ─────────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-left">
          <div class="header-name-row">
            <span class="account-name">{{ accountData?.accountName }}</span>
            <span class="account-id-chip">{{ accountData?.id }}</span>
          </div>
          <div class="header-status-row">
            <span :class="['status-dot-wrap', getStatusClass(accountData?.status)]">
              <span class="status-dot" />
              {{ accountData?.status }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <ElButton round size="small" class="btn-edit" @click="handleEdit">编辑</ElButton>
          <ElButton
            v-if="accountData?.status !== '已停用'"
            round
            size="small"
            class="btn-disable"
            @click="handleDisable"
          >
            停用
          </ElButton>
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

      <!-- ── 正文滚动区 ──────────────────────────── -->
      <div class="drawer-body">
        <!-- 基本信息 -->
        <section class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">账户ID</span>
              <span class="info-val">{{ accountData?.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">账户名称</span>
              <span class="info-val">{{ accountData?.accountName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span class="info-val platform-val" :style="getPlatformStyle(accountData?.source)">
                {{ accountData?.source }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">账户类型</span>
              <span
                :class="[
                  'type-badge',
                  accountData?.accountType === '直投' ? 'type-badge--direct' : 'type-badge--proxy'
                ]"
              >
                {{ accountData?.accountType }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">归属BC/BM</span>
              <span class="info-val info-val--link">{{ accountData?.bcBm }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">归属代理商</span>
              <span class="info-val">{{ accountData?.agency }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">投放应用</span>
              <div class="app-tags">
                <span v-for="app in accountData?.apps" :key="app" class="app-tag">{{ app }}</span>
                <span v-if="!accountData?.apps?.length" class="info-val">—</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-key">投放平台</span>
              <span class="info-val">{{ accountData?.platform?.join('、') || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">账户用途</span>
              <div class="purpose-tags">
                <span
                  v-for="p in accountData?.purposes"
                  :key="p"
                  class="purpose-tag"
                >{{ p }}</span>
                <span v-if="!accountData?.purposes?.length" class="info-val">—</span>
              </div>
            </div>
            <div class="info-item">
              <span class="info-key">创建时间</span>
              <span class="info-val">{{ accountData?.createTime || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">备注</span>
              <span class="info-val info-val--remark">{{ accountData?.remark || '—' }}</span>
            </div>
          </div>
        </section>

        <!-- 财务信息 -->
        <section class="detail-section">
          <div class="section-title">财务信息</div>
          <div class="finance-grid">
            <div class="finance-item">
              <span class="finance-key">账户余额</span>
              <span class="finance-val finance-val--balance">
                ${{ (accountData?.balance ?? 0).toLocaleString('en-US') }}
              </span>
            </div>
            <div class="finance-item">
              <span class="finance-key">消耗上限</span>
              <span class="finance-val">
                ${{ (accountData?.spendLimit ?? 0).toLocaleString('en-US') }}/月
              </span>
            </div>
            <div class="finance-item">
              <span class="finance-key">本月消耗</span>
              <span class="finance-val">
                ${{ (accountData?.monthSpend ?? 0).toLocaleString('en-US') }}
              </span>
            </div>
            <div class="finance-item">
              <span class="finance-key">货币</span>
              <span class="finance-val">{{ accountData?.currency || 'USD' }}</span>
            </div>
          </div>
          <!-- 消耗进度 -->
          <div class="spend-progress-wrap">
            <div class="spend-progress-header">
              <span class="spend-progress-label">消耗进度</span>
              <span class="spend-progress-pct">{{ accountData?.spendProgress ?? 0 }}%</span>
            </div>
            <div class="spend-progress-bar">
              <div
                class="spend-progress-fill"
                :style="{ width: `${Math.min(accountData?.spendProgress ?? 0, 100)}%` }"
              />
            </div>
          </div>
          <div class="last-recharge-row">
            <span class="finance-key">最近充值</span>
            <span class="finance-val">
              {{ accountData?.lastRechargeTime }}
              <span class="recharge-amount">
                ${{ (accountData?.lastRechargeAmount ?? 0).toLocaleString('en-US') }}
              </span>
            </span>
          </div>
        </section>

        <!-- 关联凭据 -->
        <section class="detail-section">
          <div class="section-title">
            关联凭据
            <span class="section-sub">（凭据用于API接口调用）</span>
          </div>
          <div class="credential-card">
            <div class="credential-left">
              <span class="credential-name">{{ accountData?.credential || '—' }}</span>
              <span class="credential-platform">{{ accountData?.source }}</span>
              <span class="credential-token">客户端Token</span>
            </div>
            <div class="credential-right">
              <span class="credential-status">
                <span class="cred-dot cred-dot--ok" />
                验证正常
              </span>
              <button class="link-btn">跳转凭据管理 →</button>
            </div>
          </div>
          <div class="credential-hint">
            如需修改凭据内容，请前往「凭据管理」页签
          </div>
        </section>

        <!-- 近30天消耗走势 -->
        <section class="detail-section detail-section--last">
          <div class="section-title">近30天消耗走势</div>
          <div class="chart-placeholder">
            <svg viewBox="0 0 280 80" class="trend-svg">
              <polyline
                :points="trendPoints"
                fill="none"
                stroke="#3b82f6"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <polyline
                :points="trendAreaPoints"
                fill="url(#trendGrad)"
                stroke="none"
              />
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div class="chart-x-labels">
              <span v-for="lbl in xLabels" :key="lbl" class="x-label">{{ lbl }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- ── 底部操作栏 ───────────────────────────── -->
      <div class="drawer-footer">
        <ElButton round class="footer-btn footer-btn--recharge" @click="handleRecharge">
          充值
        </ElButton>
        <ElButton round class="footer-btn footer-btn--report">
          查看报表
        </ElButton>
        <ElButton round class="footer-btn footer-btn--credential">
          更换凭据
        </ElButton>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import type { AdAccountItem } from '../types'
  import { PLATFORM_CONFIGS } from '../types'

  defineOptions({ name: 'AccountDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    accountData: AdAccountItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [data: AdAccountItem]
    recharge: [data: AdAccountItem]
    disable: [data: AdAccountItem]
  }>()

  const handleClose = () => emit('update:visible', false)

  const handleEdit = () => {
    if (props.accountData) emit('edit', props.accountData)
  }

  const handleRecharge = () => {
    if (props.accountData) emit('recharge', props.accountData)
  }

  const handleDisable = () => {
    if (props.accountData) emit('disable', props.accountData)
  }

  function getStatusClass(status?: string) {
    if (status === '正常') return 'status--normal'
    if (status === '余额不足') return 'status--warning'
    return 'status--disabled'
  }

  function getPlatformStyle(source?: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color }
  }

  // ─── 趋势图简单 SVG ────────────────────────────────────
  const xLabels = ['2/12', '2/15', '2/22', '2/27', '3/6', '3/11', '3/13']

  const rawTrend = [2200, 2800, 3300, 2700, 3100, 3500, 3000, 2600, 3200, 2900, 3400, 3700, 3200]

  const trendPoints = computed(() => {
    const min = Math.min(...rawTrend)
    const max = Math.max(...rawTrend)
    const w = 280
    const h = 72
    return rawTrend
      .map((v, i) => {
        const x = (i / (rawTrend.length - 1)) * w
        const y = h - ((v - min) / (max - min)) * (h - 8) - 4
        return `${x},${y}`
      })
      .join(' ')
  })

  const trendAreaPoints = computed(() => {
    const min = Math.min(...rawTrend)
    const max = Math.max(...rawTrend)
    const w = 280
    const h = 72
    const pts = rawTrend
      .map((v, i) => {
        const x = (i / (rawTrend.length - 1)) * w
        const y = h - ((v - min) / (max - min)) * (h - 8) - 4
        return `${x},${y}`
      })
      .join(' ')
    return `${pts} ${w},${h} 0,${h}`
  })
</script>

<style lang="scss" scoped>
  .account-detail-drawer,
  .drawer-overlay {
    --bg-drawer: #0f1829;
    --bg-header: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-dim: rgb(59 130 246 / 12%);
    --green: #22c55e;
    --green-bg: rgb(34 197 94 / 12%);
    --amber: #f59e0b;
    --amber-bg: rgb(245 158 11 / 12%);
    --red: #ef4444;
    --red-bg: rgb(239 68 68 / 10%);
  }

  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 998;
    background: rgb(0 0 0 / 45%);
    backdrop-filter: blur(1px);
  }

  .account-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    width: 400px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-drawer);
    border-left: 1px solid var(--border);
    box-shadow: -12px 0 48px rgb(0 0 0 / 50%);
  }

  // ─── 头部 ──────────────────────────────────────────────
  .drawer-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: 18px 20px 14px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border);
  }

  .header-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .header-name-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .account-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .account-id-chip {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .header-status-row {
    display: flex;
    align-items: center;
  }

  .status-dot-wrap {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--normal { color: var(--green); }
    &.status--warning { color: var(--amber); }
    &.status--disabled { color: var(--text-muted); }
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    .status--normal & { background: var(--green); }
    .status--warning & { background: var(--amber); }
    .status--disabled & { background: var(--text-muted); }
  }

  .header-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    margin-left: 10px;
  }

  .btn-edit {
    height: 28px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
    color: var(--accent) !important;
    background: var(--accent-dim) !important;
    border: 1px solid rgb(59 130 246 / 30%) !important;
    border-radius: 6px !important;

    &:hover {
      background: rgb(59 130 246 / 20%) !important;
    }
  }

  .btn-disable {
    height: 28px !important;
    padding: 0 12px !important;
    font-size: 12px !important;
    color: var(--red) !important;
    background: transparent !important;
    border: 1px solid var(--red) !important;
    border-radius: 6px !important;

    &:hover {
      background: var(--red-bg) !important;
    }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--text-muted);
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: var(--text-primary);
      background: rgb(255 255 255 / 8%);
    }
  }

  // ─── 滚动主体 ──────────────────────────────────────────
  .drawer-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 8%);
      border-radius: 2px;
    }
  }

  .detail-section {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);

    &--last { border-bottom: none; }
  }

  .section-title {
    display: flex;
    gap: 6px;
    align-items: baseline;
    padding-left: 9px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  .section-sub {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-muted);
  }

  // ─── 基本信息列表 ──────────────────────────────────────
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .info-key {
    flex-shrink: 0;
    width: 72px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  .info-val {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.8;
    color: var(--text-primary);

    &--link {
      color: var(--accent);
      cursor: pointer;
    }

    &--remark {
      color: var(--text-secondary);
    }
  }

  .platform-val {
    font-size: 13px;
    font-weight: 500;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &--direct {
      color: var(--accent);
      background: var(--accent-dim);
    }

    &--proxy {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }
  }

  .app-tags,
  .purpose-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .app-tag {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .purpose-tag {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--green);
    background: var(--green-bg);
    border-radius: 4px;
  }

  // ─── 财务信息 ──────────────────────────────────────────
  .finance-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }

  .finance-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .finance-key {
    font-size: 11px;
    color: var(--text-muted);
  }

  .finance-val {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);

    &--balance {
      font-size: 18px;
      color: var(--accent);
    }
  }

  .spend-progress-wrap {
    margin-bottom: 12px;
  }

  .spend-progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .spend-progress-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .spend-progress-pct {
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
  }

  .spend-progress-bar {
    width: 100%;
    height: 6px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  .spend-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #60a5fa);
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .last-recharge-row {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .recharge-amount {
    margin-left: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--green);
  }

  // ─── 关联凭据 ──────────────────────────────────────────
  .credential-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    margin-bottom: 10px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .credential-left {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .credential-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .credential-platform {
    padding: 2px 6px;
    font-size: 11px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border-radius: 3px;
  }

  .credential-token {
    font-size: 11px;
    color: var(--text-muted);
  }

  .credential-right {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }

  .credential-status {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--green);
  }

  .cred-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    &--ok { background: var(--green); }
  }

  .link-btn {
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    background: none;
    border: none;
    transition: opacity 0.15s;

    &:hover { opacity: 0.7; }
  }

  .credential-hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  // ─── 趋势图 ─────────────────────────────────────────────
  .chart-placeholder {
    width: 100%;
  }

  .trend-svg {
    width: 100%;
    height: 80px;
    overflow: visible;
  }

  .chart-x-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
  }

  .x-label {
    font-size: 10px;
    color: var(--text-muted);
  }

  // ─── 底部操作栏 ────────────────────────────────────────
  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 14px 20px;
    background: var(--bg-header);
    border-top: 1px solid var(--border);
  }

  .footer-btn {
    flex: 1;
    height: 36px !important;
    font-size: 13px !important;
    border-radius: 8px !important;
    transition: all 0.15s !important;

    &--recharge {
      font-weight: 600 !important;
      color: #fff !important;
      background: var(--accent) !important;
      border: none !important;

      &:hover { filter: brightness(1.1); }
    }

    &--report {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid var(--border) !important;

      &:hover {
        color: var(--text-primary) !important;
        border-color: rgb(255 255 255 / 15%) !important;
      }
    }

    &--credential {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid var(--border) !important;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── 动画 ──────────────────────────────────────────────
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    transform: translateX(100%);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
