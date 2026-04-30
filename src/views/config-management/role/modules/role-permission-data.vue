<template>
  <div class="role-permission-date flex h-full min-h-0 flex-col" v-loading="loading">
    <div class="date-card">
      <h3 class="date-card__title">全局默认日期规则</h3>
      <p class="date-card__desc">未单独覆盖的页面，都会使用这里的日期权限。</p>

      <div class="date-grid">
        <div class="date-field">
          <span class="date-field__label">最大可回看天数</span>
          <ElSelect v-model="form.defaultDateScope.maxHistoryDays" class="date-field__control">
            <ElOption
              v-for="option in historyDayOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </div>

        <div class="date-field">
          <span class="date-field__label">默认展示范围</span>
          <ElSelect v-model="form.defaultDateScope.defaultRangeDays" class="date-field__control">
            <ElOption
              v-for="option in defaultRangeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
        </div>

        <div class="date-field">
          <span class="date-field__label">允许自定义日期</span>
          <ElSwitch v-model="form.defaultDateScope.allowCustomRange" />
        </div>
      </div>
    </div>

    <div class="override-header">
      <div>
        <h3 class="override-header__title">页面覆盖规则</h3>
        <p class="override-header__desc">只给特殊页面额外限制，避免角色配置过度复杂。</p>
      </div>
      <ElButton type="primary" round @click="addOverride">新增页面覆盖</ElButton>
    </div>

    <ElScrollbar class="override-scroll">
      <div v-if="form.pageDateScopes.length" class="override-list">
        <div
          v-for="(item, index) in form.pageDateScopes"
          :key="`${item.pageKey}-${index}`"
          class="override-item"
        >
          <div class="override-item__top">
            <ElSelect v-model="item.pageKey" class="override-item__page" placeholder="请选择页面">
              <ElOption
                v-for="option in pageOptions"
                :key="option.pageKey"
                :label="resolvePageName(option.pageName)"
                :value="option.pageKey"
                :disabled="isPageOptionDisabled(option.pageKey, index)"
              />
            </ElSelect>
            <ElButton text type="danger" @click="removeOverride(index)">删除</ElButton>
          </div>

          <div class="date-grid">
            <div class="date-field">
              <span class="date-field__label">最大可回看天数</span>
              <ElSelect v-model="item.maxHistoryDays" class="date-field__control">
                <ElOption
                  v-for="option in historyDayOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </div>

            <div class="date-field">
              <span class="date-field__label">默认展示范围</span>
              <ElSelect v-model="item.defaultRangeDays" class="date-field__control">
                <ElOption
                  v-for="option in defaultRangeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </ElSelect>
            </div>

            <div class="date-field">
              <span class="date-field__label">允许自定义日期</span>
              <ElSwitch v-model="item.allowCustomRange" />
            </div>
          </div>
        </div>
      </div>

      <ElEmpty v-else description="当前角色还没有页面覆盖规则，默认只使用全局规则。" />
    </ElScrollbar>

    <div class="preview-card">
      <h4 class="preview-card__title">权限预览</h4>
      <p class="preview-card__text">{{ previewText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import {
    fetchRolePermissionDate,
    type RoleDatePermissionResponse
  } from '@/api/config-management/role'

  defineOptions({ name: 'RolePermissionDate' })

  const props = defineProps<{
    roleId?: number
  }>()

  const { t } = useI18n()

  const loading = ref(false)
  const pageOptions = ref<RoleDatePermissionResponse['pageOptions']>([])
  const form = reactive<{
    defaultDateScope: RoleDatePermissionResponse['defaultDateScope']
    pageDateScopes: RoleDatePermissionResponse['pageDateScopes']
  }>({
    defaultDateScope: {
      maxHistoryDays: 30,
      defaultRangeDays: 7,
      allowCustomRange: true
    },
    pageDateScopes: []
  })

  const historyDayOptions = [
    { label: '不限', value: -1 },
    { label: '近 3 天', value: 3 },
    { label: '近 7 天', value: 7 },
    { label: '近 15 天', value: 15 },
    { label: '近 30 天', value: 30 },
    { label: '近 60 天', value: 60 },
    { label: '近 90 天', value: 90 },
    { label: '近 180 天', value: 180 },
    { label: '近 365 天', value: 365 }
  ]

  const defaultRangeOptions = [
    { label: '1 天', value: 1 },
    { label: '3 天', value: 3 },
    { label: '7 天', value: 7 },
    { label: '15 天', value: 15 },
    { label: '30 天', value: 30 }
  ]

  const previewText = computed(() => {
    const globalText = [
      `默认最多查看${formatHistoryDays(form.defaultDateScope.maxHistoryDays)}`,
      `默认展示${form.defaultDateScope.defaultRangeDays}天`,
      form.defaultDateScope.allowCustomRange ? '允许自定义日期' : '不允许自定义日期'
    ].join('，')

    if (!form.pageDateScopes.length) {
      return `当前角色采用统一日期规则：${globalText}。`
    }

    const overrideText = form.pageDateScopes
      .map((item) => {
        const pageName =
          pageOptions.value.find((option) => option.pageKey === item.pageKey)?.pageName ??
          item.pageKey
        return `${resolvePageName(pageName)}(${formatHistoryDays(item.maxHistoryDays)})`
      })
      .join('、')

    return `当前角色默认规则为：${globalText}；单独覆盖页面：${overrideText}。`
  })

  function resolvePageName(pageName: string): string {
    return pageName.startsWith('menus.') ? t(pageName) : pageName
  }

  function formatHistoryDays(value: number): string {
    return value === -1 ? '不限' : `近${value}天`
  }

  async function loadData() {
    if (!props.roleId) {
      pageOptions.value = []
      resetForm()
      return
    }

    loading.value = true
    try {
      const res = await fetchRolePermissionDate({ roleId: props.roleId })
      pageOptions.value = res.pageOptions || []
      form.defaultDateScope = { ...res.defaultDateScope }
      form.pageDateScopes = (res.pageDateScopes || []).map((item) => ({ ...item }))
    } catch (error) {
      console.error('获取日期权限失败', error)
      pageOptions.value = []
      resetForm()
    } finally {
      loading.value = false
    }
  }

  function resetForm() {
    form.defaultDateScope = {
      maxHistoryDays: 30,
      defaultRangeDays: 7,
      allowCustomRange: true
    }
    form.pageDateScopes = []
  }

  function addOverride() {
    const nextOption = pageOptions.value.find(
      (option) => !form.pageDateScopes.some((item) => item.pageKey === option.pageKey)
    )
    form.pageDateScopes.push({
      pageKey: nextOption?.pageKey ?? '',
      maxHistoryDays: form.defaultDateScope.maxHistoryDays,
      defaultRangeDays: form.defaultDateScope.defaultRangeDays,
      allowCustomRange: form.defaultDateScope.allowCustomRange
    })
  }

  function removeOverride(index: number) {
    form.pageDateScopes.splice(index, 1)
  }

  function isPageOptionDisabled(pageKey: string, currentIndex: number): boolean {
    return form.pageDateScopes.some(
      (item, index) => index !== currentIndex && item.pageKey === pageKey
    )
  }

  function getDatePermissionPayload() {
    return {
      defaultDateScope: { ...form.defaultDateScope },
      pageDateScopes: form.pageDateScopes
        .filter((item) => item.pageKey)
        .map((item) => ({
          pageKey: item.pageKey,
          maxHistoryDays: item.maxHistoryDays,
          defaultRangeDays: item.defaultRangeDays,
          allowCustomRange: item.allowCustomRange
        }))
    }
  }

  function reset() {
    loadData()
  }

  defineExpose({
    reset,
    getDatePermissionPayload
  })

  watch(
    () => props.roleId,
    () => {
      loadData()
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .role-permission-date {
    gap: 12px;
  }

  .date-card,
  .preview-card {
    padding: 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .date-card__title,
  .preview-card__title,
  .override-header__title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .date-card__desc,
  .override-header__desc,
  .preview-card__text {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  .date-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .date-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .date-field__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .date-field__control {
    width: 100%;
  }

  .override-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .override-scroll {
    flex: 1;
    min-height: 0;
    padding: 1px;
    border: 1px solid var(--el-border-color);
    border-radius: 8px;

    :deep(.el-scrollbar__wrap) {
      padding: 12px;
    }
  }

  .override-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .override-item {
    padding: 16px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
  }

  .override-item__top {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .override-item__page {
    width: 280px;
    max-width: 100%;
  }

  @media (width <= 900px) {
    .date-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
