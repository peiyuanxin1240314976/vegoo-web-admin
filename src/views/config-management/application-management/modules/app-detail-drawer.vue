<template>
  <!-- 遮罩层 -->
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <!-- 抽屉主体 -->
  <transition name="drawer-slide">
    <div v-if="visible" class="app-detail-drawer">
      <!-- ── 头部 ─────────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-left">
          <div
            class="app-icon"
            :style="{ background: appData?.iconColor || 'var(--el-color-primary)' }"
          >
            {{ appData?.appName?.charAt(0) || 'A' }}
          </div>
          <div class="header-info">
            <div class="header-name-row">
              <span class="app-name">{{ appData?.appName }}</span>
              <span
                :class="[
                  'platform-badge',
                  appData?.platform === 'Android'
                    ? 'platform-badge--android'
                    : 'platform-badge--ios'
                ]"
              >
                <span class="platform-dot" />
                {{ appData?.platform }}
              </span>
            </div>
            <div class="header-meta">
              <span class="id-chip">{{ appData?.id }}</span>
              <span class="meta-text">类别：{{ appData?.category }}</span>
              <span
                :class="[
                  'status-badge',
                  appData?.status === '正常' ? 'status-badge--normal' : 'status-badge--disabled'
                ]"
                >{{ appData?.status }}</span
              >
            </div>
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

      <!-- ── 正文滚动区 ──────────────────────────── -->
      <div class="drawer-body">
        <!-- 基础信息 -->
        <section class="detail-section">
          <div class="section-title">基础信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">应用名</span>
              <span class="info-val">{{ appData?.appName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">应用简称</span>
              <span class="info-val">{{ appData?.shortName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">ID</span>
              <span class="info-val">{{ appData?.id }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">类别</span>
              <span class="info-val">{{ appData?.category }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">平台</span>
              <span
                :class="[
                  'platform-badge',
                  appData?.platform === 'Android'
                    ? 'platform-badge--android'
                    : 'platform-badge--ios'
                ]"
              >
                <span class="platform-dot" />{{ appData?.platform }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-key">状态</span>
              <span
                :class="[
                  'status-badge',
                  appData?.status === '正常' ? 'status-badge--normal' : 'status-badge--disabled'
                ]"
                >{{ appData?.status }}</span
              >
            </div>
          </div>
        </section>

        <!-- 技术标识 -->
        <section class="detail-section">
          <div class="section-title">技术标识</div>
          <div class="tech-list">
            <div class="tech-item">
              <span class="tech-key">app ID</span>
              <div class="tech-val-row">
                <span class="tech-val tech-val--mono">{{ appData?.appId }}</span>
                <button class="icon-btn" @click="copyText(appData?.appId)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-key">软件包ID</span>
              <div class="tech-val-row">
                <span class="tech-val tech-val--mono">{{ appData?.packageId }}</span>
                <button class="icon-btn" @click="copyText(appData?.packageId)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-key">应用商店ID</span>
              <div class="tech-val-row">
                <span class="tech-val tech-val--mono">
                  {{ appData?.storeId || appData?.bundleId }}
                </span>
                <button class="icon-btn icon-btn--link">
                  <el-icon><Link /></el-icon>
                </button>
              </div>
            </div>
            <div class="tech-item">
              <span class="tech-key">地址</span>
              <div class="tech-val-row">
                <span class="tech-val tech-val--link">
                  {{ appData?.url || `https://${appData?.bundleId}` }}
                </span>
                <button class="icon-btn icon-btn--link">
                  <el-icon><Link /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 报表配置 -->
        <section class="detail-section">
          <div class="section-title">报表配置</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">报表时区</span>
              <span class="info-val">{{ appData?.timezone || 'PST' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">优先级</span>
              <span class="info-val">{{ appData?.priority }}</span>
            </div>
          </div>
          <div class="toggle-display-grid">
            <div class="toggle-display-item">
              <span class="toggle-display-key">数据独立</span>
              <span
                :class="['bool-chip', appData?.dataIsolation ? 'bool-chip--yes' : 'bool-chip--no']"
              >
                {{ appData?.dataIsolation ? '是' : '否' }}
              </span>
            </div>
            <div class="toggle-display-item">
              <span class="toggle-display-key">启用工具</span>
              <span
                :class="['bool-chip', appData?.toolEnabled ? 'bool-chip--yes' : 'bool-chip--no']"
              >
                {{ appData?.toolEnabled ? '是' : '否' }}
              </span>
            </div>
            <div class="toggle-display-item">
              <span class="toggle-display-key">预生成报表文件</span>
              <span
                :class="['bool-chip', appData?.preGenReport ? 'bool-chip--yes' : 'bool-chip--no']"
              >
                {{ appData?.preGenReport ? '是' : '否' }}
              </span>
            </div>
            <div class="toggle-display-item">
              <span class="toggle-display-key">使用订单明细</span>
              <span
                :class="['bool-chip', appData?.useOrderDetail ? 'bool-chip--yes' : 'bool-chip--no']"
              >
                {{ appData?.useOrderDetail ? '是' : '否' }}
              </span>
            </div>
            <div class="toggle-display-item">
              <span class="toggle-display-key">报表展示订单</span>
              <span
                :class="[
                  'bool-chip',
                  appData?.showOrderReport ? 'bool-chip--yes' : 'bool-chip--no'
                ]"
              >
                {{ appData?.showOrderReport ? '是' : '否' }}
              </span>
            </div>
          </div>
        </section>

        <!-- 操作记录 -->
        <section class="detail-section detail-section--last">
          <div class="section-title">操作记录</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">创建人</span>
              <span class="info-val">{{ appData?.creator }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">创建时间</span>
              <span class="info-val">{{ appData?.createTime || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">最后修改人</span>
              <span class="info-val">{{ appData?.lastModifier || '—' }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">最后修改时间</span>
              <span class="info-val">{{ appData?.lastModifyTime || '—' }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- ── 底部操作栏 ───────────────────────────── -->
      <div class="drawer-footer">
        <ElButton round class="footer-btn footer-btn--delete" @click="handleDelete">
          删除应用
        </ElButton>
        <ElButton round class="footer-btn footer-btn--edit" @click="handleEdit">
          编辑应用
        </ElButton>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { EditPen, CopyDocument, Link } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { ApplicationAppItem } from '../types'

  defineOptions({ name: 'AppDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    appData: ApplicationAppItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [data: ApplicationAppItem]
    delete: [data: ApplicationAppItem]
  }>()

  // ─── 事件 ──────────────────────────────────────────────
  const handleClose = () => emit('update:visible', false)

  const handleEdit = () => {
    if (props.appData) emit('edit', props.appData)
  }

  const handleDelete = () => {
    if (props.appData) emit('delete', props.appData)
  }

  const copyText = (text?: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    ElMessage({ message: '已复制到剪贴板', type: 'success', duration: 1500 })
  }
</script>

<style lang="scss" scoped>
  .app-detail-drawer,
  .drawer-overlay {
    --dp-border: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --dp-border-soft: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
    --bg-drawer: color-mix(in srgb, var(--default-box-color) 97%, transparent);
    --bg-header: color-mix(in srgb, var(--default-box-color) 94%, transparent);
    --border: var(--dp-border-soft);
    --border-accent: color-mix(in srgb, var(--el-color-primary) 35%, transparent);
    --text-primary: var(--text-primary);
    --text-secondary: var(--text-secondary);
    --text-muted: var(--text-tertiary);
    --accent: var(--el-color-primary);
    --accent-dim: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
    --android-green: var(--art-success);
    --android-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --ios-blue: color-mix(in srgb, #60a5fa 65%, var(--el-color-primary) 35%);
    --ios-bg: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --status-green: var(--art-success);
    --status-bg: color-mix(in srgb, var(--art-success) 14%, transparent);
    --red: var(--art-danger);
    --red-dim: color-mix(in srgb, var(--art-danger) 12%, transparent);
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
  .app-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    width: 468px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background:
      linear-gradient(
        175deg,
        color-mix(in srgb, var(--default-box-color) 98%, transparent) 0%,
        color-mix(in srgb, var(--default-bg-color) 45%, transparent) 100%
      ),
      linear-gradient(
        120deg,
        color-mix(in srgb, var(--el-color-primary) 5%, transparent),
        color-mix(in srgb, var(--theme-color) 4%, transparent)
      );
    border-left: 1px solid var(--dp-border);
    box-shadow:
      -12px 0 48px rgb(0 0 0 / 22%),
      inset 1px 0 0 color-mix(in srgb, white 6%, transparent);
  }

  // ─── 头部 ──────────────────────────────────────────────
  .drawer-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: 20px 20px 16px;
    background: var(--bg-header);
    border-bottom: 1px solid var(--dp-border-soft);
  }

  .header-left {
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: flex-start;
    min-width: 0;
  }

  .app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    border-radius: 11px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 30%);
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  .header-name-row {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 7px;
  }

  .app-name {
    font-size: 17px;
    font-weight: 700;
    line-height: 1;
    color: var(--text-primary);
  }

  .header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
  }

  .id-chip {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid var(--border-accent);
    border-radius: 5px;
  }

  .meta-text {
    font-size: 12px;
    color: var(--text-muted);
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
    color: var(--el-color-primary) !important;
    background: var(--accent-dim) !important;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 32%, transparent) !important;
    border-radius: 8px !important;
    transition:
      background-color var(--duration-fast) var(--ease-out),
      transform var(--duration-fast) var(--ease-out);

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 20%, transparent) !important;
      transform: translateY(-1px);
    }

    .el-icon {
      font-size: 13px;
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
    background: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    border: 1px solid var(--dp-border-soft);
    border-radius: 8px;
    transition:
      color var(--duration-fast) var(--ease-out),
      background-color var(--duration-fast) var(--ease-out),
      border-color var(--duration-fast) var(--ease-out);

    &:hover {
      color: var(--text-primary);
      background: color-mix(in srgb, var(--default-box-color) 72%, transparent);
      border-color: color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    }
  }

  // ─── 滚动主体 ──────────────────────────────────────────
  .drawer-body {
    flex: 1;
    padding: 4px 0 0;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--default-box-color) 55%, transparent);
      border-radius: 2px;
    }
  }

  // ─── Section ───────────────────────────────────────────
  .detail-section {
    padding: 16px 20px;
    border-bottom: 1px solid var(--dp-border-soft);

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
    color: var(--el-color-primary);
    border-left: 3px solid var(--el-color-primary);
  }

  // ─── 二列信息网格 ──────────────────────────────────────
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 8px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .info-key {
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .info-val {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  // ─── 平台 Badge ────────────────────────────────────────
  .platform-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 9px;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
    border-radius: 5px;

    &--android {
      color: var(--android-green);
      background: var(--android-bg);
    }

    &--ios {
      color: var(--ios-blue);
      background: var(--ios-bg);
    }
  }

  .platform-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .platform-badge--android & {
      background: var(--android-green);
    }

    .platform-badge--ios & {
      background: var(--ios-blue);
    }
  }

  // ─── 状态 Badge ────────────────────────────────────────
  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 9px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;

    &--normal {
      color: var(--status-green);
      background: var(--status-bg);
    }

    &--disabled {
      color: var(--red);
      background: var(--red-dim);
    }
  }

  // ─── 技术标识列表 ──────────────────────────────────────
  .tech-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .tech-item {
    display: flex;
    gap: 0;
    align-items: flex-start;
  }

  .tech-key {
    flex-shrink: 0;
    width: 90px;
    padding-top: 1px;
    font-size: 12px;
    color: var(--text-muted);
  }

  .tech-val-row {
    display: flex;
    flex: 1;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  .tech-val {
    flex: 1;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-secondary);
    word-break: break-all;

    &--mono {
      font-family: SFMono-Regular, Consolas, monospace;
      font-size: 12px;
    }

    &--link {
      font-family: SFMono-Regular, Consolas, monospace;
      font-size: 12px;
      color: var(--el-color-primary);
      word-break: break-all;
    }
  }

  .icon-btn {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    padding: 3px;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
    background: none;
    border: none;
    border-radius: 4px;
    transition: all 0.15s;

    &:hover {
      color: var(--el-color-primary);
      background: var(--accent-dim);
    }

    &--link {
      color: var(--el-color-primary);
      opacity: 0.75;

      &:hover {
        background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
        opacity: 1;
      }
    }
  }

  // ─── 报表布尔值展示 ────────────────────────────────────
  .toggle-display-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 12px;
  }

  .toggle-display-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    background: color-mix(in srgb, var(--default-box-color) 90%, transparent);
    border: 1px solid var(--dp-border-soft);
    border-radius: 8px;
  }

  .toggle-display-key {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .bool-chip {
    padding: 2px 9px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;

    &--yes {
      color: var(--status-green);
      background: var(--status-bg);
    }

    &--no {
      color: var(--text-muted);
      background: color-mix(in srgb, var(--text-tertiary) 10%, transparent);
    }
  }

  // ─── 底部操作栏 ────────────────────────────────────────
  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    padding: 16px 20px;
    background: var(--bg-header);
    border-top: 1px solid var(--dp-border-soft);
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
      color: var(--el-color-white) !important;
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 92%, black 8%),
        color-mix(in srgb, var(--el-color-primary) 78%, black 22%)
      ) !important;
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 38%, transparent) !important;
      box-shadow: 0 6px 16px color-mix(in srgb, var(--el-color-primary) 26%, transparent) !important;

      &:hover {
        filter: brightness(1.05);
        transform: translateY(-1px);
      }
    }
  }

  // ─── 动画 ──────────────────────────────────────────────
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer-slide-enter-active,
    .drawer-slide-leave-active {
      transition-duration: 0.01ms;
    }

    .edit-btn:hover,
    .footer-btn--delete:hover,
    .footer-btn--edit:hover {
      transform: none;
    }
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
