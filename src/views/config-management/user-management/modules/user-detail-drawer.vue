<template>
  <!-- 遮罩层 -->
  <transition name="fade">
    <div v-if="visible" class="drawer-overlay" @click="handleClose" />
  </transition>

  <!-- 抽屉主体 -->
  <transition name="drawer-slide">
    <div v-if="visible" class="user-detail-drawer">
      <!-- ── 头部 ─────────────────────────────────── -->
      <div class="drawer-header">
        <div class="header-left">
          <div class="user-avatar" :style="{ background: userData?.avatarColor }">
            {{ userData?.userName.slice(0, 2).toUpperCase() }}
          </div>
          <div class="header-info">
            <div class="header-name-row">
              <span class="user-name">{{ userData?.userName }}</span>
              <span :class="['status-badge', getStatusBadgeClass(userData?.status)]">
                <span class="status-dot" />{{ userData?.status }}
              </span>
            </div>
            <div class="header-meta">
              <span class="user-email">{{ userData?.email }}</span>
              <span class="join-date">加入于 {{ userData?.joinTime }}</span>
            </div>
          </div>
        </div>
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

      <!-- ── 正文滚动区 ──────────────────────────── -->
      <div class="drawer-body">
        <!-- 用户信息 -->
        <section class="detail-section">
          <div class="section-title">用户信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-key">用户名</span>
              <span class="info-val">{{ userData?.userName }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">邮箱</span>
              <span class="info-val info-val--email">{{ userData?.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">最近登录</span>
              <span class="info-val">{{ userData?.lastLogin }}</span>
            </div>
            <div class="info-item">
              <span class="info-key">加入时间</span>
              <span class="info-val">{{ userData?.joinTime }}</span>
            </div>
          </div>
        </section>

        <!-- 分配角色 -->
        <section class="detail-section">
          <div class="section-title">分配角色</div>
          <el-select v-model="panelRole" style="width: 100%">
            <el-option
              v-for="opt in roleOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </section>

        <!-- 可访问应用 -->
        <section class="detail-section">
          <div class="section-title">可访问应用</div>
          <div class="panel-apps">
            <span v-for="app in panelApps" :key="app" class="app-tag">
              {{ app }}
              <span class="app-tag-remove" @click="removeApp(app)">×</span>
            </span>
          </div>
          <el-select
            v-model="addAppVal"
            placeholder="添加应用..."
            class="app-add-select"
            clearable
            @change="handleAddApp"
          >
            <el-option
              v-for="opt in availableAppOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </section>

        <!-- 备注 -->
        <section class="detail-section detail-section--last">
          <div class="section-title">备注</div>
          <el-input
            v-model="panelRemark"
            type="textarea"
            :rows="4"
            placeholder="输入备注..."
            class="remark-input"
          />
        </section>
      </div>

      <!-- ── 底部操作栏 ───────────────────────────── -->
      <div class="drawer-footer">
        <ElButton round class="footer-btn footer-btn--edit" @click="emit('edit', userData!)">
          编辑用户
        </ElButton>
        <ElButton
          v-if="userData?.status === '活跃'"
          round
          class="footer-btn footer-btn--danger"
          @click="emit('toggleStatus', userData!)"
        >
          禁用用户
        </ElButton>
        <ElButton
          v-else-if="userData?.status === '已禁用'"
          round
          class="footer-btn footer-btn--enable"
          @click="emit('toggleStatus', userData!)"
        >
          启用用户
        </ElButton>
        <ElButton v-else round class="footer-btn footer-btn--save" @click="handleSave">
          保存
        </ElButton>
      </div>

      <!-- 保存/取消（角色/应用/备注编辑时显示） -->
      <div v-if="isDirty" class="drawer-save-bar">
        <ElButton round class="save-btn" type="primary" @click="handleSave">保存更改</ElButton>
        <ElButton round class="cancel-btn" @click="resetPanel">取消</ElButton>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { UserItem, UserRole } from '../types'
  import { userRoleOptions, userAppOptions } from '../mock/data'

  defineOptions({ name: 'UserDetailDrawer' })

  const props = defineProps<{
    visible: boolean
    userData: UserItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    edit: [data: UserItem]
    toggleStatus: [data: UserItem]
    save: [data: Pick<UserItem, 'id' | 'role' | 'accessibleApps' | 'remark'>]
  }>()

  const roleOptions = userRoleOptions
  const allAppOptions = userAppOptions

  const panelRole = ref<UserRole>('投放人员')
  const panelApps = ref<string[]>([])
  const panelRemark = ref('')
  const addAppVal = ref('')

  const availableAppOptions = computed(() =>
    allAppOptions.filter((opt) => !panelApps.value.includes(opt.value))
  )

  const isDirty = computed(() => {
    if (!props.userData) return false
    return (
      panelRole.value !== props.userData.role ||
      panelRemark.value !== props.userData.remark ||
      JSON.stringify(panelApps.value.slice().sort()) !==
        JSON.stringify(props.userData.accessibleApps.slice().sort())
    )
  })

  watch(
    () => props.userData,
    (user) => {
      if (user) {
        panelRole.value = user.role
        panelApps.value = [...user.accessibleApps]
        panelRemark.value = user.remark
      }
    },
    { immediate: true }
  )

  function getStatusBadgeClass(status?: string) {
    if (status === '活跃') return 'status-badge--active'
    if (status === '待激活') return 'status-badge--pending'
    return 'status-badge--disabled'
  }

  function removeApp(app: string) {
    panelApps.value = panelApps.value.filter((a) => a !== app)
  }

  function handleAddApp(val: string) {
    if (val && !panelApps.value.includes(val)) {
      panelApps.value.push(val)
    }
    addAppVal.value = ''
  }

  function handleSave() {
    if (!props.userData) return
    emit('save', {
      id: props.userData.id,
      role: panelRole.value,
      accessibleApps: [...panelApps.value],
      remark: panelRemark.value
    })
  }

  function resetPanel() {
    if (props.userData) {
      panelRole.value = props.userData.role
      panelApps.value = [...props.userData.accessibleApps]
      panelRemark.value = props.userData.remark
    }
  }

  function handleClose() {
    emit('update:visible', false)
  }
</script>

<style lang="scss" scoped>
  .user-detail-drawer,
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
    --green: #22c55e;
    --green-dim: rgb(34 197 94 / 12%);
    --amber: #f59e0b;
    --amber-dim: rgb(245 158 11 / 12%);
    --red: #ef4444;
    --red-dim: rgb(239 68 68 / 10%);
    --blue: #60a5fa;
    --blue-dim: rgb(96 165 250 / 12%);
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
  .user-detail-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    width: 380px;
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
    gap: 12px;
    align-items: flex-start;
    min-width: 0;
  }

  .user-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    border-radius: 50%;
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
    margin-bottom: 6px;
  }

  .user-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .header-meta {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .user-email {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .join-date {
    font-size: 11px;
    color: var(--text-muted);
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
      border-color: rgb(255 255 255 / 14%);
    }
  }

  // ─── 状态徽章 ──────────────────────────────────────────
  .status-badge {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 5px;

    &--active {
      color: var(--green);
      background: var(--green-dim);
    }

    &--pending {
      color: var(--amber);
      background: var(--amber-dim);
    }

    &--disabled {
      color: var(--red);
      background: var(--red-dim);
    }
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;

    .status-badge--active & {
      background: var(--green);
    }

    .status-badge--pending & {
      background: var(--amber);
    }

    .status-badge--disabled & {
      background: var(--red);
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

  // ─── Section ───────────────────────────────────────────
  .detail-section {
    padding: 16px 20px;
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

    &--email {
      font-size: 12px;
      word-break: break-all;
    }
  }

  // ─── 角色下拉 ──────────────────────────────────────────
  :deep(.el-select__wrapper) {
    color: var(--text-primary);
    background: rgb(255 255 255 / 4%) !important;
    border: 1px solid var(--border) !important;
    box-shadow: none !important;

    &:hover {
      border-color: var(--accent) !important;
    }
  }

  // ─── 可访问应用 ────────────────────────────────────────
  .panel-apps {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }

  .app-tag {
    display: inline-flex;
    gap: 5px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    color: var(--text-primary);
    background: rgb(255 255 255 / 5%);
    border: 1px solid var(--border);
    border-radius: 5px;
  }

  .app-tag-remove {
    font-size: 15px;
    line-height: 1;
    color: var(--text-muted);
    cursor: pointer;
    transition: color 0.15s;

    &:hover {
      color: var(--red);
    }
  }

  .app-add-select {
    width: 100%;
  }

  // ─── 备注 ──────────────────────────────────────────────
  .remark-input {
    :deep(.el-textarea__inner) {
      font-size: 12px;
      color: var(--text-primary);
      resize: none;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--border) !important;
      box-shadow: none !important;

      &:focus {
        border-color: var(--accent) !important;
      }
    }
  }

  // ─── 底部操作栏 ────────────────────────────────────────
  .drawer-footer {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    padding: 14px 20px;
    background: var(--bg-header);
    border-top: 1px solid var(--border);
  }

  .footer-btn {
    flex: 1;
    height: 38px !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    border-radius: 9px !important;
    transition: all 0.15s !important;

    &--edit {
      color: var(--accent) !important;
      background: var(--accent-dim) !important;
      border: 1px solid var(--border-accent) !important;

      &:hover {
        background: rgb(45 212 191 / 18%) !important;
        transform: translateY(-1px);
      }
    }

    &--danger {
      color: var(--red) !important;
      background: transparent !important;
      border: 1px solid var(--red) !important;

      &:hover {
        background: var(--red-dim) !important;
        transform: translateY(-1px);
      }
    }

    &--enable {
      color: var(--green) !important;
      background: transparent !important;
      border: 1px solid var(--green) !important;

      &:hover {
        background: var(--green-dim) !important;
        transform: translateY(-1px);
      }
    }

    &--save {
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

  // ─── 有修改时的保存条 ──────────────────────────────────
  .drawer-save-bar {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    padding: 10px 20px;
    background: rgb(45 212 191 / 5%);
    border-top: 1px solid var(--border-accent);
  }

  .save-btn {
    flex: 1;
    height: 34px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
  }

  .cancel-btn {
    flex: 1;
    height: 34px !important;
    font-size: 13px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border-color: var(--border) !important;

    &:hover {
      color: var(--text-primary) !important;
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
