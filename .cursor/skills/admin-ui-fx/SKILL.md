---
name: admin-ui-fx
description: >-
  为 vegoo-web-admin 项目页面/卡片添加炫酷 UI 效果的标准流程，涵盖：模块色板与鲜明度对比、 页面整体背景分层、卡片个性化（含 ElCard 覆盖）、极光背景、网格纹理、卡片悬浮/霓虹发光、 旋转渐变边框、骨架屏加载、环形进度入场动画、数据行悬浮高光、数据表列左对齐、ECharts 样式增强、 入场动画、prefers-reduced-motion 无障碍适配。 Use when the user asks to 优化/美化/炫酷 某个页面或模块的 UI 效果， 或提到「加骨架屏」「悬浮效果」「动效」「入场动画」「发光」「渐变」「初始动画」 「色板」「对比度」「页面背景」「卡片样式」「霓虹」「表格对齐」「表头对齐」。
---

# Admin UI 视效增强（admin-ui-fx）

**参考实现（两档对照）**

| 风格倾向 | 路径 | 说明 |
| --- | --- | --- |
| 相对柔和、绩效向 | `src/views/user-growth/my-performance/`、`styles/mp-card-fx.scss` | patterns.md 默认参数接近此档 |
| **高饱和霓虹、数据大屏向** | `src/views/user-growth/ad-performance/`、`styles/ap-card-fx.scss`、`index.vue` 页面背景 | 色块 alpha 更高、`box-shadow` 层次更重 |

详细代码模板见 [patterns.md](patterns.md)。**全局颜色角色与 CSS 变量**以 `.cursor/rules/project-conventions.mdc`（颜色规范）与 `src/assets/styles/core/tailwind.css` 为准；本 Skill 规定的是**在 token 之上**如何做模块级霓虹与分层，避免硬编码脱离语义。

---

## 一、接到视效优化任务时必须先做的两件事

1. **读懂目标页面结构**：先读页面入口 `index.vue`、composable 里的加载状态字段（`loading`、`detailLoading` 等）、各子卡片组件。
2. **查共享样式 mixin 是否可直接复用**：各业务模块的 `styles/*-card-fx.scss` **按模块隔离**，勿把 A 模块的 mixin 当全局用。若目标模块已有 `*-card-fx.scss`，直接 `@import` 并 `@include`；若没有，在 `views/<模块>/<页面>/styles/` 下新建，并把本文 **「三」** 中的 mixin 能力从 patterns.md 拷入后按 **「二」** 调色。

---

## 二、模块色板、对比度、页面整体背景与卡片个性化（设计规范）

### 2-1 与项目 Token 的关系（必须先读）

- **页面最底、卡片容器背景**：优先使用已有变量，如 `--default-bg-color`、`--default-box-color`，与深色/浅色主题一致。
- **霓虹中的「品牌色语义」**：发光色必须映射到已有角色，而非新建临时色值——主高光对应 `--art-primary`，积极/增长对应 `--art-success`，警示对应 `--art-warning`，危险对应 `--art-danger`。
- **正文与标签**：卡片内标题以外的文案仍用语义文字 token：`--text-primary` / `--text-secondary` 等（Tailwind 如 `text-text-primary`），**不要用渐变字 mixin 糊满大段正文**，保证可读性。
- **动效 token**：过渡使用 `--duration-*`、`--ease-*`（禁止 `transition: all`）。

实现时使用 **主题变量 + 透明度混合**（如 `color-mix(in srgb, var(--art-primary) 38%, transparent)`）调节同一角色的鲜明度；**禁止**在业务 SCSS/TS 中写任何硬编码 HEX/RGB/RGBA 颜色。

### 2-2 鲜明度与对比度（页面 vs 卡片）

目标：背景层「氛围」、卡片层「可读 + 可点」、数据「一眼能扫」。

1. **页面背景**：保持偏暗、略透（极光/网格仅作氛围），用 **`mask-image` 自上而下淡出**，避免与卡片抢对比。
2. **卡片霓虹底**：深色底 + 多层 `radial-gradient` + 底层 `linear-gradient`；**边缘识别**靠：
   - `border-color` 使用半透明主题主色（如 `color-mix(in srgb, var(--art-primary) 28%, transparent)`）；
   - **多层 `box-shadow`**：外投影 + `0 0 0 1px` 细描边 + **inset 顶部高光** + **inset 底部暗角**，hover 时再加强光晕（见各模块 `*-panel-hover` mixin）。
