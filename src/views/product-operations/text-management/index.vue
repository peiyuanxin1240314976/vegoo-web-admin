<template>
  <div class="text-management-page art-full-height">
    <ElCard shadow="never" class="text-management-page__card">
      <p class="text-management-page__placeholder">{{ placeholderText }}</p>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'TextManagement' })

  const { t } = useI18n()
  const placeholderText = t('menus.productOperations.placeholder')
</script>

<style scoped lang="scss">
  .text-management-page {
    --text-management-gap: 16px;

    padding: var(--text-management-gap);

    &__card {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: calc(100% - var(--text-management-gap) * 2);
    }

    &__placeholder {
      margin: 0;
      font-size: 14px;
      color: var(--art-gray-600);
    }
  }
</style>
