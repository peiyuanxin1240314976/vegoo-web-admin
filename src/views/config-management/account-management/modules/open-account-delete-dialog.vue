<template>
  <el-dialog
    v-model="dialogVisible"
    width="440px"
    :close-on-click-modal="false"
    header-class="oa-delete-dialog-hd"
    body-class="oa-delete-dialog-bd"
    footer-class="oa-delete-dialog-ft"
  >
    <template #header>
      <div class="dialog-title-row">
        <span class="dialog-title">删除开户记录</span>
        <span class="confirm-badge">CONFIRM</span>
      </div>
    </template>

    <!-- 垃圾桶图标 -->
    <div class="delete-icon-wrap">
      <div class="delete-icon-ring">
        <svg viewBox="0 0 48 48" fill="none" width="44" height="44">
          <circle cx="24" cy="24" r="22" fill="rgb(239 68 68 / 12%)" stroke="#ef4444" stroke-width="1.8" />
          <path d="M16 18h16M20 18v-2h8v2" stroke="#ef4444" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M18 18l1.5 14h9l1.5-14" stroke="#ef4444" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M21 22v7M24 22v7M27 22v7" stroke="#ef4444" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <p class="delete-title">确认删除以下开户记录？</p>

    <!-- 记录信息卡 -->
    <div class="record-card">
      <div class="record-card-top">
        <span class="record-platform-icon" :style="{ color: getPlatformColor(data?.source ?? ''), background: getPlatformBg(data?.source ?? '') }">
          {{ getPlatformShort(data?.source ?? '') }}
        </span>
        <span class="record-id">{{ data?.id }}</span>
        <span :class="['record-status-badge', getStatusClass(data?.status)]">
          {{ data?.status }}
        </span>
      </div>
      <div class="record-info-grid">
        <div class="record-info-item">
          <span class="record-info-key">广告平台</span>
          <span class="record-info-val">{{ data?.source }}</span>
        </div>
        <div class="record-info-item">
          <span class="record-info-key">应用</span>
          <span class="record-info-val">{{ data?.app }}</span>
        </div>
        <div class="record-info-item">
          <span class="record-info-key">开户金额</span>
          <span class="record-info-val">${{ data?.amount.toLocaleString() }}</span>
        </div>
        <div class="record-info-item">
          <span class="record-info-key">登记时间</span>
          <span class="record-info-val">{{ data?.registerTime?.slice(0, 10) }}</span>
        </div>
        <div class="record-info-item record-info-item--full">
          <span class="record-info-key">归属代理商</span>
          <span class="record-info-val record-info-val--agency">{{ data?.agency }}</span>
        </div>
      </div>
    </div>

    <!-- 警告列表 -->
    <div class="warn-list">
      <div class="warn-item warn-item--amber">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
          <path d="M8 2L14 13H2L8 2Z" stroke="#f59e0b" stroke-width="1.4" stroke-linejoin="round"/>
          <path d="M8 6v4" stroke="#f59e0b" stroke-width="1.4" stroke-linecap="round"/>
          <circle cx="8" cy="12" r="0.6" fill="#f59e0b"/>
        </svg>
        删除后该开户记录将永久删除，无法恢复
      </div>
      <div class="warn-item warn-item--blue">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
          <circle cx="8" cy="8" r="7" stroke="#3b82f6" stroke-width="1.4"/>
          <path d="M8 7v4M8 5v.5" stroke="#3b82f6" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        该记录当前状态为「{{ data?.status }}」，{{ data?.credential ? `已关联凭据 ${data.credential}` : '未关联凭据' }}
      </div>
      <div class="warn-item warn-item--green">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" class="warn-icon">
          <circle cx="8" cy="8" r="7" stroke="#22c55e" stroke-width="1.4"/>
          <path d="M5 8l2 2 4-4" stroke="#22c55e" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        删除后不影响其他账户正常运行
      </div>
    </div>

    <template #footer>
      <ElButton round class="dialog-btn dialog-btn--cancel" @click="handleCancel">取消</ElButton>
      <ElButton round class="dialog-btn dialog-btn--delete" :loading="deleting" @click="handleConfirm">
        确认删除
      </ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { PLATFORM_CONFIGS } from '../types'
  import type { OpenAccountItem } from '../types'

  defineOptions({ name: 'OpenAccountDeleteDialog' })

  const props = defineProps<{ visible: boolean; data: OpenAccountItem | null }>()
  const emit = defineEmits<{
    'update:visible': [val: boolean]
    confirm: []
  }>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  const deleting = ref(false)

  function getPlatformColor(s: string) { return PLATFORM_CONFIGS.find((p) => p.value === s)?.color ?? '#94a3b8' }
  function getPlatformBg(s: string)    { return PLATFORM_CONFIGS.find((p) => p.value === s)?.bg    ?? 'rgb(148 163 184 / 12%)' }
  function getPlatformShort(s: string) { return PLATFORM_CONFIGS.find((p) => p.value === s)?.shortLabel ?? s[0] }

  function getStatusClass(status?: string) {
    if (status === '已激活')  return 'record-status-badge--ok'
    if (status === '待分配')  return 'record-status-badge--pending'
    return 'record-status-badge--fail'
  }

  const handleCancel = () => emit('update:visible', false)
  const handleConfirm = async () => {
    deleting.value = true
    try {
      await new Promise((r) => setTimeout(r, 600))
      emit('confirm')
      emit('update:visible', false)
    } finally {
      deleting.value = false
    }
  }
