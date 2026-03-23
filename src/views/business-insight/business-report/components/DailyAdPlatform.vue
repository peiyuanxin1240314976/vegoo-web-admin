<template>
  <div class="daily-ad-platform">
    <!-- ── 页面标题行（无背景）────────────────────────────── -->
    <div class="dap-title-row">
      <div class="dap-title-left">
        <span class="dap-title-app">整体</span>
        <span class="dap-title-app">全部平台</span>
        <span class="dap-title-badge">日报</span>
        <span class="dap-title-date">2026年3月13日</span>
      </div>
    </div>

    <!-- ── 平台卡片网格 ─────────────────────────────────── -->
    <div class="platforms-grid">
      <div
        v-for="p in mainPlatforms"
        :key="p.id"
        class="platform-card"
        :style="{ '--accent': p.color }"
      >
        <!-- 卡片标题：icon + 平台名 -->
        <div class="pc-header">
          <div class="pc-logo" :style="{ background: p.color + '22', color: p.color }">
            {{ p.logo }}
          </div>
          <span class="pc-name">{{ p.name }}</span>
        </div>

        <!-- 广告支出 -->
        <div class="pc-label-row">
          <span class="pc-label">广告支出</span>
          <span class="pc-label">环比</span>
        </div>
        <div class="pc-value-row">
          <span class="pc-spend-val">{{ p.adSpend }}</span>
          <span :class="['pc-chg', p.adSpendChange >= 0 ? 'pos' : 'neg']">
            {{ p.adSpendChange >= 0 ? '+' : '' }}{{ p.adSpendChange }}%
          </span>
        </div>

        <!-- 买量用户 / CPI -->
        <div class="pc-label-row">
          <span class="pc-label">买量用户</span>
          <span class="pc-label">CPI</span>
        </div>
        <div class="pc-value-row">
          <span class="pc-val">{{ p.acquisitions }}</span>
          <span class="pc-val">{{ p.cpi }}</span>
        </div>

        <!-- ROI -->
        <div class="pc-roi">
          <span
            >首日ROI <b :class="roiColor(p.roi1d)">{{ p.roi1d }}</b></span
          >
          <span
            >7日ROI <b :class="roiColor(p.roi7d)">{{ p.roi7d }}</b></span
          >
        </div>

        <!-- 占总支出 -->
        <div class="pc-share-label">占总支出 {{ p.sharePercent }}%</div>
        <div class="pc-share-bar">
          <div
            class="pc-share-fill"
            :style="{ width: p.sharePercent + '%', background: p.color }"
          />
        </div>
      </div>

      <!-- 其他平台小卡 -->
      <div class="others-card">
        <div class="others-header">其他平台</div>
        <div
          v-for="p in otherPlatforms"
          :key="p.id"
          class="other-row"
          :style="{ '--accent': p.color }"
        >
          <div class="other-logo" :style="{ background: p.color + '33', color: p.color }">
            {{ p.logo }}
          </div>
          <span class="other-name">{{ p.name }}</span>
          <span class="other-spend">{{ p.adSpend }}</span>
          <span class="other-share">{{ p.sharePercent }}%</span>
        </div>
      </div>
    </div>

    <!-- ── 指标对比表 ──────────────────────────────────── -->
    <div class="data-card">
      <div class="card-title">广告平台指标对比</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>平台</th>
              <th>广告支出</th>
              <th>广告支出环比</th>
              <th>买量用户</th>
              <th>广告系列数</th>
              <th>CPI</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>首日ROI</th>
              <th>7日ROI</th>
              <th>预估利润</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in allPlatforms" :key="p.id">
              <td>
                <div class="platform-cell">
                  <div class="tc-logo" :style="{ background: p.color + '22', color: p.color }">
                    {{ p.logo }}
                  </div>
                  <span>{{ p.name }}</span>
                </div>
              </td>
              <td>{{ p.adSpend }}</td>
              <td :class="p.adSpendChange >= 0 ? 'chg-pos' : 'chg-neg'">
                {{ p.adSpendChange >= 0 ? '+' : '' }}{{ p.adSpendChange }}%
              </td>
              <td>{{ p.acquisitions }}</td>
              <td>{{ p.campaigns }}</td>
              <td>{{ p.cpi }}</td>
              <td>{{ p.cpm }}</td>
              <td>{{ p.cpc }}</td>
              <td :class="roiColor(p.roi1d)">{{ p.roi1d }}</td>
              <td :class="roiColor(p.roi7d)">{{ p.roi7d }}</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- ── 右下角推送 ─────────────────────────────────────── -->
    <div class="dap-push-bar">
      <span class="dap-push-last">上次推送：今日 08:30 飞书群《经营日报》</span>
      <button class="dap-push-btn" @click="openPushModal()">立即推送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, inject } from 'vue'
  import { adPlatformCards } from '../mockData'

  const openPushModal = inject<() => void>('openPushModal', () => {})

  const mainPlatforms = computed(() => adPlatformCards.slice(0, 5))
  const otherPlatforms = computed(() => adPlatformCards.slice(5))
  const allPlatforms = computed(() => adPlatformCards)

  const roiColor = (val: string) => {
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    return 'roi-normal'
  }
