<template>
  <div class="first-click-intro art-card">
    <div class="intro-left">
      <h2 class="intro-title">首次点击归因(First Click Attribution)</h2>
      <p class="intro-desc">将100%的转化归因于用户的第一个接触点。</p>
      <p class="intro-best">Best for: 了解哪些渠道在吸引新用户方面最有效</p>
      <p class="intro-limitations">Limitations: 忽略了后续的转化驱动因素</p>
    </div>
    <div class="intro-right">
      <div class="intro-chart-placeholder">
        <span>转化路径图（占位，后续实现）</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'FirstClickIntro' })
</script>

<style scoped lang="scss">
  .first-click-intro {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    min-height: 0;
    padding: 20px 24px;
    margin-bottom: 16px;

    @media (width <= 768px) {
      grid-template-columns: 1fr;
    }
  }

  .intro-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .intro-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .intro-desc,
  .intro-best,
  .intro-limitations {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
  }

  .intro-right {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 120px;
  }

  .intro-chart-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 120px;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
    background: var(--el-fill-color-lighter);
    border: 1px dashed var(--el-border-color);
    border-radius: 8px;
  }

  html.dark .intro-chart-placeholder {
    background: var(--el-fill-color-darker);
  }
</style>
