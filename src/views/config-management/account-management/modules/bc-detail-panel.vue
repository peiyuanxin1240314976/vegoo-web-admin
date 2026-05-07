<template>
  <div class="bc-detail-panel">
    <div v-if="!bcData" class="empty-state">
      <svg viewBox="0 0 48 48" fill="none" width="36" height="36">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M16 18h16M16 24h10M16 30h8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
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
          <span class="s-dot">{{ getStatusIcon(bcData.status) }}</span
          >{{ bcData.status }}
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
              <span class="info-val platform-val" :style="getPlatformStyle(bcData.source)">{{
                bcData.source
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">归属组</span>
              <span class="group-badge">{{ bcData.group }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">状态</span>
              <span :class="['status-badge status-badge--sm', getStatusClass(bcData.status)]">
                <span class="s-dot">{{ getStatusIcon(bcData.status) }}</span
                >{{ bcData.status }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">开户主体</span>
              <span :class="['owner-badge', `owner-badge--${ownerClass(bcData.ownerType)}`]">{{
                bcData.ownerType
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">管理员</span>
              <span class="info-val">{{ bcData.manager }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">封户记录</span>
              <span
                :class="[
                  'ban-badge',
                  bcData.banRecord === '有' ? 'ban-badge--yes' : 'ban-badge--no'
                ]"
                >{{ bcData.banRecord }}</span
              >
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
            本月消耗
            <strong class="sn sn--amber"
              >${{ (bcData.monthSpend ?? 0).toLocaleString('en-US') }}</strong
            >
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
              <linearGradient id="bcSpendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop class="spend-chart__stop spend-chart__stop--top" offset="0%" />
                <stop class="spend-chart__stop spend-chart__stop--bottom" offset="100%" />
              </linearGradient>
            </defs>
            <path :d="areaPath" fill="url(#bcSpendGrad)" />
            <polyline
              :points="chartPoints"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </section>
      </div>

      <!-- 底部 -->
      <div class="panel-footer">
        <ElButton round class="footer-btn footer-btn--primary">查看关联账户</ElButton>
        <ElButton round class="footer-btn footer-btn--secondary" @click="emit('edit', bcData)">
          编辑
        </ElButton>
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
    return data
      .map((v, i) => {
        const x = (i / (data.length - 1)) * 320
        const y = 72 - (v / max) * 60
        return `${x},${y}`
      })
      .join(' ')
  })

  const areaPath = computed(() => {
    const pts = chartPoints.value.split(' ')
    return `M0,72 ${pts.map((p) => `L${p}`).join(' ')} L320,72 Z`
  })
</script>

<style lang="scss" scoped>
  .bc-detail-panel {
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
    --purple: color-mix(in srgb, var(--theme-color) 42%, var(--el-color-primary) 58%);
    --purple-bg: color-mix(in srgb, var(--theme-color) 12%, transparent);

    display: flex;
    flex-direction: column;
    width: 340px;
    min-width: 340px;
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
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px 10px;
    background: var(--dp-header-bg);
    border-bottom: 1px solid var(--dp-border-soft);
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border: 1px solid var(--dp-border-soft);
    border-radius: 6px;
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 600;

    &.status--healthy {
      color: var(--green);
    }

    &.status--available {
      color: var(--el-color-primary);
    }

    &.status--banned {
      color: var(--amber);
    }

    &.status--inactive {
      color: var(--text-muted);
    }

    &.status--other {
      color: var(--text-secondary);
    }

    &--sm {
      font-size: 12px;
      font-weight: 500;
    }
  }

  .s-dot {
    font-size: 10px;
  }

  // 正文
  .panel-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
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
    color: var(--el-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }

  .section-title-row .section-title {
    margin-bottom: 0;
  }

  .edit-link {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-color-primary);
    cursor: pointer;
    background: var(--accent-dim);
    border: none;
    border-radius: 6px;
    transition: background-color var(--duration-fast) var(--ease-out);

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    }
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

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

    &--mono {
      font-family: 'SF Mono', monospace;
      font-size: 11px;
      color: var(--text-secondary);
    }

    &--remark {
      color: var(--text-secondary);
    }
  }

  .platform-val {
    font-size: 13px;
    font-weight: 600;
  }

  .group-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    color: var(--green);
    background: var(--green-bg);
    border-radius: 6px;
  }

  .owner-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    border-radius: 6px;

    &--corp {
      color: var(--el-color-primary);
      background: var(--accent-dim);
    }

    &--personal {
      color: var(--purple);
      background: var(--purple-bg);
    }

    &--small {
      color: var(--green);
      background: var(--green-bg);
    }
  }

  .ban-badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 6px;

    &--no {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--text-tertiary) 12%, transparent);
    }

    &--yes {
      color: var(--amber);
      background: var(--amber-bg);
    }
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

    &:last-child {
      margin-bottom: 0;
    }
  }

  .sn {
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

  .s-sep {
    color: var(--dp-border-soft);
  }

  // 走势图
  .chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .chart-label {
    font-size: 11px;
    color: var(--text-muted);
  }

  .chart-range {
    font-size: 11px;
    font-weight: 600;
    color: var(--el-color-primary);
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
