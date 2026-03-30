# Admin UI 视效增强——代码模板手册

> 复制后按需改前缀（如 `mp-` → 模块缩写）。
>
> **颜色规范**：所有颜色必须通过 `color-mix(in srgb, var(--token) X%, transparent)` 引用主题变量，禁止在业务 SCSS/TS 中写任何硬编码 HEX/RGB/RGBA 颜色值。
>
> | 用途              | 变量                                  |
> | ----------------- | ------------------------------------- |
> | 主高光（蓝）      | `--art-primary`                       |
> | 积极/增长（绿）   | `--art-success`                       |
> | 警示（橙）        | `--art-warning`                       |
> | 危险（红）        | `--art-danger`                        |
> | 卡片背景          | `--default-box-color`                 |
> | 页面背景          | `--default-bg-color`                  |
> | 灰阶（最亮→最暗） | `--art-gray-900` … `--art-gray-100`   |
> | 正文 / 辅助文字   | `--text-primary` / `--text-secondary` |

---

## §A 页面级极光背景

```scss
/* index.vue <style scoped> */
.{module}-page {
  position: relative;
  overflow: hidden;

  /* 极光辐射渐变层 */
  &::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(ellipse 75% 55% at 8% 8%,
        color-mix(in srgb, var(--art-success) 14%, transparent) 0%, transparent 52%),
      radial-gradient(ellipse 65% 50% at 92% 88%,
        color-mix(in srgb, var(--art-primary) 12%, transparent) 0%, transparent 52%),
      radial-gradient(ellipse 45% 40% at 48% 48%,
        color-mix(in srgb, var(--art-warning) 8%,  transparent) 0%, transparent 50%),
      radial-gradient(ellipse 55% 45% at 75% 15%,
        color-mix(in srgb, var(--art-danger)  6%,  transparent) 0%, transparent 45%);
    animation: aurora-drift 14s ease-in-out infinite alternate,
               bg-flow     22s ease-in-out infinite alternate;
  }

  /* 网格纹理 */
  &::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background-image:
      linear-gradient(color-mix(in srgb, var(--art-gray-900) 3%, transparent) 1px, transparent 1px),
      linear-gradient(90deg, color-mix(in srgb, var(--art-gray-900) 3%, transparent) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 85% 75% at 50% 35%, black 18%, transparent 72%);
  }

  > *:not(.page-fx) { position: relative; z-index: 1; }
}

/* 旋转锥形光（放在 HTML 里作独立元素：<div class="page-fx" aria-hidden="true" />） */
.page-fx {
  position: absolute;
  inset: -12%;
  z-index: 0;
  pointer-events: none;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    color-mix(in srgb, var(--art-primary) 4%, transparent) 72deg,
    transparent 144deg,
    color-mix(in srgb, var(--art-success) 4%, transparent) 216deg,
    transparent 288deg,
    color-mix(in srgb, var(--art-warning) 3%, transparent) 340deg,
    transparent 360deg
  );
  opacity: 0.65;
  filter: blur(1px);
  animation: page-fx-spin 48s linear infinite;
}

@keyframes aurora-drift {
  0%   { opacity: .72; filter: hue-rotate(0deg);   transform: scale(1) translate(0,0); }
  50%  { opacity: 1;   filter: hue-rotate(18deg);  transform: scale(1.06) translate(1.2%,-1.2%); }
  100% { opacity: .82; filter: hue-rotate(-12deg); transform: scale(1) translate(-1.2%,1.2%); }
}

@keyframes page-fx-spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .{module}-page::before,
  .page-fx { animation: none; }
}
```

---

## §B 入场动画（slide-up）

```scss
/* 各区块按延迟错开 */
.top-row {
  animation: slide-up 0.6s var(--ease-out) both;
  animation-delay: 0.1s;
}
.data-row {
  animation: slide-up 0.6s var(--ease-out) both;
  animation-delay: 0.25s;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .top-row,
  .data-row {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

---

## §C 卡片底层 mixin（`*-card-fx.scss`）

```scss
/* 在模块 styles/ 目录下新建，各面板 @import 后 @include */

