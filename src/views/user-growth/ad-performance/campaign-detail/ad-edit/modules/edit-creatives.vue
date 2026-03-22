<template>
  <ElCard class="ecr" shadow="never">
    <template #header>
      <span class="ecr__title">素材选择</span>
    </template>
    <div class="ecr__body">
      <!-- 搜索框 -->
      <ElInput v-model="search" placeholder="搜索素材..." clearable class="ecr__search">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </ElInput>

      <!-- 素材缩略图网格 -->
      <div class="ecr__grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="ecr__thumb-wrap"
          :class="{ 'ecr__thumb-wrap--selected': creatives.selectedIds.includes(item.id) }"
          @click="toggleSelect(item.id)"
        >
          <img :src="item.thumb" :alt="item.name" class="ecr__thumb" />
          <div class="ecr__check">
            <el-icon v-if="creatives.selectedIds.includes(item.id)" class="ecr__check-icon">
              <Check />
            </el-icon>
          </div>
          <div class="ecr__thumb-name">{{ item.name }}</div>
        </div>
      </div>

      <!-- 从素材库选择 -->
      <ElButton round class="ecr__lib-btn">
        <el-icon><FolderOpened /></el-icon>
        从素材库选择
      </ElButton>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Search, Check, FolderOpened } from '@element-plus/icons-vue'
  import type { AdEditCreatives } from '../types'

  defineOptions({ name: 'EditCreatives' })

  const creatives = defineModel<AdEditCreatives>({ required: true })
  const search = ref('')

  const filteredItems = computed(() =>
    creatives.value.items.filter((i) => i.name.toLowerCase().includes(search.value.toLowerCase()))
  )

  function toggleSelect(id: string) {
    const ids = creatives.value.selectedIds
    const i = ids.indexOf(id)
    if (i >= 0) ids.splice(i, 1)
    else ids.push(id)
  }
</script>

<style scoped lang="scss">
  .ecr {
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .ecr__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .ecr__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ecr__search {
    :deep(.el-input__wrapper) {
      background: var(--default-bg-color);
    }
  }

  .ecr__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .ecr__thumb-wrap {
    position: relative;
    overflow: hidden;
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 6px;
    transition: border-color 0.15s;

    &:hover {
      border-color: var(--art-primary);
    }

    &--selected {
      border-color: var(--art-primary);
    }
  }

  .ecr__thumb {
    display: block;
    width: 100%;
    aspect-ratio: 8 / 5;
    object-fit: cover;
  }

  .ecr__check {
    position: absolute;
    top: 4px;
    right: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: var(--art-primary);
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.15s;

    .ecr__thumb-wrap--selected & {
      opacity: 1;
    }
  }

  .ecr__check-icon {
    font-size: 11px;
    color: #fff;
  }

  .ecr__thumb-name {
    padding: 4px 6px;
    overflow: hidden;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
    background: var(--default-bg-color);
  }

  .ecr__lib-btn {
    width: 100%;
  }
</style>
