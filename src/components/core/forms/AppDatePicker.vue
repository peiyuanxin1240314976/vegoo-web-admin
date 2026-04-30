<!-- 单根透明封装 Element Plus 日期选择：统一样式入口 + 可选按 permissionConfig.datePermissions 限制可选区间与快捷项 -->
<template>
  <ElDatePicker v-model="model" v-bind="pickerProps">
    <template v-for="(_slot, slotName) in $slots" :key="String(slotName)" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps ?? {}" />
    </template>
  </ElDatePicker>
</template>

<script setup lang="ts">
  import { computed, useAttrs } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElDatePicker } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { getAppNow } from '@/utils/app-now'
  import { dateRangeShortcuts } from '@/utils/form/date-shortcuts'
  import {
    resolveEffectiveDateScope,
    buildPermissionDisabledDate,
    filterDateRangeShortcutsForScope,
    ensureRangeShortcutsForStrictMode,
    type DateShortcutItem
  } from '@/utils/permission/resolve-date-permission-for-picker'

  defineOptions({ name: 'AppDatePicker', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      /** 与角色管理「页面覆盖」的 pageKey 一致；不传则用当前路由 name 参与 pageDateScopes 匹配 */
      permissionPageKey?: string
      /**
       * 是否应用 `userInfo.permissionConfig.datePermissions`。
       * 为 false 时等价于纯透传（如系统配置类页面）。
       * `/config-management` 下路由默认不应用，避免管理端选日期被业务数据权限误伤。
       */
      applyDatePermission?: boolean
    }>(),
    { applyDatePermission: true }
  )

  const model = defineModel<any>()
  const attrs = useAttrs()
  const route = useRoute()
  const userStore = useUserStore()

  const shouldApplyDatePermission = computed(() => {
    if (props.applyDatePermission === false) return false
    if (route.meta?.skipDatePermission === true) return false
    if (route.path.startsWith('/config-management')) return false
    return true
  })

  const effectivePageKey = computed(() => {
    if (props.permissionPageKey != null && props.permissionPageKey !== '') {
      return props.permissionPageKey
    }
    return route.name ? String(route.name) : ''
  })

  const datePermissionScope = computed(() =>
    resolveEffectiveDateScope(userStore.info, effectivePageKey.value, {
      apply: shouldApplyDatePermission.value
    })
  )

  /**
   * 透传 attrs，去掉与 defineModel 重复的键；
   * daterange/datetimerange 默认 shortcuts 与 art-form 原逻辑一致，并结合日期权限过滤。
   */
  const pickerProps = computed(() => {
    const rawDisabled =
      typeof attrs.disabledDate === 'function'
        ? (attrs.disabledDate as (d: Date) => boolean)
        : undefined

    const a = { ...attrs } as Record<string, unknown>
    delete a.modelValue
    delete a['onUpdate:modelValue']

    const type = a.type
    const scope = datePermissionScope.value
    const now = getAppNow()

    if (scope) {
      a.disabledDate = buildPermissionDisabledDate(scope, now, rawDisabled)
      if (scope.allowCustomRange === false && !('editable' in attrs)) {
        a.editable = false
      }
    } else if (rawDisabled) {
      a.disabledDate = rawDisabled
    }

    const isRangeType = type === 'daterange' || type === 'datetimerange'
    const baseShortcuts = dateRangeShortcuts as unknown as DateShortcutItem[]

    if (isRangeType) {
      const hasExplicitShortcuts = 'shortcuts' in attrs && attrs.shortcuts !== undefined
      if (hasExplicitShortcuts && Array.isArray(attrs.shortcuts)) {
        if (scope) {
          a.shortcuts = ensureRangeShortcutsForStrictMode(
            filterDateRangeShortcutsForScope(attrs.shortcuts as DateShortcutItem[], scope, now),
            scope,
            now
          )
        }
      } else if (!hasExplicitShortcuts) {
        if (scope) {
          a.shortcuts = ensureRangeShortcutsForStrictMode(
            filterDateRangeShortcutsForScope(baseShortcuts, scope, now),
            scope,
            now
          )
        } else {
          a.shortcuts = baseShortcuts
        }
      }
    }

    return a
  })
</script>
