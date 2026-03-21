<template>
  <ElCard class="am-rules" shadow="never">
    <template #header>
      <span>预警规则管理</span>
    </template>
    <ElCollapse v-model="activeNames" class="am-rules__collapse">
      <ElCollapseItem v-for="(g, gi) in ruleGroups" :key="gi" :name="String(gi)">
        <template #title>
          <span class="am-rules__group-title">{{ g.name }}</span>
        </template>
        <ul class="am-rules__list">
          <li v-for="(r, ri) in g.rules" :key="ri" class="am-rules__row">
            <div class="am-rules__name">{{ r.name }}</div>
            <div class="am-rules__desc">{{ r.desc }}</div>
            <div class="am-rules__meta">
              <ElTag size="small" round :type="priorityTag(r.priority)">{{ r.priority }}</ElTag>
              <span class="am-rules__notify">{{ r.notify }}</span>
            </div>
          </li>
        </ul>
      </ElCollapseItem>
    </ElCollapse>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { AlertRuleGroup } from '../types'

  defineOptions({ name: 'AmSectionRules' })

  defineProps<{
    ruleGroups: AlertRuleGroup[]
  }>()

  const activeNames = ref<string[]>(['0', '1', '2'])

  function priorityTag(p: string): 'danger' | 'warning' | 'info' {
    if (p === '高') return 'danger'
    if (p === '中') return 'warning'
    return 'info'
  }
</script>

<style scoped lang="scss">
  .am-rules {
    :deep(.el-card__header) {
      padding: 10px 14px;
      font-size: 13px;
      font-weight: 600;
      color: var(--art-gray-800);
    }

    :deep(.el-card__body) {
      padding: 8px 12px 12px;
    }
  }

  .am-rules__collapse {
    border: none;

    :deep(.el-collapse-item__header) {
      height: auto;
      min-height: 40px;
      padding: 8px 4px;
      font-size: 13px;
      font-weight: 600;
      line-height: 1.4;
      color: var(--art-gray-900);
      background: transparent;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-collapse-item__wrap) {
      background: transparent;
      border-bottom: none;
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 8px;
    }
  }

  .am-rules__group-title {
    color: var(--art-gray-900);
  }

  .am-rules__list {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .am-rules__row {
    padding: 10px 0;
    border-bottom: 1px solid var(--default-border);

    &:last-child {
      border-bottom: none;
    }
  }

  .am-rules__name {
    margin-bottom: 4px;
    font-size: 13px;
    font-weight: 600;
    color: var(--art-gray-900);
  }

  .am-rules__desc {
    margin-bottom: 8px;
    font-size: 12px;
    line-height: 1.45;
    color: var(--art-gray-600);
  }

  .am-rules__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .am-rules__notify {
    font-size: 12px;
    color: var(--art-gray-500);
  }
</style>
