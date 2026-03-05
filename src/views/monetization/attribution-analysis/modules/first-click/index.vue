<template>
  <div class="first-click-main">
    <!-- 第一排：首次点击归因描述 + 占位图 -->
    <FirstClickIntro />

    <!-- 第二排：4 个指标卡片 -->
    <div class="first-click-row-2">
      <TotalAttributedInstalls />
      <AttributedRevenue />
      <AverageConversionTime />
      <AverageTouchpoints />
    </div>

    <!-- 第三排：左 60%（渠道对比+洞察） 右 40%（桑基+转化时间） -->
    <div class="first-click-row-3">
      <div class="first-click-col-left">
        <ChannelAttributionWithInsights />
      </div>
      <div class="first-click-col-right">
        <MultiTouchpointJourney />
        <ConversionTimeByChannel />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import FirstClickIntro from './first-click-intro.vue'
  import TotalAttributedInstalls from './total-attributed-installs.vue'
  import AttributedRevenue from './attributed-revenue.vue'
  import AverageConversionTime from './average-conversion-time.vue'
  import AverageTouchpoints from './average-touchpoints.vue'
  import ChannelAttributionWithInsights from './channel-attribution-with-insights.vue'
  import MultiTouchpointJourney from './multi-touchpoint-journey.vue'
  import ConversionTimeByChannel from './conversion-time-by-channel.vue'

  defineOptions({ name: 'AttributionFirstClick' })
</script>

<style scoped lang="scss">
  .first-click-main {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .first-click-row-2 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    @media (width <= 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (width <= 600px) {
      grid-template-columns: 1fr;
    }
  }

  .first-click-row-3 {
    display: grid;
    grid-template-columns: 60% 40%;
    gap: 16px;
    min-height: 560px;

    @media (width <= 992px) {
      grid-template-columns: 1fr;
      min-height: auto;
    }
  }

  .first-click-col-left {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .first-click-col-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 0;
  }

  .first-click-col-right > * {
    flex: 1;
    min-height: 0;
  }
</style>
