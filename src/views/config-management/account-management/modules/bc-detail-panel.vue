<template>
  <div class="bc-detail-panel">
    <div v-if="!bcData" class="empty-state">
      <svg viewBox="0 0 48 48" fill="none" width="36" height="36"><rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5"/><path d="M16 18h16M16 24h10M16 30h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <p class="empty-text">请选择 BC 查看详情</p>
    </div>

    <template v-else>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-left">
          <span class="bc-name">{{ bcData.bmName }}</span>
          <span class="bc-id-chip">{{ bcData.id }}</span>
        </div>
        <span :class="['status-badge', getStatusClass(bcData.status)]">
          <span class="s-dot">{{ getStatusIcon(bcData.status) }}</span>{{ bcData.status }}
        </span>
      </div>

      <!-- 正文滚动 -->
      <div class="panel-body">
        <!-- 基本信息 -->
        <section class="detail-section">
          <div class="section-title-row">
            <span class="section-title">基础信息</span>
            <button class="edit-link" @click="emit('edit', bcData)">编辑</button>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">BM ID</span>
              <span class="info-val info-val--mono">{{ bcData.bmId }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">BM名称</span>
              <span class="info-val">{{ bcData.bmName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span class="info-val platform-val" :style="getPlatformStyle(bcData.source)">{{ bcData.source }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">归属组</span>
              <span class="group-badge">{{ bcData.group }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">状态</span>
              <span :class="['status-badge status-badge--sm', getStatusClass(bcData.status)]">
                <span class="s-dot">{{ getStatusIcon(bcData.status) }}</span>{{ bcData.status }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">开户主体</span>
              <span :class="['owner-badge', `owner-badge--${ownerClass(bcData.ownerType)}`]">{{ bcData.ownerType }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">管理员</span>
              <span class="info-val">{{ bcData.manager }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">封户记录</span>
              <span :class="['ban-badge', bcData.banRecord === '有' ? 'ban-badge--yes' : 'ban-badge--no']">{{ bcData.banRecord }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">创建时间</span>
              <span class="info-val">{{ bcData.createTime }}</span>
            </div>
            <div v-if="bcData.remark" class="info-item">
              <span class="info-key">备注</span>
              <span class="info-val info-val--remark">{{ bcData.remark }}</span>
            </div>
          </div>
        </section>

        <!-- 账户累计 -->
        <section class="detail-section">
          <div class="section-title">账户累计</div>
          <div class="stats-row">
            关联账户数 <strong class="sn sn--blue">{{ bcData.linkedAccounts }} 个</strong>
            <span class="s-sep">｜</span>
            活跃 <strong class="sn sn--green">{{ bcData.activeAccounts }} 个</strong>
            <span class="s-sep">｜</span>
            已停用 <strong class="sn sn--muted">{{ bcData.inactiveAccounts }} 个</strong>
          </div>
          <div class="stats-row">
            本月消耗 <strong class="sn sn--amber">${{ (bcData.monthSpend ?? 0).toLocaleString('en-US') }}</strong>
          </div>
          <div class="stats-row">
            本月开户 <strong class="sn sn--blue">{{ bcData.monthOpenCount }} 个</strong>
          </div>
        </section>

        <!-- 走势图 -->
        <section class="detail-section detail-section--last">
          <div class="chart-header">
            <span class="chart-label">消耗</span>
            <span class="chart-range">7天</span>
          </div>
          <svg class="spend-chart" viewBox="0 0 320 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bc-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0d9488" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#0d9488" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#bc-grad)"/>
            <polyline :points="chartPoints" fill="none" stroke="#0d9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </section>
      </div>

      <!-- 底部 -->
      <div class="panel-footer">
        <ElButton round class="footer-btn footer-btn--primary">查看关联账户</ElButton>
        <ElButton round class="footer-btn footer-btn--secondary" @click="emit('edit', bcData)">编辑</ElButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { PLATFORM_CONFIGS } from '../types'
  import type { BcItem } from '../types'

  defineOptions({ name: 'BcDetailPanel' })

  const props = defineProps<{ bcData: BcItem | null }>()

  const emit = defineEmits<{
    edit: [data: BcItem]
  }>()

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    return cfg ? { color: cfg.color } : {}
  }

  function getStatusClass(status?: string) {
    if (status === '健康') return 'status--healthy'
    if (status === '可用') return 'status--available'
    if (status === '封禁') return 'status--banned'
    if (status === '不再使用') return 'status--inactive'
    return 'status--other'
  }

  function getStatusIcon(status?: string) {
    if (status === '健康' || status === '可用') return '●'
    if (status === '封禁') return '▲'
    if (status === '不再使用') return '■'
    return '●'
  }

  function ownerClass(ownerType?: string) {
    if (ownerType === '企业户') return 'corp'
    if (ownerType === '个人户') return 'personal'
    return 'small'
  }

  const chartData = computed(() => {
    const base = (props.bcData?.monthSpend ?? 1000) / 7
    return Array.from({ length: 7 }, (_, i) =>
      Math.max(0, base * (0.6 + Math.sin(i * 1.1) * 0.25 + Math.random() * 0.2))
    )
  })

  const chartPoints = computed(() => {
    const data = chartData.value
    const max = Math.max(...data, 1)
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * 320
      const y = 72 - (v / max) * 60
      return `${x},${y}`
    }).join(' ')
  })

  const areaPath = computed(() => {
    const pts = chartPoints.value.split(' ')
    return `M0,72 ${pts.map((p) => `L${p}`).join(' ')} L320,72 Z`
  })
</script>

<style lang="scss" scoped>
  .bc-detail-panel {
    --bg-panel: #0f1829;
    --bg-hd: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --teal: #0d9488;
    --green: #22c55e;
    --amber: #f59e0b;

    display: flex;
    flex-direction: column;
    width: 340px;
    min-width: 340px;
    height: 100%;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .empty-state {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }
  .empty-text { font-size: 13px; }

  // 头部
  .panel-header {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    background: var(--bg-hd);
    border-bottom: 1px solid var(--border);
  }

  .header-left {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .bc-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .bc-id-chip {
    padding: 2px 7px;
    font-size: 11px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 600;

    &.status--healthy   { color: #22c55e; }
    &.status--available { color: #3b82f6; }
    &.status--banned    { color: #f59e0b; }
    &.status--inactive  { color: #64748b; }
    &.status--other     { color: #94a3b8; }

    &--sm { font-size: 12px; font-weight: 500; }
  }

  .s-dot { font-size: 10px; }

  // 正文
  .panel-body {
    flex: 1;
    overflow-y: auto;
    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-thumb { background: rgb(255 255 255 / 8%); border-radius: 2px; }
  }

  .detail-section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    &--last { border-bottom: none; }
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .section-title {
    display: block;
    padding-left: 8px;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  .section-title-row .section-title { margin-bottom: 0; }

  .edit-link {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    background: none;
    background: rgb(59 130 246 / 10%);
    border: none;
    border-radius: 4px;
    &:hover { background: rgb(59 130 246 / 20%); }
  }

  .info-list { display: flex; flex-direction: column; gap: 8px; }

  .info-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .info-key {
    flex-shrink: 0;
    width: 60px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  .info-val {
    flex: 1;
    font-size: 13px;
    line-height: 1.8;
    color: var(--text-primary);
    &--mono { font-family: 'SF Mono', monospace; font-size: 11px; color: var(--text-secondary); }
    &--remark { color: var(--text-secondary); }
  }

  .platform-val { font-size: 13px; font-weight: 600; }

  .group-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    color: #34d399;
    background: rgb(52 211 153 / 12%);
    border-radius: 4px;
  }

  .owner-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;
    &--corp     { color: #60a5fa; background: rgb(96 165 250 / 12%); }
    &--personal { color: #a78bfa; background: rgb(167 139 250 / 12%); }
    &--small    { color: #34d399; background: rgb(52 211 153 / 12%); }
  }

  .ban-badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
    &--no  { color: #64748b; background: rgb(100 116 139 / 15%); }
    &--yes { color: #f59e0b; background: rgb(245 158 11 / 15%); }
  }

  // 账户累计
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 6px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--text-secondary);
    &:last-child { margin-bottom: 0; }
  }

  .sn {
    font-weight: 600;
    &--blue  { color: var(--accent); }
    &--green { color: var(--green); }
    &--amber { color: var(--amber); }
    &--muted { color: var(--text-muted); }
  }

  .s-sep { color: var(--border); }

  // 走势图
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .chart-label { font-size: 11px; color: var(--text-muted); }
  .chart-range { font-size: 11px; color: var(--teal); }

  .spend-chart {
    display: block;
    width: 100%;
    height: 80px;
  }

  // 底部
  .panel-footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-hd);
    border-top: 1px solid var(--border);
  }

  .footer-btn {
    flex: 1;
    height: 32px !important;
    font-size: 12px !important;
    border-radius: 7px !important;

    &--primary {
      color: #fff !important;
      background: var(--teal) !important;
      border: none !important;
      &:hover { filter: brightness(1.1); }
    }

    &--secondary {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid var(--border) !important;
      &:hover { color: var(--text-primary) !important; border-color: rgb(255 255 255 / 15%) !important; }
    }
  }
</style>
