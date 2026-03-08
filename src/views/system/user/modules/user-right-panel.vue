<!-- 用户管理 - 右侧面板：用户详情、分配角色、可访问应用、备注 -->
<template>
  <div class="user-right-panel">
    <template v-if="user">
      <!-- 1. 用户信息 -->
      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">用户信息</span>
        </template>
        <div class="user-info">
          <div class="user-name">{{ user.userName }}</div>
          <div class="user-email">{{ user.userEmail }}</div>
          <div class="user-meta">
            <span class="status-dot" :class="statusDotClass"></span>
            <span class="status-text">{{ statusText }}</span>
            <span class="meta-sep">|</span>
            <span class="meta-date">{{ user.createTime || '—' }}</span>
            <span class="meta-actions">
              <span class="meta-sep">|</span>
              <ElLink type="primary" :underline="false" @click="$emit('edit')">编辑</ElLink>
              <span class="meta-sep">|</span>
              <ElLink type="danger" :underline="false" @click="$emit('disable')">禁用</ElLink>
            </span>
          </div>
        </div>
      </ElCard>

      <!-- 2. 分配角色 -->
      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">分配角色</span>
        </template>
        <ElSelect
          v-model="form.role"
          placeholder="投放人员"
          clearable
          class="full-width"
          @change="$emit('change')"
        >
          <ElOption
            v-for="opt in roleOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </ElCard>

      <!-- 3. 可访问应用 -->
      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">可访问应用</span>
        </template>
        <ElSelect
          v-model="form.apps"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="输入后回车添加应用"
          class="full-width apps-select"
          @change="$emit('change')"
        >
          <ElOption v-for="app in form.apps" :key="app" :label="app" :value="app" />
        </ElSelect>
      </ElCard>

      <!-- 4. 备注 -->
      <ElCard class="panel-section" shadow="never">
        <template #header>
          <span class="section-title">备注</span>
        </template>
        <ElInput
          v-model="form.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入备注"
          class="full-width"
          @input="$emit('change')"
        />
      </ElCard>

      <!-- 5. 底部操作 -->
      <div class="panel-actions">
        <ElButton type="primary" @click="handleSave">保存</ElButton>
        <ElButton @click="$emit('cancel')">取消</ElButton>
      </div>
    </template>

    <!-- 未选择用户时的占位 -->
    <ElCard v-else class="panel-section panel-empty" shadow="never">
      <div class="empty-tip">
        <p class="empty-text">请从左侧列表选择用户</p>
        <p class="empty-desc">查看或编辑用户详情</p>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'UserRightPanel' })

  const props = withDefaults(
    defineProps<{
      user?: Api.SystemManage.UserListItem | null
      roleOptions?: { label: string; value: string }[]
    }>(),
    {
      roleOptions: () => [
        { label: '投放人员', value: 'ops' },
        { label: '管理层/老板', value: 'admin' }
      ]
    }
  )

  const emit = defineEmits<{
    (e: 'save', payload: { role: string; apps: string[]; remark: string }): void
    (e: 'cancel'): void
    (e: 'edit'): void
    (e: 'disable'): void
    (e: 'change'): void
  }>()

  const form = ref({
    role: '',
    apps: [] as string[],
    remark: ''
  })

  const statusMap: Record<string, { text: string; dot: string }> = {
    '1': { text: '活跃', dot: 'active' },
    '2': { text: '离线', dot: 'offline' },
    '3': { text: '异常', dot: 'warning' },
    '4': { text: '已禁用', dot: 'disabled' }
  }

  const statusText = computed(() =>
    props.user ? (statusMap[props.user.status]?.text ?? '未知') : ''
  )
  const statusDotClass = computed(() =>
    props.user ? `status-dot--${statusMap[props.user.status]?.dot ?? 'default'}` : ''
  )

  watch(
    () => props.user,
    (u) => {
      if (u) {
        form.value.role = u.userRoles?.[0] ?? ''
        form.value.apps = ['Weather1', 'Weather2'] // 示例，后续可来自接口
        form.value.remark = ''
      } else {
        form.value = { role: '', apps: [], remark: '' }
      }
    },
    { immediate: true }
  )

  function handleSave() {
    emit('save', {
      role: form.value.role,
      apps: form.value.apps,
      remark: form.value.remark
    })
  }
</script>

<style scoped lang="scss">
  .user-right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    height: 100%;
    min-height: 400px;
    overflow-y: auto;
  }

  .panel-section {
    flex-shrink: 0;

    :deep(.el-card__header) {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .section-title {
    color: var(--el-text-color-primary);
  }

  .user-info {
    .user-name {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 500;
    }

    .user-email {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    .user-meta {
      font-size: 13px;
      color: var(--el-text-color-secondary);

      .meta-sep {
        margin: 0 8px;
        opacity: 0.6;
      }

      .status-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        margin-right: 6px;
        vertical-align: middle;
        border-radius: 50%;

        &--active {
          background: var(--el-color-success);
        }

        &--offline {
          background: var(--el-color-info);
        }

        &--warning {
          background: var(--el-color-warning);
        }

        &--disabled {
          background: var(--el-color-danger);
        }

        &--default {
          background: var(--el-text-color-placeholder);
        }
      }
    }
  }

  .full-width {
    width: 100%;
  }

  /* 可访问应用：输入框区域高度为默认的 3 倍，选项/标签尺寸不变 */
  .apps-select {
    :deep(.el-select__wrapper) {
      align-items: flex-start;
      min-height: 96px !important;
      padding-top: 8px;
    }
  }

  .panel-actions {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 8px;
    margin-top: auto;
  }

  .panel-empty {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    min-height: 200px;

    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  }

  .empty-tip {
    color: var(--el-text-color-secondary);
    text-align: center;
  }

  .empty-text {
    margin-bottom: 6px;
    font-size: 14px;
  }

  .empty-desc {
    font-size: 12px;
    opacity: 0.8;
  }
</style>
