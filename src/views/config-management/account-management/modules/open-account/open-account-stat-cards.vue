<template>
  <div class="oa-stats">
    <div class="oa-stats__card">
      <div class="oa-stats__label">开户记录总数</div>
      <div class="oa-stats__value oa-stats__value--total tabular-nums">{{ stats.total }}</div>
    </div>
    <div class="oa-stats__card oa-stats__card--warn">
      <div class="oa-stats__label-row">
        <span class="oa-stats__label">待分配凭据</span>
        <span class="oa-stats__tag">需处理</span>
      </div>
      <div class="oa-stats__value oa-stats__value--warn tabular-nums">{{ stats.pending }}</div>
    </div>
    <div class="oa-stats__card oa-stats__card--ok">
      <div class="oa-stats__label">已激活</div>
      <div class="oa-stats__value oa-stats__value--ok tabular-nums">{{ stats.active }}</div>
    </div>
    <div class="oa-stats__card oa-stats__card--fail">
      <div class="oa-stats__label">开户失败</div>
      <div class="oa-stats__value oa-stats__value--fail tabular-nums">{{ stats.failed }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'OpenAccountStatCards' })

  defineProps<{
    stats: { total: number; pending: number; active: number; failed: number }
  }>()
</script>

<style lang="scss" scoped>
  .oa-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-3);
  }

  .oa-stats__card {
    padding: var(--space-4) var(--space-5);
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
    box-shadow: var(--shadow-xs);
    transition: box-shadow var(--duration-normal) var(--ease-default);

    &:hover {
      box-shadow: var(--shadow-sm);
    }

    &--warn {
      background: rgb(249 115 22 / 6%);
      border-color: rgb(249 115 22 / 22%);
    }

    &--ok {
      background: rgb(16 185 129 / 6%);
      border-color: rgb(16 185 129 / 22%);
    }

    &--fail {
      background: rgb(239 68 68 / 6%);
      border-color: rgb(239 68 68 / 22%);
    }
  }

  .oa-stats__label {
    margin-bottom: var(--space-2);
    font-size: 12px;
    color: var(--text-secondary);
  }

  .oa-stats__label-row {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .oa-stats__tag {
    padding: 1px 6px;
    font-size: 11px;
    color: var(--art-warning);
    background: rgb(249 115 22 / 15%);
    border-radius: 4px;
  }

  .oa-stats__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;

    &--total {
      color: var(--text-primary);
    }

    &--warn {
      color: var(--art-warning);
    }

    &--ok {
      color: var(--art-success);
    }

    &--fail {
      color: var(--art-danger);
    }
  }
</style>
