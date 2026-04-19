<template>
  <div class="agency-detail-panel">
    <!-- 空状态 -->
    <div v-if="!agencyData" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
          <rect
            x="8"
            y="8"
            width="32"
            height="32"
            rx="4"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M16 18h16M16 24h10M16 30h8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
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
              <span
                :class="[
                  'coop-badge',
                  agencyData.coopMode === '授权代理' ? 'coop-badge--auth' : 'coop-badge--direct'
                ]"
              >
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
              <span
                :class="['info-val', isExpiringSoon(agencyData.expireDate) ? 'info-val--warn' : '']"
              >
                {{ agencyData.expireDate || '--' }}
                <span v-if="isExpiringSoon(agencyData.expireDate)" class="expire-tag"
                  >即将到期</span
                >
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
              管理账户：<strong class="stat-num stat-num--blue"
                >{{ agencyData.managedAccounts }} 个</strong
              >
            </span>
            <span class="stat-sep">|</span>
            <span class="stat-item">
              活跃：<strong class="stat-num stat-num--green"
                >{{ agencyData.activeAccounts }} 个</strong
              >
            </span>
            <span class="stat-sep">|</span>
            <span class="stat-item">
              已停用：<strong class="stat-num stat-num--muted"
                >{{ agencyData.pausedAccounts }} 个</strong
              >
            </span>
          </div>
          <div class="spend-row">
            <span class="stat-item">
              本月消耗：<strong class="stat-num stat-num--amber"
                >${{ (agencyData.monthSpend ?? 0).toLocaleString('en-US') }}</strong
              >
            </span>
            <span class="stat-sep">|</span>
            <span class="stat-item">
              消耗占比：<strong class="stat-num stat-num--blue">{{ spendRatio }}%</strong>
            </span>
          </div>
          <div class="lifetime-row">
            合作以来消耗：<strong class="stat-num stat-num--amber"
              >${{
                ((agencyData.monthSpend ?? 0) * 9.7).toLocaleString('en-US', {
                  maximumFractionDigits: 0
                })
              }}</strong
            >
          </div>
        </section>

        <!-- 关联 BC/BM -->
        <section v-if="agencyData.bcBmList?.length" class="detail-section">
          <div class="section-label">关联BC/BM</div>
          <div class="bcbm-list">
            <div v-for="(bm, i) in agencyData.bcBmList" :key="i" class="bcbm-item">
              <span class="bcbm-name bcbm-link">{{ bm.name }}</span>
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10" class="bcbm-ext-icon">
                <path
                  d="M7 2h3v3M10 2L5.5 6.5M4 3H2v7h7V8"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>

        <!-- 关联账户数 -->
        <section class="detail-section">
          <div class="linked-row">
            关联账户数
            <strong class="stat-num stat-num--blue">{{ agencyData.managedAccounts }}</strong>
            <button class="view-all-btn">查看全部</button>
          </div>
        </section>

        <!-- 消耗走势图 -->
        <section class="detail-section detail-section--last">
          <div class="section-title">消耗走势</div>
          <svg class="spend-chart" viewBox="0 0 320 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="agencySpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop class="spend-chart__stop spend-chart__stop--top" offset="0%" />
                <stop class="spend-chart__stop spend-chart__stop--bottom" offset="100%" />
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#agencySpendGrad)" />
            <polyline
              :points="chartPoints"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * 320
        const y = 75 - (v / max) * 65
        return `${x},${y}`
      })
      .join(' ')
  })

  const areaPath = computed(() => {
    const pts = chartPoints.value.split(' ')
    return `M0,75 ${pts.map((p) => `L${p}`).join(' ')} L320,75 Z`
  })
</script>

