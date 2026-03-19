<script setup lang="ts">
  import { ref } from 'vue'
  import SummaryTab from './SummaryTab.vue'
  import PlatformTab from './PlatformTab.vue'
  import CampaignTab from './CampaignTab.vue'

  const activeTab = ref<'summary' | 'platform' | 'campaign'>('summary')

  const tabs = [
    { key: 'summary', label: '汇总' },
    { key: 'platform', label: '应用+广告平台' },
    { key: 'campaign', label: '广告系列明细' }
  ]

  const metrics = [
    {
      label: '广告支出',
      value: '$12,200',
      sub: '↑ 8.5%',
      subColor: '#10b981',
      valueColor: '#ffffff'
    },
    {
      label: '计算消耗',
      value: '$11,480',
      sub: '差异 -$720',
      subColor: '#f97316',
      valueColor: '#f97316'
    },
    {
      label: '代投消耗',
      value: '$8,960',
      sub: '占比73.4%',
      subColor: '#9ca3af',
      valueColor: '#f59e0b'
    },
    {
      label: '首日ROI',
      value: '38.2%',
      sub: '目标 35% ↑',
      subColor: '#10b981',
      valueColor: '#f59e0b'
    },
    {
      label: '预估利润',
      value: '$4,660',
      sub: '利润率0.2%',
      subColor: '#9ca3af',
      valueColor: '#10b981'
    },
    {
      label: '最低利润',
      value: '$2,100',
      sub: '安全边界',
      subColor: '#9ca3af',
      valueColor: '#a78bfa'
    }
  ]
</script>

<template>
  <div class="ads-root">
    <!-- ── 顶部标题栏 ── -->
    <div class="top-bar">
      <h1 class="page-title">我的广告</h1>
      <div class="top-actions">
        <div class="user-pill">
          <span class="pill-avatar">Z</span>
          <span class="pill-label">人员: 张三</span>
          <span class="pill-caret">∨</span>
        </div>
        <div class="date-pill">
          <span class="date-icon">📅</span>
          <span>期间: 2026-02-23 ~ 2026-03-01</span>
        </div>
        <button class="export-btn">导出报表</button>
      </div>
    </div>

    <!-- ── 用户信息卡 ── -->
    <div class="user-card">
      <div class="user-left">
        <div class="user-avatar">张</div>
        <div class="user-info">
          <div class="user-name">张三</div>
          <div class="user-role">高级投放师</div>
          <div class="user-apps">负责应用：Weather5、BloodSugar2、PhoneTracker</div>
        </div>
      </div>
      <div class="user-metrics">
        <div v-for="m in metrics" :key="m.label" class="metric-item">
          <div class="metric-label">{{ m.label }}</div>
          <div class="metric-value" :style="{ color: m.valueColor }">{{ m.value }}</div>
          <div class="metric-sub" :style="{ color: m.subColor }">{{ m.sub }}</div>
        </div>
      </div>
    </div>

    <!-- ── Tabs ── -->
    <div class="tabs-nav">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-item', activeTab === tab.key ? 'active' : '']"
        @click="activeTab = tab.key as any"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- ── Tab 内容 ── -->
    <div class="tab-content">
      <SummaryTab v-if="activeTab === 'summary'" />
      <PlatformTab v-else-if="activeTab === 'platform'" />
      <CampaignTab v-else-if="activeTab === 'campaign'" />
    </div>
  </div>
</template>

<style scoped>
  /* ── CSS 变量 ── */
  .ads-root {
    --bg-root: #080e1a;
    --bg-card: #0f1929;
    --bg-card2: #111c2d;
    --border: #1e2f45;
    --teal: #00d4aa;
    --teal-dim: rgb(0 212 170 / 15%);
    --yellow: #f59e0b;
    --orange: #f97316;
    --purple: #a78bfa;
    --red: #ef4444;
    --green: #10b981;
    --blue: #60a5fa;
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-dim: #64748b;

    box-sizing: border-box;
    min-height: 100vh;
    padding: 16px 20px;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-root);
  }

  /* ── 顶部栏 ── */
  .top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .top-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .user-pill {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px 5px 6px;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: var(--teal);
    border-radius: 20px;
  }

  .pill-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 11px;
    font-weight: 700;
    background: rgb(0 0 0 / 25%);
    border-radius: 50%;
  }

  .pill-caret {
    font-size: 10px;
  }

  .date-pill {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .export-btn {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: var(--teal);
    border: none;
    border-radius: 6px;
    transition: opacity 0.2s;
  }

  .export-btn:hover {
    opacity: 0.85;
  }

  /* ── 用户卡 ── */
  .user-card {
    position: relative;
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 16px 20px;
    margin-bottom: 0;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--teal);
    border-radius: 10px;
  }

  .user-card::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    content: '';
    background: var(--teal);
  }

  .user-left {
    display: flex;
    gap: 14px;
    align-items: center;
    min-width: 240px;
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    font-size: 22px;
    font-weight: 700;
    color: #000;
    background: var(--teal);
    border-radius: 50%;
  }

  .user-name {
    font-size: 18px;
    font-weight: 700;
    color: #f1f5f9;
  }

  .user-role {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .user-apps {
    margin-top: 2px;
    font-size: 12px;
    color: var(--text-dim);
  }

  .user-metrics {
    display: flex;
    flex: 1;
    justify-content: space-around;
    padding-left: 24px;
    border-left: 1px solid var(--border);
  }

  .metric-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
  }

  .metric-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .metric-value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .metric-sub {
    font-size: 11px;
  }

  /* ── Tabs ── */
  .tabs-nav {
    display: flex;
    gap: 0;
    margin-top: 16px;
    border-bottom: 1px solid var(--border);
  }

  .tab-item {
    padding: 10px 20px;
    margin-bottom: -1px;
    font-size: 14px;
    color: var(--text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .tab-item:hover {
    color: var(--text-primary);
  }

  .tab-item.active {
    font-weight: 500;
    color: var(--teal);
    border-bottom-color: var(--teal);
  }

  /* ── Tab 内容区域 ── */
  .tab-content {
    padding-top: 16px;
  }
</style>
