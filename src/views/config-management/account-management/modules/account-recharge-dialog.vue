<template>
  <el-dialog
    v-model="dialogVisible"
    title="账户充值"
    width="520px"
    :close-on-click-modal="false"
    header-class="acc-recharge-dialog-hd"
    body-class="acc-recharge-dialog-bd"
    footer-class="acc-recharge-dialog-ft"
    @close="handleClose"
  >
    <!-- 账户信息头 -->
    <div class="account-info-head">
      <div class="account-info-left">
        <span class="account-info-name">{{ accountData?.accountName }}</span>
        <span class="account-info-id">{{ accountData?.id }}</span>
      </div>
      <span :class="['info-status', getStatusClass(accountData?.status)]">
        <span class="info-status-dot" />
        {{ accountData?.status }}
      </span>
    </div>

    <div class="recharge-body">
      <!-- 财务概览 -->
      <div class="finance-overview">
        <div class="finance-item">
          <span class="finance-key">当前余额</span>
          <span class="finance-val finance-val--balance">
            ${{ (accountData?.balance ?? 0).toLocaleString('en-US') }}
          </span>
        </div>
        <div class="finance-item">
          <span class="finance-key">本月消耗</span>
          <span class="finance-val">
            ${{ (accountData?.monthSpend ?? 0).toLocaleString('en-US') }}
          </span>
        </div>
        <div class="finance-item">
          <span class="finance-key">消耗金额</span>
          <span class="finance-val">
            ${{ Math.round((accountData?.spendProgress ?? 0) / 100 * (accountData?.spendLimit ?? 0)).toLocaleString('en-US') }}
          </span>
        </div>
      </div>

      <!-- 消耗进度 -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">
            消耗上限：${{ (accountData?.spendLimit ?? 0).toLocaleString('en-US') }}/月
          </span>
          <span class="progress-pct">消耗进度 {{ accountData?.spendProgress ?? 0 }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${Math.min(accountData?.spendProgress ?? 0, 100)}%` }"
          />
        </div>
      </div>

      <!-- 充值金额选择 -->
      <div class="form-block">
        <div class="form-label">充值金额 <span class="required">*</span></div>
        <div class="amount-presets">
          <button
            v-for="preset in presets"
            :key="preset"
            :class="['preset-btn', { 'preset-btn--active': selectedPreset === preset && !customMode }]"
            @click="handlePreset(preset)"
          >
            ${{ preset.toLocaleString('en-US') }}
          </button>
          <button
            :class="['preset-btn', { 'preset-btn--active': customMode }]"
            @click="handleCustom"
          >
            自定义
          </button>
          <div class="custom-amount-wrap">
            <span class="amount-prefix">$</span>
            <el-input
              v-model="customAmountStr"
              class="dark-input custom-amount-input"
              placeholder="0"
              @input="handleCustomInput"
            />
          </div>
        </div>
      </div>

      <!-- 充值方式 -->
      <div class="form-block">
        <div class="form-label">充值方式</div>
        <el-radio-group v-model="form.method" class="method-radio-group">
          <div class="method-option">
            <el-radio value="platform" class="dark-radio">
              广告平台充值
              <span class="method-desc">（通过平台充值接口）</span>
            </el-radio>
          </div>
          <div class="method-option">
            <el-radio value="small-campaign" class="dark-radio">
              小额广告系列
              <span class="method-desc">（小额广告平台充值）</span>
            </el-radio>
          </div>
          <div class="method-option">
            <el-radio value="other" class="dark-radio">
              其他方式
            </el-radio>
          </div>
        </el-radio-group>
      </div>

      <!-- 充值备注 -->
      <div class="form-block">
        <div class="form-label">充值备注</div>
        <el-input v-model="form.remark" placeholder="如：常规月度充值" class="dark-input" />
      </div>

      <!-- 充值后余额预览 -->
      <div class="after-balance-row">
        <span class="after-balance-label">充值后余额：</span>
        <span class="after-balance-val">
          ${{ afterBalance.toLocaleString('en-US') }}
        </span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <ElButton round class="btn-cancel" @click="handleClose">取消</ElButton>
        <ElButton round class="btn-confirm" :loading="loading" @click="handleConfirm">
          确认充值
        </ElButton>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue'
  import type { AdAccountItem, RechargeFormModel } from '../types'

  defineOptions({ name: 'AccountRechargeDialog' })

  const props = defineProps<{
    visible: boolean
    accountData?: AdAccountItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    success: [data: RechargeFormModel]
  }>()

  const loading = ref(false)
  const presets = [500, 1000, 2000, 5000]
  const selectedPreset = ref(1000)
  const customMode = ref(false)
  const customAmountStr = ref('1000')

  const form = reactive<RechargeFormModel>({
    amount: 1000,
    customAmount: '',
    method: 'platform',
    remark: ''
  })

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const afterBalance = computed(() => {
    return (props.accountData?.balance ?? 0) + form.amount
  })

  watch(
    () => props.visible,
    (v) => {
      if (v) {
        selectedPreset.value = 1000
        customMode.value = false
        customAmountStr.value = '1000'
        form.amount = 1000
        form.method = 'platform'
        form.remark = ''
      }
    }
  )

  function getStatusClass(status?: string) {
    if (status === '正常') return 'status--normal'
    if (status === '余额不足') return 'status--warning'
    return 'status--disabled'
  }

  const handlePreset = (amount: number) => {
    selectedPreset.value = amount
    customMode.value = false
    customAmountStr.value = String(amount)
    form.amount = amount
  }

  const handleCustom = () => {
    customMode.value = true
    const parsed = parseInt(customAmountStr.value, 10)
    form.amount = Number.isNaN(parsed) ? 0 : parsed
  }

  const handleCustomInput = () => {
    const parsed = parseInt(customAmountStr.value, 10)
    form.amount = Number.isNaN(parsed) ? 0 : parsed
    customMode.value = true
  }

  const handleConfirm = async () => {
    loading.value = true
    await new Promise((resolve) => setTimeout(resolve, 500))
    loading.value = false
    emit('success', { ...form })
  }

  const handleClose = () => {
    emit('update:visible', false)
  }
</script>

<style lang="scss">
  .el-dialog:has(.acc-recharge-dialog-bd) {
    background: var(--cm-dialog-bg-inner) !important;
    border: 1px solid var(--cm-dialog-border);
    border-radius: 12px !important;
    box-shadow: var(--cm-dialog-shadow) !important;
  }

  .el-dialog:has(.acc-recharge-dialog-bd) .el-dialog__header.acc-recharge-dialog-hd {
    padding: 18px 24px 16px;
    margin: 0;
    background: var(--cm-dialog-bg-inner);
    border-bottom: 1px solid var(--cm-dialog-border);
    border-radius: 12px 12px 0 0;
  }

  .el-dialog:has(.acc-recharge-dialog-bd) .el-dialog__title {
    font-size: 16px !important;
    font-weight: 600 !important;
    color: var(--cm-dialog-text-primary) !important;
  }

  .el-dialog:has(.acc-recharge-dialog-bd) .el-dialog__headerbtn .el-icon {
    color: var(--cm-dialog-text-muted) !important;

    &:hover { color: var(--cm-dialog-text-primary) !important; }
  }

  .el-dialog:has(.acc-recharge-dialog-bd) .el-dialog__body.acc-recharge-dialog-bd {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
  }

  .el-dialog:has(.acc-recharge-dialog-bd) .el-dialog__footer.acc-recharge-dialog-ft {
    padding: 0 !important;
    background: var(--cm-dialog-bg-inner);
    border-top: 1px solid var(--cm-dialog-border);
    border-radius: 0 0 12px 12px;
  }
</style>

<style lang="scss" scoped>
  // ─── 账户头信息 ────────────────────────────────────────
  .account-info-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    background: rgb(255 255 255 / 2%);
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .account-info-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .account-info-name {
    font-size: 14px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .account-info-id {
    padding: 2px 8px;
    font-size: 12px;
    color: #64748b;
    background: rgb(255 255 255 / 5%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 4px;
  }

  .info-status {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;

    &.status--normal { color: #22c55e; }
    &.status--warning { color: #f59e0b; }
    &.status--disabled { color: #64748b; }
  }

  .info-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    .status--normal & { background: #22c55e; }
    .status--warning & { background: #f59e0b; }
    .status--disabled & { background: #64748b; }
  }

  // ─── 主体 ──────────────────────────────────────────────
  .recharge-body {
    padding: 20px;
  }

  // ─── 财务概览 ──────────────────────────────────────────
  .finance-overview {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 14px 16px;
    margin-bottom: 16px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 8px;
  }

  .finance-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .finance-key {
    font-size: 11px;
    color: #64748b;
  }

  .finance-val {
    font-size: 15px;
    font-weight: 700;
    color: #e2e8f0;

    &--balance {
      color: #3b82f6;
    }
  }

  // ─── 进度条 ────────────────────────────────────────────
  .progress-section {
    margin-bottom: 20px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .progress-label {
    font-size: 12px;
    color: #64748b;
  }

  .progress-pct {
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    overflow: hidden;
    background: rgb(255 255 255 / 8%);
    border-radius: 3px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  // ─── 表单块 ────────────────────────────────────────────
  .form-block {
    margin-bottom: 18px;
  }

  .form-label {
    margin-bottom: 10px;
    font-size: 12px;
    color: #94a3b8;
  }

  .required {
    margin-left: 2px;
    color: #ef4444;
  }

  // ─── 金额预设 ──────────────────────────────────────────
  .amount-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .preset-btn {
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #3b82f6;
      border-color: #3b82f6;
    }

    &--active {
      color: #fff;
      background: #3b82f6;
      border-color: #3b82f6;
    }
  }

  .custom-amount-wrap {
    display: flex;
    align-items: center;
  }

  .amount-prefix {
    padding: 0 6px;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
  }

  .custom-amount-input {
    width: 90px;
  }

  // ─── 充值方式 ──────────────────────────────────────────
  .method-radio-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .method-option {
    padding: 10px 14px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 7%);
    border-radius: 7px;
    transition: all 0.15s;

    &:has(.el-radio.is-checked) {
      background: rgb(59 130 246 / 5%);
      border-color: rgb(59 130 246 / 25%);
    }
  }

  .dark-radio {
    :deep(.el-radio__label) {
      font-size: 13px;
      color: #e2e8f0;
    }

    :deep(.el-radio__inner) {
      background: rgb(255 255 255 / 5%);
      border-color: rgb(255 255 255 / 20%);
    }

    :deep(.el-radio__input.is-checked .el-radio__inner) {
      background: #3b82f6;
      border-color: #3b82f6;
    }
  }

  .method-desc {
    font-size: 12px;
    color: #64748b;
  }

  // ─── 充值后余额 ────────────────────────────────────────
  .after-balance-row {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px;
    background: rgb(34 197 94 / 5%);
    border: 1px solid rgb(34 197 94 / 20%);
    border-radius: 8px;
  }

  .after-balance-label {
    font-size: 13px;
    color: #64748b;
  }

  .after-balance-val {
    font-size: 18px;
    font-weight: 700;
    color: #22c55e;
  }

  // ─── 底部 ──────────────────────────────────────────────
  .dialog-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 20px;
  }

  .btn-cancel {
    flex: 1;
    height: 40px !important;
    color: #94a3b8 !important;
    background: transparent !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 8px !important;

    &:hover {
      color: #e2e8f0 !important;
      border-color: rgb(255 255 255 / 20%) !important;
    }
  }

  .btn-confirm {
    flex: 1;
    height: 40px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: #3b82f6 !important;
    border: none !important;
    border-radius: 8px !important;

    &:hover { filter: brightness(1.1); }
  }

  // ─── 深色输入框 ────────────────────────────────────────
  .dark-input {
    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px !important;
      box-shadow: none !important;

      &:hover { border-color: rgb(59 130 246 / 40%) !important; }
      &.is-focus { border-color: #3b82f6 !important; }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: #e2e8f0 !important;

      &::placeholder { color: #475569 !important; }
    }
  }
</style>
