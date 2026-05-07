<template>
  <div class="account-sub-page credential-page art-full-height">
    <div class="account-sub-page__toolbar">
      <div class="account-sub-page__toolbar-fx" aria-hidden="true" />
      <div class="account-sub-page__toolbar-row">
        <div class="account-sub-page__toolbar-copy">
          <span class="account-sub-page__toolbar-line" aria-hidden="true" />
          <div class="account-sub-page__toolbar-titles">
            <span class="account-sub-page__toolbar-eyebrow">App Store</span>
            <span class="account-sub-page__toolbar-title">应用商店凭据</span>
          </div>
          <span class="account-sub-page__toolbar-hint">凭据配置、批量测试与导出</span>
        </div>
        <div class="account-sub-page__toolbar-actions">
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary"
            @click="showAddDialog = true"
          >
            <ElIcon><Plus /></ElIcon>新增凭据
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleBatchTest">
            <ElIcon><Connection /></ElIcon>测试连接
          </ElButton>
          <ElButton round class="account-sub-page__btn-secondary" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出
          </ElButton>
        </div>
      </div>
    </div>

    <section class="account-sub-page__list-panel credential-page__panel" aria-label="应用商店凭据">
      <div class="account-sub-page__list-panel-fx" aria-hidden="true" />
      <div class="account-sub-page__list-panel-body credential-page__panel-body">
        <div class="app-store-filter-bar">
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
          <ElButton
            type="primary"
            round
            class="account-sub-page__btn-primary btn-query"
            @click="handleQuery"
          >
            查询
          </ElButton>
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
                    <img
                      :src="platformIcon(row.platform)"
                      :alt="row.platform"
                      class="platform-icon"
                    />
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
                    <svg
                      v-if="row.verifyOk"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      class="icon-ok"
                    >
                      <path
                        d="M2 7l3.5 3.5L12 4"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                      />
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 14 14" class="icon-err">
                      <path
                        d="M3 3l8 8M11 3l-8 8"
                        stroke="currentColor"
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
                    <button
                      type="button"
                      class="action-btn action-btn--primary"
                      @click.stop="handleEdit(row)"
                    >
                      编辑
                    </button>
                    <span class="action-sep" aria-hidden="true">|</span>
                    <button
                      type="button"
                      class="action-btn action-btn--secondary"
                      @click.stop="row.status === '连接异常' ? handleRetry(row) : handleTest(row)"
                    >
                      {{
                        row.status === '连接异常'
                          ? '重试'
                          : row.status === '即将过期'
                            ? '续期'
                            : '测试'
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
          <svg width="16" height="16" viewBox="0 0 16 16" class="alert-bar__icon" fill="none">
            <path
              d="M8 1L1 14h14L8 1z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <path
              d="M8 6v4M8 11.5v.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ alertBarSummaryText }}</span>
          <button type="button" class="alert-link" @click="openAlertConnectionDetail"
            >查看详情</button
          >
        </div>
      </div>
    </section>

    <!-- ===== 新增 / 编辑 凭据弹窗（共用同一个表单结构） ===== -->
    <Teleport to="body">
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
                      stroke="currentColor"
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
                      stroke="currentColor"
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
                  <AppDatePicker
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
              <button type="button" class="btn btn-ghost" @click="closeFormDialog">取消</button>
              <button type="button" class="btn btn-primary" @click="handleSaveForm">
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
                  stroke="currentColor"
                  stroke-width="2.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <div class="result-title result-title--success">连接成功</div>
            <div class="result-subtitle"
              >{{ testingRow?.platform }} | {{ testingRow?.appName }}</div
            >

            <div class="result-checks">
              <div v-for="check in successChecks" :key="check.label" class="check-row">
                <span class="check-label">{{ check.label }}</span>
                <span class="check-value">{{ check.value }}</span>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" class="check-icon">
                  <path
                    d="M2 6.5l3 3 6-6"
                    stroke="currentColor"
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
                  stroke="currentColor"
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
                    stroke="currentColor"
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
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { Plus, Download, Connection } from '@element-plus/icons-vue'
  import AppDatePicker from '@/components/core/forms/AppDatePicker.vue'
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

<style lang="scss" scoped>
  .account-sub-page.credential-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --as-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --as-surface: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --as-header-bg: color-mix(in srgb, var(--default-box-color) 78%, black 4%);
    --as-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --bg-modal: color-mix(in srgb, var(--default-box-color) 96%, transparent);
    --bg-card: var(--as-surface);
    --bg-table: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    --bg-row-hover: var(--as-row-hover);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --border-light: color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    --teal: var(--el-color-primary);
    --teal-dim: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --green: var(--art-success);
    --red: var(--art-danger);
    --orange: var(--art-warning);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);

    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow-x: clip;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    color: var(--page-text-main);
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .account-sub-page.credential-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 55% 40% at 88% 0%,
        color-mix(in srgb, var(--theme-color) 22%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 40% 32% at 12% 6%,
        color-mix(in srgb, var(--el-color-primary) 16%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 28%, transparent 55%);
  }

  .account-sub-page.credential-page > * {
    position: relative;
    z-index: 1;
  }

  .account-sub-page__toolbar {
    position: relative;
    flex-shrink: 0;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 18%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .account-sub-page__toolbar-fx {
    position: absolute;
    inset: -50% -10% 35%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 200deg at 70% 40%,
      color-mix(in srgb, var(--el-color-primary) 14%, transparent),
      color-mix(in srgb, var(--theme-color) 12%, transparent),
      color-mix(in srgb, var(--art-success) 8%, transparent),
      color-mix(in srgb, var(--el-color-primary) 14%, transparent)
    );
    filter: blur(40px);
    opacity: 0.5;
  }

  .account-sub-page__toolbar-row {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 16px 20px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-box-color) 76%, transparent)
      ),
      linear-gradient(
        118deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent),
        color-mix(in srgb, var(--el-color-primary) 6%, transparent)
      );
  }

  .account-sub-page__toolbar-row::after {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary) 45%, transparent) 35%,
      color-mix(in srgb, var(--theme-color) 38%, transparent) 65%,
      transparent 100%
    );
    opacity: 0.85;
  }

  .account-sub-page__toolbar-copy {
    display: grid;
    flex: 1 1 220px;
    grid-template-rows: auto auto;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 4px 12px;
    align-items: center;
    min-width: 0;
  }

  .account-sub-page__toolbar-line {
    display: inline-block;
    grid-row: 1 / span 2;
    align-self: center;
    width: 4px;
    height: 36px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--el-color-primary) 70%, transparent),
      color-mix(in srgb, var(--theme-color) 55%, transparent)
    );
    border-radius: 999px;
    box-shadow: 0 0 18px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  }

  .account-sub-page__toolbar-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .account-sub-page__toolbar-hint {
    grid-column: 2;
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-tertiary);
  }

  .account-sub-page__toolbar-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.65;
  }

  .account-sub-page__toolbar-title {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    background-color: transparent;
    background-image: linear-gradient(
      105deg,
      var(--page-text-main) 0%,
      color-mix(in srgb, var(--el-color-primary) 72%, var(--page-text-main) 28%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .account-sub-page__toolbar-actions {
    display: flex;
    flex: 1 1 280px;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
  }

  .account-sub-page__list-panel {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 93%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 86%, transparent) 100%
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 5%, transparent),
        color-mix(in srgb, var(--theme-color) 4%, transparent)
      );
    isolation: isolate;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 16%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);

    &::before {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      z-index: 2;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 42%, transparent) 40%,
        color-mix(in srgb, var(--theme-color) 32%, transparent) 70%,
        transparent 100%
      );
      border-radius: 20px 20px 0 0;
      opacity: 0.8;
    }
  }

  .account-sub-page__list-panel-fx {
    position: absolute;
    inset: -35% 20% 40%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 55% at 18% 0%,
      color-mix(in srgb, var(--el-color-primary) 18%, transparent) 0%,
      transparent 62%
    );
    filter: blur(32px);
    opacity: 0.55;
  }

  .account-sub-page__list-panel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 14px 14px 16px;
    overflow: auto;
    scrollbar-gutter: stable;
  }

  .account-sub-page__btn-primary.el-button--primary {
    font-weight: 600 !important;
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent) !important;
    transition:
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out),
      filter var(--duration-normal) var(--ease-out);

    &:hover {
      filter: brightness(1.04);
      box-shadow:
        0 12px 28px color-mix(in srgb, var(--el-color-primary) 34%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 18%, transparent) !important;
      transform: translateY(-1px);
    }
  }

  .account-sub-page__btn-secondary.el-button {
    --el-button-bg-color: color-mix(in srgb, var(--default-box-color) 52%, transparent);
    --el-button-border-color: color-mix(in srgb, var(--el-color-primary) 20%, transparent);
    --el-button-text-color: var(--text-secondary);
    --el-button-hover-text-color: var(--el-color-primary);
    --el-button-hover-border-color: color-mix(in srgb, var(--el-color-primary) 48%, transparent);
    --el-button-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 9%, transparent);
    --el-button-active-text-color: var(--el-color-primary);
    --el-button-active-border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
    --el-button-active-bg-color: color-mix(in srgb, var(--el-color-primary) 12%, transparent);

    font-weight: 500;
    transition:
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &:hover {
      box-shadow: 0 8px 18px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
      transform: translateY(-1px);
    }
  }

  .btn-query.el-button {
    height: 32px !important;
    padding: 0 16px !important;
    font-size: 13px !important;
  }

  .app-store-filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 16px;
    background:
      radial-gradient(
        ellipse 90% 70% at 12% 0%,
        color-mix(in srgb, var(--el-color-primary) 10%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 96%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 88%, transparent) 100%
      );
    border: 1px solid var(--as-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
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
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--el-color-primary) 92%, black 8%) 0%,
      color-mix(in srgb, var(--el-color-primary) 55%, black 45%) 100%
    );
    box-shadow: 0 2px 12px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  }

  .btn-primary:hover {
    box-shadow: 0 4px 16px color-mix(in srgb, var(--el-color-primary) 38%, transparent);
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover {
    color: var(--text-primary);
    border-color: var(--text-secondary);
  }

  .btn-danger {
    color: #fff;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--art-danger) 85%, black 15%),
      color-mix(in srgb, var(--art-danger) 100%, white 0%)
    );
  }

  .btn-warning {
    color: #fff;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--art-warning) 75%, black 25%),
      color-mix(in srgb, var(--art-warning) 95%, white 5%)
    );
  }

  .btn-success-close {
    justify-content: center;
    width: 100%;
    padding: 9px 32px;
    margin-top: 4px;
    color: #fff;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--el-color-primary) 88%, black 12%),
      color-mix(in srgb, var(--el-color-primary) 55%, black 45%)
    );
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
    border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
  }

  .stat-card--configured::before {
    background: linear-gradient(135deg, var(--el-color-primary), transparent);
  }

  .stat-card--normal {
    border-color: color-mix(in srgb, var(--art-success) 45%, transparent);
  }

  .stat-card--normal::before {
    background: linear-gradient(135deg, var(--art-success), transparent);
  }

  .stat-card--error {
    border-color: color-mix(in srgb, var(--art-danger) 45%, transparent);
  }

  .stat-card--error::before {
    background: linear-gradient(135deg, var(--art-danger), transparent);
  }

  .stat-card--expiring {
    border-color: color-mix(in srgb, var(--art-warning) 45%, transparent);
  }

  .stat-card--expiring::before {
    background: linear-gradient(135deg, var(--art-warning), transparent);
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
    color: var(--art-success);
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
    background: var(--as-header-bg);
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

  .icon-ok {
    color: var(--el-color-primary);
  }

  .icon-err {
    color: var(--art-danger);
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
    background: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    border-color: color-mix(in srgb, var(--el-color-primary) 32%, transparent);
  }

  .status-badge--expiring {
    color: var(--orange);
    background: color-mix(in srgb, var(--art-warning) 10%, transparent);
    border-color: color-mix(in srgb, var(--art-warning) 32%, transparent);
  }

  .status-badge--error {
    color: var(--red);
    background: color-mix(in srgb, var(--art-danger) 10%, transparent);
    border-color: color-mix(in srgb, var(--art-danger) 32%, transparent);
  }

  /* ── 操作按钮：编辑＝系统主题色；重试/续期/测试＝统一次要色；无图标 ── */
  .action-cell {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: center;
  }

  .action-btn {
    padding: 4px 6px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 6px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out);

    &--primary {
      color: var(--el-color-primary);

      &:hover {
        background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      }

      &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--el-color-primary) 45%, transparent);
        outline-offset: 2px;
      }
    }

    &--secondary {
      color: var(--text-secondary);

      &:hover {
        color: var(--text-primary);
        background: color-mix(in srgb, var(--default-box-color) 70%, transparent);
      }

      &:focus-visible {
        outline: 2px solid color-mix(in srgb, var(--text-secondary) 35%, transparent);
        outline-offset: 2px;
      }
    }
  }

  .action-sep {
    flex-shrink: 0;
    padding: 0 1px;
    font-size: 12px;
    line-height: 1;
    color: color-mix(in srgb, var(--border) 85%, transparent);
    user-select: none;
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
    background: color-mix(in srgb, var(--art-warning) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-warning) 22%, transparent);
    border-radius: 8px;
  }

  .alert-bar__icon {
    flex-shrink: 0;
    color: var(--art-warning);
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
    --bg-modal: color-mix(in srgb, var(--default-box-color) 96%, transparent);
    --bg-table: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    --bg-row-hover: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    --border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --border-light: color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    --teal: var(--el-color-primary);
    --teal-dim: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --red: var(--art-danger);
    --orange: var(--art-warning);

    position: fixed;
    inset: 0;
    z-index: 3000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
    background: color-mix(in srgb, var(--default-bg-color) 28%, transparent);
    backdrop-filter: blur(1.5px);
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
    background: var(--bg-table);
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
    box-shadow: 0 0 12px color-mix(in srgb, var(--el-color-primary) 14%, transparent);
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
    background: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid var(--border);
    border-radius: 11px;
    transition: background 0.25s ease;
  }

  .toggle-btn--on {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--el-color-primary) 92%, black 8%),
      color-mix(in srgb, var(--el-color-primary) 55%, black 45%)
    );
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
    color: var(--text-secondary);
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
    background: var(--bg-table);
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
    color: var(--el-color-primary);
    background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    border: 2px solid var(--teal);
    box-shadow:
      0 0 0 6px color-mix(in srgb, var(--el-color-primary) 8%, transparent),
      0 0 24px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
  }

  .result-icon--error {
    margin-top: 20px;
    color: var(--art-danger);
    background: color-mix(in srgb, var(--art-danger) 8%, transparent);
    border: 2px solid var(--red);
    box-shadow:
      0 0 0 6px color-mix(in srgb, var(--art-danger) 8%, transparent),
      0 0 24px color-mix(in srgb, var(--art-danger) 22%, transparent);
  }

  /* 脉冲光圈动画（成功图标背景） */
  .result-icon-ring {
    position: absolute;
    inset: -8px;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border-radius: 8px;
  }

  .check-row {
    display: flex;
    align-items: center;
    padding: 5px 0;
    font-size: 13px;
    border-bottom: 1px solid color-mix(in srgb, var(--el-color-primary) 6%, transparent);
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
    color: var(--art-success);
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
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--el-color-primary) 92%, black 8%) 0%,
      color-mix(in srgb, var(--el-color-primary) 55%, black 45%) 100%
    );
    box-shadow: 0 2px 12px color-mix(in srgb, var(--el-color-primary) 32%, transparent);
  }

  .btn-result-close--success:hover {
    box-shadow: 0 4px 16px color-mix(in srgb, var(--el-color-primary) 42%, transparent);
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
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

    .account-sub-page__toolbar-actions {
      gap: 8px;
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

    .account-sub-page__toolbar-row {
      flex-direction: column;
      align-items: stretch;
    }

    .account-sub-page__toolbar-actions {
      justify-content: flex-start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .table-row {
      animation: none;
    }

    .result-icon-ring {
      animation: none;
    }

    .account-sub-page__btn-primary.el-button--primary:hover,
    .account-sub-page__btn-secondary.el-button:hover,
    .btn-primary:hover,
    .btn-result-close--success:hover {
      transform: none;
    }

    .modal-enter-active .modal-box,
    .modal-leave-active .modal-box {
      transition: opacity 0.15s ease;
    }

    .modal-enter-from .modal-box,
    .modal-leave-to .modal-box {
      transform: none;
    }
  }
</style>
