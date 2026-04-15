<template>
  <div class="credential-page">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <div class="header-actions">
        <button class="btn btn-primary" @click="showAddDialog = true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          新增凭据
        </button>
        <button class="btn btn-secondary" @click="handleBatchTest">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7a5 5 0 1 0 10 0A5 5 0 0 0 2 7zm0 0c0-1.5.7-2.8 1.8-3.7M12 4.5l-3 .5.5-3"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          测试连接
        </button>
        <button class="btn btn-secondary" @click="handleExport">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v8M4 6l3 3 3-3M2 11h10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          导出
        </button>
        <div class="filter-group">
          <span class="filter-label">平台</span>
          <select v-model="filterPlatformInput" class="filter-select">
            <option value="">全部</option>
            <option
              v-for="option in platformFilterOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">状态</span>
          <select v-model="filterStatusInput" class="filter-select">
            <option value="">全部</option>
            <option value="正常">正常</option>
            <option value="即将过期">即将过期</option>
            <option value="连接异常">连接异常</option>
          </select>
        </div>
        <button class="btn btn-secondary" @click="handleQuery">查询</button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card stat-card--configured">
        <div class="stat-label">已配置凭据</div>
        <div class="stat-value">{{ stats.configured }}<span class="stat-unit">组</span></div>
      </div>
      <div class="stat-card stat-card--normal">
        <div class="stat-label">连接正常</div>
        <div class="stat-value">{{ stats.normal }}<span class="stat-unit">组</span></div>
      </div>
      <div class="stat-card stat-card--error">
        <div class="stat-label">连接异常</div>
        <div class="stat-value">{{ stats.error }}<span class="stat-unit">组</span></div>
        <div class="stat-sub">需检查</div>
      </div>
      <div class="stat-card stat-card--expiring">
        <div class="stat-label">即将过期</div>
        <div class="stat-value">{{ stats.expiring }}<span class="stat-unit">组</span></div>
        <div class="stat-sub">30天内</div>
      </div>
    </div>

    <!-- 凭据表格 -->
    <div class="table-container">
      <div class="table-title">凭据列表</div>
      <table class="cred-table">
        <thead>
          <tr>
            <th>平台</th>
            <th>应用名称</th>
            <th>凭据类型</th>
            <th>帐号/Key</th>
            <th>过期时间</th>
            <th>最后验证</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, idx) in filteredCredentials"
            :key="row.id"
            class="table-row"
            :style="{ animationDelay: idx * 0.04 + 's' }"
          >
            <td>
              <div class="platform-cell">
                <img :src="platformIcon(row.platform)" :alt="row.platform" class="platform-icon" />
                <span>{{ row.platform }}</span>
              </div>
            </td>
            <td>{{ row.appName }}</td>
            <td>{{ row.credType }}</td>
            <td class="key-cell">{{ row.account }}</td>
            <td>{{ row.expiry }}</td>
            <td>
              <div class="verify-cell">
                <span>{{ row.lastVerify }}</span>
                <svg v-if="row.verifyOk" width="14" height="14" viewBox="0 0 14 14" class="icon-ok">
                  <path
                    d="M2 7l3.5 3.5L12 4"
                    stroke="#00d2c3"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                  />
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 14 14" class="icon-err">
                  <path
                    d="M3 3l8 8M11 3l-8 8"
                    stroke="#ff4d4f"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </td>
            <td>
              <span :class="['status-badge', `status-badge--${statusClass(row.status)}`]">
                {{ row.status }}
              </span>
            </td>
            <td>
              <div class="action-cell">
                <button class="action-btn" @click="handleEdit(row)">编辑</button>
                <span class="action-sep">|</span>
                <button
                  class="action-btn"
                  @click="row.status === '连接异常' ? handleRetry(row) : handleTest(row)"
                >
                  {{
                    row.status === '连接异常' ? '重试' : row.status === '即将过期' ? '续期' : '测试'
                  }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部警告栏（数据来自连接异常接口） -->
    <div v-if="hasAlertAnomalies" class="alert-bar">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1L1 14h14L8 1z" stroke="#faad14" stroke-width="1.5" stroke-linejoin="round" />
        <path d="M8 6v4M8 11.5v.5" stroke="#faad14" stroke-width="1.5" stroke-linecap="round" />
      </svg>
      <span>{{ alertBarSummaryText }}</span>
      <button type="button" class="alert-link" @click="openAlertConnectionDetail">查看详情</button>
    </div>

    <!-- ===== 新增 / 编辑 凭据弹窗（共用同一个表单结构） ===== -->
    <Transition name="modal">
      <div
        v-if="showAddDialog || showEditDialog"
        class="modal-overlay"
        @click.self="closeFormDialog"
      >
        <div class="modal-box modal-form">
          <!-- 顶栏 -->
          <div class="modal-header">
            <span>{{ showEditDialog ? '编辑应用商店凭据' : '新增应用商店凭据' }}</span>
            <button class="modal-close" @click="closeFormDialog">✕</button>
          </div>

          <div class="modal-body">
            <!-- 平台 -->
            <div class="form-field">
              <label class="form-label">平台 <span class="required">*</span></label>
              <div class="custom-select-wrap">
                <select v-model="credForm.platform" class="form-select">
                  <option value="">请选择平台</option>
                  <option
                    v-for="platform in credentialPlatformOptions"
                    :key="platform.value"
                    :value="platform.value"
                  >
                    {{ platform.label }}
                  </option>
                </select>
                <svg class="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="#8899aa"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <!-- 应用 -->
            <div class="form-field">
              <label class="form-label">应用 <span class="required">*</span></label>
              <div class="custom-select-wrap">
                <select v-model="credForm.app" class="form-select">
                  <option value="">请选择应用</option>
                  <option v-for="app in credentialAppOptions" :key="app.value" :value="app.value">
                    {{ app.label }}
                  </option>
                </select>
                <svg class="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="#8899aa"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>

            <!-- 凭据类型 -->
            <div class="form-field">
              <label class="form-label">凭据类型</label>
              <div class="cred-type-selector">
                <!-- 上传文件 -->
                <div
                  :class="[
                    'cred-type-option',
                    credForm.credInputType === 'file' && 'cred-type-option--active'
                  ]"
                  @click="credForm.credInputType = 'file'"
                >
                  <input type="radio" :checked="credForm.credInputType === 'file'" readonly />
                  <div class="upload-area" @click.stop="triggerFileInput">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path
                        d="M11 3v11M7 6l4-4 4 4"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M2 17h18"
                        stroke="currentColor"
                        stroke-width="1.8"
                        stroke-linecap="round"
                      />
                    </svg>
                    <span>{{ credForm.fileName || '点击上传 JSON 文件' }}</span>
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept=".json"
                      style="display: none"
                      @change="handleFileChange"
                    />
                  </div>
                </div>
                <!-- 粘贴 JSON -->
                <div
                  :class="[
                    'cred-type-option',
                    credForm.credInputType === 'paste' && 'cred-type-option--active'
                  ]"
                  @click="credForm.credInputType = 'paste'"
                >
                  <input type="radio" :checked="credForm.credInputType === 'paste'" readonly />
                  <span>粘贴 JSON 内容</span>
                </div>
              </div>
              <Transition name="slide-down">
                <textarea
                  v-if="credForm.credInputType === 'paste'"
                  v-model="credForm.credContent"
                  class="form-textarea"
                  placeholder="粘贴 JSON 内容..."
                  rows="4"
                />
              </Transition>
            </div>

            <!-- 过期时间 -->
            <div class="form-field form-field--row">
              <label class="form-label">过期时间</label>
              <div class="date-input-wrap">
                <ElDatePicker
                  v-model="credForm.expiry"
                  type="date"
                  value-format="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  class="form-date-picker"
                />
              </div>
            </div>

            <!-- 备注 -->
            <div class="form-field form-field--row">
              <label class="form-label">备注</label>
              <textarea
                v-model="credForm.remark"
                class="form-input form-textarea"
                rows="3"
                placeholder="请输入备注"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeFormDialog">取消</button>
            <button class="btn btn-primary" @click="handleSaveForm">
              {{ showEditDialog ? '保存' : '保存并测试' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ===== 连接成功弹窗 ===== -->
    <!-- 图二样式：无 header，仅右上角浮动 × 按钮 -->
    <Transition name="modal">
      <div v-if="showSuccessDialog" class="modal-overlay" @click.self="showSuccessDialog = false">
        <div class="modal-box modal-result modal-result--success">
          <!-- 浮动关闭按钮，无 header 条 -->
          <button class="result-close-btn" @click="showSuccessDialog = false">✕</button>

          <!-- 绿色圆圈图标 -->
          <div class="result-icon result-icon--success">
            <div class="result-icon-ring" />
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M7 18l7 7 15-14"
                stroke="#00d2c3"
                stroke-width="2.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <div class="result-title result-title--success">连接成功</div>
          <div class="result-subtitle">{{ testingRow?.platform }} | {{ testingRow?.appName }}</div>

          <div class="result-checks">
            <div v-for="check in successChecks" :key="check.label" class="check-row">
              <span class="check-label">{{ check.label }}</span>
              <span class="check-value">{{ check.value }}</span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="check-icon">
                <path
                  d="M2 6.5l3 3 6-6"
                  stroke="#00d2c3"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <div class="result-time">测试耗时：1.2s</div>

          <div class="result-footer">
            <button
              class="btn-result-close btn-result-close--success"
              @click="showSuccessDialog = false"
              >关闭</button
            >
          </div>
        </div>
      </div>
    </Transition>

    <!-- ===== 连接失败弹窗 ===== -->
    <!-- 图三样式：有 "连接异常" header 条 + × 按钮 -->
    <Transition name="modal">
      <div v-if="showErrorDialog" class="modal-overlay" @click.self="showErrorDialog = false">
        <div class="modal-box modal-result modal-result--error">
          <!-- 标准 header 条 -->
          <div class="modal-header">
            <span>连接异常</span>
            <button class="modal-close" @click="showErrorDialog = false">✕</button>
          </div>

          <!-- 红色圆圈图标 -->
          <div class="result-icon result-icon--error">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M10 10l16 16M26 10L10 26"
                stroke="#ff4d4f"
                stroke-width="2.8"
                stroke-linecap="round"
              />
            </svg>
          </div>

          <div class="result-title result-title--error">连接失败</div>
          <div v-if="activeErrorDetail" class="result-subtitle">
            {{ activeErrorDetail.platform }} | {{ activeErrorDetail.credType }}
          </div>

          <div v-if="dialogAnomalyItems.length > 1" class="error-anomaly-select">
            <span class="error-anomaly-label">异常连接</span>
            <div class="custom-select-wrap custom-select-wrap--compact">
              <select v-model="selectedAnomalyId" class="form-select">
                <option v-for="it in dialogAnomalyItems" :key="it.id" :value="it.id">
                  {{ it.platform }} · {{ it.appName }} · {{ it.account }}
                </option>
              </select>
              <svg class="select-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 4l4 4 4-4"
                  stroke="#8899aa"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </div>

          <div v-if="activeErrorDetail" class="error-info">
            <div class="error-row">
              <span class="error-key">错误信息：</span>
              <code class="error-code">{{ activeErrorDetail.errorMessage }}</code>
            </div>
            <div class="error-row">
              <span class="error-key">失效时间：</span>
              <span class="error-val">{{ activeErrorDetail.expiredAt }}</span>
            </div>
            <div class="error-suggestions">
              <div class="sug-title">建议操作：</div>
              <div v-for="(sug, si) in activeErrorDetail.suggestions" :key="si" class="sug-item">
                {{ si + 1 }}. {{ sug }}
              </div>
            </div>
          </div>

          <div class="error-footer">
            <button class="btn btn-ghost" @click="showErrorDialog = false">关闭</button>
            <button class="btn btn-danger" @click="handleReconfig">重新配置</button>
            <button class="btn btn-warning" @click="handleRetryConn">重试连接</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import {
    batchTestAppStoreCredentialConnection,
    createAppStoreCredential,
    exportAppStoreCredentials,
    fetchAppStoreConnectionAnomalies,
    fetchAppStoreCredentialDetail,
    fetchAppStoreCredentialTable,
    fetchAppStoreOverviewStats,
    retryAppStoreCredentialConnection,
    testAppStoreCredentialConnection,
    updateAppStoreCredential
  } from '@/api/config-management/app-store-management'
  import type {
    AppStoreConnectionAnomalyItem,
    AppStoreConnectionCheckItem,
    AppStoreCredentialConnectionTestResult,
    AppStoreCredentialOverviewStatsData,
    AppStoreCredentialRow
  } from '@/views/config-management/app-store-management/types'

  defineOptions({ name: 'AppStoreCredentialManagement' })

  type Credential = AppStoreCredentialRow

  interface SelectOption {
    label: string
    value: string
  }

  const normalizeStorePlatformValue = (value: string, label: string): string => {
    const raw = `${value} ${label}`.toLowerCase()
    if (raw.includes('google')) return 'Google Play'
    if (raw.includes('app store') || raw.includes('apple')) return 'App Store'
    if (raw.includes('huawei') || raw.includes('\u534e\u4e3a')) return 'Huawei AppGallery'
    if (raw.includes('samsung') || raw.includes('\u4e09\u661f')) return 'Samsung Galaxy Store'
    return value
  }

  const platformIcon = (name: string): string => {
    const icons: Record<string, string> = {
      'Google Play':
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2334a853' d='M3.18 23.76a2 2 0 0 0 2.14-.22l12.1-6.97-2.76-2.76z'/%3E%3Cpath fill='%23ea4335' d='M20.54 10.27A2 2 0 0 0 20.54 13.73L22.73 12z'/%3E%3Cpath fill='%23fbbc04' d='M3.18.24l11.48 11.48-2.76 2.76L3.18 7.51A2 2 0 0 1 3.18.24z'/%3E%3Cpath fill='%234285f4' d='M3.18.24a2 2 0 0 0 0 3.27L17.46 12 14.66 14.72z'/%3E%3C/svg%3E",
      'App Store':
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='5' fill='%230d96f6'/%3E%3Cpath d='M12 4l2.5 5h5l-4 3 1.5 5L12 14l-5 3 1.5-5-4-3h5z' fill='white'/%3E%3C/svg%3E",
      'Huawei AppGallery':
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='4' fill='%23cf0a2c'/%3E%3Ctext x='5' y='17' font-size='12' fill='white' font-weight='bold'%3EHW%3C/text%3E%3C/svg%3E",
      'Samsung Galaxy Store':
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='4' fill='%231428a0'/%3E%3Ctext x='2' y='16' font-size='8' fill='white' font-weight='bold'%3ESAMSUNG%3C/text%3E%3C/svg%3E"
    }
    return icons[name] ?? icons['Google Play']
  }

  const cockpitMetaFilterStore = useCockpitMetaFilterStore()
  const fallbackPlatformFilterOptions: SelectOption[] = [
    { label: 'Google Play', value: 'Google Play' },
    { label: 'App Store', value: 'App Store' },
    { label: '\u534e\u4e3a\u5e94\u7528\u5e02\u573a', value: 'Huawei AppGallery' },
    { label: '\u4e09\u661f\u5e94\u7528\u5546\u5e97', value: 'Samsung Galaxy Store' }
  ]

  const platformFilterOptions = computed<SelectOption[]>(() => {
    const sourceOptions = cockpitMetaFilterStore.data?.sourceOptions ?? []
    if (sourceOptions.length > 0) {
      return sourceOptions.map((item) => ({
        label: item.label,
        value: normalizeStorePlatformValue(item.value, item.label)
      }))
    }
    return fallbackPlatformFilterOptions
  })

  const fallbackCredentialAppOptions: SelectOption[] = [
    { label: 'Vegoo Keyboard', value: 'Vegoo Keyboard' },
    { label: 'Vegoo Camera', value: 'Vegoo Camera' },
    { label: 'Vegoo Notes', value: 'Vegoo Notes' },
    { label: 'Vegoo Cleaner', value: 'Vegoo Cleaner' },
    { label: 'Vegoo Launcher', value: 'Vegoo Launcher' },
    { label: 'Vegoo VPN', value: 'Vegoo VPN' }
  ]

  const credentialPlatformOptions = computed<SelectOption[]>(() => platformFilterOptions.value)
  const credentialAppOptions = computed<SelectOption[]>(() => {
    const appOptions = cockpitMetaFilterStore.data?.appOptions ?? []
    if (appOptions.length > 0) {
      return appOptions.map((item) => ({
        label: item.label,
        value: item.label
      }))
    }
    return fallbackCredentialAppOptions
  })

  const credentials = ref<Credential[]>([])
  const stats = ref<AppStoreCredentialOverviewStatsData>({
    configured: 0,
    normal: 0,
    error: 0,
    expiring: 0
  })
  const connectionAnomalies = ref<AppStoreConnectionAnomalyItem[]>([])

  const filterPlatformInput = ref('')
  const filterStatusInput = ref('')
  const filterPlatform = ref('')
  const filterStatus = ref('')

  const filteredCredentials = computed(() => credentials.value)
  const hasAlertAnomalies = computed(() => connectionAnomalies.value.length > 0)
  const alertBarSummaryText = computed(() => {
    const items = connectionAnomalies.value
    if (!items.length) return ''
    const platforms = [...new Set(items.map((item) => item.platform))]
    const summary =
      platforms.length === 1
        ? platforms[0]
        : platforms.length === 2
          ? `${platforms[0]} / ${platforms[1]}`
          : `${platforms.slice(0, 2).join(', ')} +${platforms.length - 2}`
    return `${summary} connection anomalies detected.`
  })

  const statusClass = (status: string) =>
    (
      ({
        '\u6b63\u5e38': 'normal',
        '\u5373\u5c06\u8fc7\u671f': 'expiring',
        '\u8fde\u63a5\u5f02\u5e38': 'error'
      }) as Record<string, string>
    )[status] ?? 'normal'

  const showAddDialog = ref(false)
  const showEditDialog = ref(false)
  const showSuccessDialog = ref(false)
  const showErrorDialog = ref(false)
  const testingRow = ref<Credential | null>(null)
  const dialogAnomalyItems = ref<AppStoreConnectionAnomalyItem[]>([])
  const selectedAnomalyId = ref('')
  const editingId = ref('')
  const successChecks = ref<AppStoreConnectionCheckItem[]>([])
  const successDurationText = ref('0s')

  const activeErrorDetail = computed(() => {
    const id = selectedAnomalyId.value
    return dialogAnomalyItems.value.find((item) => item.id === id) ?? null
  })

  const rowToAnomalyItem = (row: Credential): AppStoreConnectionAnomalyItem => ({
    id: row.id,
    platform: row.platform,
    appName: row.appName,
    account: row.account,
    credType: row.credType,
    errorMessage: 'Connection validation failed. Please verify the credential settings and retry.',
    expiredAt: row.expiry === '\u6c38\u4e45' ? '--' : row.expiry,
    suggestions: [
      'Check whether the credential content is valid',
      'Confirm the marketplace permission scope',
      'Check account and project configuration consistency'
    ]
  })

  const openErrorDialogWithItems = (items: AppStoreConnectionAnomalyItem[]) => {
    dialogAnomalyItems.value = items
    selectedAnomalyId.value = items[0]?.id ?? ''
    showErrorDialog.value = true
  }

  const openAlertConnectionDetail = () => {
    openErrorDialogWithItems(connectionAnomalies.value.map((item) => ({ ...item })))
  }

  watch(selectedAnomalyId, (id) => {
    testingRow.value = credentials.value.find((item) => item.id === id) ?? null
  })

  const defaultCredForm = () => ({
    platform: 'Google Play' as string,
    app: '' as string,
    credInputType: 'file' as 'file' | 'paste',
    credContent: '' as string,
    fileName: '' as string,
    expiry: '2026-12-31',
    remark: ''
  })

  const credForm = ref(defaultCredForm())
  const fileInputRef = ref<HTMLInputElement | null>(null)

  const triggerFileInput = () => fileInputRef.value?.click()

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      credForm.value.fileName = file.name
      const reader = new FileReader()
      reader.onload = (ev) => {
        credForm.value.credContent = ev.target?.result as string
      }
      reader.readAsText(file)
    }
  }

  const closeFormDialog = () => {
    showAddDialog.value = false
    showEditDialog.value = false
    editingId.value = ''
    credForm.value = defaultCredForm()
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const setSuccessState = (result: AppStoreCredentialConnectionTestResult) => {
    successChecks.value = result.checks ?? []
    successDurationText.value = `${(result.durationMs / 1000).toFixed(1)}s`
    showSuccessDialog.value = true
  }

  const setErrorState = async (
    id: string,
    fallbackRow?: Credential | null,
    fallbackResult?: AppStoreCredentialConnectionTestResult
  ) => {
    try {
      const detail = await fetchAppStoreCredentialDetail(id)
      openErrorDialogWithItems([
        {
          id,
          platform: detail.detail.platform || fallbackRow?.platform || '',
          appName: detail.detail.appName || fallbackRow?.appName || '',
          account: detail.detail.account || fallbackRow?.account || '',
          credType: detail.detail.credType || fallbackRow?.credType || '',
          errorMessage:
            detail.detail.errorMessage || fallbackResult?.errorMessage || 'Connection failed',
          expiredAt: fallbackResult?.invalidAt || detail.detail.expiryDate || '--',
          suggestions: detail.detail.suggestions || fallbackResult?.suggestions || []
        }
      ])
    } catch {
      if (fallbackRow) openErrorDialogWithItems([rowToAnomalyItem(fallbackRow)])
    }
  }

  const loadConnectionAnomalies = async () => {
    try {
      const data = await fetchAppStoreConnectionAnomalies()
      connectionAnomalies.value = Array.isArray(data.items) ? data.items : []
    } catch {
      connectionAnomalies.value = []
    }
  }

  const loadTableData = async () => {
    const data = await fetchAppStoreCredentialTable({
      current: 1,
      size: 100,
      platform: filterPlatform.value,
      status: filterStatus.value
    })
    credentials.value = Array.isArray(data.records) ? data.records : []
  }

  const loadStatsData = async () => {
    stats.value = await fetchAppStoreOverviewStats({
      platform: filterPlatform.value,
      status: filterStatus.value
    })
  }

  const loadPageData = async () => {
    await Promise.all([loadTableData(), loadStatsData(), loadConnectionAnomalies()])
  }

  const handleQuery = async () => {
    filterPlatform.value = filterPlatformInput.value
    filterStatus.value = filterStatusInput.value
    await loadPageData()
  }

  const handleTest = async (row: Credential) => {
    testingRow.value = row
    const result = await testAppStoreCredentialConnection(row.id)
    await loadPageData()
    if (result.success) {
      setSuccessState(result)
      return
    }
    await setErrorState(row.id, row, result)
  }

  const handleRetry = async (row: Credential) => {
    testingRow.value = row
    await setErrorState(row.id, row)
  }

  const handleBatchTest = async () => {
    const result = await batchTestAppStoreCredentialConnection({
      platform: filterPlatform.value,
      status: filterStatus.value
    })
    const successItem = result.results.find((item) => item.success)
    testingRow.value =
      credentials.value.find((item) => item.id === successItem?.id) ?? credentials.value[0] ?? null
    await loadPageData()
    successChecks.value = [
      { label: 'Batch Task', value: result.taskId, passed: true },
      { label: 'Success', value: String(result.summary.success), passed: true },
      {
        label: 'Failed',
        value: String(result.summary.failed),
        passed: result.summary.failed === 0
      },
      { label: 'Total', value: String(result.summary.total), passed: true }
    ]
    successDurationText.value = `${(result.summary.durationMs / 1000).toFixed(1)}s`
    showSuccessDialog.value = true
  }

  const handleEdit = async (row: Credential) => {
    editingId.value = row.id
    try {
      const detail = await fetchAppStoreCredentialDetail(row.id)
      credForm.value = {
        platform: detail.detail.platform || row.platform,
        app: detail.detail.appName || row.appName,
        credInputType: 'file',
        credContent: '',
        fileName: '',
        expiry:
          detail.detail.expiryDate || (row.expiry === '\u6c38\u4e45' ? '2026-12-31' : row.expiry),
        remark: detail.detail.remark || ''
      }
    } catch {
      credForm.value = {
        platform: row.platform,
        app: row.appName,
        credInputType: 'file',
        credContent: '',
        fileName: '',
        expiry: row.expiry === '\u6c38\u4e45' ? '2026-12-31' : row.expiry,
        remark: ''
      }
    }
    showEditDialog.value = true
  }

  const handleExport = async () => {
    const blob = await exportAppStoreCredentials({
      platform: filterPlatform.value,
      status: filterStatus.value
    })
    downloadBlob(blob, `credential-export-${Date.now()}.csv`)
  }

  const handleSaveForm = async () => {
    const payload = {
      id: showEditDialog.value ? editingId.value : undefined,
      platform: credForm.value.platform,
      appName: credForm.value.app,
      credInputType: credForm.value.credInputType,
      credentialContent: credForm.value.credContent,
      fileName: credForm.value.fileName,
      expiryDate: credForm.value.expiry,
      remark: credForm.value.remark
    }

    if (showAddDialog.value) {
      const created = await createAppStoreCredential(payload)
      showAddDialog.value = false
      await loadPageData()
      const row =
        credentials.value.find((item) => item.id === created.id) ?? credentials.value[0] ?? null
      if (row) {
        testingRow.value = row
        const result = await testAppStoreCredentialConnection(row.id)
        await loadPageData()
        if (result.success) {
          setSuccessState(result)
        } else {
          await setErrorState(row.id, row, result)
        }
      }
    } else {
      await updateAppStoreCredential(payload)
      showEditDialog.value = false
      await loadPageData()
    }

    editingId.value = ''
    credForm.value = defaultCredForm()
  }

  const handleReconfig = () => {
    const id = selectedAnomalyId.value
    showErrorDialog.value = false
    const row = credentials.value.find((item) => item.id === id)
    if (row) {
      void handleEdit(row)
      return
    }
    editingId.value = id
    credForm.value = defaultCredForm()
    showEditDialog.value = true
  }

  const handleRetryConn = async () => {
    const id = selectedAnomalyId.value
    showErrorDialog.value = false
    const result = await retryAppStoreCredentialConnection(id)
    await loadPageData()
    testingRow.value =
      credentials.value.find((item) => item.id === id) ?? credentials.value[0] ?? null
    successChecks.value = [
      { label: 'Retry Result', value: result.message, passed: result.success },
      { label: 'Latest Status', value: result.statusAfterRetry, passed: result.success }
    ]
    successDurationText.value = `${(result.durationMs / 1000).toFixed(1)}s`
    showSuccessDialog.value = result.success
  }

  onMounted(() => {
    cockpitMetaFilterStore.ensureLoaded()
    void loadPageData()
  })
</script>

<style scoped>
  /* ════════════════════════════════════════════════
   CSS 变量 & 全局
════════════════════════════════════════════════ */
  .credential-page {
    --bg-deep: #0b1929;
    --bg-card: #0f2236;
    --bg-table: #0d1e30;
    --bg-row-hover: #162840;
    --bg-modal: #0e2035;
    --border: #1e3a52;
    --border-light: #1f3f5a;
    --teal: #00d2c3;
    --teal-dim: rgb(0 210 195 / 15%);
    --green: #4ade80;
    --red: #ff4d4f;
    --orange: #f5a623;
    --text-primary: #dde8f0;
    --text-secondary: #89a;
    --text-muted: #4a6070;

    box-sizing: border-box;
    min-height: 100vh;
    padding: 20px 24px;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: var(--text-primary);
    background: var(--bg-deep);
  }

  /* ════════════════════════════════════════════════
   页头
════════════════════════════════════════════════ */
  .page-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: end;
    margin-bottom: 20px;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  /* ════════════════════════════════════════════════
   按钮
════════════════════════════════════════════════ */
  .btn {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 7px 14px;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .btn-primary {
    color: #fff;
    background: linear-gradient(135deg, #00c4b6 0%, #007e96 100%);
    box-shadow: 0 2px 12px rgb(0 210 195 / 25%);
  }

  .btn-primary:hover {
    box-shadow: 0 4px 16px rgb(0 210 195 / 35%);
    transform: translateY(-1px);
  }

  .btn-secondary {
    color: var(--text-secondary);
    background: var(--bg-card);
    border: 1px solid var(--border);
  }

  .btn-secondary:hover {
    color: var(--teal);
    border-color: var(--teal);
  }

  .btn-ghost {
    color: var(--text-secondary);
    background: #1e3448;
    border: 1px solid var(--border);
  }

  .btn-ghost:hover {
    color: var(--text-primary);
    border-color: var(--text-secondary);
  }

  .btn-danger {
    color: #fff;
    background: linear-gradient(135deg, #c0392b, #e74c3c);
  }

  .btn-warning {
    color: #fff;
    background: linear-gradient(135deg, #b7860a, #f39c12);
  }

  .btn-success-close {
    justify-content: center;
    width: 100%;
    padding: 9px 32px;
    margin-top: 4px;
    color: #fff;
    background: linear-gradient(135deg, #00a89a, #007e82);
    border-radius: 8px;
  }

  /* ════════════════════════════════════════════════
   过滤器
════════════════════════════════════════════════ */
  .filter-group {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .filter-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .filter-select {
    padding: 5px 8px;
    font-family: inherit;
    font-size: 13px;
    color: var(--text-primary);
    cursor: pointer;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
  }

  .filter-select:focus {
    border-color: var(--teal);
  }

  /* ════════════════════════════════════════════════
   统计卡片
════════════════════════════════════════════════ */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    position: relative;
    padding: 18px 22px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid transparent;
    border-radius: 10px;
    transition: transform 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-2px);
  }

  .stat-card::before {
    position: absolute;
    inset: 0;
    content: '';
    border-radius: inherit;
    opacity: 0.07;
  }

  .stat-card--configured {
    border-color: #00d2c3;
  }

  .stat-card--configured::before {
    background: linear-gradient(135deg, #00d2c3, transparent);
  }

  .stat-card--normal {
    border-color: #1a4d5a;
  }

  .stat-card--normal::before {
    background: linear-gradient(135deg, #4ade80, transparent);
  }

  .stat-card--error {
    border-color: #4a1a1a;
  }

  .stat-card--error::before {
    background: linear-gradient(135deg, #ff4d4f, transparent);
  }

  .stat-card--expiring {
    border-color: #4a3800;
  }

  .stat-card--expiring::before {
    background: linear-gradient(135deg, #f5a623, transparent);
  }

  .stat-label {
    margin-bottom: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .stat-value {
    font-size: 40px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1px;
  }

  .stat-unit {
    margin-left: 2px;
    font-size: 16px;
    font-weight: 400;
  }

  .stat-sub {
    margin-top: 4px;
    font-size: 12px;
  }

  .stat-card--configured .stat-value {
    color: var(--teal);
  }

  .stat-card--normal .stat-value {
    color: var(--teal);
  }

  .stat-card--error .stat-value {
    color: var(--red);
  }

  .stat-card--error .stat-sub {
    color: var(--red);
  }

  .stat-card--expiring .stat-value {
    color: var(--orange);
  }

  .stat-card--expiring .stat-sub {
    color: var(--orange);
  }

  /* ════════════════════════════════════════════════
   表格
════════════════════════════════════════════════ */
  .table-container {
    margin-bottom: 12px;
    overflow: hidden;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  .table-title {
    padding: 16px 20px 12px;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border);
  }

  .cred-table {
    width: 100%;
    border-collapse: collapse;
  }

  .cred-table th {
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-muted);
    text-align: left;
    white-space: nowrap;
    background: #0a1925;
  }

  .table-row {
    border-top: 1px solid var(--border);
    transition: background 0.15s ease;
    animation: rowIn 0.35s ease both;
  }

  .table-row:hover {
    background: var(--bg-row-hover);
  }

  @keyframes rowIn {
    from {
      opacity: 0;
      transform: translateX(-6px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .cred-table td {
    padding: 12px 14px;
    font-size: 13px;
    white-space: nowrap;
  }

  .platform-cell {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .platform-icon {
    width: 20px;
    height: 20px;
    border-radius: 4px;
  }

  .key-cell {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .verify-cell {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .icon-ok,
  .icon-err {
    flex-shrink: 0;
  }

  /* ── 状态徽章 ── */
  .status-badge {
    display: inline-block;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid;
    border-radius: 4px;
  }

  .status-badge--normal {
    color: var(--teal);
    background: rgb(0 210 195 / 8%);
    border-color: rgb(0 210 195 / 30%);
  }

  .status-badge--expiring {
    color: var(--orange);
    background: rgb(245 166 35 / 8%);
    border-color: rgb(245 166 35 / 30%);
  }

  .status-badge--error {
    color: var(--red);
    background: rgb(255 77 79 / 8%);
    border-color: rgb(255 77 79 / 30%);
  }

  /* ── 操作按钮 ── */
  .action-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .action-btn {
    padding: 0;
    font-family: inherit;
    font-size: 13px;
    color: var(--teal);
    cursor: pointer;
    background: none;
    border: none;
    transition: opacity 0.15s;
  }

  .action-btn:hover {
    text-decoration: underline;
    opacity: 0.7;
  }

  .action-sep {
    color: var(--border);
  }

  /* ════════════════════════════════════════════════
   警告栏
════════════════════════════════════════════════ */
  .alert-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    background: rgb(250 173 20 / 6%);
    border: 1px solid rgb(250 173 20 / 20%);
    border-radius: 8px;
  }

  .alert-link {
    padding: 0;
    font-family: inherit;
    font-size: 13px;
    color: var(--teal);
    cursor: pointer;
    background: none;
    border: none;
  }

  .alert-link:hover {
    text-decoration: underline;
  }

  /* ════════════════════════════════════════════════
   弹窗 Overlay
════════════════════════════════════════════════ */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 10 20 / 75%);
    backdrop-filter: blur(4px);
  }

  .modal-box {
    position: relative;
    width: 440px;
    max-width: 95vw;
    overflow: hidden;
    background: var(--bg-modal);
    border: 1px solid var(--border-light);
    border-radius: 12px;
    box-shadow: 0 24px 80px rgb(0 0 0 / 60%);
  }

  .modal-box::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 1px;
    content: '';
    background: linear-gradient(90deg, transparent, var(--teal), transparent);
    opacity: 0.4;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid var(--border);
  }

  .modal-close {
    padding: 0;
    font-size: 16px;
    color: var(--text-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
  }

  .modal-close:hover {
    color: var(--text-primary);
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 16px 20px;
  }

  .modal-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 12px 20px 16px;
    border-top: 1px solid var(--border);
  }

  /* ── 表单 ── */
  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .required {
    color: var(--red);
  }

  .form-input,
  .form-select,
  .form-textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 8px 10px;
    font-family: inherit;
    font-size: 13px;
    color: var(--text-primary);
    background: #0a1925;
    border: 1px solid var(--border);
    border-radius: 6px;
    outline: none;
    transition: border-color 0.2s;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    border-color: var(--teal);
  }

  .form-textarea {
    min-height: 80px;
    resize: vertical;
  }

  .form-select {
    cursor: pointer;
  }

  /* ── 平台选择器 ── */
  .platform-selector {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .platform-option {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    padding: 10px 6px;
    font-size: 11px;
    color: var(--text-secondary);
    text-align: center;
    cursor: pointer;
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .platform-option:hover {
    color: var(--text-primary);
    border-color: var(--teal);
  }

  .platform-option--active {
    color: var(--teal);
    background: var(--teal-dim);
    border-color: var(--teal);
    box-shadow: 0 0 12px rgb(0 210 195 / 10%);
  }

  .platform-option-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }

  /* ── 凭据类型选择 ── */
  .cred-type-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .cred-type-option {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 10px 12px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all 0.2s;
  }

  .cred-type-option:hover {
    border-color: var(--teal);
  }

  .cred-type-option--active {
    color: var(--text-primary);
    background: var(--teal-dim);
    border-color: var(--teal);
  }

  .cred-type-option input[type='radio'] {
    accent-color: var(--teal);
  }

  .upload-area {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
    font-size: 12px;
  }

  /* ── 密码输入框 ── */
  .password-input-wrap {
    position: relative;
  }

  .password-input-wrap .form-input {
    padding-right: 36px;
  }

  .eye-btn {
    position: absolute;
    top: 50%;
    right: 8px;
    display: flex;
    align-items: center;
    padding: 0;
    cursor: pointer;
    background: none;
    border: none;
    transform: translateY(-50%);
  }

  /* ── Toggle ── */
  .toggle-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toggle-btn {
    position: relative;
    width: 40px;
    height: 22px;
    padding: 0;
    cursor: pointer;
    background: #1e3448;
    border: 1px solid var(--border);
    border-radius: 11px;
    transition: background 0.25s ease;
  }

  .toggle-btn--on {
    background: linear-gradient(135deg, #00c4b6, #007e96);
    border-color: var(--teal);
  }

  .toggle-knob {
    position: absolute;
    top: 2px;
    left: 2px;
    display: block;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 1px 4px rgb(0 0 0 / 30%);
    transition: transform 0.25s ease;
  }

  .toggle-btn--on .toggle-knob {
    transform: translateX(18px);
  }

  .toggle-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--teal);
  }

  .toggle-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }

  /* ════════════════════════════════════════════════
   表单弹窗扩展样式
════════════════════════════════════════════════ */
  .modal-form {
    width: 460px;
  }

  /* custom select */
  .custom-select-wrap {
    position: relative;
  }

  .custom-select-wrap .form-select {
    padding-right: 32px;
    appearance: none;
  }

  .select-arrow {
    position: absolute;
    top: 50%;
    right: 10px;
    pointer-events: none;
    transform: translateY(-50%);
  }

  /* date input */
  .form-field--row {
    flex-direction: row;
    gap: 12px;
    align-items: center;
  }

  .form-field--row .form-label {
    min-width: 60px;
    margin-bottom: 0;
  }

  .date-input-wrap {
    position: relative;
    flex: 1;
  }

  .form-date-picker {
    width: 100%;
  }

  .date-input-wrap :deep(.form-date-picker.el-date-editor) {
    display: flex;
    width: 100% !important;
  }

  .date-input-wrap :deep(.form-date-picker .el-input__wrapper) {
    width: 100%;
    min-height: 34px;
    padding: 8px 10px;
    background: #0a1925;
    border-radius: 6px;
    box-shadow: 0 0 0 1px var(--border) inset;
    transition: box-shadow 0.2s;
  }

  .date-input-wrap :deep(.form-date-picker .el-input__inner) {
    font-family: inherit;
    font-size: 13px;
    color: var(--text-primary);
  }

  .date-input-wrap :deep(.form-date-picker .el-input__prefix),
  .date-input-wrap :deep(.form-date-picker .el-input__suffix) {
    color: var(--text-secondary);
  }

  .date-input-wrap :deep(.form-date-picker:hover .el-input__wrapper),
  .date-input-wrap :deep(.form-date-picker.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--teal) inset;
  }

  /* slide-down 凭据内容区过渡 */
  .slide-down-enter-active {
    transition: all 0.2s ease;
  }

  .slide-down-leave-active {
    transition: all 0.15s ease;
  }

  .slide-down-enter-from,
  .slide-down-leave-to {
    max-height: 0;
    opacity: 0;
    transform: translateY(-6px);
  }

  .slide-down-enter-to,
  .slide-down-leave-from {
    max-height: 200px;
  }

  /* ════════════════════════════════════════════════
   结果弹窗（成功 / 失败）
════════════════════════════════════════════════ */
  .modal-result {
    width: 340px;
    text-align: center;
  }

  /* ── 成功弹窗：无 header，浮动关闭按钮 ── */
  .modal-result--success {
    padding-top: 20px;
    overflow: visible;
  }

  /* 浮动 × 按钮（右上角，在 modal-box 内部绝对定位） */
  .result-close-btn {
    position: absolute;
    top: 14px;
    right: 16px;
    z-index: 1;
    padding: 0;
    font-size: 16px;
    line-height: 1;
    color: var(--text-muted);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.2s;
  }

  .result-close-btn:hover {
    color: var(--text-primary);
  }

  /* 图标 */
  .result-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;
    border-radius: 50%;
  }

  .result-icon--success {
    background: rgb(0 210 195 / 6%);
    border: 2px solid var(--teal);
    box-shadow:
      0 0 0 6px rgb(0 210 195 / 6%),
      0 0 24px rgb(0 210 195 / 18%);
  }

  .result-icon--error {
    margin-top: 20px;
    background: rgb(255 77 79 / 6%);
    border: 2px solid var(--red);
    box-shadow:
      0 0 0 6px rgb(255 77 79 / 6%),
      0 0 24px rgb(255 77 79 / 18%);
  }

  /* 脉冲光圈动画（成功图标背景） */
  .result-icon-ring {
    position: absolute;
    inset: -8px;
    border: 1px solid rgb(0 210 195 / 25%);
    border-radius: 50%;
    animation: pulse-ring 2.4s ease-out infinite;
  }

  @keyframes pulse-ring {
    0% {
      opacity: 0.6;
      transform: scale(1);
    }

    70% {
      opacity: 0;
      transform: scale(1.18);
    }

    100% {
      opacity: 0;
      transform: scale(1.18);
    }
  }

  .result-title {
    margin-bottom: 4px;
    font-size: 22px;
    font-weight: 700;
  }

  .result-title--success {
    color: var(--teal);
  }

  .result-title--error {
    color: var(--red);
  }

  .result-subtitle {
    margin-bottom: 18px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  /* 检查列表 */
  .result-checks {
    padding: 10px 16px;
    margin: 0 20px 10px;
    text-align: left;
    background: rgb(10 25 37 / 80%);
    border-radius: 8px;
  }

  .check-row {
    display: flex;
    align-items: center;
    padding: 5px 0;
    font-size: 13px;
    border-bottom: 1px solid rgb(255 255 255 / 4%);
  }

  .check-row:last-child {
    border-bottom: none;
  }

  .check-label {
    min-width: 106px;
    color: var(--text-secondary);
  }

  .check-value {
    flex: 1;
    color: var(--text-primary);
  }

  .check-icon {
    flex-shrink: 0;
    margin-left: 4px;
  }

  .result-time {
    margin-bottom: 18px;
    font-size: 12px;
    color: var(--text-muted);
  }

  /* 成功弹窗底部关闭按钮（全宽 teal） */
  .result-footer {
    padding: 0 20px 20px;
  }

  .btn-result-close {
    width: 100%;
    padding: 11px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .btn-result-close--success {
    color: #fff;
    background: linear-gradient(135deg, #00c4b6 0%, #008a8a 100%);
    box-shadow: 0 2px 12px rgb(0 196 182 / 30%);
  }

  .btn-result-close--success:hover {
    box-shadow: 0 4px 16px rgb(0 196 182 / 40%);
    transform: translateY(-1px);
  }

  /* ── 失败弹窗：标准 header + 错误信息 + 三按钮 ── */
  .modal-result--error {
    text-align: center;
  }

  .error-anomaly-select {
    width: 100%;
    padding: 0 20px 14px;
    text-align: left;
  }

  .error-anomaly-label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .modal-result--error .custom-select-wrap--compact {
    max-width: 100%;
  }

  .modal-result--error .custom-select-wrap--compact .form-select {
    width: 100%;
  }

  .error-info {
    padding: 12px 16px;
    margin: 0 20px 16px;
    text-align: left;
    background: rgb(10 25 37 / 80%);
    border-radius: 8px;
  }

  .error-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: flex-start;
    padding: 4px 0;
    font-size: 13px;
  }

  .error-key {
    flex-shrink: 0;
    color: var(--text-secondary);
    white-space: nowrap;
  }

  .error-code {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: var(--red);
  }

  .error-val {
    color: var(--text-primary);
  }

  .error-suggestions {
    margin-top: 10px;
  }

  .sug-title {
    margin-bottom: 4px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .sug-item {
    font-size: 13px;
    line-height: 1.9;
    color: var(--text-primary);
  }

  /* 失败弹窗三按钮 footer */
  .error-footer {
    display: flex;
    gap: 8px;
    padding: 4px 20px 20px;
  }

  .error-footer .btn {
    flex: 1;
    justify-content: center;
  }

  /* ════════════════════════════════════════════════
   过渡动画
════════════════════════════════════════════════ */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.2s ease;
  }

  .modal-enter-active .modal-box,
  .modal-leave-active .modal-box {
    transition:
      transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
      opacity 0.2s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from .modal-box,
  .modal-leave-to .modal-box {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
  }

  /* ════════════════════════════════════════════════
   响应式
════════════════════════════════════════════════ */
  @media (width <= 900px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-actions {
      gap: 6px;
    }

    .cred-table th:nth-child(3),
    .cred-table td:nth-child(3),
    .cred-table th:nth-child(6),
    .cred-table td:nth-child(6) {
      display: none;
    }
  }

  @media (width <= 600px) {
    .stats-grid {
      grid-template-columns: 1fr 1fr;
    }

    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