3. **卡片与页面分离**：卡片默认态就要有可见轮廓；hover 时 `translateY` + 更强 `box-shadow`，避免「飘在背景上分不清边界」。
4. **图表**（ECharts）：坐标、分割线用低对比灰；**系列色**保持饱和，与 `二-1` 角色一致，tooltip 背景略实、保证文字对比。

**两档参考**：`mp-card-fx` 渐变 alpha 较低、更克制；`ap-card-fx` 的 `ap-neon-bg` / `ap-panel-hover` 为 **高对比版**，新模块二选一为主轴，**不要**在同一路由树混用两套未重命名的 class，以免维护分裂。

### 2-3 页面整体背景（推荐分层模型）

页面根节点（如 `.{module}-page`）建议固定下列结构（与 `ad-performance` 的 `index.vue` 一致，patterns.md §A 为简化版）：

| 层级 | 实现 | 作用 |
| --- | --- | --- |
| 根 `::before` | 多层 `radial-gradient` + `mask-image: linear-gradient(to bottom, …)` | 顶部极光，向下渐隐 |
| 根 `::after` | 细网格 / 点阵 + `mask-image` | 仅上部可见，避免满屏糊 |
| 可选子元素 `.xxx-page-fx` | `conic-gradient` + `blur` + 慢速 `rotate` | 锥形氛围光；`aria-hidden="true"` |
| 内容区 | 根下直接子级（除 `.xxx-page-fx`）统一 `position: relative; z-index: 1` | 保证内容在装饰层之上 |

其它约定：

- 根节点：`position: relative`、`min-width: 0`、横向可 `overflow-x: clip` 避免极光溢出横向滚动条。
- 入场：大块区域 `animation` 错开 `animation-delay`（如 `0.05s` / `0.18s`），缓动用 `var(--ease-out)`。
- **prefers-reduced-motion**：页面级 `::before`、`.xxx-page-fx`、入场类 **一律 `animation: none`**。

### 2-4 卡片个性化（含 Element Plus `ElCard`）

业务卡片 **不要**只依赖 `ElCard` 默认 `--el-card-bg-color` 平面灰底叠霓虹，否则实色常会盖住 `background-image`。

**推荐套路**（与 `ad-performance` 子组件一致）：

1. 在 `ElCard` 根上挂模块 class（如 `.cct`、`.ad-performance-table__card`）。
2. `@include` 本模块 mixin：`neon-bg` + `panel-hover`（名称以模块文件为准，如 `ap-neon-bg`、`ap-panel-hover`）。
3. 根上设 **`--el-card-bg-color: transparent`**，让自定义 `background-color` / `background-image` 生效。
4. 根上 **`position: relative`、`overflow: hidden`、`border-radius`**（如 `14px`）与 mixin 阴影一致。
5. **`:deep(.el-card__header)` / `:deep(.el-card__body)`**：`background: transparent`；需要时分区 `border-bottom` 用半透明主色细线；内容加 **`z-index: 1`**，避免被卡片内 `::after` 网格层压住。
6. **可选装饰**：卡片顶边 `::before` 做细条渐变时，仅使用主题变量组合（如 `var(--art-warning)` / `var(--art-success)` / `var(--art-primary)`）并两端 `transparent`，再加轻微 `blur` 强化「数据面板」感；**仅**关键卡使用，避免每卡一条。

**网格叠层**：需要时 `@include ap-card-mesh`（或本模块等价 mixin），注意伪元素 `z-index: 0` 与内容层级。

**标题渐变字**（高亮标题专用）：

- 使用 mixin（如 `ap-title-gradient`）：**拆写** `background-color: transparent`、`background-image`、`background-size`，再 `-webkit-background-clip: text` / `background-clip: text` / `-webkit-text-fill-color: transparent`；**避免**单行 `background:` 简写与后续覆盖打架。
- 与卡片 hover 联动时可用 `ap-card-title-hover('.title-class')`（或本模块等价）。

**KPI 大数字**：可在数字上单独加 `text-shadow` 或弱 `filter`，**不要**把整个 KPI 块做成低对比渐变字。

### 2-5 抽离到新模块时的最小交付

在新页面落地「高对比霓虹」时，至少交付：

1. `styles/<prefix>-card-fx.scss`（mixin 库，命名带模块前缀）。
2. `index.vue` 页面根背景（`::before` / `::after` / 可选 `page-fx`）+ 入场 + reduced-motion。
3. 各 `ElCard` 根 class + `--el-card-bg-color: transparent` + `:deep` 透底。
4. 检查清单见 **「五」**。

