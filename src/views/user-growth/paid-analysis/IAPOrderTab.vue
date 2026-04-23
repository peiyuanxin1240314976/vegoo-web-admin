<template>
  <div class="order-tab">
    <div v-if="loadError" class="card" style="padding: 10px 12px; color: #f87171">
      {{ loadError }}
    </div>
    <div v-else-if="loading" class="iap-tab-skeleton">
      <div class="iap-tab-skeleton__kpis">
        <div v-for="i in 4" :key="`order-kpi-${i}`" class="iap-tab-skeleton__kpi card">
          <ElSkeleton animated :throttle="0">
            <template #template>
              <ElSkeletonItem variant="text" style="width: 44%; margin-bottom: 10px" />
              <ElSkeletonItem variant="h3" style="width: 66%; margin-bottom: 8px" />
              <ElSkeletonItem variant="text" style="width: 52%" />
            </template>
          </ElSkeleton>
        </div>
      </div>
      <div class="card"><ElSkeleton animated :rows="3" /></div>
      <div class="iap-tab-skeleton__grid">
        <div class="card"><ElSkeleton animated :rows="8" /></div>
        <div class="card"><ElSkeleton animated :rows="8" /></div>
      </div>
      <div class="iap-tab-skeleton__grid iap-tab-skeleton__grid--bottom">
        <div class="card"><ElSkeleton animated :rows="10" /></div>
        <div class="card"><ElSkeleton animated :rows="8" /></div>
      </div>
    </div>
    <template v-else>
      <!-- ── KPI Cards ─────────────────────────────── -->
      <div class="kpi-row">
        <div
          class="kpi-card"
          v-for="(kpi, i) in displayKpiCards"
          :key="i"
          :style="{ '--accent': kpi.color }"
        >
          <div class="kpi-info">
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value" :style="{ color: kpi.color }">{{ kpi.value }}</div>
            <div class="kpi-meta">
              <span :class="kpi.trendUp ? 'trend-up' : 'trend-down'" v-if="kpi.trendVal">
                {{ kpi.trendUp ? '↑' : '↓' }}{{ kpi.trendVal }}
              </span>
              <span class="kpi-sub">{{ kpi.sub }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Filters Row ────────────────────────────── -->
      <div class="filter-row">
        <div class="filter-item filter-item--range">
          <span class="fl">日期范围</span>
          <AppDatePicker
            v-model="orderDateRange"
            type="daterange"
            :shortcuts="dateRangeShortcuts"
            unlink-panels
            value-format="YYYY-MM-DD"
            format="YYYY-MM-DD"
            range-separator="~"
            start-placeholder="开始"
            end-placeholder="结束"
            class="fi-range"
          />
        </div>
        <el-select v-model="fApp" size="small" placeholder="应用" class="fi-sel">
          <el-option label="全部" value="all" />
          <el-option label="Weather5" value="weather5" />
          <el-option label="PhoneTracker" value="phonetracker" />
          <el-option label="PhoneTracker2" value="phonetracker2" />
          <el-option label="YearCam" value="yearcam" />
          <el-option label="AgeCam" value="agecam" />
        </el-select>
        <el-select v-model="fChannel" size="small" placeholder="广告平台" class="fi-sel">
          <el-option label="全部" value="all" />
          <el-option label="Google" value="google" />
          <el-option label="Facebook" value="facebook" />
          <el-option label="TikTok" value="tiktok" />
          <el-option label="自然量" value="organic" />
        </el-select>
        <el-select v-model="fCountry" size="small" placeholder="国家" class="fi-sel">
          <el-option label="全部" value="all" />
          <el-option label="US" value="us" />
          <el-option label="DE" value="de" />
          <el-option label="JP" value="jp" />
          <el-option label="KR" value="kr" />
          <el-option label="CA" value="ca" />
          <el-option label="GB" value="gb" />
        </el-select>
        <el-select v-model="fProduct" size="small" placeholder="商品" class="fi-sel">
          <el-option label="全部" value="all" />
          <el-option label="年订" value="annual" />
          <el-option label="月订" value="monthly" />
        </el-select>
        <el-select v-model="fStatus" size="small" placeholder="状态" class="fi-sel">
          <el-option label="全部" value="all" />
          <el-option label="成功" value="success" />
          <el-option label="退款" value="refund" />
          <el-option label="失败" value="fail" />
        </el-select>
        <el-input
          v-model="searchKw"
          size="small"
          placeholder="订单号/用户ID"
          class="fi-search"
          clearable
          @keyup.enter="handleOrderSearch"
        >
          <template #prefix>
            <ElIcon class="fi-search-icon"><Search /></ElIcon>
          </template>
        </el-input>
        <div class="filter-row-actions">
          <ElButton
            type="primary"
            plain
            round
            size="default"
            class="order-search-btn"
            @click="handleOrderSearch"
            >搜索</ElButton
          >
          <ElButton type="primary" plain round size="default" class="export-btn-sm"
            >↓ 导出数据</ElButton
          >
        </div>
      </div>

      <!-- ── Main Content ───────────────────────────── -->
      <div class="main-layout" :class="{ 'detail-open': !!selectedOrder }">
        <div class="left-content">
          <!-- Top Two-column -->
          <div class="dual-grid">
            <!-- App × Platform Summary -->
            <div class="card">
              <div class="card-hd">
                应用 × 平台 订单汇总
                <span class="card-note"
                  >注：安卓仅支持指定日期之后的数据，平台未配置的应用归入其他，总订阅数为截止到指定日期有效的订阅订单数量</span
                >
              </div>
              <table class="dt sm-dt">
                <thead>
                  <tr>
                    <th rowspan="2">应用</th>
                    <th rowspan="2">平台</th>
                    <th rowspan="2">总订阅数</th>
                    <th colspan="6">订单数量</th>
                    <th colspan="4">收入 (USD)</th>
                  </tr>
                  <tr>
                    <th>付费</th><th>订阅</th><th>内购</th> <th>续订</th><th>退款</th><th>取消</th>
                    <th>付费</th><th>订阅</th><th>内购</th><th>续订</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="r in filteredAppPlatRows" :key="r.appName + r.platform">
                    <td class="ch-name">{{ r.appName }}</td>
                    <td
                      ><span
                        class="plat-tag"
                        :class="
                          r.platform === 'iOS'
                            ? 'plat-ios'
                            : r.platform === 'Android'
                              ? 'plat-android'
                              : ''
                        "
                        >{{ r.platform }}</span
                      ></td
                    >
                    <td>{{ r.totalSubscriptions }}</td>
                    <td>{{ r.paid }}</td
                    ><td>{{ r.sub }}</td
                    ><td>{{ r.iap }}</td> <td>{{ r.renew }}</td
                    ><td>{{ r.refund }}</td
                    ><td>{{ r.cancel }}</td>
                    <td class="val-cyan">{{ r.rPaid }}</td>
                    <td>{{ r.rSub }}</td
                    ><td>{{ r.rIap }}</td
                    ><td>{{ r.rRenew }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Daily Summary -->
            <div class="card">
              <div class="card-hd">
                按日期订单汇总
                <div class="card-action">国家下钻: 全部 ▾</div>
              </div>
              <table class="dt sm-dt">
                <thead>
                  <tr>
                    <th>日期</th><th>付费收入</th><th>付费人数</th> <th>付费率</th><th>订单量</th
                    ><th>广告支出</th> <th>CPA</th><th>新用户</th><th>续订率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in filteredDailyRows"
                    :key="r.date + '-' + r.users + '-' + r.orders"
                    :class="{ 'row-selected': r.date === highlightDailyDate }"
                  >
                    <td class="val-cyan cursor-pointer">{{ r.date }}</td>
                    <td>{{ r.rev }}</td
                    ><td>{{ r.users }}</td> <td>{{ r.payRate }}</td
                    ><td>{{ r.orders }}</td> <td>{{ r.adSpend }}</td
                    ><td>{{ r.cpa }}</td>
                    <td>{{ r.newUsers }}</td>
                    <td>
                      <span
                        class="reten-pill"
                        :class="parseFloat(r.reten) >= 20 ? 'ret-high' : 'ret-low'"
                      >
                        {{ r.reten }}
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="total-row">
                    <td>合计</td><td>$4,103</td><td>1,503</td> <td>90.0%</td><td>430</td>
                    <td>$1,750</td><td>0.04</td><td>17</td>
                    <td><span class="reten-pill ret-high">20%</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Order List + Charts Row -->
          <div class="order-charts-grid">
            <!-- Order List -->
            <div class="card order-list-card">
              <div class="list-header">
                <span class="card-hd" style="margin: 0">订单列表</span>
                <span class="record-count">{{ orderListRangeText }}</span>
              </div>
              <table class="dt order-dt">
                <thead>
                  <tr>
                    <th>订单号</th><th>用户ID</th><th>应用</th> <th>商品</th><th>金额</th
                    ><th>广告平台</th> <th>国家</th><th>下单时间</th><th>支付方式</th> <th>状态</th
                    ><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in filteredOrderRows"
                    :key="r.uid"
                    :class="{ 'row-selected': selectedOrder?.uid === r.uid }"
                  >
                    <td class="order-id" @click="selectOrder(r)">{{ r.id }}</td>
                    <td class="val-blue">{{ r.userId }}</td>
                    <td>{{ r.app }}</td>
                    <td class="order-product">{{ r.product }}</td>
                    <td>{{ r.amount }}</td>
                    <td>{{ r.channel }}</td>
                    <td>
                      <span
                        v-if="r.countryCode"
                        class="country-flag fi"
                        :class="'fi-' + r.countryCode"
                      />
                    </td>
                    <td class="val-muted">{{ r.time }}</td>
                    <td class="val-muted">{{ r.payMethod }}</td>
                    <td>
                      <span class="status-tag" :class="r.statusClass">{{ r.status }}</span>
                    </td>
                    <td>
                      <span class="link-btn" @click="selectOrder(r)">查看</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="pagination">
                <span class="page-btn">‹ 1</span>
                <span class="page-cur">2</span>
                <span class="page-btn">… 813 ›</span>
                <span class="page-info">showing 1-8 of 9,749</span>
              </div>
            </div>

            <!-- Right Charts -->
            <div class="charts-col">
              <div class="card">
                <div class="card-hd">24小时订单金额分布</div>
                <div ref="hourRef" style="height: 160px"></div>
              </div>
              <div class="card">
                <div class="card-hd">商品类型订单占比</div>
                <div ref="typeRef" style="height: 160px"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Order Detail Panel ────────────────── -->
        <transition name="slide">
          <div class="detail-panel" v-if="selectedOrder">
            <div class="detail-header">
              <div class="detail-title">
                <el-icon><Document /></el-icon>
                订单详情
              </div>
              <div class="detail-order-id">{{ selectedOrder.id }}</div>
              <span class="close-btn" @click="selectedOrder = null">✕</span>
            </div>

            <div
              class="pay-status"
              :class="{
                'pay-status--ok': selectedOrder.status === '成功',
                'pay-status--refund': selectedOrder.status === '退款',
                'pay-status--fail': selectedOrder.status === '失败'
              }"
            >
              <span class="pay-ok-dot">{{ selectedOrder.status === '成功' ? '✓' : '!' }}</span>
              <span class="pay-ok-text">{{
                selectedOrder.status === '成功'
                  ? '支付成功'
                  : selectedOrder.status === '退款'
                    ? '已退款'
                    : '支付失败'
              }}</span>
              <span class="pay-amount">{{
                selectedOrderDetail?.priceLabel ?? selectedOrder.amount
              }}</span>
            </div>

            <div class="detail-sections">
              <div v-if="selectedOrderDetailLoading" class="detail-section">
                <div class="ds-title">加载中…</div>
              </div>
              <div class="detail-section">
                <div class="ds-title">基本信息</div>
                <div class="ds-grid">
                  <div class="ds-row"
                    ><span class="ds-k">订单号</span
                    ><span class="ds-v">{{ selectedOrder.id }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">用户ID</span
                    ><span class="ds-v val-blue">{{ selectedOrder.userId }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">应用</span
                    ><span class="ds-v">{{
                      selectedOrderDetail?.appName ?? selectedOrder.app
                    }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">平台</span
                    ><span class="ds-v">{{ selectedOrderDetail?.platform ?? '--' }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">商品</span
                    ><span class="ds-v">{{
                      selectedOrderDetail?.skuName ?? selectedOrder.product
                    }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">商品ID</span
                    ><span class="ds-v val-muted">{{
                      selectedOrderDetail?.skuId ?? '--'
                    }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">价格</span
                    ><span class="ds-v">{{
                      selectedOrderDetail?.priceLabel ?? selectedOrder.amount
                    }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">支付方式</span
                    ><span class="ds-v">{{
                      selectedOrderDetail?.paymentPlatform ?? selectedOrder.payMethod
                    }}</span></div
                  >
                </div>
              </div>

              <div class="detail-section">
                <div class="ds-title">广告平台与地区</div>
                <div class="ds-grid">
                  <div class="ds-row"
                    ><span class="ds-k">广告平台</span
                    ><span class="ds-v">{{
                      selectedOrderDetail?.source ?? selectedOrder.channel
                    }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">国家/地区</span>
                    <span class="ds-v ds-v--country">
                      <span
                        v-if="selectedOrderDetail?.s_country_code ?? selectedOrder.countryCode"
                        class="fi mr-1"
                        :class="
                          'fi-' + (selectedOrderDetail?.s_country_code ?? selectedOrder.countryCode)
                        "
                      />
                      {{
                        (
                          selectedOrderDetail?.s_country_code ?? selectedOrder.countryCode
                        ).toUpperCase()
                      }}
                    </span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">时区</span
                    ><span class="ds-v">{{ selectedOrderDetail?.timezoneLabel ?? '--' }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">货币</span
                    ><span class="ds-v">{{ selectedOrderDetail?.currency ?? 'USD' }}</span></div
                  >
                </div>
              </div>

              <div class="detail-section">
                <div class="ds-title">时间信息</div>
                <div class="ds-grid">
                  <div class="ds-row"
                    ><span class="ds-k">下单时间</span
                    ><span class="ds-v">{{ selectedOrderDetail?.orderTime ?? '--' }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">支付时间</span
                    ><span class="ds-v">{{ selectedOrderDetail?.payTime ?? '--' }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">订阅开始</span
                    ><span class="ds-v">{{ selectedOrderDetail?.subStartDate ?? '--' }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">订阅到期</span
                    ><span class="ds-v">{{ selectedOrderDetail?.subEndDate ?? '--' }}</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">首次付费</span
                    ><span
                      class="ds-v"
                      :class="selectedOrderDetail?.isFirstPay ? 'val-green' : 'val-muted'"
                      >{{ selectedOrderDetail?.isFirstPay ? '是' : '否' }}</span
                    ></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">首次付费周期</span
                    ><span class="ds-v"
                      >{{ selectedOrderDetail?.firstPayCycleDays ?? 0 }}天</span
                    ></div
                  >
                </div>
              </div>

              <div class="detail-section">
                <div class="ds-title">订阅状态</div>
                <div class="ds-grid">
                  <div class="ds-row"
                    ><span class="ds-k">订阅类型</span><span class="ds-v">年度订阅</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">自动续费</span
                    ><span class="ds-v val-green">已开启</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">续费次数</span><span class="ds-v">0次（首次）</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">预计续费日</span><span class="ds-v">2027-03-05</span></div
                  >
                </div>
              </div>

              <div class="detail-section">
                <div class="ds-title">收入归因</div>
                <div class="ds-grid">
                  <div class="ds-row"
                    ><span class="ds-k">归因广告平台</span><span class="ds-v">Google UAC</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">Campaign</span
                    ><span class="ds-v val-muted">Weather5_US_Annual_0305</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">广告组</span
                    ><span class="ds-v val-muted">AG_US_iOS_Annual</span></div
                  >
                  <div class="ds-row"
                    ><span class="ds-k">归因模型</span><span class="ds-v">Last Click</span></div
                  >
                </div>
              </div>
            </div>

            <div class="detail-footer">
              <el-button size="small" class="detail-btn">‹ 上一条</el-button>
              <el-button size="small" class="detail-btn">下一条 ›</el-button>
              <el-button size="small" class="detail-btn-primary">复制订单号</el-button>
              <el-button size="small" class="detail-btn-outline">导出此订单</el-button>
            </div>
          </div>
        </transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { Document, Search } from '@element-plus/icons-vue'
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
  import { echarts } from '@/plugins/echarts'
  import { cloneAppDate, formatYYYYMMDD, getAppTodayYYYYMMDD } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import type {
    PaidAnalysisFilterBody,
    PaidAnalysisOrderDetailData,
    PaidAnalysisOrderListData,
    PaidAnalysisOrderTabSummaryData
  } from './types'
  import {
    fetchPaidAnalysisOrderDetail,
    fetchPaidAnalysisOrderList,
    fetchPaidAnalysisTabOrderSummary
  } from '@/api/user-growth/paid-analysis'

  defineOptions({ name: 'IAPOrderTab' })

  /** 与公用 meta 一致：不限为 ''；兼容历史 'all' */
  function isAllFilter(v: string) {
    return v === '' || v === 'all'
  }

  const props = defineProps<{
    filters: {
      appId: string
      platform: string
      country: string
      date: string
    }
    searchToken: number
  }>()

  const loading = ref(false)
  const loadError = ref('')

  interface OrderRow {
    uid: string
    id: string
    userId: string
    app: string
    product: string
    amount: string
    channel: string
    countryCode: string
    time: string
    payMethod: string
    status: string
    statusClass: string
    sortDate: string
  }

  interface AppliedOrderFilters {
    dateStart: string
    dateEnd: string
    app: string
    channel: string
    country: string
    product: string
    status: string
    keyword: string
  }

  const orderDateRange = ref<[string, string] | null>(null)
  const fApp = ref('all')
  const fChannel = ref('all')
  const fCountry = ref('all')
  const fProduct = ref('all')
  const fStatus = ref('all')
  const searchKw = ref('')

  const applied = ref<AppliedOrderFilters>({
    dateStart: '',
    dateEnd: '',
    app: 'all',
    channel: 'all',
    country: 'all',
    product: 'all',
    status: 'all',
    keyword: ''
  })

  const selectedOrder = ref<OrderRow | null>(null)
  const selectedOrderDetail = ref<PaidAnalysisOrderDetailData | null>(null)
  const selectedOrderDetailLoading = ref(false)

  function selectOrder(r: OrderRow) {
    selectedOrder.value = r
    void loadOrderDetail(r.id)
  }

  const hourRef = ref<HTMLElement | null>(null)
  const typeRef = ref<HTMLElement | null>(null)
  const chartInstances: Array<ReturnType<typeof echarts.init>> = []

  const APP_KEY_MAP: Record<string, string> = {
    weather5: 'Weather5',
    phonetracker: 'PhoneTracker',
    phonetracker2: 'PhoneTracker2',
    yearcam: 'YearCam',
    agecam: 'AgeCam'
  }

  const CHANNEL_KEY_MAP: Record<string, string> = {
    google: 'Google',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    organic: 'Organic'
  }

  const STATUS_KEY_MAP: Record<string, string> = {
    success: '成功',
    refund: '退款',
    fail: '失败'
  }

  function syncDateRangeFromParentDate(endYmd: string) {
    if (!endYmd) return
    const end = new Date(`${endYmd}T12:00:00`)
    const s = cloneAppDate(end)
    s.setDate(s.getDate() - 29)
    orderDateRange.value = [formatYYYYMMDD(s), endYmd]
  }

  function buildSummaryBody(): PaidAnalysisFilterBody {
    const r = orderDateRange.value
    const startDate = r?.[0] ?? props.filters.date ?? getAppTodayYYYYMMDD()
    const endDate = r?.[1] ?? props.filters.date ?? getAppTodayYYYYMMDD()
    return {
      startDate,
      endDate,
      appId: props.filters.appId || '',
      platform: props.filters.platform || '',
      countryCode: props.filters.country || '',
      source: ''
    }
  }

  function buildListParams(): Parameters<typeof fetchPaidAnalysisOrderList>[0] {
    const r = orderDateRange.value
    const startDate = r?.[0] ?? props.filters.date ?? getAppTodayYYYYMMDD()
    const endDate = r?.[1] ?? props.filters.date ?? getAppTodayYYYYMMDD()
    return {
      startDate,
      endDate,
      appId: isAllFilter(fApp.value) ? props.filters.appId || '' : fApp.value,
      platform: props.filters.platform || '',
      countryCode: isAllFilter(fCountry.value) ? props.filters.country || '' : fCountry.value,
      source: isAllFilter(fChannel.value) ? '' : fChannel.value,
      keyword: searchKw.value.trim(),
      productSku: isAllFilter(fProduct.value) ? '' : fProduct.value,
      orderStatus: isAllFilter(fStatus.value) ? '' : fStatus.value,
      current: 1,
      size: 8
    }
  }

  function pushAppliedFromForm() {
    const r = orderDateRange.value
    const dateStart = r?.[0] ?? props.filters.date ?? getAppTodayYYYYMMDD()
    const dateEnd = r?.[1] ?? props.filters.date ?? getAppTodayYYYYMMDD()
    applied.value = {
      dateStart,
      dateEnd,
      app: fApp.value,
      channel: fChannel.value,
      country: fCountry.value,
      product: fProduct.value,
      status: fStatus.value,
      keyword: searchKw.value.trim()
    }
  }

  function handleOrderSearch() {
    if (!orderDateRange.value?.[0]) {
      syncDateRangeFromParentDate(props.filters.date || getAppTodayYYYYMMDD())
    }
    pushAppliedFromForm()
    selectedOrder.value = null
    selectedOrderDetail.value = null
    void loadAll()
    nextTick(() => rebuildCharts())
  }

  const summary = ref<PaidAnalysisOrderTabSummaryData | null>(null)
  const orderList = ref<PaidAnalysisOrderListData | null>(null)

  const appPlatRows = computed(() => summary.value?.appPlatformRows ?? [])
  const dailyRows = computed(() => summary.value?.dailyRows ?? [])

  const orderRows = computed<OrderRow[]>(() => {
    const records = orderList.value?.records ?? []
    return records.map((r, idx) => {
      const statusMap: Record<string, { label: string; cls: string }> = {
        success: { label: '成功', cls: 'st-ok' },
        refund: { label: '退款', cls: 'st-refund' },
        fail: { label: '失败', cls: 'st-fail' }
      }
      const s = statusMap[r.status] ?? { label: String(r.status), cls: '' }
      const sortDate = props.filters.date || ''
      return {
        uid: `${r.s_order_id}-${idx}`,
        id: r.s_order_id,
        userId: r.user_display_id,
        app: r.appName,
        product: r.productBrief,
        amount: r.amountLabel,
        channel: r.sourceLabel,
        countryCode: r.s_country_code,
        sortDate,
        time: r.orderTimeLabel,
        payMethod: r.paymentMethod,
        status: s.label,
        statusClass: s.cls
      }
    })
  })

  function matchProductScope(product: string, f: string) {
    if (isAllFilter(f)) return true
    if (f === 'annual') return /annual|年|89\.99/i.test(product)
    if (f === 'monthly') return /month|月|9\.99|6\.99/i.test(product)
    return true
  }

  const filteredAppPlatRows = computed(() => {
    const f = applied.value.app
    const details = appPlatRows.value.filter((r) => r.appName !== '汇总')
    if (isAllFilter(f)) return appPlatRows.value
    const want = APP_KEY_MAP[f]
    if (!want) return details.filter(() => false)
    return details.filter((r) => r.appName === want)
  })

  const filteredDailyRows = computed(() => {
    const { dateStart, dateEnd } = applied.value
    const rows = dailyRows.value.map((r) => ({
      date: r.t_date,
      rev: r.paidRevenueLabel,
      users: r.paidUsers,
      payRate: r.payRateLabel,
      orders: r.orders,
      adSpend: r.adSpendLabel,
      cpa: r.cpa,
      newUsers: r.newUsers,
      reten: r.renewRateLabel
    }))
    if (!dateStart || !dateEnd) return rows
    return rows.filter((r) => r.date >= dateStart && r.date <= dateEnd)
  })

  const highlightDailyDate = computed(() => applied.value.dateEnd || '')

  const filteredOrderRows = computed(() => {
    const a = applied.value
    return orderRows.value.filter((r) => {
      if (r.sortDate < a.dateStart || r.sortDate > a.dateEnd) return false
      if (!isAllFilter(a.app)) {
        const want = APP_KEY_MAP[a.app]
        if (!want || r.app !== want) return false
      }
      if (!isAllFilter(a.channel)) {
        const want = CHANNEL_KEY_MAP[a.channel]
        if (!want || r.channel !== want) return false
      }
      if (!isAllFilter(a.country) && r.countryCode !== a.country) return false
      if (!matchProductScope(r.product, a.product)) return false
      if (!isAllFilter(a.status)) {
        const want = STATUS_KEY_MAP[a.status]
        if (!want || r.status !== want) return false
      }
      const kw = a.keyword.toLowerCase()
      if (kw && !r.id.toLowerCase().includes(kw) && !r.userId.toLowerCase().includes(kw)) {
        return false
      }
      return true
    })
  })

  const displayKpiCards = computed(() => {
    const k = summary.value?.kpis ?? []
    return k.map((x) => ({
      label: x.label,
      value: x.value,
      trendUp: x.trendUp,
      trendVal: x.trendRef,
      sub: x.subNotes,
      color: x.color
    }))
  })

  const orderListRangeText = computed(() => {
    const total = orderList.value?.total ?? 0
    if (!total) return '暂无数据'
    return `共 ${total.toLocaleString('en-US')} 条（当前筛选）`
  })

  const hourAmounts = computed(() => summary.value?.hourAmounts ?? [])

  /* ── ECharts ──────────────────────────────────── */
  onMounted(() => {
    syncDateRangeFromParentDate(props.filters.date || getAppTodayYYYYMMDD())
    fApp.value = props.filters.appId
    fCountry.value = props.filters.country
    pushAppliedFromForm()
    void loadAll()
    initHourChart()
    initTypeChart()
  })
  onUnmounted(() => {
    chartInstances.forEach((c) => c.dispose())
  })

  function rebuildCharts() {
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    initHourChart()
    initTypeChart()
  }

  watch(
    () => props.searchToken,
    () => {
      syncDateRangeFromParentDate(props.filters.date || getAppTodayYYYYMMDD())
      fApp.value = props.filters.appId
      fCountry.value = props.filters.country
      pushAppliedFromForm()
      selectedOrder.value = null
      selectedOrderDetail.value = null
      void loadAll()
      nextTick(() => rebuildCharts())
    }
  )

  function initHourChart() {
    if (!hourRef.value) return
    const c = echarts.init(hourRef.value)
    chartInstances.push(c)
    const hours = Array.from({ length: 24 }, (_, i) => `${i}-${i + 1}h`)
    const data = hourAmounts.value.length ? hourAmounts.value : Array.from({ length: 24 }, () => 0)
    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 10, bottom: 40, left: 44 },
      xAxis: {
        type: 'category',
        data: hours,
        axisLabel: { color: '#6b7a99', fontSize: 9, interval: 3 },
        axisLine: { lineStyle: { color: '#1e2540' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#8892a8', fontSize: 10, formatter: (v: number) => `$${v}` },
        splitLine: { lineStyle: { color: '#1a2240' } }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a2035',
        borderColor: '#1e2540',
        textStyle: { color: '#e2e8f5' }
      },
      series: [
        {
          type: 'bar',
          data,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#22d3ee' },
              { offset: 1, color: '#22d3ee44' }
            ]),
            borderRadius: [2, 2, 0, 0]
          },
          barMaxWidth: 10,
          markLine: {
            data: [
              { xAxis: '13-14h', lineStyle: { color: '#ef444488', width: 1, type: 'dashed' } }
            ],
            label: { formatter: '峰值时段', color: '#ef4444', fontSize: 9 },
            symbol: ['none', 'none']
          }
        }
      ]
    })
  }

  function initTypeChart() {
    if (!typeRef.value) return
    const c = echarts.init(typeRef.value)
    chartInstances.push(c)
    const share = summary.value?.productTypeShare ?? []
    const get = (name: string) => share.find((x) => x.name === name)?.percent ?? 0
    const pOther = get('Other')
    const pCoins = get('Coins')
    const pLife = get('Lifetime')
    const pMon = get('Monthly')
    const pAnn = get('Annual')
    const maxX = Math.min(80, Math.max(12, pAnn + 8))
    c.setOption({
      backgroundColor: 'transparent',
      grid: { top: 10, right: 10, bottom: 10, left: 60, containLabel: false },
      xAxis: { show: false, max: maxX },
      yAxis: {
        type: 'category',
        data: ['Other', 'Coins', 'Lifetime', 'Monthly', 'Annual'],
        axisLabel: { color: '#8892a8', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false }
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: [
            { value: pOther, itemStyle: { color: '#475569', borderRadius: [0, 3, 3, 0] } },
            { value: pCoins, itemStyle: { color: '#f59e0b', borderRadius: [0, 3, 3, 0] } },
            { value: pLife, itemStyle: { color: '#8b5cf6', borderRadius: [0, 3, 3, 0] } },
            { value: pMon, itemStyle: { color: '#3b82f6', borderRadius: [0, 3, 3, 0] } },
            { value: pAnn, itemStyle: { color: '#22d3ee', borderRadius: [0, 3, 3, 0] } }
          ],
          label: {
            show: true,
            position: 'right',
            formatter: (p: { dataIndex: number }) =>
              [`${pOther}%`, `${pCoins}%`, `${pLife}%`, `${pMon}%`, `${pAnn}%`][p.dataIndex],
            color: '#e2e8f5',
            fontSize: 11
          }
        }
      ]
    })
  }

  async function loadAll() {
    loadError.value = ''
    chartInstances.forEach((c) => c.dispose())
    chartInstances.length = 0
    loading.value = true
    try {
      const [s, list] = await Promise.all([
        fetchPaidAnalysisTabOrderSummary(buildSummaryBody()),
        fetchPaidAnalysisOrderList(buildListParams())
      ])
      summary.value = s
      orderList.value = list
      loading.value = false
      await nextTick()
      rebuildCharts()
    } catch (e) {
      loadError.value = e instanceof Error ? e.message : String(e)
    } finally {
      if (loading.value) loading.value = false
    }
  }

  async function loadOrderDetail(orderId: string) {
    selectedOrderDetail.value = null
    selectedOrderDetailLoading.value = true
    try {
      const res = await fetchPaidAnalysisOrderDetail({ s_order_id: orderId })
      selectedOrderDetail.value = res.detail
    } finally {
      selectedOrderDetailLoading.value = false
    }
  }
</script>

<style scoped lang="scss">
  @use '../ad-performance/styles/ap-card-fx.scss' as *;

  .order-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .iap-tab-skeleton {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .iap-tab-skeleton__kpis {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .iap-tab-skeleton__kpi {
    padding: 16px 18px;
  }

  .iap-tab-skeleton__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .iap-tab-skeleton__grid--bottom {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  }

  .iap-tab-skeleton :deep(.el-skeleton) {
    padding: 16px 18px;
  }

  /* KPI */
  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kpi-card {
    @include ap-neon-bg;

    position: relative;
    display: flex;
    align-items: center;
    padding: 16px 18px;
    overflow: hidden;
    border-left: 3px solid var(--accent);
    border-radius: 14px;
    transition: box-shadow 0.36s var(--ease-out);

    &:hover {
      box-shadow:
        0 16px 48px rgb(0 0 0 / 45%),
        0 0 40px color-mix(in srgb, var(--accent) 15%, transparent),
        0 0 72px color-mix(in srgb, var(--accent) 22%, transparent);
    }
  }

  .kpi-info {
    flex: 1;
  }

  .kpi-label {
    margin-bottom: 4px;
    font-size: 12px;
    color: #6b7a99;
  }

  .kpi-value {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.2;
  }

  .kpi-meta {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 4px;
    font-size: 11px;
  }

  .kpi-sub {
    color: #6b7a99;
  }

  .trend-up {
    font-weight: 600;
    color: #10b981;
  }

  .trend-down {
    font-weight: 600;
    color: #ef4444;
  }

  /* Filter Row */
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 12px;
    align-items: center;
    padding: 16px 18px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 38%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 32px rgb(59 130 246 / 8%);
  }

  .filter-item {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
  }

  .fl {
    color: #6b7a99;
  }

  .fv {
    font-weight: 500;
    color: #e2e8f5;
  }

  .fi-sel {
    width: 120px;
  }

  .fi-search {
    width: 180px;
  }

  .filter-item--range {
    flex: 1 1 260px;
    align-items: center;
    min-width: 0;
  }

  .filter-item--range .fl {
    flex-shrink: 0;
  }

  :deep(.fi-range) {
    flex: 1;
    max-width: 320px;
  }

  :deep(.fi-range.el-date-editor),
  :deep(.fi-range.el-date-editor--daterange) {
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-input-border-color: var(--theme-color, var(--art-primary, #3b82f6));

    min-height: 36px;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
  }

  :deep(.fi-range .el-input__wrapper),
  :deep(.fi-range .el-range-editor.el-input__wrapper) {
    padding: 0 12px;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.fi-range:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.fi-range.is-active),
  :deep(.fi-range .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.fi-range .el-range-input) {
    font-size: 12px;
    color: var(--el-text-color-primary);
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  :deep(.fi-range .el-range__icon),
  :deep(.fi-range .el-range__close-icon) {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  :deep(.fi-sel) {
    --el-input-focus-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-hover: var(--theme-color, var(--art-primary, #3b82f6));
    --el-color-primary: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color-focus: var(--theme-color, var(--art-primary, #3b82f6));
    --el-border-color: var(--theme-color, var(--art-primary, #3b82f6));
    --el-component-size: 36px;
  }

  :deep(.fi-sel .el-select__wrapper),
  :deep(.fi-sel .el-input__wrapper) {
    min-height: 36px;
    padding: 0 12px;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
  }

  :deep(.fi-sel .el-select__wrapper:hover),
  :deep(.fi-sel .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.fi-sel .el-select__wrapper.is-focused),
  :deep(.fi-sel .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  :deep(.fi-sel .el-select__caret) {
    color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
  }

  :deep(.fi-search .el-input__wrapper) {
    min-height: 36px;
    padding: 0 12px;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
    box-shadow: none !important;
  }

  :deep(.fi-search .el-input__wrapper:hover) {
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 1px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 14%, transparent) !important;
  }

  :deep(.fi-search .el-input__wrapper.is-focus) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border-color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent) !important;
  }

  .filter-row-actions {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-left: auto;
  }

  .order-search-btn {
    font-size: 12px;
    color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
  }

  .fi-search-icon {
    font-size: 14px;
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .country-flag.fi {
    display: inline-block;
    width: 1.1em;
    line-height: 1;
    vertical-align: middle;
    border-radius: 2px;
  }

  .export-btn-sm {
    font-size: 12px;
    color: var(--theme-color, var(--art-primary, #3b82f6)) !important;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6)) !important;
    border-radius: var(--el-border-radius-base, 4px) !important;
  }

  /* Main Layout */
  .main-layout {
    display: flex;
    gap: 12px;
    transition: all 0.3s;
  }

  .left-content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .detail-open .left-content {
    flex: 0 0 calc(100% - 340px);
  }

  /* Card */
  .card {
    @include ap-neon-bg;

    position: relative;
    padding: 14px 16px;
    overflow: hidden;
    border-radius: 14px;
    transition:
      border-color 0.28s ease,
      box-shadow 0.36s var(--ease-out);

    &:hover {
      border-color: rgb(96 165 250 / 55%);
      box-shadow:
        0 18px 56px rgb(0 0 0 / 48%),
        0 0 48px rgb(59 130 246 / 12%),
        0 0 90px rgb(34 211 238 / 10%);
    }
  }

  .card-hd {
    @include ap-title-gradient;

    display: block;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 700;
  }

  .card-note {
    margin-left: 8px;
    font-size: 10px;
    font-weight: 400;
    color: #4a5a7a;
  }

  .card-action {
    font-size: 11px;
    color: #6b7a99;
    cursor: pointer;
  }

  .card-action:hover {
    color: #22d3ee;
  }

  /* Tables */
  .dt {
    width: 100%;
    font-size: 12px;
    border-collapse: collapse;
  }

  .dt th {
    padding: 5px 7px;
    font-weight: 500;
    color: #6b7a99;
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid #1a2240;
  }

  .dt td {
    padding: 6px 7px;
    color: #c4d0e8;
    white-space: nowrap;
    border-bottom: 1px solid #131e30;
  }

  .dt tbody tr:hover {
    background: #1a2035;
  }

  .sm-dt th,
  .sm-dt td {
    padding: 5px 6px;
    font-size: 11px;
  }

  .total-row td {
    color: #e2e8f5;
    border-top: 1px solid #22d3ee44;
    border-bottom: none;
  }

  .row-selected {
    background: #1a2a3f !important;
  }

  .ch-name {
    font-weight: 500;
    color: #e2e8f5;
  }

  .val-cyan {
    font-weight: 600;
    color: #22d3ee;
  }

  .val-blue {
    color: #60a5fa;
  }

  .val-green {
    font-weight: 600;
    color: #10b981;
  }

  .val-muted {
    color: #6b7a99;
  }

  .plat-tag {
    display: inline-block;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 3px;
  }

  .plat-ios {
    color: #38bdf8;
    background: #1e3a5f;
  }

  .plat-android {
    color: #4ade80;
    background: #1e3d2a;
  }

  .reten-pill {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    border-radius: 3px;
  }

  .ret-high {
    color: #4ade80;
    background: #1e3d2a;
  }

  .ret-low {
    color: #86efac;
    background: #1e2a1e;
  }

  /* Dual Grid */
  .dual-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  /* Order List + Charts */
  .order-charts-grid {
    display: grid;
    grid-template-columns: 1fr 260px;
    gap: 12px;
  }

  .charts-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Order table */
  .order-dt td,
  .order-dt th {
    padding: 5px 6px;
    font-size: 11px;
  }

  .order-id {
    font-size: 10px;
    color: #22d3ee;
    cursor: pointer;
  }

  .order-id:hover {
    text-decoration: underline;
  }

  .order-product {
    max-width: 100px;
    overflow: hidden;
    color: #c4d0e8;
    text-overflow: ellipsis;
  }

  .status-tag {
    display: inline-block;
    padding: 1px 7px;
    font-size: 10px;
    font-weight: 600;
    border-radius: 3px;
  }

  .st-ok {
    color: #10b981;
    background: #064e3b;
  }

  .st-refund {
    color: #fb923c;
    background: #3b1c00;
  }

  .st-fail {
    color: #f87171;
    background: #3b1c1c;
  }

  .link-btn {
    font-size: 11px;
    color: #22d3ee;
    cursor: pointer;
  }

  .link-btn:hover {
    text-decoration: underline;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .record-count {
    font-size: 11px;
    color: #5a6a8a;
  }

  .pagination {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 10px;
    font-size: 12px;
  }

  .page-btn {
    padding: 2px 6px;
    color: #6b7a99;
    cursor: pointer;
  }

  .page-btn:hover {
    color: #22d3ee;
  }

  .page-cur {
    padding: 2px 8px;
    color: #22d3ee;
    background: #22d3ee20;
    border-radius: 3px;
  }

  .page-info {
    margin-left: auto;
    color: #5a6a8a;
  }

  /* ── Order Detail Panel ───────────────────────── */
  .detail-panel {
    @include ap-neon-bg;

    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-self: flex-start;
    width: 320px;
    max-height: calc(100vh - 120px);
    overflow: hidden;
    overflow-y: auto;
    border-radius: 14px;
  }

  .detail-header {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid #1a2240;
  }

  .detail-title {
    display: flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    font-size: 14px;
    font-weight: 600;
    color: #c4d0e8;
  }

  .detail-order-id {
    font-size: 11px;
    color: #6b7a99;
  }

  .close-btn {
    padding: 2px;
    font-size: 16px;
    color: #6b7a99;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #e2e8f5;
  }

  .pay-status {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #1a2240;
  }

  .pay-status--ok {
    background: #0d2a1a;
  }

  .pay-status--refund {
    background: #3b1c00;
  }

  .pay-status--fail {
    background: #3b1c1c;
  }

  .pay-ok-dot {
    font-size: 14px;
    font-weight: 700;
    color: #10b981;
  }

  .pay-status--refund .pay-ok-dot,
  .pay-status--refund .pay-ok-text {
    color: #fb923c;
  }

  .pay-status--fail .pay-ok-dot,
  .pay-status--fail .pay-ok-text {
    color: #f87171;
  }

  .pay-ok-text {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: #10b981;
  }

  .pay-amount {
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f5;
  }

  .detail-sections {
    padding: 0 16px;
  }

  .detail-section {
    padding: 12px 0;
    border-bottom: 1px solid #1a2240;
  }

  .detail-section:last-child {
    border-bottom: none;
  }

  .ds-title {
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #8892a8;
  }

  .ds-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ds-row {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .ds-k {
    flex-shrink: 0;
    min-width: 80px;
    font-size: 11px;
    color: #6b7a99;
    white-space: nowrap;
  }

  .ds-v {
    font-size: 11px;
    color: #c4d0e8;
    text-align: right;
    word-break: break-all;
  }

  .ds-v--country {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: flex-end;
  }

  .detail-footer {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 6px;
    padding: 12px 16px;
    border-top: 1px solid #1a2240;
  }

  .detail-btn {
    font-size: 11px;
    color: #a0b0cc !important;
    background: #1a2240 !important;
    border-color: #2a3450 !important;
  }

  .detail-btn-primary {
    font-size: 11px;
    color: #22d3ee !important;
    background: #22d3ee22 !important;
    border-color: #22d3ee44 !important;
  }

  .detail-btn-outline {
    font-size: 11px;
    color: #8892a8 !important;
    background: transparent !important;
    border-color: #2a3450 !important;
  }

  /* ── Slide Transition ─────────────────────────── */
  .slide-enter-active,
  .slide-leave-active {
    transition: all 0.25s ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  /* ── Element Plus overrides ───────────────────── */
  :deep(.fi-sel .el-input__wrapper),
  :deep(.fi-search .el-input__wrapper) {
    background: #1a2240 !important;
    border: 1px solid #2a3450 !important;
    box-shadow: none !important;
  }

  :deep(.fi-sel .el-input__inner),
  :deep(.fi-search .el-input__inner) {
    font-size: 12px;
    color: #e2e8f5 !important;
  }

  /* Scrollbar */
  .detail-panel::-webkit-scrollbar {
    width: 4px;
  }

  .detail-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .detail-panel::-webkit-scrollbar-thumb {
    background: #1e2a44;
    border-radius: 2px;
  }

  /* ── Responsive ───────────────────────────────── */
  @media (width <= 1200px) {
    .kpi-row {
      grid-template-columns: repeat(2, 1fr);
    }

    .dual-grid {
      grid-template-columns: 1fr;
    }

    .order-charts-grid {
      grid-template-columns: 1fr;
    }

    .charts-col {
      flex-flow: row wrap;
    }

    .charts-col .card {
      flex: 1 1 calc(50% - 6px);
      min-width: 320px;
    }

    .detail-panel {
      position: relative;
      top: auto;
      width: 100%;
      max-height: none;
    }

    .detail-open .left-content {
      flex: 1;
    }
  }

  @media (width <= 768px) {
    .kpi-row {
      grid-template-columns: 1fr;
    }

    .charts-col {
      flex-direction: column;
    }

    .charts-col .card {
      flex: 1 1 100%;
      min-width: 0;
    }

    .fi-sel,
    .fi-search {
      flex: 1 1 calc(50% - 6px);
      width: auto;
    }

    .filter-row-actions {
      width: 100%;
      margin-left: 0;
    }

    .filter-row-actions .el-button {
      flex: 1 1 auto;
    }
  }
</style>
