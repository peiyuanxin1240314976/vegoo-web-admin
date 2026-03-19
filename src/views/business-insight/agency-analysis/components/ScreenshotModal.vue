<script setup lang="ts">
  import { ref, computed } from 'vue'

  interface Props {
    modelValue: boolean
  }
  defineProps<Props>()
  const emit = defineEmits<{
    'update:modelValue': [val: boolean]
    download: []
    copy: []
  }>()

  type ScreenType = 'current' | 'all' | 'custom'
  type OutputFmt = 'png' | 'long'

  const selectedType = ref<ScreenType>('current')
  const outputFormat = ref<OutputFmt>('png')
  const dateStart = ref('2026-03-07')
  const dateEnd = ref('2026-03-07')

  const customChecks = ref({
    agency: true,
    campaign: true,
    daily: false,
    roi: true,
    channel: false
  })

  const typeOptions = [
    {
      value: 'current' as ScreenType,
      title: '当前代投方报告',
      desc: '包含当前展开的 GatherOne 代投方完整数据报告',
      tags: ['近7天汇总', '账户汇总', '广告系列明细', '首日ROI']
    },
    {
      value: 'all' as ScreenType,
      title: '全部代投方汇总',
      desc: '包含所有代投方的汇总数据对比',
      tags: ['代投方汇总表', '渠道分布', '国家分布']
    },
    {
      value: 'custom' as ScreenType,
      title: '自定义范围',
      desc: '自行选择要包含的数据模块',
      tags: []
    }
  ]

  const customModuleList = [
    { key: 'agency', label: '代投方汇总' },
    { key: 'campaign', label: '广告系列明细' },
    { key: 'daily', label: '逐日对比' },
    { key: 'roi', label: '首日ROI' },
    { key: 'channel', label: '渠道分布' }
  ]

  const estimatedSize = computed(() => (selectedType.value === 'all' ? '~1.8MB' : '~2.4MB'))
  const resolution = computed(() => (outputFormat.value === 'long' ? '2560x6400px' : '2560x3200px'))

  const close = () => emit('update:modelValue', false)

  const pvStats = [
    { label: '近7天汇', val: '336,576', chg: '+606.77%' },
    { label: '账户汇总', val: '378', chg: '+1094.88%' },
    { label: '广告系列数', val: '2.78', chg: '+3600.00%' },
    { label: '首日ROI', val: '31.8K', chg: '+300.0%' }
  ]
  const pvCampaigns = [
    {
      name: 'Campaign Row 01',
      spend: '13000',
      cmp: '19.30',
      roi: '1.0%',
      rb: '#10b981',
      dist: '10.0%',
      db: '#10b981'
    },
    {
      name: 'Campaign Row 02',
      spend: '13000',
      cmp: '19.50',
      roi: '0.99%',
      rb: '#3b82f6',
      dist: '40.7%',
      db: '#3b82f6'
    },
    {
      name: 'Campaign Row 03',
      spend: '5,000',
      cmp: '0.70',
      roi: '0.41%',
      rb: '#f59e0b',
      dist: '3.6%',
      db: '#f59e0b'
    },
    {
      name: 'Campaign Row 04',
      spend: '1,000',
      cmp: '-9.50',
      roi: '0.29%',
      rb: '#1e3a5f',
      dist: '0.0%',
      db: '#1e3a5f'
    }
  ]
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-box">
          <!-- Header -->
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
                <div class="modal-subtitle">将数据报告截图并复制到剪贴板</div>
              </div>
            </div>
            <button class="modal-close" @click="close">×</button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <!-- Left panel -->
            <div class="modal-left">
              <div class="section-label">选择截图内容</div>

              <div class="type-list">
                <div
                  v-for="opt in typeOptions"
                  :key="opt.value"
                  class="type-item"
                  :class="{ active: selectedType === opt.value }"
                  @click="selectedType = opt.value"
                >
                  <div class="type-top">
                    <span class="radio-ring" :class="{ on: selectedType === opt.value }">
                      <span class="radio-dot" />
                    </span>
                    <span class="type-title">{{ opt.title }}</span>
                  </div>
                  <div class="type-desc">{{ opt.desc }}</div>
                  <div v-if="opt.tags.length" class="type-tags">
                    <span v-for="t in opt.tags" :key="t" class="type-tag">{{ t }}</span>
                  </div>
                  <div
                    v-if="opt.value === 'custom' && selectedType === 'custom'"
                    class="custom-checks"
                    @click.stop
                  >
                    <label v-for="m in customModuleList" :key="m.key" class="check-item">
                      <input
                        type="checkbox"
                        v-model="(customChecks as any)[m.key]"
                        class="check-input"
                      />
                      <span class="check-box" :class="{ checked: (customChecks as any)[m.key] }">
                        <svg
                          v-if="(customChecks as any)[m.key]"
                          width="9"
                          height="9"
                          viewBox="0 0 9 9"
                        >
                          <path
                            d="M1.5 4.5L3.5 6.5L7.5 2"
                            stroke="#00d4b4"
                            stroke-width="1.5"
                            fill="none"
                            stroke-linecap="round"
                          />
                        </svg>
                      </span>
                      <span class="check-label">{{ m.label }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div class="form-row">
                <span class="form-label">数据日期:</span>
                <input v-model="dateStart" type="text" class="date-input" />
                <span class="form-sep">至</span>
                <input v-model="dateEnd" type="text" class="date-input" />
              </div>

              <div class="form-row">
                <span class="form-label">输出格式:</span>
                <div class="fmt-group">
                  <button
                    class="fmt-btn"
                    :class="{ active: outputFormat === 'png' }"
                    @click="outputFormat = 'png'"
                  >
                    图片(PNG)
                  </button>
                  <button
                    class="fmt-btn"
                    :class="{ active: outputFormat === 'long' }"
                    @click="outputFormat = 'long'"
                  >
                    长图截图
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Preview -->
            <div class="modal-right">
              <div class="preview-label">预览 <span class="preview-sub">将复制到剪贴板</span></div>
              <div class="preview-wrap">
                <div class="preview-card">
                  <div class="pv-header">
                    <div class="pv-logo">
                      <div class="pv-logo-icon"></div>
                      <span>GatherOne</span>
                    </div>
                    <div>
                      <div style="font-size: 9px; font-weight: 700; color: #e2e8f0"
                        >代投数据报告</div
                      >
                      <div style="font-size: 8px; color: #64748b">2026-03-07</div>
                    </div>
                  </div>

                  <div class="pv-sec-title">近7天汇总</div>
                  <div class="pv-stats">
                    <div v-for="s in pvStats" :key="s.label" class="pv-stat">
                      <div class="pv-s-l">{{ s.label }}</div>
                      <div class="pv-s-v">{{ s.val }}</div>
                      <div class="pv-s-c">{{ s.chg }}</div>
                    </div>
                  </div>

                  <div class="pv-sec-title mt8">账户汇总</div>
                  <table class="pv-table">
                    <thead
                      ><tr
                        ><th>账户名称</th><th>近7天汇</th><th>账户汇总</th><th>广告系列数</th
                        ><th>ROI</th></tr
                      ></thead
                    >
                    <tbody>
                      <tr
                        ><td>Campaigner 1</td><td>216.80</td><td>43.72</td><td>622</td
                        ><td class="pv-teal">17,098</td></tr
                      >
                      <tr
                        ><td>Campaigner 2</td><td>183.50</td><td>12.60</td><td>108</td
                        ><td class="pv-teal">12,095</td></tr
                      >
                      <tr
                        ><td>Campaigner 3</td><td>33.69</td><td>5.00</td><td>13</td
                        ><td class="pv-teal">4,079</td></tr
                      >
                    </tbody>
                  </table>

                  <div class="pv-sec-title mt8">近期明细</div>
                  <table class="pv-table">
                    <thead
                      ><tr
                        ><th>广告明细</th><th>代投帐号</th><th>账目对比</th><th>ROI</th
                        ><th>覆盖分布</th></tr
                      ></thead
                    >
                    <tbody>
                      <tr v-for="r in pvCampaigns" :key="r.name">
                        <td>{{ r.name }}</td
                        ><td>{{ r.spend }}</td
                        ><td>{{ r.cmp }}</td>
                        <td
                          ><span class="pv-badge" :style="{ background: r.rb, color: '#fff' }">{{
                            r.roi
                          }}</span></td
                        >
                        <td
                          ><span class="pv-badge" :style="{ background: r.db, color: '#fff' }">{{
                            r.dist
                          }}</span></td
                        >
                      </tr>
                    </tbody>
                  </table>
                  <div class="pv-footnote">注: 时区 PST(UTC-8), 货币 USD</div>
                </div>
              </div>
              <div class="preview-meta">
                <span
                  >预计截图大小: <strong>{{ estimatedSize }}</strong></span
                >
                <span style="margin-left: 16px"
                  >分辨率: <strong>{{ resolution }}</strong></span
                >
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <div class="gen-time">生成时间: 2026-03-07 14:40:23</div>
            <div class="footer-btns">
              <button class="btn-cancel" @click="close">取消</button>
              <button class="btn-download" @click="$emit('download')">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style="margin-right: 5px"
                >
                  <path d="M12 16L7 11h4V4h2v7h4l-5 5zM5 20h14v-2H5v2z" />
                </svg>
                下载 PNG
              </button>
              <button
                class="btn-copy"
                @click="
                  $emit('copy')
                  close()
                "
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  style="margin-right: 5px"
                >
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
                复制到剪贴板
              </button>
            </div>
          </div>
          <div class="footer-hint">复制后可直接粘贴到微信、钉钉、邮件等任意应用</div>
        </div>
      </div>
    </transition>
  </teleport>
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
    width: 920px;
    max-height: 88vh;
    overflow: hidden;
    background: #0d1829;
    border: 1px solid #1e3a5f;
    border-radius: 12px;
    box-shadow:
      0 30px 80px rgb(0 0 0 / 70%),
      0 0 0 1px rgb(0 212 180 / 8%);
  }

  /* Header */
  .modal-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px 16px;
    border-bottom: 1px solid #1e3a5f;
  }

  .modal-title-wrap {
    display: flex;
    gap: 14px;
    align-items: center;
  }

  .modal-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    background: rgb(0 212 180 / 8%);
    border: 1px solid rgb(0 212 180 / 20%);
    border-radius: 10px;
  }

  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .modal-subtitle {
    margin-top: 2px;
    font-size: 12px;
    color: #64748b;
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 18px;
    line-height: 1;
    color: #94a3b8;
    cursor: pointer;
    background: #1e2d42;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      background: #2d3f54;
    }
  }

  /* Body */
  .modal-body {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* Left */
  .modal-left {
    flex-shrink: 0;
    width: 510px;
    padding: 18px 22px;
    overflow-y: auto;
    border-right: 1px solid #1e3a5f;
  }

  .section-label {
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }

  .type-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 18px;
  }

  .type-item {
    padding: 12px 14px;
    cursor: pointer;
    background: #0a1422;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
    transition: all 0.15s;

    &:hover {
      border-color: #2d5a8a;
    }

    &.active {
      background: rgb(0 212 180 / 5%);
      border-color: #00d4b4;
    }
  }

  .type-top {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 5px;
  }

  .radio-ring {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: 2px solid #2d3f54;
    border-radius: 50%;
    transition: border-color 0.15s;

    &.on {
      border-color: #00d4b4;
    }
  }

  .radio-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    transition: background 0.15s;

    .radio-ring.on & {
      background: #00d4b4;
    }
  }

  .type-title {
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .type-desc {
    margin-bottom: 7px;
    margin-left: 26px;
    font-size: 11px;
    color: #64748b;
  }

  .type-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-left: 26px;
  }

  .type-tag {
    padding: 2px 8px;
    font-size: 11px;
    color: #00d4b4;
    background: rgb(0 212 180 / 10%);
    border: 1px solid rgb(0 212 180 / 20%);
    border-radius: 4px;
  }

  .custom-checks {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
    margin-left: 26px;
  }

  .check-item {
    display: flex;
    gap: 6px;
    align-items: center;
    cursor: pointer;
  }

  .check-input {
    display: none;
  }

  .check-box {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 15px;
    height: 15px;
    border: 1.5px solid #2d3f54;
    border-radius: 3px;
    transition: all 0.15s;

    &.checked {
      background: rgb(0 212 180 / 15%);
      border-color: #00d4b4;
    }
  }

  .check-label {
    font-size: 12px;
    color: #94a3b8;
  }

  .form-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 14px;
  }

  .form-label {
    flex-shrink: 0;
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
  }

  .date-input {
    width: 118px;
    padding: 6px 10px;
    font-size: 12px;
    color: #e2e8f0;
    background: #0a1422;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    outline: none;

    &:focus {
      border-color: #00d4b4;
    }
  }

  .form-sep {
    font-size: 12px;
    color: #64748b;
  }

  .fmt-group {
    display: flex;
  }

  .fmt-btn {
    padding: 6px 14px;
    font-size: 12px;
    color: #64748b;
    cursor: pointer;
    background: #0a1422;
    border: 1px solid #2d3f54;
    transition: all 0.15s;

    &:first-child {
      border-radius: 6px 0 0 6px;
    }

    &:last-child {
      margin-left: -1px;
      border-radius: 0 6px 6px 0;
    }

    &.active {
      color: #00d4b4;
      background: rgb(0 212 180 / 12%);
      border-color: #00d4b4;
    }
  }

  /* Right */
  .modal-right {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    padding: 18px 18px 14px;
    overflow-y: auto;
  }

  .preview-label {
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
  }

  .preview-sub {
    font-size: 11px;
    font-weight: 400;
    color: #475569;
  }

  .preview-wrap {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    background: #111f35;
    border: 1px solid #1e3a5f;
    border-radius: 8px;
  }

  .preview-card {
    padding: 12px;
    background: #0d1829;
    border-radius: 6px;
  }

  .pv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .pv-logo {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 10px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .pv-logo-icon {
    width: 14px;
    height: 14px;
    background: linear-gradient(135deg, #00d4b4, #3b82f6);
    border-radius: 3px;
  }

  .pv-sec-title {
    padding-bottom: 3px;
    margin-bottom: 6px;
    font-size: 9px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 1px solid #1e3a5f;
  }

  .mt8 {
    margin-top: 8px;
  }

  .pv-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
    margin-bottom: 6px;
  }

  .pv-stat {
    padding: 5px;
    background: #111f35;
    border-radius: 4px;
  }

  .pv-s-l {
    font-size: 8px;
    color: #64748b;
  }

  .pv-s-v {
    font-size: 11px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .pv-s-c {
    font-size: 8px;
    color: #10b981;
  }

  .pv-teal {
    color: #00d4b4;
  }

  .pv-table {
    width: 100%;
    font-size: 9px;
    border-collapse: collapse;

    th {
      padding: 3px 4px;
      color: #64748b;
      text-align: left;
      background: #0a1422;
      border-bottom: 1px solid #1e3a5f;
    }

    td {
      padding: 3px 4px;
      color: #cbd5e1;
      border-bottom: 1px solid #0f1c2e;
    }
  }

  .pv-badge {
    display: inline-block;
    padding: 1px 4px;
    font-size: 8px;
    font-weight: 600;
    border-radius: 2px;
  }

  .pv-footnote {
    padding-top: 5px;
    margin-top: 7px;
    font-size: 8px;
    color: #475569;
    border-top: 1px solid #1e3a5f;
  }

  .preview-meta {
    font-size: 12px;
    color: #64748b;

    strong {
      color: #94a3b8;
    }
  }

  /* Footer */
  .modal-footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px 6px;
    border-top: 1px solid #1e3a5f;
  }

  .gen-time {
    font-size: 12px;
    color: #475569;
  }

  .footer-btns {
    display: flex;
    gap: 10px;
  }

  .btn-cancel {
    padding: 8px 20px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      border-color: #4a5568;
    }
  }

  .btn-download {
    display: flex;
    align-items: center;
    padding: 8px 18px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2d3f54;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      border-color: #4a5568;
    }
  }

  .btn-copy {
    display: flex;
    align-items: center;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    cursor: pointer;
    background: linear-gradient(135deg, #00d4b4, #00a896);
    border: none;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgb(0 212 180 / 30%);
    transition: all 0.15s;

    &:hover {
      background: linear-gradient(135deg, #00e6c4, #00c0a8);
      box-shadow: 0 6px 16px rgb(0 212 180 / 40%);
    }
  }

  .footer-hint {
    flex-shrink: 0;
    padding: 0 24px 12px;
    font-size: 11px;
    color: #475569;
    text-align: right;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.2s;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }
</style>