@mixin neon-stack {
  background-color: color-mix(in srgb, var(--default-box-color) 94%, transparent);
  background-image:
    radial-gradient(
      ellipse 95% 60% at 100% -8%,
      color-mix(in srgb, var(--art-primary) 18%, transparent) 0%,
      transparent 44%
    ),
    radial-gradient(
      ellipse 70% 50% at -8% 108%,
      color-mix(in srgb, var(--art-success) 15%, transparent) 0%,
      transparent 42%
    ),
    radial-gradient(
      ellipse 50% 38% at 78% 102%,
      color-mix(in srgb, var(--art-warning) 11%, transparent) 0%,
      transparent 48%
    ),
    linear-gradient(
      168deg,
      color-mix(in srgb, var(--art-gray-300) 82%, transparent) 0%,
      color-mix(in srgb, var(--default-box-color) 97%, transparent) 50%,
      color-mix(in srgb, var(--default-bg-color) 58%, transparent) 100%
    );
  border-color: color-mix(in srgb, var(--art-gray-500) 48%, transparent);
  box-shadow:
    0 14px 48px rgb(0 0 0 / 32%),
    0 0 0 1px color-mix(in srgb, var(--art-gray-900) 5%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--art-gray-900) 11%, transparent),
    inset 0 -12px 32px rgb(0 0 0 / 20%),
    0 0 60px color-mix(in srgb, var(--art-primary) 4%, transparent);
}

@mixin card-mesh {
  &::after {
    position: absolute;
    inset: 1px;
    z-index: 0;
    pointer-events: none;
    content: '';
    border-radius: inherit;
    opacity: 0.24;
    background-image:
      linear-gradient(
        color-mix(in srgb, var(--art-gray-900) 3.5%, transparent) 1px,
        transparent 1px
      ),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--art-gray-900) 3.5%, transparent) 1px,
        transparent 1px
      ),
      radial-gradient(
        ellipse 80% 50% at 50% -10%,
        color-mix(in srgb, var(--art-gray-900) 5%, transparent) 0%,
        transparent 55%
      );
    background-size:
      20px 20px,
      20px 20px,
      100% 100%;
    mask-image: linear-gradient(180deg, black 0%, rgb(0 0 0 / 50%) 70%, transparent 100%);
  }
}
```

---

## §D 卡片悬浮抬起 mixin

```scss
@mixin panel-hover-lift {
  /* 禁止 transition: all，必须显式列属性 */
  transition:
    transform 0.4s var(--ease-out),
    box-shadow 0.45s var(--ease-out),
    border-color 0.35s var(--ease-default);

  &:hover {
    transform: translateY(-6px);
    border-color: color-mix(in srgb, var(--art-primary) 48%, transparent);
    box-shadow:
      0 24px 64px rgb(0 0 0 / 40%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 16%, transparent),
      inset 0 1px 0 color-mix(in srgb, var(--art-gray-900) 14%, transparent),
      0 0 64px color-mix(in srgb, var(--art-primary) 12%, transparent),
      0 0 100px color-mix(in srgb, var(--art-success) 5%, transparent);
  }

  &:active {
    transform: translateY(-3px);
    transition-duration: 0.12s;
  }
}

