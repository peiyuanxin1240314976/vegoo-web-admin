<template>
  <div class="agency-detail-panel">
    <!-- 空状态 -->
    <div v-if="!agencyData" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
          <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5"/>
          <path d="M16 18h16M16 24h10M16 30h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <p class="empty-text">请选择代理商查看详情</p>
    </div>

    <template v-else>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-name-row">
          <span class="agency-name">{{ agencyData.agencyName }}</span>
          <span class="agency-id-chip">{{ agencyData.id }}</span>
          <ElButton size="small" class="btn-edit" @click="emit('edit', agencyData)">编辑</ElButton>
          <ElButton
            v-if="agencyData.status === '已合作'"
            size="small"
            class="btn-terminate"
            @click="emit('terminate', agencyData)"
          >
            终止合作
          </ElButton>
        </div>
        <div class="header-status-row">
          <span :class="['status-badge', getStatusClass(agencyData.status)]">
            <span class="status-dot" />{{ agencyData.status }}
          </span>
        </div>
      </div>

      <!-- 正文滚动区 -->
      <div class="panel-body">
        <!-- 基本信息 -->
        <section class="detail-section">
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">代理商ID</span>
              <span class="info-val">{{ agencyData.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">代理商名称</span>
              <span class="info-val">{{ agencyData.agencyName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span class="info-val platform-val" :style="getPlatformStyle(agencyData.source)">
                {{ agencyData.source }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">合作模式</span>
              <span :class="['coop-badge', agencyData.coopMode === '授权代理' ? 'coop-badge--auth' : 'coop-badge--direct']">
                {{ agencyData.coopMode }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">联系人</span>
              <span class="info-val">{{ agencyData.contact }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">联系邮箱</span>
              <span class="info-val">{{ agencyData.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">联系电话</span>
              <span class="info-val">{{ agencyData.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">合作开始</span>
              <span class="info-val">{{ agencyData.startDate || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">合作到期</span>
              <span :class="['info-val', isExpiringSoon(agencyData.expireDate) ? 'info-val--warn' : '']">
                {{ agencyData.expireDate || '--' }}
                <span v-if="isExpiringSoon(agencyData.expireDate)" class="expire-tag">即将到期</span>
              </span>
            </div>
            <div v-if="agencyData.remark" class="info-item">
              <span class="info-key">备注</span>
              <span class="info-val info-val--remark">{{ agencyData.remark }}</span>
            </div>
          </div>
        </section>

        <!-- 账户统计 -->
        <section class="detail-section">
          <div class="stats-row">
            <span class="stat-item">
              管理账户：<strong class="stat-num stat-num--blue">{{ agencyData.managedAccounts }} 个</strong>
            </span>
            <span class="stat-sep">|</span>
            <span class="stat-item">
              活跃：<strong class="stat-num stat-num--green">{{ agencyData.activeAccounts }} 个</strong>
            </span>
            <span class="stat-sep">|</span>
            <span class="stat-item">
              已停用：<strong class="stat-num stat-num--muted">{{ agencyData.pausedAccounts }} 个</strong>
            </span>
          </div>
          <div class="spend-row">
            <span class="stat-item">
              本月消耗：<strong class="stat-num stat-num--amber">${{ (agencyData.monthSpend ?? 0).toLocaleString('en-US') }}</strong>
            </span>
            <span class="stat-sep">|</span>
            <span class="stat-item">
              消耗占比：<strong class="stat-num stat-num--blue">{{ spendRatio }}%</strong>
            </span>
          </div>
          <div class="lifetime-row">
            合作以来消耗：<strong class="stat-num stat-num--amber">${{ ((agencyData.monthSpend ?? 0) * 9.7).toLocaleString('en-US', { maximumFractionDigits: 0 }) }}</strong>
          </div>
        </section>

        <!-- 关联 BC/BM -->
        <section v-if="agencyData.bcBmList?.length" class="detail-section">
          <div class="section-label">关联BC/BM</div>
          <div class="bcbm-list">
            <div v-for="(bm, i) in agencyData.bcBmList" :key="i" class="bcbm-item">
              <span class="bcbm-name bcbm-link">{{ bm.name }}</span>
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10" class="bcbm-ext-icon">
                <path d="M7 2h3v3M10 2L5.5 6.5M4 3H2v7h7V8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        <!-- 关联账户数 -->
        <section class="detail-section">
          <div class="linked-row">
            关联账户数 <strong class="stat-num stat-num--blue">{{ agencyData.managedAccounts }}</strong>
            <button class="view-all-btn">查看全部</button>
          </div>
        </section>

        <!-- 消耗走势图 -->
        <section class="detail-section detail-section--last">
          <svg class="spend-chart" viewBox="0 0 320 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ag-panel-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#0d9488" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#0d9488" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#ag-panel-grad)"/>
            <polyline :points="chartPoints" fill="none" stroke="#0d9488" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </section>
      </div>

      <!-- 底部操作 -->
      <div class="panel-footer">
        <ElButton round class="footer-btn footer-btn--primary">查看账户列表</ElButton>
        <ElButton round class="footer-btn footer-btn--secondary">查看代投分析</ElButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getAppNowMs } from '@/utils/app-now'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AgencyItem } from '../types'

  defineOptions({ name: 'AgencyDetailPanel' })

  const props = defineProps<{
    agencyData: AgencyItem | null
  }>()

  const emit = defineEmits<{
    edit: [data: AgencyItem]
    terminate: [data: AgencyItem]
  }>()

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color }
  }

  function getStatusClass(status?: string) {
    if (status === '已合作') return 'status--active'
    if (status === '洽谈中' || status === '待开通') return 'status--pending'
    return 'status--terminated'
  }

  function isExpiringSoon(date?: string) {
    if (!date || date === '--') return false
    const d = new Date(date)
    const diff = (d.getTime() - getAppNowMs()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }

  const spendRatio = computed(() => {
    const total = 328450 // mock total
    return props.agencyData ? ((props.agencyData.monthSpend / total) * 100).toFixed(1) : '0'
  })

  // 走势图
  const chartData = computed(() => {
    const base = (props.agencyData?.monthSpend ?? 0) / 30
    return Array.from({ length: 20 }, (_, i) =>
      Math.max(0, base * (0.5 + Math.sin(i * 0.5) * 0.3 + Math.random() * 0.3))
    )
  })

  const chartPoints = computed(() => {
    const data = chartData.value
    const max = Math.max(...data, 1)
    return data.map((v, i) => {
      const x = (i / (data.length - 1)) * 320
      const y = 75 - (v / max) * 65
      return `${x},${y}`
    }).join(' ')
  })

  const areaPath = computed(() => {
    const pts = chartPoints.value.split(' ')
    return `M0,75 ${pts.map((p) => `L${p}`).join(' ')} L320,75 Z`
  })
</script>

<style lang="scss" scoped>
  .agency-detail-panel {
    --bg-panel: #0f1829;
    --bg-header: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --teal: #0d9488;
    --green: #22c55e;
    --amber: #f59e0b;
    --red: #ef4444;

    display: flex;
    flex-direction: column;
    width: 380px;
    min-width: 380px;
    height: 100%;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  // 空状态
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
    flex-shrink: 0;
    padding: 14px 16px 10px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border);
  }

  .header-name-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .agency-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .agency-id-chip {
    padding: 2px 7px;
    font-size: 11px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .btn-edit {
    height: 24px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
    color: var(--accent) !important;
    background: rgb(59 130 246 / 10%) !important;
    border: 1px solid rgb(59 130 246 / 25%) !important;
    border-radius: 5px !important;
    &:hover { background: rgb(59 130 246 / 20%) !important; }
  }

  .btn-terminate {
    height: 24px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
    color: var(--red) !important;
    background: transparent !important;
    border: 1px solid var(--red) !important;
    border-radius: 5px !important;
    &:hover { background: rgb(239 68 68 / 10%) !important; }
  }

  .header-status-row { display: flex; align-items: center; }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--active { color: var(--green); .status-dot { background: var(--green); } }
    &.status--pending { color: var(--amber); .status-dot { background: var(--amber); } }
    &.status--terminated { color: var(--text-muted); .status-dot { background: var(--text-muted); } }
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  // 滚动主体
  .panel-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 3px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgb(255 255 255 / 8%); border-radius: 2px; }
  }

  .detail-section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    &--last { border-bottom: none; }
  }

  .section-label {
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  // 信息列表
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .info-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .info-key {
    flex-shrink: 0;
    width: 64px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  .info-val {
    display: flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.8;
    color: var(--text-primary);

    &--warn { color: var(--amber); }
    &--remark { font-weight: 400; color: var(--text-secondary); }
  }

  .platform-val { font-weight: 600; }

  .expire-tag {
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    background: var(--amber);
    border-radius: 4px;
  }

  .coop-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;
    &--auth { color: #818cf8; background: rgb(129 140 248 / 12%); }
    &--direct { color: #34d399; background: rgb(52 211 153 / 12%); }
  }

  // 账户统计
  .stats-row, .spend-row, .lifetime-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--text-secondary);

    &:last-child { margin-bottom: 0; }
  }

  .stat-sep {
    color: var(--border);
  }

  .stat-num {
    font-weight: 600;
    &--blue { color: var(--accent); }
    &--green { color: var(--green); }
    &--amber { color: var(--amber); }
    &--muted { color: var(--text-muted); }
  }

  // BC/BM
  .bcbm-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .bcbm-item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
  }

  .bcbm-link {
    color: var(--accent);
    cursor: pointer;
    &:hover { text-decoration: underline; }
  }

  .bcbm-ext-icon { color: var(--text-muted); }

  // 关联账户数
  .linked-row {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .view-all-btn {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--accent);
    cursor: pointer;
    background: rgb(59 130 246 / 10%);
    border: none;
    border-radius: 4px;
    transition: background 0.15s;
    &:hover { background: rgb(59 130 246 / 20%); }
  }

  // 走势图
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
    background: var(--bg-header);
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
