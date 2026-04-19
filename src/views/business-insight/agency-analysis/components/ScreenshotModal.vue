<script setup lang="ts">
  import { computed, ref, useTemplateRef } from 'vue'
  import { ElMessage } from 'element-plus'
  import { getAppNow } from '@/utils/app-now'
  import { elementToPngBlob } from '../utils/element-to-png'
  import type {
    AgencySubTabAccountSummaryPayload,
    AgencySubTabKpiPayload,
    AgencySubTabRecentSummaryPayload
  } from '../types'

  defineOptions({ name: 'ScreenshotModal' })

  type OutputFmt = 'png' | 'long'

  interface Props {
    modelValue: boolean
    reportTitle?: string
    agencyLabel?: string
    dataDate: string
    pageLoading: boolean
    kpiLast7?: AgencySubTabKpiPayload | null
    kpiDay?: AgencySubTabKpiPayload | null
    recentSummary?: AgencySubTabRecentSummaryPayload | null
    accountSummary?: AgencySubTabAccountSummaryPayload | null
  }

  const props = withDefaults(defineProps<Props>(), {
    reportTitle: '代投分析',
    agencyLabel: '',
    dataDate: '',
    pageLoading: true,
    kpiLast7: null,
    kpiDay: null,
    recentSummary: null,
    accountSummary: null
  })

  const emit = defineEmits<{
    'update:modelValue': [val: boolean]
  }>()

  const outputFormat = ref<OutputFmt>('png')
  const actionLoading = ref<'download' | 'copy' | ''>('')
  const reportRootRef = useTemplateRef<HTMLElement>('reportRoot')

  const close = () => emit('update:modelValue', false)

  const reportWidth = 1560
  const previewScale = computed(() => (outputFormat.value === 'long' ? 0.46 : 0.5))
  const previewShellStyle = computed(() => ({
    width: `${Math.round(reportWidth * previewScale.value)}px`,
    height: 'fit-content'
  }))
  const previewReportStyle = computed(() => ({
    width: `${reportWidth}px`,
    transform: `scale(${previewScale.value})`
  }))

  const estimatedSize = computed(() => (outputFormat.value === 'long' ? '~3.4MB' : '~2.2MB'))
  const resolution = computed(() =>
    outputFormat.value === 'long' ? '3120 x 4800px' : '3120 x 3600px'
  )

  const genTimeStr = computed(() => {
    const d = getAppNow()
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
      d.getMinutes()
    )}:${p(d.getSeconds())}`
  })

  const kpiKeys = [
    'spend',
    'roi1',
    'cpa',
    'installs',
    'appCount',
    'accountCount',
    'campaignCount',
    'adsetCount',
    'countryCount',
    'days'
  ] as const

  const kpiLabels = [
    '广告支出',
    '首日ROI',
    'CPA',
    '代投买量用户数',
    '在投应用数',
    '广告账户数',
    '广告系列数',
    '广告组数',
    '投放国家数',
    '投放天数'
  ] as const

  const recentRows = computed(() => props.recentSummary?.rows ?? [])
  const accountRows = computed(() => props.accountSummary?.rows ?? [])
  const roiTrendColumnCount = computed(() =>
    Math.max(3, ...recentRows.value.map((row) => row.roiTrend?.length ?? 0))
  )

  const reportSummaryLine = computed(() => {
    const row = recentRows.value[0] ?? accountRows.value[0]
    const parts = [
      row?.app,
      row?.platform && `平台: ${row.platform}`,
      row?.source && `广告平台: ${row.source}`
    ]
      .filter(Boolean)
      .join(' | ')
    return parts || '当前筛选条件下的代投数据报告'
  })

  const kpiSections = computed(() => {
    const metricValue = (payload: AgencySubTabKpiPayload | null | undefined, key: string) =>
      payload?.metrics?.find((item) => item.key === key)?.value ?? '--'

    return [
      {
        title: props.kpiLast7?.periodLabel || '近7天',
        items: kpiKeys.map((key, index) => ({
          key,
          label: kpiLabels[index],
          value: metricValue(props.kpiLast7, key)
        }))
      },
      {
        title: props.kpiDay?.periodLabel || '当日',
        items: kpiKeys.map((key, index) => ({
          key,
          label: kpiLabels[index],
          value: metricValue(props.kpiDay, key)
        }))
      }
    ]
  })

  const recentColgroup = computed(() => {
    const widths = [128, 90, 118, 126, 260, 94, 86, 76, 76, 108]
    return [...widths, ...Array.from({ length: roiTrendColumnCount.value }, () => 74)]
  })

  const accountColgroup = [128, 90, 118, 126, 260, 110, 92, 76, 76, 108]

  const exportFileName = computed(() => {
    const title = props.agencyLabel || props.reportTitle || 'agency-analysis'
    return `${title}-${props.dataDate || 'report'}.png`.replace(/[\\/:*?"<>|]+/g, '-')
  })

  async function buildScreenshotBlob() {
    const reportRoot = reportRootRef.value
    if (!reportRoot) throw new Error('截图内容还未准备完成')
    return elementToPngBlob(reportRoot, {
      pixelRatio: outputFormat.value === 'long' ? 2.4 : 2,
      backgroundColor: '#ffffff'
    })
  }

  async function handleDownload() {
    if (actionLoading.value) return
    actionLoading.value = 'download'
    try {
      const blob = await buildScreenshotBlob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = exportFileName.value
      anchor.click()
      URL.revokeObjectURL(url)
      ElMessage.success('PNG 已开始下载')
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '下载截图失败')
    } finally {
      actionLoading.value = ''
    }
  }

  async function handleCopy() {
    if (actionLoading.value) return
    actionLoading.value = 'copy'
    try {
      if (!window.ClipboardItem || !navigator.clipboard?.write) {
        throw new Error('当前浏览器不支持图片写入剪贴板')
      }
      const blob = await buildScreenshotBlob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      ElMessage.success('截图已复制到剪贴板')
      close()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '复制截图失败')
    } finally {
      actionLoading.value = ''
    }
  }

  defineExpose({ reportRootRef })
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" stroke="#00d4b4" stroke-width="1.5" />
                  <path
                    d="M9 3H15L16.5 5H20A1 1 0 0121 6V18A1 1 0 0120 19H4A1 1 0 013 18V6A1 1 0 014 5H7.5L9 3Z"
                    stroke="#00d4b4"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="4" stroke="#00d4b4" stroke-width="1.5" />
                </svg>
              </div>
              <div>
                <div class="modal-title">截图复制</div>
                <div class="modal-subtitle">前端生成 PNG，可直接下载或复制到剪贴板</div>
              </div>
            </div>
            <button type="button" class="modal-close" @click="close">×</button>
          </div>

          <div class="modal-body">
            <div class="modal-left">
              <div class="section-label">截图范围</div>
              <p class="modal-scope-desc">
                当前导出内容取自后 3 个代投机构子 Tab
                的已加载数据。已针对宽表做加宽和禁换行，优先保证导出图片完整。
              </p>

              <div class="form-row">
                <span class="form-label">数据日期</span>
                <span class="form-readonly">{{ dataDate || '--' }}</span>
                <span class="form-hint">与页面筛选保持一致</span>
              </div>

              <div class="form-row">
                <span class="form-label">代投机构</span>
                <span class="form-readonly">{{ agencyLabel || '--' }}</span>
              </div>

              <div class="form-row">
                <span class="form-label">报告标题</span>
                <span class="form-readonly">{{ reportTitle }}</span>
              </div>

              <div class="form-row">
                <span class="form-label">输出样式</span>
                <div class="fmt-group">
                  <button
                    type="button"
                    class="fmt-btn"
                    :class="{ active: outputFormat === 'png' }"
                    @click="outputFormat = 'png'"
                  >
                    标准 PNG
                  </button>
                  <button
                    type="button"
                    class="fmt-btn"
                    :class="{ active: outputFormat === 'long' }"
                    @click="outputFormat = 'long'"
                  >
                    长图留白
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-right">
              <div class="preview-label">
                预览 <span class="preview-sub">预览为缩放展示，下载与复制使用原始宽度导出</span>
              </div>
              <div class="preview-wrap">
                <div class="preview-shell" :style="previewShellStyle">
                  <div
                    ref="reportRoot"
                    class="preview-card preview-card--report"
                    :class="{ 'preview-card--long': outputFormat === 'long' }"
                    :style="previewReportStyle"
                  >
                    <div class="pv-report-head">
                      <div class="pv-brand">
                        <div class="pv-brand-mark" />
                        <div class="pv-brand-text">{{ agencyLabel || reportTitle }}</div>
                      </div>
                      <div class="pv-report-main-title">代投数据报告</div>
                      <div class="pv-report-meta">数据日期: {{ dataDate || '--' }}</div>
                    </div>

                    <div class="pv-divider" />
                    <div class="pv-summary-line">{{ reportSummaryLine }}</div>

                    <template v-if="pageLoading">
                      <div class="pv-empty">数据加载中...</div>
                    </template>
                    <template v-else>
                      <section
                        v-for="section in kpiSections"
                        :key="section.title"
                        class="pv-report-section"
                      >
                        <div class="pv-section-title">{{ section.title }}</div>
                        <div class="pv-kpi-grid">
                          <div v-for="item in section.items" :key="item.key" class="pv-kpi-card">
                            <div class="pv-kpi-label">{{ item.label }}</div>
                            <div class="pv-kpi-value">{{ item.value }}</div>
                          </div>
                        </div>
                      </section>

                      <section class="pv-report-section">
                        <div class="pv-section-title">近期汇总</div>
                        <div v-if="recentRows.length" class="pv-table-wrap">
                          <table class="pv-table">
                            <colgroup>
                              <col
                                v-for="(width, index) in recentColgroup"
                                :key="`recent-col-${index}`"
                                :style="{ width: `${width}px` }"
                              />
                            </colgroup>
                            <thead>
                              <tr>
                                <th>应用</th>
                                <th>平台</th>
                                <th>广告平台</th>
                                <th>账户ID</th>
                                <th>账户名称</th>
                                <th class="is-right">广告支出</th>
                                <th class="is-right">预算</th>
                                <th class="is-right">CPA</th>
                                <th class="is-right">CPI</th>
                                <th class="is-right">代投买量用户数</th>
                                <th
                                  v-for="index in roiTrendColumnCount"
                                  :key="`r-h-${index}`"
                                  class="is-right"
                                >
                                  ROI {{ index }}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(row, index) in recentRows" :key="`recent-${index}`">
                                <td>{{ row.app }}</td>
                                <td>{{ row.platform }}</td>
                                <td>{{ row.source }}</td>
                                <td class="is-mono">{{ row.accountId }}</td>
                                <td>{{ row.accountName }}</td>
                                <td class="is-right">{{ row.spend }}</td>
                                <td class="is-right">{{ row.budget }}</td>
                                <td class="is-right">{{ row.cpa }}</td>
                                <td class="is-right">{{ row.cpi }}</td>
                                <td class="is-right">{{ row.installs }}</td>
                                <td
                                  v-for="index in roiTrendColumnCount"
                                  :key="`r-v-${index}`"
                                  class="is-right"
                                >
                                  {{ row.roiTrend[index - 1] || '--' }}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div v-else class="pv-empty">暂无近期汇总数据</div>
                      </section>

                      <section class="pv-report-section">
                        <div class="pv-section-title">账户汇总</div>
                        <div v-if="accountRows.length" class="pv-table-wrap">
                          <table class="pv-table">
                            <colgroup>
                              <col
                                v-for="(width, index) in accountColgroup"
                                :key="`account-col-${index}`"
                                :style="{ width: `${width}px` }"
                              />
                            </colgroup>
                            <thead>
                              <tr>
                                <th>应用</th>
                                <th>平台</th>
                                <th>广告平台</th>
                                <th>账户ID</th>
                                <th>账户名称</th>
                                <th class="is-right">广告支出</th>
                                <th class="is-right">首日ROI</th>
                                <th class="is-right">CPA</th>
                                <th class="is-right">CPI</th>
                                <th class="is-right">代投买量用户数</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr v-for="(row, index) in accountRows" :key="`account-${index}`">
                                <td>{{ row.app }}</td>
                                <td>{{ row.platform }}</td>
                                <td>{{ row.source }}</td>
                                <td class="is-mono">{{ row.accountId }}</td>
                                <td>{{ row.accountName }}</td>
                                <td class="is-right">{{ row.spend }}</td>
                                <td class="is-right">{{ row.roi1 }}</td>
                                <td class="is-right">{{ row.cpa }}</td>
                                <td class="is-right">{{ row.cpi }}</td>
                                <td class="is-right">{{ row.installs }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div v-else class="pv-empty">暂无账户汇总数据</div>
                      </section>

                      <div class="pv-footnote">
                        <span>说明: 当前截图由前端根据页面已加载数据生成。</span>
                        <span>生成时间: {{ genTimeStr }}</span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <div class="preview-meta">
                <span
                  >预计截图大小: <strong>{{ estimatedSize }}</strong></span
                >
                <span class="preview-meta-gap"
                  >建议分辨率: <strong>{{ resolution }}</strong></span
                >
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <div class="gen-time">生成时间: {{ genTimeStr }}</div>
            <div class="footer-btns">
              <button type="button" class="btn-cancel" @click="close">取消</button>
              <button
                type="button"
                class="btn-download"
                :disabled="actionLoading !== ''"
                @click="handleDownload"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="btn-ic">
                  <path d="M12 16L7 11h4V4h2v7h4l-5 5zM5 20h14v-2H5v2z" />
                </svg>
                {{ actionLoading === 'download' ? '生成中...' : '下载 PNG' }}
              </button>
              <button
                type="button"
                class="btn-copy"
                :disabled="actionLoading !== ''"
                @click="handleCopy"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="btn-ic">
                  <rect
                    x="9"
                    y="9"
                    width="13"
                    height="13"
                    rx="2"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                  <path
                    d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                    stroke="currentColor"
                    stroke-width="1.8"
                  />
                </svg>
                {{ actionLoading === 'copy' ? '复制中...' : '复制到剪贴板' }}
              </button>
            </div>
          </div>
          <div class="footer-hint">复制后可直接粘贴到微信、钉钉、邮件等支持图片粘贴的应用。</div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped lang="scss">
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 9000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 72%);
    backdrop-filter: blur(4px);
  }

  .modal-box {
    display: flex;
    flex-direction: column;
    width: 1240px;
    max-width: calc(100vw - 40px);
    min-height: 0;
    max-height: 88vh;
    overflow: hidden;
    background: #0d1829;
    border: 1px solid #1e3a5f;
    border-radius: 12px;
    box-shadow:
      0 24px 70px rgb(2 8 23 / 55%),
      inset 0 1px 0 rgb(255 255 255 / 4%);
  }

  .modal-header,
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid #1e3a5f;
  }

  .modal-footer {
    border-top: 1px solid #1e3a5f;
    border-bottom: 0;
  }

  .modal-title-wrap {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .modal-icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    background: rgb(0 212 180 / 12%);
    border: 1px solid rgb(0 212 180 / 30%);
    border-radius: 10px;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .modal-subtitle,
  .footer-hint,
  .preview-sub,
  .gen-time {
    font-size: 12px;
    color: #94a3b8;
  }

  .modal-close {
    width: 32px;
    height: 32px;
    font-size: 20px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    border: 0;
  }

  .modal-body {
    display: grid;
    flex: 1;
    grid-template-columns: 280px minmax(0, 1fr);
    min-height: 0;
    overflow: hidden;
  }

  .modal-left {
    min-height: 0;
    padding: 18px;
    overflow: auto;
    border-right: 1px solid #1e3a5f;
  }

  .section-label {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .modal-scope-desc {
    margin: 0 0 16px;
    font-size: 12px;
    line-height: 1.7;
    color: #94a3b8;
  }

  .form-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }

  .form-label {
    font-size: 12px;
    color: #64748b;
  }

  .form-readonly {
    min-height: 36px;
    padding: 9px 11px;
    font-size: 13px;
    color: #e2e8f0;
    background: #111f35;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
  }

  .form-hint {
    font-size: 11px;
    color: #64748b;
  }

  .fmt-group {
    display: flex;
  }

  .fmt-btn {
    flex: 1;
    height: 36px;
    font-size: 12px;
    color: #94a3b8;
    cursor: pointer;
    background: #0f172a;
    border: 1px solid #2d3f54;
    transition: all 0.15s;

    &:first-child {
      border-radius: 8px 0 0 8px;
    }

    &:last-child {
      margin-left: -1px;
      border-radius: 0 8px 8px 0;
    }

    &.active {
      color: #00d4b4;
      background: rgb(0 212 180 / 12%);
      border-color: #00d4b4;
    }
  }

  .modal-right {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    min-height: 0;
    padding: 18px;
    overflow: hidden;
  }

  .preview-label {
    flex: none;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }

  .preview-wrap {
    flex: 1;
    min-height: 0;
    padding: 18px 12px;
    overflow: auto;
    background: #111f35;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
  }

  .preview-shell {
    display: block;
    margin: 0 auto;
  }

  .preview-card {
    padding: 36px 42px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 28px rgb(15 23 42 / 10%);
    transform-origin: top left;
  }

  .preview-card--long {
    padding-bottom: 82px;
  }

  .pv-report-head {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 18px;
    align-items: center;
    color: #172554;
  }

  .pv-brand {
    display: flex;
    gap: 12px;
    align-items: center;
    font-weight: 700;
  }

  .pv-brand-mark {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, #0f766e, #2563eb);
    border-radius: 7px;
  }

  .pv-brand-text {
    font-size: 18px;
    line-height: 1;
  }

  .pv-report-main-title {
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    letter-spacing: 0.5px;
  }

  .pv-report-meta {
    font-size: 16px;
    font-weight: 700;
    color: #475569;
    text-align: right;
    white-space: nowrap;
  }

  .pv-divider {
    height: 4px;
    margin: 22px 0 18px;
    background: linear-gradient(90deg, #17375e, #1dc7ca);
    border-radius: 999px;
  }

  .pv-summary-line {
    margin-bottom: 18px;
    font-size: 18px;
    font-weight: 700;
    color: #334155;
    white-space: nowrap;
  }

  .pv-report-section {
    margin-top: 22px;
  }

  .pv-section-title {
    margin-bottom: 14px;
    font-size: 24px;
    font-weight: 800;
    color: #102a56;
  }

  .pv-kpi-grid {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px;
  }

  .pv-kpi-card {
    min-height: 104px;
    padding: 16px 14px;
    background: #f7fbff;
    border: 1px solid #d4e3f4;
    border-radius: 14px;
  }

  .pv-kpi-label {
    font-size: 15px;
    color: #7b8ca6;
    white-space: nowrap;
  }

  .pv-kpi-value {
    margin-top: 10px;
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    white-space: nowrap;
  }

  .pv-table-wrap {
    overflow: hidden;
    border: 1px solid #d7e3f4;
    border-radius: 10px;
  }

  .pv-table {
    width: 100%;
    font-size: 14px;
    color: #0f172a;
    table-layout: fixed;
    border-collapse: collapse;

    th,
    td {
      padding: 12px 10px;
      white-space: nowrap;
      vertical-align: middle;
      border-bottom: 1px solid #e7eef8;
    }

    th {
      font-weight: 700;
      color: #fff;
      text-align: left;
      background: linear-gradient(180deg, #223b62, #162949);
    }

    tbody tr:nth-child(even) {
      background: #f9fbff;
    }

    tbody tr:last-child td {
      border-bottom: 0;
    }
  }

  .is-right {
    text-align: right !important;
  }

  .is-mono {
    font-family: Consolas, 'Courier New', monospace;
  }

  .pv-empty {
    padding: 28px 0;
    font-size: 16px;
    color: #64748b;
    text-align: center;
  }

  .pv-footnote {
    display: flex;
    justify-content: space-between;
    margin-top: 22px;
    font-size: 14px;
    color: #64748b;
  }

  .preview-meta {
    display: flex;
    flex: none;
    gap: 14px;
    font-size: 12px;
    color: #94a3b8;
  }

  .footer-btns {
    display: flex;
    gap: 10px;
  }

  .btn-cancel,
  .btn-download,
  .btn-copy {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
    min-width: 116px;
    height: 36px;
    padding: 0 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 999px;
    transition: all 0.16s;
  }

  .btn-cancel {
    color: #cbd5e1;
    background: transparent;
    border: 1px solid #334155;
  }

  .btn-download {
    color: #0d1829;
    background: #fff;
    border: 0;
  }

  .btn-copy {
    color: #fff;
    background: linear-gradient(135deg, #0ea5a6, #2563eb);
    border: 0;
  }

  .btn-cancel:disabled,
  .btn-download:disabled,
  .btn-copy:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-ic {
    flex: none;
  }

  .footer-hint {
    padding: 0 18px 16px;
  }
</style>
