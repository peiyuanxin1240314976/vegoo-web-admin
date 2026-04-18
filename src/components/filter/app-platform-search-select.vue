<template>
  <ElPopover
    v-model:visible="visible"
    :width="panelWidth"
    :disabled="disabled"
    trigger="click"
    placement="bottom-start"
    :popper-class="popperClassName"
    :show-arrow="false"
    @show="onShow"
    @hide="onHide"
  >
    <template #reference>
      <div
        class="app-platform-search-select"
        :class="[inputClass, { 'is-disabled': disabled, 'is-open': visible }]"
        :style="rootStyle"
      >
        <span
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

    <div class="app-platform-search-select__panel">
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

      <div class="app-platform-search-select__header" :class="`is-${mode}`">
        <template v-if="mode !== 'platform'">
          <span>类别</span>
          <span>{{ mode === 'combined' ? '平台 / APP' : 'APP 名称' }}</span>
          <span>简称</span>
        </template>
        <template v-else>
          <span>平台</span>
        </template>
      </div>

      <div class="app-platform-search-select__body">
        <button
          v-if="clearable && hasSelection"
          type="button"
          class="app-platform-search-select__row app-platform-search-select__row--clear"
          @click="clearSelection"
        >
          <span>{{ allLabel }}</span>
        </button>

        <button
          v-for="item in filteredOptions"
          :key="item.key"
          type="button"
          class="app-platform-search-select__row"
          :class="[`is-${mode}`, { 'is-active': isRowActive(item) }]"
          @click="selectItem(item)"
        >
          <template v-if="mode !== 'platform'">
            <span>{{ item.categoryName || '--' }}</span>
            <span>{{ item.displayName || '--' }}</span>
            <span>{{ item.shortName || '--' }}</span>
          </template>
          <template v-else>
            <span>{{ item.displayName || '--' }}</span>
          </template>
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
  import { ArrowDown, Search } from '@element-plus/icons-vue'
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
      placeholder?: string
      searchPlaceholder?: string
      allLabel?: string
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
      placeholder: '请选择',
      searchPlaceholder: '搜索类别/应用名称/应用简称',
      allLabel: '全部',
      clearable: true,
      disabled: false,
      panelWidth: 560,
      inputClass: '',
      dropdownClass: '',
      showPlatformSuffix: true,
      width: undefined,
      minWidth: 200,
      maxWidth: 240,
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

  const visible = ref(false)
  const keyword = ref('')

  const rootStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {
      minHeight: `${props.height}px`,
      minWidth: `${props.minWidth}px`,
      maxWidth: `${props.maxWidth}px`,
      borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : String(props.radius)
    }
    if (props.width != null) style.width = `${props.width}px`
    return style
  })

  const popperClassName = computed(() =>
    ['app-platform-search-select__popper', props.dropdownClass].filter(Boolean).join(' ')
  )

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
      const appName = String(item.sAppName ?? '').trim()
      const appShortName = String(item.sAppShortName ?? '').trim()
      const platformName = String(item.platformName ?? '').trim()
      const platformValue = resolvePlatformValue(item.nPlatform, platformName)
      const categoryName = String(item.categoryName ?? '').trim()
      const displayName =
        props.showPlatformSuffix && platformName ? `${appName} (${platformName})` : appName

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
        selectionType: 'app',
        appId,
        appName,
        appShortName,
        platformCode: platformValue || item.nPlatform,
        platformName,
        categoryId: item.nCategory,
        searchText: [categoryName, appName, appShortName, platformName, appId]
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
    if (!props.multiple) return new Set<string>()
    const v = props.modelValue
    const arr = Array.isArray(v) ? v : []
    return new Set(arr.map((id) => String(id ?? '').trim()).filter(Boolean))
  })

  const selectedItem = computed(() => {
    if (props.multiple) return null
    const mv = props.modelValue
    if (typeof mv !== 'string') return null
    return options.value.find((item) => item.modelValue === mv) ?? null
  })

  const hasSelection = computed(() => {
    if (props.multiple) return selectedIds.value.size > 0
    return Boolean(typeof props.modelValue === 'string' && props.modelValue.trim())
  })

  const selectedLabel = computed(() => {
    if (props.multiple && props.mode === 'app') {
      const n = selectedIds.value.size
      if (n === 0) return ''
      if (n === 1) {
        const id = [...selectedIds.value][0]
        const row = appOptions.value.find((o) => o.appId === id)
        return row?.displayName ?? id
      }
      return `已选 ${n} 个应用`
    }
    return selectedItem.value?.displayName ?? ''
  })

  function isRowActive(item: NormalizedOption): boolean {
    if (props.multiple && props.mode === 'app' && item.selectionType === 'app') {
      return selectedIds.value.has(item.appId)
    }
    return item.modelValue === props.modelValue
  }

  function getMatchScore(item: NormalizedOption, q: string): number {
    if (!q) return 1
    const appName = item.appName.toLowerCase()
    const shortName = item.appShortName.toLowerCase()
    const categoryName = item.categoryName.toLowerCase()
    const platformName = item.platformName.toLowerCase()
    const appId = item.appId.toLowerCase()

    if (appName === q || shortName === q || categoryName === q || platformName === q) return 120
    if (appName.startsWith(q) || shortName.startsWith(q)) return 90
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
    if (props.multiple) {
      emit('update:modelValue', [])
    } else {
      emit('update:modelValue', '')
    }
    emit('change', null)
    visible.value = false
  }

  function selectItem(item: NormalizedOption) {
    if (props.multiple && props.mode === 'app' && item.selectionType === 'app') {
      const id = item.appId
      if (!id) return
      const next = new Set(selectedIds.value)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      emit('update:modelValue', [...next])
      emit('change', {
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
      })
      return
    }

    emit('update:modelValue', item.modelValue)
    emit('change', {
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
    })
    visible.value = false
  }

  watch(
    () => props.disabled,
    (next) => {
      if (next) visible.value = false
    }
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
    border: 1px solid var(--theme-color, var(--art-primary, #3b82f6));
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
      border-color: var(--theme-color, var(--art-primary, #3b82f6));
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
    grid-template-columns: 110px minmax(0, 1fr) 88px;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);

    &.is-platform {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .app-platform-search-select__body {
    display: flex;
    flex-direction: column;
    max-height: 320px;
    overflow: auto;
  }

  .app-platform-search-select__row {
    grid-template-columns: 110px minmax(0, 1fr) 88px;
    padding: 11px 8px;
    text-align: left;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: calc(var(--el-border-radius-base, 4px) + 2px);

    span {
      overflow: hidden;
      color: var(--el-text-color-primary);
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
  }

  .app-platform-search-select__row--clear {
    display: flex;
    align-items: center;
    padding: 10px 8px;
    margin-bottom: 4px;
    color: var(--el-text-color-regular);
  }

  .app-platform-search-select__empty {
    padding: 12px 0 4px;
  }
</style>
