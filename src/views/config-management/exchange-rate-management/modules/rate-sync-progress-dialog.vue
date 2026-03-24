<template>
  <ElDialog
    :model-value="visible"
    title="同步汇率中..."
    width="420px"
    :close-on-click-modal="false"
    :show-close="false"
    header-class="cm-er-prog-hd"
    body-class="cm-er-prog-bd"
    footer-class="cm-er-prog-ft"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="prog-body">
      <div class="prog-spinner">
        <div class="spinner-ring" />
      </div>
      <div class="prog-info">
        <div class="prog-label">
          正在同步 <span class="prog-count">{{ current }}/{{ total }}</span> 货币对...
        </div>
        <div class="prog-current">来源：{{ currentPair }}</div>
        <ElProgress
          :percentage="Math.round((current / total) * 100)"
          :show-text="false"
          :stroke-width="4"
          color="#2dd4bf"
          class="prog-bar"
        />
      </div>
    </div>

    <div class="pairs-preview">
      <div class="preview-col">
        <div
          v-for="(p, i) in leftPairs"
          :key="p"
          :class="['preview-pair', i < current / 2 && 'preview-pair--done']"
        >
          {{ p }}
        </div>
      </div>
      <div class="preview-col">
        <div
          v-for="(p, i) in rightPairs"
          :key="p"
          :class="['preview-pair', 'preview-pair--active', i === 0 && 'preview-pair--current']"
        >
          {{ p }}
        </div>
      </div>
    </div>

    <template #footer>
      <ElButton round @click="emit('cancel')">取消同步</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  defineOptions({ name: 'RateSyncProgressDialog' })

  interface Props {
    visible: boolean
    current: number
    total: number
    currentPair: string
    pairs: string[]
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    cancel: []
  }>()

  const half = computed(() => Math.ceil(props.pairs.length / 2))
  const leftPairs = computed(() => props.pairs.slice(0, half.value))
  const rightPairs = computed(() => props.pairs.slice(half.value))
</script>

<style lang="scss" scoped>
  .prog-body {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .prog-spinner {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
  }

  .spinner-ring {
    width: 48px;
    height: 48px;
    border: 4px solid rgb(45 212 191 / 20%);
    border-top-color: #2dd4bf;
    border-radius: 50%;
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .prog-info {
    flex: 1;
  }

  .prog-label {
    margin-bottom: 4px;
    font-size: 14px;
    color: #e2e8f0;
  }

  .prog-count {
    font-weight: 700;
    color: #2dd4bf;
  }

  .prog-current {
    margin-bottom: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .prog-bar {
    :deep(.el-progress-bar__outer) {
      background: rgb(255 255 255 / 8%);
    }
  }

  .pairs-preview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 16px;
    padding: 12px;
    background: rgb(255 255 255 / 3%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 8px;
  }

  .preview-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .preview-pair {
    padding: 3px 8px;
    font-size: 12px;
    color: #64748b;
    border-radius: 4px;

    &--done {
      color: #22c55e;
    }

    &--active {
      color: #94a3b8;
    }

    &--current {
      font-weight: 600;
      color: #2dd4bf;
      background: rgb(45 212 191 / 10%);
    }
  }
</style>

<style lang="scss">
  :has(.cm-er-prog-bd) {
    --cm-dialog-bg: #111827;
    --cm-dialog-border: rgb(255 255 255 / 8%);

    .cm-er-prog-hd {
      padding: 18px 20px 14px;
      background: var(--cm-dialog-bg) !important;
      border-bottom: 1px solid var(--cm-dialog-border);

      .el-dialog__title {
        font-size: 15px;
        font-weight: 600;
        color: #e2e8f0;
      }
    }

    .cm-er-prog-bd {
      padding: 20px;
      background: var(--cm-dialog-bg) !important;
    }

    .cm-er-prog-ft {
      padding: 12px 20px 18px;
      background: var(--cm-dialog-bg) !important;
      border-top: 1px solid var(--cm-dialog-border);
    }
  }
</style>