/* prefers-reduced-motion 必须配套 */
@media (prefers-reduced-motion: reduce) {
  .panel {
    transition: none;
    &:hover {
      transform: none;
    }
    &:active {
      transform: none;
    }
  }
}
```

---

## §E 标题渐变 + 跟手动效 mixin

```scss
@mixin title-gradient {
  font-weight: 700;
  letter-spacing: 0.02em;
  background-color: transparent;
  background-image: linear-gradient(
    95deg,
    var(--text-primary) 0%,
    var(--art-primary) 45%,
    var(--art-success) 100%
  );
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 与 panel-hover-lift 配合：标题跟手滑动 + 发光 */
@mixin panel-header-title-hover {
  .panel__header .title {
    transition:
      transform 0.35s var(--ease-out),
      filter 0.35s var(--ease-out);
  }

  &:hover .panel__header .title {
    transform: translateX(5px) scale(1.03);
    filter: drop-shadow(0 0 16px color-mix(in srgb, var(--art-success) 35%, transparent));
  }
}
```

---

## §F 旋转渐变边框

> 需要 `@property --border-angle`（Chromium 85+，现代浏览器均支持）。

```scss
/* 在使用它的组件 <style scoped> 顶部声明 */
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.card {
  position: relative;

  &::before {
    position: absolute;
    inset: -1px;
    z-index: 1;
    pointer-events: none;
    content: '';
    background: conic-gradient(
      from var(--border-angle, 0deg) at 50% 50%,
      transparent 0deg,
      color-mix(in srgb, var(--art-success) 25%, transparent) 60deg,
      transparent 120deg,
      color-mix(in srgb, var(--art-primary) 20%, transparent) 200deg,
      transparent 280deg,
      color-mix(in srgb, var(--art-warning) 15%, transparent) 340deg,
      transparent 360deg
    );
    border-radius: inherit;
    mask:
      linear-gradient(white 0 0) content-box,
      linear-gradient(white 0 0);
    mask-composite: exclude;
    padding: 1px;
    animation: border-spin 6s linear infinite;
  }
}

@keyframes border-spin {
  to {
    --border-angle: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card::before {
    animation: none;
  }
}
```

---

## §G 骨架屏（ElSkeleton 用法）

```vue
<!-- 子卡片组件 -->
<template>
  <div class="panel">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <!-- 模拟标题 -->
        <div class="panel__header">
          <ElSkeletonItem variant="text" style="width:38%;height:16px" />
        </div>
        <!-- 模拟内容区（按实际布局仿形） -->
        <div class="panel__body" style="display:flex;flex-direction:column;gap:12px;padding:16px">
          <ElSkeletonItem variant="circle" style="width:140px;height:140px;align-self:center" />
          <ElSkeletonItem variant="text" style="width:100%;height:14px" />
          <ElSkeletonItem variant="text" style="width:80%;height:14px" />
        </div>
      </template>

      <template #default>
        <!-- 真实内容 -->
        <div class="panel__header"
          ><span class="title">{{ title }}</span></div
        >
        <div class="panel__body">...</div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  withDefaults(defineProps<{ loading?: boolean; ... }>(), { loading: false })
</script>
```

```vue
<!-- 父页面 index.vue：统一 cardLoading，去掉整页 v-loading -->
<script setup lang="ts">
  const cardLoading = computed(() => loading.value || detailLoading.value)
</script>

<!-- 传给每个子卡片 -->
<MyCard :loading="cardLoading" ... />
```

---

## §H 圆环/进度初始入场动画

```vue
<script setup lang="ts">
  import { ref, watch, nextTick, computed } from 'vue'
  import { useTransition, TransitionPresets, usePreferredReducedMotion } from '@vueuse/core'

  const props = defineProps<{ loading: boolean; score: number }>()

  const reduceMotion = usePreferredReducedMotion()
  const ringTarget = ref(0)
  const ringValue = useTransition(ringTarget, {
    duration: computed(() => (reduceMotion.value ? 1 : 1150)),
    transition: TransitionPresets.easeOutCubic
  })

  const ringRounded = computed(() => Math.round(ringValue.value))
  const ringForEl = computed(() => Math.min(100, Math.max(0, Number(ringValue.value.toFixed(2)))))

  watch(
    () => [props.loading, props.score] as const,
    async ([ld, score]) => {
      if (ld) {
        ringTarget.value = 0
        return
      }
      const next = Math.min(100, Math.max(0, score))
      await nextTick()
      if (reduceMotion.value) {
        ringTarget.value = next
        return
      }
      ringTarget.value = 0
      requestAnimationFrame(() => {
        ringTarget.value = next
      })
    },
    { immediate: true }
  )
</script>

<template>
  <ElProgress type="circle" :percentage="ringForEl" :stroke-width="10" :width="140">
    <template #default>
      <div class="ring-score">{{ ringRounded }}%</div>
    </template>
  </ElProgress>
</template>

<style scoped>
  /* 去掉 EP 自带 stroke-dasharray 过渡，避免与 useTransition 插值冲突 */
  :deep(.el-progress--circle svg path:nth-of-type(2)) {
    transition:
      stroke-dasharray 0s linear,
      stroke 0.25s ease,
      opacity 0.25s ease !important;
  }
</style>
```

---

## §I 数据行悬浮高光

```scss
.table-wrapper {
  background: linear-gradient(
    165deg,
    color-mix(in srgb, var(--default-box-color) 55%, transparent),
    color-mix(in srgb, var(--default-box-color) 28%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--art-gray-400) 28%, transparent);
  border-radius: 12px;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--art-gray-900) 5%, transparent),
    0 4px 20px rgb(0 0 0 / 12%);
  padding: 6px 4px 10px;
}

