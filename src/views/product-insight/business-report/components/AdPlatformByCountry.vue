<template>
  <div class="apc-wrap">
    <!-- Header -->
    <div class="apc-header">
      <span class="title-main">整体</span>
      <span class="title-main">全部平台</span>
      <span class="period-badge">{{ periodLabel }}</span>
      <span class="period-text">{{ dateLabel }}</span>
    </div>

    <!-- Scrollable Table -->
    <div class="table-scroll">
      <table class="apc-table">
        <colgroup>
          <col style="width: 16%" /><!-- 应用 -->
          <col style="width: 5%" />
          <!-- 平台 -->
          <col style="width: 6%" />
          <!-- 广告平台 -->
          <col style="width: 5%" />
          <!-- 国家 -->
          <col style="width: 6%" />
          <!-- 广告支出 -->
          <col style="width: 5%" />
          <!-- 环比 -->
          <col style="width: 5%" />
          <!-- 买量用户 -->
          <col style="width: 5%" />
          <!-- 广告系列数 -->
          <col style="width: 4%" />
          <!-- CPI -->
          <col style="width: 4%" />
          <!-- CPM -->
          <col style="width: 4%" />
          <!-- CPC -->
          <col style="width: 5%" />
          <!-- 首日ROI -->
          <col style="width: 5%" />
          <!-- 3日ROI -->
          <col style="width: 5%" />
          <!-- 7日ROI -->
          <col style="width: 5%" />
          <!-- 14日ROI -->
          <col style="width: 5%" />
          <!-- 30日ROI -->
          <col style="width: 5%" />
          <!-- 预估利润 -->
        </colgroup>
        <thead>
          <tr>
            <th class="col-name sticky-left">应用</th>
            <th class="col-sm">平台</th>
            <th class="col-sm">广告平台</th>
            <th class="col-sm">国家</th>
            <th class="col-num">广告支出</th>
            <th class="col-num">{{ changeLabel }}</th>
            <th class="col-num">买量用户</th>
            <th class="col-num">广告系列数</th>
            <th class="col-num">CPI</th>
            <th class="col-num">CPM</th>
            <th class="col-num">CPC</th>
            <th class="col-num roi-h">首日ROI</th>
            <th class="col-num roi-h">3日ROI</th>
            <th class="col-num roi-h">7日ROI</th>
            <th class="col-num roi-h">14日ROI</th>
            <th class="col-num roi-h">30日ROI</th>
            <th class="col-num">预估利润</th>
          </tr>
        </thead>
        <tbody>
          <!-- ── 整体 App Level Row ── -->
          <tr class="row-app" @click="appExpanded = !appExpanded">
            <td class="sticky-left" colspan="4">
              <div class="expand-cell">
                <span class="expand-icon" :class="{ open: appExpanded }">▶</span>
                <span class="app-label">整体</span>
              </div>
            </td>
            <td colspan="13"></td>
          </tr>

          <template v-if="appExpanded">
            <template v-for="os in tableData" :key="os.id">
              <!-- ── OS Level Row ── -->
              <tr class="row-os" @click="toggleOs(os.id)">
                <td class="sticky-left" colspan="4">
                  <div class="expand-cell indent-1">
                    <span class="expand-icon" :class="{ open: expandedOs.has(os.id) }">▶</span>
                    <span class="folder-icon">📁</span>
                    <span class="row-label">{{ os.name }}</span>
                  </div>
                </td>
                <td colspan="13"></td>
              </tr>

              <template v-if="expandedOs.has(os.id)">
                <template v-for="platform in os.platforms" :key="platform.id">
                  <!-- ── Collapsed Platform Row ── -->
                  <tr
                    v-if="!expandedPlatforms.has(platform.id)"
                    class="row-platform-collapsed"
                    @click="togglePlatform(platform.id)"
                  >
                    <td class="sticky-left" colspan="4">
                      <div class="expand-cell indent-2">
                        <span class="expand-icon">▶</span>
                        <span
                          class="platform-logo"
                          :style="{
                            background: platform.color + '33',
                            color: platform.color,
                            border: '1px solid ' + platform.color + '66'
                          }"
                          >{{ platform.logo }}</span
                        >
                        <span class="hint-text"
                          >[ {{ platform.name }} ... + {{ platform.countries.length }} 个国家
                          ]</span
                        >
                      </div>
                    </td>
                    <td colspan="13"></td>
                  </tr>

                  <!-- ── Expanded Platform ── -->
                  <template v-else>
                    <!-- Platform Row -->
                    <tr class="row-platform" @click="togglePlatform(platform.id)">
                      <td class="sticky-left" colspan="4">
                        <div class="expand-cell indent-2">
                          <span class="expand-icon open">▶</span>
                          <span
                            class="platform-logo"
                            :style="{
                              background: platform.color + '33',
                              color: platform.color,
                              border: '1px solid ' + platform.color + '66'
                            }"
                            >{{ platform.logo }}</span
                          >
                          <span class="row-label">{{ platform.name }}</span>
                        </div>
                      </td>
                      <td>{{ platform.spend }}</td>
                      <td :class="changeClass(platform.change)">{{ platform.change }}</td>
                      <td>{{ platform.users }}</td>
                      <td class="center">{{ platform.campaigns }}</td>
                      <td>{{ platform.cpi }}</td>
                      <td>{{ platform.cpm }}</td>
                      <td>{{ platform.cpc }}</td>
                      <td :class="roiClass(platform.roi1d)">{{ platform.roi1d }}</td>
                      <td :class="roiClass(platform.roi3d)">{{ platform.roi3d }}</td>
                      <td :class="roiClass(platform.roi7d)">{{ platform.roi7d }}</td>
                      <td :class="roiClass(platform.roi14d)">{{ platform.roi14d }}</td>
                      <td :class="roiClass(platform.roi30d)">{{ platform.roi30d }}</td>
                      <td>{{ platform.profit }}</td>
                    </tr>

                    <!-- Country Rows -->
                    <tr v-for="country in platform.countries" :key="country.id" class="row-country">
                      <td class="sticky-left" colspan="4">
                        <div class="expand-cell indent-3">
                          <span
                            v-if="countryFiClass(country.flag)"
                            class="fi country-fi"
                            :class="countryFiClass(country.flag)"
                          />
                          <span v-else class="flag">{{ country.flag }}</span>
                          <span class="row-label">{{ country.name }}</span>
                        </div>
                      </td>
                      <td>{{ country.spend }}</td>
                      <td :class="changeClass(country.change)">{{ country.change }}</td>
                      <td>{{ country.users }}</td>
                      <td class="center">{{ country.campaigns }}</td>
                      <td>{{ country.cpi }}</td>
                      <td>{{ country.cpm }}</td>
                      <td>{{ country.cpc }}</td>
                      <td :class="roiClass(country.roi1d)">{{ country.roi1d }}</td>
                      <td :class="roiClass(country.roi3d)">{{ country.roi3d }}</td>
                      <td :class="roiClass(country.roi7d)">{{ country.roi7d }}</td>
                      <td :class="roiClass(country.roi14d)">{{ country.roi14d }}</td>
                      <td :class="roiClass(country.roi30d)">{{ country.roi30d }}</td>
                      <td>{{ country.profit }}</td>
                    </tr>

                    <!-- Platform Subtotal Row -->
                    <tr class="row-subtotal" :style="{ '--pc': platform.color }">
                      <td class="sticky-left" colspan="4">
                        <div class="expand-cell indent-2">
                          <span class="subtotal-label">{{ platform.name }}小计</span>
                        </div>
                      </td>
                      <td
                        ><strong>{{ platform.subtotalSpend }}</strong></td
                      >
                      <td :class="changeClass(platform.subtotalChange)">{{
                        platform.subtotalChange
                      }}</td>
                      <td
                        ><strong>{{ platform.subtotalUsers }}</strong></td
                      >
                      <td class="center"
                        ><strong>{{ platform.subtotalCampaigns }}</strong></td
                      >
                      <td>{{ platform.subtotalCpi }}</td>
                      <td>{{ platform.subtotalCpm }}</td>
                      <td>{{ platform.subtotalCpc }}</td>
                      <td :class="roiClass(platform.subtotalRoi1d)">{{
                        platform.subtotalRoi1d
                      }}</td>
                      <td :class="roiClass(platform.subtotalRoi3d)">{{
                        platform.subtotalRoi3d
                      }}</td>
                      <td :class="roiClass(platform.subtotalRoi7d)">{{
                        platform.subtotalRoi7d
                      }}</td>
                      <td :class="roiClass(platform.subtotalRoi14d)">{{
                        platform.subtotalRoi14d
                      }}</td>
                      <td :class="roiClass(platform.subtotalRoi30d)">{{
                        platform.subtotalRoi30d
                      }}</td>
                      <td
                        ><strong>{{ platform.subtotalProfit }}</strong></td
                      >
                    </tr>
                  </template>
                </template>
              </template>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="apc-footer">
      <span>共 {{ totalPlatforms }} 个广告平台 | {{ totalCountries }} 个国家</span>
      <button class="push-btn" type="button" @click="openPushModal()">立即推送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import 'flag-icons/css/flag-icons.min.css'
  import { ref, computed, inject } from 'vue'
  import type { ApcOsEntry, PlatformCountryRow } from '../types'
  import { businessReportContextKey } from '../composables/business-report-context'
  import { adPlatformByCountryData } from '../mockData'

  const props = defineProps<{
    period: 'daily' | 'weekly' | 'monthly'
  }>()

  const openPushModal = inject<() => void>('openPushModal', () => {})
  const ctx = inject(businessReportContextKey)

  const periodLabel = computed(() =>
    props.period === 'daily' ? '日报' : props.period === 'weekly' ? '周报' : '月报'
  )
  const dateLabel = computed(() => {
    const range = ctx?.reportRange.value
    if (!range) return '--'
    if (props.period === 'monthly') return range.startDate.slice(0, 7)
    if (props.period === 'weekly') return `${range.startDate} - ${range.endDate}`
    return range.startDate
  })
  const changeLabel = computed(() =>
    props.period === 'daily' ? '日环比' : props.period === 'weekly' ? '周环比' : '月环比'
  )

  const appExpanded = ref(true)
  const expandedOs = ref<Set<string>>(new Set(['android']))
  const expandedPlatforms = ref<Set<string>>(new Set(['android-google', 'android-facebook']))

  function toggleOs(id: string) {
    if (expandedOs.value.has(id)) expandedOs.value.delete(id)
    else expandedOs.value.add(id)
  }
  function togglePlatform(id: string) {
    if (expandedPlatforms.value.has(id)) expandedPlatforms.value.delete(id)
    else expandedPlatforms.value.add(id)
  }

  function changeClass(val: string) {
    if (!val) return ''
    const n = parseFloat(val)
    if (n > 0) return 'positive'
    if (n < 0) return 'negative'
    return ''
  }

  function roiClass(val: string) {
    if (!val || val === '-') return ''
    const n = parseFloat(val)
    if (n >= 100) return 'roi-green'
    if (n >= 70) return 'roi-teal'
    return 'roi-orange'
  }

  const PLATFORM_VISUAL_MAP: Record<string, { logo: string; color: string }> = {
    google: { logo: 'G', color: '#4285F4' },
    facebook: { logo: 'f', color: '#1877F2' },
    unity: { logo: 'U', color: '#22C55E' },
    mintegral: { logo: 'M', color: '#F59E0B' },
    tiktok: { logo: '♪', color: '#FF4D4F' },
    snapchat: { logo: '👻', color: '#FFFC00' },
    kwai: { logo: 'K', color: '#F97316' },
    newsbreak: { logo: 'N', color: '#60A5FA' }
  }

  const DEFAULT_PLATFORM_VISUAL = { logo: '•', color: '#64748B' }

  function getPlatformVisual(name: string) {
    const key = name.trim().toLowerCase()
    return PLATFORM_VISUAL_MAP[key] ?? DEFAULT_PLATFORM_VISUAL
  }

  function asMetricText(value: string | number | null | undefined): string {
    if (value == null || value === '') return '-'
    return String(value)
  }

  function parseCountryCodeFromEmoji(flag: string): string | undefined {
    const symbols = [...flag].filter((char) => {
      const codePoint = char.codePointAt(0) ?? 0
      return codePoint >= 0x1f1e6 && codePoint <= 0x1f1ff
    })
    if (symbols.length < 2) return undefined
    const code = symbols
      .slice(0, 2)
      .map((char) => {
        const codePoint = char.codePointAt(0) ?? 0
        const offset = codePoint - 0x1f1e6
        return String.fromCharCode(97 + offset)
      })
      .join('')
      .toLowerCase()
    return /^[a-z]{2}$/.test(code) ? code : undefined
  }

  function countryFiClass(flag: string): string | undefined {
    const code = parseCountryCodeFromEmoji(flag)
    return code ? `fi-${code}` : undefined
  }

  const tableData = computed<ApcOsEntry[]>(() => {
    const api = ctx?.platformCountry.value?.osEntries
    const flatRows = ctx?.platformCountry.value?.flatRows ?? []
    if (api && api.length) {
      const flatPlatformMap = new Map<string, PlatformCountryRow>()
      const flatCountryByPlatform = new Map<string, PlatformCountryRow[]>()

      flatRows.forEach((row) => {
        if (row.level === 'platform') {
          flatPlatformMap.set(row.id, row)
          return
        }
        if (row.level === 'country') {
          const parentPlatformId = row.id.split('-').slice(0, 2).join('-')
          const bucket = flatCountryByPlatform.get(parentPlatformId) ?? []
          bucket.push(row)
          flatCountryByPlatform.set(parentPlatformId, bucket)
        }
      })

      return api.map((os) => ({
        ...os,
        platforms: os.platforms.map((platform) => {
          const flatPlatform = flatPlatformMap.get(platform.id)
          const visual = getPlatformVisual(platform.name)
          const flatCountries = flatCountryByPlatform.get(platform.id) ?? []
          const normalizedCountries = platform.countries.map((country) => {
            const flatCountry =
              flatCountries.find((item) => item.country === country.name) ??
              flatCountries.find((item) => item.id.endsWith(`-${country.id.split('-').pop()}`))
            return {
              ...country,
              users: asMetricText(flatCountry?.acquisitions),
              campaigns: flatCountry?.campaigns ?? 0,
              cpi: asMetricText(flatCountry?.cpi),
              cpm: asMetricText(flatCountry?.cpm),
              cpc: asMetricText(flatCountry?.cpc),
              roi1d: asMetricText(flatCountry?.roi1d),
              roi3d: asMetricText(flatCountry?.roi3d),
              roi7d: asMetricText(flatCountry?.roi7d),
              roi14d: asMetricText(flatCountry?.roi14d),
              roi30d: asMetricText(flatCountry?.roi30d),
              profit: asMetricText(flatCountry?.profit)
            }
          })

          return {
            ...platform,
            logo: (platform as { logo?: string }).logo || visual.logo,
            color: (platform as { color?: string }).color || visual.color,
            users: asMetricText(flatPlatform?.acquisitions),
            campaigns: flatPlatform?.campaigns ?? 0,
            cpi: asMetricText(flatPlatform?.cpi),
            cpm: asMetricText(flatPlatform?.cpm),
            cpc: asMetricText(flatPlatform?.cpc),
            roi1d: asMetricText(flatPlatform?.roi1d),
            roi3d: asMetricText(flatPlatform?.roi3d),
            roi7d: asMetricText(flatPlatform?.roi7d),
            roi14d: asMetricText(flatPlatform?.roi14d),
            roi30d: asMetricText(flatPlatform?.roi30d),
            profit: asMetricText(flatPlatform?.profit),
            subtotalSpend: asMetricText(platform.spend),
            subtotalChange: asMetricText(platform.change),
            subtotalUsers: asMetricText(flatPlatform?.acquisitions),
            subtotalCampaigns: flatPlatform?.campaigns ?? 0,
            subtotalCpi: asMetricText(flatPlatform?.cpi),
            subtotalCpm: asMetricText(flatPlatform?.cpm),
            subtotalCpc: asMetricText(flatPlatform?.cpc),
            subtotalRoi1d: asMetricText(flatPlatform?.roi1d),
            subtotalRoi3d: asMetricText(flatPlatform?.roi3d),
            subtotalRoi7d: asMetricText(flatPlatform?.roi7d),
            subtotalRoi14d: asMetricText(flatPlatform?.roi14d),
            subtotalRoi30d: asMetricText(flatPlatform?.roi30d),
            subtotalProfit: asMetricText(flatPlatform?.profit),
            countries: normalizedCountries
          }
        })
      }))
    }
    return adPlatformByCountryData
  })

  const totalPlatforms = computed(() => {
    const r = ctx?.platformCountry.value
    if (r?.totalPlatforms != null && r.totalPlatforms > 0) return r.totalPlatforms
    return tableData.value.reduce((acc, os) => acc + os.platforms.length, 0)
  })
  const totalCountries = computed(() => {
    const r = ctx?.platformCountry.value
    if (r?.totalCountries != null && r.totalCountries > 0) return r.totalCountries
    return tableData.value.reduce(
      (acc, os) => acc + os.platforms.reduce((pacc, p) => pacc + p.countries.length, 0),
      0
    )
  })
