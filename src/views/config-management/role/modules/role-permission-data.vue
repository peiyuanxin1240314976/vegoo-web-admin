<!-- 权限配置 - 数据权限 Tab：数据访问范围配置 -->
<template>
  <div class="role-permission-data" v-loading="loading">
    <div class="data-config-header">
      <h3 class="data-config-title">数据访问范围配置</h3>
      <p class="data-config-desc">控制该角色可以查看的数据范围，未包含在范围内的数据将被自动过滤</p>
    </div>

    <ElScrollbar class="data-config-scroll">
      <div class="config-list">
        <div v-for="item in configItems" :key="item.key" class="config-item">
          <div class="config-item__label-wrap">
            <span class="config-item__label">{{ item.label }}</span>
            <span class="config-item__desc">{{ item.desc }}</span>
          </div>
          <div class="config-item__control">
            <ElSelect
              size="small"
              v-model="form[item.key]"
              class="config-select"
              placeholder="请选择"
              @change="updatePreview"
            >
              <ElOption
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
            <ElRadioGroup
              size="small"
              v-model="form[item.key]"
              class="config-radios"
              @change="updatePreview"
            >
              <ElRadio
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.value"
                class="config-radio"
              >
                {{ opt.label }}
              </ElRadio>
            </ElRadioGroup>
          </div>
        </div>
      </div>
    </ElScrollbar>

    <div class="preview-section">
      <h4 class="preview-title">权限预览效果</h4>
      <p class="preview-text">{{ previewText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchRolePermissionData,
    type RoleDataPermissionModule
  } from '@/api/config-management/role'

  defineOptions({ name: 'RolePermissionData' })

  type ScopeOption = {
    value: string
    label: string
  }

  type ConfigItem = {
    key: string
    label: string
    desc: string
    options: ScopeOption[]
  }

  const props = withDefaults(
    defineProps<{
      roleId?: number
      roleName?: string
      previewUserName?: string
    }>(),
    {
      roleName: '投放人员',
      previewUserName: '张三'
    }
  )

  const scopeOptions: ScopeOption[] = [
    { value: 'all', label: '全部数据' },
    { value: 'personal', label: '仅自己负责的' },
    { value: 'readonly', label: '只读模式' },
    { value: 'none', label: '不可访问' }
  ]

  const form = ref<Record<string, string>>({})
  const configItems = ref<ConfigItem[]>([])
  const loading = ref(false)
  const previewText = ref('')

  function getOptionLabel(value: string): string {
    return scopeOptions.find((option) => option.value === value)?.label ?? value
  }

  function updatePreview() {
    const segments = configItems.value.map((item) => {
      const currentValue = form.value[item.key] ?? 'none'
      return `${item.label}:${getOptionLabel(currentValue)}`
    })

    previewText.value = segments.length
      ? `${props.previewUserName}(${props.roleName}) 登录后将看到的数据范围为：${segments.join('；')}`
      : `${props.previewUserName}(${props.roleName}) 当前暂无可配置的数据权限模块。`
  }

  function applyDataModules(modules: RoleDataPermissionModule[]) {
    configItems.value = modules.map((module) => ({
      key: module.moduleId,
      label: module.moduleName,
      desc: `配置「${module.moduleName}」模块的数据访问范围`,
      options: scopeOptions
    }))

    form.value = modules.reduce<Record<string, string>>((acc, module) => {
      acc[module.moduleId] = module.dataScope
      return acc
    }, {})

    updatePreview()
  }

  async function loadData() {
    if (!props.roleId) {
      configItems.value = []
      form.value = {}
      updatePreview()
      return
    }

    loading.value = true
    try {
      const res = await fetchRolePermissionData({ roleId: props.roleId })
      applyDataModules(res.modules || [])
    } catch (error) {
      console.error('获取数据权限失败', error)
      configItems.value = []
      form.value = {}
      updatePreview()
    } finally {
      loading.value = false
    }
  }

  function reset() {
    loadData()
  }

  function getModuleDataScopes() {
    return configItems.value.map((item) => ({
      moduleId: item.key,
      dataScope: form.value[item.key] ?? 'none'
    }))
  }

  defineExpose({ reset, getModuleDataScopes })

  watch(
    () => props.roleId,
    () => {
      loadData()
    },
    { immediate: true }
  )

  watch(
    () => props.roleName,
    () => {
      updatePreview()
    }
  )
</script>

<style scoped lang="scss">
  .role-permission-data {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
    padding: 0 4px;
  }

  .data-config-header {
    flex-shrink: 0;
    padding: 14px 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .data-config-title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .data-config-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .data-config-scroll {
    flex: 1;
    min-height: 0;
    padding: 1px; /* 避免边框被裁切 */
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;

    :deep(.el-scrollbar__wrap) {
      padding: 16px;
    }
  }

  .config-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .config-item {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-item__label-wrap {
    flex-shrink: 0;
    width: 120px;
  }

  .config-item__label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .config-item__desc {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }

  .config-item__control {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .config-select {
    width: 100%;
    max-width: 280px;
  }

  .config-radios {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  .config-radio {
    margin-right: 0;

    :deep(.el-radio__label) {
      font-size: 13px;
    }
  }

  .preview-section {
    flex-shrink: 0;
    padding: 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .preview-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .preview-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }
</style>
