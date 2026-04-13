<template>
  <div class="app-sidebar">
    <!-- ─── Header ─── -->
    <div class="sidebar-header">
      <span class="sidebar-title">应用列表</span>
      <button class="sort-btn" @click="toggleSort">
        {{ sortLabel }} <i :class="['sort-icon', sortDir === 'desc' ? '' : 'asc']">↓</i>
      </button>
    </div>

    <!-- ─── 滚动内容区 ─── -->
    <div class="sidebar-scroll">
      <!-- ═══════════════════════════════════════════════════════
         日报·广告平台
         ═══════════════════════════════════════════════════ -->
      <template v-if="sidebarKey === 'daily-adPlatform'">
        <!-- Overall card -->
        <div
          v-if="overallItem"
          class="app-item overall ad-overall"
          :class="{ selected: selectedId === overallItem.id }"
          @click="$emit('select', overallItem.id)"
        >
          <div class="ad-overall-title">
            <span class="ad-overall-name">整体</span>
            <span class="ad-overall-cat">全部平台</span>
          </div>
          <div class="ad-metrics-grid">
            <div class="ad-metric">
              <div class="ad-metric-label">广告支出</div>
              <div class="ad-metric-value ad-green">${{ formatNum(overallItem.adSpend ?? 0) }}</div>
            </div>
            <div class="ad-metric">
              <div class="ad-metric-label">环比</div>
              <div class="ad-metric-value" :class="changeClass(overallItem.adSpendChange ?? 0)">
                {{ changeStr(overallItem.adSpendChange ?? 0) }}
              </div>
            </div>
            <div class="ad-metric">
              <div class="ad-metric-label">买量用户</div>
              <div class="ad-metric-value">{{ overallItem.paidUsers }}万</div>
            </div>
            <div class="ad-metric">
              <div class="ad-metric-label">广告系列数</div>
              <div class="ad-metric-value">{{ overallItem.activeCampaigns }}</div>
            </div>
          </div>
          <div class="platform-bar">
            <div
              v-for="seg in overallItem.platformBreakdown ?? []"
              :key="seg.name"
              class="platform-seg"
              :style="{ width: seg.percent + '%', background: seg.color }"
            >
              <template v-if="seg.percent >= 10">
                <div class="seg-name">{{ seg.name }}</div>
                <div class="seg-pct">{{ seg.percent }}%</div>
              </template>
            </div>
          </div>
          <div class="platform-legend">
            <span
              v-for="seg in (overallItem.platformBreakdown ?? []).slice(0, 3)"
              :key="seg.name"
              class="legend-item"
            >
              <span class="legend-dot" :style="{ background: seg.color }" />
              {{ seg.name }}
            </span>
          </div>
        </div>
        <div class="major-apps-list">
          <div
            v-for="item in majorAppsSorted"
            :key="item.id"
            class="major-app-card"
            :class="{ selected: selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="major-app-header">
              <div class="app-icon" :style="{ background: item.iconBg }">{{ item.iconEmoji }}</div>
              <div class="major-app-name-block">
                <span class="app-name">{{ item.name }}</span>
                <span class="app-category">{{ item.category }}</span>
              </div>
            </div>
            <div class="major-app-metrics">
              <div class="major-metric">
                <div class="major-metric-label">广告支出</div>
                <div class="major-metric-row">
                  <span class="major-metric-value">${{ formatNum(item.adSpend ?? 0) }}</span>
                  <span :class="['major-metric-change', changeClass(item.adSpendChange ?? 0)]">
                    {{ changeStr(item.adSpendChange ?? 0) }}
                  </span>
                </div>
              </div>
              <div class="major-metric major-metric-right">
                <div class="major-metric-label">买量用户</div>
                <div class="major-metric-value">{{ item.paidUsers }}万</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="subAppsSorted.length" class="sub-apps-grid">
          <div
            v-for="item in subAppsSorted"
            :key="item.id"
            class="sub-app-item"
            :class="{ selected: selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="sub-app-name">{{ item.name }}</div>
            <div class="sub-app-cat">{{ item.category }}</div>
            <div class="sub-app-spend">${{ formatNum(item.adSpend ?? 0) }}</div>
            <div :class="['sub-app-change', changeClass(item.adSpendChange ?? 0)]">
              {{ changeStr(item.adSpendChange ?? 0) }}
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         周报·广告平台 / 周报·广告平台分国家 / 月报·广告平台 / 月报·广告平台分国家
         整体卡相同；分国家为两列网格 + 支出环比「增高偏警示、降低偏利好」
         ═══════════════════════════════════════════════════ -->
      <template
        v-else-if="
          sidebarKey === 'weekly-adPlatform' ||
          sidebarKey === 'weekly-platformCountry' ||
          sidebarKey === 'monthly-adPlatform' ||
          sidebarKey === 'monthly-platformCountry'
        "
      >
        <div
          class="wap-section"
          :class="{
            'wap-section--platform-country':
              sidebarKey === 'weekly-platformCountry' || sidebarKey === 'monthly-platformCountry'
          }"
        >
          <div
            v-if="overallItem"
            class="wap-overall"
            :class="{ 'is-selected': selectedId === overallItem.id }"
            @click="$emit('select', overallItem.id)"
          >
            <div class="wap-ov-title">
              <span class="wap-ov-name">{{ overallItem.name }}</span>
              <span class="wap-ov-cat">{{ overallItem.category }}</span>
            </div>
            <div class="wap-ov-spend-row">
              <span class="wap-ov-spend-lbl">广告支出</span>
              <span class="wap-ov-amount">${{ formatNum(overallItem.adSpend ?? 0) }}</span>
              <span
                class="wap-ov-change"
                :class="(overallItem.adSpendChange ?? 0) >= 0 ? 'wap-up' : 'wap-down'"
              >
                {{ changeStr(overallItem.adSpendChange ?? 0) }}
              </span>
            </div>
            <div class="wap-ov-meta">
              <span
                >买量用户 <strong>{{ overallItem.paidUsers }}</strong
                >万</span
              >
              <span class="wap-ov-meta-sep">|</span>
              <span
                >广告系列数 <strong>{{ overallItem.activeCampaigns }}</strong></span
              >
            </div>
            <div class="wap-pbar">
              <div
                v-for="seg in overallItem.platformBreakdown ?? []"
                :key="seg.name"
                class="wap-pbar-seg"
                :style="{ width: seg.percent + '%', background: seg.color }"
              ></div>
            </div>
            <div class="wap-legend">
              <span
                v-for="seg in overallItem.platformBreakdown ?? []"
                :key="'wap-lg-' + seg.name"
                class="wap-legend-item"
              >
                <span class="wap-legend-sq" :style="{ background: seg.color }" />
                {{ seg.name }} {{ seg.percent }}%
              </span>
            </div>
          </div>

          <!-- 广告平台：左图单列卡 -->
          <div
            v-if="sidebarKey === 'weekly-adPlatform' || sidebarKey === 'monthly-adPlatform'"
            class="wap-app-list"
          >
            <div
              v-for="item in flatAdSpendAppsSorted"
              :key="item.id"
              class="wap-app-card"
              :class="{ 'is-selected': selectedId === item.id }"
              @click="$emit('select', item.id)"
            >
              <div class="wap-app-icon" :style="{ background: item.iconBg }">{{
                item.iconEmoji
              }}</div>
              <div class="wap-app-main">
                <div class="wap-app-line1">
                  <span class="wap-app-name">{{ item.name }}</span>
                  <span class="wap-app-cat">{{ item.category }}</span>
                </div>
                <div class="wap-app-line2">
                  <span class="wap-app-amt">${{ formatNum(item.adSpend ?? 0) }}</span>
                  <span
                    class="wap-app-pct"
                    :class="(item.adSpendChange ?? 0) >= 0 ? 'wap-up' : 'wap-down'"
                  >
                    {{ changeStr(item.adSpendChange ?? 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 广告平台分国家：两列网格（稿面：名称/分类一行，金额，环比） -->
          <div v-else class="wpc-app-grid">
            <div
              v-for="item in flatAdSpendAppsSorted"
              :key="item.id"
              class="wpc-app-tile"
              :class="{ 'is-selected': selectedId === item.id }"
              @click="$emit('select', item.id)"
            >
              <div class="wpc-tile-top">
                <span class="wpc-tile-name">{{ item.name }}</span>
                <span class="wpc-tile-cat">{{ item.category }}</span>
              </div>
              <div
                class="wpc-tile-amt"
                :class="wpcAmountStressClass(item.adSpend ?? 0, item.adSpendChange ?? 0)"
              >
                ${{ formatNum(item.adSpend ?? 0) }}
              </div>
              <div class="wpc-tile-pct" :class="adSpendChangeInvertClass(item.adSpendChange ?? 0)">
                {{ changeStr(item.adSpendChange ?? 0) }}
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         日报·在投广告系列 / 周报·在投广告系列 / 月报·在投广告系列
         ═══════════════════════════════════════════════════ -->
      <template
        v-else-if="
          sidebarKey === 'daily-campaigns' ||
          sidebarKey === 'weekly-campaigns' ||
          sidebarKey === 'monthly-campaigns'
        "
      >
        <!-- Overall card -->
        <div
          v-if="overallItem"
          class="camp-overall"
          :class="{
            'camp-selected': selectedId === overallItem.id
          }"
          @click="$emit('select', overallItem.id)"
        >
          <div class="camp-ov-title-row">
            <div class="camp-ov-name-block">
              <span class="camp-ov-name">整体</span>
              <span class="camp-ov-cat">全部平台</span>
            </div>
            <span v-if="selectedId === overallItem.id" class="camp-selected-badge">SELECTED</span>
          </div>
          <div class="camp-ov-spend-label">广告支出</div>
          <div class="camp-ov-spend-row">
            <span class="camp-ov-amount">${{ formatNum(overallItem.adSpend ?? 0) }}</span>
            <span :class="['camp-ov-change', changeClass(overallItem.adSpendChange ?? 0)]">
              {{ changeStr(overallItem.adSpendChange ?? 0) }}
            </span>
          </div>
          <div class="camp-ov-stats">
            <span class="camp-stat-item">
              <span class="camp-stat-dot active"></span>
              在投系列 <b>{{ overallItem.activeCampaigns }}个</b>
            </span>
            <span class="camp-stat-sep">|</span>
            <span class="camp-stat-item">
              <span class="camp-stat-dot paused"></span>
              已暂停 <b>{{ overallItem.pausedCampaigns ?? 3 }}个</b>
            </span>
          </div>
          <div class="camp-platform-bar">
            <div
              v-for="seg in overallItem.platformBreakdown ?? []"
              :key="seg.name"
              class="camp-seg"
              :style="{ width: seg.percent + '%', background: seg.color }"
            ></div>
          </div>
        </div>

        <!-- 日报：单列列表 / 月报复用 -->
        <div v-if="sidebarKey === 'daily-campaigns'" class="camp-app-list">
          <div
            v-for="item in campaignAppsSorted"
            :key="item.id"
            class="camp-row"
            :class="{ 'camp-row-selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="camp-row-left">
              <span class="camp-row-name">{{ item.name }}</span>
              <span class="camp-row-sub">{{ item.category }}</span>
            </div>
            <div class="camp-row-right">
              <span class="camp-row-amount">${{ formatNum(item.adSpend ?? 0) }}</span>
              <span class="camp-row-count">{{ item.activeCampaigns ?? 0 }}个在投</span>
            </div>
          </div>
        </div>

        <!-- 周报：两列网格小卡 -->
        <div v-else class="wc-camp-grid">
          <div
            v-for="item in campaignAppsSorted"
            :key="item.id"
            class="wc-camp-tile"
            :class="{ 'wc-camp-tile-selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="wc-tile-top">
              <span class="wc-tile-name">{{ item.name }}</span>
              <span class="wc-tile-cat">{{ item.category }}</span>
            </div>
            <div class="wc-tile-amt">${{ formatNum(item.adSpend ?? 0) }}</div>
            <div class="wc-tile-foot">{{ item.activeCampaigns ?? 0 }} 个在投</div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         日报·分国家 / 周报·分国家 / 月报·分国家
         ═══════════════════════════════════════════════════ -->
      <template
        v-else-if="
          sidebarKey === 'daily-byCountry' ||
          sidebarKey === 'weekly-byCountry' ||
          sidebarKey === 'monthly-byCountry'
        "
      >
        <!-- 整体 overall card -->
        <div
          v-if="overallItem"
          class="nm-overall"
          :class="{
            'is-selected': selectedId === overallItem.id,
            'wbc-overall': sidebarKey === 'weekly-byCountry' || sidebarKey === 'monthly-byCountry'
          }"
          @click="$emit('select', overallItem.id)"
        >
          <div class="nm-ov-header">
            <span class="nm-ov-name">{{ overallItem.name }}</span>
            <span class="nm-ov-cat">{{ overallItem.category }}</span>
          </div>
          <div
            class="nm-ov-revenue-row"
            :class="{
              'wbc-rev-stack':
                sidebarKey === 'weekly-byCountry' || sidebarKey === 'monthly-byCountry'
            }"
          >
            <span class="nm-ov-label">{{
              sidebarKey === 'weekly-byCountry' || sidebarKey === 'monthly-byCountry'
                ? '总收益'
                : '总收缴'
            }}</span>
            <span
              class="nm-ov-amount"
              :class="{
                'wbc-ov-amount':
                  sidebarKey === 'weekly-byCountry' || sidebarKey === 'monthly-byCountry'
              }"
              >${{ formatNum(overallItem.revenue) }}</span
            >
            <span :class="['nm-ov-change', overallItem.revenueChange >= 0 ? 'is-up' : 'is-down']">
              {{ overallItem.revenueChange >= 0 ? '+' : '' }}{{ overallItem.revenueChange }}%
            </span>
          </div>
          <div class="nm-ov-footer">
            <span class="nm-ov-countries">分布国家：{{ overallItem.countries ?? 22 }}个</span>
          </div>
          <div class="nm-ov-globe">🌍</div>
        </div>

        <!-- 分类应用（健康/天气/AI应用）-->
        <div class="nm-group-list">
          <div
            v-for="item in groupAppsNoOverall"
            :key="item.id"
            class="nm-group-card"
            :class="{ 'is-selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="nm-gc-header">
              <span class="nm-gc-name">{{ item.name }}</span>
              <span class="nm-gc-cat">{{ item.category }}</span>
            </div>
            <div class="nm-gc-revenue-row">
              <span class="nm-gc-amount">${{ formatNum(item.revenue) }}</span>
              <span :class="['nm-gc-change', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
            <div class="nm-gc-countries">{{ item.countries ?? 0 }}个国家</div>
          </div>
        </div>

        <!-- 单体应用 2列网格 -->
        <div v-if="singleApps.length" class="nm-singles-grid">
          <div
            v-for="item in singleApps"
            :key="item.id"
            class="nm-single-card"
            :class="{ 'is-selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="nm-sc-name">{{ item.name }}</div>
            <div class="nm-sc-cat">{{ item.category }}</div>
            <div class="nm-sc-amount">${{ formatNum(item.revenue) }}</div>
            <div class="nm-sc-countries">{{ item.countries ?? 0 }}个国家</div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         日报·广告平台分国家
         ═══════════════════════════════════════════════════ -->
      <template v-else-if="sidebarKey === 'daily-platformCountry'">
        <div class="nm-grid">
          <div
            v-for="item in groupApps"
            :key="item.id"
            :class="['nm-card', 'nm-card--group', { 'is-selected': selectedId === item.id }]"
            @click="$emit('select', item.id)"
          >
            <div class="nm-gc-head">
              <span class="nm-gc-dot" :style="{ background: item.iconColor }" />
              <span class="nm-gc-name2">{{ item.name }}</span>
              <span class="nm-gc-cat2">{{ item.category }}</span>
            </div>
            <div class="nm-gc-revenue">
              <span class="nm-gc-amount2">${{ formatNum(item.revenue) }}</span>
              <span :class="['nm-gc-change2', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                环比 {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
            <div class="nm-gc-meta">
              <div>预估利润 ${{ formatNum(item.profit) }}</div>
              <div>{{ showField === 'mau' ? 'MAU' : 'DAU' }} {{ item.dau }}万</div>
            </div>
            <SparklineChart
              class="nm-gc-spark"
              :data="item.sparkline ?? sparkData"
              color="#10b981"
              :width="110"
              :height="26"
            />
            <div v-if="item.platforms?.length" class="nm-gc-tags">
              <span v-for="p in item.platforms" :key="p" class="nm-gc-tag">{{ p }}</span>
            </div>
          </div>
          <div
            v-for="item in singleApps"
            :key="item.id"
            :class="['nm-card', 'nm-card--single', { 'is-selected': selectedId === item.id }]"
            @click="$emit('select', item.id)"
          >
            <div class="nm-sc2-name">
              {{ item.name }}
              <span class="nm-sc2-cat">{{ item.category }}</span>
            </div>
            <div class="nm-sc2-bottom">
              <span class="nm-sc2-amount">${{ formatNum(item.revenue) }}</span>
              <span :class="['nm-sc2-change', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         日报·汇总
         ═══════════════════════════════════════════════════ -->
      <template v-else-if="sidebarKey === 'daily-summary'">
        <div class="nm-grid">
          <!-- 分组卡片（整体 + 各分类应用）-->
          <div
            v-for="item in groupApps"
            :key="item.id"
            :class="['nm-card', 'nm-card--group', { 'is-selected': selectedId === item.id }]"
            @click="$emit('select', item.id)"
          >
            <div class="nm-gc-head">
              <span class="nm-gc-dot" :style="{ background: item.iconColor }" />
              <span class="nm-gc-name2">{{ item.name }}</span>
              <span class="nm-gc-cat2">{{ item.category }}</span>
            </div>
            <div class="nm-gc-revenue">
              <span class="nm-gc-amount2">${{ formatNum(item.revenue) }}</span>
              <span :class="['nm-gc-change2', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                环比 {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
            <div class="nm-gc-meta">
              <div>预估利润 ${{ formatNum(item.profit) }}</div>
              <div>{{ showField === 'mau' ? 'MAU' : 'DAU' }} {{ item.dau }}万</div>
            </div>
            <SparklineChart
              class="nm-gc-spark"
              :data="item.sparkline ?? sparkData"
              color="#10b981"
              :width="110"
              :height="26"
            />
            <div v-if="item.platforms?.length" class="nm-gc-tags">
              <span v-for="p in item.platforms" :key="p" class="nm-gc-tag">{{ p }}</span>
            </div>
          </div>

          <!-- 单体应用卡片 -->
          <div
            v-for="item in singleApps"
            :key="item.id"
            :class="['nm-card', 'nm-card--single', { 'is-selected': selectedId === item.id }]"
            @click="$emit('select', item.id)"
          >
            <div class="nm-sc2-name">
              {{ item.name }}
              <span class="nm-sc2-cat">{{ item.category }}</span>
            </div>
            <div class="nm-sc2-bottom">
              <span class="nm-sc2-amount">${{ formatNum(item.revenue) }}</span>
              <span :class="['nm-sc2-change', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         周报·汇总
         ═══════════════════════════════════════════════════ -->
      <template v-else-if="sidebarKey === 'weekly-summary'">
        <!-- 整体 overall card -->
        <div
          v-if="overallItem"
          class="ws-overall"
          :class="{ 'ws-overall-selected': selectedId === overallItem.id }"
          @click="$emit('select', overallItem.id)"
        >
          <!-- 标题 -->
          <div class="ws-ov-title">
            <span class="ws-ov-name">{{ overallItem.name }}</span>
            <span class="ws-ov-cat">{{ overallItem.category }}</span>
          </div>
          <!-- 总收缴 -->
          <div class="ws-ov-revenue-label">总收缴</div>
          <div class="ws-ov-revenue-row">
            <span class="ws-ov-amount">${{ formatNum(overallItem.revenue) }}</span>
            <span :class="['ws-ov-chg', overallItem.revenueChange >= 0 ? 'is-up' : 'is-down']">
              周环比 {{ overallItem.revenueChange >= 0 ? '+' : '' }}{{ overallItem.revenueChange }}%
            </span>
          </div>
          <!-- 预估利润 / DAU -->
          <div class="ws-ov-sub-row">
            <span class="ws-ov-sub">预估利润 ${{ formatNum(overallItem.profit) }}</span>
          </div>
          <div class="ws-ov-sub-row">
            <span class="ws-ov-sub">DAU {{ overallItem.dau }}万</span>
          </div>
          <!-- 平台标签 + 7天 -->
          <div class="ws-ov-tags-row">
            <div class="ws-ov-tags">
              <span v-for="p in overallItem.platforms" :key="p" class="ws-ov-tag">{{ p }}</span>
            </div>
            <span class="ws-ov-days">7天</span>
          </div>
          <!-- 折线图 -->
          <SparklineChart
            class="ws-ov-spark"
            :data="overallItem.sparkline ?? sparkData"
            color="#00d4a1"
            :width="280"
            :height="36"
          />
        </div>

        <!-- 分类应用（健康/天气/AI，有 dau 字段）-->
        <div class="ws-group-list">
          <div
            v-for="item in groupAppsNoOverall"
            :key="item.id"
            class="ws-group-row"
            :class="{ 'ws-row-selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="ws-gr-top">
              <div class="ws-gr-name-block">
                <span class="ws-gr-name">{{ item.name }}</span>
                <span class="ws-gr-cat">{{ item.category }}</span>
              </div>
              <div class="ws-gr-dau-block">
                <span class="ws-gr-dau-label">DAU</span>
                <span class="ws-gr-dau-val">{{ item.dau }}万</span>
              </div>
            </div>
            <div class="ws-gr-bottom">
              <span class="ws-gr-amount">${{ formatNum(item.revenue) }}</span>
              <span :class="['ws-gr-chg', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 单体应用 -->
        <div class="ws-single-list">
          <div
            v-for="item in singleApps"
            :key="item.id"
            class="ws-single-row"
            :class="{ 'ws-row-selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="ws-sr-top">
              <div class="ws-sr-left">
                <div class="ws-sr-icon" :style="{ background: item.iconBg }">{{
                  item.iconEmoji
                }}</div>
                <div class="ws-sr-name-block">
                  <span class="ws-sr-name">{{ item.name }}</span>
                  <span class="ws-sr-cat">{{ item.category }}</span>
                </div>
              </div>
              <span :class="['ws-sr-chg', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
            <div class="ws-sr-amount">${{ formatNum(item.revenue) }}</div>
          </div>
        </div>
      </template>

      <!-- ═══════════════════════════════════════════════════════
         月报·汇总
         ═══════════════════════════════════════════════════ -->
      <template v-else-if="sidebarKey === 'monthly-summary'">
        <!-- ── 整体 overall card ── -->
        <div
          v-if="overallItem"
          class="mss-overall"
          :class="{ 'mss-overall--selected': selectedId === overallItem.id }"
          @click="$emit('select', overallItem.id)"
        >
          <div class="mss-ov-title">
            <span class="mss-ov-name">{{ overallItem.name }}</span>
            <span class="mss-ov-cat">{{ overallItem.category }}</span>
            <span class="mss-ov-badge">月报</span>
          </div>
          <div class="mss-ov-revenue-label">总收缴</div>
          <div class="mss-ov-revenue-row">
            <span class="mss-ov-amount">${{ formatNum(overallItem.revenue) }}</span>
            <span :class="['mss-ov-chg', overallItem.revenueChange >= 0 ? 'is-up' : 'is-down']">
              月环比 {{ overallItem.revenueChange >= 0 ? '+' : '' }}{{ overallItem.revenueChange }}%
            </span>
          </div>
          <div class="mss-ov-sub-row">
            <span class="mss-ov-sub">预估利润 ${{ formatNum(overallItem.profit) }}</span>
            <span class="mss-ov-sub">MAU {{ overallItem.mau }}万</span>
          </div>
          <SparklineChart
            class="mss-ov-spark"
            :data="overallItem.sparkline ?? sparkData"
            color="#00d4a1"
            :width="280"
            :height="32"
          />
          <div class="mss-ov-tags">
            <span v-for="p in overallItem.platforms" :key="p" class="mss-ov-tag">{{ p }}</span>
          </div>
        </div>

        <!-- ── 2-column grid: 分组应用 + 单体应用 ── -->
        <div class="mss-grid">
          <div
            v-for="item in groupAppsNoOverall"
            :key="item.id"
            class="mss-card mss-card--group"
            :class="{ 'mss-card--selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="mss-gc-head">
              <span class="mss-gc-dot" :style="{ background: item.iconColor }" />
              <span class="mss-gc-name">{{ item.name }}</span>
              <span class="mss-gc-cat">{{ item.category }}</span>
            </div>
            <div class="mss-gc-revenue">
              <span class="mss-gc-amount">${{ formatNum(item.revenue) }}</span>
              <span :class="['mss-gc-chg', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                月环比 {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
            <div class="mss-gc-meta">
              <span>利润 ${{ formatNum(item.profit) }}</span>
              <span>MAU {{ item.mau }}万</span>
            </div>
            <SparklineChart
              class="mss-gc-spark"
              :data="item.sparkline ?? sparkData"
              color="#10b981"
              :width="110"
              :height="22"
            />
          </div>

          <div
            v-for="item in singleApps"
            :key="item.id"
            class="mss-card mss-card--single"
            :class="{ 'mss-card--selected': selectedId === item.id }"
            @click="$emit('select', item.id)"
          >
            <div class="mss-sc-icon-row">
              <div class="mss-sc-icon" :style="{ background: item.iconBg }">{{
                item.iconEmoji
              }}</div>
              <div class="mss-sc-name-block">
                <span class="mss-sc-name">{{ item.name }}</span>
                <span class="mss-sc-cat">{{ item.category }}</span>
              </div>
            </div>
            <div class="mss-sc-bottom">
              <span class="mss-sc-amount">${{ formatNum(item.revenue) }}</span>
              <span :class="['mss-sc-chg', item.revenueChange >= 0 ? 'is-up' : 'is-down']">
                {{ item.revenueChange >= 0 ? '+' : '' }}{{ item.revenueChange }}%
              </span>
            </div>
          </div>
        </div>
      </template> </div
    ><!-- /sidebar-scroll -->

    <!-- ─── Footer ─── -->
    <div
      class="sidebar-footer"
      :class="{
        'is-weekly-ad':
          sidebarKey === 'weekly-adPlatform' || sidebarKey === 'weekly-platformCountry'
      }"
    >
      <template v-if="sidebarKey === 'daily-campaigns' || sidebarKey === 'weekly-campaigns'">
        <span class="app-count">
          共 {{ appList.length - 1 }} 个应用 | {{ overallItem?.activeCampaigns ?? 14 }} 个在投系列
        </span>
      </template>
      <template v-else>
        <span class="app-count">共 {{ appList.length - 1 }} 个应用</span>
        <button class="compare-btn" type="button" @click="$emit('compareMode')">
          <span>+</span> 对比模式
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import type { AppListItem } from '../types'
  import SparklineChart from './SparklineChart.vue'

  const props = withDefaults(
    defineProps<{
      appList: AppListItem[]
      selectedId?: string
      showField?: 'mau' | 'dau' | 'adSpend'
      tab?: string
      period?: string
    }>(),
    {
      selectedId: 'overall',
      showField: 'mau',
      tab: 'summary',
      period: 'daily'
    }
  )

  /** 唯一标识每个 period×tab 组合 */
  const sidebarKey = computed(() => `${props.period}-${props.tab}`)

  defineEmits<{
    (e: 'select', id: string): void
    (e: 'compareMode'): void
  }>()

  const sortDir = ref<'desc' | 'asc'>('desc')
  const sortLabel = computed(() => {
    const adSpendTabs = ['adPlatform', 'campaigns']
    if (adSpendTabs.includes(props.tab ?? '')) return '广告支出'
    if (props.period === 'weekly' && props.tab === 'platformCountry') return '广告支出'
    if (props.period === 'weekly' && props.tab === 'byCountry') return '总收益'
    return '总收缴'
  })

  const toggleSort = () => {
    sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  }

  // ── Normal mode (汇总等旧样式) ──────────────────────────────
  const groupApps = computed(() => {
    const items = props.appList.filter((a) => a.isOverall || a.dau !== undefined)
    return [...items].sort((a, b) => {
      if (a.isOverall) return -1
      if (b.isOverall) return 1
      return sortDir.value === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue
    })
  })

  // ── Normal mode (分国家新样式) ──────────────────────────────
  const groupAppsNoOverall = computed(() => {
    const items = props.appList.filter((a) => !a.isOverall && a.dau !== undefined)
    return [...items].sort((a, b) =>
      sortDir.value === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue
    )
  })

  const singleApps = computed(() => {
    const items = props.appList.filter((a) => !a.isOverall && a.dau === undefined)
    return [...items].sort((a, b) =>
      sortDir.value === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue
    )
  })

  // ── Ad-spend mode separated lists ───────────────────────────
  const overallItem = computed(() => props.appList.find((a) => a.isOverall))

  const majorAppsSorted = computed(() => {
    const major = props.appList.filter((a) => !a.isOverall && !!a.sparkline)
    return [...major].sort((a, b) => {
      const va = a.adSpend ?? 0
      const vb = b.adSpend ?? 0
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
  })

  const subAppsSorted = computed(() => {
    const subs = props.appList.filter((a) => !a.isOverall && !a.sparkline)
    return [...subs].sort((a, b) => {
      const va = a.adSpend ?? 0
      const vb = b.adSpend ?? 0
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
  })

  // ── Campaigns sidebar: all non-overall apps sorted by adSpend ─
  const campaignAppsSorted = computed(() => {
    const all = props.appList.filter((a) => !a.isOverall)
    return [...all].sort((a, b) => {
      const va = a.adSpend ?? 0
      const vb = b.adSpend ?? 0
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
  })

  /** 周报·广告平台：单列按广告支出排序（与设计稿一致，不分 major/sub 两区） */
  const flatAdSpendAppsSorted = computed(() => {
    const all = props.appList.filter((a) => !a.isOverall)
    return [...all].sort((a, b) => {
      const va = a.adSpend ?? 0
      const vb = b.adSpend ?? 0
      return sortDir.value === 'desc' ? vb - va : va - vb
    })
  })

  // ── Helpers ──────────────────────────────────────────────────
  const sparkData = [3800, 4000, 3900, 4200, 4100, 4350, 4400, 4521]

  /** Format with commas: 41100 → "41,100" */
  const formatNum = (v: number | null | undefined) => {
    const num = Number(v ?? 0)
    if (!Number.isFinite(num)) return '0'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const changeStr = (change: number) => (change >= 0 ? '+' : '') + change + '%'
  const changeClass = (change: number) => (change >= 0 ? 'ad-positive' : 'ad-negative')

  /** 周报·广告平台分国家小卡：支出环比升高偏警示、降低偏利好 */
  const adSpendChangeInvertClass = (change: number) =>
    change >= 0 ? 'wpc-pct-rise' : 'wpc-pct-drop'

  /** 支出同比上升时金额用偏暖色强调（与稿面一致） */
  const wpcAmountStressClass = (_spend: number, change: number) =>
    change >= 0 ? 'wpc-amt-warn' : ''
</script>

<style scoped>
  /* ── Shell ─────────────────────────────────────────────────── */
  .app-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .sidebar-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }

  .sidebar-scroll::-webkit-scrollbar {
    width: 4px;
  }

  .sidebar-scroll::-webkit-scrollbar-track {
    background: transparent;
  }

  .sidebar-scroll::-webkit-scrollbar-thumb {
    background: rgb(255 255 255 / 12%);
    border-radius: 2px;
  }

  /* ── Header ────────────────────────────────────────────────── */
  .sidebar-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px 8px;
  }

  .sidebar-title {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
  }

  .sort-btn {
    display: flex;
    gap: 2px;
    align-items: center;
    padding: 2px 4px;
    font-size: 11px;
    color: rgb(255 255 255 / 50%);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .sort-btn:hover {
    color: #00d4a1;
  }

  .sort-icon {
    display: inline-block;
    font-style: normal;
    transition: transform 0.2s;
  }

  .sort-icon.asc {
    transform: rotate(180deg);
  }

  /* ── Shared item base ───────────────────────────────────────── */
  .app-item {
    position: relative;
    cursor: pointer;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .app-item:hover {
    background: rgb(255 255 255 / 4%);
  }

  .app-item.selected {
    background: rgb(0 212 161 / 8%);
    border-left-color: #00d4a1;
  }

  /* ════════════════════════════════════════════════════════════
     AD-SPEND MODE STYLES
     ════════════════════════════════════════════════════════ */

  /* ── Overall card ───────────────────────────────────────── */
  .ad-overall {
    padding: 12px;
    margin: 0 10px 8px;
    background: rgb(0 212 161 / 6%);
    border: 1px solid rgb(0 212 161 / 20%);
    border-radius: 10px;
  }

  .ad-overall.selected {
    background: rgb(0 212 161 / 12%);
    border-color: #00d4a1;
  }

  .ad-overall-title {
    margin-bottom: 10px;
  }

  .ad-overall-name {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .ad-overall-cat {
    margin-left: 6px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  /* 4-metric grid */
  .ad-metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-bottom: 10px;
  }

  .ad-metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ad-metric-label {
    font-size: 9px;
    color: rgb(255 255 255 / 40%);
    white-space: nowrap;
  }

  .ad-metric-value {
    font-size: 12px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    white-space: nowrap;
  }

  .ad-green {
    color: #00d4a1;
  }

  .ad-positive {
    color: #00d4a1;
  }

  .ad-negative {
    color: #ff5c5c;
  }

  /* Platform bar */
  .platform-bar {
    display: flex;
    height: 36px;
    margin-bottom: 6px;
    overflow: hidden;
    border-radius: 4px;
  }

  .platform-seg {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    padding: 0 4px;
    overflow: hidden;
  }

  .seg-name {
    overflow: hidden;
    font-size: 9px;
    font-weight: 600;
    color: rgb(255 255 255 / 90%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .seg-pct {
    font-size: 9px;
    color: rgb(255 255 255 / 70%);
    white-space: nowrap;
  }

  /* Platform legend */
  .platform-legend {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .legend-item {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 10px;
    color: rgb(255 255 255 / 55%);
  }

  .legend-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  /* ── Major apps list ────────────────────────────────────── */
  .major-apps-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 10px 4px;
  }

  .major-app-card {
    padding: 10px 12px;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .major-app-card:hover {
    background: rgb(255 255 255 / 7%);
    border-color: rgb(255 255 255 / 14%);
  }

  .major-app-card.selected {
    background: rgb(0 212 161 / 8%);
    border-color: #00d4a1;
  }

  .major-app-header {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 10px;
  }

  .major-app-name-block {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    border-radius: 7px;
  }

  .app-name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .app-category {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .major-app-metrics {
    display: flex;
    justify-content: space-between;
  }

  .major-metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .major-metric-right {
    text-align: right;
  }

  .major-metric-label {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .major-metric-row {
    display: flex;
    gap: 5px;
    align-items: baseline;
  }

  .major-metric-value {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
  }

  .major-metric-change {
    font-size: 10px;
    font-weight: 500;
  }

  /* ── Sub-apps 2-column grid ─────────────────────────────── */
  .sub-apps-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 4px 10px 10px;
  }

  .sub-app-item {
    padding: 10px;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 8px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .sub-app-item:hover {
    background: rgb(255 255 255 / 7%);
    border-color: rgb(255 255 255 / 14%);
  }

  .sub-app-item.selected {
    background: rgb(0 212 161 / 8%);
    border-color: #00d4a1;
  }

  .sub-app-name {
    margin-bottom: 1px;
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sub-app-cat {
    margin-bottom: 5px;
    font-size: 9px;
    color: rgb(255 255 255 / 35%);
  }

  .sub-app-spend {
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
  }

  .sub-app-change {
    font-size: 10px;
    font-weight: 500;
  }

  /* ════════════════════════════════════════════════════════════
     周报·广告平台（设计稿色与布局）
     ════════════════════════════════════════════════════════ */
  .wap-section {
    padding: 0 10px 10px;
  }

  .wap-up {
    color: #4caf50;
  }

  .wap-down {
    color: #f44336;
  }

  .wap-overall {
    padding: 12px 12px 14px;
    margin-bottom: 10px;
    cursor: pointer;
    background: rgb(26 28 36 / 95%);
    border: 1px solid #3cc;
    border-radius: 12px;
    transition:
      background 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }

  .wap-overall:hover {
    background: rgb(37 40 51 / 100%);
  }

  .wap-overall.is-selected {
    background: rgb(51 204 204 / 8%);
    border-color: #3cc;
    box-shadow: 0 0 0 1px rgb(51 204 204 / 35%);
  }

  .wap-ov-title {
    margin-bottom: 10px;
  }

  .wap-ov-name {
    font-size: 14px;
    font-weight: 700;
    color: #f4f4f5;
  }

  .wap-ov-cat {
    margin-left: 6px;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .wap-ov-spend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .wap-ov-spend-lbl {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .wap-ov-amount {
    font-size: 20px;
    font-weight: 700;
    color: #3cc;
    letter-spacing: -0.02em;
  }

  .wap-ov-change {
    font-size: 13px;
    font-weight: 600;
  }

  .wap-ov-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 8px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .wap-ov-meta strong {
    font-weight: 700;
    color: #f4f4f5;
  }

  .wap-ov-meta-sep {
    color: rgb(255 255 255 / 25%);
  }

  .wap-pbar {
    display: flex;
    height: 10px;
    margin-bottom: 8px;
    overflow: hidden;
    border-radius: 4px;
  }

  .wap-pbar-seg {
    flex-shrink: 0;
    height: 100%;
  }

  .wap-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    align-items: center;
  }

  .wap-legend-item {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 10px;
    color: rgb(255 255 255 / 55%);
  }

  .wap-legend-sq {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 1px;
  }

  .wap-app-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .wap-app-card {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 12px;
    cursor: pointer;
    background: #252833;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 12px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .wap-app-card:hover {
    background: rgb(37 40 51 / 100%);
    border-color: rgb(255 255 255 / 14%);
  }

  .wap-app-card.is-selected {
    background: rgb(51 204 204 / 6%);
    border-color: rgb(51 204 204 / 45%);
  }

  .wap-app-card .wap-app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    font-size: 15px;
    border-radius: 8px;
  }

  .wap-app-main {
    flex: 1;
    min-width: 0;
  }

  .wap-app-line1 {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .wap-app-name {
    font-size: 13px;
    font-weight: 600;
    color: #f4f4f5;
  }

  .wap-app-cat {
    font-size: 12px;
    color: rgb(255 255 255 / 42%);
  }

  .wap-app-line2 {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
  }

  .wap-app-amt {
    font-size: 14px;
    font-weight: 600;
    color: #f4f4f5;
  }

  .wap-app-pct {
    font-size: 12px;
    font-weight: 600;
  }

  /* ── 周报·广告平台分国家：两列网格 ───────────────────────── */
  .wap-section--platform-country {
    padding-bottom: 12px;
  }

  .wpc-app-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .wpc-app-tile {
    min-width: 0;
    padding: 10px 10px 9px;
    cursor: pointer;
    background: #252833;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .wpc-app-tile:hover {
    background: rgb(37 40 51 / 100%);
    border-color: rgb(255 255 255 / 14%);
  }

  .wpc-app-tile.is-selected {
    background: rgb(51 204 204 / 6%);
    border-color: rgb(51 204 204 / 45%);
  }

  .wpc-tile-top {
    display: flex;
    gap: 6px;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .wpc-tile-name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: #f4f4f5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wpc-tile-cat {
    flex-shrink: 0;
    max-width: 46%;
    overflow: hidden;
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .wpc-tile-amt {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 700;
    color: #f4f4f5;
    letter-spacing: -0.02em;
  }

  .wpc-tile-amt.wpc-amt-warn {
    color: #fb923c;
  }

  .wpc-tile-pct {
    font-size: 11px;
    font-weight: 600;
  }

  .wpc-tile-pct.wpc-pct-rise {
    color: #fb923c;
  }

  .wpc-tile-pct.wpc-pct-drop {
    color: #4ade80;
  }

  /* ════════════════════════════════════════════════════════════
     NORMAL MODE STYLES
     ════════════════════════════════════════════════════════ */

  /* ── 整体 overall 卡片 ──────────────────────────────────── */
  .nm-overall {
    position: relative;
    padding: 14px 12px;
    margin: 0 10px 8px;
    overflow: hidden;
    cursor: pointer;
    background: rgb(0 212 161 / 6%);
    border: 1px solid rgb(0 212 161 / 35%);
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .nm-overall:hover {
    background: rgb(0 212 161 / 10%);
  }

  .nm-overall.is-selected {
    background: rgb(0 212 161 / 14%);
    border-color: #00d4a1;
  }

  /* 周报·分国家：整体卡（偏青绿、总收益纵向排版） */
  .nm-overall.wbc-overall {
    background: rgb(38 166 154 / 10%);
    border-color: rgb(38 166 154 / 45%);
  }

  .nm-overall.wbc-overall:hover {
    background: rgb(38 166 154 / 14%);
  }

  .nm-overall.wbc-overall.is-selected {
    background: rgb(38 166 154 / 18%);
    border-color: #26a69a;
  }

  .wbc-rev-stack {
    flex-direction: column;
    gap: 4px;
    align-items: flex-start;
  }

  .nm-ov-amount.wbc-ov-amount {
    font-size: 24px;
    color: #26a69a !important;
  }

  .wbc-overall .nm-ov-change.is-up {
    color: #4caf50;
  }

  .wbc-overall .nm-ov-change.is-down {
    color: #f44336;
  }

  .nm-ov-header {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .nm-ov-name {
    font-size: 15px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .nm-ov-cat {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .nm-ov-revenue-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .nm-ov-label {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .nm-ov-amount {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  .nm-ov-change {
    font-size: 12px;
    font-weight: 600;
  }

  .nm-ov-change.is-up {
    color: #00d4a1;
  }

  .nm-ov-change.is-down {
    color: #ff5c5c;
  }

  .nm-ov-footer {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .nm-ov-countries {
    font-size: 11px;
  }

  .nm-ov-globe {
    position: absolute;
    top: 10px;
    right: 12px;
    font-size: 48px;
    line-height: 1;
    pointer-events: none;
    user-select: none;
    opacity: 0.18;
  }

  /* ── 分类应用列表 ────────────────────────────────────────── */
  .nm-group-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 0 10px 6px;
  }

  .nm-group-card {
    padding: 10px 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .nm-group-card:hover {
    background: rgb(255 255 255 / 4%);
  }

  .nm-group-card.is-selected {
    background: rgb(0 212 161 / 8%);
    outline: 1px solid rgb(0 212 161 / 40%);
  }

  .nm-gc-header {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .nm-gc-name {
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
  }

  .nm-gc-cat {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .nm-gc-revenue-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 3px;
  }

  .nm-gc-amount {
    font-size: 17px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .nm-gc-change {
    font-size: 12px;
    font-weight: 600;
  }

  .nm-gc-change.is-up {
    color: #00d4a1;
  }

  .nm-gc-change.is-down {
    color: #ff5c5c;
  }

  .nm-gc-countries {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  /* ── 单体应用 2列网格 ────────────────────────────────────── */
  .nm-singles-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 10px 10px;
  }

  .nm-single-card {
    padding: 10px;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 8px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .nm-single-card:hover {
    background: rgb(255 255 255 / 7%);
    border-color: rgb(255 255 255 / 14%);
  }

  .nm-single-card.is-selected {
    background: rgb(0 212 161 / 8%);
    border-color: #00d4a1;
  }

  .nm-sc-name {
    margin-bottom: 2px;
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nm-sc-cat {
    margin-bottom: 6px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .nm-sc-amount {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .nm-sc-countries {
    margin-top: 3px;
    font-size: 10px;
    color: rgb(255 255 255 / 35%);
  }

  /* ── Footer ─────────────────────────────────────────────── */
  .sidebar-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-top: 1px solid rgb(255 255 255 / 6%);
  }

  .app-count {
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
  }

  .compare-btn {
    display: flex;
    gap: 3px;
    align-items: center;
    padding: 3px 8px;
    font-size: 11px;
    color: #00d4a1;
    cursor: pointer;
    background: rgb(0 212 161 / 10%);
    border: 1px solid rgb(0 212 161 / 25%);
    border-radius: 5px;
    transition: background 0.15s;
  }

  .compare-btn:hover {
    background: rgb(0 212 161 / 20%);
  }

  .sidebar-footer.is-weekly-ad {
    background: #1a1c24;
    border-top-color: rgb(255 255 255 / 8%);
  }

  .sidebar-footer.is-weekly-ad .app-count {
    color: #a1a1aa;
  }

  .sidebar-footer.is-weekly-ad .compare-btn {
    color: #f4f4f5;
    background: #252833;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 8px;
  }

  .sidebar-footer.is-weekly-ad .compare-btn:hover {
    background: #2d3140;
  }

  /* ════════════════════════════════════════════════════════════
     汇总等旧样式 – 2列网格
     ════════════════════════════════════════════════════════ */
  .nm-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    padding: 0 10px 10px;
  }

  .nm-card {
    min-width: 0;
    padding: 10px;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid transparent;
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .nm-card:hover {
    background: rgb(255 255 255 / 7%);
  }

  .nm-card.is-selected {
    background: rgb(0 212 161 / 8%);
    border-color: #00d4a1;
  }

  /* 分组卡片 */
  .nm-card--group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .nm-gc-head {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .nm-gc-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .nm-gc-name2 {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .nm-gc-cat2 {
    overflow: hidden;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nm-gc-revenue {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nm-gc-amount2 {
    font-size: 15px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    letter-spacing: -0.02em;
  }

  .nm-gc-change2 {
    font-size: 10px;
    font-weight: 500;
  }

  .nm-gc-change2.is-up {
    color: #00d4a1;
  }

  .nm-gc-change2.is-down {
    color: #ff5c5c;
  }

  .nm-gc-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .nm-gc-spark {
    display: block;
    width: 100%;
  }

  .nm-gc-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .nm-gc-tag {
    padding: 1px 4px;
    font-size: 9px;
    color: rgb(255 255 255 / 45%);
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  /* 单体卡片 */
  .nm-card--single {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .nm-sc2-name {
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    color: rgb(255 255 255 / 80%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .nm-sc2-cat {
    margin-left: 3px;
    font-size: 10px;
    font-weight: 400;
    color: rgb(255 255 255 / 40%);
  }

  .nm-sc2-bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .nm-sc2-amount {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
    letter-spacing: -0.02em;
  }

  .nm-sc2-change {
    font-size: 10px;
    font-weight: 500;
  }

  .nm-sc2-change.is-up {
    color: #00d4a1;
  }

  .nm-sc2-change.is-down {
    color: #ff5c5c;
  }

  /* ════════════════════════════════════════════════════════════
     月报·汇总 MONTHLY SUMMARY SIDEBAR
     ════════════════════════════════════════════════════════ */

  .mss-overall {
    padding: 12px 12px 10px;
    margin: 0 10px 10px;
    cursor: pointer;
    background: rgb(0 212 161 / 7%);
    border: 1px solid rgb(0 212 161 / 20%);
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .mss-overall:hover {
    background: rgb(0 212 161 / 11%);
  }

  .mss-overall--selected {
    background: rgb(0 212 161 / 13%);
    border-color: #00d4a1;
  }

  .mss-ov-title {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }

  .mss-ov-name {
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .mss-ov-cat {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .mss-ov-badge {
    padding: 1px 6px;
    margin-left: auto;
    font-size: 9px;
    font-weight: 600;
    color: #00d4a1;
    letter-spacing: 0.03em;
    background: rgb(0 212 161 / 15%);
    border: 1px solid rgb(0 212 161 / 30%);
    border-radius: 3px;
  }

  .mss-ov-revenue-label {
    margin-bottom: 2px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .mss-ov-revenue-row {
    display: flex;
    gap: 8px;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .mss-ov-amount {
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.03em;
  }

  .mss-ov-chg {
    font-size: 11px;
    font-weight: 500;
  }

  .mss-ov-chg.is-up {
    color: #00d4a1;
  }

  .mss-ov-chg.is-down {
    color: #ff5c5c;
  }

  .mss-ov-sub-row {
    display: flex;
    gap: 12px;
    margin-bottom: 6px;
  }

  .mss-ov-sub {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .mss-ov-spark {
    display: block;
    width: 100%;
    margin-bottom: 6px;
  }

  .mss-ov-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .mss-ov-tag {
    padding: 1px 5px;
    font-size: 9px;
    color: rgb(255 255 255 / 45%);
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  /* ── 2-column grid ──────────────────────────────────────── */
  .mss-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 10px 10px;
  }

  .mss-card {
    padding: 10px;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid transparent;
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .mss-card:hover {
    background: rgb(255 255 255 / 7%);
  }

  .mss-card--selected {
    background: rgb(0 212 161 / 8%);
    border-color: #00d4a1;
  }

  /* group card */
  .mss-card--group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mss-gc-head {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .mss-gc-dot {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .mss-gc-name {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
    white-space: nowrap;
  }

  .mss-gc-cat {
    overflow: hidden;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mss-gc-revenue {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .mss-gc-amount {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    letter-spacing: -0.02em;
  }

  .mss-gc-chg {
    font-size: 10px;
    font-weight: 500;
  }

  .mss-gc-chg.is-up {
    color: #00d4a1;
  }

  .mss-gc-chg.is-down {
    color: #ff5c5c;
  }

  .mss-gc-meta {
    display: flex;
    flex-direction: column;
    gap: 1px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .mss-gc-spark {
    display: block;
    width: 100%;
  }

  /* single card */
  .mss-card--single {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mss-sc-icon-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .mss-sc-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 13px;
    border-radius: 6px;
  }

  .mss-sc-name-block {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .mss-sc-name {
    overflow: hidden;
    font-size: 11px;
    font-weight: 600;
    color: rgb(255 255 255 / 80%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .mss-sc-cat {
    font-size: 9px;
    color: rgb(255 255 255 / 35%);
    white-space: nowrap;
  }

  .mss-sc-bottom {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .mss-sc-amount {
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 88%);
    letter-spacing: -0.02em;
  }

  .mss-sc-chg {
    font-size: 10px;
    font-weight: 500;
  }

  .mss-sc-chg.is-up {
    color: #00d4a1;
  }

  .mss-sc-chg.is-down {
    color: #ff5c5c;
  }

  /* ════════════════════════════════════════════════════════════
     在投广告系列 CAMPAIGNS SIDEBAR
     ════════════════════════════════════════════════════════ */

  /* ── Overall card ───────────────────────────────────────── */
  .camp-overall {
    position: relative;
    padding: 12px 12px 10px;
    margin: 0 10px 6px;
    cursor: pointer;
    background: rgb(0 212 161 / 7%);
    border: 1px solid rgb(0 212 161 / 30%);
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .camp-overall:hover {
    background: rgb(0 212 161 / 11%);
  }

  .camp-selected {
    background: rgb(0 212 161 / 14%) !important;
    border-color: #00d4a1 !important;
  }

  .camp-ov-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .camp-ov-name-block {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  .camp-ov-name {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .camp-ov-cat {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .camp-selected-badge {
    padding: 2px 6px;
    font-size: 9px;
    font-weight: 700;
    color: #00d4a1;
    letter-spacing: 0.04em;
    background: rgb(0 212 161 / 15%);
    border: 1px solid rgb(0 212 161 / 40%);
    border-radius: 4px;
  }

  .camp-ov-spend-label {
    margin-bottom: 2px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .camp-ov-spend-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .camp-ov-amount {
    font-size: 22px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  .camp-ov-change {
    font-size: 12px;
    font-weight: 600;
  }

  .camp-ov-stats {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 10px;
    font-size: 11px;
    color: rgb(255 255 255 / 55%);
  }

  .camp-stat-item {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .camp-stat-item b {
    font-weight: 700;
    color: rgb(255 255 255 / 85%);
  }

  .camp-stat-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .camp-stat-dot.active {
    background: #00d4a1;
  }

  .camp-stat-dot.paused {
    background: #fb923c;
  }

  .camp-stat-sep {
    color: rgb(255 255 255 / 20%);
  }

  /* Platform bar (thin, no labels) */
  .camp-platform-bar {
    display: flex;
    height: 4px;
    overflow: hidden;
    border-radius: 2px;
  }

  .camp-seg {
    flex-shrink: 0;
    height: 100%;
  }

  /* ── App list rows ───────────────────────────────────────── */
  .camp-app-list {
    display: flex;
    flex-direction: column;
    padding: 0 10px 4px;
  }

  .camp-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .camp-row:hover {
    background: rgb(255 255 255 / 4%);
  }

  .camp-row-selected {
    background: rgb(0 212 161 / 8%) !important;
    outline: 1px solid rgb(0 212 161 / 35%);
  }

  .camp-row-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .camp-row-name {
    overflow: hidden;
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .camp-row-sub {
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
  }

  .camp-row-right {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 2px;
    align-items: flex-end;
    padding-left: 8px;
  }

  .camp-row-amount {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 92%);
    white-space: nowrap;
  }

  .camp-row-count {
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
    white-space: nowrap;
  }

  /* ── 周报·在投：整体卡右侧迷你柱 + 已暂停数字强调 ─────────── */
  .wc-camp-overall {
    padding-bottom: 12px;
  }

  .wc-camp-ov-body {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    justify-content: space-between;
  }

  .wc-camp-ov-main {
    flex: 1;
    min-width: 0;
  }

  .camp-paused-val {
    font-weight: 700;
    color: #fb923c;
  }

  .wc-mini-chart {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: flex-end;
    padding-bottom: 2px;
  }

  .wc-mini-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    width: 22px;
  }

  .wc-mini-bars {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    justify-content: center;
    height: 36px;
  }

  .wc-bar {
    display: block;
    width: 5px;
    border-radius: 1px;
  }

  .wc-bar--teal {
    height: 25px;
    background: linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%);
  }

  .wc-bar--orange {
    height: 15px;
    background: linear-gradient(180deg, #fb923c 0%, #c2410c 100%);
  }

  .wc-mini-lab {
    font-size: 8px;
    line-height: 1;
    color: rgb(255 255 255 / 35%);
    transform: scale(0.92);
  }

  .wc-camp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 10px 8px;
  }

  .wc-camp-tile {
    padding: 8px 10px;
    cursor: pointer;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .wc-camp-tile:hover {
    background: rgb(255 255 255 / 8%);
    border-color: rgb(255 255 255 / 14%);
  }

  .wc-camp-tile-selected {
    background: rgb(0 212 161 / 8%);
    border-color: rgb(0 212 161 / 35%);
  }

  .wc-tile-top {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: baseline;
    margin-bottom: 4px;
  }

  .wc-tile-name {
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
  }

  .wc-tile-cat {
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
  }

  .wc-tile-amt {
    margin-bottom: 4px;
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 92%);
    letter-spacing: -0.02em;
  }

  .wc-tile-foot {
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  /* ════════════════════════════════════════════════════════════
     周报·汇总 WEEKLY SUMMARY SIDEBAR
     ════════════════════════════════════════════════════════ */

  /* ── Overall card ───────────────────────────────────────── */
  .ws-overall {
    padding: 12px 12px 10px;
    margin: 0 10px 6px;
    cursor: pointer;
    background: rgb(0 212 161 / 7%);
    border: 1px solid rgb(0 212 161 / 30%);
    border-radius: 10px;
    transition:
      background 0.15s,
      border-color 0.15s;
  }

  .ws-overall:hover {
    background: rgb(0 212 161 / 11%);
  }

  .ws-overall-selected {
    background: rgb(0 212 161 / 14%) !important;
    border-color: #00d4a1 !important;
  }

  .ws-ov-title {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .ws-ov-name {
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .ws-ov-cat {
    font-size: 11px;
    color: rgb(255 255 255 / 45%);
  }

  .ws-ov-revenue-label {
    margin-bottom: 2px;
    font-size: 10px;
    color: rgb(255 255 255 / 40%);
  }

  .ws-ov-revenue-row {
    display: flex;
    gap: 6px;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .ws-ov-amount {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  .ws-ov-chg {
    font-size: 11px;
    font-weight: 600;
  }

  .ws-ov-sub-row {
    margin-bottom: 2px;
  }

  .ws-ov-sub {
    font-size: 11px;
    color: rgb(255 255 255 / 50%);
  }

  .ws-ov-tags-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
    margin-bottom: 4px;
  }

  .ws-ov-tags {
    display: flex;
    gap: 4px;
  }

  .ws-ov-tag {
    padding: 1px 6px;
    font-size: 10px;
    color: rgb(255 255 255 / 55%);
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 4px;
  }

  .ws-ov-days {
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .ws-ov-spark {
    display: block;
    width: 100%;
    margin-top: 4px;
  }

  /* ── 分类组行 ────────────────────────────────────────────── */
  .ws-group-list {
    display: flex;
    flex-direction: column;
    padding: 0 10px 2px;
  }

  .ws-group-row {
    padding: 9px 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .ws-group-row:hover {
    background: rgb(255 255 255 / 4%);
  }

  .ws-row-selected {
    background: rgb(0 212 161 / 8%) !important;
    outline: 1px solid rgb(0 212 161 / 35%);
  }

  .ws-gr-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .ws-gr-name-block {
    display: flex;
    gap: 5px;
    align-items: baseline;
  }

  .ws-gr-name {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
  }

  .ws-gr-cat {
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
  }

  .ws-gr-dau-block {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 1px;
    align-items: flex-end;
  }

  .ws-gr-dau-label {
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
  }

  .ws-gr-dau-val {
    font-size: 13px;
    font-weight: 600;
    color: rgb(255 255 255 / 85%);
  }

  .ws-gr-bottom {
    display: flex;
    gap: 6px;
    align-items: baseline;
  }

  .ws-gr-amount {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .ws-gr-chg {
    font-size: 11px;
    font-weight: 600;
  }

  /* ── 单体应用行 ──────────────────────────────────────────── */
  .ws-single-list {
    display: flex;
    flex-direction: column;
    padding: 0 10px 8px;
  }

  .ws-single-row {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .ws-single-row:hover {
    background: rgb(255 255 255 / 4%);
  }

  .ws-sr-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3px;
  }

  .ws-sr-left {
    display: flex;
    gap: 7px;
    align-items: center;
    min-width: 0;
  }

  .ws-sr-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    border-radius: 6px;
  }

  .ws-sr-name-block {
    display: flex;
    gap: 4px;
    align-items: baseline;
    min-width: 0;
  }

  .ws-sr-name {
    overflow: hidden;
    font-size: 12px;
    font-weight: 600;
    color: rgb(255 255 255 / 88%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ws-sr-cat {
    flex-shrink: 0;
    font-size: 10px;
    color: rgb(255 255 255 / 38%);
  }

  .ws-sr-chg {
    flex-shrink: 0;
    padding-left: 8px;
    font-size: 11px;
    font-weight: 600;
  }

  .ws-sr-amount {
    padding-left: 31px; /* align after icon */
    font-size: 14px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
    letter-spacing: -0.02em;
  }

  /* shared color helpers */
  .is-up {
    color: #00d4a1;
  }

  .is-down {
    color: #ff5c5c;
  }
</style>
