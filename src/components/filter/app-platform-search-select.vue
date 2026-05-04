<template>
  <ElPopover
    v-model:visible="visible"
    :width="panelWidth"
    :disabled="disabled"
    trigger="click"
    :placement="placement"
    :popper-class="popperClassName"
    :show-arrow="false"
    :teleported="true"
    :popper-options="mergedPopperOptions"
    @show="onShow"
    @hide="onHide"
  >
    <template #reference>
      <div
        class="app-platform-search-select"
        :class="[
          inputClass,
          { 'is-disabled': disabled, 'is-open': visible, 'is-auto-height': autoHeight }
        ]"
        :style="rootStyle"
      >
        <div
          v-if="isMultiAppDisplay"
          class="app-platform-search-select__value app-platform-search-select__value--multi"
        >
          <template v-if="multipleDisplay.type === 'empty'">
            <span class="app-platform-search-select__text is-placeholder">{{ placeholder }}</span>
          </template>
          <template v-else-if="multipleDisplay.type === 'single'">
            <span class="app-platform-search-select__text">{{ multipleDisplay.text }}</span>
          </template>
          <template v-else>
            <span
              v-for="t in multipleDisplay.texts"
              :key="`${t}-${multipleDisplay.texts.indexOf(t)}`"
              class="app-platform-search-select__tag"
              >{{ t }}</span
            >
            <ElTooltip
              v-if="multipleDisplay.more > 0"
              placement="top"
              effect="dark"
              :show-after="200"
              :content="allSelectedTipText"
              popper-class="app-platform-search-select__more-tip"
            >
              <span class="app-platform-search-select__more">+ {{ multipleDisplay.more }}</span>
            </ElTooltip>
          </template>
        </div>
        <span
          v-else
          class="app-platform-search-select__text"
          :class="{ 'is-placeholder': !selectedLabel }"
        >
          {{ selectedLabel || placeholder }}
        </span>
        <ElIcon class="app-platform-search-select__suffix">
          <ArrowDown />
        </ElIcon>
      </div>
    </template>

    <div class="app-platform-search-select__panel" :style="panelStyle">
      <ElInput
        v-model="keyword"
        clearable
        :placeholder="searchPlaceholder"
        class="app-platform-search-select__search"
      >
        <template #prefix>
          <ElIcon><Search /></ElIcon>
        </template>
      </ElInput>

      <div
        class="app-platform-search-select__header"
        :class="[`is-${mode}`, { 'is-multiple-app-header': isMultiAppMode }]"
      >
        <template v-if="mode !== 'platform'">
          <span>类别</span>
          <span>{{ mode === 'combined' ? '平台 / APP 名称' : 'APP 名称' }}</span>
          <span>平台</span>
          <span>简称</span>
          <span>商店ID</span>
          <span v-if="isMultiAppMode" aria-hidden="true"></span>
        </template>
        <template v-else>
          <span>平台</span>
        </template>
      </div>

      <div class="app-platform-search-select__body">
        <button
          v-if="showClearRow"
          type="button"
          class="app-platform-search-select__row app-platform-search-select__row--clear"
          @click="clearSelection"
        >
          <span>{{ clearRowLabel }}</span>
        </button>

        <button
          v-if="showSelectAllRow"
          type="button"
          class="app-platform-search-select__row app-platform-search-select__row--select-all"
          :class="{ 'is-active': isAllAppsSelected }"
          @click="toggleSelectAllApps"
        >
          <span>{{ selectAllLabel }}</span>
        </button>

        <button
          v-for="item in filteredOptions"
          :key="item.key"
          type="button"
          class="app-platform-search-select__row"
          :class="[
            `is-${mode}`,
            {
              'is-active': isRowActive(item),
              'is-multiple-app-row': showAppRowCheck(item)
            }
          ]"
          @click="selectItem(item)"
        >
          <template v-if="mode !== 'platform'">
            <span>{{ item.categoryName || '--' }}</span>
            <span>
              {{
                item.selectionType === 'platform' ? item.displayName || '--' : item.appName || '--'
              }}
            </span>
            <span>{{ item.platformName || '--' }}</span>
            <span>{{ item.shortName || '--' }}</span>
            <span>{{ item.storeId || '--' }}</span>
          </template>
          <template v-else>
            <span>{{ item.displayName || '--' }}</span>
          </template>
          <span
            v-if="showAppRowCheck(item)"
            class="app-platform-search-select__check"
            :class="{ 'is-on': isRowActive(item) }"
            aria-hidden="true"
          >
            <ElIcon v-if="isRowActive(item)">
              <Check />
            </ElIcon>
          </span>
        </button>

        <ElEmpty
          v-if="filteredOptions.length === 0"
          :image-size="56"
          description="暂无匹配项"
          class="app-platform-search-select__empty"
        />
      </div>
    </div>
  </ElPopover>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { ArrowDown, Check, Search } from '@element-plus/icons-vue'
  import type { CockpitMetaOptionItem, CockpitSettingAppItem } from '@/types/cockpit-meta-filter'

  type SelectMode = 'platform' | 'app' | 'combined'

  export interface AppPlatformSearchSelectPayload {
    mode: SelectMode
    selectionType: 'platform' | 'app'
    value: string
    appId: string
    appName: string
    appShortName: string
    platformCode: number | string
    platformName: string
    categoryId: number | string
    categoryName: string
    label: string
  }

  interface NormalizedOption {
    key: string
    modelValue: string
    value: string
    label: string
    displayName: string
    categoryName: string
    shortName: string
    storeId: string
    selectionType: 'platform' | 'app'
    appId: string
    appName: string
    appShortName: string
    platformCode: number | string
    platformName: string
    categoryId: number | string
    searchText: string
  }

  const props = withDefaults(
    defineProps<{
      /** 单选：string；多选（仅 mode=app）：string[] */
      modelValue?: string | string[]
      mode?: SelectMode
      /** 仅 mode=app 时有效：多选应用 ID */
      multiple?: boolean
      /** 仅 mode=app 时有效：强制单选（忽略路由默认多选规则） */
      forceSingle?: boolean
      placeholder?: string
      searchPlaceholder?: string
      /** 单选时「清空当前选择」行文案，默认「全部」 */
      allLabel?: string
      /** 多选应用时「清空为不限」行文案，默认「不限」 */
      emptySelectionLabel?: string
      /** 多选应用时「全选所有应用」行文案，默认「全部」 */
      selectAllLabel?: string
      /** 多选应用时，输入框最多展示多少个已选 tag；超出用 +N 汇总 */
      maxDisplayTags?: number
      /** 输入框高度是否跟随内容自动换行增高（多选展示多行 tag） */
      autoHeight?: boolean
      /** autoHeight 时最多展示多少行（超出可滚动）；默认 2 */
      autoMaxRows?: number
      /** 面板列表区最大高度（px），用于展示更多行 */
      panelBodyMaxHeight?: number
      /** 打开下拉时按视口可用空间自适应高度 */
      autoFitViewport?: boolean
      /** autoFitViewport 时：与视口边缘的安全留白（px） */
      viewportPadding?: number
      /** autoFitViewport 时：列表区最小高度（px） */
      minPanelBodyHeight?: number
      /** Popover 展开方向 */
      placement?: any
      /** 透传 Popper.js 配置（少数页面需要更强约束） */
      popperOptions?: Record<string, any>
      clearable?: boolean
      disabled?: boolean
      panelWidth?: number
      inputClass?: string
      dropdownClass?: string
      showPlatformSuffix?: boolean
      width?: number
      minWidth?: number
      maxWidth?: number
      height?: number
      radius?: number | string
      platformOptions?: CockpitMetaOptionItem[]
      settingApps?: CockpitSettingAppItem[]
    }>(),
    {
      modelValue: '',
      mode: 'app',
      multiple: false,
      forceSingle: false,
      placeholder: '请选择',
      searchPlaceholder: '搜索类别/应用名称/应用简称/商店ID',
      allLabel: '全部',
      emptySelectionLabel: '不限',
      selectAllLabel: '全部',
      maxDisplayTags: 1,
      autoHeight: false,
      autoMaxRows: 2,
      panelBodyMaxHeight: 320,
      autoFitViewport: true,
      viewportPadding: 12,
      minPanelBodyHeight: 160,
      placement: 'bottom-start',
      popperOptions: undefined,
      clearable: true,
      disabled: false,
      panelWidth: 680,
      inputClass: '',
      dropdownClass: '',
      showPlatformSuffix: true,
      width: undefined,
      minWidth: undefined,
      maxWidth: undefined,
      height: 32,
      radius: 'var(--el-border-radius-base, 4px)',
      platformOptions: () => [],
      settingApps: () => []
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [value: string | string[]]
    change: [payload: AppPlatformSearchSelectPayload | null]
  }>()

  const AUTO_SELECT_FIRST_APP_ROUTES = new Set([
    '/user-growth/account-performance',
    '/user-growth/ad-platform-analysis',
    '/user-growth/real-time-data',
    '/user-growth/ad-performance',
    '/user-growth/conversion-management',
    '/user-growth/agency-analysis',
    '/business-insight/agency-analysis',
    '/user-growth/paid-analysis',
    '/product-insight/business-report',
    '/business-insight/revenue-overview',
    '/business-insight/profit-analysis',
    '/business-insight/iap-analysis',
    '/business-insight/iaa-analysis',
    '/business-insight/ecpm-analysis',
    '/business-insight/revenue-deviation',
    '/user-growth/overall-recovery',
    '/user-growth/comprehensive-analysis',
    '/product-operations/reviews-ratings-monitor',
    '/product-operations/order-refund-analysis'
  ])

  const route = useRoute()
  const visible = ref(false)
  const keyword = ref('')
  const hasAutoAppliedInitialSelection = ref(false)
  const isTextManagementRoute = computed(() =>
    String(route.path ?? '').startsWith('/product-operations/text-management')
  )
  const isMultiAppMode = computed(() => {
    if (props.mode !== 'app') return false
    if (props.forceSingle) return false
    return props.multiple || !isTextManagementRoute.value
  })

  const rootStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {
      borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : String(props.radius)
    }

    if (!props.autoHeight) {
      style.height = `${props.height}px`
      style.minHeight = `${props.height}px`
    } else {
      style.minHeight = `${props.height}px`
      const rows = Math.max(1, Number(props.autoMaxRows ?? 2))
      style['--app-platform-select-max-rows'] = String(rows)
    }

    const minW = Number(props.minWidth)
    const maxW = Number(props.maxWidth)
    if (Number.isFinite(minW)) style.minWidth = `${Math.max(0, minW)}px`
    if (Number.isFinite(maxW)) style.maxWidth = `${Math.max(0, maxW)}px`
    if (props.width != null) style.width = `${props.width}px`
    return style
  })

  const popperClassName = computed(() =>
    ['app-platform-search-select__popper', props.dropdownClass].filter(Boolean).join(' ')
  )

  const mergedPopperOptions = computed(() => {
    const base = {
      strategy: 'fixed' as const,
      modifiers: [
        { name: 'offset', options: { offset: [0, 6] } },
        {
          name: 'flip',
          options: { fallbackPlacements: ['top-start', 'top-end', 'bottom-start', 'bottom-end'] }
        },
        { name: 'preventOverflow', options: { boundary: 'viewport', padding: 8 } },
        {
          name: 'applyViewportMaxHeight',
          enabled: Boolean(props.autoFitViewport),
          phase: 'write',
          fn: ({ state }: any) => {
            const popperEl = state?.elements?.popper as HTMLElement | undefined
            if (!popperEl) return

            const placement = String(state.placement ?? '')
            const refRect = state.rects?.reference
            if (!refRect) return

            const viewportH = window.innerHeight || 0
            const padding = Math.max(0, Number(props.viewportPadding ?? 12))
            const available = placement.startsWith('top')
              ? Math.max(0, refRect.top - padding)
              : Math.max(0, viewportH - refRect.bottom - padding)

            const panel = popperEl.querySelector(
              '.app-platform-search-select__panel'
            ) as HTMLElement | null
            const body = popperEl.querySelector(
              '.app-platform-search-select__body'
            ) as HTMLElement | null

            // 估算面板除列表区以外的“壳高度”（搜索框 + 表头 + padding）
            const chromeHeight =
              panel && body ? Math.max(0, panel.offsetHeight - body.offsetHeight) : 132

            const cap = Number(props.panelBodyMaxHeight)
            const maxBodyByCap = Number.isFinite(cap) ? Math.max(160, cap) : 320
            const minBody = Math.max(80, Number(props.minPanelBodyHeight ?? 160))
            const maxBodyByViewport = Math.max(minBody, available - chromeHeight)
            const nextBodyMaxRaw = Math.min(maxBodyByCap, maxBodyByViewport)
            const nextBodyMax = Number.isFinite(nextBodyMaxRaw) ? nextBodyMaxRaw : maxBodyByCap

            popperEl.style.maxHeight = `${Math.max(220, available)}px`
            popperEl.style.setProperty('--app-platform-select-body-max-height', `${nextBodyMax}px`)
          }
        }
      ]
    }
    return (props.popperOptions ? { ...base, ...props.popperOptions } : base) as any
  })

  const panelStyle = computed<Record<string, string>>(() => {
    const n = Number(props.panelBodyMaxHeight)
    return {
      '--app-platform-select-body-max-height': Number.isFinite(n)
        ? `${Math.max(160, n)}px`
        : '320px'
    }
  })

  const platformOptions = computed<NormalizedOption[]>(() =>
    (props.platformOptions ?? []).map((item) => {
      const label = String(item.label ?? '').trim()
      const value = String(item.value ?? '').trim()
      return {
        key: `platform__${value}`,
        modelValue: props.mode === 'combined' ? `platform::${value}` : value,
        value,
        label,
        displayName: label,
        categoryName: '平台',
        shortName: '',
        storeId: '',
        selectionType: 'platform',
        appId: '',
        appName: '',
        appShortName: '',
        platformCode: value,
        platformName: label,
        categoryId: '',
        searchText: [label, value].filter(Boolean).join(' ').toLowerCase()
      }
    })
  )

  const appOptions = computed<NormalizedOption[]>(() =>
    (props.settingApps ?? []).map((item) => {
      const appId = String(item.sAppId ?? '').trim()
      const storeId = String(item.sAppStoreId ?? '').trim()
      const appName = String(item.sAppName ?? '').trim()
      const appShortName = String(item.sAppShortName ?? '').trim()
      const platformName = String(item.platformName ?? '').trim()
      const platformValue = resolvePlatformValue(item.nPlatform, platformName)
      const categoryName = String(item.categoryName ?? '').trim()
      const displayName = appName

      return {
        key: `${appId}__${String(item.nPlatform ?? '')}`,
        modelValue:
          props.mode === 'combined'
            ? `app::${appId}::${platformValue || String(item.nPlatform ?? '')}`
            : appId,
        value: appId,
        label: appName || appId,
        displayName,
        categoryName,
        shortName: appShortName,
        storeId,
        selectionType: 'app',
        appId,
        appName,
        appShortName,
        platformCode: platformValue || item.nPlatform,
        platformName,
        categoryId: item.nCategory,
        searchText: [categoryName, appName, appShortName, platformName, appId, storeId]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
      }
    })
  )

  const options = computed(() => {
    if (props.mode === 'platform') return platformOptions.value
    if (props.mode === 'combined') return [...platformOptions.value, ...appOptions.value]
    return appOptions.value
  })

  const filteredOptions = computed(() => {
    const q = keyword.value.trim().toLowerCase()
    if (!q) return options.value.slice(0, 80)

    return [...options.value]
      .map((item) => ({ item, score: getMatchScore(item, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, 80)
  })

  const selectedIds = computed(() => {
    if (!isMultiAppMode.value) return new Set<string>()
    const v = props.modelValue
    const arr = Array.isArray(v) ? v : typeof v === 'string' && v.trim() ? [v] : []
    return new Set(arr.map((id) => String(id ?? '').trim()).filter(Boolean))
  })

  const selectedItem = computed(() => {
    if (isMultiAppMode.value) return null
    const mv = props.modelValue
    if (typeof mv !== 'string') return null
    return options.value.find((item) => item.modelValue === mv) ?? null
  })

  const hasSelection = computed(() => {
    if (isMultiAppMode.value) return selectedIds.value.size > 0
    return selectedItem.value !== null
  })

  const clearRowLabel = computed(() =>
    isMultiAppMode.value ? props.emptySelectionLabel : props.allLabel
  )
  const showClearRow = computed(() => {
    // 单选 app 模式不展示顶部“全部”行，避免与真实选项混淆
    const isSingleAppMode = props.mode === 'app' && !isMultiAppMode.value
    return props.clearable && hasSelection.value && !isMultiAppMode.value && !isSingleAppMode
  })

  const isMultiAppDisplay = computed(() => isMultiAppMode.value)

  /** 多选应用：来自 settingApps 的全部 appId（顺序与 appOptions 一致、去重） */
  const allAppIds = computed(() => {
    const out: string[] = []
    const seen = new Set<string>()
    for (const o of appOptions.value) {
      const id = String(o.appId ?? '').trim()
      if (!id || seen.has(id)) continue
      seen.add(id)
      out.push(id)
    }
    return out
  })

  const isAllAppsSelected = computed(() => {
    const all = allAppIds.value
    if (all.length === 0) return false
    if (selectedIds.value.size !== all.length) return false
    return all.every((id) => selectedIds.value.has(id))
  })

  const showSelectAllRow = computed(() => isMultiAppMode.value && allAppIds.value.length > 0)

  type MultiDisplay =
    | { type: 'empty' }
    | { type: 'single'; text: string }
    | { type: 'multi'; texts: string[]; more: number }

  const multipleDisplay = computed((): MultiDisplay => {
    if (!isMultiAppMode.value) return { type: 'empty' }
    const arr = Array.isArray(props.modelValue)
      ? props.modelValue
      : typeof props.modelValue === 'string' && props.modelValue.trim()
        ? [props.modelValue]
        : []
    const ids = arr.map((id) => String(id ?? '').trim()).filter(Boolean)
    const n = ids.length
    if (n === 0) return { type: 'empty' }
    if (n === 1) {
      const row = appOptions.value.find((o) => o.appId === ids[0])
      return { type: 'single', text: row?.displayName ?? ids[0] }
    }
    const maxTags = Math.max(1, Number(props.maxDisplayTags ?? 3))
    const displayIds = ids.slice(0, maxTags)
    const texts = displayIds.map((id) => {
      const row = appOptions.value.find((o) => o.appId === id)
      return row?.displayName ?? id
    })
    return { type: 'multi', texts, more: Math.max(0, n - texts.length) }
  })

  const allSelectedTipText = computed(() => {
    if (!isMultiAppMode.value) return ''
    const arr = Array.isArray(props.modelValue)
      ? props.modelValue
      : typeof props.modelValue === 'string' && props.modelValue.trim()
        ? [props.modelValue]
        : []
    const ids = arr.map((id) => String(id ?? '').trim()).filter(Boolean)
    const texts = ids.map((id) => {
      const row = appOptions.value.find((o) => o.appId === id)
      return row?.displayName ?? id
    })
    return texts.join('、')
  })

  const selectedLabel = computed(() => {
    if (isMultiAppMode.value) return ''
    return selectedItem.value?.displayName ?? ''
  })

  const shouldAutoSelectFirstApp = computed(
    () => props.mode === 'app' && AUTO_SELECT_FIRST_APP_ROUTES.has(String(route.path ?? ''))
  )

  function showAppRowCheck(item: NormalizedOption): boolean {
    return isMultiAppMode.value && item.selectionType === 'app'
  }

  function isRowActive(item: NormalizedOption): boolean {
    if (isMultiAppMode.value && item.selectionType === 'app') {
      if (isAllAppsSelected.value) return true
      return selectedIds.value.has(item.appId)
    }
    return item.modelValue === props.modelValue
  }

  function toggleSelectAllApps() {
    if (isAllAppsSelected.value) {
      emit('update:modelValue', [])
      emit('change', null)
    } else {
      emit('update:modelValue', [...allAppIds.value])
      emit('change', null)
    }
  }

  function getMatchScore(item: NormalizedOption, q: string): number {
    if (!q) return 1
    const appName = item.appName.toLowerCase()
    const shortName = item.appShortName.toLowerCase()
    const storeId = item.storeId.toLowerCase()
    const categoryName = item.categoryName.toLowerCase()
    const platformName = item.platformName.toLowerCase()
    const appId = item.appId.toLowerCase()

    if (
      appName === q ||
      shortName === q ||
      storeId === q ||
      categoryName === q ||
      platformName === q
    )
      return 120
    if (appName.startsWith(q) || shortName.startsWith(q) || storeId.startsWith(q)) return 90
    if (categoryName.startsWith(q) || platformName.startsWith(q)) return 70
    if (appId.startsWith(q)) return 60
    if (item.searchText.includes(q)) return 40
    return 0
  }

  function resolvePlatformValue(platformCode: number | string, platformName: string): string {
    const normalizedName = platformName.trim().toLowerCase()
    const matchByLabel = (props.platformOptions ?? []).find(
      (item) =>
        String(item.label ?? '')
          .trim()
          .toLowerCase() === normalizedName
    )
    if (matchByLabel) return String(itemValue(matchByLabel)).trim()

    const code = String(platformCode ?? '')
      .trim()
      .toLowerCase()
    if (['0', 'android'].includes(code) || normalizedName.includes('android')) return 'android'
    if (['1', 'ios'].includes(code) || normalizedName.includes('ios')) return 'ios'
    if (['2', 'web', 'h5'].includes(code) || normalizedName.includes('web')) return 'web'
    return code
  }

  function itemValue(item: CockpitMetaOptionItem): string {
    return String(item.value ?? '')
  }

  function onShow() {
    keyword.value = ''
  }

  function onHide() {
    keyword.value = ''
    visible.value = false
  }

  function clearSelection() {
    if (isMultiAppMode.value) {
      emit('update:modelValue', [])
    } else {
      emit('update:modelValue', '')
    }
    emit('change', null)
    visible.value = false
  }

  function toPayload(item: NormalizedOption): AppPlatformSearchSelectPayload {
    return {
      mode: props.mode,
      selectionType: item.selectionType,
      value: item.value,
      appId: item.appId,
      appName: item.appName,
      appShortName: item.appShortName,
      platformCode: item.platformCode,
      platformName: item.platformName,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      label: item.label
    }
  }

  function autoSelectFirstAppIfNeeded() {
    if (hasAutoAppliedInitialSelection.value) return
    if (!shouldAutoSelectFirstApp.value || props.disabled) return
    if (hasSelection.value) {
      hasAutoAppliedInitialSelection.value = true
      return
    }
    const firstApp = appOptions.value[0]
    if (!firstApp?.appId) return

    hasAutoAppliedInitialSelection.value = true
    emit('update:modelValue', isMultiAppMode.value ? [firstApp.appId] : firstApp.appId)
    emit('change', toPayload(firstApp))
  }

  function selectItem(item: NormalizedOption) {
    if (isMultiAppMode.value && item.selectionType === 'app') {
      const id = item.appId
      if (!id) return
      const next = new Set(selectedIds.value)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      emit('update:modelValue', [...next])
      emit('change', toPayload(item))
      return
    }

    emit('update:modelValue', item.modelValue)
    emit('change', toPayload(item))
    visible.value = false
  }

  watch(
    () => props.disabled,
    (next) => {
      if (next) visible.value = false
    }
  )

  watch(
    [shouldAutoSelectFirstApp, () => props.disabled, hasSelection, () => appOptions.value.length],
    () => {
      autoSelectFirstAppIfNeeded()
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .app-platform-search-select {
    box-sizing: border-box;
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 11px;
    cursor: pointer;
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 6%,
      transparent
    ) !important;
    border: 1px solid
      var(--app-platform-select-border-color, var(--theme-color, var(--art-primary, #3b82f6))) !important;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:hover,
    &.is-open {
      background: color-mix(
        in srgb,
        var(--theme-color, var(--art-primary, #3b82f6)) 1%,
        transparent
      );
      border-color: var(
        --app-platform-select-border-color-hover,
        var(--theme-color, var(--art-primary, #3b82f6))
      );
      box-shadow: 0 0 0 1px
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 18%, transparent);
    }

    &.is-disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    @media (width <= 768px) {
      min-width: 0 !important;
      max-width: 100% !important;
    }
  }

  .app-platform-search-select__value--multi {
    display: flex;
    flex: 1;
    flex-wrap: nowrap;
    gap: 6px;
    align-items: center;
    min-width: 0;
  }

  /* 多行展示：允许 tag 换行并限制最大行数 */
  .app-platform-search-select.is-auto-height .app-platform-search-select__value--multi {
    flex-wrap: wrap;
    row-gap: 6px;
    align-items: flex-start;
    max-height: calc(
      (var(--app-platform-select-max-rows, 2) * 20px) +
        ((var(--app-platform-select-max-rows, 2) - 1) * 6px)
    );
    padding: 6px 0;
    overflow: auto;
  }

  .app-platform-search-select__tag {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 220px;
    padding: 0 10px;
    overflow: hidden;
    font-size: 14px;
    line-height: 20px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
    background: color-mix(in srgb, var(--el-fill-color) 70%, transparent);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 9999px;
  }

  .app-platform-search-select__more {
    flex-shrink: 0;
    padding: 0 6px;
    font-size: 12px;
    line-height: 20px;
    color: var(--el-text-color-secondary);
    background: var(--el-fill-color);
    border-radius: 4px;
  }

  .app-platform-search-select__text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;

    &.is-placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  .app-platform-search-select__suffix {
    color: var(--theme-color, var(--art-primary, #3b82f6));
  }

  .app-platform-search-select__panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .app-platform-search-select__search {
    width: 100%;
  }

  .app-platform-search-select__header,
  .app-platform-search-select__row {
    display: grid;
    gap: 12px;
    align-items: center;
  }

  .app-platform-search-select__header {
    grid-template-columns: 90px minmax(0, 1fr) 76px 88px 120px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);

    span {
      display: block;
      justify-self: start;
      width: 100%;
      text-align: left;
    }

    &.is-platform {
      grid-template-columns: minmax(0, 1fr);
    }

    &.is-multiple-app-header {
      grid-template-columns: 90px minmax(0, 1fr) 76px 88px 120px 28px;
    }
  }

  .app-platform-search-select__body {
    display: flex;
    flex-direction: column;
    max-height: var(--app-platform-select-body-max-height, 320px);
    overflow: auto;
  }

  .app-platform-search-select__row {
    grid-template-columns: 90px minmax(0, 1fr) 76px 88px 120px;
    padding: 11px 8px;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: calc(var(--el-border-radius-base, 4px) + 2px);

    span:not(.app-platform-search-select__check) {
      display: block;
      justify-self: start;
      width: 100%;
      overflow: hidden;
      color: var(--el-text-color-primary);
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover,
    &.is-active {
      background: var(--el-fill-color-light);
    }

    &.is-platform {
      grid-template-columns: minmax(0, 1fr);
    }

    &.is-multiple-app-row {
      grid-template-columns: 90px minmax(0, 1fr) 76px 88px 120px 28px;
      align-items: center;
    }
  }

  .app-platform-search-select__check {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    place-self: center end;
    align-items: center;
    justify-content: center;
    width: 24px;
    max-width: 24px;
    height: 24px;
    line-height: 0;
    background: color-mix(in srgb, var(--el-fill-color-blank) 65%, var(--el-fill-color-light) 35%);
    border: 1px solid color-mix(in srgb, var(--el-border-color) 72%, transparent);
    border-radius: calc(var(--el-border-radius-base, 4px) + 2px);
    transition:
      color var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default),
      background-color var(--duration-fast) var(--ease-default),
      border-color var(--duration-fast) var(--ease-default),
      box-shadow var(--duration-fast) var(--ease-default);

    :deep(svg) {
      transform-origin: center;
    }

    &.is-on {
      font-size: 15px;
      color: var(--el-color-primary);
      background: linear-gradient(
        155deg,
        color-mix(in srgb, var(--el-color-primary) 28%, transparent) 0%,
        color-mix(in srgb, var(--el-color-primary) 11%, transparent) 100%
      );
      border-color: color-mix(in srgb, var(--el-color-primary) 42%, transparent);
      box-shadow:
        0 1px 2px color-mix(in srgb, var(--el-color-primary) 16%, transparent),
        inset 0 1px 0 color-mix(in srgb, #fff 28%, transparent);

      :deep(> *) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        margin: 0;
        line-height: 0;
      }

      :deep(svg) {
        display: block;
        width: 1em;
        height: 1em;
        filter: drop-shadow(
          0 0.5px 0.5px color-mix(in srgb, var(--el-color-primary) 22%, transparent)
        );
        transform: scale(1.14);
      }
    }
  }

  .app-platform-search-select__row--clear {
    display: flex;
    align-items: center;
    padding: 10px 8px;
    margin-bottom: 4px;
    color: var(--el-text-color-regular);
  }

  .app-platform-search-select__row--select-all {
    display: flex;
    align-items: center;
    padding: 10px 8px;
    margin-bottom: 4px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .app-platform-search-select__empty {
    padding: 12px 0 4px;
  }

  :global(.app-platform-search-select__popper.el-popper) {
    border: 1px solid
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 22%, transparent) !important;
    border-radius: 12px !important;
    box-shadow: 0 14px 40px rgb(15 23 42 / 12%) !important;
  }

  :global(.app-platform-search-select__popper .app-platform-search-select__panel) {
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, #fff 96%, var(--theme-color, var(--art-primary, #3b82f6)) 4%);
  }

  :global(.app-platform-search-select__popper .app-platform-search-select__header) {
    color: color-mix(in srgb, var(--el-text-color-secondary) 85%, #111827);
  }

  :global(.app-platform-search-select__popper .app-platform-search-select__row:hover),
  :global(.app-platform-search-select__popper .app-platform-search-select__row.is-active) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 10%,
      transparent
    );
  }

  :global(html.dark .app-platform-search-select__popper.el-popper) {
    border: 1px solid
      color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 22%, transparent) !important;
    border-radius: 12px !important;
    box-shadow:
      0 18px 52px rgb(0 0 0 / 58%),
      0 0 0 1px color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 12%, transparent),
      inset 0 1px 0
        color-mix(in srgb, var(--theme-color, var(--art-primary, #3b82f6)) 8%, transparent) !important;
  }

  :global(html.dark .app-platform-search-select__popper .app-platform-search-select__panel) {
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, var(--el-bg-color-overlay) 88%, transparent);
  }

  :global(html.dark .app-platform-search-select__popper .app-platform-search-select__header) {
    color: color-mix(in srgb, var(--el-text-color-regular) 78%, #fff);
  }

  :global(html.dark .app-platform-search-select__popper .app-platform-search-select__row:hover),
  :global(
    html.dark .app-platform-search-select__popper .app-platform-search-select__row.is-active
  ) {
    background: color-mix(
      in srgb,
      var(--theme-color, var(--art-primary, #3b82f6)) 14%,
      transparent
    );
  }

  :global(html.dark .app-platform-search-select__popper .app-platform-search-select__check) {
    background: color-mix(in srgb, var(--el-fill-color-dark) 35%, transparent);
    border-color: color-mix(in srgb, var(--el-border-color) 55%, transparent);
  }

  :global(html.dark .app-platform-search-select__popper .app-platform-search-select__check.is-on) {
    background: linear-gradient(
      155deg,
      color-mix(in srgb, var(--el-color-primary) 34%, transparent) 0%,
      color-mix(in srgb, var(--el-color-primary) 14%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--el-color-primary) 52%, transparent);
    box-shadow:
      0 1px 4px rgb(0 0 0 / 42%),
      inset 0 1px 0 color-mix(in srgb, #fff 9%, transparent);
  }

  :global(.app-platform-search-select__more-tip.el-popper) {
    max-width: 520px;
    word-break: break-word;
    white-space: normal;
  }
</style>
