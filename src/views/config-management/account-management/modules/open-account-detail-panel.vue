<template>
  <div class="oa-detail-panel">
    <div v-if="!data" class="empty-state">
      <svg viewBox="0 0 48 48" fill="none" width="36" height="36">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M16 18h16M16 24h10M16 30h8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      <p class="empty-text">请选择记录查看详情</p>
    </div>

    <template v-else>
      <!-- 头部 -->
      <div class="panel-header">
        <div class="header-top">
          <span
            class="platform-icon"
            :style="{
              color: getPlatformColor(data.source),
              background: getPlatformBg(data.source)
            }"
          >
            {{ getPlatformShort(data.source) }}
          </span>
          <span class="record-id">{{ data.id }}</span>
          <span :class="['status-badge', getStatusClass(data.status)]">
            <span class="s-dot">{{ getStatusIcon(data.status) }}</span
            >{{ data.status }}
          </span>
        </div>
        <div class="header-sub">
          <span class="platform-name">{{ data.source }}</span>
          <span class="sep">·</span>
          <span class="app-name">{{ data.app }}</span>
          <span class="sep">·</span>
          <span class="platform-tag">{{ data.platform }}</span>
        </div>
      </div>

      <!-- 正文 -->
      <div class="panel-body">
        <!-- 基础信息 -->
        <section class="detail-section">
          <div class="section-title-row">
            <span class="section-title">基础信息</span>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-key">广告平台</span>
              <span
                class="info-val platform-val"
                :style="{ color: getPlatformColor(data.source) }"
                >{{ data.source }}</span
              >
            </div>
            <div class="info-item">
              <span class="info-key">应用</span>
              <span class="info-val">{{ data.app }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">投放平台</span>
              <span
                :class="[
                  'platform-badge',
                  data.platform === 'iOS'
                    ? 'platform-badge--ios'
                    : data.platform === '网页'
                      ? 'platform-badge--web'
                      : 'platform-badge--android'
                ]"
              >
                {{ data.platform }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">开户类型</span>
              <span :class="['type-badge', `type-badge--${typeClass(data.accountType)}`]">{{
                data.accountType
              }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">归属代理商</span>
              <span class="info-val agency-val">{{ data.agency }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">开户金额</span>
              <span class="info-val amount-val">${{ data.amount.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">申请人</span>
              <span class="info-val">{{ data.applicant }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">登记时间</span>
              <span class="info-val info-val--muted">{{ data.registerTime?.slice(0, 10) }}</span>
            </div>
            <div v-if="data.activateTime" class="info-item">
              <span class="info-key">开通时间</span>
              <span class="info-val info-val--muted">{{ data.activateTime?.slice(0, 10) }}</span>
            </div>
            <div v-if="data.remark" class="info-item">
              <span class="info-key">备注</span>
              <span class="info-val info-val--remark">{{ data.remark }}</span>
            </div>
          </div>
        </section>

        <!-- 广告账户信息 -->
        <section class="detail-section">
          <div class="section-title">广告账户信息</div>
          <div v-if="data.adAccountId" class="info-list">
            <div class="info-item">
              <span class="info-key">账户ID</span>
              <span class="info-val info-val--mono">{{ data.adAccountId }}</span>
            </div>
            <div v-if="data.adAccountName" class="info-item">
              <span class="info-key">账户名称</span>
              <span class="info-val">{{ data.adAccountName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">关联凭据</span>
              <span v-if="data.credential" class="cred-badge">{{ data.credential }}</span>
              <span v-else class="info-val info-val--muted">未关联</span>
            </div>
            <div v-if="data.credentialStatus" class="info-item">
              <span class="info-key">凭据状态</span>
              <span
                :class="[
                  'cred-status',
                  data.credentialStatus === '验证正常' ? 'cred-status--ok' : 'cred-status--fail'
                ]"
              >
                <span class="cred-status-dot" />{{ data.credentialStatus }}
              </span>
            </div>
          </div>
          <div v-else class="empty-account">
            <span class="empty-account-text">开户完成后填写账户信息</span>
          </div>
        </section>

        <!-- 飞书记录 -->
        <section v-if="data.feishuRecords?.length" class="detail-section detail-section--last">
          <div class="section-title">飞书推送记录</div>
          <div class="feishu-list">
            <div v-for="(rec, i) in data.feishuRecords" :key="i" class="feishu-item">
              <span
                :class="[
                  'feishu-dot',
                  rec.result === '成功' ? 'feishu-dot--ok' : 'feishu-dot--fail'
                ]"
              />
              <span class="feishu-msg">{{ rec.event }} · {{ rec.target }}</span>
              <span class="feishu-time">{{ rec.time?.slice(5, 16) }}</span>
            </div>
          </div>
        </section>
        <section v-else class="detail-section detail-section--last">
          <div class="section-title">飞书推送记录</div>
          <div class="empty-account"><span class="empty-account-text">暂无推送记录</span></div>
        </section>
      </div>

      <!-- 底部 -->
      <div class="panel-footer">
        <ElButton
          v-if="data.status === '待分配'"
          round
          class="footer-btn footer-btn--primary"
          @click="emit('assign', data)"
        >
          分配凭据
        </ElButton>
        <ElButton round class="footer-btn footer-btn--secondary" @click="emit('delete', data)"
          >删除记录</ElButton
        >
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { PLATFORM_CONFIGS } from '../types'
  import type { OpenAccountItem } from '../types'

  defineOptions({ name: 'OpenAccountDetailPanel' })

  defineProps<{ data: OpenAccountItem | null }>()

  const emit = defineEmits<{
    assign: [data: OpenAccountItem]
    delete: [data: OpenAccountItem]
  }>()

  function getPlatformColor(s: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === s)?.color ?? '#94a3b8'
  }
  function getPlatformBg(s: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === s)?.bg ?? 'rgb(148 163 184 / 12%)'
  }
  function getPlatformShort(s: string) {
    return PLATFORM_CONFIGS.find((p) => p.value === s)?.shortLabel ?? s[0]
  }

  function getStatusClass(status?: string) {
    if (status === '已激活') return 'status--ok'
    if (status === '待分配') return 'status--pending'
    return 'status--fail'
  }

  function getStatusIcon(status?: string) {
    if (status === '已激活') return '●'
    if (status === '开户失败') return '✕'
    return '○'
  }

  function typeClass(t?: string) {
    if (t === '企业户') return 'corp'
    if (t === '个人户') return 'personal'
    return 'small'
  }
</script>

<style lang="scss" scoped>
  .oa-detail-panel {
    --bg-panel: #0f1829;
    --bg-hd: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #3b82f6;
    --teal: #0d9488;

    display: flex;
    flex-direction: column;
    width: 360px;
    min-width: 360px;
    height: 100%;
    overflow: hidden;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-panel);
    border: 1px solid var(--border);
    border-radius: 10px;
  }

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

  // 头部
  .panel-header {
    flex-shrink: 0;
    padding: 14px 16px 12px;
    background: var(--bg-hd);
    border-bottom: 1px solid var(--border);
  }

  .header-top {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }

  .platform-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
  }

  .record-id {
    font-family: 'SF Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .status-badge {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;

    &.status--ok {
      color: #22c55e;
    }

    &.status--pending {
      color: #f59e0b;
    }

    &.status--fail {
      color: #f87171;
    }
  }

  .s-dot {
    font-size: 10px;
  }

  .header-sub {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 12px;
    color: var(--text-muted);
  }

  .platform-name {
    color: var(--text-secondary);
  }

  .app-name {
    color: var(--text-secondary);
  }

  .platform-tag {
    color: var(--text-muted);
  }

  .sep {
    color: var(--border);
  }

  // 正文
  .panel-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 8%);
      border-radius: 2px;
    }
  }

  .detail-section {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);

    &--last {
      border-bottom: none;
    }
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .section-title {
    display: block;
    padding-left: 8px;
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  .section-title-row .section-title {
    margin-bottom: 0;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .info-item {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }

  .info-key {
    flex-shrink: 0;
    width: 60px;
    font-size: 12px;
    line-height: 1.8;
    color: var(--text-muted);
  }

  .info-val {
    flex: 1;
    font-size: 13px;
    line-height: 1.8;
    color: var(--text-primary);

    &--mono {
      font-family: 'SF Mono', monospace;
      font-size: 11px;
      color: var(--text-secondary);
    }

    &--muted {
      font-size: 12px;
      color: var(--text-muted);
    }

    &--remark {
      color: var(--text-secondary);
    }
  }

  .platform-val {
    font-weight: 600;
  }

  .agency-val {
    color: #22d3ee;
  }

  .amount-val {
    font-weight: 600;
    color: #22c55e;
  }

  .platform-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--android {
      color: #94a3b8;
      background: rgb(148 163 184 / 12%);
      border: 1px solid rgb(148 163 184 / 20%);
    }

    &--ios {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
      border: 1px solid rgb(167 139 250 / 20%);
    }

    &--web {
      color: #38bdf8;
      background: rgb(56 189 248 / 12%);
      border: 1px solid rgb(56 189 248 / 20%);
    }
  }

  .type-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    border-radius: 4px;

    &--corp {
      color: #60a5fa;
      background: rgb(96 165 250 / 12%);
    }

    &--personal {
      color: #a78bfa;
      background: rgb(167 139 250 / 12%);
    }

    &--small {
      color: #34d399;
      background: rgb(52 211 153 / 12%);
    }
  }

  .cred-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 11px;
    color: #0d9488;
    background: rgb(13 148 136 / 12%);
    border-radius: 4px;
  }

  .cred-status {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;

    &--ok {
      color: #22c55e;

      .cred-status-dot {
        background: #22c55e;
      }
    }

    &--fail {
      color: #f87171;

      .cred-status-dot {
        background: #f87171;
      }
    }
  }

  .cred-status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .empty-account {
    padding: 8px 0;
  }

  .empty-account-text {
    font-size: 12px;
    color: var(--text-muted);
  }

  // 飞书记录
  .feishu-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .feishu-item {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12px;
  }

  .feishu-dot {
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;

    &--ok {
      background: #22c55e;
    }

    &--fail {
      background: #f87171;
    }
  }

  .feishu-msg {
    flex: 1;
    color: var(--text-secondary);
  }

  .feishu-time {
    color: var(--text-muted);
    white-space: nowrap;
  }

  // 底部
  .panel-footer {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    padding: 12px 16px;
    background: var(--bg-hd);
    border-top: 1px solid var(--border);
  }

  .footer-btn {
    flex: 1;
    height: 32px !important;
    font-size: 12px !important;
    border-radius: 7px !important;

    &--primary {
      color: #fff !important;
      background: var(--teal) !important;
      border: none !important;

      &:hover {
        filter: brightness(1.1);
      }
    }

    &--secondary {
      color: #f87171 !important;
      background: rgb(248 113 113 / 8%) !important;
      border: 1px solid rgb(248 113 113 / 20%) !important;

      &:hover {
        background: rgb(248 113 113 / 15%) !important;
      }
    }
  }
</style>