</script>

<style scoped>
  .apc-wrap {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0;
    padding: 14px 14px 0;
    overflow: hidden;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 12px;
  }

  /* ── Header ─────────────────────────────────────────────────── */
  .apc-header {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
  }

  .title-main {
    font-size: 18px;
    font-weight: 700;
    color: rgb(255 255 255 / 90%);
  }

  .period-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    color: #000;
    background: #00d4a1;
    border-radius: 4px;
  }

  .period-text {
    font-size: 13px;
    color: rgb(255 255 255 / 55%);
  }

  /* ── Table Scroll ────────────────────────────────────────────── */
  .table-scroll {
    flex: 1;
    overflow: auto;
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 8px;
  }

  .apc-table {
    width: 100%;
    min-width: 100%;
    font-size: 12px;
    table-layout: fixed;
    border-collapse: collapse;
  }

  /* ── thead ──────────────────────────────────────────────────── */
  .apc-table thead {
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .apc-table th {
    padding: 10px 12px;
    font-size: 11px;
    font-weight: 500;
    color: rgb(255 255 255 / 42%);
    text-align: right;
    background: #08121f;
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  .apc-table th.col-name,
  .apc-table th.col-sm {
    text-align: left;
  }

  /* ── Columns: widths set via <colgroup> above ─────────────────── */

  .roi-h {
    color: rgb(255 255 255 / 55%) !important;
  }

  /* ── td base ─────────────────────────────────────────────────── */
  .apc-table td,
  .apc-table th {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .apc-table td {
    padding: 8px 12px;
    text-align: right;
    vertical-align: middle;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .apc-table td.center {
    text-align: center;
  }

  /* ── Sticky Left Column ──────────────────────────────────────── */
  .sticky-left {
    position: sticky;
    left: 0;
    z-index: 5;
    text-align: left !important;
  }

  .apc-table thead th.sticky-left {
    z-index: 25;
    background: #08121f;
  }

  /* ── Expand Cell ─────────────────────────────────────────────── */
  .expand-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .indent-1 {
    padding-left: 16px;
  }

  .indent-2 {
    padding-left: 36px;
  }

  .indent-3 {
    padding-left: 60px;
  }

  .expand-icon {
    display: inline-block;
    flex-shrink: 0;
    width: 12px;
    font-size: 8px;
    color: rgb(255 255 255 / 38%);
    cursor: pointer;
    transition: transform 0.18s;
  }

  .expand-icon.open {
    transform: rotate(90deg);
  }

  .folder-icon {
    flex-shrink: 0;
    font-size: 13px;
  }

  .row-label {
    font-size: 12px;
    color: rgb(255 255 255 / 85%);
  }

  .app-label {
    font-size: 13px;
    font-weight: 600;
    color: #fff;
  }

  .flag {
    flex-shrink: 0;
    font-size: 14px;
  }

  .country-fi {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    overflow: hidden;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgb(255 255 255 / 12%);
  }

  .platform-logo {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-size: 10px;
    font-weight: 700;
    border-radius: 5px;
  }

  /* ── Row: App (整体) ─────────────────────────────────────────── */
  .row-app {
    cursor: pointer;
    background: linear-gradient(90deg, rgb(0 100 70 / 45%), rgb(0 50 35 / 25%));
    border-bottom: 1px solid rgb(0 212 161 / 18%);
  }

  .row-app:hover {
    background: linear-gradient(90deg, rgb(0 120 85 / 55%), rgb(0 65 45 / 35%));
  }

  .row-app .sticky-left {
    background: linear-gradient(90deg, #042a1c, #041a10);
  }

  .row-app:hover .sticky-left {
    background: linear-gradient(90deg, #063422, #052014);
  }

  /* ── Row: OS ─────────────────────────────────────────────────── */
  .row-os {
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border-bottom: 1px solid rgb(255 255 255 / 6%);
  }

  .row-os:hover {
    background: rgb(255 255 255 / 7%);
  }

  .row-os .sticky-left {
    background: #0d1829;
  }

  .row-os:hover .sticky-left {
    background: #111f35;
  }

  /* ── Row: Platform ───────────────────────────────────────────── */
  .row-platform {
    cursor: pointer;
    background: rgb(255 255 255 / 2%);
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .row-platform:hover {
    background: rgb(255 255 255 / 5%);
  }

  .row-platform .sticky-left {
    background: #0a1528;
  }

  .row-platform:hover .sticky-left {
    background: #0e1e36;
  }

  /* ── Row: Platform Collapsed ─────────────────────────────────── */
  .row-platform-collapsed {
    cursor: pointer;
    background: transparent;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .row-platform-collapsed:hover {
    background: rgb(255 255 255 / 3%);
  }

  .row-platform-collapsed .sticky-left {
    background: #090f1e;
  }

  .row-platform-collapsed:hover .sticky-left {
    background: #0d1428;
  }

  .hint-text {
    font-size: 11px;
    color: rgb(255 255 255 / 38%);
  }

  /* ── Row: Country ────────────────────────────────────────────── */
  .row-country {
    background: transparent;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .row-country:hover {
    background: rgb(255 255 255 / 3%);
  }

  .row-country .sticky-left {
    background: #090f1e;
  }

  .row-country:hover .sticky-left {
    background: #0d1428;
  }

  /* ── Row: Subtotal ───────────────────────────────────────────── */
  .row-subtotal {
    background: color-mix(in srgb, var(--pc, #00d4a1) 10%, transparent);
    border-top: 1px solid color-mix(in srgb, var(--pc, #00d4a1) 22%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--pc, #00d4a1) 12%, transparent);
  }

  .row-subtotal .sticky-left {
    background: color-mix(in srgb, var(--pc, #00d4a1) 14%, #090f1e);
  }

  .subtotal-label {
    font-size: 12px;
    font-weight: 600;
    color: color-mix(in srgb, var(--pc, #00d4a1) 90%, #fff);
  }

  /* ── Change ──────────────────────────────────────────────────── */
  .positive {
    font-weight: 500;
    color: #00d4a1;
  }

  .negative {
    font-weight: 500;
    color: #f87171;
  }

  /* ── ROI Colors ──────────────────────────────────────────────── */
  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-teal {
    font-weight: 600;
    color: #2dd4bf;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }

  /* ── Footer ──────────────────────────────────────────────────── */
  .apc-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0 12px;
    font-size: 12px;
    color: rgb(255 255 255 / 38%);
  }

  .push-btn {
    padding: 6px 18px;
    font-size: 12px;
    font-weight: 600;
    color: #000;
    cursor: pointer;
    background: #00d4a1;
    border: none;
    border-radius: 9999px;
    transition: filter 0.15s;
  }

  .push-btn:hover {
    filter: brightness(1.1);
  }
</style>
