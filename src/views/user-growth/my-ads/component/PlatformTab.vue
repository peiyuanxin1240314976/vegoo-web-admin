<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ name: 'PlatformTab' })

  const props = defineProps<{
    data: Api.UserGrowth.MyAdsPlatformResponseDto | null
    loading: boolean
  }>()

  /** 與父級雙向綁定，切換時父組件以 groupBy 重新請求 platform 接口 */
  const groupByApp = defineModel<boolean>('groupByApp', { default: true })

  const showSkeleton = computed(() => props.loading || !props.data)

  const appGroups = computed(() => props.data?.appGroups ?? [])

  const footer = computed(() => props.data?.footer)

  const appGroupsIsEmpty = computed(() => !appGroups.value.length)

  function progressColor(c: Api.UserGrowth.MyAdsPlatformCampaignCardDto) {
    if (c.status === 'warn') return '#f59e0b'
    return '#10b981'
  }

  function roiColor(c: Api.UserGrowth.MyAdsPlatformCampaignCardDto) {
    if (c.status === 'warn') return '#f97316'
    return '#f59e0b'
  }

  function platformIconStyle(p: string | null | undefined) {
    if (p == null || typeof p !== 'string') return { background: '#6b7280', color: '#fff' }
    if (p.includes('谷歌')) return { background: '#4285f4', color: '#fff' }
    if (p.includes('Meta')) return { background: '#1877f2', color: '#fff' }
    if (p.includes('TikTok')) return { background: '#000', color: '#fff' }
    return { background: '#6b7280', color: '#fff' }
  }

  function statusDisplay(status: string) {
    return status === 'warn' ? '⚠ 超预算' : '● 激活'
  }
</script>

