<template>
  <div class="subject-page art-full-height">
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
        :platform-status-options="platformStatusOptions"
        :license-status-options="licenseStatusOptions"
        :sort-order-options="sortOrderOptions"
        v-model:license-filter="licenseFilter"
        v-model:sort-order="sortOrder"
        @create="handleCreate"
      />

      <SubjectSettingTable
        :rows="filteredRows"
        :current="current"
        :size="size"
        :total="total"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle-platform="handleQuickToggle"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>

    <SubjectSettingDrawer
      v-model:visible="drawerVisible"
      :mode="drawerMode"
      :data="editingRecord"
      :upload-license="handleUploadLicense"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    deleteSubjectSetting,
    fetchSubjectSettingFilterOptions,
    fetchSubjectSettingList,
    fetchSubjectSettingOverviewCards,
    saveSubjectSetting,
    toggleSubjectSettingPlatform,
    uploadSubjectSettingLicense
  } from '@/api/account-management/open-account'
  import SubjectSettingDrawer from './modules/subject-setting-drawer.vue'
  import SubjectSettingStatCards from './modules/subject-setting-stat-cards.vue'
  import SubjectSettingTable from './modules/subject-setting-table.vue'
  import SubjectSettingToolbar from './modules/subject-setting-toolbar.vue'
  import type {
    SubjectPlatformKey,
    SubjectSettingItem,
    SubjectSettingListParams,
    SubjectSettingLicenseUploadParams,
    SubjectSettingOptionItem,
    SubjectSettingSaveParams,
    SubjectSettingStats
  } from './types'

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
  const total = ref(0)
  const current = ref(1)
  const size = ref(10)
  const stats = ref<SubjectSettingStats>({
    total: 0,
    facebookEnabled: 0,
    tiktokEnabled: 0,
    bothEnabled: 0
  })
  const latestUpdateTime = ref('--')
  const platformStatusOptions = ref<SubjectSettingOptionItem[]>([])
  const licenseStatusOptions = ref<SubjectSettingOptionItem[]>([])
  const sortOrderOptions = ref<SubjectSettingOptionItem[]>([])

  const filters = computed<SubjectSettingListParams>(() => ({
    keyword: keyword.value,
    platformStatus: platformFilter.value,
    hasBusinessLicense: licenseFilter.value,
    sortOrder: sortOrder.value,
    current: current.value,
    size: size.value
  }))

  const filteredRows = computed(() => list.value)

  async function loadListAndStats() {
    const [listResponse, cardsResponse] = await Promise.all([
      fetchSubjectSettingList(filters.value),
      fetchSubjectSettingOverviewCards(filters.value)
    ])

    list.value = listResponse.records
    total.value = listResponse.total
    stats.value = {
      total: cardsResponse.total,
      facebookEnabled: cardsResponse.facebookEnabled,
      tiktokEnabled: cardsResponse.tiktokEnabled,
      bothEnabled: cardsResponse.bothEnabled
    }
    latestUpdateTime.value = cardsResponse.latestUpdateTime
  }

  onMounted(() => {
    void loadFilterOptions()
    void loadListAndStats()
  })

  watch([keyword, platformFilter, licenseFilter, sortOrder], () => {
    current.value = 1
    void loadListAndStats()
  })

  async function refreshWithToast(message?: string) {
    await loadListAndStats()
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
      await toggleSubjectSettingPlatform(payload)
      await refreshWithToast(
        `${payload.platform === 'facebook' ? 'Facebook' : 'TikTok'} 状态已更新`
      )
    } catch {
      ElMessage.error('平台状态更新失败')
    }
  }

  async function handleSubmit(payload: SubjectSettingItem) {
    const savePayload: SubjectSettingSaveParams = {
      subjectId: payload.subjectId,
      subjectName: payload.subjectName,
      businessLicense: payload.businessLicense,
      facebookEnabled: payload.facebookEnabled,
      facebookRemark: payload.facebookRemark,
      tiktokEnabled: payload.tiktokEnabled,
      tiktokRemark: payload.tiktokRemark
    }

    try {
      await saveSubjectSetting(savePayload)
    } catch {
      ElMessage.error('主体保存失败')
      return
    }

    drawerVisible.value = false
    await refreshWithToast(drawerMode.value === 'create' ? '主体已创建' : '主体已保存')
  }

  async function handleDelete(row: SubjectSettingItem) {
    try {
      await ElMessageBox.confirm(
        `确认删除主体 ${row.subjectName}（${row.subjectId}）吗？`,
        '删除确认',
        {
          type: 'warning',
          confirmButtonText: '确认删除',
          cancelButtonText: '取消'
        }
      )
    } catch {
      return
    }

    try {
      await deleteSubjectSetting(row.subjectId)
      if (list.value.length === 1 && current.value > 1) {
        current.value -= 1
      }
      await refreshWithToast('主体已删除')
    } catch {
      ElMessage.error('主体删除失败')
    }
  }

  function handlePageChange(value: number) {
    current.value = value
    void loadListAndStats()
  }

  function handleSizeChange(value: number) {
    size.value = value
    current.value = 1
    void loadListAndStats()
  }

  async function handleUploadLicense(file: File): Promise<string> {
    const toBase64 = (raw: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = String(reader.result ?? '')
          const base64 = result.includes(',') ? result.split(',')[1] : result
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(raw)
      })

    const payload: SubjectSettingLicenseUploadParams = {
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      fileContentBase64: await toBase64(file)
    }
    const response = await uploadSubjectSettingLicense(payload)
    return response.licenseUrl
  }

  async function loadFilterOptions() {
    try {
      const response = await fetchSubjectSettingFilterOptions()
      platformStatusOptions.value = response.platformStatusOptions
      licenseStatusOptions.value = response.licenseStatusOptions
      sortOrderOptions.value = response.sortOrderOptions
    } catch {
      platformStatusOptions.value = [
        { label: '全部平台状态', value: 'all' },
        { label: 'Facebook 可用', value: 'facebook' },
        { label: 'TikTok 可用', value: 'tiktok' },
        { label: '双平台可用', value: 'both' },
        { label: '全部未启用', value: 'none' }
      ]
      licenseStatusOptions.value = [
        { label: '全部执照状态', value: 'all' },
        { label: '有营业执照', value: 'yes' },
        { label: '无营业执照', value: 'no' }
      ]
      sortOrderOptions.value = [
        { label: '最近更新优先', value: 'updated_desc' },
        { label: '最早更新优先', value: 'updated_asc' }
      ]
      ElMessage.warning('筛选下拉选项加载失败，已使用默认选项')
    }
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

  .subject-page > * {
    position: relative;
    z-index: 1;
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

  @media (prefers-reduced-motion: reduce) {
    .subject-page::before {
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