<style lang="scss" scoped>
  .agency-detail-panel {
    --dp-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --dp-border-soft: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    --dp-header-bg: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);
    --green: var(--art-success);
    --green-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --amber: var(--art-warning);
    --amber-bg: color-mix(in srgb, var(--art-warning) 14%, transparent);
    --red: var(--art-danger);
    --red-bg: color-mix(in srgb, var(--art-danger) 12%, transparent);
    --purple: color-mix(in srgb, var(--theme-color) 42%, var(--el-color-primary) 58%);
    --purple-bg: color-mix(in srgb, var(--theme-color) 12%, transparent);

    display: flex;
    flex-direction: column;
    width: 380px;
    min-width: 380px;
    height: 100%;
    overflow: hidden;
    background:
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 98%, transparent) 0%,
        color-mix(in srgb, var(--default-bg-color) 40%, transparent) 100%
      ),
      linear-gradient(
        120deg,
        color-mix(in srgb, var(--el-color-primary) 4%, transparent),
        color-mix(in srgb, var(--theme-color) 3%, transparent)
      );
    border: 1px solid var(--dp-border);
    border-radius: 14px;
    box-shadow:
      0 12px 36px rgb(0 0 0 / 8%),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
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

  .empty-text {
    font-size: 13px;
  }

  .panel-header {
    flex-shrink: 0;
    padding: 14px 16px 10px;
    background: var(--dp-header-bg);
    border-bottom: 1px solid var(--dp-border-soft);
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border: 1px solid var(--dp-border-soft);
    border-radius: 6px;
  }

  .btn-edit {
    height: 26px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
    color: var(--el-color-primary) !important;
    background: var(--accent-dim) !important;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 30%, transparent) !important;
    border-radius: 6px !important;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 20%, transparent) !important;
    }
  }

  .btn-terminate {
    height: 26px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
    color: var(--red) !important;
    background: transparent !important;
    border: 1px solid var(--red) !important;
    border-radius: 6px !important;
    transition: background-color var(--duration-fast) var(--ease-out);

    &:hover {
      background: var(--red-bg) !important;
    }
  }

  .header-status-row {
    display: flex;
    align-items: center;
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--active {
      color: var(--green);

      .status-dot {
        background: var(--green);
      }
    }

    &.status--pending {
      color: var(--amber);

      .status-dot {
        background: var(--amber);
      }
    }

    &.status--terminated {
      color: var(--text-muted);

      .status-dot {
        background: var(--text-muted);
      }
    }
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--default-box-color) 50%, transparent);
      border-radius: 2px;
    }
  }

  .detail-section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--dp-border-soft);

    &--last {
      border-bottom: none;
    }
  }

  .section-title {
    display: flex;
    gap: 6px;
    align-items: baseline;
    padding-left: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }

  .section-label {
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

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
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.8;
    color: var(--text-primary);

    &--warn {
      color: var(--amber);
    }

    &--remark {
      font-weight: 400;
      color: var(--text-secondary);
    }
  }

  .platform-val {
    font-weight: 600;
  }

  .expire-tag {
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    color: var(--el-color-white);
    background: var(--amber);
    border-radius: 4px;
  }

  .coop-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 6px;

    &--auth {
      color: var(--purple);
      background: var(--purple-bg);
    }

    &--direct {
      color: var(--green);
      background: var(--green-bg);
    }
  }

  .stats-row,
  .spend-row,
  .lifetime-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--text-secondary);

    &:last-child {
      margin-bottom: 0;
    }
  }

  .stat-sep {
    color: var(--dp-border-soft);
  }

  .stat-num {
    font-weight: 600;

    &--blue {
      color: var(--el-color-primary);
    }

    &--green {
      color: var(--green);
    }

    &--amber {
      color: var(--amber);
    }

    &--muted {
      color: var(--text-muted);
    }
  }

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
    color: var(--el-color-primary);
    cursor: pointer;
    transition: opacity var(--duration-fast) var(--ease-out);

    &:hover {
      text-decoration: underline;
      opacity: 0.9;
    }
  }

  .bcbm-ext-icon {
    color: var(--text-muted);
  }

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
    font-weight: 500;
    color: var(--el-color-primary);
    cursor: pointer;
    background: var(--accent-dim);
    border: none;
    border-radius: 6px;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      color var(--duration-fast) var(--ease-out);

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    }
  }

  .spend-chart {
    display: block;
    width: 100%;
    height: 80px;
    color: var(--el-color-primary);
  }

  .spend-chart__stop--top {
    stop-color: var(--el-color-primary);
    stop-opacity: 0.22;
  }

  .spend-chart__stop--bottom {
    stop-color: var(--el-color-primary);
    stop-opacity: 0;
  }

  .panel-footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 12px 16px;
    background: var(--dp-header-bg);
    border-top: 1px solid var(--dp-border-soft);
  }

  .footer-btn {
    flex: 1;
    height: 34px !important;
    font-size: 12px !important;
    border-radius: 8px !important;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out),
      box-shadow var(--duration-fast) var(--ease-out),
      filter var(--duration-fast) var(--ease-out) !important;

    &--primary {
      font-weight: 600 !important;
      color: var(--el-color-white) !important;
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 92%, black 8%),
        color-mix(in srgb, var(--el-color-primary) 78%, black 22%)
      ) !important;
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 38%, transparent) !important;
      box-shadow: 0 6px 16px color-mix(in srgb, var(--el-color-primary) 26%, transparent) !important;

      &:hover {
        filter: brightness(1.05);
        box-shadow: 0 8px 20px color-mix(in srgb, var(--el-color-primary) 32%, transparent) !important;
      }
    }

    &--secondary {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid var(--dp-border-soft) !important;

      &:hover {
        color: var(--el-color-primary) !important;
        border-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent) !important;
      }
    }
  }
</style>
