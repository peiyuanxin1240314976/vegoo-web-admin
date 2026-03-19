<template>
  <div class="person-card">
    <div class="person-card__top">
      <div class="avatar">{{ person.avatarLetter }}</div>
      <div class="info">
        <div class="name-row">
          <span class="name">{{ person.name }}</span>
          <span class="role">{{ person.role }}</span>
        </div>
        <div class="sub-row">
          <span class="sub-label">{{ responsibleLabel }}</span>
          <span class="apps">{{ person.apps.join('，') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { MyPerformancePersonOption } from '../types'

  defineOptions({ name: 'MyPerformancePersonCard' })

  withDefaults(
    defineProps<{
      person: MyPerformancePersonOption
      responsibleLabel?: string
    }>(),
    { responsibleLabel: '负责应用' }
  )
</script>

<style scoped lang="scss">
  .person-card {
    padding: 14px 16px;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 12px;
  }

  .person-card__top {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .avatar {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    font-size: 22px;
    font-weight: 700;
    color: var(--art-gray-900);
    background: linear-gradient(135deg, rgb(59 130 246 / 35%), rgb(16 185 129 / 20%));
    border: 1px solid rgb(59 130 246 / 35%);
    border-radius: 14px;
  }

  .info {
    min-width: 0;
  }

  .name-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: baseline;
  }

  .name {
    font-size: 16px;
    font-weight: 700;
    color: var(--art-gray-900);
  }

  .role {
    font-size: 12px;
    color: var(--art-primary);
  }

  .sub-row {
    margin-top: 6px;
    font-size: 12px;
    color: var(--art-gray-600);
  }

  .apps {
    color: var(--art-gray-900);
    opacity: 0.75;
  }
</style>
