<!-- 权限配置 - 功能权限 Tab 内容 -->
<template>
  <div class="role-permission-func flex flex-col" v-loading="loading">
    <ElScrollbar class="permission-scroll">
      <div v-for="module in permissionModules" :key="module.moduleId" class="module-card">
        <div class="module-card__head" @click="toggleModule(module.moduleId)">
          <span class="module-name">{{ module.moduleName }}</span>
          <ElSwitch v-model="module.enabled" size="small" @click.stop />
        </div>
        <div
          v-show="module.enabled && expandedModules.includes(module.moduleId)"
          class="module-card__body"
        >
          <div v-for="perm in module.permissions" :key="perm.permissionId" class="perm-row">
            <span class="perm-name">{{ perm.permissionName }}</span>
            <span class="perm-view">{{ perm.type === 'view' ? perm.statusText : '—' }}</span>
            <span class="perm-op">{{ perm.type === 'operation' ? perm.statusText : '—' }}</span>
            <span class="perm-scope">—</span>
          </div>
        </div>
        <div
          v-if="module.enabled && !expandedModules.includes(module.moduleId)"
          class="module-card__summary"
          @click="toggleModule(module.moduleId)"
        >
          已配置功能权限点: {{ module.permissions.filter((p: any) => p.checked).length }} 项
        </div>
      </div>
    </ElScrollbar>
    <div class="panel-actions">
      <ElButton link type="primary" @click="$emit('compare')">对比其他角色</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { fetchRolePermissionFunc } from '@/api/config-management/role'
  import { watch, ref } from 'vue'

  defineOptions({ name: 'RolePermissionFunc' })

  const props = defineProps<{
    roleId?: number
  }>()

  defineEmits<{
    (e: 'compare'): void
  }>()

  const expandedModules = ref<string[]>([])
  const permissionModules = ref<any[]>([])
  const loading = ref(false)

  async function loadData() {
    if (!props.roleId) {
      permissionModules.value = []
      return
    }
    loading.value = true
    try {
      const res = await fetchRolePermissionFunc({ roleId: props.roleId })
      permissionModules.value = res.data?.modules || []
      // 默认展开有权限的前几个模块（简化处理）
      expandedModules.value = permissionModules.value.slice(0, 2).map((m: any) => m.moduleId)
    } catch (error) {
      console.error('获取功能权限失败', error)
    } finally {
      loading.value = false
    }
  }

  watch(
    () => props.roleId,
    () => {
      loadData()
    },
    { immediate: true }
  )

  function reset() {
    loadData()
  }

  defineExpose({ reset })

  function toggleModule(key: string) {
    const idx = expandedModules.value.indexOf(key)
    if (idx >= 0) {
      expandedModules.value = expandedModules.value.filter((k) => k !== key)
    } else {
      expandedModules.value = [...expandedModules.value, key]
    }
  }
</script>

<style scoped lang="scss">
  .role-permission-func {
    height: 100%;
    min-height: 0;
  }

  .permission-scroll {
    flex: 1;
    min-height: 0;
    margin-bottom: 12px;
  }

  .module-card {
    margin-bottom: 12px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .module-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--el-fill-color-light);
  }

  .module-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .module-card__body {
    padding: 12px 16px;
    font-size: 13px;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .perm-row {
    display: grid;
    grid-template-columns: 1fr 80px 80px 120px;
    gap: 12px;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid var(--el-border-color-extra-light);

    &:last-child {
      border-bottom: none;
    }
  }

  .perm-name {
    color: var(--el-text-color-primary);
  }

  .perm-view,
  .perm-op,
  .perm-scope {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .module-card__summary {
    padding: 8px 16px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .panel-actions {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
  }
</style>
