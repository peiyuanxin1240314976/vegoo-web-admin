<template>
  <div class="apc-wrap">
    <!-- Header -->
    <div class="apc-header">
      <span class="title-main">整体 全部平台</span>
      <span class="period-badge">{{ periodLabel }}</span>
      <span class="period-text">{{ dateLabel }}</span>
    </div>

    <!-- Scrollable Table -->
    <div class="table-scroll">
      <table class="apc-table">
        <thead>
          <tr>
            <th class="col-app sticky-left">应用</th>
            <th class="col-platform">平台</th>
            <th class="col-adplatform">广告平台</th>
            <th class="col-country">国家</th>
            <th class="col-num">广告支出</th>
            <th class="col-num">月环比</th>
            <th class="col-num">买量用户</th>
            <th class="col-num">广告系列数</th>
            <th class="col-num">CPI</th>
            <th class="col-num">CPM</th>
            <th class="col-num">CPC</th>
            <th class="col-num roi">首日ROI</th>
            <th class="col-num roi">3日ROI</th>
            <th class="col-num roi">7日ROI</th>
            <th class="col-num roi">14日ROI</th>
            <th class="col-num roi">30日ROI</th>
            <th class="col-num">预估利润</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="os in tableData" :key="os.id">
            <!-- OS Level Row -->
            <tr class="row-os" @click="toggleOs(os.id)">
              <td class="sticky-left">
                <div class="expand-cell">
                  <span class="expand-icon" :class="{ open: expandedOs.has(os.id) }">▶</span>
                  <span class="folder-icon">📁</span>
                  <span class="row-label">{{ os.name }}</span>
                </div>
              </td>
              <td colspan="16" class="os-summary">
                <span class="os-spend">{{ os.totalSpend }}</span>
                <span class="os-change" :class="changeClass(os.change)">{{ os.change }}</span>
                <span class="os-users">买量 {{ os.totalUsers }}</span>
              </td>
            </tr>

            <!-- Ad Platform Level Rows -->
            <template v-if="expandedOs.has(os.id)">
              <template v-for="platform in os.platforms" :key="platform.id">
                <!-- Platform Row -->
                <tr class="row-platform" @click="togglePlatform(platform.id)">
                  <td class="sticky-left">
                    <div class="expand-cell indent-1">
                      <span
                        class="expand-icon"
                        :class="{ open: expandedPlatforms.has(platform.id) }"
                        >▶</span
                      >
                      <span class="platform-logo" :style="{ background: platform.color }">{{
                        platform.logo
                      }}</span>
                      <span class="row-label">{{ platform.name }}</span>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{{ platform.spend }}</td>
                  <td :class="changeClass(platform.change)">{{ platform.change }}</td>
                  <td>{{ platform.users }}</td>
                  <td>{{ platform.campaigns }}</td>
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
                <template v-if="expandedPlatforms.has(platform.id)">
                  <tr v-for="country in platform.countries" :key="country.id" class="row-country">
                    <td class="sticky-left">
                      <div class="expand-cell indent-2">
                        <span class="flag">{{ country.flag }}</span>
                        <span class="row-label">{{ country.name }}</span>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>{{ country.spend }}</td>
                    <td :class="changeClass(country.change)">{{ country.change }}</td>
                    <td>{{ country.users }}</td>
                    <td>{{ country.campaigns }}</td>
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
                </template>

                <!-- Platform Subtotal -->
                <tr v-if="expandedPlatforms.has(platform.id)" class="row-subtotal">
                  <td class="sticky-left">
                    <div class="expand-cell indent-1">
                      <span class="subtotal-label">{{ platform.name }}小计</span>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td
                    ><strong>{{ platform.subtotalSpend }}</strong></td
                  >
                  <td :class="changeClass(platform.subtotalChange)">{{
                    platform.subtotalChange
                  }}</td>
                  <td
                    ><strong>{{ platform.subtotalUsers }}</strong></td
                  >
                  <td>{{ platform.subtotalCampaigns }}</td>
                  <td>{{ platform.cpi }}</td>
                  <td>{{ platform.cpm }}</td>
                  <td>{{ platform.cpc }}</td>
                  <td :class="roiClass(platform.roi1d)">{{ platform.roi1d }}</td>
                  <td :class="roiClass(platform.roi3d)">{{ platform.roi3d }}</td>
                  <td :class="roiClass(platform.roi7d)">{{ platform.roi7d }}</td>
                  <td :class="roiClass(platform.roi14d)">{{ platform.roi14d }}</td>
                  <td :class="roiClass(platform.roi30d)">{{ platform.roi30d }}</td>
                  <td
                    ><strong>{{ platform.profit }}</strong></td
                  >
                </tr>

                <!-- Collapsed Platform Row (show only name + "...+N国家") -->
                <tr
                  v-else-if="!expandedPlatforms.has(platform.id)"
                  class="row-collapsed-hint"
                  @click="togglePlatform(platform.id)"
                >
                  <td class="sticky-left" colspan="17">
                    <div class="expand-cell indent-1">
                      <span class="hint-text"
                        >{{ platform.name }} ... + {{ platform.countries.length }} 个国家</span
                      >
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="apc-footer">
      <span>共 {{ totalPlatforms }} 个广告平台 | {{ totalCountries }} 个国家</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface CountryEntry {
    id: string
    name: string
    flag: string
    spend: string
    change: string
    users: string
    campaigns: number
    cpi: string
    cpm: string
    cpc: string
    roi1d: string
    roi3d: string
    roi7d: string
    roi14d: string
    roi30d: string
    profit: string
  }
  interface PlatformEntry {
    id: string
    name: string
    logo: string
    color: string
    spend: string
    change: string
    users: string
    campaigns: number
    cpi: string
    cpm: string
    cpc: string
    roi1d: string
    roi3d: string
    roi7d: string
    roi14d: string
    roi30d: string
    profit: string
    subtotalSpend: string
    subtotalChange: string
    subtotalUsers: string
    subtotalCampaigns: number
    countries: CountryEntry[]
  }
  interface OsEntry {
    id: string
    name: string
    totalSpend: string
    change: string
    totalUsers: string
    platforms: PlatformEntry[]
  }

  const props = defineProps<{
    period: 'daily' | 'weekly' | 'monthly'
  }>()

  const periodLabel = computed(() =>
    props.period === 'daily' ? '日报' : props.period === 'weekly' ? '周报' : '月报'
  )
  const dateLabel = computed(() =>
    props.period === 'monthly'
      ? '2025年12月'
      : props.period === 'weekly'
        ? '2026年第10周 (3/9-3/15)'
        : '2026年3月13日'
  )

  const expandedOs = ref<Set<string>>(new Set(['android']))
  const expandedPlatforms = ref<Set<string>>(new Set(['android-google']))

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
    if (n >= 80) return 'roi-orange'
    return ''
  }

  const tableData = ref<OsEntry[]>([
    {
      id: 'android',
      name: '安卓',
      totalSpend: '$1,020,000',
      change: '+8.1%',
      totalUsers: '726万',
      platforms: [
        {
          id: 'android-google',
          name: 'Google',
          logo: 'G',
          color: '#4285F4',
          spend: '$456,000',
          change: '+8.1%',
          users: '180万',
          campaigns: 52,
          cpi: '$1.26',
          cpm: '$9.80',
          cpc: '$0.38',
          roi1d: '38%',
          roi3d: '68%',
          roi7d: '98%',
          roi14d: '101%',
          roi30d: '113%',
          profit: '$1,634,000',
          subtotalSpend: '$1,456,000',
          subtotalChange: '+7.8%',
          subtotalUsers: '880万',
          subtotalCampaigns: 169,
          countries: [
            {
              id: 'g-de',
              name: '德国',
              flag: '🇩🇪',
              spend: '$173,000',
              change: '+7.4%',
              users: '68万',
              campaigns: 20,
              cpi: '$1.26',
              cpm: '$9.20',
              cpc: '$0.36',
              roi1d: '37%',
              roi3d: '66%',
              roi7d: '96%',
              roi14d: '99%',
              roi30d: '110%',
              profit: '$620,000'
            },
            {
              id: 'g-jp',
              name: '日本',
              flag: '🇯🇵',
              spend: '$131,000',
              change: '+6.9%',
              users: '52万',
              campaigns: 15,
              cpi: '$1.26',
              cpm: '$9.10',
              cpc: '$0.35',
              roi1d: '37%',
              roi3d: '66%',
              roi7d: '96%',
              roi14d: '99%',
              roi30d: '110%',
              profit: '$469,000'
            },
            {
              id: 'g-kr',
              name: '韩国',
              flag: '🇰🇷',
              spend: '$102,000',
              change: '+9.2%',
              users: '40万',
              campaigns: 12,
              cpi: '$1.26',
              cpm: '$9.00',
              cpc: '$0.35',
              roi1d: '36%',
              roi3d: '65%',
              roi7d: '94%',
              roi14d: '97%',
              roi30d: '108%',
              profit: '$365,000'
            },
            {
              id: 'g-br',
              name: '巴西',
              flag: '🇧🇷',
              spend: '$86,000',
              change: '+5.3%',
              users: '136万',
              campaigns: 10,
              cpi: '$0.63',
              cpm: '$4.50',
              cpc: '$0.18',
              roi1d: '32%',
              roi3d: '57%',
              roi7d: '82%',
              roi14d: '85%',
              roi30d: '94%',
              profit: '$308,000'
            },
            {
              id: 'g-other',
              name: '其他 17个国家',
              flag: '🌐',
              spend: '$508,000',
              change: '+7.8%',
              users: '404万',
              campaigns: 60,
              cpi: '$1.26',
              cpm: '$9.00',
              cpc: '$0.35',
              roi1d: '35%',
              roi3d: '63%',
              roi7d: '91%',
              roi14d: '94%',
              roi30d: '104%',
              profit: '$1,820,000'
            }
          ]
        },
        {
          id: 'android-facebook',
          name: 'Facebook',
          logo: 'f',
          color: '#1877F2',
          spend: '$321,000',
          change: '+7.4%',
          users: '130万',
          campaigns: 37,
          cpi: '$1.24',
          cpm: '$8.70',
          cpc: '$0.34',
          roi1d: '35%',
          roi3d: '63%',
          roi7d: '91%',
          roi14d: '94%',
          roi30d: '104%',
          profit: '$1,150,000',
          subtotalSpend: '$1,023,000',
          subtotalChange: '+7.2%',
          subtotalUsers: '413万',
          subtotalCampaigns: 118,
          countries: [
            {
              id: 'fb-de',
              name: '德国',
              flag: '🇩🇪',
              spend: '$122,000',
              change: '+6.8%',
              users: '50万',
              campaigns: 14,
              cpi: '$1.24',
              cpm: '$8.20',
              cpc: '$0.32',
              roi1d: '34%',
              roi3d: '61%',
              roi7d: '88%',
              roi14d: '91%',
              roi30d: '101%',
              profit: '$437,000'
            }
          ]
        },
        {
          id: 'android-unity',
          name: 'Unity',
          logo: 'U',
          color: '#222C37',
          spend: '$143,000',
          change: '+6.9%',
          users: '90万',
          campaigns: 28,
          cpi: '$1.58',
          cpm: '$8.90',
          cpc: '$0.35',
          roi1d: '33%',
          roi3d: '60%',
          roi7d: '90%',
          roi14d: '93%',
          roi30d: '103%',
          profit: '$512,000',
          subtotalSpend: '$456,000',
          subtotalChange: '+6.9%',
          subtotalUsers: '286万',
          subtotalCampaigns: 88,
          countries: [
            {
              id: 'u-us',
              name: '美国',
              flag: '🇺🇸',
              spend: '$52,000',
              change: '+6.1%',
              users: '32万',
              campaigns: 8,
              cpi: '$1.62',
              cpm: '$9.10',
              cpc: '$0.37',
              roi1d: '34%',
              roi3d: '61%',
              roi7d: '91%',
              roi14d: '95%',
              roi30d: '105%',
              profit: '$186,000'
            },
            {
              id: 'u-jp',
              name: '日本',
              flag: '🇯🇵',
              spend: '$38,000',
              change: '+7.2%',
              users: '24万',
              campaigns: 6,
              cpi: '$1.58',
              cpm: '$8.90',
              cpc: '$0.35',
              roi1d: '33%',
              roi3d: '60%',
              roi7d: '90%',
              roi14d: '93%',
              roi30d: '103%',
              profit: '$136,000'
            },
            {
              id: 'u-other',
              name: '其他 22个国家',
              flag: '🌐',
              spend: '$53,000',
              change: '+6.5%',
              users: '34万',
              campaigns: 14,
              cpi: '$1.56',
              cpm: '$8.70',
              cpc: '$0.33',
              roi1d: '32%',
              roi3d: '58%',
              roi7d: '88%',
              roi14d: '91%',
              roi30d: '100%',
              profit: '$190,000'
            }
          ]
        },
        {
          id: 'android-mintegral',
          name: 'Mintegral',
          logo: 'M',
          color: '#E8770E',
          spend: '$98,000',
          change: '+9.2%',
          users: '62万',
          campaigns: 22,
          cpi: '$1.58',
          cpm: '$8.60',
          cpc: '$0.34',
          roi1d: '34%',
          roi3d: '61%',
          roi7d: '91%',
          roi14d: '94%',
          roi30d: '104%',
          profit: '$351,000',
          subtotalSpend: '$312,000',
          subtotalChange: '+9.2%',
          subtotalUsers: '197万',
          subtotalCampaigns: 70,
          countries: [
            {
              id: 'm-other',
              name: '多个国家',
              flag: '🌐',
              spend: '$98,000',
              change: '+9.2%',
              users: '62万',
              campaigns: 22,
              cpi: '$1.58',
              cpm: '$8.60',
              cpc: '$0.34',
              roi1d: '34%',
              roi3d: '61%',
              roi7d: '91%',
              roi14d: '94%',
              roi30d: '104%',
              profit: '$351,000'
            }
          ]
        },
        {
          id: 'android-tiktok',
          name: 'TikTok',
          logo: '♪',
          color: '#010101',
          spend: '$60,000',
          change: '+5.3%',
          users: '38万',
          campaigns: 14,
          cpi: '$1.56',
          cpm: '$8.20',
          cpc: '$0.32',
          roi1d: '31%',
          roi3d: '57%',
          roi7d: '85%',
          roi14d: '87%',
          roi30d: '97%',
          profit: '$214,800',
          subtotalSpend: '$191,000',
          subtotalChange: '+5.3%',
          subtotalUsers: '121万',
          subtotalCampaigns: 45,
          countries: [
            {
              id: 'tt-other',
              name: '多个国家',
              flag: '🌐',
              spend: '$60,000',
              change: '+5.3%',
              users: '38万',
              campaigns: 14,
              cpi: '$1.56',
              cpm: '$8.20',
              cpc: '$0.32',
              roi1d: '31%',
              roi3d: '57%',
              roi7d: '85%',
              roi14d: '87%',
              roi30d: '97%',
              profit: '$214,800'
            }
          ]
        }
      ]
    },
    {
      id: 'ios',
      name: 'iOS',
      totalSpend: '$156,000',
      change: '+7.2%',
      totalUsers: '42万',
      platforms: [
        {
          id: 'ios-google',
          name: 'Google',
          logo: 'G',
          color: '#4285F4',
          spend: '$78,000',
          change: '+7.5%',
          users: '22万',
          campaigns: 18,
          cpi: '$1.26',
          cpm: '$9.80',
          cpc: '$0.38',
          roi1d: '38%',
          roi3d: '68%',
          roi7d: '98%',
          roi14d: '101%',
          roi30d: '113%',
          profit: '$279,000',
          subtotalSpend: '$248,000',
          subtotalChange: '+7.5%',
          subtotalUsers: '70万',
          subtotalCampaigns: 57,
          countries: [
            {
              id: 'ios-g-us',
              name: '美国',
              flag: '🇺🇸',
              spend: '$32,000',
              change: '+8.1%',
              users: '9万',
              campaigns: 7,
              cpi: '$1.28',
              cpm: '$9.90',
              cpc: '$0.39',
              roi1d: '39%',
              roi3d: '70%',
              roi7d: '100%',
              roi14d: '103%',
              roi30d: '115%',
              profit: '$115,000'
            }
          ]
        },
        {
          id: 'ios-mintegral',
          name: 'Mintegral',
          logo: 'M',
          color: '#E8770E',
          spend: '$48,000',
          change: '+8.9%',
          users: '13万',
          campaigns: 12,
          cpi: '$1.58',
          cpm: '$8.60',
          cpc: '$0.34',
          roi1d: '35%',
          roi3d: '63%',
          roi7d: '91%',
          roi14d: '97%',
          roi30d: '108%',
          profit: '$171,600',
          subtotalSpend: '$153,000',
          subtotalChange: '+8.9%',
          subtotalUsers: '41万',
          subtotalCampaigns: 38,
          countries: [
            {
              id: 'ios-m-us',
              name: '美国',
              flag: '🇺🇸',
              spend: '$28,000',
              change: '+9.1%',
              users: '7万',
              campaigns: 6,
              cpi: '$1.60',
              cpm: '$8.70',
              cpc: '$0.35',
              roi1d: '36%',
              roi3d: '64%',
              roi7d: '92%',
              roi14d: '98%',
              roi30d: '109%',
              profit: '$100,800'
            }
          ]
        }
      ]
    },
    {
      id: 'web',
      name: '网站',
      totalSpend: '$58,000',
      change: '+4.1%',
      totalUsers: '12万',
      platforms: [
        {
          id: 'web-google',
          name: 'Google',
          logo: 'G',
          color: '#4285F4',
          spend: '$38,000',
          change: '+4.5%',
          users: '8万',
          campaigns: 8,
          cpi: '$0.48',
          cpm: '$4.20',
          cpc: '$0.22',
          roi1d: '28%',
          roi3d: '51%',
          roi7d: '76%',
          roi14d: '80%',
          roi30d: '92%',
          profit: '$136,000',
          subtotalSpend: '$121,000',
          subtotalChange: '+4.5%',
          subtotalUsers: '25万',
          subtotalCampaigns: 25,
          countries: [
            {
              id: 'web-g-us',
              name: '美国',
              flag: '🇺🇸',
              spend: '$18,000',
              change: '+4.8%',
              users: '4万',
              campaigns: 4,
              cpi: '$0.45',
              cpm: '$4.10',
              cpc: '$0.21',
              roi1d: '29%',
              roi3d: '52%',
              roi7d: '78%',
              roi14d: '82%',
              roi30d: '94%',
              profit: '$64,800'
            }
          ]
        }
      ]
    }
  ])

  const totalPlatforms = 9
  const totalCountries = 22
