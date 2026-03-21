<template>
  <transition name="drawer-slide">
    <div v-if="visible" class="drawer-mask" @click.self="handleClose">
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
    </div>
  </transition>
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
  // ─── 遮罩 ────────────────────────────────────────────────────────
  .drawer-mask {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    justify-content: flex-end;
  }

  // ─── 抽屉主体 ────────────────────────────────────────────────────
  .detail-drawer {
    display: flex;
    flex-direction: column;
    width: 400px;
    height: 100%;
    overflow: hidden;
    background: #131c2e;
    border-left: 1px solid rgb(255 255 255 / 8%);
  }

  // ─── 头部 ────────────────────────────────────────────────────────
  .drawer-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 16px;
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  .drawer-title {
    font-size: 16px;
    font-weight: 600;
    color: #e2e8f0;
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
    color: #2dd4bf;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2dd4bf;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      background: rgb(45 212 191 / 12%);
    }
  }

  .close-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 16px;
    color: #64748b;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: #e2e8f0;
      background: rgb(255 255 255 / 8%);
    }
  }

  // ─── 内容区 ──────────────────────────────────────────────────────
  .drawer-body {
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
      background: rgb(255 255 255 / 10%);
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
    color: #fff;
    border-radius: 50%;
  }

  .profile-info {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .profile-name {
    font-size: 20px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .profile-status {
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 20px;

    &.status--active {
      color: #22c55e;
      background: rgb(34 197 94 / 15%);
    }

    &.status--inactive {
      color: #ef4444;
      background: rgb(239 68 68 / 15%);
    }
  }

  // ─── 分割线 ───────────────────────────────────────────────────────
  .section-divider {
    height: 1px;
    margin: 16px 0;
    background: rgb(255 255 255 / 7%);
  }

  // ─── 小节标题 ────────────────────────────────────────────────────
  .section-title {
    margin-bottom: 12px;
    font-size: 13px;
    font-weight: 600;
    color: #94a3b8;
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
    color: #64748b;
  }

  .info-value {
    font-size: 13px;
    color: #e2e8f0;

    &.scode {
      color: #2dd4bf;
    }

    &.scode2 {
      color: #94a3b8;
    }

    &.consume {
      font-weight: 600;
      color: #f59e0b;
    }
  }

  .version-badge {
    display: inline-block;
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 600;
    color: #94a3b8;
    background: rgb(255 255 255 / 8%);
    border-radius: 4px;
  }

  .inline-status {
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;

    &.status--active {
      color: #22c55e;
      background: rgb(34 197 94 / 15%);
    }

    &.status--inactive {
      color: #ef4444;
      background: rgb(239 68 68 / 15%);
    }
  }

  .checkcode-row {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .checkcode-val {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    color: #94a3b8;
  }

  .copy-icon {
    font-size: 14px;
    color: #64748b;
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: #2dd4bf;
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
    color: #e2e8f0;
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(255 255 255 / 10%);
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
    color: #2dd4bf;
    background: rgb(45 212 191 / 20%);
    border-radius: 4px;
  }

  .empty-hint {
    padding: 4px 0;
    font-size: 13px;
    color: #64748b;
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
      background: rgb(255 255 255 / 10%);
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
      background: #2dd4bf;
      box-shadow: 0 0 0 3px rgb(45 212 191 / 20%);
    }

    &.dot--normal {
      background: #334155;
      border: 1px solid #64748b;
    }
  }

  .timeline-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .timeline-time {
    font-size: 12px;
    color: #64748b;
  }

  .timeline-text {
    font-size: 13px;
    color: #94a3b8;
  }

  // ─── 底部 ────────────────────────────────────────────────────────
  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    justify-content: flex-end;
    padding: 14px 20px;
    border-top: 1px solid rgb(255 255 255 / 8%);
  }

  .footer-btn {
    padding: 8px 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.15s;

    &.btn-close {
      color: #94a3b8;
      background: transparent;
      border: 1px solid rgb(255 255 255 / 12%);

      &:hover {
        color: #e2e8f0;
        border-color: rgb(255 255 255 / 25%);
      }
    }

    &.btn-edit {
      font-weight: 600;
      color: #0b1120;
      background: #2dd4bf;
      border: none;

      &:hover {
        filter: brightness(1.1);
      }
    }
  }

  // ─── 过渡动画 ────────────────────────────────────────────────────
  .drawer-slide-enter-active,
  .drawer-slide-leave-active {
    transition: opacity 0.25s ease;

    .detail-drawer {
      transition: transform 0.25s ease;
    }
  }

  .drawer-slide-enter-from,
  .drawer-slide-leave-to {
    opacity: 0;

    .detail-drawer {
      transform: translateX(100%);
    }
  }
</style>
