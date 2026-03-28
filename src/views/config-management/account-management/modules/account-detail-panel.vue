<template>
  <div class="account-detail-panel">
    <!-- 空状态 -->
    <div v-if="!accountData" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
          <rect
            x="8"
            y="8"
            width="32"
            height="32"
            rx="4"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M16 18h16M16 24h10M16 30h8"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      <p class="empty-text">请选择账户查看详情</p>
    </div>

    <template v-else>
      <!-- ── 头部 ──────────────────────────────────────── -->
      <div class="panel-header">
        <div class="header-left">
          <div class="header-name-row">
            <span class="account-name">{{ accountData.accountName }}</span>
            <span class="account-id-chip">{{ accountData.id }}</span>
          </div>
          <div class="header-status-row">
            <span :class="['status-dot-wrap', getStatusClass(accountData.status)]">
              <span class="status-dot" />
              {{ accountData.status }}
            </span>
          </div>
        </div>
        <div class="header-right">
          <ElButton round size="small" class="btn-edit" @click="handleEdit">编辑</ElButton>
          <ElButton
            v-if="accountData.status !== '已停用'"
            round
            size="small"
            class="btn-disable"
            @click="handleDisable"
          >
            停用
          </ElButton>
        </div>
      </div>

      <!-- ── Tab 切换 ──────────────────────────────────── -->
      <div class="panel-tabs">
        <button
          :class="['panel-tab', { 'panel-tab--active': activeTab === 'basic' }]"
          @click="activeTab = 'basic'"
        >
          基本信息
        </button>
        <button
          :class="['panel-tab', { 'panel-tab--active': activeTab === 'credential' }]"
          @click="activeTab = 'credential'"
        >
          凭据管理
        </button>
      </div>

      <!-- ── 正文滚动区 ────────────────────────────────── -->
      <div class="panel-body">
        <!-- 基本信息 Tab -->
        <template v-if="activeTab === 'basic'">
          <!-- 基本信息 -->
          <section class="detail-section">
            <div class="section-title">基本信息</div>
            <div class="info-list">
              <div class="info-item">
                <span class="info-key">账户ID</span>
                <span class="info-val">{{ accountData.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">账户名称</span>
                <span class="info-val">{{ accountData.accountName }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">广告平台</span>
                <span class="info-val platform-val" :style="getPlatformStyle(accountData.source)">
                  {{ accountData.source }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-key">账户类型</span>
                <span
                  :class="[
                    'type-badge',
                    accountData.accountType === '直投' ? 'type-badge--direct' : 'type-badge--proxy'
                  ]"
                >
                  {{ accountData.accountType }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-key">归属BC/BM</span>
                <span class="info-val info-val--link">{{ accountData.bcBm }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">归属代理商</span>
                <span class="info-val">{{ accountData.agency }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">投放应用</span>
                <div class="app-tags">
                  <span v-for="app in accountData.apps" :key="app" class="app-tag">{{ app }}</span>
                  <span v-if="!accountData.apps?.length" class="info-val">—</span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-key">投放平台</span>
                <span class="info-val">{{ accountData.platform?.join('、') || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">账户用途</span>
                <div class="purpose-tags">
                  <span v-for="p in accountData.purposes" :key="p" class="purpose-tag">{{
                    p
                  }}</span>
                  <span v-if="!accountData.purposes?.length" class="info-val">—</span>
                </div>
              </div>
              <div class="info-item">
                <span class="info-key">创建时间</span>
                <span class="info-val">{{ accountData.createTime || '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">备注</span>
                <span class="info-val info-val--remark">{{ accountData.remark || '—' }}</span>
              </div>
            </div>
          </section>

          <!-- 账户余额 -->
          <section class="detail-section">
            <div class="section-title">账户余额</div>
            <div class="finance-balance-row">
              <span class="balance-amount">
                ${{ (accountData.balance ?? 0).toLocaleString('en-US') }}
              </span>
              <span class="balance-limit">
                消耗上限：${{ (accountData.spendLimit ?? 0).toLocaleString('en-US') }}/月
              </span>
            </div>
            <div class="finance-meta-row">
              <span class="meta-item">
                本月消耗：<strong
                  >${{ (accountData.monthSpend ?? 0).toLocaleString('en-US') }}</strong
                >
              </span>
              <span class="meta-item">
                消耗进度：<strong class="pct-val">{{ accountData.spendProgress ?? 0 }}%</strong>
              </span>
            </div>
            <div class="spend-progress-bar">
              <div
                class="spend-progress-fill"
                :style="{ width: `${Math.min(accountData.spendProgress ?? 0, 100)}%` }"
              />
            </div>
            <div class="last-recharge-row">
              <span class="finance-key">货币：</span>
              <span class="finance-val">{{ accountData.currency || 'USD' }}</span>
              <span class="finance-key ml">最近充值：</span>
              <span class="finance-val">
                {{ accountData.lastRechargeTime }}
                <span class="recharge-amount">
                  ${{ (accountData.lastRechargeAmount ?? 0).toLocaleString('en-US') }}
                </span>
              </span>
            </div>
          </section>

          <!-- 近30天消耗走势 -->
          <section class="detail-section detail-section--last">
            <div class="section-title">近30天消耗走势</div>
            <div class="chart-placeholder">
              <svg viewBox="0 0 280 80" class="trend-svg">
                <polyline
                  :points="trendPoints"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <polyline :points="trendAreaPoints" fill="url(#trendGradPanel)" stroke="none" />
                <defs>
                  <linearGradient id="trendGradPanel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2" />
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div class="chart-x-labels">
                <span v-for="lbl in xLabels" :key="lbl" class="x-label">{{ lbl }}</span>
              </div>
            </div>
          </section>
        </template>

        <!-- 凭据管理 Tab -->
        <template v-else-if="activeTab === 'credential'">
          <!-- 凭据列表 -->
          <section class="detail-section">
            <div class="section-title-row">
              <span class="section-title-text">凭据列表</span>
              <button class="btn-new-cred" @click="handleNewCred"> + 新建凭据 </button>
            </div>
            <div class="cred-table">
              <div class="cred-table-header">
                <span class="cth cth--name">凭据名称</span>
                <span class="cth cth--type">凭据类型</span>
                <span class="cth cth--status">验证状态</span>
                <span class="cth cth--time">最后验证时间</span>
                <span class="cth cth--action">操作</span>
              </div>
              <div
                v-for="cred in mockCredentials"
                :key="cred.name"
                :class="['cred-row', { 'cred-row--active': selectedCred?.name === cred.name }]"
                @click="selectedCred = cred"
              >
                <span class="ctd ctd--name">{{ cred.name }}</span>
                <span class="ctd ctd--type">{{ cred.type }}</span>
                <span class="ctd ctd--status">
                  <span :class="['cred-status', `cred-status--${cred.statusKey}`]">
                    <span class="cred-status-dot" />{{ cred.statusLabel }}
                  </span>
                </span>
                <span class="ctd ctd--time">{{ cred.lastValidated }}</span>
                <div class="ctd ctd--action cred-actions">
                  <button class="cred-action-btn" @click.stop="selectedCred = cred">查看</button>
                  <button class="cred-action-btn" @click.stop="handleEditCred(cred)">编辑</button>
                  <button
                    class="cred-action-btn cred-action-btn--danger"
                    @click.stop="handleDeleteCred(cred)"
                    >删除</button
                  >
                </div>
              </div>
            </div>
          </section>

          <!-- 凭据详情 -->
          <section v-if="selectedCred" class="detail-section detail-section--last">
            <div class="section-title-row">
              <span class="section-title-text">凭据详情</span>
            </div>
            <div class="cred-detail-list">
              <div class="cred-detail-item">
                <span class="cred-detail-key">凭据名称</span>
                <span class="cred-detail-val">{{ selectedCred.name }}</span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">凭据类型</span>
                <span class="cred-detail-val">{{ selectedCred.type }}</span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">Client ID</span>
                <span class="cred-detail-val cred-detail-val--mono">{{
                  selectedCred.clientId
                }}</span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">Client Secret</span>
                <span class="cred-detail-val">
                  <span class="secret-mask">{{
                    showSecrets.clientSecret ? selectedCred.clientSecret : '●●●●●●●●●●●'
                  }}</span>
                  <button
                    class="show-btn"
                    @click="showSecrets.clientSecret = !showSecrets.clientSecret"
                  >
                    {{ showSecrets.clientSecret ? '隐藏' : '显示' }}
                  </button>
                </span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">Access Token</span>
                <span class="cred-detail-val">
                  <span class="secret-mask">{{
                    showSecrets.accessToken
                      ? selectedCred.accessToken
                      : selectedCred.accessTokenMasked
                  }}</span>
                  <button
                    class="show-btn"
                    @click="showSecrets.accessToken = !showSecrets.accessToken"
                  >
                    {{ showSecrets.accessToken ? '隐藏' : '显示' }}
                  </button>
                </span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">Refresh Token</span>
                <span class="cred-detail-val">
                  <span class="secret-mask">{{
                    showSecrets.refreshToken
                      ? selectedCred.refreshToken
                      : selectedCred.refreshTokenMasked
                  }}</span>
                  <button
                    class="show-btn"
                    @click="showSecrets.refreshToken = !showSecrets.refreshToken"
                  >
                    {{ showSecrets.refreshToken ? '隐藏' : '显示' }}
                  </button>
                </span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">过期时间</span>
                <span class="cred-detail-val">{{ selectedCred.expireTime }}</span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">关联应用</span>
                <div class="cred-app-tags">
                  <span v-for="app in selectedCred.apps" :key="app" class="cred-app-tag">{{
                    app
                  }}</span>
                </div>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">验证状态</span>
                <span :class="['cred-status', `cred-status--${selectedCred.statusKey}`]">
                  <span class="cred-status-dot" />{{ selectedCred.statusLabel }}
                </span>
              </div>
              <div class="cred-detail-item">
                <span class="cred-detail-key">最后验证</span>
                <span class="cred-detail-val">{{ selectedCred.lastValidated }}</span>
              </div>
            </div>
            <div class="cred-detail-actions">
              <button class="cred-detail-btn cred-detail-btn--revalidate">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  width="13"
                  height="13"
                  style="margin-right: 4px"
                >
                  <path
                    d="M13.5 2.5A6.5 6.5 0 1 1 2 8.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                  <path
                    d="M2 4v4.5h4.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                重新验证
              </button>
              <button class="cred-detail-btn cred-detail-btn--copy">
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  width="13"
                  height="13"
                  style="margin-right: 4px"
                >
                  <rect
                    x="5"
                    y="5"
                    width="9"
                    height="9"
                    rx="1.5"
                    stroke="currentColor"
                    stroke-width="1.4"
                  />
                  <path
                    d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
                    stroke="currentColor"
                    stroke-width="1.4"
                  />
                </svg>
                复制Token
              </button>
            </div>
          </section>
        </template>
      </div>

      <!-- ── 底部操作栏 ─────────────────────────────────── -->
      <div class="panel-footer">
        <ElButton round class="footer-btn footer-btn--recharge" @click="handleRecharge">
          充值
        </ElButton>
        <ElButton round class="footer-btn footer-btn--report"> 查看报表 </ElButton>
        <ElButton round class="footer-btn footer-btn--credential"> 更换凭据 </ElButton>
      </div>
    </template>
  </div>

  <!-- 凭据：新建 / 编辑弹窗 -->
  <CredentialFormDialog
    v-model:visible="credFormVisible"
    :edit-data="credFormEditData"
    :account-data="accountData"
    @success="handleCredFormSuccess"
  />

  <!-- 凭据：删除确认弹窗 -->
  <CredentialDeleteDialog
    v-model:visible="credDeleteVisible"
    :cred-data="credDeleteTarget"
    :account-data="accountData"
    @confirm="handleCredDeleteConfirm"
  />
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { AdAccountItem, CredentialItem } from '../types'
  import { PLATFORM_CONFIGS } from '../types'
  import CredentialFormDialog from './credential-form-dialog.vue'
  import CredentialDeleteDialog from './credential-delete-dialog.vue'

  defineOptions({ name: 'AccountDetailPanel' })

  const props = defineProps<{
    accountData: AdAccountItem | null
  }>()

  const emit = defineEmits<{
    edit: [data: AdAccountItem]
    recharge: [data: AdAccountItem]
    disable: [data: AdAccountItem]
  }>()

  // ─── 凭据弹窗状态 ────────────────────────────────────────
  const credFormVisible = ref(false)
  const credFormEditData = ref<CredentialItem | null>(null)
  const credDeleteVisible = ref(false)
  const credDeleteTarget = ref<CredentialItem | null>(null)

  const handleNewCred = () => {
    credFormEditData.value = null
    credFormVisible.value = true
  }

  const handleEditCred = (cred: CredItem) => {
    // 将内部 CredItem 映射为 CredentialItem（mock 场景，字段对齐即可）
    credFormEditData.value = {
      id: cred.name,
      name: cred.name,
      source: props.accountData?.source ?? 'Google Ads',
      group: '',
      credentialType: cred.type as any,
      remark: '',
      apps: cred.apps,
      accountCount: 1,
      accountIds: [props.accountData?.id ?? ''],
      status:
        cred.statusKey === 'ok'
          ? '验证正常'
          : cred.statusKey === 'expiring'
            ? '验证失败'
            : '待验证',
      lastValidateTime: cred.lastValidated,
      config: {
        clientId: cred.clientId,
        clientSecret: cred.clientSecret,
        accessToken: cred.accessToken,
        refreshToken: cred.refreshToken
      },
      validateHistory: []
    } as any
    credFormVisible.value = true
  }

  const handleDeleteCred = (cred: CredItem) => {
    credDeleteTarget.value = {
      id: cred.name,
      name: cred.name,
      source: props.accountData?.source ?? 'Google Ads',
      group: '',
      credentialType: cred.type as any,
      remark: '',
      apps: cred.apps,
      accountCount: 1,
      accountIds: [],
      status: '验证正常',
      lastValidateTime: cred.lastValidated,
      config: {},
      validateHistory: []
    } as any
    credDeleteVisible.value = true
  }

  const handleCredFormSuccess = () => {
    credFormVisible.value = false
  }

  const handleCredDeleteConfirm = () => {
    if (selectedCred.value?.name === credDeleteTarget.value?.name) {
      selectedCred.value = null
    }
    credDeleteVisible.value = false
  }

  const activeTab = ref<'basic' | 'credential'>('basic')

  // ─── 凭据管理 ────────────────────────────────────────────
  interface CredItem {
    name: string
    type: string
    statusKey: 'ok' | 'expiring' | 'error'
    statusLabel: string
    lastValidated: string
    clientId: string
    clientSecret: string
    accessToken: string
    accessTokenMasked: string
    refreshToken: string
    refreshTokenMasked: string
    expireTime: string
    apps: string[]
  }

  const mockCredentials = computed<CredItem[]>(() => {
    const src = props.accountData?.source ?? 'Google Ads'
    return [
      {
        name: `${src.replace(/ /g, '-')}-Main-Token`,
        type: '客户端 Token',
        statusKey: 'ok',
        statusLabel: '验证正常',
        lastValidated: '2024-03-26 10:30',
        clientId: '1234567890-abc.apps.googleusercontent.com',
        clientSecret: 'GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ',
        accessToken: 'ya29.a0AfH6SMfulltoken_example_long',
        accessTokenMasked: 'ya29.a0AfH6SM●●●●●●●●●',
        refreshToken: '1//0gLRIlongrefreshtoken_example',
        refreshTokenMasked: '1//0gLRI●●●●●●●●●',
        expireTime: '2024-06-26 10:30',
        apps: props.accountData?.apps?.slice(0, 2) ?? []
      },
      {
        name: `${src.replace(/ /g, '-')}-Refresh-Key`,
        type: 'Refresh Token',
        statusKey: 'ok',
        statusLabel: '验证正常',
        lastValidated: '2024-03-25 08:15',
        clientId: '9876543210-xyz.apps.googleusercontent.com',
        clientSecret: 'GOCSPX-zYxWvUtSrQpOnMlKjIhGfEdCbA',
        accessToken: 'ya29.b1BgI7TN_refresh_example_token',
        accessTokenMasked: 'ya29.b1BgI7TN●●●●●●●●●',
        refreshToken: '1//1hMSJlongrefreshtoken_example2',
        refreshTokenMasked: '1//1hMSJ●●●●●●●●●',
        expireTime: '2024-09-10 08:15',
        apps: props.accountData?.apps?.slice(0, 1) ?? []
      },
      {
        name: `${src.replace(/ /g, '-')}-Service-Acc`,
        type: '服务账号证书',
        statusKey: 'expiring',
        statusLabel: '即将过期',
        lastValidated: '2024-02-20 14:22',
        clientId: '5555555555-svc.iam.gserviceaccount.com',
        clientSecret: 'service-account-private-key-content',
        accessToken: 'ya29.c2ChJ8UO_service_example_token',
        accessTokenMasked: 'ya29.c2ChJ8UO●●●●●●●●●',
        refreshToken: '1//2iNTKlongservicetoken_example3',
        refreshTokenMasked: '1//2iNTK●●●●●●●●●',
        expireTime: '2024-03-01 14:22',
        apps: []
      }
    ]
  })

  const selectedCred = ref<CredItem | null>(null)
  const showSecrets = ref({ clientSecret: false, accessToken: false, refreshToken: false })

  // 切换账户时重置 tab 及凭据选中
  watch(
    () => props.accountData?.id,
    () => {
      activeTab.value = 'basic'
      selectedCred.value = null
      showSecrets.value = { clientSecret: false, accessToken: false, refreshToken: false }
    }
  )

  // 切换 tab 时重置凭据选中
  watch(activeTab, () => {
    selectedCred.value = null
    showSecrets.value = { clientSecret: false, accessToken: false, refreshToken: false }
  })

  const handleEdit = () => {
    if (props.accountData) emit('edit', props.accountData)
  }

  const handleRecharge = () => {
    if (props.accountData) emit('recharge', props.accountData)
  }

  const handleDisable = () => {
    if (props.accountData) emit('disable', props.accountData)
  }

  function getStatusClass(status?: string) {
    if (status === '正常') return 'status--normal'
    if (status === '余额不足') return 'status--warning'
    return 'status--disabled'
  }

  function getPlatformStyle(source?: string) {
    const cfg = PLATFORM_CONFIGS.find((p) => p.value === source)
    if (!cfg) return {}
    return { color: cfg.color }
  }

  // ─── 趋势图 SVG ────────────────────────────────────────
  const xLabels = ['2/12', '2/15', '2/22', '2/27', '3/6', '3/11', '3/13']
  const rawTrend = [2200, 2800, 3300, 2700, 3100, 3500, 3000, 2600, 3200, 2900, 3400, 3700, 3200]

  const trendPoints = computed(() => {
    const min = Math.min(...rawTrend)
    const max = Math.max(...rawTrend)
    const w = 280
    const h = 72
    return rawTrend
      .map((v, i) => {
        const x = (i / (rawTrend.length - 1)) * w
        const y = h - ((v - min) / (max - min)) * (h - 8) - 4
        return `${x},${y}`
      })
      .join(' ')
  })

  const trendAreaPoints = computed(() => {
    const min = Math.min(...rawTrend)
    const max = Math.max(...rawTrend)
    const w = 280
    const h = 72
    const pts = rawTrend
      .map((v, i) => {
        const x = (i / (rawTrend.length - 1)) * w
        const y = h - ((v - min) / (max - min)) * (h - 8) - 4
        return `${x},${y}`
      })
      .join(' ')
    return `${pts} ${w},${h} 0,${h}`
  })
</script>

<style lang="scss" scoped>
  .account-detail-panel {
    --bg-panel: #0f1829;
    --bg-header: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --accent-dim: rgb(59 130 246 / 12%);
    --green: #22c55e;
    --green-bg: rgb(34 197 94 / 12%);
    --amber: #f59e0b;
    --amber-bg: rgb(245 158 11 / 12%);
    --red: #ef4444;
    --red-bg: rgb(239 68 68 / 10%);

    display: flex;
    flex-direction: column;
    width: 420px;
    min-width: 420px;
    height: 100%;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

  // ─── 空状态 ────────────────────────────────────────────
  .empty-state {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
  }

  .empty-text {
    font-size: 13px;
  }

  // ─── 头部 ──────────────────────────────────────────────
  .panel-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 16px 12px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border);
  }

  .header-left {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .header-name-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .account-name {
    overflow: hidden;
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-id-chip {
    flex-shrink: 0;
    padding: 2px 7px;
    font-size: 11px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .header-status-row {
    display: flex;
    align-items: center;
  }

  .status-dot-wrap {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--normal {
      color: var(--green);
    }
    &.status--warning {
      color: var(--amber);
    }
    &.status--disabled {
      color: var(--text-muted);
    }
  }

  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    .status--normal & {
      background: var(--green);
    }
    .status--warning & {
      background: var(--amber);
    }
    .status--disabled & {
      background: var(--text-muted);
    }
  }

  .header-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    margin-left: 10px;
  }

  .btn-edit {
    height: 26px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
    color: var(--accent) !important;
    background: var(--accent-dim) !important;
    border: 1px solid rgb(59 130 246 / 30%) !important;
    border-radius: 6px !important;

    &:hover {
      background: rgb(59 130 246 / 20%) !important;
    }
  }

  .btn-disable {
    height: 26px !important;
    padding: 0 10px !important;
    font-size: 12px !important;
    color: var(--red) !important;
    background: transparent !important;
    border: 1px solid var(--red) !important;
    border-radius: 6px !important;

    &:hover {
      background: var(--red-bg) !important;
    }
  }

  // ─── Tab 切换 ──────────────────────────────────────────
  .panel-tabs {
    display: flex;
    flex-shrink: 0;
    gap: 0;
    padding: 0 16px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border);
  }

  .panel-tab {
    padding: 10px 16px;
    font-size: 13px;
    color: var(--text-secondary);
    cursor: pointer;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    transition: all 0.15s;

    &:hover {
      color: var(--text-primary);
    }

    &--active {
      font-weight: 500;
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
  }

  // ─── 滚动主体 ──────────────────────────────────────────
  .panel-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 8%);
      border-radius: 2px;
    }
  }

  .detail-section {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);

    &--last {
      border-bottom: none;
    }
  }

  .section-title {
    display: flex;
    gap: 6px;
    align-items: baseline;
    padding-left: 8px;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  .section-sub {
    font-size: 11px;
    font-weight: 400;
    color: var(--text-muted);
  }

  // ─── 基本信息 ──────────────────────────────────────────
  .info-list {
    display: flex;
    flex-direction: column;
    gap: 9px;
  }

  .info-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .info-key {
    flex-shrink: 0;
    width: 68px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  .info-val {
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.8;
    color: var(--text-primary);

    &--link {
      color: var(--accent);
      cursor: pointer;
    }
    &--remark {
      color: var(--text-secondary);
    }
  }

  .platform-val {
    font-size: 13px;
    font-weight: 500;
  }

  .type-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &--direct {
      color: var(--accent);
      background: var(--accent-dim);
    }

    &--proxy {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }
  }

  .app-tags,
  .purpose-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .app-tag {
    padding: 2px 7px;
    font-size: 12px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .purpose-tag {
    padding: 2px 7px;
    font-size: 12px;
    color: var(--green);
    background: var(--green-bg);
    border-radius: 4px;
  }

  // ─── 财务 ──────────────────────────────────────────────
  .finance-balance-row {
    display: flex;
    gap: 12px;
    align-items: baseline;
    margin-bottom: 8px;
  }

  .balance-amount {
    font-size: 22px;
    font-weight: 700;
    color: var(--accent);
  }

  .balance-limit {
    font-size: 12px;
    color: var(--text-muted);
  }

  .finance-meta-row {
    display: flex;
    gap: 16px;
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .pct-val {
    color: var(--accent);
  }

  .spend-progress-bar {
    width: 100%;
    height: 5px;
    margin-bottom: 10px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  .spend-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), #60a5fa);
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  .last-recharge-row {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .finance-key {
    color: var(--text-muted);
  }

  .finance-val {
    font-weight: 500;
    color: var(--text-primary);
  }

  .ml {
    margin-left: 8px;
  }

  .recharge-amount {
    margin-left: 6px;
    font-size: 13px;
    font-weight: 600;
    color: var(--green);
  }

  // ─── 凭据 ──────────────────────────────────────────────
  .credential-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .credential-left {
    display: flex;
    gap: 7px;
    align-items: center;
  }

  .credential-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .credential-platform {
    padding: 2px 6px;
    font-size: 11px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 5%);
    border-radius: 3px;
  }

  .credential-token {
    font-size: 11px;
    color: var(--text-muted);
  }

  .credential-right {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }

  .credential-status {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    color: var(--green);
  }

  .cred-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    &--ok {
      background: var(--green);
    }
  }

  .link-btn {
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    background: none;
    border: none;
    transition: opacity 0.15s;

    &:hover {
      opacity: 0.7;
    }
  }

  .credential-hint {
    font-size: 12px;
    color: var(--text-muted);
  }

  // ─── 趋势图 ─────────────────────────────────────────────
  .chart-placeholder {
    width: 100%;
  }

  .trend-svg {
    width: 100%;
    height: 80px;
    overflow: visible;
  }

  .chart-x-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
  }

  .x-label {
    font-size: 10px;
    color: var(--text-muted);
  }

  // ─── 凭据管理 Tab ──────────────────────────────────────
  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .section-title-text {
    padding-left: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  .btn-new-cred {
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    background: var(--accent);
    border: none;
    border-radius: 6px;
    transition: filter 0.15s;

    &:hover {
      filter: brightness(1.1);
    }
  }

  // 凭据列表表格
  .cred-table {
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .cred-table-header {
    display: flex;
    padding: 8px 10px;
    font-size: 11px;
    color: var(--text-muted);
    background: rgb(255 255 255 / 3%);
    border-bottom: 1px solid var(--border);
  }

  .cred-row {
    display: flex;
    padding: 8px 10px;
    font-size: 12px;
    cursor: pointer;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: rgb(255 255 255 / 3%);
    }

    &--active {
      background: var(--accent-dim) !important;
    }
  }

  .cth,
  .ctd {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--name {
      flex: 2.5;
      min-width: 0;
    }

    &--type {
      flex: 2;
      min-width: 0;
    }

    &--status {
      flex: 1.8;
      min-width: 0;
    }

    &--time {
      flex: 2;
      min-width: 0;
    }

    &--action {
      flex-shrink: 0;
      width: 88px;
      overflow: visible;
    }
  }

  .ctd {
    color: var(--text-primary);
  }

  .cred-status {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &--ok {
      color: var(--green);
    }
    &--expiring {
      color: var(--amber);
    }
    &--error {
      color: var(--red);
    }
  }

  .cred-status-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .cred-status--ok & {
      background: var(--green);
    }
    .cred-status--expiring & {
      background: var(--amber);
    }
    .cred-status--error & {
      background: var(--red);
    }
  }

  .cred-actions {
    display: flex;
    gap: 2px;
    align-items: center;
  }

  .cred-action-btn {
    padding: 2px 5px;
    font-size: 11px;
    color: var(--text-secondary);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 3px;
    transition: all 0.15s;

    &:hover {
      color: var(--accent);
      background: var(--accent-dim);
    }

    &--danger {
      &:hover {
        color: var(--red) !important;
        background: var(--red-bg) !important;
      }
    }
  }

  // 凭据详情
  .cred-detail-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
  }

  .cred-detail-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .cred-detail-key {
    flex-shrink: 0;
    width: 80px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--text-muted);
  }

  .cred-detail-val {
    display: flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    min-width: 0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.7;
    color: var(--text-primary);

    &--mono {
      overflow: hidden;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      color: var(--text-secondary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .secret-mask {
    max-width: 160px;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: var(--text-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .show-btn {
    flex-shrink: 0;
    padding: 1px 6px;
    font-size: 11px;
    color: var(--accent);
    cursor: pointer;
    background: var(--accent-dim);
    border: 1px solid rgb(59 130 246 / 25%);
    border-radius: 4px;
    transition: all 0.15s;

    &:hover {
      background: rgb(59 130 246 / 20%);
    }
  }

  .cred-app-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .cred-app-tag {
    padding: 1px 7px;
    font-size: 11px;
    color: var(--accent);
    background: var(--accent-dim);
    border-radius: 4px;
  }

  .cred-detail-actions {
    display: flex;
    gap: 8px;
  }

  .cred-detail-btn {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.15s;

    &--revalidate {
      color: var(--green);
      background: var(--green-bg);
      border: 1px solid rgb(34 197 94 / 25%);

      &:hover {
        background: rgb(34 197 94 / 20%);
      }
    }

    &--copy {
      color: var(--text-secondary);
      background: transparent;
      border: 1px solid var(--border);

      &:hover {
        color: var(--text-primary);
        border-color: rgb(255 255 255 / 15%);
      }
    }
  }

  // ─── 底部操作栏 ────────────────────────────────────────
  .panel-footer {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    padding: 12px 16px;
    background: var(--bg-header);
    border-top: 1px solid var(--border);
  }

  .footer-btn {
    flex: 1;
    height: 34px !important;
    font-size: 12px !important;
    border-radius: 7px !important;
    transition: all 0.15s !important;

    &--recharge {
      font-weight: 600 !important;
      color: #fff !important;
      background: var(--accent) !important;
      border: none !important;

      &:hover {
        filter: brightness(1.1);
      }
    }

    &--report {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid var(--border) !important;

      &:hover {
        color: var(--text-primary) !important;
        border-color: rgb(255 255 255 / 15%) !important;
      }
    }

    &--credential {
      color: var(--text-secondary) !important;
      background: transparent !important;
      border: 1px solid var(--border) !important;

      &:hover {
        color: var(--accent) !important;
        border-color: var(--accent) !important;
      }
    }
  }
</style>
