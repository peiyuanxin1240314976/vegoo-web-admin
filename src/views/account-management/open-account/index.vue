<template>
  <div class="subject-page art-full-height">
    <div class="subject-page__fx" aria-hidden="true"></div>
    <div class="subject-page__hero">
      <div class="subject-page__hero-copy">
        <p class="subject-page__eyebrow">Account Management</p>
        <h1 class="subject-page__title">开户主体配置</h1>
        <p class="subject-page__subtitle">
          围绕主体资质与 Facebook / TikTok 开通状态，统一管理可用性、执照信息与平台备注。
        </p>
      </div>
      <div class="subject-page__hero-panel">
        <div class="subject-page__hero-kpi">
          <span class="subject-page__hero-label">主体总数</span>
          <strong>{{ stats.total }}</strong>
        </div>
        <div class="subject-page__hero-kpi">
          <span class="subject-page__hero-label">最近更新</span>
          <strong>{{ latestUpdateTime }}</strong>
        </div>
      </div>
    </div>

    <SubjectSettingStatCards :stats="stats" />

    <div class="subject-page__surface">
      <SubjectSettingToolbar
        v-model:keyword="keyword"
        v-model:platform-filter="platformFilter"
        v-model:license-filter="licenseFilter"
        v-model:sort-order="sortOrder"
        @create="handleCreate"
      />

      <SubjectSettingTable
        :rows="filteredRows"
        @edit="handleEdit"
        @toggle-platform="handleQuickToggle"
      />
    </div>

    <SubjectSettingDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :data="editingRecord"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import SubjectSettingDrawer from './modules/subject-setting-drawer.vue'
  import SubjectSettingStatCards from './modules/subject-setting-stat-cards.vue'
  import SubjectSettingTable from './modules/subject-setting-table.vue'
  import SubjectSettingToolbar from './modules/subject-setting-toolbar.vue'
  import type {
    SubjectPlatformKey,
    SubjectSettingItem,
    SubjectSettingListParams,
    SubjectSettingStats
  } from './types'
  import { SubjectSettingEndpoint, isSubjectSettingEndpointMock } from './config/data-source'
  import {
    mockFetchSubjectSettings,
    mockSaveSubjectSetting,
    mockToggleSubjectPlatform
  } from './mock/subject-setting-api-mock'

  defineOptions({ name: 'OpenAccount' })

  type PlatformFilter = NonNullable<SubjectSettingListParams['platformStatus']>
  type LicenseFilter = NonNullable<SubjectSettingListParams['hasBusinessLicense']>
  type SortOrder = NonNullable<SubjectSettingListParams['sortOrder']>
  type DrawerMode = 'create' | 'edit'

  const keyword = ref('')
  const platformFilter = ref<PlatformFilter>('all')
  const licenseFilter = ref<LicenseFilter>('all')
  const sortOrder = ref<SortOrder>('updated_desc')

  const drawerVisible = ref(false)
  const drawerMode = ref<DrawerMode>('create')
  const editingRecord = ref<SubjectSettingItem | null>(null)

  const list = ref<SubjectSettingItem[]>([])

  const filters = computed<SubjectSettingListParams>(() => ({
    keyword: keyword.value,
    platformStatus: platformFilter.value,
    hasBusinessLicense: licenseFilter.value,
    sortOrder: sortOrder.value
  }))

  const filteredRows = computed(() => list.value)

  const stats = computed<SubjectSettingStats>(() => {
    const total = list.value.length
    const facebookEnabled = list.value.filter((item) => item.facebookEnabled).length
    const tiktokEnabled = list.value.filter((item) => item.tiktokEnabled).length
    const bothEnabled = list.value.filter(
      (item) => item.facebookEnabled && item.tiktokEnabled
    ).length

    return {
      total,
      facebookEnabled,
      tiktokEnabled,
      bothEnabled
    }
  })

  const latestUpdateTime = computed(() => list.value[0]?.updateTime ?? '--')

  async function loadList() {
    if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.List)) {
      list.value = await mockFetchSubjectSettings(filters.value)
      return
    }

    list.value = await mockFetchSubjectSettings(filters.value)
  }

  onMounted(() => {
    void loadList()
  })

  watch(filters, () => {
    void loadList()
  })

  async function refreshWithToast(message?: string) {
    await loadList()
    if (message) ElMessage.success(message)
  }

  function handleCreate() {
    drawerMode.value = 'create'
    editingRecord.value = null
    drawerVisible.value = true
  }

  function handleEdit(row: SubjectSettingItem) {
    drawerMode.value = 'edit'
    editingRecord.value = { ...row }
    drawerVisible.value = true
  }

  async function handleQuickToggle(payload: {
    id: string
    platform: SubjectPlatformKey
    enabled: boolean
  }) {
    try {
      await mockToggleSubjectPlatform(payload)
      await refreshWithToast(
        `${payload.platform === 'facebook' ? 'Facebook' : 'TikTok'} 状态已更新`
      )
    } catch {
      ElMessage.error('平台状态更新失败')
    }
  }

  async function handleSubmit(payload: SubjectSettingItem) {
    try {
      if (isSubjectSettingEndpointMock(SubjectSettingEndpoint.Save)) {
        await mockSaveSubjectSetting(payload)
      } else {
        await mockSaveSubjectSetting(payload)
      }
    } catch {
      ElMessage.error('主体保存失败')
      return
    }

    drawerVisible.value = false
    await refreshWithToast(drawerMode.value === 'create' ? '主体已创建' : '主体已保存')
  }
</script>

