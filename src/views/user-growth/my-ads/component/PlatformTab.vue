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
    <!-- ── 副标题 + 切换 ── -->
    <div class="tab-sub-header">
      <span class="sub-desc">应用视角 | 展示各应用在各广告平台的广告数据</span>
      <div class="toggle-group">
        <div :class="['toggle-btn', groupByApp ? 'active' : '']" @click="groupByApp = true">
          按应用分组
        </div>
        <div :class="['toggle-btn', !groupByApp ? 'active' : '']" @click="groupByApp = false">
          按平台分组
        </div>
      </div>
    </div>

    <template v-if="showSkeleton">
      <!-- 骨架屏 -->
      <div class="platform-skeleton">
        <ElSkeleton animated :rows="6" />
      </div>
      <div class="bottom-summary platform-skeleton-footer">
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
            <!-- 应用标题行 -->
            <div class="app-group-header">
              <span class="app-icon">{{ app.icon || '📱' }}</span>
              <span class="app-name">{{ app.name }}（{{ app.nameEn }}）</span>
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

<style scoped>
  .platform-tab {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .platform-skeleton {
    min-height: 240px;
    padding: 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
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
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    padding: 40px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
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

  /* ── 副标题 ── */
  .tab-sub-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sub-desc {
    font-size: 12px;
    color: var(--text-dim);
  }

  .toggle-group {
    display: flex;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .toggle-btn {
    padding: 5px 14px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    transition:
      color 0.2s ease,
      background 0.2s ease,
      transform 0.2s ease;
  }

  .toggle-btn:not(.active):hover {
    color: var(--text-primary);
    background: rgb(0 212 170 / 8%);
    transform: translateY(-1px);
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

  /* ── 应用分组 ── */
  .app-groups {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .app-group-header {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 13px;
  }

  .app-icon {
    font-size: 18px;
  }

  .app-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .app-meta {
    margin-left: 4px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* ── 卡片网格 ── */
  .campaign-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .camp-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease,
      transform 0.22s ease;
  }

  .camp-card:hover {
    border-color: rgb(0 212 170 / 40%);
    box-shadow:
      0 8px 24px rgb(0 0 0 / 30%),
      0 0 0 1px rgb(0 212 170 / 12%);
    transform: translateY(-3px);
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
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition:
      border-color 0.22s ease,
      box-shadow 0.22s ease;
  }

  .bottom-summary:hover {
    border-color: #2a4060;
    box-shadow: 0 4px 18px rgb(0 0 0 / 22%);
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
