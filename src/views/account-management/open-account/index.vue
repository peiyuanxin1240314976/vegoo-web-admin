<template>
  <div class="subject-page art-full-height">
    <div class="subject-page__hero">
      <div class="subject-page__hero-fx" aria-hidden="true" />
      <div class="subject-page__hero-copy subject-page__hero-enter subject-page__hero-enter--1">
        <div class="subject-page__hero-brand">
          <p class="subject-page__eyebrow">
            <span class="subject-page__eyebrow-line" aria-hidden="true" />
            Account Management
          </p>
          <div class="subject-page__hero-pills" aria-hidden="true">
            <span class="subject-page__pill subject-page__pill--fb">Facebook</span>
            <span class="subject-page__pill subject-page__pill--tt">TikTok</span>
          </div>
        </div>
        <h1 class="subject-page__title">开户主体配置</h1>
        <p class="subject-page__subtitle">
          围绕主体资质与 Facebook / TikTok 开通状态，统一管理可用性、执照信息与平台备注。
        </p>
      </div>
      <div class="subject-page__hero-panel subject-page__hero-enter subject-page__hero-enter--2">
        <div class="subject-page__hero-kpi subject-page__hero-kpi--total">
          <div class="subject-page__hero-kpi-head">
            <span class="subject-page__hero-icon">
              <ElIcon><Histogram /></ElIcon>
            </span>
            <span class="subject-page__hero-label">主体总数</span>
          </div>
          <strong class="subject-page__hero-value">{{ stats.total }}</strong>
        </div>
        <div class="subject-page__hero-kpi subject-page__hero-kpi--updated">
          <div class="subject-page__hero-kpi-head">
            <span class="subject-page__hero-icon">
              <ElIcon><Clock /></ElIcon>
            </span>
            <span class="subject-page__hero-label">最近更新</span>
          </div>
          <strong class="subject-page__hero-value">{{ latestUpdateTime }}</strong>
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
  import { ElIcon, ElMessage, ElMessageBox } from 'element-plus'
  import { Clock, Histogram } from '@element-plus/icons-vue'
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
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.9fr);
    gap: 18px;
    align-items: stretch;
    margin-bottom: 18px;
    overflow: hidden;
  }

  .subject-page__hero-fx {
    position: absolute;
    inset: -40% -20% -55%;
    z-index: 0;
    pointer-events: none;
    background: conic-gradient(
      from 210deg at 50% 50%,
      color-mix(in srgb, var(--theme-color) 22%, transparent),
      color-mix(in srgb, var(--art-primary) 18%, transparent),
      color-mix(in srgb, var(--art-success) 12%, transparent),
      color-mix(in srgb, var(--theme-color) 22%, transparent)
    );
    filter: blur(48px);
    opacity: 0.55;
    transform: translateZ(0);
    animation: subject-hero-orbit 22s linear infinite;
  }

  .subject-page__hero-enter {
    opacity: 0;
    animation: subject-hero-rise var(--duration-slow) var(--ease-out) forwards;
  }

  .subject-page__hero-enter--1 {
    animation-delay: 0.05s;
  }

  .subject-page__hero-enter--2 {
    animation-delay: 0.16s;
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
    z-index: 1;
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

  .subject-page__hero-brand {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .subject-page__eyebrow {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    opacity: 0.78;
  }

  .subject-page__eyebrow-line {
    display: inline-block;
    width: 28px;
    height: 3px;
    background: linear-gradient(
      90deg,
      color-mix(in srgb, var(--art-primary) 55%, transparent),
      color-mix(in srgb, var(--theme-color) 45%, transparent)
    );
    border-radius: 999px;
    box-shadow: 0 0 14px color-mix(in srgb, var(--art-primary) 35%, transparent);
  }

  .subject-page__hero-pills {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .subject-page__pill {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    border: 1px solid var(--page-border);
    border-radius: 999px;
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
  }

  .subject-page__pill--fb {
    color: color-mix(in srgb, var(--page-text-main) 88%, transparent);
    background: color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .subject-page__pill--tt {
    color: color-mix(in srgb, var(--page-text-main) 88%, transparent);
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
  }

  .subject-page__title {
    margin: 0;
    font-size: 32px;
    line-height: 1.15;
    background-color: transparent;
    background-image: linear-gradient(
      118deg,
      var(--page-text-main) 0%,
      color-mix(in srgb, var(--page-text-main) 72%, transparent) 42%,
      color-mix(in srgb, var(--art-primary) 58%, var(--page-text-main) 42%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    background-size: 120% 120%;
    -webkit-text-fill-color: transparent;
  }

  .subject-page__subtitle {
    max-width: 720px;
    margin: 14px 0 0;
    font-size: 14px;
    line-height: 1.8;
    color: color-mix(in srgb, var(--page-text-main) 74%, transparent);
  }

  .subject-page__hero-panel {
    position: relative;
    z-index: 1;
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
    position: relative;
    padding: 16px 18px;
    overflow: hidden;
    isolation: isolate;
    border: 1px solid var(--page-border);
    border-radius: 18px;
    box-shadow:
      0 0 0 1px color-mix(in srgb, var(--art-primary) 6%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent),
      inset 0 -18px 36px color-mix(in srgb, var(--default-bg-color) 45%, transparent);
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
  }

  .subject-page__hero-kpi::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(color-mix(in srgb, var(--art-primary) 7%, transparent) 1px, transparent 1px),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-primary) 7%, transparent) 1px,
        transparent 1px
      );
    background-size: 14px 14px;
    opacity: 0.45;
    mask-image: radial-gradient(ellipse 85% 70% at 50% 0%, black 0%, transparent 72%);
  }

  .subject-page__hero-kpi::after {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--art-primary) 55%, transparent) 42%,
      color-mix(in srgb, var(--theme-color) 45%, transparent) 58%,
      transparent 100%
    );
    filter: blur(0.2px);
    opacity: 0.85;
  }

  .subject-page__hero-kpi--total {
    background:
      radial-gradient(
        ellipse 118% 92% at 92% 8%,
        color-mix(in srgb, var(--art-primary) 26%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 72% 58% at 8% 88%,
        color-mix(in srgb, var(--theme-color) 10%, transparent) 0%,
        transparent 62%
      ),
      linear-gradient(
        152deg,
        color-mix(in srgb, var(--default-box-color) 78%, transparent) 0%,
        color-mix(in srgb, var(--default-bg-color) 42%, transparent) 48%,
        color-mix(in srgb, var(--default-box-color) 68%, transparent) 100%
      ),
      color-mix(in srgb, var(--default-bg-color) 30%, transparent);
  }

  .subject-page__hero-kpi--total::before {
    background-image:
      linear-gradient(color-mix(in srgb, var(--art-primary) 9%, transparent) 1px, transparent 1px),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-primary) 9%, transparent) 1px,
        transparent 1px
      );
  }

  .subject-page__hero-kpi--total::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--art-primary) 62%, transparent) 38%,
      color-mix(in srgb, var(--art-success) 22%, transparent) 72%,
      transparent 100%
    );
  }

  .subject-page__hero-kpi--updated {
    background:
      radial-gradient(
        ellipse 110% 88% at 12% 12%,
        color-mix(in srgb, var(--theme-color) 22%, transparent) 0%,
        transparent 56%
      ),
      radial-gradient(
        ellipse 80% 62% at 88% 92%,
        color-mix(in srgb, var(--art-success) 14%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        198deg,
        color-mix(in srgb, var(--default-box-color) 74%, transparent) 0%,
        color-mix(in srgb, var(--default-bg-color) 38%, transparent) 52%,
        color-mix(in srgb, var(--default-box-color) 72%, transparent) 100%
      ),
      color-mix(in srgb, var(--default-bg-color) 28%, transparent);
  }

  .subject-page__hero-kpi--updated::before {
    background-image:
      linear-gradient(color-mix(in srgb, var(--theme-color) 8%, transparent) 1px, transparent 1px),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent) 1px,
        transparent 1px
      );
    mask-image: radial-gradient(ellipse 90% 75% at 50% 100%, black 0%, transparent 70%);
  }

  .subject-page__hero-kpi--updated::after {
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--theme-color) 48%, transparent) 44%,
      color-mix(in srgb, var(--art-success) 38%, transparent) 66%,
      transparent 100%
    );
  }

  .subject-page__hero-kpi:hover {
    border-color: var(--page-border-strong);
    box-shadow:
      0 14px 32px rgb(0 0 0 / 20%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 12%, transparent),
      0 0 36px color-mix(in srgb, var(--art-primary) 14%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 9%, transparent),
      inset 0 -20px 40px color-mix(in srgb, var(--default-bg-color) 38%, transparent);
    transform: translateY(-2px);
  }

  .subject-page__hero-kpi--updated:hover {
    box-shadow:
      0 14px 32px rgb(0 0 0 / 20%),
      0 0 0 1px color-mix(in srgb, var(--theme-color) 14%, transparent),
      0 0 34px color-mix(in srgb, var(--theme-color) 12%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 9%, transparent),
      inset 0 -20px 40px color-mix(in srgb, var(--default-bg-color) 38%, transparent);
  }

  .subject-page__hero-kpi-head {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .subject-page__hero-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 8%, transparent);
  }

  .subject-page__hero-kpi--total .subject-page__hero-icon {
    color: color-mix(in srgb, var(--art-primary) 88%, var(--page-text-main) 12%);
    background:
      radial-gradient(
        circle at 30% 22%,
        color-mix(in srgb, white 14%, transparent) 0%,
        transparent 55%
      ),
      color-mix(in srgb, var(--art-primary) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 30%, transparent);
  }

  .subject-page__hero-kpi--updated .subject-page__hero-icon {
    color: color-mix(in srgb, var(--theme-color) 88%, var(--page-text-main) 12%);
    background:
      radial-gradient(
        circle at 70% 28%,
        color-mix(in srgb, white 12%, transparent) 0%,
        transparent 58%
      ),
      color-mix(in srgb, var(--theme-color) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--theme-color) 26%, transparent);
  }

  .subject-page__hero-icon :deep(.el-icon) {
    font-size: 18px;
  }

  .subject-page__hero-value {
    position: relative;
    z-index: 1;
    display: block;
    margin-top: 10px;
    font-size: 26px;
    font-weight: 800;
    line-height: 1.2;
    color: var(--page-text-main);
    text-shadow: 0 0 26px color-mix(in srgb, var(--art-primary) 20%, transparent);
    letter-spacing: -0.02em;
  }

  .subject-page__hero-kpi--updated .subject-page__hero-value {
    text-shadow:
      0 0 24px color-mix(in srgb, var(--theme-color) 18%, transparent),
      0 0 18px color-mix(in srgb, var(--art-success) 12%, transparent);
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

  @keyframes subject-hero-orbit {
    0% {
      transform: rotate(0deg) scale(1);
    }

    100% {
      transform: rotate(360deg) scale(1.06);
    }
  }

  @keyframes subject-hero-rise {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }

    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .subject-page::before {
      animation: none;
    }

    .subject-page__hero-fx {
      animation: none;
    }

    .subject-page__hero-enter {
      opacity: 1;
      transform: none;
      animation: none;
    }

    .subject-page__hero-kpi:hover {
      transform: none;
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