</script>

<style scoped>
  .apc-wrap {
    display: flex;
    flex-direction: column;
    gap: 0;
    color: var(--rp-text);
  }

  .apc-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 16px;
  }

  .title-main {
    font-size: 15px;
    font-weight: 600;
  }

  .period-badge {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--rp-accent);
    background: rgb(0 212 161 / 15%);
    border: 1px solid rgb(0 212 161 / 30%);
    border-radius: 4px;
  }

  .period-text {
    font-size: 13px;
    color: var(--rp-muted);
  }

  .table-scroll {
    max-height: calc(100vh - 280px);
    overflow: auto;
    border: 1px solid var(--rp-border);
    border-radius: 8px;
  }

  .apc-table {
    width: 100%;
    font-size: 12px;
    white-space: nowrap;
    border-collapse: collapse;
  }

  .apc-table thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .apc-table th {
    padding: 10px 12px;
    font-weight: 500;
    color: var(--rp-muted);
    text-align: right;
    background: #0a1428;
    border-bottom: 1px solid var(--rp-border);
  }

  .apc-table th.col-app,
  .apc-table th.col-platform,
  .apc-table th.col-adplatform,
  .apc-table th.col-country {
    text-align: left;
  }

  .apc-table td {
    padding: 8px 12px;
    text-align: right;
    vertical-align: middle;
    border-bottom: 1px solid rgb(255 255 255 / 3%);
  }

  .sticky-left {
    position: sticky;
    left: 0;
    z-index: 5;
    min-width: 200px;
    text-align: left !important;
    background: var(--rp-surface);
  }

  .expand-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .indent-1 {
    padding-left: 20px;
  }

  .indent-2 {
    padding-left: 44px;
  }

  .expand-icon {
    display: inline-block;
    width: 12px;
    font-size: 9px;
    color: var(--rp-muted);
    cursor: pointer;
    transition: transform 0.2s;
  }

  .expand-icon.open {
    transform: rotate(90deg);
  }

  .folder-icon {
    font-size: 13px;
  }

  .row-label {
    font-size: 12px;
  }

  .flag {
    font-size: 14px;
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
    color: #fff;
    border-radius: 4px;
  }

  /* Row Types */
  .row-os {
    cursor: pointer;
    background: rgb(255 255 255 / 3%);
  }

  .row-os:hover {
    background: rgb(255 255 255 / 6%);
  }

  .row-platform {
    cursor: pointer;
    background: rgb(255 255 255 / 1%);
  }

  .row-platform:hover {
    background: rgb(255 255 255 / 4%);
  }

  .row-country {
    background: transparent;
    opacity: 0.85;
  }

  .row-country:hover {
    background: rgb(255 255 255 / 3%);
  }

  .row-subtotal {
    background: rgb(0 212 161 / 6%);
    border-top: 1px solid rgb(0 212 161 / 15%);
  }

  .subtotal-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--rp-accent);
  }

  .row-collapsed-hint {
    cursor: pointer;
    opacity: 0.5;
  }

  .row-collapsed-hint:hover {
    opacity: 0.8;
  }

  .hint-text {
    font-size: 11px;
    color: var(--rp-muted);
  }

  .os-summary {
    text-align: left;
  }

  .os-spend {
    margin-right: 12px;
    font-weight: 600;
  }

  .os-users {
    margin-left: 12px;
    font-size: 11px;
    color: var(--rp-muted);
  }

  /* Change */
  .positive {
    color: #4ade80;
  }

  .negative {
    color: #f87171;
  }

  /* ROI */
  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }

  /* Footer */
  .apc-footer {
    padding: 12px 0;
    font-size: 12px;
    color: var(--rp-muted);
  }

  .col-num {
    min-width: 80px;
  }

  .col-app {
    min-width: 200px;
  }
</style>
