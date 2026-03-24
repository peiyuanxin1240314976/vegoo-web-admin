<template>
  <ElDialog
    :model-value="visible"
    title="同步汇率"
    width="450px"
    :close-on-click-modal="false"
    header-class="cm-er-sync-hd"
    body-class="cm-er-sync-bd"
    footer-class="cm-er-sync-ft"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="sync-section">
      <div class="section-label">数据源</div>
      <div class="source-tabs">
        <button
          v-for="s in SOURCE_OPTIONS"
          :key="s.value"
          :class="['source-tab', selectedSource === s.value && 'source-tab--active']"
          @click="selectedSource = s.value"
        >
          {{ s.label }}
        </button>
      </div>
      <div class="source-status">
        <span class="status-dot status-dot--ok" />
        <span class="status-text">当前状态：已连接</span>
      </div>
    </div>

    <div class="sync-section">
      <div class="section-label">同步范围</div>
      <div class="pairs-header">
        <ElCheckbox
          v-model="allSelected"
          :indeterminate="isIndeterminate"
          @change="handleSelectAll"
        >
          全选
        </ElCheckbox>
      </div>
      <ElCheckboxGroup v-model="selectedPairs" class="pairs-grid">
        <ElCheckbox v-for="pair in ALL_CURRENCY_PAIRS" :key="pair" :label="pair">
          {{ pair }}
        </ElCheckbox>
      </ElCheckboxGroup>
    </div>

    <div class="sync-section">
      <div class="section-label">同步时间</div>
      <span class="sync-time-text">立即同步</span>
    </div>

    <template #footer>
      <ElButton round @click="emit('update:visible', false)">取消</ElButton>
      <ElButton
        round
        type="primary"
        :disabled="selectedPairs.length === 0"
        @click="handleStartSync"
      >
        开始同步
      </ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ALL_CURRENCY_PAIRS } from '../mock/data'

  defineOptions({ name: 'RateSyncDialog' })

  interface Props {
    visible: boolean
  }

  defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    sync: [pairs: string[], source: string]
  }>()

  const SOURCE_OPTIONS = [
    { label: 'Open Exchange Rates', value: 'openexchange' },
    { label: 'Fixer.io', value: 'fixer' },
    { label: '自定义API', value: 'custom' }
  ]

  const selectedSource = ref('openexchange')
  const selectedPairs = ref<string[]>([...ALL_CURRENCY_PAIRS])

  const allSelected = computed(() => selectedPairs.value.length === ALL_CURRENCY_PAIRS.length)

  const isIndeterminate = computed(
    () => selectedPairs.value.length > 0 && selectedPairs.value.length < ALL_CURRENCY_PAIRS.length
  )

  const handleSelectAll = (val: string | number | boolean) => {
    selectedPairs.value = val === true ? [...ALL_CURRENCY_PAIRS] : []
  }

  const handleStartSync = () => {
    emit('sync', selectedPairs.value, selectedSource.value)
    emit('update:visible', false)
  }
</script>

<style lang="scss" scoped>
  .sync-section {
    margin-bottom: 18px;
  }

  .section-label {
    margin-bottom: 10px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .source-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
  }

  .source-tab {
    padding: 5px 14px;
    font-size: 13px;
    color: #94a3b8;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 6px;
    transition: all 0.15s;

    &--active {
      color: #2dd4bf;
      background: rgb(45 212 191 / 12%);
      border-color: #2dd4bf;
    }

    &:hover:not(.source-tab--active) {
      color: #e2e8f0;
      border-color: rgb(255 255 255 / 15%);
    }
  }

  .source-status {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .status-dot {
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &--ok {
      background: #22c55e;
      box-shadow: 0 0 6px rgb(34 197 94 / 50%);
    }
  }

  .status-text {
    font-size: 12px;
    color: #22c55e;
  }

  .pairs-header {
    margin-bottom: 8px;
  }

  .pairs-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px 12px;
  }

  .sync-time-text {
    font-size: 13px;
    color: #e2e8f0;
  }
</style>

<style lang="scss">
  :has(.cm-er-sync-bd) {
    --cm-dialog-bg: #111827;
    --cm-dialog-bg-inner: #1a2540;
    --cm-dialog-border: rgb(255 255 255 / 8%);

    .cm-er-sync-hd {
      padding: 18px 20px 14px;
      background: var(--cm-dialog-bg) !important;
      border-bottom: 1px solid var(--cm-dialog-border);

      .el-dialog__title {
        font-size: 15px;
        font-weight: 600;
        color: #e2e8f0;
      }

      .el-dialog__headerbtn .el-dialog__close {
        color: #64748b;

        &:hover {
          color: #e2e8f0;
        }
      }
    }

    .cm-er-sync-bd {
      padding: 20px;
      background: var(--cm-dialog-bg) !important;

      .el-checkbox__label {
        font-size: 13px;
        color: #e2e8f0;
      }

      .el-checkbox__inner {
        background: var(--cm-dialog-bg-inner);
        border-color: var(--cm-dialog-border);
      }

      .el-checkbox.is-checked .el-checkbox__inner {
        background: #2dd4bf;
        border-color: #2dd4bf;
      }
    }

    .cm-er-sync-ft {
      padding: 12px 20px 18px;
      background: var(--cm-dialog-bg) !important;
      border-top: 1px solid var(--cm-dialog-border);
    }
  }
</style>
