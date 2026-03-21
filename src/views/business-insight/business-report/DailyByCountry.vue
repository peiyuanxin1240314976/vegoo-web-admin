<template>
  <div class="daily-by-country">
    <!-- World Map -->
    <div class="map-card">
      <div ref="mapRef" class="world-map"></div>
    </div>

    <!-- Country Table -->
    <div class="data-card">
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th class="sticky-col">国家</th>
              <th>平均DAU</th>
              <th>总收缴</th>
              <th>付费收缴</th>
              <th>预估利润</th>
              <th>计算利润</th>
              <th>新用户</th>
              <th>自然量</th>
              <th>自然量比例</th>
              <th>DAU占比</th>
              <th>ECPM</th>
              <th>ARPDAU(千倍)</th>
              <th>广告支出</th>
              <th>CPI</th>
              <th>CPM</th>
              <th>CPC</th>
              <th>买量用户</th>
              <th>广告系列数</th>
              <th>首日ROI</th>
              <th>7日ROI</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in countries" :key="row.name">
              <td class="sticky-col country-cell">
                <span class="flag">{{ row.flag }}</span>
                <span>{{ row.name }}</span>
              </td>
              <td>{{ row.avgDau }}</td>
              <td class="revenue-cell">{{ row.revenue }}</td>
              <td>{{ row.paidRevenue }}</td>
              <td>{{ row.profit }}</td>
              <td>{{ row.calcProfit }}</td>
              <td>{{ row.newUsers }}</td>
              <td>{{ row.organic }}</td>
              <td>{{ row.organicRate }}</td>
              <td>
                <div class="dau-share-wrap">
                  <span class="dau-pct">{{ row.dauShare }}%</span>
                  <div class="dau-bar">
                    <div
                      class="dau-bar-fill"
                      :style="{ width: Math.min(row.dauShare * 3, 100) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>{{ row.ecpm }}</td>
              <td>{{ row.arpdau }}</td>
              <td>{{ row.adSpend }}</td>
              <td>{{ row.cpi }}</td>
              <td>{{ row.cpm }}</td>
              <td>{{ row.cpc }}</td>
              <td>{{ row.acquisitions }}</td>
              <td>{{ row.campaigns }}</td>
              <td :class="roiColor(row.roi1d)">{{ row.roi1d }}</td>
              <td :class="roiColor(row.roi7d)">{{ row.roi7d }}</td>
            </tr>
            <!-- Total row -->
            <tr class="total-row">
              <td class="sticky-col">合计</td>
              <td>78.3万</td>
              <td class="revenue-cell">$152,300</td>
              <td>$43,200</td>
              <td>$108,900</td>
              <td>$97,200</td>
              <td>40.2万</td>
              <td>14.5万</td>
              <td>36%</td>
              <td>100%</td>
              <td>$9.80</td>
              <td>1.94</td>
              <td>$41,100</td>
              <td>$1.60</td>
              <td>$9.80</td>
              <td>$0.38</td>
              <td>25.7万</td>
              <td>14</td>
              <td class="roi-orange">36%</td>
              <td class="roi-orange">96%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="table-footer">共 22 个国家</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import * as echarts from 'echarts'
  import { countryData } from './mockData'

  const mapRef = ref<HTMLElement>()
  let chart: echarts.ECharts | null = null
  const countries = countryData

  const roiColor = (val: string) => {
    const n = parseInt(val)
    if (n >= 100) return 'roi-green'
    if (n >= 80) return 'roi-orange'
    return ''
  }

  onMounted(async () => {
    if (!mapRef.value) return
    try {
      const worldJson = await fetch('/geo/world.json').then((r) => r.json())
      echarts.registerMap('world', worldJson)
      chart = echarts.init(mapRef.value, 'dark')
      chart.setOption({
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: (params: { name: string; value: number }) =>
            params.name ? `${params.name}` : '',
          backgroundColor: '#1a2845',
          borderColor: 'rgba(0,212,161,0.3)',
          textStyle: { color: '#e2e8f0', fontSize: 12 }
        },
        series: [
          {
            type: 'map',
            map: 'world',
            roam: true,
            itemStyle: {
              areaColor: '#162040',
              borderColor: 'rgba(0,212,161,0.2)',
              borderWidth: 0.5
            },
            emphasis: {
              itemStyle: { areaColor: 'rgba(0,212,161,0.35)' },
              label: { show: true, color: '#00D4A1', fontSize: 11 }
            },
            data: countries.map((c) => ({ name: c.name, value: parseInt(c.avgDau) })),
            select: { itemStyle: { areaColor: 'rgba(0,212,161,0.25)' } }
          }
        ],
        visualMap: {
          show: false,
          min: 0,
          max: 25,
          inRange: { color: ['#162040', 'rgba(0,212,161,0.5)', '#00D4A1'] }
        }
      })
      const ro = new ResizeObserver(() => chart?.resize())
      ro.observe(mapRef.value)
    } catch {
      // Map not available, show fallback
    }
  })
  onUnmounted(() => {
    chart?.dispose()
  })
</script>

<style scoped>
  .daily-by-country {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    overflow-y: auto;
  }

  .map-card {
    height: 180px;
    overflow: hidden;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .world-map {
    width: 100%;
    height: 100%;
  }

  .data-card {
    padding: 14px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 10px;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    min-width: 1600px;
    font-size: 11.5px;
    border-collapse: collapse;
  }

  .data-table th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 6px 10px;
    font-weight: 500;
    color: rgb(255 255 255 / 40%);
    text-align: left;
    white-space: nowrap;
    background: rgb(255 255 255 / 2%);
    border-bottom: 1px solid rgb(255 255 255 / 7%);
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

  .sticky-col {
    position: sticky;
    left: 0;
    z-index: 2;
    background: #0d1529 !important;
    border-right: 1px solid rgb(255 255 255 / 7%);
  }

  .country-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .flag {
    font-size: 14px;
  }

  .revenue-cell {
    font-weight: 600;
    color: #fff !important;
  }

  .dau-share-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .dau-pct {
    min-width: 26px;
    font-size: 11px;
  }

  .dau-bar {
    width: 40px;
    height: 4px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 2px;
  }

  .dau-bar-fill {
    height: 100%;
    background: #00d4a1;
    border-radius: 2px;
  }

  .total-row td {
    font-weight: 600;
    color: #00d4a1 !important;
    border-top: 1px solid rgb(0 212 161 / 25%) !important;
  }

  .table-footer {
    margin-top: 8px;
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
  }

  .roi-green {
    font-weight: 600;
    color: #4ade80;
  }

  .roi-orange {
    font-weight: 600;
    color: #fb923c;
  }
</style>
