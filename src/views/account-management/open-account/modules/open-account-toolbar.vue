<template>
  <div class="oa-toolbar">
    <div class="oa-toolbar__actions">
      <ElButton round class="oa-toolbar__btn-add" @click="emit('new')">
        <ElIcon><Plus /></ElIcon>
        新建开户记录
      </ElButton>
      <ElButton round class="oa-toolbar__btn-secondary" @click="emit('export')">
        <ElIcon><Download /></ElIcon>
        导出
      </ElButton>
      <el-input
        :model-value="searchKeyword"
        placeholder="搜索开户记录..."
        class="oa-toolbar__search"
        clearable
        @update:model-value="emit('update:searchKeyword', $event)"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Plus, Download, Search } from '@element-plus/icons-vue'

  defineOptions({ name: 'OpenAccountToolbar' })

  defineProps<{ searchKeyword: string }>()

  const emit = defineEmits<{
    'update:searchKeyword': [v: string]
    new: []
    export: []
  }>()
</script>

<style lang="scss" scoped>
  .oa-toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: flex-end;
    padding: var(--space-5) 0 var(--space-4);
  }

  .oa-toolbar__actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .oa-toolbar__btn-add {
    padding: 8px 16px !important;
    font-weight: 600 !important;
    color: #fff !important;
    background: var(--art-success) !important;
    border: none !important;
    transition:
      color var(--duration-fast) var(--ease-default),
      filter var(--duration-fast) var(--ease-default),
      transform var(--duration-fast) var(--ease-default);

    &:hover {
      filter: brightness(1.08);
      transform: translateY(-1px);
    }
  }

  .oa-toolbar__btn-secondary {
    padding: 8px 14px !important;
    color: var(--text-secondary) !important;
    background: transparent !important;
    border: 1px solid var(--default-border) !important;
    transition:
      color var(--duration-fast) var(--ease-default),
      border-color var(--duration-fast) var(--ease-default);

    &:hover {
      color: var(--art-primary) !important;
      border-color: var(--art-primary) !important;
    }
  }

  .oa-toolbar__search {
    width: 220px;

    :deep(.el-input__wrapper) {
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid var(--default-border) !important;
      border-radius: var(--el-border-radius-round);
      box-shadow: none !important;

      &:hover,
      &:focus-within {
        border-color: var(--art-primary) !important;
      }
    }

    :deep(.el-input__inner) {
      font-size: 13px;
      color: var(--text-primary);

      &::placeholder {
        color: var(--text-tertiary);
      }
    }

    :deep(.el-input__prefix) {
      color: var(--text-tertiary);
    }
  }
</style>