.row {
  position: relative;
  padding: 9px 10px 9px 12px;
  margin: 0 2px;
  isolation: isolate;
  border: 1px solid transparent;
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0.92;
  transition:
    background-color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);

  /* 左侧高光条 */
  &::before {
    position: absolute;
    top: 50%;
    left: 3px;
    z-index: 0;
    width: 3px;
    height: 0;
    content: '';
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--art-success) 90%, transparent) 0%,
      color-mix(in srgb, var(--art-success) 85%, transparent) 50%,
      color-mix(in srgb, var(--art-primary) 75%, transparent) 100%
    );
    border-radius: 3px;
    opacity: 0;
    transition:
      height var(--duration-normal) var(--ease-out),
      opacity var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out);
    transform: translateY(-50%) scaleY(0.35);
  }

  .cell {
    position: relative;
    z-index: 1;
  }

  &:hover {
    z-index: 2;
    background: linear-gradient(
      100deg,
      color-mix(in srgb, var(--art-success) 10%, transparent) 0%,
      color-mix(in srgb, var(--art-gray-300) 72%, transparent) 32%,
      color-mix(in srgb, var(--art-gray-300) 58%, transparent) 100%
    );
    border-color: color-mix(in srgb, var(--art-success) 32%, transparent);
    opacity: 1;
    box-shadow:
      0 10px 28px rgb(0 0 0 / 32%),
      inset 0 0 0 1px color-mix(in srgb, var(--art-primary) 14%, transparent),
      0 0 32px color-mix(in srgb, var(--art-success) 14%, transparent);
    transform: translateX(5px) translateY(-3px);

    &::before {
      height: 62%;
      opacity: 1;
      transform: translateY(-50%) scaleY(1);
    }
  }

  &:active {
    transform: translateX(3px) translateY(-1px);
    transition-duration: var(--duration-fast);
  }
}

@media (prefers-reduced-motion: reduce) {
  .row {
    transition:
      background-color 0.2s,
      opacity 0.2s,
      box-shadow 0.2s,
      border-color 0.2s;
    &::before {
      display: none;
    }
    &:hover,
    &:active {
      transform: none;
    }
  }
}
```

---

## §J ECharts 折线/面积图增强

> ECharts option 在 JavaScript 运行时构建，无法直接使用 CSS 变量语法。使用下方 `getCssColor` 工具函数在 `buildOption()` 内读取当前主题值，确保深/浅色模式均正确。

```ts
/**
 * 读取 CSS 变量的当前计算色值，并组装带透明度的 rgba 字符串。
 * 在 buildOption() 内调用，每次图表重建时都能读到最新主题值。
 */
function getCssColor(varName: string, alpha = 1): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  if (alpha >= 1) return raw
  // 通过临时元素将任意格式（hex / oklch）解析为浏览器标准 rgb()
  const el = document.createElement('span')
  el.style.color = raw
  document.documentElement.appendChild(el)
  const rgb = getComputedStyle(el).color // "rgb(59, 130, 246)"
  document.documentElement.removeChild(el)
  return rgb.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
}
```

```ts
// buildOption() 片段
function buildOption() {
  const primary = getCssColor('--art-primary')
  const success = getCssColor('--art-success')

  const series = [
    {
      type: 'line',
      smooth: true,
      symbolSize: 8,
      lineStyle: {
        width: 3,
        shadowBlur: 12,
        shadowColor: getCssColor('--art-success', 0.35),
        shadowOffsetY: 2,
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: getCssColor('--art-primary', 0.98) },
          { offset: 0.5, color: getCssColor('--art-success', 0.98) },
          { offset: 1, color: getCssColor('--art-success', 0.98) }
        ])
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: getCssColor('--art-primary', 0.32) },
          { offset: 1, color: getCssColor('--art-primary', 0) }
        ])
      }
    }
  ]

  return { series }
}
```

```scss
/* 图表容器：hover 微缩放 + 增强阴影 */
.chart {
  width: 100%;
  height: 216px;
  transition:
    transform 0.5s var(--ease-out),
    filter 0.5s var(--ease-out);
}

.panel:hover .chart {
  transform: scale(1.03) translateY(-2px);
  filter: drop-shadow(0 10px 36px color-mix(in srgb, var(--art-success) 18%, transparent))
    brightness(1.06);
}

@media (prefers-reduced-motion: reduce) {
  .chart {
    transition: none;
  }
  .panel:hover .chart {
    transform: none;
    filter: none;
  }
}
```

```ts
// loading 时 dispose，数据就绪时重建（避免 v-if 导致首屏丢失）
watch(
  () => props.loading,
  async (ld) => {
    if (ld) {
      chart?.dispose()
      chart = null
      return
    }
    await nextTick()
    if (!chart && chartRef.value) chart = echarts.init(chartRef.value)
    chart?.setOption(buildOption())
    chart?.resize()
  },
  { immediate: true }
)
```
