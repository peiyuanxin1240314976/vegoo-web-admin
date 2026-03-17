<template>
  <div class="tab-app-platform">
    <div class="view-toolbar">
      <span class="view-desc">{{ viewDesc }}</span>
      <div class="group-toggle">
        <span class="toggle-label" :class="{ active: groupBy === 'app' }" @click="groupBy = 'app'">
          {{ $t('myAds.appPlatform.groupByApp') }}
        </span>
        <ElSwitch v-model="groupByPlatform" inline-prompt :active-text="''" :inactive-text="''" />
        <span
          class="toggle-label"
          :class="{ active: groupBy === 'platform' }"
          @click="groupBy = 'platform'"
        >
          {{ $t('myAds.appPlatform.groupByPlatform') }}
        </span>
      </div>
    </div>

    <div class="app-groups">
      <!-- 第一行：天气预报，3 张卡撑满整行 -->
      <template v-if="firstGroup">
        <div class="app-group app-group--row-full">
          <div class="app-group__header">
            <span class="app-icon" :class="'app-icon--' + (firstGroup.appIcon || 'default')"></span>
            <span class="app-name">{{ firstGroup.appName }}</span>
            <span class="app-group__meta">
              {{ $t('myAds.appPlatform.totalSpend') }}:
              <span class="value success">${{ formatNum(firstGroup.totalSpend) }}</span>
              {{ $t('myAds.appPlatform.avgRoi') }}: {{ firstGroup.avgFirstDayRoi }}%
              {{ $t('myAds.appPlatform.platformCount') }}: {{ firstGroup.platformCount
              }}{{ platformUnit }}
            </span>
          </div>
          <div class="platform-cards platform-cards--cols-3">
            <div
              v-for="(plat, pIdx) in firstGroup.platforms"
              :key="'0-' + pIdx"
              class="platform-card"
              :class="{ 'my-ads-card--warning': plat.isWarning }"
            >
              <div class="platform-card__top">
                <span class="platform-name">{{ plat.platformName }}</span>
                <span class="platform-country">
                  <span
                    class="country-flag"
                    :class="'fi fi-' + (plat.countryCode?.toLowerCase() || 'us')"
                  ></span>
                  {{ plat.country }}
                </span>
                <span class="platform-status" :class="'status--' + plat.status">
                  <span
                    class="my-ads-status-dot"
                    :class="
                      'is-' +
                      (plat.status === 'active'
                        ? 'active'
                        : plat.status === 'inactive'
                          ? 'inactive'
                          : 'warning')
                    "
                  ></span>
                  {{ plat.statusText }}
                </span>
              </div>
              <div v-if="plat.warning" class="platform-card__warning">▲ {{ plat.warning }}</div>
              <div class="platform-card__body">
                <div class="body-left">
                  <div class="row">
                    <span class="label">广告支出</span>
                    <span class="value">${{ formatNum(plat.spend) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">预算</span>
                    <span class="value">${{ formatNum(plat.budget) }}</span>
                  </div>
                  <div class="progress-row">
                    <div class="my-ads-progress-track">
                      <div
                        class="my-ads-progress-fill"
                        :class="
                          plat.progress >= 90
                            ? 'my-ads-progress-fill--danger'
                            : 'my-ads-progress-fill--normal'
                        "
                        :style="{ width: plat.progress + '%' }"
                      />
                    </div>
                    <span class="percent">{{ plat.progress }}%</span>
                  </div>
                </div>
                <div class="body-right">
                  <div class="row">
                    <span class="label">首日ROI</span>
                    <span class="value" :class="roiClass(plat)">{{
                      plat.firstDayRoi != null ? plat.firstDayRoi + '%' : '--'
                    }}</span>
                  </div>
                  <div class="row">
                    <span class="label">目标</span>
                    <span class="value"
                      >{{ plat.roiTarget }}%
                      <ElIcon v-if="plat.roiTrend === 'down'"><Bottom /></ElIcon
                    ></span>
                  </div>
                  <div class="row">
                    <span class="label">最低消耗</span>
                    <span class="value">${{ formatNum(plat.minConsumption) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">CPI</span>
                    <span class="value">{{
                      plat.cpi != null ? '$' + plat.cpi.toFixed(2) : '--'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 第二行：血糖监测 + 手机追踪，2+1 张卡撑满整行 -->
      <div v-if="secondRowGroups.length" class="app-group-row app-group-row--two">
        <div
          v-for="(group, gIdx) in secondRowGroups"
          :key="'row2-' + gIdx"
          class="app-group app-group--inline"
          :class="group.platforms.length === 1 ? 'app-group--one-card' : 'app-group--two-cards'"
        >
          <div class="app-group__header">
            <span class="app-icon" :class="'app-icon--' + (group.appIcon || 'default')"></span>
            <span class="app-name">{{ group.appName }}</span>
            <span class="app-group__meta">
              {{ $t('myAds.appPlatform.totalSpend') }}:
              <span class="value success">${{ formatNum(group.totalSpend) }}</span>
              {{ $t('myAds.appPlatform.avgRoi') }}: {{ group.avgFirstDayRoi }}%
              {{ $t('myAds.appPlatform.platformCount') }}: {{ group.platformCount
              }}{{ platformUnit }}
            </span>
          </div>
          <div
            class="platform-cards"
            :class="
              group.platforms.length === 1 ? 'platform-cards--cols-1' : 'platform-cards--cols-2'
            "
          >
            <div
              v-for="(plat, pIdx) in group.platforms"
              :key="'r2-' + gIdx + '-' + pIdx"
              class="platform-card"
              :class="{ 'my-ads-card--warning': plat.isWarning }"
            >
              <div class="platform-card__top">
                <span class="platform-name">{{ plat.platformName }}</span>
                <span class="platform-country">
                  <span
                    class="country-flag"
                    :class="'fi fi-' + (plat.countryCode?.toLowerCase() || 'us')"
                  ></span>
                  {{ plat.country }}
                </span>
                <span class="platform-status" :class="'status--' + plat.status">
                  <span
                    class="my-ads-status-dot"
                    :class="
                      'is-' +
                      (plat.status === 'active'
                        ? 'active'
                        : plat.status === 'inactive'
                          ? 'inactive'
                          : 'warning')
                    "
                  ></span>
                  {{ plat.statusText }}
                </span>
              </div>
              <div v-if="plat.warning" class="platform-card__warning">▲ {{ plat.warning }}</div>
              <div class="platform-card__body">
                <div class="body-left">
                  <div class="row">
                    <span class="label">广告支出</span>
                    <span class="value">${{ formatNum(plat.spend) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">预算</span>
                    <span class="value">${{ formatNum(plat.budget) }}</span>
                  </div>
                  <div class="progress-row">
                    <div class="my-ads-progress-track">
                      <div
                        class="my-ads-progress-fill"
                        :class="
                          plat.progress >= 90
                            ? 'my-ads-progress-fill--danger'
                            : 'my-ads-progress-fill--normal'
                        "
                        :style="{ width: plat.progress + '%' }"
                      />
                    </div>
                    <span class="percent">{{ plat.progress }}%</span>
                  </div>
                </div>
                <div class="body-right">
                  <div class="row">
                    <span class="label">首日ROI</span>
                    <span class="value" :class="roiClass(plat)">{{
                      plat.firstDayRoi != null ? plat.firstDayRoi + '%' : '--'
                    }}</span>
                  </div>
                  <div class="row">
                    <span class="label">目标</span>
                    <span class="value"
                      >{{ plat.roiTarget }}%
                      <ElIcon v-if="plat.roiTrend === 'down'"><Bottom /></ElIcon
                    ></span>
                  </div>
                  <div class="row">
                    <span class="label">最低消耗</span>
                    <span class="value">${{ formatNum(plat.minConsumption) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">CPI</span>
                    <span class="value">{{
                      plat.cpi != null ? '$' + plat.cpi.toFixed(2) : '--'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 若有超过 3 个应用组，其余按原样逐组排列 -->
      <template v-for="(group, gIdx) in restGroups" :key="'rest-' + gIdx">
        <div class="app-group app-group--row-full">
          <div class="app-group__header">
            <span class="app-icon" :class="'app-icon--' + (group.appIcon || 'default')"></span>
            <span class="app-name">{{ group.appName }}</span>
            <span class="app-group__meta">
              {{ $t('myAds.appPlatform.totalSpend') }}:
              <span class="value success">${{ formatNum(group.totalSpend) }}</span>
              {{ $t('myAds.appPlatform.avgRoi') }}: {{ group.avgFirstDayRoi }}%
              {{ $t('myAds.appPlatform.platformCount') }}: {{ group.platformCount
              }}{{ platformUnit }}
            </span>
          </div>
          <div
            class="platform-cards"
            :class="'platform-cards--cols-' + Math.min(group.platforms.length, 4)"
          >
            <div
              v-for="(plat, pIdx) in group.platforms"
              :key="'rest-' + gIdx + '-' + pIdx"
              class="platform-card"
              :class="{ 'my-ads-card--warning': plat.isWarning }"
            >
              <div class="platform-card__top">
                <span class="platform-name">{{ plat.platformName }}</span>
                <span class="platform-country">
                  <span
                    class="country-flag"
                    :class="'fi fi-' + (plat.countryCode?.toLowerCase() || 'us')"
                  ></span>
                  {{ plat.country }}
                </span>
                <span class="platform-status" :class="'status--' + plat.status">
                  <span
                    class="my-ads-status-dot"
                    :class="
                      'is-' +
                      (plat.status === 'active'
                        ? 'active'
                        : plat.status === 'inactive'
                          ? 'inactive'
                          : 'warning')
                    "
                  ></span>
                  {{ plat.statusText }}
                </span>
              </div>
              <div v-if="plat.warning" class="platform-card__warning">▲ {{ plat.warning }}</div>
              <div class="platform-card__body">
                <div class="body-left">
                  <div class="row">
                    <span class="label">广告支出</span>
                    <span class="value">${{ formatNum(plat.spend) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">预算</span>
                    <span class="value">${{ formatNum(plat.budget) }}</span>
                  </div>
                  <div class="progress-row">
                    <div class="my-ads-progress-track">
                      <div
                        class="my-ads-progress-fill"
                        :class="
                          plat.progress >= 90
                            ? 'my-ads-progress-fill--danger'
                            : 'my-ads-progress-fill--normal'
                        "
                        :style="{ width: plat.progress + '%' }"
                      />
                    </div>
                    <span class="percent">{{ plat.progress }}%</span>
                  </div>
                </div>
                <div class="body-right">
                  <div class="row">
                    <span class="label">首日ROI</span>
                    <span class="value" :class="roiClass(plat)">{{
                      plat.firstDayRoi != null ? plat.firstDayRoi + '%' : '--'
                    }}</span>
                  </div>
                  <div class="row">
                    <span class="label">目标</span>
                    <span class="value"
                      >{{ plat.roiTarget }}%
                      <ElIcon v-if="plat.roiTrend === 'down'"><Bottom /></ElIcon
                    ></span>
                  </div>
                  <div class="row">
                    <span class="label">最低消耗</span>
                    <span class="value">${{ formatNum(plat.minConsumption) }}</span>
                  </div>
                  <div class="row">
                    <span class="label">CPI</span>
                    <span class="value">{{
                      plat.cpi != null ? '$' + plat.cpi.toFixed(2) : '--'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 底部汇总 -->
    <div class="footer-summary">
      <span class="footer-item">
        {{ $t('myAds.appPlatform.appsSummary') }}: {{ footer.appCount
        }}{{ $t('myAds.appPlatform.appsUnit') }} | {{ footer.campaignCount
        }}{{ $t('myAds.appPlatform.campaignsCount') }}
      </span>
      <span class="footer-item">总广告支出 ${{ formatNum(footer.totalSpend) }}</span>
      <span class="footer-item warning" v-if="footer.overBudgetCount">
        {{ $t('myAds.appPlatform.overBudget') }}: {{ footer.overBudgetCount }}个
      </span>
      <span class="footer-item warning" v-if="footer.roiBelowCount">
        {{ $t('myAds.appPlatform.roiBelow') }}: {{ footer.roiBelowCount }}个
      </span>
      <span class="footer-item warning" v-if="footer.notStartedCount">
        {{ $t('myAds.appPlatform.notStarted') }}: {{ footer.notStartedCount }}个
      </span>
      <span class="footer-item">平均首日ROI: {{ footer.avgFirstDayRoi }}%</span>
      <span class="footer-item success"
        >{{ $t('myAds.appPlatform.estimatedProfit') }}: ${{
          formatNum(footer.estimatedTotalProfit)
        }}</span
      >
      <span class="footer-item success"
        >{{ $t('myAds.appPlatform.minProfit') }}: ${{ formatNum(footer.minTotalProfit) }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { Bottom } from '@element-plus/icons-vue'
  import type { MyAdsAppGroup, MyAdsFooterSummary, MyAdsPlatformCard } from '../types'

  defineOptions({ name: 'MyAdsTabAppPlatform' })

  const { t } = useI18n()

  const props = withDefaults(
    defineProps<{
      appGroups: MyAdsAppGroup[]
      viewDesc?: string
      groupBy?: 'app' | 'platform'
      footer: MyAdsFooterSummary
    }>(),
    {
      viewDesc: '应用视角 | 展示各应用在各广告平台的广告数据',
      groupBy: 'platform'
    }
  )

  const groupBy = ref<'app' | 'platform'>(props.groupBy)
  const groupByPlatform = computed({
    get: () => groupBy.value === 'platform',
    set: (v: boolean) => (groupBy.value = v ? 'platform' : 'app')
  })

  const viewDesc = computed(() => props.viewDesc)
  const footer = computed(() => props.footer)

  const platformUnit = computed(() => {
    const raw = t('myAds.appPlatform.campaignsCount') as string
    return raw.replace(/个广告组合| campaigns?/, '个')
  })

  /** 第一行：仅第一个应用组（天气预报），3 张卡撑满 */
  const firstGroup = computed(() => props.appGroups[0] ?? null)

  /** 第二行：第 2、3 个应用组（血糖监测 + 手机追踪）并排，3 张卡撑满 */
  const secondRowGroups = computed(() => props.appGroups.slice(1, 3))

  /** 其余应用组（若有第 4 个及以上） */
  const restGroups = computed(() => props.appGroups.slice(3))

  function formatNum(n: number) {
    return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  function roiClass(plat: MyAdsPlatformCard): string {
    if (plat.firstDayRoi == null) return ''
    if (plat.roiTarget && plat.firstDayRoi < plat.roiTarget) return 'my-ads-value--danger'
    return 'my-ads-value--success'
  }
</script>

<style lang="scss" scoped>
  @use '../styles/my-ads-common.scss' as *;

  .tab-app-platform {
    padding-bottom: 20px;
  }

  .view-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 13px;
    color: $my-ads-text-secondary;

    .view-desc {
      color: $my-ads-text-primary;
    }

    .group-toggle {
      display: flex;
      gap: 8px;
      align-items: center;

      .toggle-label {
        color: $my-ads-text-secondary;
        cursor: pointer;

        &.active {
          font-weight: 500;
          color: $my-ads-primary;
        }
      }
    }
  }

  .app-groups {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* 第一行：单组（如天气预报）整行，卡片撑满 */
  .app-group--row-full {
    width: 100%;
  }

  .platform-cards--cols-3 {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    width: 100%;
  }

  /* 第二行：血糖 + 手机追踪 并排，2+1 张卡撑满（三列等分效果：2fr 里两卡 + 1fr 里一卡） */
  .app-group-row--two {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
    align-items: stretch;
    width: 100%;
  }

  /* 两列等高，左侧 2 张卡各占 50% 列高，右侧 1 张卡占 50% 列高，使三张卡视觉等高 */
  .app-group-row--two .app-group--inline {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .app-group-row--two .app-group--inline .platform-cards {
    display: grid;
    flex: 1;
    min-height: 0;
  }

  .app-group-row--two .app-group--two-cards .platform-cards {
    grid-template-rows: 1fr 1fr;
    grid-template-columns: repeat(2, 1fr);
  }

  .app-group-row--two .app-group--one-card .platform-cards {
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr;
  }

  .app-group-row--two .app-group--one-card .platform-card {
    grid-row: 1;
  }

  .app-group-row--two .platform-card {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .app-group-row--two .platform-card .platform-card__body {
    flex: 1;
    min-height: 0;
  }

  .app-group--inline {
    min-width: 0;
  }

  .app-group--inline.app-group--two-cards .platform-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .app-group--inline.app-group--one-card .platform-cards {
    grid-template-columns: 1fr;
  }

  .platform-cards--cols-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    width: 100%;
  }

  .platform-cards--cols-1 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 14px;
    width: 100%;
  }

  .app-group__header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;

    .app-icon {
      width: 28px;
      height: 28px;
      background: rgb(148 163 184 / 30%);
      border-radius: 6px;

      &.app-icon--weather {
        background: linear-gradient(135deg, #93c5fd, #60a5fa);
      }

      &.app-icon--blood {
        background: linear-gradient(135deg, #f87171, #ef4444);
      }

      &.app-icon--phone {
        background: linear-gradient(135deg, #86efac, #22c55e);
      }
    }

    .app-name {
      font-weight: 600;
      color: $my-ads-text-primary;
    }

    .app-group__meta {
      margin-left: auto;
      font-size: 12px;
      color: $my-ads-text-secondary;

      .value.success {
        color: $my-ads-success;
      }
    }
  }

  .platform-cards {
    display: grid;
    gap: 14px;
  }

  /* 未指定列数时保持自适应（rest 等） */
  .platform-cards:not([class*='platform-cards--cols-']) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .platform-cards--cols-4 {
    grid-template-columns: repeat(4, 1fr);
    width: 100%;
  }

  .platform-card {
    padding: 14px;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;
    box-shadow: 0 10px 30px rgb(15 23 42 / 40%);

    .platform-card__top {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 10px;

      .platform-name {
        font-weight: 600;
        color: $my-ads-text-primary;
      }

      .platform-country {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        font-size: 12px;
        color: $my-ads-text-secondary;

        .country-flag {
          width: 16px;
          height: 12px;
          background-size: cover;
          border-radius: 2px;
        }
      }

      .platform-status {
        margin-left: auto;
        font-size: 12px;

        &.status--active {
          color: $my-ads-success;
        }

        &.status--inactive {
          color: $my-ads-text-secondary;
        }

        &.status--over_budget {
          color: $my-ads-warning;
        }
      }
    }

    .platform-card__warning {
      margin-bottom: 8px;
      font-size: 12px;
      color: $my-ads-warning;
    }

    .platform-card__body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      font-size: 12px;

      .row {
        display: flex;
        gap: 6px;
        justify-content: space-between;

        .label {
          color: $my-ads-text-secondary;
        }

        .value {
          color: $my-ads-text-primary;
        }
      }

      .progress-row {
        display: flex;
        grid-column: 1;
        gap: 8px;
        align-items: center;

        .my-ads-progress-track {
          flex: 1;
          min-width: 0;
        }

        .percent {
          flex-shrink: 0;
          color: $my-ads-text-secondary;
        }
      }
    }
  }

  .footer-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    padding: 14px 16px;
    margin-top: 20px;
    font-size: 13px;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;

    .footer-item {
      color: $my-ads-text-secondary;

      &.success {
        color: $my-ads-success;
      }

      &.warning {
        color: $my-ads-warning;
      }
    }
  }
</style>
