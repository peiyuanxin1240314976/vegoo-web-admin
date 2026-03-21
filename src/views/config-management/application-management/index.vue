<template>
  <div class="application-management-page art-full-height">
    <ElCard class="application-management-page__card" shadow="never">
      <p class="application-management-page__hint">
        {{ $t('menus.configManagement.applicationManagement') }}
      </p>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'ApplicationManagement' })
</script>

<style scoped lang="scss">
  .application-management-page {
    padding: 0;

    &__card {
      min-height: 200px;
    }

    &__hint {
      margin: 0;
      font-size: 14px;
      color: var(--art-gray-600);
    }
  }
</style>