### 2-6 数据表格（`ElTable`）列对齐：内容左对齐 ★默认

与大屏/霓虹卡片一起做数据表时，**数据列（含金额、比率、ROI、计数等数值列）统一左对齐**，与标题区「左起扫读」一致；**不要用**「数字列默认右对齐」的习惯堆在本项目的主数据表里。

**实现要点**

1. **`ElTableColumn`**：数据列设 `align="left"`（Element Plus 表头与单元格会跟随；如需单独控制可用 `header-align`）。
2. **列配置数组**：若用 `v-for` + `ColumnDef`（如 `align?: 'left' | 'center' | 'right'`），默认值应为 `'left'`，仅对少数列例外。
3. **自定义列「操作」**：`label="操作"` 等固定列可保留 `align="center"`，便于链接/按钮视觉居中。
4. **进度条 + 百分比**：若单元格内为「横条 + 右侧百分比」布局，容器不要用 `justify-content: flex-end` 贴右；改为 **`justify-content: flex-start`**，百分比文本 **`text-align: left`**，否则在左对齐列里会出现内容仍靠右的视觉撕裂。参考：`src/views/user-growth/ad-performance/modules/ad-performance-table.vue` 中的 `.ad-performance-table__progress-cell`、`.ad-performance-table__progress-text`，以及各 `table-tabs/*.vue` 中列 `align` 与 `ALL_COLUMNS` 约定。

沿用 **`ad-performance`** 表格子 Tab 的写法即可作为本 Skill 覆盖页面的**对齐基准**。

---

## 三、按优先级执行的效果清单

### 3-1 页面级极光背景 + 网格纹理 + 旋转锥形光 ★基础

- 在页面根 `div` 的 `::before` 叠多层 `radial-gradient` + `@keyframes` 漂移（hue-rotate + scale）。
- `::after` 做 20×20 网格，`mask-image` 压缩成椭圆避免过满。
- 另加一个 `.page-fx` 元素（`conic-gradient` + `spin` 动画）。
- 见 patterns.md §A；**高对比参数**对照「二-3」与 `ad-performance/index.vue`。

### 3-2 入场动画 ★基础

- 页面内各大区块（顶部卡片行、数据行）加 `animation: slide-up 0.6s ease-out both`，`animation-delay` 错开 0.1s。
- 见 patterns.md §B。

### 3-3 卡片底层（霓虹背景 + 网格质感） ★基础

- 新建/复用 SCSS mixin：`@mixin neon-stack` 和 `@mixin card-mesh`，在各卡片 `.panel` 上 `@include`。
- 见 patterns.md §C；**ElCard 透底与层级**见「二-4」。

### 3-4 卡片整体悬浮抬起（Hover Lift） ★基础

- `@mixin panel-hover-lift`：`translateY(-6px)` + 多层 `box-shadow` 主题色光晕（来自 `--art-primary` / `--art-success` 等语义色）。
- **禁止**用 `transition: all`，必须显式列出属性。
- 见 patterns.md §D。

### 3-5 标题渐变文字 + 跟手动效 ★基础

- `@mixin title-gradient`：`background-clip: text`，仅用主题变量做渐变（如 `var(--text-primary) -> var(--art-primary) -> var(--art-success)`）。
- `@mixin panel-header-title-hover`：hover 时 `translateX(5px) scale(1.03)` + `drop-shadow`。
- 见 patterns.md §E；**属性拆写**见「二-4」。

### 3-6 旋转渐变边框（旋转 conic 描边） ★进阶

- 需要 `@property --border-angle`（CSS Houdini，Chromium 85+）。
- `::before` 做 `conic-gradient` 蒙版边框 + `animation: border-spin`。
- 仅用于高亮顶部大卡或关键评分卡片，勿滥用。
- 见 patterns.md §F。

### 3-7 骨架屏加载（ElSkeleton） ★重要

在每个卡片组件内部用 `ElSkeleton :loading="loading" animated`：

- `#template` 插槽：用 `ElSkeletonItem` 模拟标题、内容区（圆/文本/条）。
- `#default` 插槽：真实内容。
- 父页面统一 `cardLoading = loading || detailLoading`，**去掉**整页 `v-loading`，各卡片各自骨架。
- 见 patterns.md §G。

### 3-8 环形/圆弧进度初始入场动画 ★进阶

