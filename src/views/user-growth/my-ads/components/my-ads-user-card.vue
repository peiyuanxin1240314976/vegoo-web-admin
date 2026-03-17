<template>
  <div class="my-ads-user-card">
    <div class="my-ads-user-card__avatar">{{ user?.avatarLetter ?? '?' }}</div>
    <div class="my-ads-user-card__info">
      <div class="name">{{ user?.name ?? '--' }}</div>
      <div class="role">{{ user?.role ?? '--' }}</div>
      <div class="apps">
        <span class="apps-label">{{ displayAppsLabel }}</span>
        <span class="apps-list">{{ user?.apps?.join(', ') ?? '--' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import type { MyAdsUserInfo } from '../types'

  defineOptions({ name: 'MyAdsUserCard' })

  const { t } = useI18n()

  const props = defineProps<{
    user: MyAdsUserInfo | null
    appsLabel?: string
  }>()

  const displayAppsLabel = computed(() => props.appsLabel ?? t('myAds.userCard.responsible'))
</script>

<style lang="scss" scoped>
  @use '../styles/my-ads-common.scss' as *;

  .my-ads-user-card {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px 18px;
    background: $my-ads-panel-bg;
    border: 1px solid $my-ads-panel-border;
    border-radius: $my-ads-panel-radius;
    box-shadow: 0 10px 30px rgb(15 23 42 / 40%);
  }

  .my-ads-user-card__avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    background: $my-ads-success;
    border-radius: 50%;
  }

  .my-ads-user-card__info {
    min-width: 0;

    .name {
      font-size: 15px;
      font-weight: 600;
      color: $my-ads-text-primary;
    }

    .role {
      margin-top: 2px;
      font-size: 13px;
      color: $my-ads-text-secondary;
    }

    .apps {
      margin-top: 6px;
      font-size: 12px;
      color: $my-ads-text-secondary;

      .apps-label {
        margin-right: 4px;
      }

      .apps-list {
        word-break: break-all;
      }
    }
  }
</style>
