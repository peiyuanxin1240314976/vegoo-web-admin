<template>
  <div class="cockpit-yesterday-cards">
    <div v-for="section in safeSections" :key="section.key" class="yesterday-card cockpit-panel">
      <div class="section__title">
        <span class="section__dot" />
        <span class="section__text">{{ section.title }}</span>
      </div>

      <div class="section__list">
        <div v-for="(row, idx) in section.items" :key="idx" class="row">
          <div class="row__left">
            <span class="row__bullet" />
            <span class="row__label">{{ row.label }}</span>
          </div>

          <div class="row__right">
            <span class="row__value">{{ row.valueText }}</span>
            <span v-if="row.changeText && row.trend" class="row__change" :class="row.trend">
              <ElIcon class="row__change-icon">
                <Top v-if="row.trend === 'up'" />
                <Bottom v-else />
              </ElIcon>
              {{ row.changeText }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Top, Bottom } from '@element-plus/icons-vue'
  import type { CockpitYesterdaySummarySection } from '../types'

  defineOptions({ name: 'CockpitYesterdaySummaryPanel' })

  const props = withDefaults(
    defineProps<{
      sections?: CockpitYesterdaySummarySection[]
    }>(),
    { sections: () => [] }
  )

  const safeSections = computed(() => (Array.isArray(props.sections) ? props.sections : []))
</script>

<style scoped lang="scss">
  .cockpit-yesterday-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .yesterday-card {
    min-width: 0;
    padding: 12px 14px;
    border-radius: 10px;
  }

  @media (width <= 768px) {
    .cockpit-yesterday-cards {
      grid-template-columns: 1fr;
    }
  }

  .section__title {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-bottom: 10px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgb(148 163 184 / 18%);
  }

  .section__dot {
    width: 10px;
    height: 10px;
    background: var(--el-color-primary);
    border-radius: 9999px;
    box-shadow: 0 0 0 3px rgb(59 130 246 / 14%);
  }

  .section__text {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0.02em;
  }

  .section__list {
    display: grid;
    gap: 8px;
  }

  .row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    min-width: 0;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }

  .row__left {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  .row__bullet {
    flex-shrink: 0;
    width: 7px;
    height: 7px;
    background: rgb(148 163 184 / 60%);
    border-radius: 9999px;
  }

  .row__label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row__right {
    display: inline-flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    font-variant-numeric: tabular-nums;
  }

  .row__value {
    color: var(--el-text-color-primary);
  }

  .row__change {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-weight: 500;

    &.up {
      color: var(--el-color-success);
    }

    &.down {
      color: var(--el-color-danger);
    }
  }

  .row__change-icon {
    font-size: 14px;
  }
</style>
