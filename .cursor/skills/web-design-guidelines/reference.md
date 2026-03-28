# Web Interface Guidelines — 审查规则（与上游 command.md 对齐）

**维护**：与官方 diff、锚定 commit、skills.sh 与官方冲突时如何处理 — 见同目录 **`UPSTREAM.md`**。

审阅指定文件时，将「待审查路径」代入下文中的「这些文件」，对照下面规则检查。

输出要求：简练、高信噪比；可牺牲语法完整性。

> 说明：上游原文中部分 HTML/组件名在分发时会被清空，下表按语义补全，并含本仓库 Vue/Element 补充。**条文若有出入，以官方 [command.md](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md) 为准**，并按 `UPSTREAM.md` 把变更合并回本文。

## Rules

### Accessibility

- Icon-only buttons need `aria-label`
- Form controls need `<label>` / `ElFormItem` or `aria-label`
- Interactive elements need keyboard support (e.g. `@keydown` / native `<button>`)
- `<button>` / `ElButton` for actions; `<a>` / `router-link` for navigation (not `<div @click>` for navigation)
- Images need `alt` (or `alt=""` if decorative)
- Decorative icons need `aria-hidden="true"`
- Async updates (toasts, validation) need `aria-live="polite"` where appropriate
- Prefer semantic HTML (`main`, `nav`, `section`, `header`) before ARIA
- Headings hierarchical `h1`–`h6`; skip link to main content where applicable
- `scroll-margin-top` on heading anchors

### Focus States

- Interactive elements need visible focus: Tailwind `focus-visible:ring-*` or equivalent
- Never `outline-none` / `outline: none` without a focus-visible replacement
- Prefer `:focus-visible` over `:focus` (avoid ring on mouse click only)
- Group focus with `:focus-within` for compound controls

### Forms

- Inputs need `autocomplete` and meaningful `name` where applicable
- Correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- Never block paste
- Labels clickable (`for` / wrapping / `ElFormItem` `prop`)
- Disable spellcheck on emails, codes, usernames where needed
- Checkboxes/radios: label + control share single generous hit target
- Submit: enabled until request starts; show loading during request
- Errors inline next to fields; focus first error on submit
- Placeholders end with `…` and show example pattern when used
- `autocomplete="off"` on non-auth fields to avoid password-manager false triggers
- Warn before navigation with unsaved changes (`beforeunload` / router guard)

### Animation

- Honor `prefers-reduced-motion`
- Animate `transform`/`opacity` only when possible
- Never `transition: all`—list properties explicitly
- Correct `transform-origin`
- SVG: transform wrapper with `transform-box: fill-box; transform-origin: center`
- Animations interruptible

### Typography

- `…` (ellipsis character) not `...`
- Curly quotes `"` `"` not straight `"`
- Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- Loading states: `"Loading…"`, `"Saving…"`
- `font-variant-numeric: tabular-nums` for number columns/comparisons
- `text-wrap: balance` or `text-pretty` on headings where supported

### Content Handling

- Long text: `truncate`, line-clamp, or `break-words`
- Flex children may need `min-w-0` for truncation
- Empty states—no broken UI for empty strings/arrays
- Anticipate short, average, and very long user content

### Images

- Explicit `width` and `height` (or aspect ratio) to reduce CLS
- Below-fold: `loading="lazy"`
- Above-fold: `fetchpriority="high"` where appropriate

### Performance

- Large lists (>50): virtualize or `content-visibility: auto`
- Avoid layout reads in render path
- Batch DOM reads/writes
- Prefer cheaper input handling for controlled fields
- `rel="preconnect"` for CDN/asset domains
- Critical fonts: `preload` + `font-display: swap`

### Navigation & State

- URL reflects filters, tabs, pagination, expanded panels where product-appropriate
- Real links for navigation (keyboard + modifier-click)
- Deep-link stateful UI
- Destructive actions: confirm or undo—never silent immediate delete

### Touch & Interaction

- `touch-action: manipulation`
- `-webkit-tap-highlight-color` intentional
- `overscroll-behavior: contain` in modals/drawers
- During drag: reduce stray selection; `inert` where appropriate
- `autofocus` sparingly—desktop, single primary input; avoid on mobile

### Safe Areas & Layout

- Full-bleed: `env(safe-area-inset-*)` for notches
- Fix overflow; avoid useless scrollbars
- Prefer flex/grid over JS measurement

### Dark Mode & Theming

- `color-scheme: dark` on `html` for dark themes
- Theme / meta theme-color aligned with background
- Native `<select>`: explicit `background-color` and `color` (Windows dark mode)

### Locale & i18n

- Dates/times: `Intl.DateTimeFormat`
- Numbers/currency: `Intl.NumberFormat`
- Language from `Accept-Language` / `navigator.languages`, not IP

### Hydration Safety (SSR / SSG if applicable)

- Controlled inputs need paired handlers or use uncontrolled defaults
- Guard date/time hydration mismatch
- `suppressHydrationWarning` only when necessary

### Hover & Interactive States

- Hover/active/focus affordances
- Interactive states increase contrast vs rest

### Content & Copy

- Active voice, specific CTAs ("Save API Key" not "Continue")
- Title Case for headings/buttons (team style permitting)
- Numerals for counts
- Errors: problem + how to fix
- Second person; `&` over "and" when space-constrained

### Anti-patterns (flag these)

- Disabling zoom (`user-scalable=no`, `maximum-scale=1`)
- Blocking paste
- `transition: all`
- `outline-none` without focus replacement
- `div` + click for navigation instead of link/router
- `div`/`span` pretending to be buttons
- Images without dimensions
- Huge lists without virtualization
- Inputs without labels
- Icon-only buttons without `aria-label`
- Hardcoded locale formats
- `autofocus` without clear justification

## Output Format

Group by file. Use `file:line` format (IDE clickable). Terse findings.

```text
## path/to/File.vue

path/to/File.vue:42 - icon button missing aria-label
path/to/File.vue:18 - input lacks associated label

## path/to/Other.vue

✓ pass
```

State issue + location. Skip explanation unless the fix is non-obvious. No preamble.