<template>
  <div class="platform-tab">
    <!-- ── 副标题 + 切换（两行，少占横向宽度） ── -->
    <div class="tab-sub-header">
      <div class="tab-sub-header__row tab-sub-header__row--desc">
        <span class="sub-desc">应用视角 | 展示各应用在各广告平台的广告数据</span>
      </div>
      <div class="tab-sub-header__row tab-sub-header__row--toggle">
        <div class="toggle-group">
          <div :class="['toggle-btn', groupByApp ? 'active' : '']" @click="groupByApp = true">
            按应用分组
          </div>
          <div :class="['toggle-btn', !groupByApp ? 'active' : '']" @click="groupByApp = false">
            按平台分组
          </div>
        </div>
      </div>
    </div>

    <template v-if="showSkeleton">
      <!-- 骨架屏 -->
      <div class="platform-skeleton ma-skeleton-orbit">
        <ElSkeleton animated :rows="6" />
      </div>
      <div class="bottom-summary platform-skeleton-footer ma-skeleton-orbit">
        <ElSkeleton animated :rows="2" />
      </div>
    </template>

    <template v-else-if="data">
      <!-- ── 应用组列表 ── -->
      <div class="app-groups">
        <div v-if="appGroupsIsEmpty" class="app-groups-empty">
          <ElEmpty description="暂无数据" :image-size="80" />
        </div>
        <template v-else>
          <div v-for="app in appGroups" :key="app.nameEn || app.name" class="app-group">
            <!-- 应用标题：两行（名称 | 指标） -->
            <div class="app-group-header">
              <div class="app-group-header__row app-group-header__row--title">
                <span class="app-icon">{{ app.icon || '📱' }}</span>
                <span class="app-name">{{ app.name }}（{{ app.nameEn }}）</span>
              </div>
              <div class="app-group-header__row app-group-header__row--meta">
                <span class="app-meta">
                  总广告支出: <b style="color: #e2e8f0">{{ app.totalSpend || '—' }}</b>
                </span>
                <span class="app-meta">
                  平均首日ROI: <b style="color: #f59e0b">{{ app.avgRoi || '—' }}</b>
                </span>
                <span class="app-meta">
                  平台数: <b style="color: #e2e8f0">{{ app.platformCount }}个</b>
                </span>
              </div>
            </div>

            <!-- 平台卡片网格 -->
            <div class="campaign-cards">
              <div v-if="!app.campaigns?.length" class="camp-cards-empty">
                <ElEmpty description="暂无数据" :image-size="60" />
              </div>
              <template v-else>
                <div
                  v-for="(c, idx) in app.campaigns"
                  :key="c.platform + '-' + idx"
                  :class="['camp-card', c.status === 'warn' ? 'card-warn' : '']"
                >
                  <!-- 卡片头 -->
                  <div class="camp-card-head">
                    <div class="platform-badge">
                      <span class="plat-icon" :style="platformIconStyle(c.platform)">{{
                        c.platformIcon || '—'
                      }}</span>
                      <span class="plat-name">{{ c.platform || '—' }}</span>
                    </div>
                    <div class="card-head-right">
                      <span
                        :class="['status-badge', c.status === 'warn' ? 'badge-warn' : 'badge-ok']"
                      >
                        {{ statusDisplay(c.status) }}
                      </span>
                    </div>
                  </div>

                  <!-- 数据网格 -->
                  <div class="card-data-grid">
                    <div class="data-cell">
                      <span class="cell-label">广告支出</span>
                      <span class="cell-val" style="color: #e2e8f0">{{ c.spend || '—' }}</span>
                    </div>
                    <div class="data-cell">
                      <span class="cell-label">预算</span>
                      <span class="cell-val" style="color: #e2e8f0">{{ c.budget || '—' }}</span>
                    </div>
                    <div class="data-cell">
                      <span class="cell-label">首日ROI</span>
                      <span class="cell-val" :style="{ color: roiColor(c) }">{{
                        c.roi || '—'
                      }}</span>
                    </div>
                    <div class="data-cell">
                      <span class="cell-label">目标</span>
                      <span class="cell-val" style="color: #94a3b8">{{ c.roiTarget || '—' }}</span>
                    </div>
                  </div>

                  <!-- 进度条 -->
                  <div class="card-progress">
                    <div class="prog-track">
                      <div
                        class="prog-fill"
                        :style="{ width: (c.progress ?? 0) + '%', background: progressColor(c) }"
                      ></div>
                    </div>
                    <span class="prog-pct" :style="{ color: progressColor(c) }"
                      >{{ c.progress ?? 0 }}%</span
                    >
                  </div>

                  <!-- 次要数据行 -->
                  <div class="card-sub-row">
                    <div class="data-cell">
                      <span class="cell-label">最低利润</span>
                      <span class="cell-val" style="color: #a78bfa">{{ c.minSpend || '—' }}</span>
                    </div>
                    <div class="data-cell">
                      <span class="cell-label">CPI</span>
                      <span class="cell-val" style="color: #e2e8f0">{{ c.cpi || '—' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- ── 底部汇总栏 ── -->
      <div class="bottom-summary">
        <template v-if="footer">
          <div class="summary-left">
            <span class="s-label">
              应用汇总: {{ footer.appCount }}个应用 | {{ footer.campaignCount }}个广告系列
            </span>
            <span class="s-label">
              总广告支出 <b style="color: #10b981">{{ footer.totalSpend || '—' }}</b>
            </span>
          </div>
          <div class="summary-alerts">
            <span class="alert-item warn">
              超预算预警: <b>{{ footer.overBudgetCount }}个</b>
            </span>
            <span class="sep">|</span>
            <span class="alert-item orange">
              ROI未达标: <b>{{ footer.roiBelowTargetCount }}个</b>
            </span>
          </div>
          <div class="summary-right">
            <span class="s-label">
              平均首日ROI <b style="color: #f59e0b">{{ footer.avgRoi || '—' }}</b>
            </span>
            <span class="s-label">
              预估总利润 <b style="color: #10b981">{{ footer.estTotalProfit || '—' }}</b>
            </span>
            <span class="s-label">
              最低总利润 <b style="color: #a78bfa">{{ footer.minTotalProfit || '—' }}</b>
            </span>
          </div>
        </template>
        <div v-else class="footer-empty">
          <ElEmpty description="暂无数据" :image-size="60" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
  @use '../styles/my-ads-neon.scss' as ma;

  .ma-skeleton-orbit {
    @include ma.ma-skeleton-orbit;
  }

  .platform-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .platform-skeleton {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    min-height: 240px;
    padding: 16px;
  }

  .platform-skeleton :deep(.el-skeleton) {
    padding: 0;
  }

  .platform-skeleton-footer {
    min-height: 60px;
  }

  .platform-skeleton-footer :deep(.el-skeleton) {
    padding: 0;
  }

  .app-groups-empty {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    padding: 40px;
  }

  .app-groups-empty :deep(.el-empty__description) {
    color: var(--text-secondary);
  }

  .camp-cards-empty {
    display: flex;
    grid-column: 1 / -1;
    align-items: center;
    justify-content: center;
    min-height: 100px;
  }

  .camp-cards-empty :deep(.el-empty__description) {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .footer-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 60px;
  }

  .footer-empty :deep(.el-empty__description) {
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* ── 副标题（默认同一行：左文案右切换；小屏自动两行） ── */
  .tab-sub-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .tab-sub-header__row {
    min-width: 0;
  }

  .tab-sub-header__row--desc {
    flex: 1 1 auto;
  }

  .tab-sub-header__row--toggle {
    display: flex;
    flex: 0 0 auto;
    justify-content: flex-end;
  }

  @media (width <= 768px) {
    .tab-sub-header {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .tab-sub-header__row--toggle {
      justify-content: flex-start;
      width: 100%;
    }
  }

  .sub-desc {
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-dim);
  }

  .toggle-group {
    display: flex;
    overflow: hidden;
    background: rgb(10 10 14 / 85%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 9999px;
    box-shadow: inset 0 1px 0 rgb(186 230 253 / 8%);
  }

  .toggle-btn {
    padding: 5px 14px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;
  }

  .toggle-btn:not(.active):hover {
    color: var(--text-primary);
    background: rgb(0 212 170 / 8%);
    box-shadow: 0 10px 24px rgb(0 0 0 / 22%);
  }

  .toggle-btn.active {
    font-weight: 600;
    color: #000;
    background: var(--teal);
  }

  .toggle-btn.active:hover {
    filter: brightness(1.05);
    transform: none;
  }

  /* ── 应用分组（大三栏） ── */
  .app-groups {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    align-items: start;
  }

  .app-group {
    width: 100%;
    min-width: 0;
  }

  @media (width <= 1366px) {
    .app-groups {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (width <= 900px) {
    .app-groups {
      grid-template-columns: 1fr;
    }
  }

  .app-group-header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;
  }

  .app-group-header__row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
    min-width: 0;
  }

  .app-group-header__row--title {
    flex-wrap: nowrap;
    row-gap: 6px;
    overflow: hidden;
  }

  .app-group-header__row--meta {
    padding-top: 8px;
    padding-left: 0;
    margin: 0;
    border-top: 1px solid rgb(63 63 70 / 25%);
  }

  .app-icon {
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
  }

  .app-name {
    min-width: 0;
    font-weight: 600;
    line-height: 1.35;
    color: var(--text-primary);
    word-break: break-word;
  }

  .app-group-header__row--title .app-name {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: normal;
    white-space: nowrap;
  }

  .app-meta {
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-secondary);
  }

  /* ── 卡片网格：始终单列（每个平台卡片独占一行） ── */
  .campaign-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    align-items: stretch;
    width: 100%;
  }

  .camp-card {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    padding: 14px;
  }

  .card-warn {
    background: rgb(146 64 14 / 8%);
    border-color: #92400e;
  }

  /* ── 卡片头 ── */
  .camp-card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .platform-badge {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .plat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
    transition: transform 0.22s ease;
  }

  .camp-card:hover .plat-icon {
    transform: scale(1.08);
  }

  .plat-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .card-head-right {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .status-badge {
    padding: 1px 6px;
    font-size: 11px;
    border-radius: 4px;
  }

  .badge-ok {
    color: #10b981;
    background: rgb(16 185 129 / 15%);
  }

  .badge-warn {
    color: #f59e0b;
    background: rgb(245 158 11 / 15%);
    border: 1px solid rgb(245 158 11 / 30%);
  }

  /* ── 数据网格 ── */
  .card-data-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 4px;
  }

  .card-sub-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .data-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .cell-label {
    font-size: 11px;
    color: var(--text-dim);
  }

  .cell-val {
    font-size: 14px;
    font-weight: 600;
  }

  /* ── 进度条 ── */
  .card-progress {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .prog-track {
    flex: 1;
    height: 6px;
    overflow: hidden;
    background: var(--bg-card2);
    border-radius: 3px;
  }

  .prog-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s;
  }

  .prog-pct {
    min-width: 30px;
    font-size: 12px;
    font-weight: 600;
  }

  /* ── 底部汇总 ── */
  .bottom-summary {
    @include ma.ma-neon-surface;
    @include ma.ma-neon-surface-children;

    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
  }

  .summary-left,
  .summary-right {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
  }

  .summary-alerts {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .s-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .alert-item {
    font-size: 12px;
  }

  .alert-item.warn {
    color: #f59e0b;
  }

  .alert-item.orange {
    color: #f97316;
  }

  .sep {
    color: var(--text-dim);
  }

  @media (prefers-reduced-motion: reduce) {
    .ma-skeleton-orbit {
      animation: none;
    }

    .toggle-btn,
    .camp-card,
    .plat-icon,
    .bottom-summary {
      transition: none;
    }

    .toggle-btn:not(.active):hover,
    .camp-card:hover {
      transform: none;
    }

    .camp-card:hover .plat-icon {
      transform: none;
    }
  }
</style>