- **不能**只靠 `ElProgress` 自带的 0.6s 过渡（切换数据时会「拼接」而非「重演」）。
- 使用 `useTransition(ringTarget, { duration: 1150, transition: TransitionPresets.easeOutCubic })`（`@vueuse/core`）。
- 监听 `loading` → `false` 时：先将 `ringTarget = 0`，`nextTick` 后再 `rAF(() => ringTarget = targetScore)`。
- `:deep` 把圆弧 path 的 `stroke-dasharray transition` 覆盖为 `0s`，避免与插值打架。
- `usePreferredReducedMotion`：减少动效时直接跳到目标值。
- 见 patterns.md §H。

### 3-9 数据表格/列表行悬浮高光 ★基础

- 行加 `position: relative; isolation: isolate; border: 1px solid transparent`。
- `::before` 做左侧竖向高光条（默认 `opacity: 0`，hover 时 `opacity: 1` + `height: 62%`）。
- hover：`translateX(5px) translateY(-3px)` + 多层 `box-shadow` + `border-color` 改为半透明主题色（`color-mix` + `var(--art-*)`）。
- 见 patterns.md §I。
- **列对齐**：数据列左对齐、进度类单元格与表头一致，详见 **「二-6」**。

### 3-10 ECharts 增强 ★进阶

- 折线/面积渐变：`echarts.graphic.LinearGradient`，颜色仅来自主题变量（例如 `--art-primary`、`--art-success`、`--art-warning` 按业务语义选用）。
- 线条加 `lineStyle.shadowBlur` + `shadowColor`。
- `areaStyle` 半透明渐变。
- `panel:hover .chart`：`scale(1.03) + drop-shadow`。
- `watch(loading)` 时先 `dispose()` 再重建。
- **KeepAlive 工作区 Tab 切回**：图表需能重算尺寸（项目内统一用 `useChart()` 已在 `onActivated` 中处理 `resize`）。
- 见 patterns.md §J。

### 3-11 prefers-reduced-motion 适配 ★必须

每个添加了动画/过渡的组件，**必须**在 `@media (prefers-reduced-motion: reduce)` 块里：

- 所有 `animation: none`。
- `transition: none`（或仅保留 `background-color/opacity` 等静态属性）。
- hover `transform: none`，伪元素隐藏 / `opacity: 0`。
- `usePreferredReducedMotion()` 用于 JS 动画（`useTransition` duration → 1ms）。

---

## 四、执行顺序建议

```
1. 定档：柔和(mp) vs 高对比(ap) —— 见「二」
2. 建 styles/*-card-fx.scss（mixin 库）
3. 改 index.vue（页面背景 + 入场动画 + reduced-motion）
4. 改各卡片组件（@import mixin → @include；ElCard 透底与 :deep 见「二-4」）
5. 加骨架屏（每卡片内 ElSkeleton）
6. 特殊组件：圆环进度（useTransition）、图表（useChart / 重建逻辑）
7. 统一跑一遍 prefers-reduced-motion 补丁
8. ReadLints 检查 + 行宽 100 修正
```

---

## 五、检查清单（执行后逐项打勾）

- [ ] 页面根节点有极光背景 `::before` + 网格 `::after`（可选 `page-fx`）
- [ ] 装饰层与内容层级正确（子块 `z-index: 1`，无遮挡点击）
- [ ] 霓虹色与 **项目 Token 角色**一致，未出现任何硬编码 HEX/RGB/RGBA
- [ ] 卡片相对页面有清晰 **border + 多层 box-shadow**（默认 + hover）
- [ ] 使用 `ElCard` 霓虹底时已设 `--el-card-bg-color: transparent`，header/body 透底
- [ ] 各卡片 `@include` 本模块 neon-bg / panel-hover（及可选 card-mesh）
- [ ] 卡片 hover 未用 `transition: all`
- [ ] 标题渐变字 **拆写** background 相关属性，且仅用于短标题
- [ ] 正文/标签使用 `--text-*` 语义色，可读性合格
- [ ] 骨架屏：`cardLoading` 从 composable 往下传，无整页 `v-loading`
- [ ] 圆环进度有 0→目标 入场动画
- [ ] 数据行有左侧高光条 + 抬起 hover
- [ ] `ElTable` 数据列（含数值）左对齐；操作列可居中；进度+百分比单元格不贴右
- [ ] 所有 `animation` 在 `prefers-reduced-motion: reduce` 下 `none`
- [ ] 所有 hover `transform` 在 `prefers-reduced-motion: reduce` 下 `none`
- [ ] JS 动画使用 `usePreferredReducedMotion`
- [ ] ReadLints 无报错
