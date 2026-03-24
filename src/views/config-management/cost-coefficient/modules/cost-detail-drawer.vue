<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <Transition name="drawer-fade">
      <div v-if="visible" class="cc-drawer-mask" @click="emit('update:visible', false)" />
    </Transition>

    <!-- 抽屉 -->
    <Transition name="drawer-slide">
      <div v-if="visible" class="cc-drawer">
        <!-- 头部 -->
        <div class="drawer-header">
          <div class="drawer-title">
            <span class="title-nsource">n_source: {{ item?.nSource }}</span>
            <span class="title-sep">·</span>
            <span class="title-platform">{{ item?.platformName }}</span>
          </div>
          <button class="drawer-close" @click="emit('update:visible', false)">✕</button>
        </div>

        <!-- 内容 -->
        <div class="drawer-body">
          <!-- 基本信息 -->
          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <div class="info-grid">
              <div class="info-item info-item--full">
                <div class="info-label">广告平台</div>
                <div class="info-value">
                  <span
                    class="platform-icon"
                    :style="{ background: item ? getPlatform(item.nSource).color : '#475569' }"
                  >{{ item ? getPlatform(item.nSource).abbr : '' }}</span>
                  {{ item?.platformName }} (n_source={{ item?.nSource }})
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">生效起始日期</div>
                <div class="info-value">{{ item?.tStart }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">状态</div>
                <div class="info-value">
                  <span :class="['status-badge', isActive ? 'status--active' : 'status--pending']">
                    <span class="status-dot" />{{ isActive ? '生效中' : '待生效' }}
                  </span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">折算比例 (d_cost_ratio)</div>
                <div class="info-value info-value--mono">{{ item?.dCostRatio.toFixed(3) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">安装成本 (d_install_cost)</div>
                <div class="info-value info-value--mono">{{ item?.dInstallCost.toFixed(5) }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">创建时间</div>
                <div class="info-value">{{ item?.updatedAt }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">最后修改</div>
                <div class="info-value">{{ item?.updatedAt }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">操作人</div>
                <div class="info-value">{{ item?.updatedBy }}</div>
              </div>
              <div class="info-item info-item--full">
                <div class="info-label">备注</div>
                <div class="info-value">{{ item?.remark || '—' }}</div>
              </div>
            </div>
          </div>

          <!-- 调整历史 -->
          <div class="detail-section">
            <div class="section-title">
              <span class="section-icon">🕐</span>调整历史
            </div>
            <div class="history-list">
              <div v-for="(h, i) in history" :key="i" class="history-item">
                <div class="history-dot" />
                <div class="history-body">
                  <div class="history-time">[{{ h.time }}]</div>
                  <div class="history-operator">{{ h.operator }}</div>
                  <div v-for="c in h.changes" :key="c" class="history-change">{{ c }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="drawer-footer">
          <ElButton round class="btn-edit" @click="emit('edit', item!)">编辑</ElButton>
          <ElButton round class="btn-del" @click="emit('delete', item!)">删除</ElButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { getAppNow } from '@/utils/app-now'
  import { getPlatform } from '../mock/data'
  import type { CostCoefficientItem, CostCoefficientHistory } from '../types'

  defineOptions({ name: 'CostDetailDrawer' })

  interface Props {
    visible: boolean
    item?: CostCoefficientItem | null
    history?: CostCoefficientHistory[]
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [item: CostCoefficientItem]
    delete: [item: CostCoefficientItem]
  }>()

  const isActive = computed(() => {
    if (!props.item) return false
    return props.item.tStart <= getAppNow().toISOString().slice(0, 10)
  })
</script>

<style lang="scss" scoped>
  // ─── 遮罩 ───────────────────────────────────────────────
  .cc-drawer-mask {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgb(0 0 0 / 45%);
  }

  // ─── 抽屉 ───────────────────────────────────────────────
  .cc-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 2001;
    display: flex;
    flex-direction: column;
    width: 400px;
    background: #111827;
    border-left: 1px solid rgb(255 255 255 / 8%);
    box-shadow: -8px 0 32px rgb(0 0 0 / 40%);
  }

  // ─── 头部 ───────────────────────────────────────────────
  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 8%);
    flex-shrink: 0;
  }

  .drawer-title {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
  }

  .title-nsource { color: #94a3b8; }
  .title-sep     { color: #475569; }
  .title-platform { color: #e2e8f0; }

  .drawer-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 14px;
    cursor: pointer;
    color: #64748b;
    background: none;
    border: none;
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      background: rgb(255 255 255 / 6%);
    }
  }

  // ─── 内容 ───────────────────────────────────────────────
  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;

    &::-webkit-scrollbar { width: 4px; }
    &::-webkit-scrollbar-track { background: transparent; }
    &::-webkit-scrollbar-thumb { background: rgb(255 255 255 / 10%); border-radius: 2px; }
  }

  .detail-section {
    margin-bottom: 24px;
  }

  .section-title {
    display: flex;
    gap: 5px;
    align-items: center;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
    color: #e2e8f0;
  }

  .section-icon { font-size: 14px; }

  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 12px;
  }

  .info-item {
    &--full { grid-column: 1 / -1; }
  }

  .info-label {
    margin-bottom: 4px;
    font-size: 11px;
    color: #64748b;
  }

  .info-value {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 13px;
    color: #e2e8f0;
    word-break: break-all;

    &--mono {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: 600;
      color: #2dd4bf;
    }
  }

  .platform-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 10px;
    font-weight: 700;
    color: #fff;
    border-radius: 5px;
  }

  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &.status--active  { color: #22c55e; background: rgb(34 197 94 / 12%); }
    &.status--pending { color: #f59e0b; background: rgb(245 158 11 / 12%); }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentcolor;
    flex-shrink: 0;
  }

  // ─── 调整历史 ────────────────────────────────────────────
  .history-list {
    padding-left: 8px;
    border-left: 2px solid rgb(255 255 255 / 8%);
  }

  .history-item {
    position: relative;
    padding: 0 0 16px 16px;

    &:last-child { padding-bottom: 0; }
  }

  .history-dot {
    position: absolute;
    top: 4px;
    left: -5px;
    width: 8px;
    height: 8px;
    background: #2dd4bf;
    border-radius: 50%;
    border: 2px solid #111827;
  }

  .history-body { display: flex; flex-direction: column; gap: 2px; }

  .history-time     { font-size: 12px; color: #64748b; }
  .history-operator { font-size: 13px; font-weight: 600; color: #94a3b8; }
  .history-change   { font-size: 12px; color: #64748b; line-height: 1.6; }

  // ─── 底部 ───────────────────────────────────────────────
  .drawer-footer {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 20px;
    border-top: 1px solid rgb(255 255 255 / 8%);
    flex-shrink: 0;
  }

  .btn-edit {
    padding: 8px 24px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: #2dd4bf !important;
    border: none !important;

    &:hover { filter: brightness(1.1); }
  }

  .btn-del {
    padding: 8px 24px !important;
    font-weight: 600 !important;
    color: #ef4444 !important;
    background: transparent !important;
    border: 1px solid #ef4444 !important;

    &:hover {
      color: #fff !important;
      background: #ef4444 !important;
    }
  }

  // ─── 过渡动画 ────────────────────────────────────────────
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    transform: translateX(100%);
  }

  .drawer-fade-enter-active,
  .drawer-fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .drawer-fade-enter-from,
  .drawer-fade-leave-to {
    opacity: 0;
  }
</style>
