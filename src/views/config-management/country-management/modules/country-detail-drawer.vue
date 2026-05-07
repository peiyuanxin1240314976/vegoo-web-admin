<template>
  <!-- 遮罩 -->
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <!-- 抽屉主体 -->
  <transition name="drawer-slide">
    <div v-if="visible" class="country-detail-drawer">
      <!-- ── 头部 ─────────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-left">
          <div class="flag-box">
            <img v-if="data?.flagIconUrl" :src="data.flagIconUrl" alt="" class="flag-img" />
            <span v-else class="flag-fallback">{{ flagFallbackText }}</span>
          </div>
          <div class="header-info">
            <div class="name-row">
              <span class="country-name">{{ data?.nameCn }}</span>
              <span class="code-chip">{{ data?.code }}</span>
            </div>
            <div class="name-en">{{ data?.nameEn }}</div>
            <div v-if="data?.isMainMarket" class="main-market-badge">是 主要市场</div>
          </div>
        </div>
        <div class="header-right">
          <ElButton round class="edit-btn" size="small" @click="handleEdit">
            <ElIcon><EditPen /></ElIcon>编辑
          </ElButton>
          <button class="close-btn" @click="handleClose">
            <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
              <path
                d="M2 2l12 12M14 2L2 14"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- ── 正文 ──────────────────────────────────── -->
      <div class="drawer-body">
        <!-- 基本信息 -->
        <section class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">国家代码</span>
              <span class="info-val">{{ data?.code }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">三位数代码</span>
              <span class="info-val">{{ data?.code3 }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">Criteria ID</span>
              <span class="info-val">{{ data?.criteriaId || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">时区</span>
              <span class="info-val">{{ data?.timezone }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">电话代码</span>
              <span class="info-val">+{{ data?.phoneCode }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">地区</span>
              <span class="info-val">{{ data?.region || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">货币</span>
              <span class="info-val">{{ data?.currency || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">货币符号</span>
              <span class="info-val">{{ data?.currencySymbol || '—' }}</span>
            </div>
          </div>
        </section>

        <!-- 国家名称 -->
        <section class="detail-section">
          <div class="section-title">国家名称</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">中文名称</span>
              <span class="info-val">{{ data?.nameCn }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">国家名称</span>
              <span class="info-val">{{ data?.nameEn }}</span>
            </div>
          </div>
          <div v-if="data?.aliases?.length" class="aliases-row">
            <span class="info-key" style="margin-bottom: 8px">别名列表</span>
            <div class="aliases-chips">
              <span v-for="alias in data.aliases" :key="alias" class="alias-chip">{{ alias }}</span>
            </div>
          </div>
        </section>

        <!-- 操作记录 -->
        <section class="detail-section detail-section--last">
          <div class="section-title">操作记录</div>
          <div class="info-grid info-grid--op">
            <div class="info-item">
              <span class="info-key">
                <el-icon class="op-icon"><User /></el-icon>创建人
              </span>
              <span class="info-val">{{ data?.createdBy || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">
                <el-icon class="op-icon"><Calendar /></el-icon>创建时间
              </span>
              <span class="info-val">{{ data?.createdTime || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">
                <el-icon class="op-icon"><User /></el-icon>最近修改人
              </span>
              <span class="info-val">{{ data?.updatedBy || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">
                <el-icon class="op-icon"><Timer /></el-icon>修改时间
              </span>
              <span class="info-val">{{ data?.updatedTime || '—' }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- ── 底部操作栏 ──────────────────────────── -->
      <div class="drawer-footer">
        <ElButton round class="footer-btn footer-btn--delete" @click="handleDelete">
          <el-icon><Delete /></el-icon>删除该国家
        </ElButton>
        <ElButton round class="footer-btn footer-btn--edit" @click="handleEdit">
          <el-icon><EditPen /></el-icon>编辑信息
        </ElButton>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { EditPen, Delete, User, Calendar, Timer } from '@element-plus/icons-vue'
  import type { CountryItem } from '../types'

  defineOptions({ name: 'CountryDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    data: CountryItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [data: CountryItem]
    delete: [data: CountryItem]
  }>()

  const flagFallbackText = computed(() => {
    const code = props.data?.code?.toUpperCase() ?? '?'
    return code.length >= 2 ? code.slice(0, 2) : code
  })

  const handleClose = () => emit('update:visible', false)
  const handleEdit = () => props.data && emit('edit', props.data)
  const handleDelete = () => props.data && emit('delete', props.data)
</script>

<style lang="scss" scoped>
  // ─── CSS 变量 ───────────────────────────────────────────
  .country-detail-drawer,
  .drawer-overlay {
    --bg-drawer: #0f1829;
    --bg-header: #131c2e;
    --border: rgb(255 255 255 / 7%);
    --border-accent: rgb(45 212 191 / 30%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 10%);
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 10%);
    --green: #22c55e;
    --green-dim: rgb(34 197 94 / 12%);
  }

  // ─── 遮罩 ──────────────────────────────────────────────
  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 998;
    background: rgb(0 0 0 / 45%);
    backdrop-filter: blur(1px);
  }

  // ─── 抽屉容器 ──────────────────────────────────────────
  .country-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    width: 460px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-drawer);
    border-left: 1px solid var(--border);
    box-shadow: -12px 0 48px rgb(0 0 0 / 50%);
  }

  // ─── 头部 ──────────────────────────────────────────────
  .drawer-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 20px 16px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--border);
  }

  .header-left {
    display: flex;
    flex: 1;
    gap: 14px;
    align-items: flex-start;
    min-width: 0;
  }

  .flag-box {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 42px;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .flag-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .flag-fallback {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  .name-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 4px;
  }

  .country-name {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .code-chip {
    padding: 2px 9px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid var(--border-accent);
    border-radius: 6px;
  }

  .name-en {
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .main-market-badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--green);
    background: var(--green-dim);
    border-radius: 4px;
  }

  .header-right {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    margin-left: 12px;
  }

  .edit-btn {
    display: flex;
    gap: 4px;
    align-items: center;
    height: 30px !important;
    padding: 5px 12px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    color: var(--accent) !important;
    background: var(--accent-dim) !important;
    border: 1px solid var(--border-accent) !important;
    border-radius: 7px !important;
    transition: all 0.15s;

    &:hover {
      background: rgb(45 212 191 / 18%) !important;
    }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: var(--text-muted);
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--border);
    border-radius: 7px;
    transition: all 0.15s;

    &:hover {
      color: var(--text-primary);
      background: rgb(255 255 255 / 8%);
    }
  }

  // ─── 滚动主体 ──────────────────────────────────────────
  .drawer-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
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
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);

    &--last {
      border-bottom: none;
    }
  }

  .section-title {
    padding-left: 9px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  // ─── 信息网格 ──────────────────────────────────────────
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 8px;

    &--op {
      gap: 12px 8px;
    }
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .info-key {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .op-icon {
    font-size: 12px;
  }

  .info-val {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  // ─── 别名 ──────────────────────────────────────────────
  .aliases-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 14px;
  }

  .aliases-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }

  .alias-chip {
    padding: 3px 12px;
    font-size: 12px;
    color: var(--text-secondary);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  // ─── 底部操作栏 ────────────────────────────────────────
  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-header);
    border-top: 1px solid var(--border);
  }

  .footer-btn {
    flex: 1;
    height: 40px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    border-radius: 9px !important;
    transition: all 0.15s !important;

    &--delete {
      color: var(--red) !important;
      background: transparent !important;
      border: 1px solid var(--red) !important;

      &:hover {
        background: var(--red-dim) !important;
        transform: translateY(-1px);
      }
    }

    &--edit {
      font-weight: 600 !important;
      color: #0b1120 !important;
      background: var(--accent) !important;
      border: none !important;

      &:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }
    }
  }

  // ─── 动画 ──────────────────────────────────────────────
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    transform: translateX(100%);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.25s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
