<template>
  <div class="oa-filters">
    <div class="oa-filters__primary">
      <div class="oa-filters__pair">
        <span class="oa-filters__label">应用</span>
        <ElSelect
          :model-value="appFilter"
          class="oa-filters__select"
          placeholder="全部"
          clearable
          filterable
          :loading="filterMetaLoading"
          @update:model-value="emit('update:appFilter', $event ?? '')"
        >
          <ElOption
            v-for="opt in appSelectOptions"
            :key="'app-' + (opt.value || 'all')"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
      <div class="oa-filters__pair">
        <span class="oa-filters__label">广告平台</span>
        <ElSelect
          :model-value="sourceFilter"
          class="oa-filters__select"
          placeholder="全部"
          clearable
          filterable
          :loading="filterMetaLoading"
          @update:model-value="emit('update:sourceFilter', $event ?? '')"
        >
          <ElOption
            v-for="opt in sourceSelectOptions"
            :key="'src-' + (opt.value || 'all')"
            :label="opt.label"
            :value="opt.value"
          />
        </ElSelect>
      </div>
    </div>

    <div class="oa-filters__group">
      <span class="oa-filters__label">开户状态</span>
      <ElSelect
        :model-value="statusFilter"
        class="oa-filters__select oa-filters__select--narrow"
        placeholder="全部"
        clearable
        @update:model-value="emit('update:statusFilter', $event ?? '')"
      >
        <ElOption
          v-for="s in statusOptions"
          :key="s.value || 'all'"
          :label="s.count !== undefined ? `${s.label} (${s.count})` : s.label"
          :value="s.value"
        />
      </ElSelect>
    </div>

    <div class="oa-filters__group">
      <span class="oa-filters__label">代理商</span>
      <ElSelect
        :model-value="agencyFilter"
        class="oa-filters__select oa-filters__select--narrow"
        placeholder="全部"
        clearable
        @update:model-value="emit('update:agencyFilter', $event ?? '')"
      >
        <ElOption label="全部" value="" />
        <ElOption v-for="a in agencyOptions" :key="a" :label="a" :value="a" />
      </ElSelect>
    </div>

    <div class="oa-filters__feishu">
      <span class="oa-filters__feishu-label">飞书推送</span>
      <span class="oa-filters__feishu-status">
        <span :class="['oa-filters__dot', { 'oa-filters__dot--on': feishuEnabled }]" />
        {{ feishuEnabled ? '已开启' : '未开启' }}
      </span>
      <button type="button" class="oa-filters__feishu-btn" @click="emit('openFeishu')">
        推送设置
        <svg viewBox="0 0 16 16" fill="none" width="13" height="13" aria-hidden="true">
          <circle cx="8" cy="8" r="2.5" stroke="currentColor" stroke-width="1.4" />
          <path
            d="M8 2v2M8 12v2M2 8h2M12 8h2M3.5 3.5l1.5 1.5M11 11l1.5 1.5M3.5 12.5L5 11M11 5l1.5-1.5"
            stroke="currentColor"
            stroke-width="1.3"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'

  defineOptions({ name: 'OpenAccountFiltersBar' })

  type StatusTab = {
    label: string
    value: string
    type: 'default' | 'warn' | 'ok' | 'fail'
    count?: number
  }

  defineProps<{
    sourceFilter: string
    appFilter: string
    statusFilter: string
    agencyFilter: string
    sourceSelectOptions: CockpitMetaOptionItem[]
    appSelectOptions: CockpitMetaOptionItem[]
    filterMetaLoading: boolean
    statusOptions: StatusTab[]
    agencyOptions: string[]
    feishuEnabled: boolean
  }>()

  const emit = defineEmits<{
    'update:sourceFilter': [v: string]
    'update:appFilter': [v: string]
    'update:statusFilter': [v: string]
    'update:agencyFilter': [v: string]
    openFeishu: []
  }>()
</script>

<style lang="scss" scoped>
  .oa-filters {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-5);
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
    box-shadow: var(--shadow-xs);
  }

  .oa-filters__primary {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-4);
    align-items: center;
  }

  .oa-filters__pair {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }

  .oa-filters__group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
  }

  .oa-filters__label {
    flex-shrink: 0;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .oa-filters__select {
    width: 168px;

    &--narrow {
      width: 140px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--default-border) !important;
      border-radius: 9999px;
      box-shadow: none !important;
      transition: border-color var(--duration-fast) var(--ease-default);

      &:focus-within {
        border-color: var(--art-primary) !important;
      }
    }

    :deep(.el-input__inner),
    :deep(.el-select__placeholder) {
      font-size: 12px;
      color: var(--text-primary);
    }
  }

  .oa-filters__feishu {
    display: flex;
    flex-shrink: 0;
    gap: var(--space-2);
    align-items: center;
    margin-left: auto;
  }

  .oa-filters__feishu-label {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .oa-filters__feishu-status {
    display: flex;
    gap: 5px;
    align-items: center;
    font-size: 13px;
    color: var(--art-success);
  }

  .oa-filters__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;

    &--on {
      background: var(--art-success);
      box-shadow: 0 0 6px var(--art-success);
    }
  }

  .oa-filters__feishu-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
    color: var(--text-tertiary);
    cursor: pointer;
    background: transparent;
    border: 1px solid var(--default-border);
    border-radius: 9999px;
    transition:
      color var(--duration-fast) var(--ease-default),
      border-color var(--duration-fast) var(--ease-default);

    &:hover {
      color: var(--text-secondary);
      border-color: rgb(255 255 255 / 14%);
    }
  }
</style>