<style lang="scss" scoped>
  .subject-page {
    --page-border: color-mix(in srgb, var(--art-primary) 16%, transparent);
    --page-border-strong: color-mix(in srgb, var(--art-primary) 28%, transparent);
    --page-surface: color-mix(in srgb, var(--default-box-color) 88%, transparent);
    --page-surface-soft: color-mix(in srgb, var(--default-box-color) 72%, transparent);
    --page-highlight: color-mix(in srgb, var(--theme-color) 24%, transparent);
    --page-text-main: color-mix(in srgb, var(--text-primary) 92%, white 8%);
    --page-text-soft: var(--text-secondary);
    --page-text-faint: var(--text-tertiary);

    position: relative;
    min-height: 100%;
    padding: 24px;
    overflow-x: clip;
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .subject-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 70% 50% at 6% 6%,
        color-mix(in srgb, var(--theme-color) 36%, transparent) 0%,
        color-mix(in srgb, var(--art-primary) 18%, transparent) 38%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 55% 42% at 94% 8%,
        color-mix(in srgb, var(--art-primary) 34%, transparent) 0%,
        color-mix(in srgb, var(--theme-color) 14%, transparent) 38%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 42% 34% at 50% 14%,
        color-mix(in srgb, var(--theme-color) 12%, transparent) 0%,
        transparent 55%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 36%, transparent 66%);
    animation: subject-aurora-drift 14s ease-in-out infinite alternate;
  }

  .subject-page::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(color-mix(in srgb, var(--art-primary) 5%, transparent) 1px, transparent 1px),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-primary) 5%, transparent) 1px,
        transparent 1px
      );
    background-size: 40px 40px;
    mask-image: linear-gradient(to bottom, black 0%, black 24%, transparent 48%);
  }

  .subject-page > *:not(.subject-page__fx) {
    position: relative;
    z-index: 1;
  }

  .subject-page__fx {
    position: absolute;
    inset: -12% -12% 52%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 0deg at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, var(--art-primary) 10%, transparent) 55deg,
      color-mix(in srgb, var(--theme-color) 8%, transparent) 80deg,
      transparent 130deg,
      color-mix(in srgb, var(--theme-color) 10%, transparent) 200deg,
      transparent 285deg,
      color-mix(in srgb, var(--art-primary) 7%, transparent) 330deg,
      transparent 360deg
    );
    opacity: 0.78;
    mask-image: linear-gradient(to bottom, black 0%, black 46%, transparent 82%);
    animation: subject-fx-spin 52s linear infinite;
    will-change: transform;
  }

  .subject-page__hero {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.9fr);
    gap: 18px;
    align-items: stretch;
    margin-bottom: 18px;
  }

  .subject-page__hero-copy,
  .subject-page__hero-panel,
  .subject-page__surface {
    backdrop-filter: blur(20px);
    border: 1px solid var(--page-border);
    border-radius: 24px;
    box-shadow:
      0 22px 60px rgb(0 0 0 / 24%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 8%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
  }

  .subject-page__hero-copy {
    position: relative;
    padding: 28px 30px;
    overflow: hidden;
    color: var(--page-text-main);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--default-box-color) 92%, black 8%),
        color-mix(in srgb, var(--default-box-color) 82%, black 18%)
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--theme-color) 12%, transparent),
        color-mix(in srgb, var(--art-primary) 10%, transparent)
      );
  }

  .subject-page__hero-copy::before {
    position: absolute;
    inset: 1px;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(color-mix(in srgb, white 4%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, white 4%, transparent) 1px, transparent 1px);
    background-size: 20px 20px;
    border-radius: inherit;
    opacity: 0.22;
    mask-image: linear-gradient(180deg, black 0%, rgb(0 0 0 / 45%) 68%, transparent 100%);
  }

  .subject-page__eyebrow {
    margin: 0 0 10px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    opacity: 0.72;
  }

  .subject-page__title {
    margin: 0;
    font-size: 32px;
    line-height: 1.15;
  }

  .subject-page__subtitle {
    max-width: 720px;
    margin: 14px 0 0;
    font-size: 14px;
    line-height: 1.8;
    color: color-mix(in srgb, var(--page-text-main) 74%, transparent);
  }

  .subject-page__hero-panel {
    display: grid;
    gap: 14px;
    padding: 20px;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-box-color) 74%, transparent)
      ),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent),
        color-mix(in srgb, var(--art-primary) 6%, transparent)
      );
  }

  .subject-page__hero-kpi {
    padding: 18px;
    background: color-mix(in srgb, var(--default-bg-color) 24%, transparent);
    border: 1px solid var(--page-border);
    border-radius: 18px;
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .subject-page__hero-kpi strong {
    display: block;
    margin-top: 8px;
    font-size: 24px;
    color: var(--page-text-main);
  }

  .subject-page__hero-label {
    font-size: 12px;
    font-weight: 700;
    color: var(--page-text-faint);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .subject-page__surface {
    padding: 18px;
    background: var(--page-surface);
  }

  @keyframes subject-aurora-drift {
    0% {
      opacity: 0.72;
      transform: scale(1) translate(0, 0);
    }

    100% {
      opacity: 1;
      transform: scale(1.04) translate(1%, -0.8%);
    }
  }

  @keyframes subject-fx-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .subject-page::before,
    .subject-page__fx {
      animation: none;
    }
  }

  @media (width <= 1080px) {
    .subject-page__hero {
      grid-template-columns: 1fr;
    }
  }

  @media (width <= 768px) {
    .subject-page {
      padding: 16px;
    }

    .subject-page__hero-copy,
    .subject-page__hero-panel,
    .subject-page__surface {
      border-radius: 20px;
    }

    .subject-page__hero-copy {
      padding: 22px;
    }

    .subject-page__title {
      font-size: 26px;
    }
  }
</style>
