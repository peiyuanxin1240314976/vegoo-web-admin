<template>
  <!-- 遮罩层 -->
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <!-- 抽屉主体 -->
  <transition name="drawer-slide">
    <div v-if="visible" class="agency-detail-drawer">
      <!-- ── 头部 ─────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-left">
          <div class="header-name-row">
            <span class="agency-name">{{ agencyData?.agencyName }}</span>
            <span class="agency-id-chip">{{ agencyData?.id }}</span>
          </div>
          <div class="header-meta-row">
            <span :class="['status-badge', getStatusClass(agencyData?.status)]">
              <span class="status-dot" />
              {{ agencyData?.status }}
            </span>
            <span class="platform-chip" :style="getPlatformStyle(agencyData?.source ?? '')">
              {{ agencyData?.source }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <ElButton round size="small" class="btn-edit" @click="handleEdit">编辑</ElButton>
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

      <!-- ── 正文滚动区 ──────────────────────── -->
      <div class="drawer-body">
        <!-- 代理商信息 -->
        <section class="detail-section">
          <div class="section-title">代理商信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">代理商ID</span>
              <span class="info-val">{{ agencyData?.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">代理商名称</span>
              <span class="info-val">{{ agencyData?.agencyName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span class="info-val">{{ agencyData?.source }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">合作模式</span>
              <span
                :class="[
                  'coop-badge',
                  agencyData?.coopMode === '授权代理' ? 'coop-badge--auth' : 'coop-badge--direct'
                ]"
              >
                {{ agencyData?.coopMode }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">合作开始</span>
              <span class="info-val">{{ agencyData?.startDate || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">到期日期</span>
              <span
                :class="['info-val', isExpiringSoon(agencyData?.expireDate) ? 'text-warn' : '']"
              >
                {{ agencyData?.expireDate || '--' }}
              </span>
            </div>
            <div v-if="agencyData?.remark" class="info-item">
              <span class="info-key">备注</span>
              <span class="info-val info-val--remark">{{ agencyData.remark }}</span>
            </div>
          </div>
        </section>

        <!-- 联系信息 -->
        <section class="detail-section">
          <div class="section-title">联系信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">联系人</span>
              <span class="info-val">{{ agencyData?.contact }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">联系邮箱</span>
              <span class="info-val">{{ agencyData?.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">联系电话</span>
              <span class="info-val">{{ agencyData?.phone }}</span>
            </div>
          </div>
        </section>

        <!-- 账户概览 -->
        <section class="detail-section">
          <div class="section-title">账户概览</div>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="overview-label">管理账户</div>
              <div class="overview-value overview-value--blue">{{
                agencyData?.managedAccounts
              }}</div>
            </div>
            <div class="overview-card">
              <div class="overview-label">活跃账户</div>
              <div class="overview-value overview-value--green">{{
                agencyData?.activeAccounts
              }}</div>
            </div>
            <div class="overview-card">
              <div class="overview-label">暂停账户</div>
              <div class="overview-value overview-value--amber">{{
                agencyData?.pausedAccounts
              }}</div>
            </div>
            <div class="overview-card">
              <div class="overview-label">本月消耗</div>
              <div class="overview-value overview-value--amber"
                >${{ (agencyData?.monthSpend ?? 0).toLocaleString('en-US') }}</div
              >
            </div>
          </div>
        </section>

        <!-- 关联 BC/BM -->
        <section v-if="agencyData?.bcBmList?.length" class="detail-section">
          <div class="section-title">关联 BC / BM</div>
          <div class="bcbm-list">
            <div v-for="(bm, i) in agencyData.bcBmList" :key="i" class="bcbm-item">
              <div class="bcbm-info">
                <span class="bcbm-name">{{ bm.name }}</span>
                <span class="bcbm-type-tag">{{ bm.type }}</span>
              </div>
              <div class="bcbm-meta">
                <span class="bcbm-count">{{ bm.accountCount }} 个账户</span>
                <span
                  :class="[
                    'bcbm-status',
                    bm.status === '正常' ? 'bcbm-status--ok' : 'bcbm-status--warn'
                  ]"
                >
                  {{ bm.status }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- 最近消耗走势（SVG 折线） -->
        <section class="detail-section">
          <div class="section-title">近 30 天消耗走势</div>
          <div class="chart-wrap">
            <svg class="spend-chart" viewBox="0 0 340 90" preserveAspectRatio="none">
              <defs>
                <linearGradient id="ag-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                </linearGradient>
              </defs>
              <!-- 网格线 -->
              <line
                v-for="y in [20, 45, 70]"
                :key="y"
                x1="0"
                :y1="y"
                x2="340"
                :y2="y"
                stroke="rgb(255 255 255 / 5%)"
                stroke-width="1"
              />
              <!-- 面积填充 -->
              <path :d="areaPath" fill="url(#ag-grad)" />
              <!-- 折线 -->
              <polyline
                :points="chartPoints"
                fill="none"
                stroke="#3b82f6"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </section>
      </div>

      <!-- ── 底部操作 ──────────────────────── -->
      <div class="drawer-footer">
        <ElButton round class="footer-btn footer-btn--edit" @click="handleEdit"
          >编辑代理商</ElButton
        >
        <ElButton round class="footer-btn footer-btn--secondary" @click="handleClose"
          >关闭</ElButton
        >
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getAppNowMs } from '@/utils/app-now'
  import { PLATFORM_CONFIGS } from '../types'
  import type { AgencyItem } from '../types'

  defineOptions({ name: 'AgencyDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    agencyData: AgencyItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [row: AgencyItem]
  }>()

  const handleClose = () => emit('update:visible', false)

  const handleEdit = () => {
    if (props.agencyData) emit('edit', props.agencyData)
  }

  function getPlatformStyle(source: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color, background: cfg.bg }
  }

  function getStatusClass(status?: string) {
    if (status === '已合作') return 'status-badge--active'
    if (status === '洽谈中') return 'status-badge--pending'
    return 'status-badge--terminated'
  }

  function isExpiringSoon(date?: string) {
    if (!date || date === '--') return false
    const d = new Date(date)
    const diff = (d.getTime() - getAppNowMs()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }

  // 模拟近 30 天消耗数据并生成 SVG 路径
  const chartData = computed(() => {
    const base = (props.agencyData?.monthSpend ?? 0) / 30
    return Array.from({ length: 30 }, () => Math.max(0, base * (0.6 + Math.random() * 0.8)))
  })

  const chartPoints = computed(() => {
    const data = chartData.value
    const max = Math.max(...data, 1)
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * 340
        const y = 85 - (v / max) * 70
        return `${x},${y}`
      })
      .join(' ')
  })

  const areaPath = computed(() => {
    const pts = chartPoints.value.split(' ')
    return `M0,85 ${pts.map((p) => `L${p}`).join(' ')} L340,85 Z`
  })
</script>

<style lang="scss" scoped>
  // ─── 遮罩 ────────────────────────────────────────────
  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgb(0 0 0 / 40%);
  }

  // ─── 抽屉主体 ────────────────────────────────────────
  .agency-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    display: flex;
    flex-direction: column;
    width: 420px;
    background: #131c2e;
    border-left: 1px solid rgb(255 255 255 / 7%);
    box-shadow: -8px 0 40px rgb(0 0 0 / 50%);
  }

  // ─── 过渡动画 ────────────────────────────────────────
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.22s ease;
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
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .header-name-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .agency-name {
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .agency-id-chip {
    padding: 2px 7px;
    font-size: 11px;
    color: #64748b;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 4px;
  }

  .header-meta-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .header-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
  }

  .btn-edit {
    padding: 5px 14px !important;
    font-size: 12px !important;
    color: #3b82f6 !important;
    background: rgb(59 130 246 / 10%) !important;
    border: 1px solid rgb(59 130 246 / 25%) !important;
    border-radius: 6px !important;
    transition: all 0.18s;

    &:hover {
      background: rgb(59 130 246 / 20%) !important;
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
    transition: all 0.18s;

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

    &--active {
      color: #22c55e;
      background: rgb(34 197 94 / 10%);
      .status-dot {
        background: #22c55e;
      }
    }

    &--pending {
      color: #f59e0b;
      background: rgb(245 158 11 / 10%);
      .status-dot {
        background: #f59e0b;
      }
    }

    &--terminated {
      color: #64748b;
      background: rgb(100 116 139 / 10%);
      .status-dot {
        background: #64748b;
      }
    }
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .platform-chip {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
  }

  // ─── 正文 ────────────────────────────────────────────
  .drawer-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0;
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
    padding: 18px 0;
    border-bottom: 1px solid rgb(255 255 255 / 5%);

    &:last-child {
      border-bottom: none;
    }
  }

  .section-title {
    margin-bottom: 14px;
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

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
    width: 80px;
    font-size: 12px;
    color: #64748b;
  }

  .info-val {
    font-size: 13px;
    color: #e2e8f0;
    word-break: break-all;

    &--remark {
      line-height: 1.5;
      color: #94a3b8;
    }
  }

  .text-warn {
    color: #f59e0b !important;
  }

  .coop-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 4px;

    &--auth {
      color: #818cf8;
      background: rgb(129 140 248 / 12%);
    }

    &--direct {
      color: #34d399;
      background: rgb(52 211 153 / 12%);
    }
  }

  // ─── 账户概览 grid ────────────────────────────────────
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .overview-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 8px;
  }

  .overview-label {
    font-size: 11px;
    color: #64748b;
  }

  .overview-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1;

    &--blue {
      color: #3b82f6;
    }
    &--green {
      color: #22c55e;
    }
    &--amber {
      color: #f59e0b;
    }
  }

  // ─── BC/BM 列表 ──────────────────────────────────────
  .bcbm-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bcbm-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 8px;
  }

  .bcbm-info {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .bcbm-name {
    font-size: 13px;
    color: #e2e8f0;
  }

  .bcbm-type-tag {
    padding: 1px 6px;
    font-size: 10px;
    color: #818cf8;
    background: rgb(129 140 248 / 12%);
    border-radius: 3px;
  }

  .bcbm-meta {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .bcbm-count {
    font-size: 12px;
    color: #64748b;
  }

  .bcbm-status {
    font-size: 11px;

    &--ok {
      color: #22c55e;
    }
    &--warn {
      color: #f59e0b;
    }
  }

  // ─── 消耗走势 ────────────────────────────────────────
  .chart-wrap {
    padding: 4px 0;
  }

  .spend-chart {
    display: block;
    width: 100%;
    height: 90px;
  }

  // ─── 底部操作 ────────────────────────────────────────
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

    &--edit {
      color: #fff !important;
      background: #3b82f6 !important;
      border: none !important;

      &:hover {
        filter: brightness(1.1);
      }
    }

    &--secondary {
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
