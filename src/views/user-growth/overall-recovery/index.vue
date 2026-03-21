<template>
  <div class="or-page art-full-height">
    <!-- 顶栏：面包屑 + 全局筛选 -->
    <header class="or-header">
      <div class="or-header__left">
        <span class="or-breadcrumb">
          {{ $t('menus.userGrowth.title') }} &gt; {{ $t('menus.userGrowth.overallRecovery') }}
        </span>
      </div>
      <div class="or-header__filters">
        <div class="or-pill">
          <span class="or-pill__k">近30天</span>
        </div>
        <div class="or-pill">
          <span class="or-pill__k">应用:</span>
          <ElSelect v-model="filters.s_app_id" class="or-select" :teleported="false">
            <ElOption
              v-for="opt in appOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="or-pill">
          <span class="or-pill__k">广告平台:</span>
          <ElSelect v-model="filters.source" class="or-select" :teleported="false">
            <ElOption
              v-for="opt in sourceOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <div class="or-pill">
          <span class="or-pill__k">国家:</span>
          <ElSelect
            v-model="filters.s_country_code"
            class="or-select"
            :teleported="false"
            filterable
          >
            <ElOption
              v-for="opt in countryOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
      </div>
    </header>

    <!-- Tab 导航 -->
    <nav class="or-tabs">
      <button
        v-for="t in tabList"
        :key="t.key"
        type="button"
        class="or-tab"
        :class="{ 'is-active': activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </nav>

    <!-- 主内容 -->
    <main class="or-main">
      <component :is="currentTabComponent" :filter="filters" />
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, reactive } from 'vue'
  import type { OverallRecoveryTabKey, OverallRecoveryFilterState } from './types'
  import { useOverallRecoveryFilters } from './composables/useOverallRecoveryFilters'
  import TabOverall from './modules/tab-overall.vue'
  import TabOrganic from './modules/tab-organic.vue'

  defineOptions({ name: 'OverallRecovery' })

  const tabList: { key: OverallRecoveryTabKey; label: string }[] = [
    { key: 'overall', label: '整体回收（整合用户回）' },
    { key: 'organic', label: '自然量分析' }
  ]

  const activeTab = ref<OverallRecoveryTabKey>('overall')

  const filters = reactive<OverallRecoveryFilterState>({
    dateRange: '30d',
    s_app_id: 'all',
    source: 'all',
    s_country_code: 'all'
  })

  const { appOptions, sourceOptions, countryOptions } = useOverallRecoveryFilters()

  const tabComponents: Record<OverallRecoveryTabKey, typeof TabOverall> = {
    overall: TabOverall,
    organic: TabOrganic
  }

  const currentTabComponent = computed(() => tabComponents[activeTab.value])
</script>

<style scoped lang="scss">
  .or-page {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 16px 24px;
    overflow: hidden;
    background: var(--default-bg-color);
  }

  .or-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .or-breadcrumb {
    font-size: 14px;
    color: var(--art-gray-600);
  }

  .or-header__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .or-pill {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 2px 10px;
    overflow: visible;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 9999px;

    .or-pill__k {
      flex-shrink: 0;
      font-size: 12px;
      color: var(--art-gray-600);
      white-space: nowrap;
    }
  }

  .or-select {
    // el-select 新版结构（v2.4+）
    :deep(.el-select__wrapper) {
      padding-inline: 0;
      background: transparent;
      box-shadow: none !important;
    }

    :deep(.el-select__selection) {
      flex-wrap: nowrap;
      min-width: 0;
    }

    :deep(.el-select__selected-item) {
      overflow: visible;
      white-space: nowrap;
    }

    :deep(.el-select__placeholder) {
      white-space: nowrap;
    }

    // 兼容旧版 el-input 结构
    :deep(.el-input__wrapper) {
      background: transparent;
      box-shadow: none !important;
    }

    :deep(.el-input__inner) {
      width: 64px;
      min-width: 64px;
    }
  }

  .or-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 16px;
    border-bottom: 1px solid var(--default-border);
  }

  .or-tab {
    padding: 10px 16px;
    font-size: 14px;
    color: var(--art-gray-600);
    cursor: pointer;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: var(--art-gray-900);
    }

    &.is-active {
      color: var(--art-primary);
      border-bottom-color: var(--art-primary);
    }
  }

  .or-main {
    flex: 1;
    min-height: 0;
    overflow: auto;

    // 让 tab 组件能拿到父容器高度
    > * {
      min-height: 100%;
    }
  }
</style>