</script>

<style scoped>
  .daily-ad-platform {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 14px;
    padding: 14px 14px 52px;
    overflow-y: auto;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
  }

  /* ── 页面标题行 ────────────────────────────────────────── */
  .dap-title-row {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0;
  }

  .dap-title-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dap-title-app {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .dap-title-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .dap-title-date {
    font-size: 13px;
    color: rgb(255 255 255 / 65%);
  }

  /* ── 平台卡片网格 ──────────────────────────────────────── */
  .platforms-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
  }

  @media (width <= 1300px) {
    .platforms-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .platform-card {
    padding: 12px;
    background: linear-gradient(
      145deg,
      color-mix(in srgb, var(--accent) 22%, transparent) 0%,
      color-mix(in srgb, var(--accent) 6%, #0d1529) 100%
    );
    border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
    border-radius: 10px;
    transition:
      border-color 0.2s,
      transform 0.15s;
  }

  .platform-card:hover {
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    transform: translateY(-2px);
  }

  /* 卡片标题 */
  .pc-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  .pc-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    font-weight: 700;
    border-radius: 7px;
  }

  .pc-name {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  /* 标签行 */
  .pc-label-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .pc-label {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  /* 数值行 */
  .pc-value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .pc-spend-val {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  }

  .pc-val {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
  }

  .pos {
    font-size: 12px;
    font-weight: 600;
    color: #00d4a1;
  }

  .neg {
    font-size: 12px;
    font-weight: 600;
    color: #ff5c5c;
  }

  .pc-roi {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 11px;
    color: rgb(255 255 255 / 50%);
  }

  .pc-roi b {
    font-weight: 600;
  }

  .pc-share-label {
    margin-bottom: 4px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .pc-share-bar {
    height: 3px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .pc-share-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
  }

  /* 其他平台 */
  .others-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .others-header {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 70%);
  }

  .other-row {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 10px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent) 20%, transparent) 0%,
      color-mix(in srgb, var(--accent) 5%, transparent) 100%
    );
    border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    border-radius: 8px;
  }

  .other-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 5px;
  }

  .other-name {
    flex: 1;
    font-size: 12px;
    color: rgb(255 255 255 / 75%);
  }

  .other-spend {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
  }

  .other-share {
    width: 28px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
    text-align: right;
  }

  /* ── 指标对比表 ────────────────────────────────────────── */
  .data-card {
    padding: 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .card-title {
    margin-bottom: 14px;
    font-size: 16px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    min-width: 800px;
    font-size: 12px;
    border-collapse: collapse;
  }

  .data-table thead {
    background: rgb(255 255 255 / 6%);
  }

  .data-table th {
    padding: 7px 10px;
    font-weight: 600;
    color: rgb(255 255 255 / 55%);
    text-align: left;
    white-space: nowrap;
  }

  .data-table th:first-child {
    border-radius: 4px 0 0 4px;
  }

  .data-table th:last-child {
    border-radius: 0 4px 4px 0;
  }

  .data-table td {
    padding: 7px 10px;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .data-table tr:not(:last-child) td {
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .data-table tr:hover td {
    background: rgb(255 255 255 / 3%);
  }

  .platform-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .tc-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 5px;
  }

  .chg-pos {
    font-weight: 500;
    color: #00d4a1;
  }

  .chg-neg {
    font-weight: 500;
    color: #ff5c5c;
  }

  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }

  .roi-normal {
    color: rgb(255 255 255 / 75%);
  }

  /* ── 右下角推送栏 ─────────────────────────────────────────── */
  .dap-push-bar {
    position: absolute;
    right: 14px;
    bottom: 14px;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .dap-push-last {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .dap-push-btn {
    padding: 4px 14px;
    font-size: 11px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 5px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.85;
    }
  }
</style>
