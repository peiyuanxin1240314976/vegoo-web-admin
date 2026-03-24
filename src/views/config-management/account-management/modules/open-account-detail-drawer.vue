<template>
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <transition name="drawer-slide">
    <div v-if="visible" class="oa-detail-drawer">
      <!-- ── 头部 ─────────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-id-row">
          <span class="oa-id">{{ data?.id }}</span>
          <span :class="['status-badge', getStatusClass(data?.status)]">
            <span class="status-dot" />{{ data?.status }}
          </span>
          <span v-if="data?.feishuRecords.length" class="feishu-badge">
            <svg viewBox="0 0 14 14" fill="none" width="11" height="11">
              <path d="M7 1L2 5v8h10V5L7 1z" stroke="#60a5fa" stroke-width="1.2" stroke-linejoin="round"/>
            </svg>
            飞书已推送
          </span>
        </div>
        <div class="header-actions">
          <ElButton
            v-if="data?.status === '待分配'"
            round size="small" class="btn-assign"
            @click="emit('assign', data!)"
          >
            分配凭据并激活
          </ElButton>
          <ElButton
            v-if="data?.adAccountId"
            round size="small" class="btn-view-account"
            @click="handleViewAccount"
          >
            查看广告账户 →
          </ElButton>
          <ElButton round size="small" class="btn-delete" @click="emit('delete', data!)">
            删除
          </ElButton>
          <button class="close-btn" @click="handleClose">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- ── 正文 ──────────────────────────────── -->
      <div class="drawer-body">
        <!-- 登记信息 -->
        <section class="detail-section">
          <div class="section-title">登记信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span class="platform-cell">
                <span class="platform-icon-wrap" :style="{ color: getPlatformColor(data?.source ?? ''), background: getPlatformBg(data?.source ?? '') }">
                  {{ getPlatformShort(data?.source ?? '') }}
                </span>
                <span class="info-val">{{ data?.source }}</span>
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">应用</span>
              <span class="app-chip">{{ data?.app }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">平台</span>
              <span :class="['platform-badge', data?.platform === 'iOS' ? 'platform-badge--ios' : 'platform-badge--android']">
                {{ data?.platform }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">开户类型</span>
              <span class="info-val">{{ data?.accountType }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">归属代理商</span>
              <span class="agency-val">{{ data?.agency }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">开户金额</span>
              <span class="info-val">${{ data?.amount.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">申请人</span>
              <span class="info-val">{{ data?.applicant }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">登记时间</span>
              <span class="info-val">{{ data?.registerTime }}</span>
            </div>
            <div v-if="data?.remark" class="info-item info-item--full">
              <span class="info-key">备注</span>
              <span class="info-val info-val--remark">{{ data.remark }}</span>
            </div>
          </div>
        </section>

        <!-- 广告账户信息 -->
        <section v-if="data?.adAccountId" class="detail-section">
          <div class="section-title">广告账户信息</div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">账户ID</span>
              <span class="info-val mono">{{ data.adAccountId }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">账户名称</span>
              <span class="info-val">{{ data.adAccountName }}</span>
            </div>
            <div v-if="data.activateTime" class="info-item">
              <span class="info-key">开通时间</span>
              <span class="info-val">{{ data.activateTime }}</span>
            </div>
            <div v-if="data.credential" class="info-item">
              <span class="info-key">关联凭据</span>
              <div class="credential-row">
                <span class="cred-chip">{{ data.credential }}</span>
                <span :class="['cred-status', data.credentialStatus === '验证正常' ? 'cred-status--ok' : 'cred-status--fail']">
                  <span class="cred-dot" />{{ data.credentialStatus }}
                </span>
              </div>
            </div>
            <div v-if="data.credential" class="cred-hint">已分配凭据，账户API调用已激活</div>
          </div>
        </section>

        <!-- 飞书推送记录 -->
        <section class="detail-section">
          <div class="section-header">
            <span class="section-title">飞书推送记录</span>
            <span class="feishu-on-badge">
              <span class="feishu-dot-sm" />飞书已开启
            </span>
          </div>
          <div v-if="data?.feishuRecords.length" class="feishu-timeline">
            <div
              v-for="(rec, i) in data.feishuRecords"
              :key="i"
              class="feishu-item"
            >
              <span :class="['feishu-item-dot', rec.result === '成功' ? 'feishu-item-dot--ok' : 'feishu-item-dot--fail']" />
              <div class="feishu-item-body">
                <div class="feishu-item-top">
                  <span class="feishu-time">{{ rec.time }}</span>
                  <span class="feishu-event">{{ rec.event }}</span>
                  <span :class="['feishu-result', rec.result === '成功' ? 'feishu-result--ok' : 'feishu-result--fail']">
                    ● {{ rec.result }}
                  </span>
                </div>
                <div class="feishu-target">已推送至：{{ rec.target }}</div>
              </div>
            </div>
          </div>
          <div v-else class="no-records">暂无推送记录</div>
          <div class="feishu-footer-tip">开户完成后系统自动推送飞书通知，无需配置管理员参与</div>
        </section>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import { PLATFORM_CONFIGS } from '../types'
  import type { OpenAccountItem } from '../types'

  defineOptions({ name: 'OpenAccountDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    data: OpenAccountItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    assign: [row: OpenAccountItem]
    delete: [row: OpenAccountItem]
  }>()

  const handleClose = () => emit('update:visible', false)

  const handleViewAccount = () => ElMessage.info('跳转广告账户功能开发中')

  function getPlatformColor(s: string) { return PLATFORM_CONFIGS.find((p) => p.value === s)?.color ?? '#94a3b8' }
  function getPlatformBg(s: string)    { return PLATFORM_CONFIGS.find((p) => p.value === s)?.bg    ?? 'rgb(148 163 184 / 12%)' }
  function getPlatformShort(s: string) { return PLATFORM_CONFIGS.find((p) => p.value === s)?.shortLabel ?? s[0] }

  function getStatusClass(status?: string) {
    if (status === '已激活')  return 'status-badge--ok'
    if (status === '待分配')  return 'status-badge--pending'
    return 'status-badge--fail'
  }
</script>

<style lang="scss" scoped>
  .drawer-overlay {
    position: fixed; inset: 0; z-index: 1000;
    background: rgb(0 0 0 / 40%);
  }

  .oa-detail-drawer {
    position: fixed; top: 0; right: 0; bottom: 0; z-index: 1001;
    display: flex; flex-direction: column;
    width: 420px;
    background: #131c2e;
    border-left: 1px solid rgb(255 255 255 / 7%);
    box-shadow: -8px 0 40px rgb(0 0 0 / 50%);
  }

  .fade-enter-active, .fade-leave-active { transition: opacity 0.22s; }
  .fade-enter-from, .fade-leave-to { opacity: 0; }
  .drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
  .drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }

  // ─── 头部 ────────────────────────────────────────────
  .drawer-header {
    padding: 16px 18px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .header-id-row {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  }

  .oa-id {
    font-size: 17px; font-weight: 700;
    font-family: 'SF Mono', monospace;
    color: #e2e8f0;
  }

  .status-badge {
    display: inline-flex; gap: 5px; align-items: center;
    padding: 2px 8px; font-size: 11px; border-radius: 20px;

    &--ok      { color: #22c55e; background: rgb(34 197 94 / 10%);   .status-dot { background: #22c55e; } }
    &--pending { color: #f59e0b; background: rgb(245 158 11 / 10%);  .status-dot { background: #f59e0b; } }
    &--fail    { color: #f87171; background: rgb(248 113 113 / 10%); .status-dot { background: #f87171; } }
  }

  .status-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }

  .feishu-badge {
    display: inline-flex; gap: 4px; align-items: center;
    padding: 2px 8px; font-size: 11px;
    color: #60a5fa;
    background: rgb(96 165 250 / 10%);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 20px;
  }

  .header-actions {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  }

  .btn-assign {
    font-size: 12px !important;
    color: #fff !important;
    background: #0d9488 !important;
    border: none !important;
    border-radius: 6px !important;
    &:hover { filter: brightness(1.1); }
  }

  .btn-view-account {
    font-size: 12px !important;
    color: #3b82f6 !important;
    background: rgb(59 130 246 / 10%) !important;
    border: 1px solid rgb(59 130 246 / 25%) !important;
    border-radius: 6px !important;
    &:hover { background: rgb(59 130 246 / 20%) !important; }
  }

  .btn-delete {
    font-size: 12px !important;
    color: #f87171 !important;
    background: rgb(248 113 113 / 10%) !important;
    border: 1px solid rgb(248 113 113 / 25%) !important;
    border-radius: 6px !important;
    &:hover { background: rgb(248 113 113 / 20%) !important; }
  }

  .close-btn {
    margin-left: auto;
    display: flex; align-items: center; justify-content: center;
    width: 28px; height: 28px;
    color: #64748b; cursor: pointer;
    background: transparent; border: none; border-radius: 6px;
    &:hover { color: #e2e8f0; background: rgb(255 255 255 / 6%); }
  }

  // ─── 正文 ────────────────────────────────────────────
  .drawer-body {
    flex: 1; overflow-y: auto; padding: 0 18px;
    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgb(255 255 255 / 10%); border-radius: 2px; }
  }

  .detail-section {
    padding: 16px 0;
    border-bottom: 1px solid rgb(255 255 255 / 5%);
    &:last-child { border-bottom: none; }
  }

  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 14px;
  }

  .section-title {
    font-size: 11px; font-weight: 600;
    color: #475569; letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .section-header .section-title { margin-bottom: 0; }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .info-list { display: flex; flex-direction: column; gap: 10px; }

  .info-item {
    display: flex; gap: 8px; align-items: center;

    &--full { grid-column: 1 / -1; }
  }

  .info-key {
    flex-shrink: 0; width: 68px;
    font-size: 11px; color: #64748b;
  }

  .info-val {
    font-size: 13px; color: #e2e8f0;
    &--remark { color: #94a3b8; }
  }

  .mono { font-family: 'SF Mono', monospace; font-size: 12px; }

  .platform-cell { display: flex; gap: 6px; align-items: center; }

  .platform-icon-wrap {
    display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px;
    font-size: 10px; font-weight: 700;
    border-radius: 5px; flex-shrink: 0;
  }

  .app-chip {
    display: inline-block; padding: 2px 8px;
    font-size: 11px; color: #3b82f6;
    background: rgb(59 130 246 / 10%); border-radius: 4px;
  }

  .platform-badge {
    display: inline-block; padding: 2px 7px; font-size: 11px; border-radius: 4px;
    &--android { color: #94a3b8; background: rgb(148 163 184 / 12%); }
    &--ios     { color: #a78bfa; background: rgb(167 139 250 / 12%); }
  }

  .agency-val { font-size: 13px; color: #22d3ee; }

  // ─── 凭据行 ──────────────────────────────────────────
  .credential-row { display: flex; gap: 8px; align-items: center; }

  .cred-chip {
    padding: 2px 8px; font-size: 12px;
    color: #3b82f6; background: rgb(59 130 246 / 10%); border-radius: 4px;
  }

  .cred-status {
    display: inline-flex; gap: 4px; align-items: center; font-size: 12px;
    &--ok   { color: #22c55e; .cred-dot { background: #22c55e; } }
    &--fail { color: #f87171; .cred-dot { background: #f87171; } }
  }

  .cred-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; }

  .cred-hint {
    margin-top: 6px; font-size: 12px; color: #64748b;
    padding: 6px 10px;
    background: rgb(34 197 94 / 6%);
    border: 1px solid rgb(34 197 94 / 15%);
    border-radius: 6px;
  }

  // ─── 飞书时间线 ──────────────────────────────────────
  .feishu-on-badge {
    display: inline-flex; gap: 5px; align-items: center;
    font-size: 12px; color: #22c55e;
  }

  .feishu-dot-sm {
    width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 5px #22c55e;
  }

  .feishu-timeline { display: flex; flex-direction: column; gap: 12px; }

  .feishu-item {
    display: flex; gap: 10px; align-items: flex-start;
  }

  .feishu-item-dot {
    width: 8px; height: 8px; border-radius: 50%;
    flex-shrink: 0; margin-top: 3px;
    &--ok   { background: #22c55e; }
    &--fail { background: #f87171; }
  }

  .feishu-item-body { display: flex; flex-direction: column; gap: 3px; }

  .feishu-item-top {
    display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
  }

  .feishu-time { font-size: 12px; color: #64748b; font-family: monospace; }
  .feishu-event { font-size: 12px; color: #e2e8f0; }
  .feishu-result {
    font-size: 11px;
    &--ok   { color: #22c55e; }
    &--fail { color: #f87171; }
  }

  .feishu-target { font-size: 11px; color: #475569; }

  .no-records { font-size: 13px; color: #475569; padding: 8px 0; }

  .feishu-footer-tip {
    margin-top: 12px; padding: 8px 12px;
    font-size: 11px; color: #475569;
    background: rgb(255 255 255 / 2%);
    border-radius: 6px;
  }
</style>
