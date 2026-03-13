<template>
  <div class="map-detail-header">
    <div class="header-left">
      <ElButton type="primary" plain class="back-btn" @click="goBack">
        <template #icon><ArrowLeft /></template>
        返回
      </ElButton>
      <h1 class="detail-title">
        <span
          v-if="flagCode"
          class="detail-title-flag fi"
          :class="`fi-${flagCode}`"
          :title="countryCode"
        ></span>
        {{ countryName }}<template v-if="countryCode"> ({{ countryCode }})</template> - 地区详情
      </h1>
    </div>
    <div v-if="$slots.right" class="header-right">
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ArrowLeft } from '@element-plus/icons-vue'
  import 'flag-icons/css/flag-icons.min.css'

  defineOptions({ name: 'MapDetailHeader' })

  const props = defineProps<{
    countryCode: string
    countryName: string
  }>()

  /** 用于 flag-icons 的两位小写国家代码，仅当合法时显示国旗 */
  const flagCode = computed(() => {
    const code = (props.countryCode || '').toLowerCase()
    return /^[a-z]{2}$/.test(code) ? code : ''
  })

  const router = useRouter()

  function goBack() {
    router.push({ path: '/cockpit' })
  }
</script>

<style scoped lang="scss">
  .map-detail-header {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;

    .header-left {
      .back-btn {
        margin-bottom: 8px;
      }

      .detail-title {
        display: flex;
        gap: 10px;
        align-items: center;
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .detail-title-flag {
        display: inline-block;
        flex-shrink: 0;
        width: 1.4em;
        min-width: 24px;
        height: 1em;
        min-height: 17px;
        background-size: cover;
      }
    }

    .header-right {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
  }
</style>
