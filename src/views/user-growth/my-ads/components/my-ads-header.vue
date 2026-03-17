<template>
  <div class="my-ads-header">
    <div class="my-ads-header__left">
      <ElButton link type="primary" class="back-btn" @click="onBack">
        <ElIcon><ArrowLeft /></ElIcon>
      </ElButton>
      <h1 class="my-ads-header__title">{{ displayTitle }}</h1>
    </div>
    <div class="my-ads-header__right">
      <div class="my-ads-header__person">
        <span class="label">{{ displayPersonLabel }}</span>
        <ElSelect
          v-model="personValue"
          placeholder="请选择"
          class="person-select"
          popper-class="my-ads-header-person-popper"
        >
          <ElOption :label="personName" :value="personName" />
        </ElSelect>
      </div>
      <div class="my-ads-header__date">
        <span class="label">{{ displayDateLabel }}</span>
        <ElDatePicker
          v-model="dateRange"
          type="daterange"
          range-separator=" ~ "
          value-format="YYYY-MM-DD"
          :start-placeholder="startPlaceholder"
          :end-placeholder="endPlaceholder"
          class="date-picker"
        />
      </div>
      <ElButton type="success" class="export-btn">{{ displayExportLabel }}</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ArrowLeft } from '@element-plus/icons-vue'
  import { useI18n } from 'vue-i18n'
  import type { MyAdsUserInfo } from '../types'

  defineOptions({ name: 'MyAdsHeader' })

  const { t } = useI18n()

  const props = withDefaults(
    defineProps<{
      title?: string
      person?: MyAdsUserInfo | null
      dateRange?: [string, string]
      personLabel?: string
      dateLabel?: string
      exportLabel?: string
      startPlaceholder?: string
      endPlaceholder?: string
    }>(),
    {
      title: '',
      person: null,
      dateRange: () => ['2026-02-23', '2026-03-01'],
      personLabel: '',
      dateLabel: '',
      exportLabel: '',
      startPlaceholder: '开始日期',
      endPlaceholder: '结束日期'
    }
  )

  const displayTitle = computed(() => props.title || t('menus.userGrowth.myAds'))
  const displayPersonLabel = computed(() => props.personLabel || t('myAds.header.person'))
  const displayDateLabel = computed(() => props.dateLabel || t('myAds.header.period'))
  const displayExportLabel = computed(() => props.exportLabel || t('myAds.header.exportReport'))

  const emit = defineEmits<{
    back: []
    'update:dateRange': [value: [string, string]]
  }>()

  const personName = computed(() => props.person?.name ?? '')
  const personValue = ref(props.person?.name ?? '')
  const dateRange = ref<[string, string]>(props.dateRange ?? ['2026-02-23', '2026-03-01'])

  watch(
    () => props.person?.name,
    (v) => {
      personValue.value = v ?? ''
    }
  )
  watch(
    () => props.dateRange,
    (v) => {
      if (v?.length === 2) dateRange.value = v
    },
    { deep: true }
  )
  watch(dateRange, (v) => v && emit('update:dateRange', v), { deep: true })

  function onBack() {
    emit('back')
  }
</script>

<style lang="scss" scoped>
  @use '../styles/my-ads-common.scss' as *;

  .my-ads-header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .my-ads-header__left {
    display: flex;
    gap: 8px;
    align-items: center;

    .back-btn {
      padding: 4px;
    }

    .my-ads-header__title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: $my-ads-text-primary;
    }
  }

  .my-ads-header__right {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;

    .label {
      margin-right: 6px;
      font-size: 13px;
      color: $my-ads-text-secondary;
    }

    .person-select {
      width: 120px;
    }

    .date-picker {
      width: 260px;
    }

    .export-btn {
      min-width: 100px;
    }
  }
</style>
