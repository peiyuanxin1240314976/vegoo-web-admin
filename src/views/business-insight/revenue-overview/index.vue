<template>
  <div ref="rootRef" class="revenue-overview-root art-full-height revenue-overview-page">
    <div
      class="revenue-overview-wrap"
      :style="{
        width: '100%',
        height: `${designHeight}px`,
        transformOrigin: '0 0'
      }"
    >
      <div class="rev-page-fx" aria-hidden="true"></div>
      <!-- 顶部栏：筛选 + 导出（对齐原型右上角） -->
      <header class="rev-header rev-entry-1">
        <div class="rev-header__filters rev-filter-panel">
          <div class="rev-pill rev-pill--app-multi">
            <span class="rev-pill__k">应用:</span>
            <AppPlatformSearchSelect
              v-model="filtersDraft.appIds"
              mode="app"
              multiple
              placeholder="应用（多选，空为不限）"
              search-placeholder="搜索类别/应用名称/应用简称"
              :setting-apps="metaSettingApps"
              :height="32"
              :min-width="220"
              :max-width="320"
              input-class="rev-app-platform-select"
            />
          </div>

          <div class="rev-pill">
            <span class="rev-pill__k">国家：</span>
            <ElSelect
              v-model="filtersDraft.s_country_code"
              class="rev-select"
              popper-class="rev-select__popper"
              :teleported="true"
              :fit-input-width="true"
              filterable
              placeholder="国家"
            >
              <ElOption
                v-for="opt in countryOptions"
                :key="opt.value === '' ? '__country_empty__' : opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div>

          <!-- <div class="rev-pill">
            <span class="rev-pill__k">Version:</span>
            <ElSelect
              v-model="filtersDraft.app_version"
              class="rev-select"
              popper-class="rev-select__popper"
              :teleported="false"
              :fit-input-width="true"
            >
              <ElOption
                v-for="opt in versionOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
          </div> -->

          <div class="rev-pill">
            <span class="rev-pill__k">日期：</span>
            <AppDatePicker
              v-model="filtersDraft.t_date"
              type="date"
              :shortcuts="dateShortcuts"
              value-format="YYYY-MM-DD"
              format="YYYY-MM-DD"
              class="rev-date"
              :teleported="true"
              :clearable="false"
            />
          </div>

          <ElButton type="primary" plain round @click="onQuery">查询</ElButton>
        </div>

        <!-- <button type="button" class="rev-export" @click="onExport">Export</button> -->
      </header>

      <ElSkeleton :loading="pageLoading" animated>
        <template #template>
          <section class="rev-skeleton rev-skeleton--fx">
            <div class="rev-skeleton__kpis">
              <div v-for="i in 6" :key="i" class="rev-skeleton__kpi">
                <ElSkeletonItem variant="text" class="rev-skeleton__line rev-skeleton__line--sm" />
                <ElSkeletonItem variant="text" class="rev-skeleton__line rev-skeleton__line--lg" />
                <div class="rev-skeleton__kpi-sub">
                  <ElSkeletonItem
                    variant="text"
                    class="rev-skeleton__line rev-skeleton__line--md"
                  />
                  <ElSkeletonItem
                    variant="text"
                    class="rev-skeleton__line rev-skeleton__line--md"
                  />
                </div>
              </div>
            </div>
            <div class="rev-skeleton__main">
              <div v-for="b in 6" :key="b" class="rev-skeleton__block">
                <ElSkeletonItem variant="text" class="rev-skeleton__line rev-skeleton__line--lg" />
                <ElSkeletonItem variant="text" class="rev-skeleton__line rev-skeleton__line--md" />
                <ElSkeletonItem variant="text" class="rev-skeleton__line rev-skeleton__line--md" />
                <ElSkeletonItem variant="text" class="rev-skeleton__line rev-skeleton__line--sm" />
              </div>
            </div>
          </section>
        </template>

        <template #default>
          <!-- KPI 卡片 -->
          <section class="rev-kpi-grid rev-entry-2">
            <article
              v-for="k in kpis"
              :key="k.id"
              class="rev-kpi"
              :data-accent="k.accent"
              role="group"
              :aria-label="`${k.title} ${k.primaryValue}`"
            >
              <div class="rev-kpi__head">
                <div class="rev-kpi__title">{{ k.title }}</div>
                <div class="rev-kpi__trend" :class="k.trendUp ? 'up' : 'down'">
                  {{ k.trendPercentText }}
                </div>
              </div>
              <div class="rev-kpi__value">{{ k.primaryValue }}</div>
              <div class="rev-kpi__sub">
                <span class="rev-kpi__subitem">{{ k.subLeftLabel }} {{ k.subLeftValue }}</span>
                <span class="rev-kpi__subitem">{{ k.subRightLabel }} {{ k.subRightValue }}</span>
              </div>
              <RevenueKpiSpark :spark="k.spark" :accent="k.accent" />
            </article>
          </section>

          <!-- 主体栅格：完全按原型固定列宽/高度 -->
          <section class="rev-main rev-entry-3">
            <!-- 上排：左 IAA / 中 IAP / 右 7天 IAA vs IAP -->
            <div class="rev-panel rev-panel--iaa">
              <div class="rev-panel__header rev-panel__header--iaa">
                <div class="rev-panel__title">IAA 广告收入构成分析</div>
                <div class="rev-tabs rev-tabs--iaa">
                  <button
                    v-for="t in iaaTabs"
                    :key="t.key"
                    type="button"
                    class="rev-tab"
                    :class="{ active: iaaTab === t.key }"
                    @click="iaaTab = t.key"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>

              <div
                v-loading="
                  (iaaTab === 'ad_type' && iaaAdTypeLoading) ||
                  (iaaTab === 'platform' && iaaPlatformLoading) ||
                  (iaaTab === 'ad_unit' && iaaAdUnitLoading) ||
                  (iaaTab === 'country' && iaaCountryLoading) ||
                  (iaaTab === 'version' && iaaVersionLoading)
                "
                class="rev-iaa-main"
                :class="{ 'rev-iaa-main--stacked': iaaTab === 'ad_type' }"
              >
                <div class="rev-iaa-viz">
                  <!-- 广告类型 / 广告平台：堆叠条 + 图例 -->
                  <div v-show="iaaTab === 'ad_type' || iaaTab === 'platform'" class="rev-iaa-bar">
                    <div class="rev-iaa-bar__track">
                      <div
                        v-for="seg in iaaSegments"
                        :key="seg.key"
                        class="rev-iaa-bar__seg"
                        :style="{ width: `${seg.percent}%`, background: seg.color }"
                      />
                    </div>
                    <div class="rev-iaa-bar__labels">
                      <span v-for="seg in iaaSegments" :key="seg.key" class="rev-iaa-bar__label">
                        <span class="rev-dot" :style="{ background: seg.color }" />
                        {{ seg.percent.toFixed(1) }}% {{ seg.label }}
                      </span>
                    </div>
                  </div>

                  <!-- 广告位：左图例（竖排）+ 右环形图 -->
                  <div v-show="iaaTab === 'ad_unit'" class="rev-iaa-donut-wrap">
                    <div class="rev-iaa-donut-legend">
                      <span v-for="seg in iaaSegments" :key="seg.key" class="rev-iaa-bar__label">
                        <span class="rev-dot" :style="{ background: seg.color }" />
                        {{ seg.label }}
                      </span>
                    </div>
                    <div class="rev-iaa-donut-chart">
                      <div ref="iaaDonutRef" class="rev-iaa-donut" />
                      <div class="rev-iaa-donut-center">
                        <div class="rev-iaa-donut-center-val">{{ iaaVizTotalMoney }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- 国家：横向排名条 -->
                  <div v-show="iaaTab === 'country'" class="rev-iaa-country">
                    <div
                      v-for="item in iaaCountryBarItems"
                      :key="item._rowKey"
                      class="rev-iaa-country-row"
                      :class="{ 'is-other': item.isOther }"
                    >
                      <div class="rev-iaa-country-bar-track">
                        <div
                          class="rev-iaa-country-bar-fill"
                          :style="{ width: `${item.pctWidth}%` }"
                        />
                      </div>
                      <div class="rev-iaa-country-meta">
                        <span
                          v-if="item.flagClass"
                          class="fi"
                          :class="item.flagClass"
                          aria-hidden="true"
                        />
                        <span class="rev-iaa-country-name">{{ item.label }}</span>
                        <span class="rev-iaa-country-rev"
                          >: ${{ formatMoneyInt(item.revenue) }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 版本：柱状图 -->
                  <div v-show="iaaTab === 'version'" class="rev-iaa-version-wrap">
                    <div ref="iaaVersionBarRef" class="rev-iaa-version-chart" />
                  </div>
                </div>

                <div class="rev-table-wrap rev-table-wrap--iaa">
                  <ArtTable
                    class="rev-art-table"
                    :class="{ 'rev-art-table--iaa-platform-clickable': iaaTab === 'platform' }"
                    :data="iaaRowsWithTotal"
                    :columns="iaaColumns"
                    row-key="_rowKey"
                    :stripe="false"
                    :border="false"
                    size="default"
                    :pagination="undefined"
                    :header-cell-style="iaaHeaderCellStyle"
                    :cell-style="iaaCellStyle"
                    :row-class-name="iaaRowClassName"
                    @row-click="onIaaTableRowClick"
                  >
                    <template #s_name="{ row }">
                      <span
                        v-if="iaaTab === 'country' && row.s_country_code"
                        class="rev-iaa-cell-country"
                      >
                        <span
                          v-if="iaaCountryFlagClass(row.s_country_code)"
                          class="fi"
                          :class="iaaCountryFlagClass(row.s_country_code)"
                          aria-hidden="true"
                        />
                        {{ row.s_name }}
                      </span>
                      <span v-else-if="iaaTab === 'version'" class="rev-iaa-cell-version">
                        <span :class="{ 'is-current': row.is_current }">{{ row.s_name }}</span>
                        <span v-if="row.is_current" class="rev-iaa-ver-badge">当前</span>
                      </span>
                      <span v-else>{{ row.s_name }}</span>
                    </template>
                    <template #revenue="{ row }">
                      <span class="rev-iaa-money">{{ iaaFmtRevenue(row) }}</span>
                    </template>
                    <template #percent="{ row }">
                      <span class="rev-iaa-fill">{{ formatFixed(row.percent, 1) }}%</span>
                    </template>
                    <template #d_mom_pct="{ row }">
                      <span v-if="row.s_name === '合计'" class="rev-iaa-mom is-muted">—</span>
                      <span
                        v-else
                        class="rev-iaa-mom"
                        :class="row.d_mom_pct >= 0 ? 'is-up' : 'is-down'"
                      >
                        {{ row.d_mom_pct >= 0 ? '+' : '' }}{{ formatFixed(row.d_mom_pct, 1) }}%
                        {{ row.d_mom_pct >= 0 ? '↑' : '↓' }}
                      </span>
                    </template>
                  </ArtTable>
                  <p v-if="iaaTab === 'version'" class="rev-iaa-version-foot">
                    {{ iaaVersionFootnote }}
                  </p>
                </div>
              </div>
            </div>

            <div class="rev-panel rev-panel--iap">
              <div class="rev-panel__header rev-panel__header--iap">
                <div class="rev-panel__title">IAP 付费收入分析</div>
                <div class="rev-tabs rev-tabs--iap">
                  <button
                    v-for="t in iapTabs"
                    :key="t.key"
                    type="button"
                    class="rev-tab"
                    :class="{ active: iapTab === t.key }"
                    @click="iapTab = t.key"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>

              <div class="rev-iap-body">
                <!-- 商品构成 -->
                <div
                  v-show="iapTab === 'product'"
                  v-loading="iapTab === 'product' && iapProductLoading"
                  class="rev-iap-tab rev-iap-tab--product"
                >
                  <div class="rev-iap-top">
                    <div class="rev-iap-kpi">
                      <div class="rev-iap-kpi__k">订阅收入</div>
                      <div class="rev-iap-kpi__row">
                        <span class="rev-iap-kpi__v rev-iap-kpi__v--accent">{{
                          iapProductHeader.subscriptionValueText
                        }}</span>
                        <span class="rev-iap-kpi__tag">{{
                          iapProductHeader.subscriptionPctText
                        }}</span>
                      </div>
                    </div>
                    <div class="rev-iap-kpi">
                      <div class="rev-iap-kpi__k">一次性购买</div>
                      <div class="rev-iap-kpi__row">
                        <span class="rev-iap-kpi__v rev-iap-kpi__v--accent">{{
                          iapProductHeader.oneTimeValueText
                        }}</span>
                        <span class="rev-iap-kpi__tag">{{ iapProductHeader.oneTimePctText }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="rev-table-wrap rev-table-wrap--iap">
                    <ArtTable
                      height="260px"
                      class="rev-art-table"
                      :data="iapRowsWithTotal"
                      :columns="iapColumns"
                      row-key="s_product"
                      :stripe="false"
                      :border="false"
                      size="default"
                      :pagination="undefined"
                      :header-cell-style="iapHeaderCellStyle"
                      :cell-style="iapCellStyle"
                    >
                      <template #d_purchase_rate="{ row }">
                        <span
                          class="rev-pill-metric"
                          :class="
                            Number(row.d_purchase_rate || 0) >= 70
                              ? 'good'
                              : Number(row.d_purchase_rate || 0) >= 30
                                ? 'mid'
                                : 'bad'
                          "
                        >
                          {{ formatFixed(row.d_purchase_rate, 1) }}%
                        </span>
                      </template>
                    </ArtTable>
                  </div>

                  <div class="rev-iap-bottom">
                    <div class="rev-mini-kpi">
                      <div class="rev-mini-kpi__k">付费转化率</div>
                      <div class="rev-mini-kpi__v rev-mini-kpi__v--accent">{{
                        iapProductFoot.conversionRateText
                      }}</div>
                    </div>
                    <div class="rev-mini-kpi">
                      <div class="rev-mini-kpi__k">ARPPU</div>
                      <div class="rev-mini-kpi__v rev-mini-kpi__v--accent">{{
                        iapProductFoot.arppuText
                      }}</div>
                    </div>
                    <div class="rev-mini-kpi">
                      <div class="rev-mini-kpi__k">订阅续费率</div>
                      <div class="rev-mini-kpi__v rev-mini-kpi__v--accent">{{
                        iapProductFoot.renewalRateText
                      }}</div>
                    </div>
                  </div>
                </div>

                <!-- 广告平台分析：上比例条、中表格、下指标 -->
                <div
                  v-show="iapTab === 'channel'"
                  v-loading="iapTab === 'channel' && iapChannelLoading"
                  class="rev-iap-tab rev-iap-tab--channel"
                >
                  <div class="rev-iap-channel-viz">
                    <div class="rev-iaa-bar__track">
                      <div
                        v-for="seg in iapChannelSegments"
                        :key="seg.key"
                        class="rev-iaa-bar__seg"
                        :style="{ width: `${seg.percent}%`, background: seg.color }"
                      />
                    </div>
                    <div class="rev-iaa-bar__labels">
                      <span
                        v-for="seg in iapChannelSegments"
                        :key="seg.key"
                        class="rev-iaa-bar__label"
                      >
                        <span class="rev-dot" :style="{ background: seg.color }" />
                        {{ seg.percent.toFixed(1) }}% {{ seg.label }}
                      </span>
                    </div>
                  </div>
                  <div class="rev-table-wrap rev-table-wrap--iap-channel">
                    <ArtTable
                      height="200px"
                      class="rev-art-table"
                      :data="iapChannelRowsWithTotal"
                      :columns="iapChannelColumns"
                      row-key="s_channel_name"
                      :stripe="false"
                      :border="false"
                      size="default"
                      :pagination="undefined"
                      :header-cell-style="iapHeaderCellStyle"
                      :cell-style="iapCellStyle"
                      :row-class-name="iapChannelRowClassName"
                    >
                      <template #revenue="{ row }">
                        <span class="rev-iap-money">${{ formatFixed(row.revenue, 2) }}</span>
                      </template>
                      <template #d_conversion_rate="{ row }">
                        <span
                          class="rev-pill-metric"
                          :class="
                            row.s_channel_name === '合计'
                              ? 'mid'
                              : row.d_conversion_rate >= 2.2
                                ? 'good'
                                : row.d_conversion_rate >= 1.8
                                  ? 'mid'
                                  : 'bad'
                          "
                        >
                          {{ formatFixed(row.d_conversion_rate, 1) }}%
                        </span>
                      </template>
                      <template #d_refund_rate="{ row }">
                        <span
                          class="rev-pill-metric"
                          :class="
                            row.s_channel_name === '合计'
                              ? 'mid'
                              : row.d_refund_rate <= 1.5
                                ? 'good'
                                : row.d_refund_rate <= 2.5
                                  ? 'mid'
                                  : 'bad'
                          "
                        >
                          {{ formatFixed(row.d_refund_rate, 1) }}%
                        </span>
                      </template>
                    </ArtTable>
                  </div>
                  <div class="rev-iap-channel-metrics">
                    <div
                      v-for="(m, idx) in iapChannelLeftMetrics"
                      :key="idx"
                      class="rev-iap-channel-metric"
                    >
                      <div class="rev-iap-channel-metric__k">{{ m.title }}</div>
                      <div class="rev-iap-channel-metric__v" :class="`is-accent-${m.accent}`">
                        {{ m.valueText }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 趋势：双轴图 + KPI -->
                <div
                  v-show="iapTab === 'trend'"
                  v-loading="iapTab === 'trend' && iapTrendLoading"
                  class="rev-iap-tab rev-iap-tab--trend"
                >
                  <div class="rev-iap-trend-chart-wrap">
                    <div ref="iapTrendRef" class="rev-chart rev-chart--iap-trend" />
                  </div>
                  <div class="rev-iap-trend-kpis">
                    <div v-for="(card, idx) in iapTrendKpis" :key="idx" class="rev-iap-trend-kpi">
                      <div class="rev-iap-trend-kpi__head">
                        <span class="rev-iap-trend-kpi__title">{{ card.title }}</span>
                        <span
                          v-if="card.trendText"
                          class="rev-iap-trend-kpi__trend"
                          :class="card.trendUp ? 'up' : 'down'"
                        >
                          {{ card.trendText }}
                        </span>
                      </div>
                      <div class="rev-iap-trend-kpi__value">{{ card.valueText }}</div>
                      <div v-if="card.subText" class="rev-iap-trend-kpi__sub">{{
                        card.subText
                      }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-loading="trend7dLoading" class="rev-panel rev-panel--trend7d">
              <div class="rev-panel__header">
                <div class="rev-panel__title">近7天 IAA vs IAP 收入趋势</div>
                <div class="rev-legend">
                  <span class="rev-legend__item"
                    ><span class="rev-dot" style="background: var(--rev-c-teal)" /> IAA</span
                  >
                  <span class="rev-legend__item"
                    ><span class="rev-dot" style="background: var(--rev-c-purple)" /> IAP</span
                  >
                </div>
              </div>
              <div ref="trend7dRef" class="rev-chart rev-chart--trend7d" />
            </div>

            <!-- 下排：左 饼图 / 中 Top5 / 右 ECPM + AI + 质量 -->
            <div v-loading="platformPieLoading" class="rev-panel rev-panel--pie">
              <div class="rev-panel__header">
                <div class="rev-panel__title">广告平台分布</div>
              </div>
              <div class="rev-pie">
                <div class="rev-pie__chart-wrap">
                  <div ref="pieRef" class="rev-pie__chart" />
                  <div class="rev-pie__center">
                    <div class="rev-pie__center-value">{{ platformPieCenterTotal }}</div>
                    <div class="rev-pie__center-label">广告收入</div>
                  </div>
                </div>
                <div class="rev-pie__list">
                  <div v-for="s in platformPie" :key="s.name" class="rev-pie__item">
                    <span class="rev-dot" :style="{ background: s.color }" />
                    <div class="rev-pie__item-text">
                      <span class="rev-pie__name">{{ s.name }}</span>
                      <span class="rev-pie__percent" :style="{ color: s.color }">{{
                        s.percentText
                      }}</span>
                    </div>
                    <div class="rev-pie__money">{{ s.moneyText }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-loading="topCountriesLoading" class="rev-panel rev-panel--top5">
              <div class="rev-panel__header">
                <div class="rev-panel__title">Top 5 国家收入</div>
                <div class="rev-tabs rev-tabs--compact rev-tabs--segmented rev-tabs--top5">
                  <span class="rev-tab-pill" :style="top5PillStyle" aria-hidden="true" />
                  <button
                    v-for="t in top5TabDefs"
                    :key="t.key"
                    type="button"
                    class="rev-tab"
                    :class="{ active: top5Tab === t.key }"
                    @click="top5Tab = t.key"
                  >
                    {{ t.label }}
                  </button>
                </div>
              </div>

              <Transition name="rev-top5-panel" mode="out-in">
                <div :key="top5Tab" class="rev-table-wrap rev-table-wrap--top5">
                  <ArtTable
                    class="rev-art-table rev-art-table--top5"
                    :data="topCountriesWithTotal"
                    :columns="top5Columns"
                    row-key="s_country_code"
                    :stripe="false"
                    :border="false"
                    size="default"
                    :pagination="undefined"
                    :header-cell-style="top5HeaderCellStyle"
                    :cell-style="top5CellStyle"
                    :row-class-name="top5RowClassName"
                  >
                    <template #s_country_name="{ row }">
                      <span class="rev-flag">{{ flagEmojiByCode(row.s_country_code) }}</span>
                      {{ row.s_country_name }}
                    </template>
                  </ArtTable>
                </div>
              </Transition>
            </div>

            <div class="rev-right-stack">
              <div v-loading="ecpmLoading" class="rev-panel rev-panel--ecpm">
                <div class="rev-panel__header">
                  <div class="rev-panel__title">ECPM 趋势（7天）</div>
                  <div class="rev-legend">
                    <span class="rev-legend__item">
                      <span class="rev-dot" style="background: var(--rev-c-amber)" />
                      预估 eCPM
                    </span>
                    <span class="rev-legend__item">
                      <span class="rev-dot" style="background: var(--rev-c-cyan)" />
                      真实 eCPM
                    </span>
                  </div>
                </div>
                <div ref="ecpmRef" class="rev-chart rev-chart--sm" />
              </div>

              <div class="rev-right-bottom">
                <div v-loading="aiInsightLoading" class="rev-panel rev-panel--ai">
                  <div class="rev-panel__header">
                    <div class="rev-panel__title">{{ aiInsight.title || 'AI 洞察' }}</div>
                  </div>
                  <template v-if="aiInsight.bullets.length">
                    <ul class="rev-ai">
                      <li
                        v-for="(b, i) in aiInsight.bullets"
                        :key="i"
                        class="rev-ai__item"
                        :data-idx="i"
                      >
                        {{ b }}
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    <div class="rev-ai-empty">
                      <ElEmpty description="暂无 AI 洞察" :image-size="72" />
                    </div>
                  </template>
                </div>

                <div class="rev-panel rev-panel--quality">
                  <div class="rev-panel__header">
                    <div class="rev-panel__title">收入质量指标</div>
                  </div>
                  <div class="rev-quality-grid">
                    <div
                      v-for="c in fixedQualityCards"
                      :key="c.title"
                      class="rev-quality"
                      :data-accent="c.accent"
                    >
                      <div class="rev-quality__k">{{ c.title }}</div>
                      <div class="rev-quality__v">{{ c.valueText }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </template>
      </ElSkeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    reactive,
    ref,
    watch,
    type CSSProperties
  } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import AppPlatformSearchSelect from '@/components/filter/app-platform-search-select.vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import 'flag-icons/css/flag-icons.min.css'
  import { useChart } from '@/hooks/core/useChart'
  import { graphic, type EChartsOption } from '@/plugins/echarts'
  import { dateShortcuts } from '@/utils/form/date-shortcuts'
  import type { ColumnOption } from '@/types'
  import {
    fetchRevenueOverviewTopCountries,
    fetchRevenueOverviewPlatformPie,
    fetchRevenueOverviewTrend7dEcpm,
    fetchRevenueOverviewTrend7dIaaIap,
    fetchRevenueOverviewIapTrend,
    fetchRevenueOverviewIapChannel,
    fetchRevenueOverviewIapProduct,
    fetchRevenueOverviewIaaVersion,
    fetchRevenueOverviewIaaCountry,
    fetchRevenueOverviewIaaAdUnit,
    fetchRevenueOverviewIaaPlatform,
    fetchRevenueOverviewIaaAdType,
    fetchRevenueOverviewOverviewKpis
  } from '@/api/business-insight'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore Vetur 对 <script setup> 的误报
  import RevenueKpiSpark from './modules/revenue-kpi-spark.vue'
  import {
    MOCK_REVENUE_OVERVIEW_ECPM_7D,
    MOCK_REVENUE_OVERVIEW_FILTERS,
    MOCK_REVENUE_OVERVIEW_IAA_AD_UNIT_ROWS,
    MOCK_REVENUE_OVERVIEW_IAA_COLORS,
    MOCK_REVENUE_OVERVIEW_IAA_COUNTRY_ROWS,
    MOCK_REVENUE_OVERVIEW_IAA_PLATFORM_ROWS,
    MOCK_REVENUE_OVERVIEW_IAA_ROWS,
    MOCK_REVENUE_OVERVIEW_IAA_TABS,
    MOCK_REVENUE_OVERVIEW_IAA_VERSION_ROWS,
    MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_FOOT,
    MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_HEADER,
    MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_LEFT_METRICS,
    MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_ROWS,
    MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_SEGMENTS,
    MOCK_REVENUE_OVERVIEW_IAP_ROWS,
    MOCK_REVENUE_OVERVIEW_IAP_TABS,
    MOCK_REVENUE_OVERVIEW_IAP_TREND_KPIS,
    MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES,
    MOCK_REVENUE_OVERVIEW_KPIS,
    MOCK_REVENUE_OVERVIEW_7D_DATES,
    MOCK_REVENUE_OVERVIEW_7D_TREND,
    MOCK_REVENUE_OVERVIEW_PLATFORM_PIE,
    MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES,
    type RevenueOverviewIapBreakdownRow,
    type RevenueOverviewIapChannelRow,
    type RevenueOverviewIapChannelSegment,
    type RevenueOverviewIapTrendKpiCard,
    type RevenueOverviewIaaVersionRow,
    type RevenueOverviewIaaCountryRow,
    type RevenueOverviewIaaAdUnitRow,
    type RevenueOverviewIaaBreakdownRow,
    type RevenueOverviewIaaPlatformRow,
    type RevenueOverviewFilterState,
    type RevenueOverviewKpiCard
  } from './mock'

  defineOptions({ name: 'RevenueOverview' })

  const router = useRouter()
  const cockpitMetaStore = useCockpitMetaFilterStore()
  const { data: cockpitMeta } = storeToRefs(cockpitMetaStore)
  const metaSettingApps = computed(() => cockpitMeta.value?.settingApps ?? [])

  /** IAA 广告平台 Tab 行点击进入商业洞察 · 广告平台详情 */
  function onIaaTableRowClick(row: Record<string, unknown>) {
    if (iaaTab.value !== 'platform') return
    const platformName =
      typeof row.s_platform_name === 'string'
        ? row.s_platform_name.trim()
        : typeof row.s_name === 'string'
          ? row.s_name.trim()
          : ''
    if (!platformName || platformName === '合计') return
    const source = typeof row.source === 'string' ? row.source.trim() : ''
    void router.push({
      name: 'AdPlatformDetail',
      query: {
        'platform-name': platformName,
        source
      }
    })
  }

  // 高度仍保留设计稿基准，宽度改为自适应容器
  const designHeight = 980
  const rootRef = ref<HTMLElement>()
  const pageLoading = ref(true)

  type SelectOption<T extends string = string> = { label: string; value: T }
  type IapProductHeader = {
    subscriptionValueText: string
    subscriptionPctText: string
    oneTimeValueText: string
    oneTimePctText: string
  }
  type IapProductFoot = {
    conversionRateText: string
    arppuText: string
    renewalRateText: string
  }
  type IapChannelMetric = {
    title: string
    valueText: string
    accent: 'purple' | 'green' | 'amber'
  }

  const filtersDraft = reactive<RevenueOverviewFilterState>({ ...MOCK_REVENUE_OVERVIEW_FILTERS })
  // applied filters：仅在点击「查询」时更新，用于所有接口请求
  const filters = reactive<RevenueOverviewFilterState>({ ...MOCK_REVENUE_OVERVIEW_FILTERS })

  /** 驾驶舱 meta 未就绪时的国家下拉兜底（与 store 中 CockpitMetaOptionItem 形态一致） */
  const COUNTRY_OPTIONS_FALLBACK: SelectOption[] = [
    { label: '不限', value: '' },
    { label: '美国', value: 'US' },
    { label: '英国', value: 'GB' },
    { label: '德国', value: 'DE' },
    { label: '台湾', value: 'TW' },
    { label: '日本', value: 'JP' }
  ]

  const countryOptions = computed<SelectOption[]>(() => {
    const fromStore = cockpitMeta.value?.countryOptions
    const emptyFirst: SelectOption = { label: '不限', value: '' }
    if (fromStore?.length) {
      const mapped = fromStore
        .filter((o) => String(o.value).toLowerCase() !== 'all')
        .map((o) => ({ label: o.label, value: o.value }))
      const hasEmpty = mapped.some((o) => o.value === '')
      return hasEmpty ? mapped : [emptyFirst, ...mapped]
    }
    return COUNTRY_OPTIONS_FALLBACK
  })

  /** 版本筛选项（模板中注释）；未在驾驶舱 meta 中提供，保持本地静态 */
  // const versionOptions: SelectOption[] = [
  //   { label: '全部', value: 'all' },
  //   { label: '1.2.0', value: '1.2.0' },
  //   { label: '1.1.8', value: '1.1.8' },
  //   { label: '1.1.2', value: '1.1.2' }
  // ]

  /** 筛选项统一来自 `useCockpitMetaFilterStore`（GET …/cockpit/meta-filter-options），不再请求 revenue-overview 专用 meta */
  async function loadMetaFilterOptions() {
    try {
      await cockpitMetaStore.ensureLoaded()
    } catch {
      // 失败时仍可用 country 兜底、settingApps 为空
    }
  }

  function applyDraftFilters() {
    Object.assign(filters, {
      ...filtersDraft,
      appIds: [...filtersDraft.appIds],
      platform: ''
    })
  }

  function triggerQueryLoads() {
    void loadOverviewKpis()
    if (iaaTab.value === 'ad_type') void loadIaaAdTypeRows()
    if (iaaTab.value === 'platform') void loadIaaPlatformRows()
    if (iaaTab.value === 'ad_unit') void loadIaaAdUnitRows()
    if (iaaTab.value === 'country') void loadIaaCountryRows()
    if (iaaTab.value === 'version') void loadIaaVersionRows()
    if (iapTab.value === 'product') void loadIapProductRows()
    if (iapTab.value === 'channel') void loadIapChannelRows()
    if (iapTab.value === 'trend') void loadIapTrendRows()
    void loadTrend7dIaaIap()
    void loadTrend7dEcpm()
    void loadPlatformPie()
    void loadTopCountries()
    void loadAiInsight()
    void syncIaaCharts()
    if (iapTrendInited.value && iapTab.value === 'trend') {
      chartIapTrend.updateChart(buildIapTrendOption())
    }
  }

  function onQuery() {
    applyDraftFilters()
    triggerQueryLoads()
  }

  function resetViewDataBeforeLoad() {
    kpis.value = []
    iaaAdTypeRows.value = []
    iaaPlatformRows.value = []
    iaaAdUnitRows.value = []
    iaaCountryRows.value = []
    iaaVersionRows.value = []

    iapChannelSegments.value = []
    iapChannelRows.value = []
    iapChannelLeftMetrics.value = []

    iapTrendDateLabels.value = []
    iapTrendSeries.value = { revenue: [], orders: [] }
    iapTrendKpis.value = []

    iapProductHeader.value = {
      subscriptionValueText: '',
      subscriptionPctText: '',
      oneTimeValueText: '',
      oneTimePctText: ''
    }
    iapProductFoot.value = { conversionRateText: '', arppuText: '', renewalRateText: '' }
    iapProductRows.value = []
    iapProductCache.value = {
      header: {
        subscriptionValueText: '',
        subscriptionPctText: '',
        oneTimeValueText: '',
        oneTimePctText: ''
      },
      foot: { conversionRateText: '', arppuText: '', renewalRateText: '' },
      rows: []
    }

    trend7dDateLabels.value = []
    trend7dSeries.value = { iaa: [], iap: [] }

    ecpmDateLabels.value = []
    ecpmSeries.value = { predicted: [], actual: [] }

    platformPie.value = []
    topCountries.value = []
    aiInsight.value = { title: 'AI 洞察', bullets: [] }
  }

  const kpis = ref<RevenueOverviewKpiCard[]>(MOCK_REVENUE_OVERVIEW_KPIS)
  const iaaAdTypeRows = ref<RevenueOverviewIaaBreakdownRow[]>(MOCK_REVENUE_OVERVIEW_IAA_ROWS)
  const iaaAdTypeLoading = ref(false)
  const iaaPlatformRows = ref<RevenueOverviewIaaPlatformRow[]>(
    MOCK_REVENUE_OVERVIEW_IAA_PLATFORM_ROWS
  )
  const iaaPlatformLoading = ref(false)
  const iaaAdUnitRows = ref<RevenueOverviewIaaAdUnitRow[]>(MOCK_REVENUE_OVERVIEW_IAA_AD_UNIT_ROWS)
  const iaaAdUnitLoading = ref(false)
  const iaaCountryRows = ref<RevenueOverviewIaaCountryRow[]>(MOCK_REVENUE_OVERVIEW_IAA_COUNTRY_ROWS)
  const iaaCountryLoading = ref(false)
  const iaaVersionRows = ref<RevenueOverviewIaaVersionRow[]>(MOCK_REVENUE_OVERVIEW_IAA_VERSION_ROWS)
  const iaaVersionLoading = ref(false)

  async function loadOverviewKpis() {
    try {
      const data = await fetchRevenueOverviewOverviewKpis({ ...filters })
      if (Array.isArray(data.kpis)) kpis.value = data.kpis
    } catch {
      // 失败时保留当前卡片，避免首屏闪断
    }
  }

  async function loadIaaAdTypeRows() {
    iaaAdTypeLoading.value = true
    try {
      const data = await fetchRevenueOverviewIaaAdType({ ...filters })
      if (Array.isArray(data.rows)) iaaAdTypeRows.value = data.rows
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iaaAdTypeLoading.value = false
    }
  }

  async function loadIaaPlatformRows() {
    iaaPlatformLoading.value = true
    try {
      const data = await fetchRevenueOverviewIaaPlatform({ ...filters })
      if (Array.isArray(data.rows)) iaaPlatformRows.value = data.rows
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iaaPlatformLoading.value = false
    }
  }

  async function loadIaaAdUnitRows() {
    iaaAdUnitLoading.value = true
    try {
      const data = await fetchRevenueOverviewIaaAdUnit({ ...filters })
      if (Array.isArray(data.rows)) iaaAdUnitRows.value = data.rows
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iaaAdUnitLoading.value = false
    }
  }

  async function loadIaaCountryRows() {
    iaaCountryLoading.value = true
    try {
      const data = await fetchRevenueOverviewIaaCountry({ ...filters })
      if (Array.isArray(data.rows)) iaaCountryRows.value = data.rows
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iaaCountryLoading.value = false
    }
  }

  async function loadIaaVersionRows() {
    iaaVersionLoading.value = true
    try {
      const data = await fetchRevenueOverviewIaaVersion({ ...filters })
      if (Array.isArray(data.rows)) {
        iaaVersionRows.value = data.rows.map((r: any) => ({
          ...r,
          // 兼容后端返回 users 字段（用于版本维度“广告用户”展示）
          n_users: Number(r?.n_users ?? r?.users ?? r?.n_dau ?? 0),
          // 兼容崩溃率字段可能缺失/改名，保持结构稳定
          d_crash_rate: Number(r?.d_crash_rate ?? r?.crashRate ?? 0)
        }))
      }
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iaaVersionLoading.value = false
    }
  }

  async function loadIapProductRows() {
    iapProductLoading.value = true
    try {
      const data = await fetchRevenueOverviewIapProduct({ ...filters })
      const mappedRows: RevenueOverviewIapBreakdownRow[] = Array.isArray(data.rows)
        ? data.rows.map((r: any) => ({
            s_product: String(r?.s_product ?? r?.product ?? ''),
            s_type: (r?.s_type ?? r?.type) === '订阅' ? '订阅' : '一次性',
            revenue: Number(r?.revenue ?? 0),
            percent: Number(r?.percent ?? 0),
            n_buy_times: Number(r?.n_buy_times ?? r?.buyTimes ?? 0),
            n_users: Number(r?.n_users ?? r?.users ?? 0),
            d_arppu: Number(r?.d_arppu ?? r?.arppu ?? 0),
            d_purchase_rate: Number(r?.d_purchase_rate ?? r?.purchaseRate ?? 0)
          }))
        : []

      // 缓存商品构成数据：用于全局固定卡片等跨 tab 读取
      iapProductCache.value = {
        header: data.header,
        foot: data.foot,
        rows: mappedRows
      }

      iapProductHeader.value = iapProductCache.value.header
      iapProductFoot.value = iapProductCache.value.foot
      // 兼容后端返回 camelCase 字段（product/buyTimes/purchaseRate...）
      iapProductRows.value = mappedRows
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iapProductLoading.value = false
    }
  }

  async function loadIapChannelRows() {
    iapChannelLoading.value = true
    try {
      const data = await fetchRevenueOverviewIapChannel({ ...filters })
      iapChannelSegments.value = Array.isArray(data.segments) ? data.segments : []
      iapChannelRows.value = Array.isArray(data.rows) ? data.rows : []
      iapChannelLeftMetrics.value = Array.isArray(data.leftMetrics) ? data.leftMetrics : []
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iapChannelLoading.value = false
    }
  }

  async function loadIapTrendRows() {
    iapTrendLoading.value = true
    try {
      const data = await fetchRevenueOverviewIapTrend({ ...filters })
      iapTrendDateLabels.value = Array.isArray(data.dateLabels) ? data.dateLabels : []
      iapTrendSeries.value = {
        revenue: Array.isArray(data.series?.revenue) ? data.series.revenue : [],
        orders: Array.isArray(data.series?.orders) ? data.series.orders : []
      }
      iapTrendKpis.value = Array.isArray(data.kpis) ? data.kpis : []
      if (iapTrendInited.value && iapTab.value === 'trend') {
        chartIapTrend.updateChart(buildIapTrendOption())
      }
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      iapTrendLoading.value = false
    }
  }

  async function loadTrend7dIaaIap() {
    trend7dLoading.value = true
    try {
      const data = await fetchRevenueOverviewTrend7dIaaIap({ ...filters })
      trend7dDateLabels.value = Array.isArray(data.dateLabels) ? data.dateLabels : []
      trend7dSeries.value = {
        iaa: Array.isArray(data.iaa) ? data.iaa : [],
        iap: Array.isArray(data.iap) ? data.iap : []
      }
      chartTrend7d.updateChart(buildTrend7dOption())
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      trend7dLoading.value = false
    }
  }

  async function loadTrend7dEcpm() {
    ecpmLoading.value = true
    try {
      const data = await fetchRevenueOverviewTrend7dEcpm({ ...filters })
      ecpmDateLabels.value = Array.isArray(data.dateLabels) ? data.dateLabels : []
      ecpmSeries.value = {
        predicted: Array.isArray(data.predicted) ? data.predicted : [],
        actual: Array.isArray(data.actual) ? data.actual : []
      }
      chartEcpm.updateChart(buildEcpmOption())
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      ecpmLoading.value = false
    }
  }

  async function loadPlatformPie() {
    platformPieLoading.value = true
    try {
      const data = await fetchRevenueOverviewPlatformPie({ ...filters })
      platformPie.value = Array.isArray(data.slices) ? data.slices : []
      chartPie.updateChart(buildPieOption())
      requestAnimationFrame(() => {
        chartPie.handleResize()
      })
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      platformPieLoading.value = false
    }
  }

  async function loadTopCountries() {
    topCountriesLoading.value = true
    try {
      const data = await fetchRevenueOverviewTopCountries({ ...filters })
      topCountries.value = Array.isArray(data.rows) ? data.rows : []
    } catch {
      // 失败时保留当前数据，避免主区块闪断
    } finally {
      topCountriesLoading.value = false
    }
  }

  async function loadAiInsight() {
    aiInsightLoading.value = true
    try {
      // 暂无数据：该模块需要对接新的接口，先保持空态展示
      aiInsight.value = { title: 'AI 洞察', bullets: [] }
    } finally {
      aiInsightLoading.value = false
    }
  }

  type FixedQualityCard = { title: string; valueText: string; accent: 'green' | 'amber' | 'purple' }

  type IapProductCache = {
    header: IapProductHeader
    foot: IapProductFoot
    rows: RevenueOverviewIapBreakdownRow[]
  }

  const iapProductCache = ref<IapProductCache>({
    header: {
      subscriptionValueText: '',
      subscriptionPctText: '',
      oneTimeValueText: '',
      oneTimePctText: ''
    },
    foot: { conversionRateText: '', arppuText: '', renewalRateText: '' },
    rows: []
  })

  const fixedQualityCards = computed<FixedQualityCard[]>(() => {
    const kpiEcpm = kpis.value?.[3]
    const ecpmDeviationText = String(kpiEcpm?.subRightValue ?? '--')
    const iapConversionRateText = String(iapProductCache.value.foot?.conversionRateText || '--')
    return [
      { title: '广告填充率', valueText: '9.10%', accent: 'green' },
      { title: 'IAP转化率', valueText: iapConversionRateText, accent: 'purple' },
      { title: 'ECPM偏差率', valueText: ecpmDeviationText, accent: 'amber' }
    ]
  })

  const iaaTabs = ref(MOCK_REVENUE_OVERVIEW_IAA_TABS)
  const iapTabs = ref(MOCK_REVENUE_OVERVIEW_IAP_TABS)
  const iaaTab = ref<(typeof MOCK_REVENUE_OVERVIEW_IAA_TABS)[number]['key']>('ad_type')
  const iapTab = ref<(typeof MOCK_REVENUE_OVERVIEW_IAP_TABS)[number]['key']>('product')

  const iapChannelSegments = ref<RevenueOverviewIapChannelSegment[]>([
    ...MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_SEGMENTS
  ])
  const iapChannelRows = ref<RevenueOverviewIapChannelRow[]>([
    ...MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_ROWS
  ])
  const iapChannelLeftMetrics = ref<IapChannelMetric[]>([
    ...MOCK_REVENUE_OVERVIEW_IAP_CHANNEL_LEFT_METRICS
  ])
  const iapChannelLoading = ref(false)
  const iapTrendKpis = ref<RevenueOverviewIapTrendKpiCard[]>([
    ...MOCK_REVENUE_OVERVIEW_IAP_TREND_KPIS
  ])
  const iapTrendSeries = ref<{ revenue: number[]; orders: number[] }>({
    revenue: [...MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES.revenue],
    orders: [...MOCK_REVENUE_OVERVIEW_IAP_TREND_SERIES.orders]
  })
  const iapTrendDateLabels = ref([...MOCK_REVENUE_OVERVIEW_7D_DATES])
  const iapTrendLoading = ref(false)
  const trend7dDateLabels = ref([...MOCK_REVENUE_OVERVIEW_7D_DATES])
  const trend7dSeries = ref<{ iaa: number[]; iap: number[] }>({
    iaa: [...MOCK_REVENUE_OVERVIEW_7D_TREND.iaa],
    iap: [...MOCK_REVENUE_OVERVIEW_7D_TREND.iap]
  })
  const trend7dLoading = ref(false)
  const ecpmDateLabels = ref([...MOCK_REVENUE_OVERVIEW_7D_DATES])
  const ecpmSeries = ref<{ predicted: number[]; actual: number[] }>({
    predicted: [...MOCK_REVENUE_OVERVIEW_ECPM_7D.predicted],
    actual: [...MOCK_REVENUE_OVERVIEW_ECPM_7D.actual]
  })
  const ecpmLoading = ref(false)
  const platformPieLoading = ref(false)
  const iapProductHeader = ref<IapProductHeader>({
    ...MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_HEADER
  })
  const iapProductFoot = ref<IapProductFoot>({
    ...MOCK_REVENUE_OVERVIEW_IAP_PRODUCT_FOOT
  })
  const iapProductRows = ref<RevenueOverviewIapBreakdownRow[]>([...MOCK_REVENUE_OVERVIEW_IAP_ROWS])
  const iapProductLoading = ref(false)

  const platformPie = ref(MOCK_REVENUE_OVERVIEW_PLATFORM_PIE)
  const platformPieCenterTotal = computed(() => {
    const list = platformPie.value
    const total = list.reduce((sum, s) => {
      const num = Number(String(s.moneyText || '').replace(/[^0-9.-]/g, '')) || 0
      return sum + num
    }, 0)
    return total ? `$${Math.round(total).toLocaleString()}` : '$0'
  })
  const topCountries = ref(MOCK_REVENUE_OVERVIEW_TOP_COUNTRIES)
  const topCountriesLoading = ref(false)

  type Top5TabKey = 'total' | 'iaa' | 'iap'
  const top5Tab = ref<Top5TabKey>('total')
  const top5TabDefs: { key: Top5TabKey; label: string }[] = [
    { key: 'total', label: '合计' },
    { key: 'iaa', label: 'IAA' },
    { key: 'iap', label: 'IAP' }
  ]
  const top5TabIndex = computed(() => top5TabDefs.findIndex((t) => t.key === top5Tab.value))
  const top5PillStyle = computed<CSSProperties>(() => ({
    transform: `translateX(calc(${Math.max(0, top5TabIndex.value)} * 100%))`
  }))
  type RevenueOverviewAiInsight = { title: string; bullets: string[] }
  const aiInsight = ref<RevenueOverviewAiInsight>({ title: 'AI 洞察', bullets: [] })
  const aiInsightLoading = ref(false)
  // 收入质量指标改为固定卡片：不再走 quality-metrics 接口

  function formatInt(n: number) {
    return Number(n || 0).toLocaleString()
  }
  function formatMoneyInt(n: number) {
    return Math.round(Number(n || 0)).toLocaleString()
  }
  function formatFixed(n: number, digits: number) {
    const v = Number(n || 0)
    return Number.isFinite(v) ? v.toFixed(digits) : '0'
  }

  const iaaVersionFootnote = computed(() => {
    const cur = iaaVersionRows.value.find((r) => r.is_current)
    if (!cur) return ''
    return `版本分布反映用户升级进度，${cur.s_app_version} 已覆盖 ${formatFixed(cur.percent, 1)}% 用户`
  })

  const IAA_COLORS = [...MOCK_REVENUE_OVERVIEW_IAA_COLORS]

  function iaaWeightedEcpm(rows: { revenue: number; n_impression: number }[]) {
    const sumR = rows.reduce((a, r) => a + r.revenue, 0)
    const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
    return sumI > 0 ? (sumR / sumI) * 1000 : 0
  }

  function iaaWeightedAvgDisplay(rows: { d_avg_display: number; n_impression: number }[]) {
    const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
    if (sumI <= 0) return 0
    return rows.reduce((a, r) => a + r.d_avg_display * r.n_impression, 0) / sumI
  }

  const iaaSegments = computed(() => {
    const colors = IAA_COLORS
    const tab = iaaTab.value
    if (tab === 'ad_type') {
      return iaaAdTypeRows.value.map((r, idx) => ({
        key: r.s_ad_type_name,
        label: r.s_ad_type_name,
        percent: r.percent,
        color: colors[idx % colors.length]
      }))
    }
    if (tab === 'platform') {
      return iaaPlatformRows.value.map((r, idx) => ({
        key: r.s_platform_name,
        label: r.s_platform_name,
        percent: r.percent,
        color: colors[idx % colors.length]
      }))
    }
    if (tab === 'ad_unit') {
      return iaaAdUnitRows.value.map((r, idx) => ({
        key: r.s_ad_unit_name,
        label: r.s_ad_unit_name,
        percent: r.percent,
        color: colors[idx % colors.length]
      }))
    }
    return []
  })

  const iaaVizTotalMoney = computed(() => {
    const tab = iaaTab.value
    let rows: { revenue: number }[] = []
    if (tab === 'ad_type') rows = iaaAdTypeRows.value
    else if (tab === 'platform') rows = iaaPlatformRows.value
    else if (tab === 'ad_unit') rows = iaaAdUnitRows.value
    else if (tab === 'country') rows = iaaCountryRows.value
    else if (tab === 'version') rows = iaaVersionRows.value
    const sum = rows.reduce((a, r) => a + r.revenue, 0)
    return `$${formatMoneyInt(sum)}`
  })

  function iaaCountryFlagClass(code: string) {
    const raw = String(code || '')
      .trim()
      .toUpperCase()
    if (!raw || raw === 'ZZ') return ''
    const mapped = raw === 'UK' ? 'gb' : raw.toLowerCase()
    if (!/^[a-z]{2}$/.test(mapped)) return ''
    return `fi-${mapped}`
  }

  const iaaCountryBarItems = computed(() => {
    const rows = iaaCountryRows.value
    const maxRev = Math.max(...rows.map((r) => r.revenue), 1)
    return rows.map((r) => ({
      _rowKey: `ct-${r.s_country_code}`,
      label: r.s_country_name,
      revenue: r.revenue,
      pctWidth: (r.revenue / maxRev) * 100,
      flagClass: iaaCountryFlagClass(r.s_country_code),
      isOther: r.s_country_code === 'ZZ'
    }))
  })

  const iaaRowsWithTotal = computed(() => {
    const tab = iaaTab.value
    if (tab === 'ad_type') {
      const rows = iaaAdTypeRows.value.map((r) => ({
        _rowKey: `ad_type-${r.s_ad_type_name}`,
        s_name: r.s_ad_type_name,
        revenue: r.revenue,
        percent: r.percent,
        n_users: r.n_users,
        n_impression: r.n_impression,
        d_avg_display: r.d_avg_display,
        d_avg_revenue: r.d_avg_revenue
      }))
      const sumR = rows.reduce((a, r) => a + r.revenue, 0)
      const sumU = rows.reduce((a, r) => a + r.n_users, 0)
      const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
      rows.push({
        _rowKey: 'ad_type-total',
        s_name: '合计',
        revenue: sumR,
        percent: 100,
        n_users: sumU,
        n_impression: sumI,
        d_avg_display: iaaWeightedAvgDisplay(iaaAdTypeRows.value),
        d_avg_revenue: sumU > 0 ? sumR / sumU : 0
      })
      return rows
    }
    if (tab === 'platform') {
      const rows = iaaPlatformRows.value.map((r) => ({
        _rowKey: `pf-${r.s_platform_name}`,
        s_name: r.s_platform_name,
        s_platform_name: r.s_platform_name,
        source: String((r as any).source ?? ''),
        revenue: r.revenue,
        percent: r.percent,
        n_impression: r.n_impression,
        d_ecpm: r.d_ecpm,
        n_users: r.n_users
      }))
      const sumR = rows.reduce((a, r) => a + r.revenue, 0)
      const sumU = rows.reduce((a, r) => a + r.n_users, 0)
      const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
      rows.push({
        _rowKey: 'pf-total',
        s_name: '合计',
        s_platform_name: '合计',
        source: '',
        revenue: sumR,
        percent: 100,
        n_impression: sumI,
        d_ecpm: iaaWeightedEcpm(iaaPlatformRows.value),
        n_users: sumU
      })
      return rows
    }
    if (tab === 'ad_unit') {
      const rows = iaaAdUnitRows.value.map((r) => ({
        _rowKey: `unit-${r.s_ad_unit_name}`,
        s_name: r.s_ad_unit_name,
        revenue: r.revenue,
        percent: r.percent,
        n_impression: r.n_impression,
        d_ecpm: r.d_ecpm,
        n_users: r.n_users
      }))
      const sumR = rows.reduce((a, r) => a + r.revenue, 0)
      const sumU = rows.reduce((a, r) => a + r.n_users, 0)
      const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
      rows.push({
        _rowKey: 'unit-total',
        s_name: '合计',
        revenue: sumR,
        percent: 100,
        n_impression: sumI,
        d_ecpm: iaaWeightedEcpm(iaaAdUnitRows.value),
        n_users: sumU
      })
      return rows
    }
    if (tab === 'country') {
      const rows = iaaCountryRows.value.map((r) => ({
        _rowKey: `ct-${r.s_country_code}`,
        s_name: r.s_country_name,
        s_country_code: r.s_country_code,
        revenue: r.revenue,
        percent: r.percent,
        n_impression: r.n_impression,
        d_ecpm: r.d_ecpm,
        n_users: r.n_users,
        d_mom_pct: r.d_mom_pct
      }))
      const sumR = rows.reduce((a, r) => a + r.revenue, 0)
      const sumU = rows.reduce((a, r) => a + r.n_users, 0)
      const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
      rows.push({
        _rowKey: 'ct-total',
        s_name: '合计',
        s_country_code: '',
        revenue: sumR,
        percent: 100,
        n_impression: sumI,
        d_ecpm: iaaWeightedEcpm(iaaCountryRows.value),
        n_users: sumU,
        d_mom_pct: 0
      })
      return rows
    }
    const rows = iaaVersionRows.value.map((r) => ({
      _rowKey: `ver-${r.s_app_version}`,
      s_name: r.s_app_version,
      revenue: r.revenue,
      percent: r.percent,
      n_impression: r.n_impression,
      d_ecpm: r.d_ecpm,
      n_users: Number((r as any)?.n_users ?? (r as any)?.users ?? r.n_dau ?? 0),
      n_dau: r.n_dau,
      is_current: r.is_current
    }))
    const sumR = rows.reduce((a, r) => a + r.revenue, 0)
    const sumDau = rows.reduce((a, r) => a + r.n_dau, 0)
    const sumUsers = rows.reduce((a, r) => a + Number(r.n_users || 0), 0)
    const sumI = rows.reduce((a, r) => a + r.n_impression, 0)
    rows.push({
      _rowKey: 'ver-total',
      s_name: '合计',
      revenue: sumR,
      percent: 100,
      n_impression: sumI,
      d_ecpm: iaaWeightedEcpm(iaaVersionRows.value),
      n_users: sumUsers,
      n_dau: sumDau,
      is_current: false
    })
    return rows
  })

  function iaaFmtRevenue(row: { revenue: number; s_name?: string }) {
    return `$${formatMoneyInt(row.revenue)}`
  }

  function iaaRowClassName({ row }: { row: { s_name?: string; is_current?: boolean } }) {
    if (row.s_name === '合计') return 'is-iaa-total'
    if (row.is_current) return 'is-iaa-current'
    return ''
  }

  const iapRowsWithTotal = computed(() => {
    const rows = [...iapProductRows.value]
    const sumRevenue = rows.reduce((acc, r) => acc + r.revenue, 0)
    const sumTimes = rows.reduce((acc, r) => acc + r.n_buy_times, 0)
    const avgArppu = rows.length ? rows.reduce((acc, r) => acc + r.d_arppu, 0) / rows.length : 0
    const avgRate = rows.length
      ? rows.reduce((acc, r) => acc + r.d_purchase_rate, 0) / rows.length
      : 0
    rows.push({
      s_product: '合计',
      s_type: '订阅',
      revenue: sumRevenue,
      percent: 100,
      n_buy_times: sumTimes,
      n_users: rows.reduce((acc, r) => acc + r.n_users, 0),
      d_arppu: avgArppu,
      d_purchase_rate: avgRate
    })
    return rows
  })

  const iapChannelRowsWithTotal = computed(() => {
    const rows = [...iapChannelRows.value]
    const sumRev = rows.reduce((a, r) => a + r.revenue, 0)
    const sumOrders = rows.reduce((a, r) => a + r.n_orders, 0)
    const sumPct = rows.reduce((a, r) => a + r.percent, 0)
    const n = rows.length
    rows.push({
      s_channel_name: '合计',
      revenue: sumRev,
      percent: sumPct,
      n_orders: sumOrders,
      d_arppu: n ? rows.reduce((a, r) => a + r.d_arppu, 0) / n : 0,
      d_conversion_rate: n ? rows.reduce((a, r) => a + r.d_conversion_rate, 0) / n : 0,
      d_refund_rate: n ? rows.reduce((a, r) => a + r.d_refund_rate, 0) / n : 0
    })
    return rows
  })

  function iapChannelRowClassName({ row }: { row: { s_channel_name?: string } }) {
    return row?.s_channel_name === '合计' ? 'is-iap-channel-total' : ''
  }

  const iaaHeaderCellStyle = {
    color: 'var(--rev-muted)',
    fontSize: '12px',
    padding: '6px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iaaCellStyle = {
    background: 'transparent',
    color: 'var(--rev-text)',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iaaColumns = computed<ColumnOption[]>(() => {
    const tab = iaaTab.value
    const dimLabel =
      tab === 'ad_type'
        ? '广告类型'
        : tab === 'platform'
          ? '广告平台'
          : tab === 'ad_unit'
            ? '广告位'
            : tab === 'country'
              ? '国家'
              : '版本'

    const baseDim: ColumnOption = {
      label: dimLabel,
      prop: 's_name',
      minWidth: 100,
      useSlot: true,
      showOverflowTooltip: true
    }

    if (tab === 'ad_type') {
      return [
        baseDim,
        { label: '收入', prop: 'revenue', minWidth: 72, useSlot: true, showOverflowTooltip: true },
        {
          label: '占比',
          prop: 'percent',
          minWidth: 64,
          showOverflowTooltip: true,
          formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
        },
        {
          label: '广告用户',
          prop: 'n_users',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_users)
        },
        {
          label: '展示次数',
          prop: 'n_impression',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_impression)
        },
        {
          label: '平均展示',
          prop: 'd_avg_display',
          minWidth: 80,
          showOverflowTooltip: true,
          formatter: (row: any) => formatFixed(row.d_avg_display, 1)
        },
        {
          label: '平均收入',
          prop: 'd_avg_revenue',
          minWidth: 88,
          showOverflowTooltip: true,
          formatter: (row: any) => `$${formatFixed(row.d_avg_revenue, 3)}`
        }
      ]
    }

    if (tab === 'platform') {
      return [
        baseDim,
        { label: '收入', prop: 'revenue', minWidth: 80, useSlot: true, showOverflowTooltip: true },
        {
          label: '占比',
          prop: 'percent',
          minWidth: 64,
          showOverflowTooltip: true,
          formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
        },
        {
          label: '展示数',
          prop: 'n_impression',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_impression)
        },
        {
          label: '平均 eCPM',
          prop: 'd_ecpm',
          minWidth: 88,
          showOverflowTooltip: true,
          formatter: (row: any) => `$${formatFixed(row.d_ecpm, 2)}`
        },
        {
          label: '广告用户',
          prop: 'n_users',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_users)
        }
      ]
    }

    if (tab === 'ad_unit') {
      return [
        baseDim,
        { label: '收入', prop: 'revenue', minWidth: 80, useSlot: true, showOverflowTooltip: true },
        {
          label: '占比',
          prop: 'percent',
          minWidth: 64,
          showOverflowTooltip: true,
          formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
        },
        {
          label: '展示数',
          prop: 'n_impression',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_impression)
        },
        {
          label: '平均 eCPM',
          prop: 'd_ecpm',
          minWidth: 88,
          showOverflowTooltip: true,
          formatter: (row: any) => `$${formatFixed(row.d_ecpm, 2)}`
        },
        {
          label: '广告用户',
          prop: 'n_users',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_users)
        }
      ]
    }

    if (tab === 'country') {
      return [
        baseDim,
        { label: '收入', prop: 'revenue', minWidth: 80, useSlot: true, showOverflowTooltip: true },
        {
          label: '占比',
          prop: 'percent',
          minWidth: 64,
          showOverflowTooltip: true,
          formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
        },
        {
          label: '展示数',
          prop: 'n_impression',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_impression)
        },
        {
          label: '平均 eCPM',
          prop: 'd_ecpm',
          minWidth: 88,
          showOverflowTooltip: true,
          formatter: (row: any) => `$${formatFixed(row.d_ecpm, 2)}`
        },
        {
          label: '广告用户',
          prop: 'n_users',
          minWidth: 84,
          showOverflowTooltip: true,
          formatter: (row: any) => formatInt(row.n_users)
        },
        { label: '环比', prop: 'd_mom_pct', minWidth: 92, useSlot: true, showOverflowTooltip: true }
      ]
    }

    return [
      baseDim,
      { label: '收入', prop: 'revenue', minWidth: 80, useSlot: true, showOverflowTooltip: true },
      {
        label: '占比',
        prop: 'percent',
        minWidth: 64,
        showOverflowTooltip: true,
        formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
      },
      {
        label: '展示数',
        prop: 'n_impression',
        minWidth: 84,
        showOverflowTooltip: true,
        formatter: (row: any) => formatInt(row.n_impression)
      },
      {
        label: '平均 eCPM',
        prop: 'd_ecpm',
        minWidth: 88,
        showOverflowTooltip: true,
        formatter: (row: any) => `$${formatFixed(row.d_ecpm, 2)}`
      },
      {
        label: 'DAU',
        prop: 'n_dau',
        minWidth: 80,
        showOverflowTooltip: true,
        formatter: (row: any) => formatInt(row.n_dau)
      },
      {
        label: '广告用户',
        prop: 'n_users',
        minWidth: 84,
        showOverflowTooltip: true,
        formatter: (row: any) => formatInt(row.n_users)
      }
    ]
  })

  const iapHeaderCellStyle = {
    color: 'var(--rev-muted)',
    fontSize: '12px',
    padding: '6px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iapCellStyle = {
    background: 'transparent',
    color: 'var(--rev-text)',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const iapColumns = computed<ColumnOption[]>(() => [
    { label: '商品', prop: 's_product', minWidth: 60, fixed: 'left', showOverflowTooltip: true },
    { label: '类型', prop: 's_type', minWidth: 60, fixed: 'left', showOverflowTooltip: true },
    {
      label: '价格',
      prop: 'd_arppu',
      minWidth: 60,
      showOverflowTooltip: true,
      formatter: (row: any) => `$${formatFixed(row.d_arppu, 2)}`
    },
    {
      label: '购买次数',
      prop: 'n_buy_times',
      minWidth: 80,
      showOverflowTooltip: true,
      formatter: (row: any) => formatInt(row.n_buy_times)
    },
    {
      label: '收入',
      prop: 'revenue',
      minWidth: 70,
      showOverflowTooltip: true,
      formatter: (row: any) => `$${formatFixed(row.revenue, 2)}`
    },
    {
      label: '占比',
      prop: 'percent',
      minWidth: 60,
      showOverflowTooltip: true,
      formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
    },
    {
      label: '购买率',
      prop: 'd_purchase_rate',
      minWidth: 60,
      useSlot: true,
      showOverflowTooltip: true
    }
  ])

  const iapChannelColumns = computed<ColumnOption[]>(() => [
    { label: '广告平台', prop: 's_channel_name', minWidth: 100, showOverflowTooltip: true },
    { label: '收入', prop: 'revenue', minWidth: 72, useSlot: true, showOverflowTooltip: true },
    {
      label: '占比',
      prop: 'percent',
      minWidth: 70,
      showOverflowTooltip: true,
      formatter: (row: any) => `${Number(row.percent).toFixed(1)}%`
    },
    {
      label: '订单数',
      prop: 'n_orders',
      minWidth: 72,
      showOverflowTooltip: true,
      formatter: (row: any) => formatInt(row.n_orders)
    },
    {
      label: 'ARPPU',
      prop: 'd_arppu',
      minWidth: 72,
      showOverflowTooltip: true,
      formatter: (row: any) => `$${formatFixed(row.d_arppu, 2)}`
    },
    {
      label: '转化率',
      prop: 'd_conversion_rate',
      minWidth: 88,
      useSlot: true,
      showOverflowTooltip: true
    },
    {
      label: '退款率',
      prop: 'd_refund_rate',
      minWidth: 88,
      useSlot: true,
      showOverflowTooltip: true
    }
  ])

  const top5HeaderCellStyle = {
    color: 'var(--rev-muted)',
    fontSize: '12px',
    padding: '6px 0',
    background: 'rgba(0,0,0,0.18)',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  const top5CellStyle = {
    background: 'transparent',
    color: 'var(--rev-text)',
    fontSize: '12px',
    padding: '6px 0',
    borderBottom: '1px solid var(--rev-border-soft)'
  } as const

  function top5RowClassName({ row }: { row: { s_country_code?: string } }) {
    return row?.s_country_code === 'ALL' ? 'is-subtotal' : ''
  }

  const top5Columns = computed<ColumnOption[]>(() => {
    const pctFmt = (row: { percent: number }) => `${Number(row.percent).toFixed(1)}%`

    if (top5Tab.value === 'total') {
      return [
        { label: '国家', prop: 's_country_name', minWidth: 100, useSlot: true },
        {
          label: 'IAA收入',
          prop: 'iaa',
          minWidth: 90,
          'class-name': 'col-iaa',
          formatter: (row: any) => `$${formatMoneyInt(row.iaa)}`
        },
        {
          label: 'IAP收入',
          prop: 'iap',
          minWidth: 90,
          'class-name': 'col-iap',
          formatter: (row: any) => `$${formatFixed(row.iap, 1)}`
        },
        {
          label: '合计',
          prop: 'total',
          minWidth: 90,
          formatter: (row: any) => `$${formatMoneyInt(row.total)}`
        },
        {
          label: '占比',
          prop: 'percent',
          minWidth: 70,
          formatter: (row: any) => pctFmt(row)
        }
      ]
    }
    if (top5Tab.value === 'iaa') {
      return [
        { label: '国家', prop: 's_country_name', minWidth: 100, useSlot: true },
        {
          label: 'IAA收入',
          prop: 'iaa',
          minWidth: 90,
          'class-name': 'col-iaa',
          formatter: (row: any) => `$${formatMoneyInt(row.iaa)}`
        },
        {
          label: '占比',
          prop: 'percent',
          minWidth: 70,
          formatter: (row: any) => pctFmt(row)
        }
      ]
    }
    return [
      { label: '国家', prop: 's_country_name', minWidth: 100, useSlot: true },
      {
        label: 'IAP收入',
        prop: 'iap',
        minWidth: 90,
        'class-name': 'col-iap',
        formatter: (row: any) => `$${formatFixed(row.iap, 1)}`
      },
      {
        label: '占比',
        prop: 'percent',
        minWidth: 70,
        formatter: (row: any) => pctFmt(row)
      }
    ]
  })

  const topCountriesWithTotal = computed(() => {
    const tab = top5Tab.value
    const base = [...topCountries.value]
    const sortKey: 'total' | 'iaa' | 'iap' = tab === 'iaa' ? 'iaa' : tab === 'iap' ? 'iap' : 'total'
    base.sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]))

    if (tab === 'total') {
      const rows = [...base]
      const sumIaa = rows.reduce((acc, r) => acc + r.iaa, 0)
      const sumIap = rows.reduce((acc, r) => acc + r.iap, 0)
      const sumTotal = rows.reduce((acc, r) => acc + r.total, 0)
      rows.push({
        s_country_name: '小计',
        s_country_code: 'ALL',
        iaa: sumIaa,
        iap: sumIap,
        total: sumTotal,
        percent: rows.reduce((acc, r) => acc + r.percent, 0)
      })
      return rows
    }

    if (tab === 'iaa') {
      const sumIaa = base.reduce((acc, r) => acc + r.iaa, 0)
      const rows = base.map((r) => ({
        ...r,
        percent: sumIaa > 0 ? (r.iaa / sumIaa) * 100 : 0
      }))
      rows.push({
        s_country_name: '小计',
        s_country_code: 'ALL',
        iaa: sumIaa,
        iap: base.reduce((a, r) => a + r.iap, 0),
        total: base.reduce((a, r) => a + r.total, 0),
        percent: 100
      })
      return rows
    }

    const sumIap = base.reduce((acc, r) => acc + r.iap, 0)
    const rows = base.map((r) => ({
      ...r,
      percent: sumIap > 0 ? (r.iap / sumIap) * 100 : 0
    }))
    rows.push({
      s_country_name: '小计',
      s_country_code: 'ALL',
      iaa: base.reduce((a, r) => a + r.iaa, 0),
      iap: sumIap,
      total: base.reduce((a, r) => a + r.total, 0),
      percent: 100
    })
    return rows
  })

  function flagEmojiByCode(code: string) {
    const upper = String(code || '').toUpperCase()
    if (upper === 'ALL') return '🏳️'
    if (!/^[A-Z]{2}$/.test(upper)) return '🏳️'
    const base = 0x1f1e6
    const chars = [...upper].map((c) => String.fromCodePoint(base + (c.charCodeAt(0) - 65)))
    return chars.join('')
  }

  function getVar(el: HTMLElement | null, name: string, fallback: string) {
    const root = el ?? document.documentElement
    const v = getComputedStyle(root).getPropertyValue(name).trim()
    return v || fallback
  }

  // --- KPI sparkline 已拆至 modules/revenue-kpi-spark.vue（在子组件 setup 内注册 useChart，避免 await 后调用触发 Vue 警告）---

  // --- 图表：趋势 / 饼图 / eCPM / IAA 构成 ---
  const trend7dRef = ref<HTMLElement>()
  const pieRef = ref<HTMLElement>()
  const ecpmRef = ref<HTMLElement>()
  const iaaDonutRef = ref<HTMLElement>()
  const iaaVersionBarRef = ref<HTMLElement>()
  const iapTrendRef = ref<HTMLElement>()

  const chartTrend7d = useChart({ autoTheme: true })
  const chartPie = useChart({ autoTheme: true })
  const chartEcpm = useChart({ autoTheme: true })
  const chartIaaDonut = useChart({ autoTheme: true })
  const chartIaaVersion = useChart({ autoTheme: true })
  const chartIapTrend = useChart({ autoTheme: true })
  const iaaDonutInited = ref(false)
  const iaaVersionInited = ref(false)
  const iapTrendInited = ref(false)

  function buildTrend7dOption(): EChartsOption {
    const el = trend7dRef.value ?? null
    const axis = getVar(el, '--rev-chart-axis', '#94a3b8')
    const split = getVar(el, '--rev-chart-split', 'rgba(255,255,255,0.08)')
    const teal = getVar(el, '--rev-c-teal', '#20d6b5')
    const purple = getVar(el, '--rev-c-purple', '#a78bfa')

    return {
      tooltip: chartTrend7d.getTooltipStyle('axis'),
      grid: { left: 38, right: 18, top: 18, bottom: 26, containLabel: true },
      xAxis: {
        type: 'category',
        data: trend7dDateLabels.value,
        axisLine: { lineStyle: { color: axis } },
        axisLabel: { color: axis, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: axis, fontSize: 11 },
          splitNumber: 8,
          splitLine: { lineStyle: { color: split } }
        },
        {
          type: 'value',
          axisLine: { show: false },
          axisLabel: { color: axis, fontSize: 11 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'IAA',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...trend7dSeries.value.iaa],
          lineStyle: { color: teal, width: 2 },
          itemStyle: { color: teal },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: teal },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.18
          }
        },
        {
          name: 'IAP',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          data: [...trend7dSeries.value.iap],
          lineStyle: { color: purple, width: 2 },
          itemStyle: { color: purple },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: purple },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.12
          }
        }
      ]
    }
  }

  function buildIapTrendOption(): EChartsOption {
    const el = iapTrendRef.value ?? null
    const axis = getVar(el, '--rev-chart-axis', '#94a3b8')
    const split = getVar(el, '--rev-chart-split', 'rgba(255,255,255,0.08)')
    const purple = getVar(el, '--rev-c-purple', '#a78bfa')
    const amber = getVar(el, '--rev-c-amber', '#f59e0b')

    const revData = [...iapTrendSeries.value.revenue]
    const orderData = [...iapTrendSeries.value.orders]

    return {
      tooltip: {
        ...chartIapTrend.getTooltipStyle('axis'),
        formatter: (params: unknown) => {
          const list = Array.isArray(params) ? params : [params]
          const first = list[0] as { axisValue?: string } | undefined
          const head = first?.axisValue ?? ''
          const lines = list.map((p: any) => {
            const n = Number(p?.value ?? 0)
            const name = String(p?.seriesName ?? '')
            if (name.includes('收入')) return `${name}: $${formatFixed(n, 0)}`
            return `${name}: ${formatInt(n)}`
          })
          return `${head}<br/>${lines.join('<br/>')}`
        }
      },
      legend: {
        show: true,
        top: 0,
        right: 4,
        itemWidth: 8,
        itemHeight: 8,
        textStyle: { color: axis, fontSize: 10 }
      },
      grid: { left: 34, right: 30, top: 42, bottom: 20, containLabel: true },
      xAxis: {
        type: 'category',
        data: [...iapTrendDateLabels.value],
        axisLine: { lineStyle: { color: axis } },
        axisLabel: { color: axis, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: [
        {
          type: 'value',
          name: '收入(USD)',
          nameTextStyle: { color: purple, fontSize: 11 },
          axisLine: { show: false },
          axisLabel: {
            color: purple,
            fontSize: 11,
            formatter: (v: number) => `$${formatFixed(v, 0)}`
          },
          splitLine: { lineStyle: { color: split } }
        },
        {
          type: 'value',
          name: '订单数',
          nameTextStyle: { color: axis, fontSize: 11 },
          axisLine: { show: false },
          axisLabel: { color: axis, fontSize: 11, formatter: (v: number) => formatInt(v) },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '收入(USD)',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: revData,
          yAxisIndex: 0,
          lineStyle: { color: purple, width: 2 },
          itemStyle: { color: purple },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: purple },
              { offset: 1, color: 'rgba(0,0,0,0)' }
            ]),
            opacity: 0.2
          }
        },
        {
          name: '订单数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          yAxisIndex: 1,
          data: orderData,
          lineStyle: { color: amber, width: 2, type: 'dashed' },
          itemStyle: { color: amber }
        }
      ]
    }
  }

  function buildEcpmOption(): EChartsOption {
    const el = ecpmRef.value ?? null
    const axis = getVar(el, '--rev-chart-axis', '#94a3b8')
    const split = getVar(el, '--rev-chart-split', 'rgba(255,255,255,0.08)')
    const amber = getVar(el, '--rev-c-amber', '#f59e0b')
    const cyan = getVar(el, '--rev-c-cyan', '#38bdf8')

    return {
      tooltip: chartEcpm.getTooltipStyle('axis'),
      grid: { left: 34, right: 16, top: 16, bottom: 22, containLabel: true },
      xAxis: {
        type: 'category',
        data: ecpmDateLabels.value,
        axisLine: { lineStyle: { color: axis } },
        axisLabel: { color: axis, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: axis, fontSize: 11 },
        splitLine: { lineStyle: { color: split } }
      },
      series: [
        {
          name: '预估 eCPM',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...ecpmSeries.value.predicted],
          lineStyle: { color: amber, width: 2, type: 'dashed' },
          itemStyle: { color: amber }
        },
        {
          name: '真实 eCPM',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...ecpmSeries.value.actual],
          lineStyle: { color: cyan, width: 2 },
          itemStyle: { color: cyan }
        }
      ]
    }
  }

  function buildPieOption(): EChartsOption {
    const el = pieRef.value ?? null
    const muted = getVar(el, '--rev-muted', '#94a3b8')
    const slices = platformPie.value
    const rich: Record<string, { color: string }> = {}
    slices.forEach((s, i) => {
      rich[`c${i}`] = { color: s.color }
    })

    return {
      tooltip: chartPie.getTooltipStyle('item', {
        formatter: (p: any) => {
          const name = p?.name ?? ''
          const val = Number(p?.value ?? 0)
          return `${name}<br/>占比 ${val.toFixed(1)}%`
        }
      }),
      series: [
        {
          type: 'pie',
          radius: ['62%', '84%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              const i = params.dataIndex ?? 0
              const pct = params.percent?.toFixed(1) ?? 0
              return `{c${i}|${pct}%}`
            },
            rich,
            fontSize: 12
          },
          labelLine: {
            show: true,
            lineStyle: { color: muted },
            length: 8,
            length2: 6
          },
          data: slices.map((s) => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color }
          }))
        }
      ]
    }
  }

  function buildIaaDonutOption(): EChartsOption {
    const rows = iaaAdUnitRows.value
    const colors = IAA_COLORS
    return {
      tooltip: chartIaaDonut.getTooltipStyle('item', {
        formatter: (p: any) => {
          const name = p?.name ?? ''
          const v = Number(p?.value ?? 0)
          return `${name}<br/>$${formatMoneyInt(v)}`
        }
      }),
      series: [
        {
          type: 'pie',
          radius: ['60%', '92%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: rows.map((r, i) => ({
            name: r.s_ad_unit_name,
            value: r.revenue,
            itemStyle: { color: colors[i % colors.length] }
          }))
        }
      ]
    }
  }

  function buildIaaVersionBarOption(): EChartsOption {
    const el = iaaVersionBarRef.value ?? null
    const axis = getVar(el, '--rev-chart-axis', '#94a3b8')
    const split = getVar(el, '--rev-chart-split', 'rgba(255,255,255,0.08)')
    const teal = getVar(el, '--rev-c-teal', '#20d6b5')
    const rows = iaaVersionRows.value
    return {
      tooltip: chartIaaVersion.getTooltipStyle('axis'),
      grid: { left: 6, right: 10, top: 22, bottom: 30, containLabel: true },
      xAxis: {
        type: 'category',
        data: rows.map((r) => r.s_app_version),
        axisLine: { lineStyle: { color: axis } },
        axisLabel: { color: axis, fontSize: 10 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: 'USD',
        nameTextStyle: { color: axis, fontSize: 10 },
        axisLine: { show: false },
        axisLabel: { color: axis, fontSize: 10 },
        splitLine: { lineStyle: { color: split } }
      },
      series: [
        {
          type: 'bar',
          data: rows.map((r) => r.revenue),
          barWidth: 22,
          itemStyle: {
            color: new graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: teal },
              { offset: 1, color: 'rgba(32,214,181,0.25)' }
            ])
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 12,
              shadowColor: 'rgba(32,214,181,0.45)'
            }
          },
          label: {
            show: true,
            position: 'top',
            color: axis,
            fontSize: 10,
            formatter: (p: any) => `$${formatMoneyInt(Number(p.value))}`
          }
        }
      ]
    }
  }

  async function syncIaaCharts() {
    await nextTick()
    if (iaaTab.value === 'ad_unit' && iaaDonutRef.value) {
      chartIaaDonut.chartRef!.value = iaaDonutRef.value
      if (!iaaDonutInited.value) {
        chartIaaDonut.initChart(buildIaaDonutOption())
        iaaDonutInited.value = true
      } else {
        chartIaaDonut.updateChart(buildIaaDonutOption())
      }
      requestAnimationFrame(() => {
        chartIaaDonut.handleResize()
      })
    }
    if (iaaTab.value === 'version' && iaaVersionBarRef.value) {
      chartIaaVersion.chartRef!.value = iaaVersionBarRef.value
      if (!iaaVersionInited.value) {
        chartIaaVersion.initChart(buildIaaVersionBarOption())
        iaaVersionInited.value = true
      } else {
        chartIaaVersion.updateChart(buildIaaVersionBarOption())
      }
      requestAnimationFrame(() => {
        chartIaaVersion.handleResize()
      })
    }
  }

  // function onExport() {
  //   // Mock 页面：仅模拟交互
  //   // 后端接入后在 api 层实现导出

  //   console.log('[RevenueOverview] export', { ...filters })
  // }

  async function syncIapTrendChart() {
    await nextTick()
    if (iapTab.value !== 'trend' || !iapTrendRef.value) return
    chartIapTrend.chartRef!.value = iapTrendRef.value
    if (!iapTrendInited.value) {
      chartIapTrend.initChart(buildIapTrendOption())
      iapTrendInited.value = true
    } else {
      chartIapTrend.updateChart(buildIapTrendOption())
    }
    requestAnimationFrame(() => {
      chartIapTrend.handleResize()
    })
  }

  async function initCharts() {
    await nextTick()

    if (trend7dRef.value) {
      chartTrend7d.chartRef!.value = trend7dRef.value
      chartTrend7d.initChart(buildTrend7dOption())
    }
    if (ecpmRef.value) {
      chartEcpm.chartRef!.value = ecpmRef.value
      chartEcpm.initChart(buildEcpmOption())
    }
    if (pieRef.value) {
      chartPie.chartRef!.value = pieRef.value
      chartPie.initChart(buildPieOption())
    }
    await syncIaaCharts()
    await syncIapTrendChart()
  }

  onMounted(() => {
    void (async () => {
      pageLoading.value = true
      resetViewDataBeforeLoad()
      await loadMetaFilterOptions()
      applyDraftFilters()
      await Promise.all([
        loadOverviewKpis(),
        loadIaaAdTypeRows(),
        loadIapProductRows(),
        loadTrend7dIaaIap(),
        loadTrend7dEcpm(),
        loadPlatformPie(),
        loadTopCountries(),
        loadAiInsight()
      ])
      pageLoading.value = false
      await nextTick()
      initCharts()
    })()
  })

  watch(iaaTab, async () => {
    if (iaaTab.value === 'ad_type') await loadIaaAdTypeRows()
    if (iaaTab.value === 'platform') await loadIaaPlatformRows()
    if (iaaTab.value === 'ad_unit') await loadIaaAdUnitRows()
    if (iaaTab.value === 'country') await loadIaaCountryRows()
    if (iaaTab.value === 'version') await loadIaaVersionRows()
    await syncIaaCharts()
  })

  watch(iapTab, () => {
    if (iapTab.value === 'product') void loadIapProductRows()
    if (iapTab.value === 'channel') void loadIapChannelRows()
    if (iapTab.value === 'trend') void loadIapTrendRows()
    void syncIapTrendChart()
  })

  onUnmounted(() => {
    chartTrend7d.destroyChart?.()
    chartEcpm.destroyChart?.()
    chartPie.destroyChart?.()
    chartIaaDonut.destroyChart?.()
    chartIaaVersion.destroyChart?.()
    chartIapTrend.destroyChart?.()
  })
