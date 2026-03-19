<template>
  <div class="iap-overview-page art-full-height">
    <header class="iap-overview-header">
      <div class="iap-overview-title">
        <span class="iap-overview-title__text">{{ $t('menus.businessInsight.title') }}</span>
        <span class="iap-overview-title__sep">/</span>
        <span class="iap-overview-title__text is-active">{{
          $t('menus.businessInsight.iapAnalysis')
        }}</span>
      </div>
      <div class="iap-overview-desc">应用内购/订阅率及收入分析</div>
    </header>

    <div class="iap-overview-filter">
      <div class="iap-overview-filter__left">
        <div class="iap-overview-pill">
          <span class="iap-overview-pill__label">时间范围</span>
          <ElSelect v-model="filters.time" size="small" class="iap-overview-select">
            <ElOption label="最近30天" value="30" />
            <ElOption label="最近7天" value="7" />
            <ElOption label="最近90天" value="90" />
          </ElSelect>
        </div>
        <div class="iap-overview-pill">
          <span class="iap-overview-pill__label">应用</span>
          <ElSelect v-model="filters.app" size="small" class="iap-overview-select">
            <ElOption label="全部应用" value="all" />
          </ElSelect>
        </div>
        <div class="iap-overview-pill">
          <span class="iap-overview-pill__label">产品类型</span>
          <ElSelect v-model="filters.type" size="small" class="iap-overview-select">
            <ElOption label="全部" value="all" />
          </ElSelect>
        </div>
        <div class="iap-overview-pill">
          <span class="iap-overview-pill__label">国家</span>
          <ElSelect v-model="filters.country" size="small" class="iap-overview-select">
            <ElOption label="全部" value="all" />
          </ElSelect>
        </div>
        <div class="iap-overview-pill">
          <span class="iap-overview-pill__label">平台</span>
          <ElSelect v-model="filters.platform" size="small" class="iap-overview-select">
            <ElOption label="全部" value="all" />
          </ElSelect>
        </div>
      </div>
      <div class="iap-overview-filter__right">
        <ElButton size="small" round class="iap-overview-btn">
          <ElIcon><Download /></ElIcon>
          导出
        </ElButton>
        <ElButton size="small" round class="iap-overview-btn">
          <ElIcon><Refresh /></ElIcon>
          刷新
        </ElButton>
      </div>
    </div>

    <div class="iap-overview-table-wrap">
      <ElTable
        :data="tableData"
        class="iap-overview-table"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        size="small"
      >
        <ElTableColumn label="应用" min-width="150" prop="name">
          <template #default="{ row }">
            <div class="iap-overview-app-cell" :class="{ 'is-child': row.isChild }">
              <div
                v-if="!row.isChild"
                class="iap-overview-app-icon"
                :style="{ background: row.iconBg }"
              >
                <ElIcon :size="13"><component :is="row.icon" /></ElIcon>
              </div>
              <div
                v-else
                class="iap-overview-app-icon iap-overview-app-icon--child"
                :style="{ background: row.iconBg }"
              >
                <ElIcon :size="11"><component :is="row.icon" /></ElIcon>
              </div>
              <span
                class="iap-overview-app-name"
                :class="{ 'is-child': row.isChild }"
                @click="goToDetail(row)"
                >{{ row.name }}</span
              >
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="平台" width="70" prop="platform">
          <template #default="{ row }">
            <span class="iap-overview-cell-muted">{{ row.platform }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="广告平台" width="90" prop="adPlatform">
          <template #default="{ row }">
            <div class="iap-overview-ad-cell">
              <template v-if="row.adPlatform === 'google'">
                <span class="iap-overview-ad-tag iap-overview-ad-tag--google">G</span>
              </template>
              <template v-else-if="row.adPlatform === 'facebook'">
                <span class="iap-overview-ad-tag iap-overview-ad-tag--facebook">f</span>
              </template>
              <template v-else-if="row.adPlatform === 'all'">
                <span class="iap-overview-cell-muted">全部</span>
              </template>
              <template v-else>
                <span class="iap-overview-cell-muted">—</span>
              </template>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="评估天数" width="80" prop="evalDays" align="center">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.evalDays || '—' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="达标要求" width="80" prop="targetReq" align="center">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.targetReq || '—' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="最低要求" width="80" prop="minReq" align="center">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.minReq || '—' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="难度系数" width="80" prop="difficulty" align="center">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.difficulty || '—' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="最低利润" width="90" prop="minProfit" align="center">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.minProfit || '—' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="广告支出" width="90" prop="adSpend" align="right">
          <template #default="{ row }">
            <span class="iap-overview-cell-green">{{ row.adSpend }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="计算消耗" width="90" prop="calcCost" align="right">
          <template #default="{ row }">
            <span class="iap-overview-cell-green">{{ row.calcCost }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="ROI" width="72" prop="roi" align="center">
          <template #default="{ row }">
            <span v-if="row.roi" class="iap-overview-roi-badge" :class="getRoiClass(row.roi)">{{
              row.roi
            }}</span>
            <span v-else class="iap-overview-cell-muted">—</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="代投消耗" width="90" prop="proxyCost" align="right">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.proxyCost }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="预估利润" width="90" prop="estProfit" align="right">
          <template #default="{ row }">
            <span :class="getProfitClass(row.estProfit)">{{ row.estProfit }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="CPA" width="72" prop="cpa" align="center">
          <template #default="{ row }">
            <span class="iap-overview-cell-norm">{{ row.cpa || '—' }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="分数" width="65" prop="score" align="center">
          <template #default="{ row }">
            <span
              v-if="row.score !== undefined && row.score !== null"
              class="iap-overview-score-badge"
              :class="getScoreClass(row.score)"
              >{{ row.score }}分</span
            >
            <span v-else class="iap-overview-cell-muted">—</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="当前状态" width="110" prop="status" align="center">
          <template #default="{ row }">
            <div class="iap-overview-status-cell">
              <ElTag
                v-if="row.status"
                size="small"
                :class="getStatusClass(row.status)"
                class="iap-overview-status-tag"
                >{{ row.status }}</ElTag
              >
              <div v-if="row.statusNote" class="iap-overview-status-note">{{ row.statusNote }}</div>
              <div v-if="row.statusBadge" class="iap-overview-status-badge">{{
                row.statusBadge
              }}</div>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="iap-overview-summary">
        <div class="iap-overview-summary__label">合计/均值:</div>
        <div class="iap-overview-summary__cells">
          <div class="iap-overview-s-cell" style="width: 310px"></div>
          <div class="iap-overview-s-cell" style="width: 80px; text-align: center">
            <span class="iap-overview-s-hint">基础系数: —</span>
          </div>
          <div class="iap-overview-s-cell" style="width: 170px"></div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 90px">
            <div class="iap-overview-s-sub">广告支出</div>
            <div class="iap-overview-s-val iap-overview-s-val--green">$36,600</div>
          </div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 90px">
            <div class="iap-overview-s-sub">计算消耗</div>
            <div class="iap-overview-s-val iap-overview-s-val--green">$34,200</div>
          </div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 72px">
            <div class="iap-overview-s-sub">平均ROI</div>
            <div class="iap-overview-s-val">88%</div>
          </div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 90px">
            <div class="iap-overview-s-sub">代投消耗</div>
            <div class="iap-overview-s-val">$6,180</div>
          </div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 90px">
            <div class="iap-overview-s-sub">预估利润</div>
            <div class="iap-overview-s-val iap-overview-s-val--green">$8,450</div>
          </div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 72px">
            <div class="iap-overview-s-sub">平均CPA</div>
            <div class="iap-overview-s-val">$2.21</div>
          </div>
          <div class="iap-overview-s-cell iap-overview-s-cell--head" style="width: 65px">
            <div class="iap-overview-s-sub">绩效分数</div>
            <div class="iap-overview-s-val iap-overview-s-val--score">92分</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Download, Refresh } from '@element-plus/icons-vue'

  defineOptions({ name: 'IapOverview' })

  const router = useRouter()

  const filters = ref({
    time: '30',
    app: 'all',
    type: 'all',
    country: 'all',
    platform: 'all'
  })

  interface RowData {
    id: string
    name: string
    platform: string
    adPlatform: string
    evalDays?: string
    targetReq?: string
    minReq?: string
    difficulty?: string
    minProfit?: string
    adSpend: string
    calcCost: string
    roi?: string
    proxyCost: string
    estProfit: string
    cpa?: string
    score?: number | null
    status?: string
    statusNote?: string
    statusBadge?: string
    icon: string
    iconBg: string
    isChild?: boolean
    children?: RowData[]
    hasChildren?: boolean
  }

  const tableData = ref<RowData[]>([
    {
      id: '1',
      name: 'Weather5',
      platform: '安卓',
      adPlatform: 'google',
      evalDays: '3天',
      targetReq: '53%',
      minReq: '50%',
      difficulty: '1.2',
      minProfit: '—',
      adSpend: '$12,450',
      calcCost: '$11,800',
      roi: '91%',
      proxyCost: '$2,100',
      estProfit: '+$3,240',
      cpa: '$2.21',
      score: 28,
      status: '投放中',
      icon: 'Cloudy',
      iconBg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)'
    },
    {
      id: '2',
      name: 'Weather8',
      platform: '安卓',
      adPlatform: 'all',
      adSpend: '$8,200',
      calcCost: '$7,600',
      roi: '53%',
      proxyCost: '$1,200',
      estProfit: '+$1,840',
      status: '投放中',
      icon: 'Cloudy',
      iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      hasChildren: true,
      children: [
        {
          id: '2-1',
          name: 'Weather8',
          platform: '安卓',
          adPlatform: 'facebook',
          evalDays: '3天',
          targetReq: '53%',
          minReq: '50%',
          difficulty: '1.2',
          adSpend: '$4,800',
          calcCost: '$4,800',
          roi: '53%',
          proxyCost: '$800',
          estProfit: '-$340',
          cpa: '$2.45',
          score: 0,
          status: '投放中',
          icon: 'Cloudy',
          iconBg: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
          isChild: true
        }
      ]
    },
    {
      id: '3',
      name: 'PhoneTracker2',
      platform: '安卓',
      adPlatform: 'google',
      evalDays: '3天',
      targetReq: '100%',
      minReq: '97%',
      difficulty: '1',
      adSpend: '$6,800',
      calcCost: '$6,400',
      roi: '98%',
      proxyCost: '$1,100',
      estProfit: '+$2,180',
      cpa: '$1.89',
      score: 25,
      status: '投放中',
      icon: 'Iphone',
      iconBg: 'linear-gradient(135deg,#6c63ff,#a78bfa)'
    },
    {
      id: '4',
      name: 'PhoneTracker2',
      platform: '安卓',
      adPlatform: 'facebook',
      evalDays: '1天',
      targetReq: '97%',
      minReq: '92%',
      difficulty: '1',
      adSpend: '$4,200',
      calcCost: '$3,900',
      roi: '94%',
      proxyCost: '$680',
      estProfit: '+$1,240',
      cpa: '$2.12',
      score: 22,
      status: '投放中',
      icon: 'Iphone',
      iconBg: 'linear-gradient(135deg,#6c63ff,#a78bfa)'
    },
    {
      id: '5',
      name: 'BloodSugar2',
      platform: '安卓',
      adPlatform: 'google',
      evalDays: '3天',
      targetReq: '100%',
      minReq: '95%',
      difficulty: '1',
      adSpend: '$9,760',
      calcCost: '$9,200',
      roi: '96%',
      proxyCost: '$1,800',
      estProfit: '+$3,120',
      cpa: '$2.08',
      score: 26,
      status: '投放中',
      icon: 'Sugar',
      iconBg: 'linear-gradient(135deg,#ef4444,#f87171)'
    },
    {
      id: '6',
      name: 'CPUMonitor',
      platform: '安卓',
      adPlatform: 'google',
      evalDays: '3天',
      targetReq: '95%',
      minReq: '93%',
      difficulty: '1',
      adSpend: '$3,200',
      calcCost: '$3,000',
      roi: '98%',
      proxyCost: '$480',
      estProfit: '-$120',
      cpa: '$2.38',
      score: 0,
      status: '投放中',
      statusNote: '变更: 2026-02-28',
      icon: 'Monitor',
      iconBg: 'linear-gradient(135deg,#10b981,#34d399)'
    },
    {
      id: '7',
      name: 'Dressup',
      platform: '安卓',
      adPlatform: 'google',
      evalDays: '3天',
      targetReq: '75%',
      minReq: '70%',
      difficulty: '0.7',
      minProfit: '$45,000',
      adSpend: '$4,850',
      calcCost: '$4,500',
      roi: '72%',
      proxyCost: '$620',
      estProfit: '+$1,890',
      cpa: '$18.50',
      score: 18,
      status: '投放中',
      statusBadge: 'CPA≤$25',
      icon: 'Brush',
      iconBg: 'linear-gradient(135deg,#ec4899,#f472b6)'
    }
  ])

  function goToDetail(row: RowData) {
    if (row.isChild) return
    router.push({
      name: 'IapAnalysisDetail',
      query: { app: row.name }
    })
  }

  function getRoiClass(roi: string) {
    const val = parseInt(roi)
    if (val >= 90) return 'is-high'
    if (val >= 70) return 'is-mid'
    return 'is-low'
  }

  function getProfitClass(profit: string) {
    if (!profit || profit === '—') return 'iap-overview-cell-muted'
    if (profit.startsWith('+')) return 'iap-overview-cell-profit-pos'
    if (profit.startsWith('-')) return 'iap-overview-cell-profit-neg'
    return 'iap-overview-cell-norm'
  }

  function getScoreClass(score: number) {
    if (score >= 25) return 'is-high'
    if (score >= 15) return 'is-mid'
    return 'is-zero'
  }

  function getStatusClass(status: string) {
    if (status === '投放中') return 'is-active'
    return 'is-default'
  }
</script>

<style scoped lang="scss">
  .iap-overview-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 100%;
    padding: 20px 24px;
    overflow: auto;
    font-size: 13px;
    color: var(--art-gray-900);
    background: var(--default-bg-color);
  }

  .iap-overview-header {
    margin-bottom: 14px;
  }

  .iap-overview-title {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 15px;
    font-weight: 600;

    .iap-overview-title__sep {
      color: var(--art-gray-400);
    }

    .iap-overview-title__text {
      color: var(--art-gray-600);
      cursor: pointer;

      &:hover {
        color: var(--art-gray-900);
      }

      &.is-active {
        color: var(--art-gray-900);
      }
    }
  }

  .iap-overview-desc {
    margin-top: 4px;
    font-size: 12px;
    color: var(--art-gray-500);
  }

  .iap-overview-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    margin-bottom: 12px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  .iap-overview-filter__left {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  .iap-overview-filter__right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
  }

  .iap-overview-pill {
    display: flex;
    gap: 5px;
    align-items: center;

    .iap-overview-pill__label {
      font-size: 12px;
      color: var(--art-gray-600);
      white-space: nowrap;
    }
  }

  :deep(.iap-overview-select) {
    width: 100px;

    .el-input__wrapper {
      background: var(--default-bg-color) !important;
      border-radius: 5px;
      box-shadow: 0 0 0 1px var(--default-border) !important;

      &:hover {
        box-shadow: 0 0 0 1px var(--art-gray-400) !important;
      }
    }

    .el-input__inner {
      font-size: 12px;
      color: var(--art-gray-900) !important;
    }
  }

  .iap-overview-btn {
    font-size: 12px;
    color: var(--art-gray-600) !important;
    background: var(--default-box-color) !important;
    border-color: var(--default-border) !important;

    &:hover {
      color: var(--art-gray-900) !important;
      background: var(--art-hover-color) !important;
      border-color: var(--art-gray-600) !important;
    }
  }

  .iap-overview-table-wrap {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 8px;
  }

  :deep(.iap-overview-table) {
    font-size: 12px;
    color: var(--art-gray-900);
    background: transparent !important;

    .el-table__header-wrapper th.el-table__cell {
      padding: 8px 0;
      font-size: 12px;
      font-weight: 500;
      color: var(--art-gray-600) !important;
      background: var(--default-bg-color) !important;
      border-right: none !important;
      border-bottom: 1px solid var(--default-border) !important;
    }

    .el-table__body-wrapper .el-table__row {
      background: transparent !important;

      &:hover > td {
        background: var(--art-hover-color) !important;
      }

      td.el-table__cell {
        padding: 7px 0;
        color: var(--art-gray-900);
        background: transparent !important;
        border-right: none !important;
        border-bottom: 1px solid var(--default-border) !important;
      }
    }

    .el-table__expand-icon {
      color: var(--art-gray-600);

      &:hover {
        color: var(--art-gray-700);
      }
    }

    .el-table__indent {
      padding-left: 16px !important;
    }

    .el-table__placeholder {
      display: inline-block;
      width: 16px;
    }

    .el-table__inner-wrapper::before {
      display: none;
    }
  }

  .iap-overview-app-cell {
    display: flex;
    gap: 7px;
    align-items: center;
    padding-left: 4px;

    &.is-child {
      padding-left: 0;
    }
  }

  .iap-overview-app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #fff;
    border-radius: 5px;

    &--child {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      opacity: 0.85;
    }
  }

  .iap-overview-app-name {
    font-size: 12px;
    color: var(--art-gray-900);
    cursor: pointer;

    &:hover {
      color: var(--art-primary);
      text-decoration: underline;
    }

    &.is-child {
      color: var(--art-gray-600);
      cursor: default;

      &:hover {
        color: var(--art-gray-600);
        text-decoration: none;
      }
    }
  }

  .iap-overview-cell-muted {
    color: var(--art-gray-500);
  }

  .iap-overview-cell-norm {
    color: var(--art-gray-600);
  }

  .iap-overview-cell-green {
    color: var(--art-success);
  }

  .iap-overview-cell-profit-pos {
    font-weight: 500;
    color: var(--art-success);
  }

  .iap-overview-cell-profit-neg {
    font-weight: 500;
    color: var(--art-danger);
  }

  .iap-overview-ad-cell {
    display: flex;
    align-items: center;
  }

  .iap-overview-ad-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 5px;

    &--google {
      color: #58a6ff;
      background: #1a3a5c;
      border: 1px solid #1d4070;
    }

    &--facebook {
      color: #4c8ef7;
      background: #1a2f4e;
      border: 1px solid #1d3a62;
    }
  }

  .iap-overview-roi-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 4px;

    &.is-high {
      color: var(--art-success);
      background: rgb(16 185 129 / 15%);
      border: 1px solid rgb(16 185 129 / 35%);
    }

    &.is-mid {
      color: var(--art-warning);
      background: rgb(249 115 22 / 15%);
      border: 1px solid rgb(249 115 22 / 35%);
    }

    &.is-low {
      color: var(--art-danger);
      background: rgb(239 68 68 / 15%);
      border: 1px solid rgb(239 68 68 / 35%);
    }
  }

  .iap-overview-score-badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 11px;
    border-radius: 4px;

    &.is-high {
      color: var(--art-success);
      background: rgb(16 185 129 / 15%);
    }

    &.is-mid {
      color: var(--art-warning);
      background: rgb(249 115 22 / 15%);
    }

    &.is-zero {
      color: var(--art-gray-500);
      background: transparent;
    }
  }

  .iap-overview-status-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-items: center;
  }

  .iap-overview-status-tag {
    font-size: 11px !important;

    &.is-active {
      color: var(--art-success) !important;
      background: rgb(16 185 129 / 20%) !important;
      border-color: rgb(16 185 129 / 40%) !important;
    }

    &.is-default {
      color: var(--art-gray-600) !important;
      background: var(--art-gray-200) !important;
      border-color: var(--default-border) !important;
    }
  }

  .iap-overview-status-note {
    font-size: 10px;
    color: var(--art-warning);
  }

  .iap-overview-status-badge {
    padding: 1px 5px;
    font-size: 10px;
    color: var(--art-primary);
    background: rgb(59 130 246 / 15%);
    border: 1px solid rgb(59 130 246 / 35%);
    border-radius: 3px;
  }

  .iap-overview-summary {
    display: flex;
    align-items: stretch;
    min-height: 44px;
    padding: 0 12px;
    background: var(--default-bg-color);
    border-top: 1px solid var(--default-border);
  }

  .iap-overview-summary__label {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    width: 120px;
    font-size: 12px;
    font-weight: 500;
    color: var(--art-gray-600);
  }

  .iap-overview-summary__cells {
    display: flex;
    flex: 1;
    align-items: center;
    overflow-x: auto;
  }

  .iap-overview-s-cell {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: flex-end;
    justify-content: center;
    padding: 4px 8px;

    &--head {
      border-left: 1px solid var(--default-border);
    }
  }

  .iap-overview-s-hint {
    font-size: 11px;
    color: var(--art-gray-500);
  }

  .iap-overview-s-sub {
    margin-bottom: 2px;
    font-size: 10px;
    color: var(--art-gray-600);
  }

  .iap-overview-s-val {
    font-size: 12px;
    font-weight: 600;
    color: var(--art-gray-600);

    &--green {
      color: var(--art-success);
    }

    &--score {
      color: var(--art-success);
    }
  }
</style>