</script>

<style lang="scss">
  .el-dialog:has(.oa-delete-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow-lg) !important;
  }
  .el-dialog:has(.oa-delete-dialog-bd) .el-dialog__header.oa-delete-dialog-hd {
    padding: 16px 20px 14px;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }
  .el-dialog:has(.oa-delete-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;
    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }
  .el-dialog:has(.oa-delete-dialog-bd) .el-dialog__body.oa-delete-dialog-bd {
    padding: 16px 20px 8px;
    background: var(--cm-dialog-bg-inner);
  }
  .el-dialog:has(.oa-delete-dialog-bd) .el-dialog__footer.oa-delete-dialog-ft {
    padding: 14px 20px;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
    text-align: right;
  }
</style>

<style lang="scss" scoped>
  .dialog-title-row {
    display: flex; gap: 10px; align-items: center;
  }

  .dialog-title {
    font-size: 15px; font-weight: 600;
    color: var(--cm-dialog-text-primary, #e2e8f0);
  }

  .confirm-badge {
    padding: 2px 8px;
    font-size: 10px; font-weight: 700;
    color: #f59e0b; letter-spacing: 0.05em;
    background: rgb(245 158 11 / 12%);
    border: 1px solid rgb(245 158 11 / 25%);
    border-radius: 4px;
  }

  // ─── 图标 ────────────────────────────────────────────
  .delete-icon-wrap {
    display: flex; justify-content: center;
    margin-bottom: 12px;
  }

  .delete-icon-ring {
    display: inline-flex; align-items: center; justify-content: center;
    width: 68px; height: 68px;
    background: rgb(239 68 68 / 6%);
    border-radius: 50%;
  }

  .delete-title {
    margin-bottom: 14px;
    font-size: 15px; font-weight: 600;
    color: #e2e8f0; text-align: center;
  }

  // ─── 记录信息卡 ──────────────────────────────────────
  .record-card {
    padding: 14px 16px; margin-bottom: 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 10px;
  }

  .record-card-top {
    display: flex; gap: 10px; align-items: center;
    margin-bottom: 12px;
  }

  .record-platform-icon {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px;
    font-size: 10px; font-weight: 700;
    border-radius: 5px; flex-shrink: 0;
  }

  .record-id {
    font-size: 15px; font-weight: 700;
    font-family: 'SF Mono', monospace; color: #e2e8f0;
  }

  .record-status-badge {
    margin-left: auto;
    padding: 2px 8px; font-size: 12px; border-radius: 4px;

    &--ok      { color: #22c55e; background: rgb(34 197 94 / 12%); }
    &--pending { color: #f59e0b; background: rgb(245 158 11 / 12%); }
    &--fail    { color: #f87171; background: rgb(248 113 113 / 12%); }
  }

  .record-info-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
  }

  .record-info-item {
    display: flex; gap: 8px; align-items: center; font-size: 13px;
    &--full { grid-column: 1 / -1; }
  }

  .record-info-key { color: #64748b; width: 58px; flex-shrink: 0; font-size: 12px; }
  .record-info-val { color: #e2e8f0; }
  .record-info-val--agency { color: #22d3ee; }

  // ─── 警告 ────────────────────────────────────────────
  .warn-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }

  .warn-item {
    display: flex; gap: 8px; align-items: flex-start;
    font-size: 13px;

    &--amber { color: #fcd34d; }
    &--blue  { color: #93c5fd; }
    &--green { color: #86efac; }
  }

  .warn-icon { flex-shrink: 0; margin-top: 1px; }

  // ─── 按钮 ────────────────────────────────────────────
  .dialog-btn {
    border-radius: 8px !important;
    &--cancel {
      color: #94a3b8 !important; background: transparent !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      &:hover { color: #e2e8f0 !important; }
    }
    &--delete {
      color: #fff !important; background: #ef4444 !important; border: none !important;
      &:hover { filter: brightness(1.1); }
    }
  }
</style>