</script>

<style scoped lang="scss">
  @use '../../user-growth/ad-performance/styles/ap-card-fx.scss' as ap;

  /* 背景与主题变量在外层 root，保证铺满可视区；内层 scale 后视觉缩小，不再依赖透明底露边 */
  .revenue-overview-root.revenue-overview-page {
    /* 默认深色（对齐原型），在 light 模式覆盖 */
    --rev-bg: #0f1419;
    --rev-panel-bg: #0b0f14;
    --rev-border: rgb(51 65 85 / 100%);
    --rev-border-soft: rgb(148 163 184 / 22%);
    --rev-text: #e2e8f0;
    --rev-muted: #94a3b8;
    --rev-pill: rgb(51 65 85 / 100%);
    --rev-pill-border: rgb(51 65 85 / 100%);
    --rev-chart-axis: rgb(148 163 184 / 95%);
    --rev-chart-split: rgb(255 255 255 / 7%);
    --rev-c-blue: #60a5fa;
    --rev-c-teal: #20d6b5;
    --rev-c-purple: #a78bfa;
    --rev-c-amber: #f59e0b;
    --rev-c-green: #22c55e;
    --rev-c-indigo: #38bdf8;
    --rev-c-cyan: #38bdf8;

    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: var(--art-full-height, calc(100vh - 120px));
    min-height: var(--art-full-height, calc(100vh - 120px));
    padding: 14px 14px 0;
    overflow: clip auto;
    color: var(--rev-text);
    background: var(--rev-bg);
    border-radius: 12px;

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(ellipse 70% 50% at 6% 6%, rgb(16 185 129 / 38%) 0%, transparent 58%),
        radial-gradient(ellipse 55% 42% at 94% 8%, rgb(59 130 246 / 36%) 0%, transparent 58%),
        radial-gradient(ellipse 40% 35% at 48% 18%, rgb(168 85 247 / 16%) 0%, transparent 55%);
      mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 58%);
      animation: rev-ap-aurora-drift 14s ease-in-out infinite alternate;
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(rgb(186 230 253 / 5%) 1px, transparent 1px),
        linear-gradient(90deg, rgb(186 230 253 / 5%) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: linear-gradient(to bottom, black 0%, black 18%, transparent 45%);
    }

    > .revenue-overview-wrap {
      position: relative;
      z-index: 1;
    }
  }

  .revenue-overview-wrap {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    isolation: isolate;
  }

  .rev-page-fx {
    position: absolute;
    inset: -10% -10% 45%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      rgb(59 130 246 / 12%) 55deg,
      rgb(6 182 212 / 8%) 80deg,
      transparent 130deg,
      rgb(16 185 129 / 10%) 200deg,
      transparent 285deg,
      rgb(168 85 247 / 8%) 330deg,
      transparent 360deg
    );
    opacity: 0.82;
    mask-image: linear-gradient(to bottom, black 0%, black 48%, transparent 82%);
    animation: rev-ap-fx-spin 50s linear infinite;
    will-change: transform;
  }

  .revenue-overview-wrap > *:not(.rev-page-fx) {
    position: relative;
    z-index: 1;
  }

  @keyframes rev-ap-aurora-drift {
    0% {
      opacity: 0.75;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1%, -0.8%);
    }
  }

  @keyframes rev-ap-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .rev-entry-1 {
    animation: rev-ap-slide-up 0.55s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.04s;
  }

  .rev-entry-2 {
    animation: rev-ap-slide-up 0.58s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.12s;
  }

  .rev-entry-3 {
    animation: rev-ap-slide-up 0.62s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)) both;
    animation-delay: 0.2s;
  }

  @keyframes rev-ap-slide-up {
    from {
      opacity: 0;
      transform: translateY(18px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rev-skeleton-orbit {
    0%,
    100% {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 18%),
        0 0 26px rgb(59 130 246 / 10%);
    }

    50% {
      box-shadow:
        0 0 0 1px rgb(96 165 250 / 38%),
        0 0 42px rgb(59 130 246 / 20%),
        0 0 72px rgb(6 182 212 / 10%);
    }
  }

  :global(html:not(.dark) .revenue-overview-page) {
    --rev-bg: #f7f9fc;
    --rev-panel-bg: #fff;
    --rev-border: rgb(15 23 42 / 14%);
    --rev-border-soft: rgb(15 23 42 / 8%);
    --rev-text: #0f172a;
    --rev-muted: #64748b;
    --rev-pill: rgb(15 23 42 / 6%);
    --rev-pill-border: rgb(15 23 42 / 8%);
    --rev-chart-axis: rgb(100 116 139 / 95%);
    --rev-chart-split: rgb(15 23 42 / 8%);
  }

  .rev-header {
    // display: flex;
    // gap: 12px;
    // align-items: center;
    // justify-content: space-between;
    padding: 0 0 10px;
    margin-bottom: 12px;
  }

  .rev-header__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }

  .rev-filter-panel {
    position: relative;
    padding: 10px 14px;
    overflow: hidden;
    border-radius: 16px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;

    transition:
      box-shadow 0.35s var(--ease-out, cubic-bezier(0, 0, 0.2, 1)),
      border-color 0.3s var(--ease-default, cubic-bezier(0.4, 0, 0.2, 1));

    &:hover {
      border-color: rgb(96 165 250 / 48%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 44%),
        0 0 0 1px rgb(96 165 250 / 22%),
        inset 0 1px 0 rgb(186 230 253 / 16%),
        0 0 48px rgb(59 130 246 / 14%);
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  :global(html:not(.dark) .rev-filter-panel) {
    background: linear-gradient(148deg, rgb(255 255 255 / 98%), rgb(248 250 252 / 99%));
    border: 1px solid var(--rev-border-soft);
    box-shadow: 0 10px 32px rgb(15 23 42 / 7%);

    &:hover {
      border-color: rgb(59 130 246 / 22%);
      box-shadow: 0 12px 36px rgb(15 23 42 / 10%);
    }
  }

  :global(html.dark .rev-filter-panel .rev-pill) {
    background: rgb(15 23 42 / 0%);
    border-color: rgb(96 165 250 / 26%);
    box-shadow: 0 0 0 0 rgb(59 130 246 / 8%) inset;
  }

  .rev-filter-panel :deep(.rev-select .el-select__wrapper) {
    min-height: 36px;
    padding: 0 10px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  .rev-filter-panel :deep(.rev-date .el-input__wrapper) {
    min-height: 36px;
    padding: 0 10px;
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    border-radius: var(--el-border-radius-base, 4px);
    box-shadow: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  :global(html:not(.dark) .rev-filter-panel) :deep(.rev-select .el-select__wrapper),
  :global(html:not(.dark) .rev-filter-panel) :deep(.rev-date .el-input__wrapper) {
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
  }

  .rev-filter-panel :deep(.rev-select .el-select__wrapper:hover),
  .rev-filter-panel :deep(.rev-date .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  .rev-filter-panel :deep(.rev-select .el-select__wrapper.is-focused),
  .rev-filter-panel :deep(.rev-date .el-input__wrapper.is-focus),
  .rev-filter-panel :deep(.rev-date .el-input__wrapper:focus-within) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .rev-filter-panel :deep(.rev-query-btn.el-button) {
    height: 36px;
    padding: 0 18px;
    font-weight: 600;
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  .rev-filter-panel :deep(.rev-query-btn.el-button:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent);
  }

  :global(html:not(.dark) .rev-filter-panel) :deep(.rev-query-btn.el-button) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
    background: color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 6%, transparent);
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
    box-shadow: none;
  }

  :global(html:not(.dark) .rev-filter-panel) :deep(.rev-query-btn.el-button:hover) {
    filter: brightness(1.06);
  }

  .rev-pill {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    height: 36px;
    padding: 0 10px;
    color: var(--rev-text);
    background: var(--rev-pill);
    border: 0 solid var(--rev-pill-border);
    border-radius: 14px;
  }

  .rev-pill__k {
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-pill--app-multi {
    align-items: center;
  }

  .rev-filter-panel :deep(.rev-app-platform-select) {
    flex: 1;
    min-width: 220px;
    max-width: 320px;
  }

  .rev-export {
    height: 36px;
    padding: 0 14px;
    font-size: 14px;
    color: var(--rev-text);
    cursor: pointer;
    background: var(--rev-pill);
    border: 1px solid var(--rev-pill-border);
    border-radius: 8px;
  }

  .rev-export:hover {
    filter: brightness(1.06);
  }

  .rev-query-btn {
    height: 36px;
    padding: 0 14px;
    color: var(--rev-text);
    background: var(--rev-pill);
    border: 1px solid var(--rev-pill-border);
    border-radius: 9999px;
  }

  .rev-query-btn:hover {
    filter: brightness(1.06);
  }

  :deep(.rev-query-btn.el-button) {
    background: var(--rev-pill);
    border-color: var(--rev-pill-border);
  }

  .rev-skeleton {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .rev-skeleton__kpis {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  .rev-skeleton__kpi {
    display: flex;
    flex-direction: column;
    gap: 10px;
    height: 120px;
    padding: 12px;
    background: var(--rev-pill);
    border: 1px solid var(--rev-pill-border);
    border-radius: 14px;
  }

  .rev-skeleton__main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    height: 760px;
    border-radius: 16px;
  }

  .rev-skeleton__block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 14px;
    background: var(--rev-panel-bg);
    border: 1px solid var(--rev-border-soft);
    border-radius: 16px;
  }

  .rev-skeleton__kpi-sub {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .rev-skeleton__line {
    height: 12px;
  }

  .rev-skeleton__line--sm {
    width: 40%;
  }

  .rev-skeleton__line--md {
    width: 48%;
  }

  .rev-skeleton__line--lg {
    width: 72%;
    height: 18px;
  }

  .rev-skeleton--fx .rev-skeleton__kpi {
    animation: rev-skeleton-orbit 2.5s ease-in-out infinite;
  }

  .rev-skeleton--fx .rev-skeleton__kpi:nth-child(odd) {
    animation-delay: 0.12s;
  }

  .rev-skeleton--fx .rev-skeleton__block {
    animation: rev-skeleton-orbit 2.8s ease-in-out infinite;
  }

  .rev-skeleton--fx .rev-skeleton__block:nth-child(3n) {
    animation-delay: 0.2s;
  }

  .rev-select,
  .rev-date {
    width: 140px;
  }

  :deep(.rev-select .el-select__wrapper) {
    min-height: 36px;
    padding: 0 10px;
  }

  :deep(.rev-date .el-input__wrapper) {
    min-height: 36px;
    padding: 0 10px;
  }

  :deep(.rev-date .el-input__inner) {
    color: var(--rev-text);
  }

  :deep(.rev-select .el-select__selected-item),
  :deep(.rev-select .el-select__placeholder),
  :deep(.rev-select .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.rev-date .el-input__prefix),
  :deep(.rev-date .el-input__suffix) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .rev-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 14px;
  }

  .rev-kpi {
    position: relative;
    box-sizing: border-box;
    padding: 12px 12px 10px 15px;
    overflow: hidden;
    cursor: pointer;
    background:
      radial-gradient(ellipse 130% 95% at 0% 48%, var(--rev-kpi-glow) 0%, transparent 55%),
      linear-gradient(148deg, rgb(26 26 28 / 96%), rgb(12 12 14 / 99%));
    isolation: isolate;
    border: 1px solid rgb(51 65 85 / 38%);
    border-radius: 12px;
    box-shadow: 0 1px 0 rgb(255 255 255 / 4%) inset;
    transition:
      box-shadow 0.22s ease,
      border-color 0.22s ease,
      filter 0.22s ease,
      background 0.22s ease;
  }

  .rev-kpi::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 0;
    width: 4px;
    content: '';
    background: var(--rev-kpi-edge);
    border-radius: 11px 0 0 11px;
    box-shadow: 2px 0 18px var(--rev-kpi-edge-glow);
  }

  .rev-kpi > * {
    position: relative;
    z-index: 1;
  }

  .rev-kpi[data-accent='blue'] {
    --rev-kpi-edge: #e2e8f0;
    --rev-kpi-edge-glow: rgb(226 232 240 / 45%);
    --rev-kpi-glow: rgb(96 165 250 / 22%);
  }

  .rev-kpi[data-accent='teal'] {
    --rev-kpi-edge: var(--rev-c-teal);
    --rev-kpi-edge-glow: rgb(32 214 181 / 45%);
    --rev-kpi-glow: rgb(32 214 181 / 20%);
  }

  .rev-kpi[data-accent='purple'] {
    --rev-kpi-edge: var(--rev-c-purple);
    --rev-kpi-edge-glow: rgb(167 139 250 / 45%);
    --rev-kpi-glow: rgb(167 139 250 / 22%);
  }

  .rev-kpi[data-accent='amber'] {
    --rev-kpi-edge: var(--rev-c-amber);
    --rev-kpi-edge-glow: rgb(245 158 11 / 45%);
    --rev-kpi-glow: rgb(245 158 11 / 20%);
  }

  .rev-kpi[data-accent='green'] {
    --rev-kpi-edge: var(--rev-c-green);
    --rev-kpi-edge-glow: rgb(34 197 94 / 45%);
    --rev-kpi-glow: rgb(34 197 94 / 20%);
  }

  .rev-kpi[data-accent='indigo'] {
    --rev-kpi-edge: var(--rev-c-indigo);
    --rev-kpi-edge-glow: rgb(56 189 248 / 45%);
    --rev-kpi-glow: rgb(56 189 248 / 22%);
  }

  .rev-kpi:hover {
    z-index: 2;
    filter: brightness(1.07);
    border-color: rgb(100 116 139 / 42%);
    box-shadow:
      0 14px 36px rgb(0 0 0 / 42%),
      0 0 0 1px rgb(255 255 255 / 6%) inset,
      0 0 32px var(--rev-kpi-glow),
      0 0 72px color-mix(in srgb, var(--rev-kpi-glow) 55%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .rev-kpi {
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        filter 0.15s ease;
    }

    .rev-kpi:hover {
      transform: none;
    }
  }

  :global(html:not(.dark) .rev-kpi) {
    background:
      radial-gradient(ellipse 130% 95% at 0% 48%, var(--rev-kpi-glow) 0%, transparent 55%),
      linear-gradient(148deg, rgb(255 255 255 / 94%), rgb(248 250 252 / 98%));
    border-color: rgb(15 23 42 / 10%);
    box-shadow: 0 1px 0 rgb(255 255 255 / 80%) inset;
  }

  :global(html:not(.dark) .rev-kpi:hover) {
    filter: brightness(1.02);
    box-shadow:
      0 12px 28px rgb(15 23 42 / 10%),
      0 0 0 1px rgb(255 255 255 / 70%) inset,
      0 0 28px var(--rev-kpi-glow);
  }

  .rev-kpi__head {
    display: flex;
    gap: 8px;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  .rev-kpi__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--rev-muted);
  }

  .rev-kpi__trend {
    font-size: 12px;
    color: var(--rev-muted);
    white-space: nowrap;
  }

  .rev-kpi__trend.up {
    color: var(--rev-c-green);
  }

  .rev-kpi__trend.down {
    color: #ef4444;
  }

  .rev-kpi__value {
    font-size: 26px;
    font-weight: 800;
    letter-spacing: 0.01em;
  }

  .rev-kpi[data-accent='blue'] .rev-kpi__value {
    color: var(--rev-c-blue);
  }

  .rev-kpi[data-accent='teal'] .rev-kpi__value {
    color: var(--rev-c-teal);
  }

  .rev-kpi[data-accent='purple'] .rev-kpi__value {
    color: var(--rev-c-purple);
  }

  .rev-kpi[data-accent='amber'] .rev-kpi__value {
    color: var(--rev-c-amber);
  }

  .rev-kpi[data-accent='green'] .rev-kpi__value {
    color: var(--rev-c-green);
  }

  .rev-kpi[data-accent='indigo'] .rev-kpi__value {
    color: var(--rev-c-indigo);
  }

  .rev-kpi__sub {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    margin-top: 4px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-kpi__spark {
    height: 38px;
    margin-top: 6px;
  }

  /* 与 align-items:stretch + 子项 height:100% 配合，第二排拉高时卡片才随行变高 */
  .rev-main {
    display: grid;
    grid-template-rows: 480px 420px;

    /* 保留原型三列视觉比例，但随容器宽度自适应 */
    grid-template-columns: minmax(0, 1.535fr) minmax(0, 1.096fr) minmax(0, 1fr);
    grid-auto-flow: row;
    gap: 12px;
    align-items: stretch;
  }

  @media (width <= 1400px) {
    .rev-main {
      grid-template-rows: auto;
      grid-template-columns: 1fr;
    }
  }

  .rev-panel {
    position: relative;
    overflow: hidden;
    border-style: solid;
    border-width: 2px;
    border-radius: 12px;

    @include ap.ap-neon-bg;
    @include ap.ap-card-mesh;
  }

  .rev-panel > * {
    position: relative;
    z-index: 1;
  }

  .rev-panel:not(.rev-panel--ai, .rev-panel--quality) {
    @include ap.ap-panel-hover;
  }

  .rev-panel--iaa,
  .rev-panel--iap,
  .rev-panel--trend7d {
    box-sizing: border-box;
    height: 100%;
    min-height: 420px;
  }

  .rev-panel--iaa {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--iaa .rev-panel__header--iaa {
    flex: 0 0 auto;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    justify-content: flex-start;
    padding-bottom: 6px;
  }

  .rev-tabs--iaa {
    flex-wrap: wrap;
    width: 100%;
  }

  .rev-iaa-main {
    display: grid;
    flex: 1 1 auto;
    grid-template-columns: minmax(0, 40%) minmax(0, 60%);
    gap: 12px;
    align-items: stretch;
    min-height: 0;
    padding: 0 12px 12px;
  }

  /* 广告平台 / 广告位 / 国家 / 版本：左图右表对称，左 40% 右 60% */
  .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-iaa-viz {
    box-sizing: border-box;
    min-height: 0;
    padding: 10px 12px 12px;
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 10px;
  }

  // .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-table-wrap--iaa {
  //   box-sizing: border-box;
  //   min-height: 0;
  //   padding: 0;
  //   background: rgb(0 0 0 / 18%);
  //   border: 1px solid var(--rev-border-soft);
  //   border-radius: 10px;
  // }

  .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-iaa-version-wrap {
    flex: 1;
    min-height: 0;
  }

  .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-iaa-version-chart {
    height: 100%;
    min-height: 200px;
  }

  .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-iaa-country {
    flex: 1;
    align-self: stretch;
    width: 100%;
    min-height: 0;
  }

  :global(html:not(.dark) .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-iaa-viz) {
    background: rgb(15 23 42 / 5%);
  }

  :global(html:not(.dark) .rev-iaa-main:not(.rev-iaa-main--stacked) .rev-table-wrap--iaa) {
    background: rgb(255 255 255 / 72%);
  }

  /* 广告类型：比例条全宽在上，表格全宽在下 */
  .rev-iaa-main--stacked {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rev-iaa-main--stacked .rev-iaa-viz {
    flex: 0 0 auto;
    justify-content: flex-start;
    width: 100%;
  }

  .rev-iaa-main--stacked .rev-table-wrap--iaa {
    flex: 1 1 auto;
    width: 100%;
    min-height: 0;
  }

  .rev-iaa-viz {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 0;
  }

  .rev-iaa-donut-wrap {
    display: flex;
    flex: 1;
    flex-direction: row;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    min-height: 0;
  }

  .rev-iaa-donut-legend {
    display: flex;
    flex: 0 0 38%;
    flex-flow: column nowrap;
    gap: 8px;
    align-items: flex-start;
    justify-content: center;
    max-height: 100%;
    padding-right: 4px;
    overflow: hidden auto;
    font-size: 11px;
    color: var(--rev-muted);
    scrollbar-width: thin;
  }

  .rev-iaa-donut-legend .rev-iaa-bar__label {
    display: inline-flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
    line-height: 1.35;
    white-space: nowrap;
  }

  .rev-iaa-donut-chart {
    position: relative;
    flex: 1 1 0;
    min-width: 0;
    height: 213px;
  }

  .rev-iaa-donut {
    height: 100%;
  }

  .rev-iaa-donut-center {
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .rev-iaa-donut-center-val {
    font-size: 18px;
    font-weight: 800;
    color: var(--rev-c-teal);
  }

  .rev-iaa-country {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 100%;
    padding: 4px 0;
    overflow: auto;
  }

  .rev-iaa-country-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .rev-iaa-country-row.is-other .rev-iaa-country-bar-fill {
    opacity: 0.88;
  }

  .rev-iaa-country-bar-track {
    height: 8px;
    overflow: hidden;
    background: rgb(0 0 0 / 35%);
    border-radius: 999px;
  }

  .rev-iaa-country-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #20d6b5, #22c55e);
    border-radius: 999px;
  }

  .rev-iaa-country-meta {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    color: var(--rev-muted);
  }

  .rev-iaa-country-name {
    color: var(--rev-text);
  }

  .rev-iaa-country-rev {
    margin-left: auto;
    font-weight: 700;
    color: var(--rev-c-teal);
  }

  .rev-iaa-version-wrap {
    flex: 1;
    min-height: 210px;
  }

  .rev-iaa-version-chart {
    height: 210px;
  }

  .rev-iaa-version-foot {
    padding-top: 10px;
    margin: 8px 10px 0;
    font-size: 11px;
    line-height: 1.4;
    color: var(--rev-muted);
    text-align: left;
  }

  .rev-iaa-money {
    font-weight: 700;
    color: var(--rev-c-teal);
  }

  .rev-iaa-fill {
    font-weight: 600;
    color: var(--rev-c-amber);
  }

  .rev-iaa-mom.is-up {
    color: var(--rev-c-green);
  }

  .rev-iaa-mom.is-down {
    color: #ef4444;
  }

  .rev-iaa-mom.is-muted {
    color: var(--rev-muted);
  }

  .rev-iaa-crash.is-good {
    color: var(--rev-c-teal);
  }

  .rev-iaa-crash.is-warn {
    color: var(--rev-c-amber);
  }

  .rev-iaa-crash.is-bad {
    color: #ef4444;
  }

  .rev-iaa-crash.is-neutral {
    color: var(--rev-text);
  }

  .rev-iaa-ver-badge {
    display: inline-block;
    padding: 0 6px;
    margin-left: 6px;
    font-size: 10px;
    line-height: 18px;
    color: var(--rev-c-teal);
    border: 1px solid rgb(32 214 181 / 35%);
    border-radius: 999px;
  }

  .rev-iaa-cell-version .is-current {
    font-weight: 700;
    color: var(--rev-c-teal);
  }

  .rev-panel--iaa :deep(tr.is-iaa-total td) {
    font-weight: 800;
    border-top: 1px solid rgb(148 163 184 / 28%);
  }

  .rev-panel--iaa :deep(tr.is-iaa-current td) {
    background: rgb(32 214 181 / 8%);
  }

  .rev-table-wrap--iaa {
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  .rev-table-wrap--iaa .rev-art-table {
    height: 100%;
  }

  .rev-art-table--iaa-platform-clickable :deep(.el-table__body tr:not(.is-iaa-total)) {
    cursor: pointer;
  }

  .rev-panel--iaa :deep(.el-table) {
    margin-top: 0;
    background: transparent;
    border-radius: 10px 10px 0 0;
  }

  .rev-panel--iaa :deep(.el-table__inner-wrapper::before) {
    height: 0;
  }

  .rev-panel--iaa :deep(.el-table__body-wrapper) {
    overflow: auto;
  }

  .rev-panel--iaa :deep(.el-table th.el-table__cell) {
    background: rgb(0 0 0 / 18%) !important;
  }

  :global(html:not(.dark) .rev-panel--iaa :deep(.el-table th.el-table__cell)) {
    background: rgb(15 23 42 / 6%) !important;
  }

  .rev-panel--iap {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--iap .rev-panel__header--iap {
    flex: 0 0 auto;
    flex-flow: row wrap;
    gap: 8px 12px;
    align-items: center;
    justify-content: space-between;
  }

  .rev-tabs--iap {
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-left: auto;
  }

  .rev-iap-body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
  }

  .rev-iap-tab {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .rev-panel--iap .rev-iap-tab--product .rev-iap-top {
    flex: 0 0 auto;
    padding-bottom: 8px;
  }

  .rev-table-wrap--iap {
    flex: 1 1 auto;
    min-height: 0;
    padding-bottom: 8px;
    overflow: hidden;
  }

  .rev-panel--iap .rev-iap-tab--product .rev-iap-bottom {
    flex: 0 0 auto;
    padding-top: 0;
  }

  .rev-iap-tab--channel {
    gap: 10px;
    padding: 0 12px 12px;
  }

  .rev-iap-channel-viz {
    box-sizing: border-box;
    flex: 0 0 auto;
    padding: 10px 12px 12px;
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 10px;
  }

  :global(html:not(.dark) .rev-iap-channel-viz) {
    background: rgb(15 23 42 / 5%);
  }

  .rev-iap-channel-metrics {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .rev-iap-channel-metric {
    padding: 12px 14px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 12px;
  }

  :global(html:not(.dark) .rev-iap-channel-metric) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-iap-channel-metric__k {
    font-size: 12px;
    font-weight: 600;
    color: var(--rev-muted);
  }

  .rev-iap-channel-metric__v {
    margin-top: 8px;
    font-size: 22px;
    font-weight: 800;
    line-height: 1.2;
  }

  .rev-iap-channel-metric__v.is-accent-purple {
    color: var(--rev-c-purple);
  }

  .rev-iap-channel-metric__v.is-accent-green {
    color: var(--rev-c-green);
  }

  .rev-iap-channel-metric__v.is-accent-amber {
    color: var(--rev-c-amber);
  }

  .rev-table-wrap--iap-channel {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  .rev-table-wrap--iap-channel .rev-art-table {
    flex: 0 0 auto;
  }

  .rev-iap-trend-chart-wrap {
    flex: 0 0 auto;
    padding: 0 4px;
  }

  .rev-iap-tab--trend {
    gap: 8px;
  }

  .rev-iap-trend-kpis {
    display: grid;
    flex: 0 0 auto;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    padding: 0 12px 12px;
  }

  .rev-iap-trend-kpi {
    padding: 8px 10px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 10px;
  }

  :global(html:not(.dark) .rev-iap-trend-kpi) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-iap-trend-kpi__head {
    display: flex;
    gap: 6px;
    align-items: baseline;
    justify-content: space-between;
  }

  .rev-iap-trend-kpi__title {
    font-size: 11px;
    color: var(--rev-muted);
  }

  .rev-iap-trend-kpi__trend {
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
  }

  .rev-iap-trend-kpi__trend.up {
    color: var(--rev-c-green);
  }

  .rev-iap-trend-kpi__trend.down {
    color: #ef4444;
  }

  .rev-iap-trend-kpi__value {
    margin-top: 4px;
    font-size: 16px;
    font-weight: 800;
    color: var(--rev-c-purple);
  }

  .rev-iap-trend-kpi__sub {
    margin-top: 2px;
    font-size: 11px;
    color: var(--rev-muted);
  }

  .rev-iap-kpi__v--accent {
    color: var(--rev-c-purple);
  }

  .rev-mini-kpi__v--accent {
    color: var(--rev-c-purple);
  }

  .rev-iap-money {
    font-weight: 700;
    color: rgb(167 139 250 / 95%);
  }

  .rev-panel--iap :deep(tr.is-iap-channel-total td) {
    font-weight: 800;
    border-top: 1px solid rgb(148 163 184 / 28%);
  }

  .rev-panel--iap .rev-table th,
  .rev-panel--iap .rev-table td {
    padding: 6px 10px;
  }

  .rev-art-table {
    height: 100%;
  }

  .rev-panel--iap :deep(.el-table) {
    background: transparent;
  }

  .rev-panel--iap :deep(.el-table__inner-wrapper::before) {
    height: 0;
  }

  .rev-panel--iap :deep(.el-table__body-wrapper) {
    /* 让滚动发生在表格内部，从而固定表头 */
    overflow: auto;
  }

  .rev-panel--iap :deep(.el-table th.el-table__cell) {
    background: rgb(0 0 0 / 18%) !important;
  }

  :global(html:not(.dark) .rev-panel--iap :deep(.el-table th.el-table__cell)) {
    background: rgb(15 23 42 / 6%) !important;
  }

  .rev-panel--iap .rev-pill-metric {
    min-width: 54px;
    height: 20px;
    padding: 0 8px;
  }

  .rev-panel--pie,
  .rev-panel--top5 {
    box-sizing: border-box;
    height: 100%;
    min-height: 480px;
  }

  .rev-panel--pie {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--pie .rev-pie {
    flex: 1 1 auto;
    min-height: 0;
  }

  .rev-panel--top5 {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .rev-panel--top5 .rev-panel__header {
    flex: 0 0 auto;
  }

  .rev-right-stack {
    box-sizing: border-box;
    display: grid;
    grid-template-rows: auto 1fr;
    gap: 12px;
    height: 100%;
    min-height: 480px;
  }

  .rev-panel--ecpm {
    height: 240px;
  }

  .rev-right-bottom {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 12px;
    align-items: stretch;
    height: 228px;
  }

  :global(html:not(.dark) .rev-panel) {
    background: linear-gradient(135deg, rgb(255 255 255 / 96%), rgb(248 250 252 / 90%));
  }

  .rev-panel__header {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
  }

  .rev-panel__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--rev-text);
  }

  :global(html.dark .rev-panel:not(.rev-panel--ai) .rev-panel__title) {
    @include ap.ap-title-gradient;
  }

  .rev-tabs {
    display: inline-flex;
    gap: 8px;
    align-items: center;
  }

  .rev-tabs--compact {
    gap: 6px;
  }

  /* Top5 分段按钮：对齐原型右上角 segmented control */
  .rev-tabs--segmented {
    padding: 3px;
    background: rgb(51 65 85 / 65%);
    border: 1px solid rgb(148 163 184 / 18%);
    border-radius: 999px;
  }

  :global(html:not(.dark) .rev-tabs--segmented) {
    background: rgb(15 23 42 / 6%);
    border-color: rgb(15 23 42 / 12%);
  }

  /* Top5：分段切換滑動指示條 + 三欄等寬 */
  .rev-tabs--top5 {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    align-items: stretch;
  }

  .rev-tab-pill {
    position: absolute;
    top: 3px;
    left: 3px;
    z-index: 0;
    width: calc((100% - 6px) / 3);
    height: calc(100% - 6px);
    pointer-events: none;
    background: rgb(20 214 181 / 12%);
    border: 1px solid rgb(20 214 181 / 20%);
    border-radius: 999px;
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(html:not(.dark) .rev-tab-pill) {
    background: rgb(37 99 235 / 12%);
    border-color: rgb(37 99 235 / 18%);
  }

  .rev-tabs--top5 .rev-tab {
    position: relative;
    z-index: 1;
    border-color: transparent;
  }

  .rev-tabs--top5 .rev-tab.active {
    background: transparent;
    border-color: transparent;
  }

  .rev-top5-panel-enter-active,
  .rev-top5-panel-leave-active {
    transition:
      opacity 0.22s ease,
      transform 0.26s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .rev-top5-panel-enter-from {
    opacity: 0;
    transform: translateX(14px);
  }

  .rev-top5-panel-leave-to {
    opacity: 0;
    transform: translateX(-12px);
  }

  .rev-tab {
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
    color: var(--rev-muted);
    cursor: pointer;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 10px;
  }

  .rev-tab.active {
    color: var(--rev-text);
    background: rgb(20 214 181 / 12%);
    border-color: rgb(20 214 181 / 20%);
  }

  :global(html:not(.dark) .rev-tab.active) {
    background: rgb(37 99 235 / 12%);
    border-color: rgb(37 99 235 / 18%);
  }

  .rev-legend {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-legend__item {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    white-space: nowrap;
  }

  .rev-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .rev-chart {
    padding: 0 10px 10px;
  }

  /* 近7天 IAA vs IAP 收入趋势：图表画布高度（宽度由 .rev-main 第三列与下方 padding 决定） */
  .rev-chart.rev-chart--trend7d {
    height: 420px;
  }

  .rev-chart--sm {
    height: 170px;
  }

  /* 双类提高优先级，否则会被上方 .rev-chart 的 height:290px 覆盖 */
  .rev-chart.rev-chart--iap-trend {
    height: 240px;
    padding: 0 0 2px;
  }

  .rev-panel--iaa .rev-iaa-bar {
    padding: 0 0 10px;
  }

  .rev-iaa-bar__track {
    display: flex;
    height: 14px;
    overflow: hidden;
    border-radius: 8px;
  }

  .rev-iaa-bar__seg {
    height: 100%;
  }

  .rev-iaa-bar__labels {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 14px;
    margin-top: 10px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-iaa-bar__label {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .rev-table-wrap {
    padding: 0 12px 12px;
  }

  .rev-table-wrap.rev-table-wrap--iaa {
    padding: 0;
  }

  .rev-table {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .rev-table th,
  .rev-table td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--rev-border-soft);
  }

  .rev-table th {
    font-weight: 500;
    color: var(--rev-muted);
  }

  .rev-table td {
    color: var(--rev-text);
  }

  .rev-table .num {
    text-align: right;
    white-space: nowrap;
  }

  .rev-table .txt {
    text-align: left;
    white-space: nowrap;
  }

  /* Top5 ArtTable：列高亮（IAA 绿 / IAP 紫），小计行加粗 */
  .rev-art-table--top5 :deep(.el-table td.col-iaa) {
    background: linear-gradient(90deg, rgb(16 185 129 / 16%), rgb(16 185 129 / 8%));
  }

  .rev-art-table--top5 :deep(.el-table td.col-iap) {
    font-weight: 700;
    color: rgb(167 139 250 / 95%);
    background: linear-gradient(90deg, rgb(167 139 250 / 18%), rgb(167 139 250 / 8%));
  }

  .rev-art-table--top5 :deep(.el-table tr.is-subtotal td) {
    font-weight: 800;
    border-top: 2px solid rgb(148 163 184 / 22%);
  }

  :global(html:not(.dark) .rev-art-table--top5 :deep(.el-table td.col-iaa)) {
    background: linear-gradient(90deg, rgb(16 185 129 / 14%), rgb(16 185 129 / 6%));
  }

  :global(html:not(.dark) .rev-art-table--top5 :deep(.el-table td.col-iap)) {
    color: rgb(124 58 237 / 95%);
    background: linear-gradient(90deg, rgb(124 58 237 / 14%), rgb(124 58 237 / 6%));
  }

  :global(html:not(.dark) .rev-art-table--top5 :deep(.el-table tr.is-subtotal td)) {
    border-top-color: rgb(15 23 42 / 12%);
  }

  .rev-panel--top5 .rev-table-wrap--top5 {
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .rev-panel--top5 .rev-art-table--top5 {
    height: 100%;
  }

  .rev-panel--top5 :deep(.el-table) {
    background: transparent;
  }

  .rev-panel--top5 :deep(.el-table th.el-table__cell) {
    background: rgb(0 0 0 / 18%) !important;
  }

  :global(html:not(.dark) .rev-panel--top5 :deep(.el-table th.el-table__cell)) {
    background: rgb(15 23 42 / 6%) !important;
  }

  /* 保留原生 rev-table--top 以兼容其他使用处（如有） */
  .rev-table--top {
    overflow: hidden;
    border-radius: 10px;
  }

  .rev-table--top thead th {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .rev-table--top tbody tr td.col-iaa {
    background: linear-gradient(90deg, rgb(16 185 129 / 16%), rgb(16 185 129 / 8%));
  }

  .rev-table--top tbody tr td.col-iap {
    font-weight: 700;
    color: rgb(167 139 250 / 95%);
    background: linear-gradient(90deg, rgb(167 139 250 / 18%), rgb(167 139 250 / 8%));
  }

  .rev-table--top tbody tr.is-subtotal td {
    font-weight: 800;
    border-top: 2px solid rgb(148 163 184 / 22%);
  }

  :global(html:not(.dark) .rev-table--top tbody tr td.col-iaa) {
    background: linear-gradient(90deg, rgb(16 185 129 / 14%), rgb(16 185 129 / 6%));
  }

  :global(html:not(.dark) .rev-table--top tbody tr td.col-iap) {
    color: rgb(124 58 237 / 95%);
    background: linear-gradient(90deg, rgb(124 58 237 / 14%), rgb(124 58 237 / 6%));
  }

  :global(html:not(.dark) .rev-table--top tbody tr.is-subtotal td) {
    border-top-color: rgb(15 23 42 / 12%);
  }

  .rev-iap-top {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 12px 8px;
  }

  .rev-iap-kpi {
    padding: 6px 8px;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 10px;
  }

  :global(html:not(.dark) .rev-iap-kpi) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-iap-kpi__k {
    font-size: 11px;
    line-height: 1.3;
    color: var(--rev-muted);
  }

  .rev-iap-kpi__row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-top: 4px;
  }

  .rev-iap-kpi__v {
    font-size: 16px;
    font-weight: 800;
    line-height: 1.2;
  }

  .rev-iap-kpi__tag {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    color: var(--rev-c-amber);
    white-space: nowrap;
    background: rgb(245 158 11 / 14%);
    border: 1px solid rgb(245 158 11 / 22%);
    border-radius: 999px;
  }

  :global(html:not(.dark) .rev-iap-kpi__tag) {
    background: rgb(245 158 11 / 12%);
    border-color: rgb(245 158 11 / 18%);
  }

  .rev-pill-metric {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 58px;
    height: 22px;
    padding: 0 10px;
    font-weight: 700;
    border-radius: 999px;
  }

  .rev-pill-metric.good {
    color: var(--rev-c-green);
    background: rgb(34 197 94 / 14%);
  }

  .rev-pill-metric.mid {
    color: var(--rev-c-amber);
    background: rgb(245 158 11 / 16%);
  }

  .rev-pill-metric.bad {
    color: #ef4444;
    background: rgb(239 68 68 / 14%);
  }

  .rev-iap-bottom {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 0 12px 12px;
  }

  .rev-mini-kpi {
    padding: 10px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--rev-border-soft);
    border-radius: 12px;
  }

  :global(html:not(.dark) .rev-mini-kpi) {
    background: rgb(15 23 42 / 4%);
  }

  .rev-mini-kpi__k {
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-mini-kpi__v {
    margin-top: 6px;
    font-size: 18px;
    font-weight: 800;
  }

  .rev-pie {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    justify-content: center;
    padding: 0 8px 12px;
  }

  .rev-pie__chart-wrap {
    position: relative;
    flex: 0 0 auto;
    width: min(100%, 360px);
    height: 260px;
    margin: 0 auto;
  }

  .rev-pie__chart {
    width: 100%;
    height: 100%;
  }

  .rev-pie__center {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  .rev-pie__center-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--rev-text);
  }

  .rev-pie__center-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--rev-muted);
  }

  .rev-pie__list {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    gap: 10px 18px;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    padding: 0 8px;
    margin: 0 auto;
  }

  .rev-pie__item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    min-width: 0;
    max-width: 200px;
    padding: 4px 0;
    font-size: 12px;
  }

  .rev-pie__item-text {
    display: flex;
    gap: 4px;
    align-items: baseline;
  }

  .rev-pie__name {
    color: var(--rev-text);
  }

  .rev-pie__percent {
    font-weight: 500;
  }

  .rev-pie__money {
    width: 100%;
    font-size: 12px;
    font-weight: 700;
    color: var(--rev-text);
    text-align: center;
  }

  .rev-flag {
    display: inline-block;
    width: 1.4em;
    margin-right: 6px;
    text-align: center;
  }

  /* AI 洞察建议：深橄榄底 + 金边 + 标题琥珀金 + 三色圆点（对齐图一） */
  .rev-panel.rev-panel--ai {
    background: linear-gradient(165deg, rgb(28 27 17 / 98%), rgb(16 15 10 / 99%));
    border: 1px solid rgb(139 109 49 / 88%);
    box-shadow: 0 0 0 1px rgb(230 162 60 / 8%) inset;
    transition:
      box-shadow 0.22s ease,
      filter 0.22s ease,
      border-color 0.22s ease;
  }

  .rev-panel.rev-panel--ai:hover {
    z-index: 1;
    filter: brightness(1.06);
    border-color: rgb(230 162 60 / 55%);
    box-shadow:
      0 10px 28px rgb(0 0 0 / 45%),
      0 0 32px rgb(230 162 60 / 14%),
      0 0 0 1px rgb(255 255 255 / 5%) inset,
      0 0 80px rgb(230 162 60 / 10%);
  }

  .rev-panel--ai .rev-panel__title {
    font-weight: 700;
    color: #e6a23c;
  }

  .rev-ai {
    padding: 2px 14px 14px;
    margin: 0;
    list-style: none;
  }

  .rev-ai-empty {
    padding: 6px 14px 14px;
  }

  .rev-ai__item {
    position: relative;
    padding-left: 18px;
    margin: 10px 0;
    font-size: 12px;
    line-height: 1.65;
    color: #e0e0e0;
  }

  .rev-ai__item::before {
    position: absolute;
    top: 0.42em;
    left: 0;
    width: 8px;
    height: 8px;
    content: '';
    border-radius: 50%;
    box-shadow: 0 0 10px currentcolor;
  }

  .rev-ai__item[data-idx='0']::before {
    color: #26c6da;
    background: #26c6da;
  }

  .rev-ai__item[data-idx='1']::before {
    color: #9575cd;
    background: #9575cd;
  }

  .rev-ai__item[data-idx='2']::before {
    color: #ffb74d;
    background: #ffb74d;
  }

  :global(html:not(.dark) .rev-panel.rev-panel--ai) {
    background: linear-gradient(165deg, rgb(255 252 240 / 98%), rgb(250 246 230 / 99%));
    border-color: rgb(180 140 60 / 45%);
    box-shadow: 0 1px 0 rgb(255 255 255 / 80%) inset;
  }

  :global(html:not(.dark) .rev-panel.rev-panel--ai:hover) {
    filter: brightness(1.02);
    box-shadow: 0 8px 22px rgb(15 23 42 / 12%);
  }

  :global(html:not(.dark) .rev-ai__item) {
    color: rgb(51 65 85 / 95%);
  }

  /* 收入质量指标：外层面板 + 四宫格分色（对齐图二） */
  .rev-panel.rev-panel--quality {
    background: linear-gradient(150deg, rgb(22 22 24 / 96%), rgb(12 12 14 / 99%));
    border: 1px solid rgb(51 65 85 / 38%);
    transition:
      box-shadow 0.22s ease,
      filter 0.22s ease,
      border-color 0.22s ease;
  }

  .rev-panel.rev-panel--quality:hover {
    z-index: 1;
    filter: brightness(1.05);
    border-color: rgb(100 116 139 / 45%);
    box-shadow:
      0 10px 28px rgb(0 0 0 / 38%),
      0 0 68px rgb(59 130 246 / 10%);
  }

  :global(html:not(.dark) .rev-panel.rev-panel--quality) {
    background: linear-gradient(150deg, rgb(248 250 252 / 98%), rgb(255 255 255 / 99%));
    border-color: rgb(15 23 42 / 10%);
  }

  .rev-quality-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 0 12px 12px;
  }

  .rev-quality {
    padding: 10px 12px;
    cursor: pointer;
    border-radius: 12px;
    transition:
      box-shadow 0.2s ease,
      filter 0.2s ease,
      border-color 0.2s ease;
  }

  .rev-quality:nth-child(1),
  .rev-quality:nth-child(2) {
    background: linear-gradient(155deg, rgb(14 38 30 / 96%), rgb(8 26 20 / 99%));
    border: 1px solid rgb(52 211 153 / 22%);
  }

  .rev-quality:nth-child(1) .rev-quality__v,
  .rev-quality:nth-child(2) .rev-quality__v {
    color: #34d399;
  }

  .rev-quality:nth-child(3) {
    background: linear-gradient(155deg, rgb(42 32 18 / 96%), rgb(26 20 12 / 99%));
    border: 1px solid rgb(251 191 36 / 22%);
  }

  .rev-quality:nth-child(3) .rev-quality__v {
    color: #fbbf24;
  }

  .rev-quality:nth-child(4) {
    background: linear-gradient(155deg, rgb(15 23 42 / 96%), rgb(10 16 32 / 99%));
    border: 1px solid rgb(56 189 248 / 22%);
  }

  .rev-quality:nth-child(4) .rev-quality__v {
    color: #38bdf8;
  }

  .rev-quality:hover {
    z-index: 1;
    filter: brightness(1.09);
    box-shadow:
      0 8px 22px rgb(0 0 0 / 35%),
      0 0 64px rgb(34 211 238 / 10%);
  }

  :global(html:not(.dark) .rev-quality:nth-child(1)),
  :global(html:not(.dark) .rev-quality:nth-child(2)) {
    background: linear-gradient(155deg, rgb(236 253 245 / 98%), rgb(220 252 231 / 99%));
    border-color: rgb(16 185 129 / 22%);
  }

  :global(html:not(.dark) .rev-quality:nth-child(3)) {
    background: linear-gradient(155deg, rgb(255 251 235 / 98%), rgb(254 243 199 / 99%));
    border-color: rgb(245 158 11 / 25%);
  }

  :global(html:not(.dark) .rev-quality:nth-child(4)) {
    background: linear-gradient(155deg, rgb(239 246 255 / 98%), rgb(224 242 254 / 99%));
    border-color: rgb(56 189 248 / 28%);
  }

  :global(html:not(.dark) .rev-quality:nth-child(1) .rev-quality__v),
  :global(html:not(.dark) .rev-quality:nth-child(2) .rev-quality__v) {
    color: rgb(5 150 105);
  }

  :global(html:not(.dark) .rev-quality:nth-child(3) .rev-quality__v) {
    color: rgb(180 83 9);
  }

  :global(html:not(.dark) .rev-quality:nth-child(4) .rev-quality__v) {
    color: rgb(2 132 199);
  }

  .rev-quality__k {
    font-size: 12px;
    color: rgb(203 213 225 / 92%);
  }

  :global(html:not(.dark) .rev-quality__k) {
    color: rgb(71 85 105);
  }

  .rev-quality__v {
    margin-top: 6px;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }

  .rev-quality__sub {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
    font-size: 12px;
    color: rgb(148 163 184 / 95%);
  }

  :global(html:not(.dark) .rev-quality__sub) {
    color: rgb(100 116 139);
  }

  .rev-quality__trend.up {
    color: var(--rev-c-green);
  }

  .rev-quality__trend.down {
    color: #ef4444;
  }

  @media (prefers-reduced-motion: reduce) {
    .rev-panel.rev-panel--ai,
    .rev-panel.rev-panel--quality,
    .rev-quality {
      transition:
        border-color 0.15s ease,
        box-shadow 0.15s ease,
        filter 0.15s ease;
    }

    .rev-panel.rev-panel--ai:hover,
    .rev-panel.rev-panel--quality:hover,
    .rev-quality:hover {
      transform: none;
    }

    .revenue-overview-root.revenue-overview-page::before {
      animation: none;
    }

    .rev-page-fx {
      animation: none;
    }

    .rev-entry-1,
    .rev-entry-2,
    .rev-entry-3 {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .rev-skeleton--fx .rev-skeleton__kpi,
    .rev-skeleton--fx .rev-skeleton__block {
      animation: none;
    }

    .rev-panel:not(.rev-panel--ai, .rev-panel--quality):hover {
      transform: none;
    }
  }

  :global(html:not(.dark)) .revenue-overview-root.revenue-overview-page {
    &::before {
      opacity: 0.38;
      animation: none;
    }

    &::after {
      opacity: 0.45;
    }
  }

  :global(html:not(.dark) .rev-page-fx) {
    opacity: 0.32;
    animation: none;
  }

  /* 下拉与日期面板（teleported=false 时仍在页内，同步霓虹底） */
  :global(html.dark .rev-select__popper.el-popper) {
    overflow: hidden;
    background: rgb(24 24 27 / 98%) !important;
    border: 1px solid rgb(96 165 250 / 30%) !important;
    border-radius: 12px !important;
    box-shadow:
      0 18px 52px rgb(0 0 0 / 58%),
      0 0 0 1px rgb(96 165 250 / 14%),
      inset 0 1px 0 rgb(186 230 253 / 10%) !important;
  }

  :global(html:not(.dark) .rev-select__popper.el-popper) {
    border-radius: 12px !important;
    box-shadow: 0 14px 40px rgb(15 23 42 / 12%) !important;
  }

  /* 固定画布布局：不做响应式重排，保持原型一致 */
</style>
