<template>
  <div class="subject-toolbar">
    <div class="subject-toolbar__group subject-toolbar__group--filters">
      <el-input
        :model-value="keyword"
        placeholder="搜索主体名称 / 主体 ID"
        clearable
        class="subject-toolbar__search"
        @update:model-value="emit('update:keyword', $event)"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
        :model-value="platformFilter"
        class="subject-toolbar__select"
        @update:model-value="emit('update:platformFilter', $event)"
      >
        <el-option
          v-for="item in platformStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-select
        :model-value="licenseFilter"
        class="subject-toolbar__select"
        @update:model-value="emit('update:licenseFilter', $event)"
      >
        <el-option
          v-for="item in licenseStatusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>

      <el-select
        :model-value="sortOrder"
        class="subject-toolbar__select"
        @update:model-value="emit('update:sortOrder', $event)"
      >
        <el-option
          v-for="item in sortOrderOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <el-button class="subject-toolbar__create" round @click="emit('create')">
      <el-icon><Plus /></el-icon>
      新建主体
    </el-button>
  </div>
</template>

<script setup lang="ts">
  import { Plus, Search } from '@element-plus/icons-vue'
  import type { SubjectSettingOptionItem } from '../types'

  defineOptions({ name: 'SubjectSettingToolbar' })

  defineProps<{
    keyword: string
    platformFilter: 'all' | 'facebook' | 'tiktok' | 'both' | 'none'
    platformStatusOptions: SubjectSettingOptionItem[]
    licenseStatusOptions: SubjectSettingOptionItem[]
    sortOrderOptions: SubjectSettingOptionItem[]
    licenseFilter: 'all' | 'yes' | 'no'
    sortOrder: 'updated_desc' | 'updated_asc'
  }>()

  const emit = defineEmits<{
    'update:keyword': [value: string]
    'update:platformFilter': [value: 'all' | 'facebook' | 'tiktok' | 'both' | 'none']
    'update:licenseFilter': [value: 'all' | 'yes' | 'no']
    'update:sortOrder': [value: 'updated_desc' | 'updated_asc']
    create: []
  }>()
</script>

<style lang="scss" scoped>
  .subject-toolbar {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .subject-toolbar__group {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .subject-toolbar__group--filters {
    flex: 1;
    flex-wrap: wrap;
  }

  .subject-toolbar__search {
    width: 280px;
  }

  .subject-toolbar__select {
    width: 160px;
  }

  .subject-toolbar__create {
    padding-inline: 18px !important;
    font-weight: 600 !important;
    color: color-mix(in srgb, var(--theme-color) 92%, white 8%) !important;
    background: color-mix(in srgb, var(--theme-color) 14%, transparent) !important;
    border: 1px solid color-mix(in srgb, var(--theme-color) 36%, transparent) !important;
    box-shadow:
      0 12px 24px rgb(0 0 0 / 20%),
      0 0 0 1px color-mix(in srgb, var(--theme-color) 14%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--theme-color) 18%, transparent) !important;
      border-color: color-mix(in srgb, var(--theme-color) 50%, transparent) !important;
      box-shadow:
        0 16px 30px rgb(0 0 0 / 26%),
        0 0 0 1px color-mix(in srgb, var(--theme-color) 20%, transparent),
        0 0 34px color-mix(in srgb, var(--theme-color) 14%, transparent);
    }
  }

  .subject-toolbar :deep(.el-input__wrapper),
  .subject-toolbar :deep(.el-select__wrapper) {
    color: var(--text-primary);
    background: color-mix(in srgb, var(--default-bg-color) 24%, transparent);
    border-radius: 14px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--art-primary) 14%, transparent) inset,
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .subject-toolbar :deep(.el-input__wrapper.is-focus),
  .subject-toolbar :deep(.el-select__wrapper.is-focused) {
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--theme-color) 34%, transparent) inset,
      0 0 0 4px color-mix(in srgb, var(--theme-color) 10%, transparent);
  }

  .subject-toolbar :deep(.el-input__inner),
  .subject-toolbar :deep(.el-select__selected-item),
  .subject-toolbar :deep(.el-input__prefix),
  .subject-toolbar :deep(.el-select__placeholder) {
    color: var(--text-primary);
  }

  .subject-toolbar :deep(.el-input__inner::placeholder) {
    color: var(--text-tertiary);
  }

  @media (width <= 900px) {
    .subject-toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .subject-toolbar__search,
    .subject-toolbar__select {
      width: 100%;
    }
  }
</style>
