<!-- 权限配置 - 数据权限 Tab：数据访问范围配置 -->
<template>
  <div class="role-permission-data">
    <div class="data-config-header">
      <h3 class="data-config-title">数据访问范围配置</h3>
      <p class="data-config-desc">控制该角色可以查看的数据范围，未包含在范围内的数据将被自动过滤</p>
    </div>

    <ElScrollbar class="data-config-scroll">
      <div class="config-list">
        <div v-for="item in configItems" :key="item.key" class="config-item">
          <div class="config-item__label-wrap">
            <span class="config-item__label">{{ item.label }}</span>
            <span class="config-item__desc">{{ item.desc }}</span>
          </div>
          <div class="config-item__control">
            <ElSelect
              size="small"
              v-model="form[item.key]"
              class="config-select"
              placeholder="请选择"
              @change="updatePreview"
            >
              <ElOption
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </ElSelect>
            <ElRadioGroup
              size="small"
              v-model="form[item.key]"
              class="config-radios"
              @change="updatePreview"
            >
              <ElRadio
                v-for="opt in item.options"
                :key="opt.value"
                :label="opt.value"
                class="config-radio"
              >
                {{ opt.label }}
              </ElRadio>
            </ElRadioGroup>
          </div>
        </div>
      </div>
    </ElScrollbar>

    <div class="preview-section">
      <h4 class="preview-title">权限预览效果</h4>
      <p class="preview-text">{{ previewText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'RolePermissionData' })

  const props = withDefaults(
    defineProps<{
      /** 当前角色名称，用于预览文案，如「投放人员」 */
      roleName?: string
      /** 预览中的示例用户名 */
      previewUserName?: string
    }>(),
    {
      roleName: '投放人员',
      previewUserName: '张三'
    }
  )

  const INITIAL_FORM: Record<string, string> = {
    appScope: 'all_apps',
    countryScope: 'all_countries',
    channelScope: 'all_channels',
    timeScope: 'unlimited',
    amountDisplay: 'visible_amount',
    competitorData: 'not_visible',
    costGranularity: 'campaign_level',
    revenueVisibility: 'ad_revenue_only'
  }

  const form = ref<Record<string, string>>({ ...INITIAL_FORM })

  const configItems = [
    {
      key: 'appScope',
      label: '应用范围',
      desc: '可访问哪些 App 的数据',
      options: [
        { value: 'all_apps', label: '全部应用' },
        { value: 'my_apps', label: '仅自己负责的应用' },
        { value: 'no_access', label: '不可访问' },
        { value: 'by_category', label: '按应用分类(天气/工具/游戏)' },
        { value: 'custom_apps', label: '自定义选择[多选应用]' }
      ]
    },
    {
      key: 'countryScope',
      label: '国家/地区',
      desc: '可查看哪些国家或地区的数据',
      options: [
        { value: 'all_countries', label: '全部国家' },
        { value: 'my_countries', label: '仅负责国家' },
        { value: 't1_markets', label: 'T1市场(US/UK/CA/AU/JP)' },
        { value: 't2_markets', label: 'T2市场(BR/DE/FR/KR...)' },
        { value: 'asia_pacific', label: '亚太地区' },
        { value: 'europe', label: '欧洲地区' },
        { value: 'custom_countries', label: '自定义选择[多选国家]' }
      ]
    },
    {
      key: 'channelScope',
      label: '广告平台范围',
      desc: '可查看哪些投放广告平台的数据',
      options: [
        { value: 'all_channels', label: '全部广告平台' },
        { value: 'my_channels', label: '仅自己负责的广告平台' },
        { value: 'google_readonly', label: 'Google Ads 只读' },
        { value: 'meta_readonly', label: 'Meta Ads 只读' },
        { value: 'tiktok_readonly', label: 'TikTok Ads 只读' },
        { value: 'unity_readonly', label: 'Unity Ads 只读' },
        { value: 'custom_channels', label: '自定义选择[多选广告平台]' }
      ]
    },
    {
      key: 'timeScope',
      label: '时间范围',
      desc: '可查看数据的时间范围',
      options: [
        { value: 'unlimited', label: '无限制' },
        { value: 'last_90', label: '最近90天' },
        { value: 'last_180', label: '最近180天' },
        { value: 'last_1y', label: '最近1年' },
        { value: 'today_only', label: '仅当天数据' },
        { value: 'custom_time', label: '自定义时间范围' }
      ]
    },
    {
      key: 'amountDisplay',
      label: '金额数据显示',
      desc: '金额类数据的展示方式',
      options: [
        { value: 'visible_amount', label: '可见具体金额' },
        { value: 'percent_only', label: '仅显示百分比' },
        { value: 'trend_only', label: '仅显示趋势方向' },
        { value: 'hidden', label: '完全隐藏' }
      ]
    },
    {
      key: 'competitorData',
      label: '竞品数据',
      desc: '竞品相关数据的可见性',
      options: [
        { value: 'not_visible', label: '不可见' },
        { value: 'industry_avg', label: '仅行业均值数据' },
        { value: 'all_competitor', label: '可见全部竞品数据' }
      ]
    },
    {
      key: 'costGranularity',
      label: '成本数据粒度',
      desc: '成本数据可下钻的层级',
      options: [
        { value: 'summary_level', label: '总计汇总级(只看汇总)' },
        { value: 'campaign_level', label: '广告系列级' },
        { value: 'ad_group_level', label: '广告组级' },
        { value: 'ad_level', label: '广告级' }
      ]
    },
    {
      key: 'revenueVisibility',
      label: '变现收入可见性',
      desc: '变现收入数据的可见范围',
      options: [
        { value: 'all_revenue', label: '全部收入(广告+内购)' },
        { value: 'ad_revenue_only', label: '仅广告收入' },
        { value: 'iap_revenue_only', label: '仅内购收入' },
        { value: 'not_visible', label: '不可见' }
      ]
    }
  ]

  const previewText = ref('')

  function getOptionLabel(key: string, value: string): string {
    const item = configItems.find((i) => i.key === key)
    return item?.options.find((o) => o.value === value)?.label ?? value
  }

  function updatePreview() {
    const app = getOptionLabel('appScope', form.value.appScope)
    const country = getOptionLabel('countryScope', form.value.countryScope)
    const channel = getOptionLabel('channelScope', form.value.channelScope)
    const amount = getOptionLabel('amountDisplay', form.value.amountDisplay)
    const revenue = getOptionLabel('revenueVisibility', form.value.revenueVisibility)
    previewText.value = `${props.previewUserName}(${props.roleName})登录后将看到: 广告系列列表:${app} 数据范围:${country}、${channel} 金额:${amount} 变现数据:${revenue}`
  }

  function reset() {
    form.value = { ...INITIAL_FORM }
    updatePreview()
  }

  defineExpose({ reset })

  onMounted(() => {
    updatePreview()
  })
</script>

<style scoped lang="scss">
  .role-permission-data {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    min-height: 0;
    padding: 0 4px;
  }

  .data-config-header {
    flex-shrink: 0;
    padding: 14px 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .data-config-title {
    margin: 0 0 6px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .data-config-desc {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .data-config-scroll {
    flex: 1;
    min-height: 0;
    padding: 1px; /* 避免边框被裁切 */
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;

    :deep(.el-scrollbar__wrap) {
      padding: 16px;
    }
  }

  .config-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .config-item {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    padding: 16px;
    margin-bottom: 12px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .config-item__label-wrap {
    flex-shrink: 0;
    width: 120px;
  }

  .config-item__label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .config-item__desc {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
  }

  .config-item__control {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
  }

  .config-select {
    width: 100%;
    max-width: 280px;
  }

  .config-radios {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  .config-radio {
    margin-right: 0;

    :deep(.el-radio__label) {
      font-size: 13px;
    }
  }

  .preview-section {
    flex-shrink: 0;
    padding: 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .preview-title {
    margin: 0 0 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .preview-text {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }
</style>
