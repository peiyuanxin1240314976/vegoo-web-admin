# 构建 / 打包常见问题排障（vegoo-web-admin）

本文用于记录在本仓库执行 `pnpm build` 时出现过的**错误/警告**、其**根因**与**可复用的解决步骤**，避免下次再次踩坑。

> 适用环境：Windows 10/11 + Node >= 20.19.0 + pnpm >= 8.8.0（项目规范见 `.cursor/rules/project-conventions.mdc`）。

---

## 1）`vue-tsc` 大量报错：`element-plus/es/index.d.ts is not a module (TS2306)`

### 现象

- `pnpm build` 在 `vue-tsc --noEmit` 阶段失败
- 控制台出现大量类似错误（几十处甚至更多）：
  - `error TS2306: File '.../element-plus/es/index.d.ts' is not a module.`

### 根因（高概率）

本地依赖损坏：`node_modules` 下的 `element-plus/es/index.d.ts` 出现 **0 字节空文件**（或内容不完整），导致 TS 无法解析 Element Plus 的模块导出。

### 如何确认

在仓库根目录检查该文件大小（示例路径以 pnpm store 布局为准）：

- **正确**：文件大小应为**数 MB**（非 0）
- **异常**：`Length = 0`

### 解决步骤（推荐）

1. **先停止本项目的 dev server / watcher**（避免 Windows 锁定 `node_modules`）：

   - 关闭 `pnpm dev` 以及其它正在占用依赖的 `node.exe` 进程

2. 强制重装依赖：

```bash
pnpm install --force
```

3. 若遇到 `ERR_PNPM_EPERM unlink ...*.node`（见下一节），先按下一节处理再重装。

4. 重装后再次确认 `element-plus/es/index.d.ts` 文件大小恢复正常，再执行：

```bash
pnpm build
```

---

## 2）Windows 安装依赖失败：`ERR_PNPM_EPERM unlink ... lightningcss*.node`

### 现象

执行 `pnpm install --force` 或正常安装时失败，常见错误：

- `ERR_PNPM_EPERM EPERM: operation not permitted, unlink '...lightningcss.win32-x64-msvc.node'`

### 根因

Windows 上 native addon（`.node`）文件常被占用（最常见是：

- `pnpm dev` / Vite / Tailwind / 其它 watcher
- 仍在运行的 `node.exe` 进程）

### 解决步骤

1. 停止项目相关进程（优先）：

   - 关闭 `pnpm dev`，再检查是否仍有 `node.exe` 占用

2. 若仍失败，删除被占用的 `.node` 文件后再重装：
   - 删除报错中提到的那个具体路径文件
   - 然后再次运行：

```bash
pnpm install --force
```

> 注意：不要盲删整个 `node_modules` 后立刻重装——如果占用进程没停，仍会复现 EPERM。

---

## 3）构建 CSS warning：`'deep' is not recognized ... Did you mean '::deep'`

### 现象

`vite build` 阶段出现类似 warning：

- `:deep(...)` 被当成普通 CSS 伪类处理，提示 `deep` 不是合法伪类

### 根因

`@vue/compiler-sfc` 只会在 `.vue` 的 `<style scoped>` 中处理 `:deep()`。

如果 `:deep()` 写在**独立的** `.css/.scss` 文件里（例如登录页 `style.css` 或全局 scss），就不会被 Vue 转换，最终被 CSS 优化器当成无效伪类，从而产生 warning。

### 解决步骤

- **不要在独立 `.css/.scss` 文件里写 `:deep()`**
- 将选择器改为普通的后代选择器即可（例如把：
  - `.xxx :deep(.el-form-item__label)` 改为 `.xxx .el-form-item__label` ）

---

## 4）Sass 弃用 warning：`Sass @import rules are deprecated`

### 现象

构建时出现 Dart Sass 警告（多条）：

- `DEPRECATION WARNING [import]: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0.`

### 根因

项目中在 `lang="scss"` 的样式里大量使用了 `@import` 引入 mixin/变量库或页面样式。

### 解决步骤（迁移到模块系统）

1. 将 `.vue` / `.scss` 里的：

```scss
@import './xxx';
```

替换为：

- **需要直接使用 mixin/变量（不加命名空间）**：

```scss
@use './xxx.scss' as *;
```

- **需要命名空间隔离**（可选）：

```scss
@use './xxx.scss' as foo;
```

2. 迁移后如果出现 `Undefined mixin`，通常是因为之前 `@import` 的“全局可见”行为消失了，需要在中间层样式文件里增加 `@forward` 透传。

例如某个“二次封装”的 fx 文件既自己用到上游 mixin，也希望下游页面继续 `@include ap-xxx`：

```scss
@forward '../path/to/ap-card-fx.scss';
@use '../path/to/ap-card-fx.scss' as *;
```

---

## 5）已知但延后处理：Undici 代理 warning（明日处理）

### 现象

构建输出中出现：

- `[UNDICI-EHPA] Warning: EnvHttpProxyAgent is experimental`

### 背景

当前环境变量存在 `HTTP_PROXY/HTTPS_PROXY` 与 `NODE_USE_ENV_PROXY=1`，Node 的网络栈会启用实验性的代理 agent，从而打印 warning。

### 处理策略（已记录，暂不在本次修）

- 明日将统一处理“如何在需要时临时启用代理、构建时关闭代理”并确保 warning 为 0。
