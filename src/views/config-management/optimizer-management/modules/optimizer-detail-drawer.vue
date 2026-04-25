<template>
  <el-drawer
    :model-value="visible"
    direction="rtl"
    :size="400"
    :with-header="false"
    :modal="true"
    :append-to-body="true"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    :lock-scroll="true"
    class="optimizer-detail-el-drawer"
    @close="handleClose"
  >
    <div class="detail-drawer">
      <!-- ── 头部 ──────────────────────────────────────────────── -->
      <div class="drawer-header">
        <span class="drawer-title">优化师详情</span>
        <div class="drawer-header-actions">
          <button class="header-edit-btn" @click="$emit('edit', data!)">
            <el-icon><EditPen /></el-icon>编辑
          </button>
          <button class="close-btn" @click="handleClose">
            <el-icon><Close /></el-icon>
          </button>
        </div>
      </div>

      <!-- ── 主信息 ─────────────────────────────────────────────── -->
      <div class="drawer-body" v-if="data">
        <!-- 头像 + 名字 + 状态 -->
        <div class="profile-row">
          <div class="profile-avatar" :style="{ background: data.avatarColor }">
            {{ data.userName.charAt(0) }}
          </div>
          <div class="profile-info">
            <span class="profile-name">{{ data.userName }}</span>
            <span
              :class="[
                'profile-status',
                data.status === '在职' ? 'status--active' : 'status--inactive'
              ]"
            >
              {{ data.status }}
            </span>
          </div>
        </div>

        <div class="section-divider" />

        <!-- 基本信息 -->
        <div class="section-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">序号</div>
            <div class="info-value">{{ data.no }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">名称</div>
            <div class="info-value">{{ data.userName }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">版本号</div>
            <div class="info-value">
              <span class="version-badge">v{{ data.version }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">状态</div>
            <div class="info-value">
              <span
                :class="[
                  'inline-status',
                  data.status === '在职' ? 'status--active' : 'status--inactive'
                ]"
              >
                {{ data.status }}
              </span>
            </div>
          </div>
          <div class="info-item">
            <div class="info-label">代号（s_code）</div>
            <div class="info-value scode">{{ data.sCode }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">代号2（s_code2）</div>
            <div class="info-value scode2">{{ data.sCode2 || '–' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">最低消耗要求</div>
            <div class="info-value consume">${{ data.minConsumption.toFixed(2) }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">检验码</div>
            <div class="info-value checkcode-row">
              <span class="checkcode-val">{{ truncateCode(data.checkCode) }}</span>
              <el-icon class="copy-icon" @click="handleCopy(data.checkCode)"
                ><CopyDocument
              /></el-icon>
            </div>
          </div>
        </div>

        <div class="section-divider" />

        <!-- 负责应用 -->
        <div class="section-title">负责应用</div>
        <div class="apps-row" v-if="data.apps && data.apps.length">
          <span v-for="app in data.apps" :key="app" class="app-tag">
            <span class="app-tag-icon">{{ app.charAt(0) }}</span>
            {{ app }}
          </span>
        </div>
        <div v-else class="empty-hint">暂无负责应用</div>

        <div class="section-divider" />

        <!-- 最近操作记录 -->
        <div class="section-title">最近操作记录</div>
        <div class="timeline" v-if="data.recentLogs && data.recentLogs.length">
          <div v-for="(log, idx) in data.recentLogs" :key="log.id" class="timeline-item">
            <div :class="['timeline-dot', idx === 0 ? 'dot--active' : 'dot--normal']" />
            <div class="timeline-content">
              <span class="timeline-time">{{ log.timeLabel }}</span>
              <span class="timeline-text">{{ log.content }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-hint">暂无操作记录</div>
      </div>

      <!-- ── 底部操作 ──────────────────────────────────────────── -->
      <div class="drawer-footer" v-if="data">
        <button class="footer-btn btn-close" @click="handleClose">关闭</button>
        <button class="footer-btn btn-edit" @click="$emit('edit', data!)">编辑</button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
  import { EditPen, Close, CopyDocument } from '@element-plus/icons-vue'
  import { ElMessage } from 'element-plus'
  import type { OptimizerItem } from '../types'

  defineOptions({ name: 'OptimizerDetailDrawer' })

  defineProps<{
    visible: boolean
    data: OptimizerItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [row: OptimizerItem]
  }>()

  const handleClose = () => emit('update:visible', false)

  const truncateCode = (code: string) => {
    if (!code || code.length <= 16) return code
    return `${code.slice(0, 12)}...${code.slice(-2)}`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      ElMessage.success('已复制到剪贴板')
    })
  }
</script>

<style lang="scss" scoped>
  :deep(.optimizer-detail-el-drawer) {
    --el-drawer-padding-primary: 0px;
    --od-accent: var(--el-color-primary);
    --od-accent-dim: color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    --od-surface: color-mix(in srgb, var(--default-box-color) 88%, black 6%);
    --od-surface-2: color-mix(in srgb, var(--default-box-color) 80%, black 10%);
    --od-border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --od-border-strong: color-mix(in srgb, var(--el-color-primary) 34%, transparent);
    --od-text: var(--text-primary);
    --od-text-2: var(--text-secondary);
    --od-text-3: var(--text-tertiary);
  }

  :deep(.optimizer-detail-el-drawer .el-drawer__body) {
    padding: 0;
    overflow: hidden;
  }

  :deep(.optimizer-detail-el-drawer .el-overlay) {
    background: color-mix(in srgb, black 62%, transparent);
    backdrop-filter: blur(4px);
  }

  :deep(.optimizer-detail-el-drawer .el-drawer) {
    background: transparent;
    box-shadow:
      0 18px 64px color-mix(in srgb, black 58%, transparent),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 9%, transparent);
  }

  // ─── 抽屉主体 ────────────────────────────────────────────────────
  .detail-drawer {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background:
      radial-gradient(
        ellipse 60% 45% at 86% 6%,
        color-mix(in srgb, var(--el-color-primary) 18%, transparent) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse 55% 40% at 12% 0%,
        color-mix(in srgb, var(--theme-color) 12%, transparent) 0%,
        transparent 62%
      ),
      linear-gradient(180deg, var(--od-surface), var(--od-surface-2));
    isolation: isolate;
    border-left: 1px solid var(--od-border);

    &::before {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 42%, transparent) 30%,
        color-mix(in srgb, var(--theme-color) 32%, transparent) 70%,
        transparent 100%
      );
      filter: blur(10px);
      opacity: 0.14;
      transform: translateY(-62%);
    }

    &::after {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      content: '';
      background-image:
        linear-gradient(
          to right,
          color-mix(in srgb, var(--el-color-primary) 10%, transparent) 1px,
          transparent 1px
        ),
        linear-gradient(
          to bottom,
          color-mix(in srgb, var(--el-color-primary) 8%, transparent) 1px,
          transparent 1px
        );
      background-size: 22px 22px;
      opacity: 0.16;
      mask-image: radial-gradient(ellipse 70% 55% at 60% 12%, black 0%, transparent 62%);
    }
  }

  // ─── 头部 ────────────────────────────────────────────────────────
  .drawer-header {
    position: relative;
    z-index: 1;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 16px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--default-box-color) 70%, transparent),
      color-mix(in srgb, var(--default-box-color) 48%, transparent)
    );
    border-bottom: 1px solid var(--od-border);

    &::after {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 2px;
      pointer-events: none;
      content: '';
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in srgb, var(--el-color-primary) 46%, transparent) 35%,
        color-mix(in srgb, var(--theme-color) 36%, transparent) 65%,
        transparent 100%
      );
      opacity: 0.9;
    }
  }

  .drawer-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--od-text);
    letter-spacing: -0.01em;
  }

  .drawer-header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .header-edit-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 5px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--od-accent);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--od-border-strong);
    border-radius: 6px;
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--el-color-primary) 10%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 10%, transparent);
    transition:
      transform var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out);

    &:hover {
      background: var(--od-accent-dim);
      border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
      box-shadow:
        0 14px 32px color-mix(in srgb, var(--el-color-primary) 16%, transparent),
        0 0 0 1px color-mix(in srgb, var(--el-color-primary) 12%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 12%, transparent);
      transform: translateY(-1px);
    }
  }

  .close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 16px;
    color: var(--od-text-3);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition:
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &:hover {
      color: var(--od-text);
      background: color-mix(in srgb, var(--default-box-color) 38%, transparent);
      transform: translateY(-1px);
    }
  }

  // ─── 内容区 ──────────────────────────────────────────────────────
  .drawer-body {
    position: relative;
    z-index: 1;
    flex: 1;
    padding: 20px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--default-box-color) 52%, transparent);
      border-radius: 2px;
    }
  }

  // ─── 个人信息头 ───────────────────────────────────────────────────
  .profile-row {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 18px;
  }

  .profile-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    font-size: 22px;
    font-weight: 700;
    color: white;
    border-radius: 50%;
    box-shadow:
      0 18px 50px color-mix(in srgb, black 35%, transparent),
      0 0 0 1px color-mix(in srgb, white 12%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent);
  }

  .profile-info {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .profile-name {
    font-size: 20px;
    font-weight: 700;
    color: var(--od-text);
  }

  .profile-status {
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 20px;

    &.status--active {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 16%, transparent);
    }

    &.status--inactive {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 16%, transparent);
    }
  }

  // ─── 分割线 ───────────────────────────────────────────────────────
  .section-divider {
    height: 1px;
    margin: 16px 0;
    background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  }

  // ─── 小节标题 ────────────────────────────────────────────────────
  .section-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--od-text-2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  // ─── 基本信息网格 ─────────────────────────────────────────────────
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px 20px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 12px;
    color: var(--od-text-3);
  }

  .info-value {
    font-size: 13px;
    color: var(--od-text);

    &.scode {
      color: var(--od-accent);
    }

    &.scode2 {
      color: var(--od-text-2);
    }

    &.consume {
      font-weight: 600;
      color: var(--art-warning);
    }
  }

  .version-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--od-text-2);
    background: color-mix(in srgb, var(--default-box-color) 44%, transparent);
    border-radius: 4px;
  }

  .inline-status {
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &.status--active {
      color: var(--art-success);
      background: color-mix(in srgb, var(--art-success) 16%, transparent);
    }

    &.status--inactive {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 16%, transparent);
    }
  }

  .checkcode-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .checkcode-val {
    font-family:
      ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 12px;
    color: var(--od-text-2);
  }

  .copy-icon {
    font-size: 14px;
    color: var(--od-text-3);
    cursor: pointer;
    transition:
      color var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);

    &:hover {
      color: var(--od-accent);
      transform: translateY(-1px);
    }
  }

  // ─── 负责应用 ────────────────────────────────────────────────────
  .apps-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .app-tag {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 5px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--od-text);
    background: color-mix(in srgb, var(--default-box-color) 34%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    border-radius: 20px;
  }

  .app-tag-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 11px;
    font-weight: 700;
    color: var(--od-accent);
    background: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    border-radius: 4px;
  }

  .empty-hint {
    padding: 4px 0;
    font-size: 13px;
    color: var(--od-text-3);
  }

  // ─── 时间线 ──────────────────────────────────────────────────────
  .timeline {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-left: 16px;

    &::before {
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: 5px;
      width: 1px;
      content: '';
      background: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    }
  }

  .timeline-item {
    position: relative;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding-bottom: 14px;

    &:last-child {
      padding-bottom: 0;
    }
  }

  .timeline-dot {
    position: absolute;
    top: 5px;
    left: -13px;
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;

    &.dot--active {
      background: var(--od-accent);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    }

    &.dot--normal {
      background: color-mix(in srgb, var(--default-box-color) 58%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 14%, transparent);
    }
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .timeline-time {
    font-size: 12px;
    color: var(--od-text-3);
  }

  .timeline-text {
    font-size: 13px;
    color: var(--od-text-2);
  }

  // ─── 底部 ────────────────────────────────────────────────────────
  .drawer-footer {
    position: relative;
    z-index: 1;
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 20px;
    background: linear-gradient(
      180deg,
      transparent 0%,
      color-mix(in srgb, var(--default-box-color) 42%, transparent) 100%
    );
    border-top: 1px solid var(--od-border);
  }

  .footer-btn {
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition:
      transform var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      border-color var(--duration-normal) var(--ease-out),
      background-color var(--duration-normal) var(--ease-out),
      color var(--duration-normal) var(--ease-out),
      filter var(--duration-normal) var(--ease-out);

    &.btn-close {
      color: var(--od-text-2);
      background: color-mix(in srgb, var(--default-box-color) 22%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 16%, transparent);

      &:hover {
        color: var(--od-text);
        border-color: color-mix(in srgb, var(--el-color-primary) 38%, transparent);
        box-shadow: 0 14px 34px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
        transform: translateY(-1px);
      }
    }

    &.btn-edit {
      font-weight: 600;
      color: color-mix(in srgb, black 78%, transparent);
      background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 88%, white 8%),
        color-mix(in srgb, var(--theme-color) 86%, white 10%)
      );
      border: none;
      box-shadow:
        0 16px 36px color-mix(in srgb, var(--el-color-primary) 22%, transparent),
        inset 0 1px 0 color-mix(in srgb, white 18%, transparent);

      &:hover {
        filter: brightness(1.1);
        transform: translateY(-1px);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.optimizer-detail-el-drawer .el-overlay) {
      backdrop-filter: none;
    }

    .header-edit-btn:hover,
    .close-btn:hover,
    .copy-icon:hover,
    .footer-btn:hover {
      transform: none;
    }

    .header-edit-btn,
    .close-btn,
    .copy-icon,
    .footer-btn {
      transition: none;
    }
  }
</style>
