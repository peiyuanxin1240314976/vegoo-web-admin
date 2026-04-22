<template>
  <template v-if="isSide">
    <div v-show="visible" class="assignment-detail-drawer assignment-detail-drawer--side">
      <div class="drawer-header">
        <div class="header-main">
          <div class="app-icon" :style="{ background: assignment?.iconColor || '#2dd4bf' }">
            {{ assignment?.appName?.charAt(0) || 'A' }}
          </div>
          <div class="header-info">
            <div class="header-name-row">
              <span class="app-name">{{ assignment?.appName || '详情' }}</span>
              <span
                v-if="assignment?.platform"
                :class="[
                  'platform-badge',
                  assignment?.platform === 'Android'
                    ? 'platform-badge--android'
                    : 'platform-badge--ios'
                ]"
              >
                {{ assignment?.platform === 'Android' ? '安卓' : 'iOS' }}
              </span>
              <span v-if="assignment?.adPlatform" class="ad-platform-badge">{{
                assignment?.adPlatform
              }}</span>
            </div>
            <div class="optimizer-row">
              <span class="optimizer-label">优化师：</span>
              <span class="optimizer-name">{{ assignment?.optimizer ?? '—' }}</span>
              <span v-if="assignment?.optimizer" class="optimizer-tag">当前负责人</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <ElButton size="small" round class="edit-btn" :disabled="!assignment" @click="handleEdit">
            <ElIcon><EditPen /></ElIcon>编辑
          </ElButton>
          <button class="close-btn" @click="handleClose" aria-label="关闭详情">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
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

      <div class="drawer-body">
        <div v-if="!assignment" class="drawer-empty">
          <div class="drawer-empty__title">请选择一条分配</div>
          <div class="drawer-empty__desc">点击左侧表格任意一行，在右侧查看详情。</div>
        </div>
        <template v-else>
          <!-- 绩效配置 -->
          <section class="drawer-section">
            <div class="section-title">绩效配置</div>
            <div class="version-bar">
              <span class="version-label">
                {{ activeVersion?.version }} {{ activeVersion?.status }}
              </span>
              <span v-if="activeVersion?.isActive" class="active-mark">★ 当前激活</span>
              <button class="switch-version-btn" @click="handleSwitchVersion">
                切换版本 <el-icon><ArrowDown /></el-icon>
              </button>
            </div>
            <div class="config-grid">
              <div class="config-item">
                <span class="config-key">评估方式</span>
                <span class="config-val">{{ activeVersion?.evalMethod ?? '—' }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">评估天数</span>
                <span class="config-val">{{
                  activeVersion ? `${activeVersion.evalDays}天` : '—'
                }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">达标要求</span>
                <span class="config-val config-val--accent">{{
                  activeVersion?.targetRate ?? '—'
                }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">最低要求</span>
                <span class="config-val">{{ activeVersion?.minRate ?? '—' }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">难度系数</span>
                <span class="config-val">{{ activeVersion?.difficulty ?? '—' }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">最低利润</span>
                <span class="config-val">{{ activeVersion?.minProfit ?? '—' }}</span>
              </div>
              <div class="config-item config-item--full">
                <span class="config-key">附加条件</span>
                <span class="config-val">{{ activeVersion?.extraCondition ?? '—' }}</span>
              </div>
            </div>
            <button class="detail-link">查看绩效配置详情 →</button>
          </section>

          <!-- 分配信息 -->
          <section class="drawer-section">
            <div class="section-title">分配信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-key">分配时间</span>
                <span class="info-val">{{ assignment?.assignTime ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">分配操作人</span>
                <span class="info-val">{{ assignment?.operator ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">生效时间</span>
                <span class="info-val">{{ assignment?.effectiveTime ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">状态</span>
                <span :class="['status-badge', statusClass(assignment?.status)]">
                  {{ assignment?.status }}
                </span>
              </div>
            </div>
            <div v-if="assignment?.note" class="note-row">
              <span class="info-key">备注</span>
              <span class="note-val">{{ assignment.note }}</span>
            </div>
          </section>

          <!-- 变更记录（最近3条） -->
          <section class="drawer-section drawer-section--last">
            <div class="section-title">变更记录</div>
            <div class="change-timeline">
              <div
                v-for="(log, index) in recentLogs"
                :key="log.id"
                :class="[
                  'timeline-item',
                  index === recentLogs.length - 1 ? 'timeline-item--last' : ''
                ]"
              >
                <div class="timeline-dot">
                  <span :class="['dot', typeColorClass(log.type)]" />
                  <span v-if="index < recentLogs.length - 1" class="dot-line" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-time">{{ log.time }}</span>
                    <span class="timeline-operator">{{ log.operator }}</span>
                    <span :class="['timeline-type', typeColorClass(log.type)]">{{ log.type }}</span>
                  </div>
                  <div class="timeline-body">{{ log.content }}</div>
                </div>
              </div>
              <div v-if="!recentLogs.length" class="timeline-empty">暂无变更记录</div>
            </div>
            <button class="view-all-btn" @click="handleViewAllLogs">查看全部记录</button>
          </section>
        </template>
      </div>
    </div>
  </template>

  <template v-else>
    <!-- 遮罩 -->
    <transition name="fade">
      <div v-if="visible" class="drawer-overlay" @click="handleClose" />
    </transition>

    <!-- 抽屉 -->
    <transition name="drawer-slide">
      <div v-if="visible" class="assignment-detail-drawer">
        <!-- ── 头部 ─────────────────────────────────────────── -->
        <div class="drawer-header">
          <div class="header-main">
            <div class="app-icon" :style="{ background: assignment?.iconColor || '#2dd4bf' }">
              {{ assignment?.appName?.charAt(0) || 'A' }}
            </div>
            <div class="header-info">
              <div class="header-name-row">
                <span class="app-name">{{ assignment?.appName }}</span>
                <span
                  :class="[
                    'platform-badge',
                    assignment?.platform === 'Android'
                      ? 'platform-badge--android'
                      : 'platform-badge--ios'
                  ]"
                >
                  {{ assignment?.platform === 'Android' ? '安卓' : 'iOS' }}
                </span>
                <span class="ad-platform-badge">{{ assignment?.adPlatform }}</span>
              </div>
              <div class="optimizer-row">
                <span class="optimizer-label">优化师：</span>
                <span class="optimizer-name">{{ assignment?.optimizer }}</span>
                <span class="optimizer-tag">当前负责人</span>
              </div>
            </div>
          </div>
          <div class="header-actions">
            <ElButton size="small" round class="edit-btn" @click="handleEdit">
              <ElIcon><EditPen /></ElIcon>编辑
            </ElButton>
            <button class="close-btn" @click="handleClose">
              <svg viewBox="0 0 16 16" fill="none" width="13" height="13">
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

        <!-- ── 正文 ─────────────────────────────────────────── -->
        <div class="drawer-body">
          <!-- 绩效配置 -->
          <section class="drawer-section">
            <div class="section-title">绩效配置</div>
            <div class="version-bar">
              <span class="version-label">
                {{ activeVersion?.version }} {{ activeVersion?.status }}
              </span>
              <span v-if="activeVersion?.isActive" class="active-mark">★ 当前激活</span>
              <button class="switch-version-btn" @click="handleSwitchVersion">
                切换版本 <el-icon><ArrowDown /></el-icon>
              </button>
            </div>
            <div class="config-grid">
              <div class="config-item">
                <span class="config-key">评估方式</span>
                <span class="config-val">{{ activeVersion?.evalMethod ?? '—' }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">评估天数</span>
                <span class="config-val">{{
                  activeVersion ? `${activeVersion.evalDays}天` : '—'
                }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">达标要求</span>
                <span class="config-val config-val--accent">{{
                  activeVersion?.targetRate ?? '—'
                }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">最低要求</span>
                <span class="config-val">{{ activeVersion?.minRate ?? '—' }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">难度系数</span>
                <span class="config-val">{{ activeVersion?.difficulty ?? '—' }}</span>
              </div>
              <div class="config-item">
                <span class="config-key">最低利润</span>
                <span class="config-val">{{ activeVersion?.minProfit ?? '—' }}</span>
              </div>
              <div class="config-item config-item--full">
                <span class="config-key">附加条件</span>
                <span class="config-val">{{ activeVersion?.extraCondition ?? '—' }}</span>
              </div>
            </div>
            <button class="detail-link">查看绩效配置详情 →</button>
          </section>

          <!-- 分配信息 -->
          <section class="drawer-section">
            <div class="section-title">分配信息</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-key">分配时间</span>
                <span class="info-val">{{ assignment?.assignTime ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">分配操作人</span>
                <span class="info-val">{{ assignment?.operator ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">生效时间</span>
                <span class="info-val">{{ assignment?.effectiveTime ?? '—' }}</span>
              </div>
              <div class="info-item">
                <span class="info-key">状态</span>
                <span :class="['status-badge', statusClass(assignment?.status)]">
                  {{ assignment?.status }}
                </span>
              </div>
            </div>
            <div v-if="assignment?.note" class="note-row">
              <span class="info-key">备注</span>
              <span class="note-val">{{ assignment.note }}</span>
            </div>
          </section>

          <!-- 变更记录（最近3条） -->
          <section class="drawer-section drawer-section--last">
            <div class="section-title">变更记录</div>
            <div class="change-timeline">
              <div
                v-for="(log, index) in recentLogs"
                :key="log.id"
                :class="[
                  'timeline-item',
                  index === recentLogs.length - 1 ? 'timeline-item--last' : ''
                ]"
              >
                <div class="timeline-dot">
                  <span :class="['dot', typeColorClass(log.type)]" />
                  <span v-if="index < recentLogs.length - 1" class="dot-line" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <span class="timeline-time">{{ log.time }}</span>
                    <span class="timeline-operator">{{ log.operator }}</span>
                    <span :class="['timeline-type', typeColorClass(log.type)]">{{ log.type }}</span>
                  </div>
                  <div class="timeline-body">{{ log.content }}</div>
                </div>
              </div>
              <div v-if="!recentLogs.length" class="timeline-empty">暂无变更记录</div>
            </div>
            <button class="view-all-btn" @click="handleViewAllLogs">查看全部记录</button>
          </section>
        </div>
      </div>
    </transition>
  </template>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { EditPen, ArrowDown } from '@element-plus/icons-vue'
  import type { AppAssignmentItem, AssignmentStatus, ChangeLogType } from '../types'

  defineOptions({ name: 'AssignmentDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    assignment: AppAssignmentItem | null
    mode?: 'overlay' | 'side'
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [data: AppAssignmentItem]
    viewLogs: [data: AppAssignmentItem]
  }>()

  const isSide = computed(() => props.mode === 'side')

  const activeVersion = computed(
    () =>
      props.assignment?.availableVersions.find((v) => v.id === props.assignment?.configVersionId) ??
      null
  )

  const recentLogs = computed(() =>
    (props.assignment?.changeLogs ?? []).filter((l) => l.status === '有效').slice(0, 3)
  )

  const statusClass = (status?: AssignmentStatus) => {
    const map: Record<string, string> = {
      活跃: 'status-badge--active',
      草稿配置: 'status-badge--draft',
      已归档: 'status-badge--archived'
    }
    return status ? (map[status] ?? '') : ''
  }

  const typeColorClass = (type: ChangeLogType) =>
    ({
      配置变更: 'color--teal',
      优化师变更: 'color--purple',
      备注更新: 'color--amber',
      初始分配: 'color--blue',
      已删除: 'color--red'
    })[type] ?? ''

  const handleClose = () => emit('update:visible', false)
  const handleEdit = () => props.assignment && emit('edit', props.assignment)
  const handleViewAllLogs = () => props.assignment && emit('viewLogs', props.assignment)
  const handleSwitchVersion = () => props.assignment && emit('edit', props.assignment)
</script>

<style lang="scss" scoped>
  // ─── CSS 变量 ───────────────────────────────────────────
  .assignment-detail-drawer,
  .drawer-overlay {
    --bg-drawer: #0f1829;
    --bg-section: rgb(255 255 255 / 2.5%);
    --border: rgb(255 255 255 / 7%);
    --text-primary: #e2e8f0;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    --accent: #2dd4bf;
    --accent-dim: rgb(45 212 191 / 10%);
    --android-green: #22c55e;
    --ios-blue: #60a5fa;
    --amber: #f59e0b;
    --red: #ef4444;
    --purple: #a78bfa;
  }

  // ─── 遮罩 ──────────────────────────────────────────────
  .drawer-overlay {
    position: fixed;
    inset: 0;
    z-index: 998;
    background: rgb(0 0 0 / 40%);
    backdrop-filter: blur(1px);
  }

  // ─── 抽屉容器 ──────────────────────────────────────────
  .assignment-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    width: 480px;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: var(--bg-drawer);
    border-left: 1px solid var(--border);
    box-shadow: -12px 0 48px rgb(0 0 0 / 50%);
  }

  .assignment-detail-drawer--side {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 14px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 16%),
      0 0 0 1px rgb(255 255 255 / 6%),
      inset 0 1px 0 rgb(255 255 255 / 6%);
  }

  .drawer-empty {
    display: grid;
    gap: 6px;
    place-content: center;
    height: 100%;
    padding: 18px;
    color: var(--text-secondary);
    text-align: center;
  }

  .drawer-empty__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .drawer-empty__desc {
    font-size: 12px;
    color: var(--text-muted);
  }

  // ─── 头部 ──────────────────────────────────────────────
  .drawer-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    padding: 18px 18px 16px;
    background: #131c2e;
    border-bottom: 1px solid var(--border);
  }

  .header-main {
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
    width: 44px;
    height: 44px;
    font-size: 20px;
    font-weight: 700;
    color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 14px rgb(0 0 0 / 30%);
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  .header-name-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 7px;
  }

  .app-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .platform-badge {
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &--android {
      color: var(--android-green);
      background: rgb(34 197 94 / 12%);
    }

    &--ios {
      color: var(--ios-blue);
      background: rgb(96 165 250 / 12%);
    }
  }

  .ad-platform-badge {
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    background: rgb(255 255 255 / 6%);
    border-radius: 4px;
  }

  .optimizer-row {
    display: flex;
    gap: 5px;
    align-items: center;
  }

  .optimizer-label {
    font-size: 12px;
    color: var(--text-muted);
  }

  .optimizer-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .optimizer-tag {
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 500;
    color: #f59e0b;
    background: rgb(245 158 11 / 12%);
    border: 1px solid rgb(245 158 11 / 25%);
    border-radius: 4px;
  }

  .header-actions {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    margin-left: 10px;
  }

  .edit-btn {
    height: 28px !important;
    padding: 4px 11px !important;
    font-size: 12px !important;
    color: var(--accent) !important;
    background: var(--accent-dim) !important;
    border: 1px solid rgb(45 212 191 / 25%) !important;
    border-radius: 6px !important;

    &:hover {
      background: rgb(45 212 191 / 16%) !important;
    }
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: var(--text-muted);
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: all 0.15s;

    &:hover {
      color: var(--text-primary);
      background: rgb(255 255 255 / 8%);
    }
  }

  // ─── 正文 ──────────────────────────────────────────────
  .drawer-body {
    flex: 1;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgb(255 255 255 / 8%);
      border-radius: 2px;
    }
  }

  .drawer-section {
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);

    &--last {
      border-bottom: none;
    }
  }

  .section-title {
    padding-left: 8px;
    margin-bottom: 12px;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent);
    border-left: 3px solid var(--accent);
  }

  // ─── 绩效配置区 ─────────────────────────────────────────
  .version-bar {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .version-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .active-mark {
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    background: var(--accent-dim);
    border: 1px solid rgb(45 212 191 / 25%);
    border-radius: 4px;
  }

  .switch-version-btn {
    display: inline-flex;
    gap: 3px;
    align-items: center;
    padding: 2px 8px;
    margin-left: auto;
    font-size: 12px;
    color: #94a3b8;
    cursor: pointer;
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(255 255 255 / 8%);
    border-radius: 5px;
    transition: all 0.15s;

    &:hover {
      color: var(--accent);
      border-color: rgb(45 212 191 / 25%);
    }
  }

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 8px;
    margin-bottom: 12px;
  }

  .config-item {
    display: flex;
    flex-direction: column;
    gap: 3px;

    &--full {
      grid-column: 1 / -1;
    }
  }

  .config-key {
    font-size: 11px;
    color: var(--text-muted);
  }

  .config-val {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);

    &--accent {
      color: var(--accent);
    }
  }

  .detail-link {
    font-size: 12px;
    color: var(--accent);
    cursor: pointer;
    background: none;
    border: none;
    opacity: 0.8;
    transition: opacity 0.15s;

    &:hover {
      opacity: 1;
    }
  }

  // ─── 分配信息 ──────────────────────────────────────────
  .info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 8px;
    margin-bottom: 10px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .info-key {
    font-size: 11px;
    color: var(--text-muted);
  }

  .info-val {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;

    &--active {
      color: #22c55e;
      background: rgb(34 197 94 / 12%);
    }

    &--draft {
      color: var(--amber);
      background: rgb(245 158 11 / 12%);
    }

    &--archived {
      color: var(--text-muted);
      background: rgb(255 255 255 / 5%);
    }
  }

  .note-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 10px;
    background: rgb(255 255 255 / 2%);
    border: 1px solid rgb(255 255 255 / 6%);
    border-radius: 6px;
  }

  .note-val {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  // ─── 变更时间线 ─────────────────────────────────────────
  .change-timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-bottom: 12px;
  }

  .timeline-item {
    display: flex;
    gap: 10px;

    &--last .dot-line {
      display: none;
    }
  }

  .timeline-dot {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    padding-top: 3px;
  }

  .dot {
    display: block;
    flex-shrink: 0;
    width: 8px;
    height: 8px;
    border-radius: 50%;

    &.color--teal {
      background: #2dd4bf;
    }

    &.color--purple {
      background: #a78bfa;
    }

    &.color--amber {
      background: #f59e0b;
    }

    &.color--blue {
      background: #60a5fa;
    }

    &.color--red {
      background: #ef4444;
    }
  }

  .dot-line {
    flex: 1;
    width: 1px;
    margin: 4px 0;
    background: rgb(255 255 255 / 7%);
  }

  .timeline-content {
    flex: 1;
    min-width: 0;
    padding-bottom: 12px;
  }

  .timeline-header {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    align-items: center;
    margin-bottom: 3px;
  }

  .timeline-time {
    font-size: 11px;
    color: var(--text-muted);
  }

  .timeline-operator {
    font-size: 11px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .timeline-type {
    padding: 1px 5px;
    font-size: 10px;
    border-radius: 3px;

    &.color--teal {
      color: #2dd4bf;
      background: rgb(45 212 191 / 10%);
    }

    &.color--purple {
      color: #a78bfa;
      background: rgb(167 139 250 / 10%);
    }

    &.color--amber {
      color: #f59e0b;
      background: rgb(245 158 11 / 10%);
    }

    &.color--blue {
      color: #60a5fa;
      background: rgb(96 165 250 / 10%);
    }

    &.color--red {
      color: #ef4444;
      background: rgb(239 68 68 / 10%);
    }
  }

  .timeline-body {
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .timeline-empty {
    padding: 12px 0;
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
  }

  .view-all-btn {
    font-size: 13px;
    font-weight: 500;
    color: var(--accent);
    cursor: pointer;
    background: none;
    border: none;
    opacity: 0.85;
    transition: opacity 0.15s;

    &:hover {
      opacity: 1;
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
