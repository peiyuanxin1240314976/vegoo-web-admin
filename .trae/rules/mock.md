---
description: 复杂页面从契约拆分、Mock 开关、API 封装、子组件自拉数到保存闭环的统一开发规范
alwaysApply: true
---

# 复杂页面 API / Mock / 组件 / 保存闭环规范

本规范适用于以下页面：

- 多列布局页面
- 多 Tab / 多子模块页面
- 左侧列表 + 中间详情 / 配置 + 右侧摘要 / 用户区页面
- 需要 mock 与真实接口并行联调的页面
- 存在局部 loading、局部 reset、局部保存的页面

目标：

- 避免大杂烩接口
- 避免顶层父组件包揽所有请求
- 避免 mock 开关粒度过粗
- 避免切换时漏请求
- 避免保存时无法稳定收集各子模块状态
- 保证“查询链路”和“保存链路”都形成完整闭环

## 1. 契约必须按 UI 边界拆分

### 1.1 核心原则

- 一个接口只服务一个明确的 UI 区块。
- 禁止一个接口返回整页所有数据，再由前端自行拆分。
- `mock/backend-api/*.json` 的拆分粒度必须与页面 UI 模块边界一致。

### 1.2 推荐拆法

- 左侧列表：`list`
- 中间 Tab A：`.../func` / `.../overview` / `.../table`
- 中间 Tab B：`.../data` / `.../chart` / `.../detail`
- 右侧用户列表：`users`
- 顶部或右上角摘要：`summary` / `kpi`
- 保存操作：`update` / `save`

### 1.3 禁止做法

- 列表、详情、摘要、用户、多个 Tab 数据全部揉进一个请求
- 依赖单个大 payload 供多个组件分食
- 一个接口通过 `type/tab` 返回多种结构完全不同的响应体

## 2. Mock 契约与 README 必须完整

### 2.1 目录要求

页面目录下至少存在：

- `mock/README.md`
- `mock/backend-api/README.md`
- `mock/backend-api/*.json`

### 2.2 backend-api/README.md 必须包含

- 父级 API 路径
- 接口清单表
- 每个接口对应哪个 UI 区域
- 为什么要拆成这些接口
- P0 / P1 优先级

### 2.3 每个 JSON 契约必须包含

- `_comment`
- `fieldDescription.request`
- `fieldDescription.response`
- `sampleRequest`
- `sampleResponse`
- `api`
- `apiSuggestion`

## 3. 数据源开关必须一接口一开关

### 3.1 配置位置

必须放在：

- `src/views/<模块>/<页面>/config/data-source.ts`

禁止：

- 放根目录 `.env`
- 在组件里直接写死 `useMock = true`
- 丢到无模块归属的全局 `utils` / `store`

### 3.2 统一结构

- 使用 `enum` 定义 endpoint
- 使用 `Record<Endpoint, boolean>` 维护开关
- 提供 `is*EndpointMock(endpoint)` 查询函数

### 3.3 规则

- 每个契约 JSON / 每个 fetch 方法必须有独立开关
- 新增接口时必须同步新增 endpoint 枚举和 mock 配置
- 多 Tab 页面绝不能只保留一个总开关

## 4. src/api 必须使用项目统一 request 风格

### 4.1 标准写法

统一参考成熟 API 文件：

- `import request from '@/utils/http'`
- `request.get<T>({ ... })`
- `request.post<T>({ url, data, showErrorMessage: false })`
- `request.put<T>({ ... })`
- `request.del<T>({ ... })`

### 4.2 绝对禁止

- `import { request } from '@/utils/http'`
- `request.post(url, data)` 这类非项目标准签名
- mock 分支返回 `{ code, data }`，而真实分支返回业务体
- API 层返回 shape 与页面读取方式不一致

### 4.3 Mock 分支要求

- mock 返回值必须与真实 API 返回值完全同构
- 如果真实请求返回业务体 `T`，mock 也必须直接返回 `T`
- 不允许单独包一层 `code` / `data`

## 5. 类型必须跟着 API 一起定义

### 5.1 API 文件中必须定义

- Query 类型
- Response 类型
- Item 类型
- UpdatePayload 类型

### 5.2 禁止

- 在组件中广泛使用 `any`
- 组件自行猜测 API 结构
- 改了组件却不改 API 类型

## 6. 父组件只管上下文，子组件自己拉数据

### 6.1 父组件职责

父组件只负责：

- 页面三列 / 多区块骨架布局
- 当前选中对象，如 `selectedRole`
- 跨区域共享上下文
- 弹窗开关
- 整页级保存动作触发

### 6.2 子组件职责

子组件负责：

- 根据父组件传入的 `id` / `selectedItem` 自己发请求
- 自己维护 `loading`
- 自己处理空态
- 自己处理 reset
- 自己监听参数变化并重拉数据

### 6.3 禁止的反模式

- 父组件一次性拉全页所有数据再 props 层层透传
- 父组件替所有子组件统一维护 loading
- 父组件代替子模块管理局部 form / tab 数据细节

## 7. 多 Tab / 多子模块切换必须显式处理

### 7.1 强制检查项

只要页面存在：

- Tab 切换
- 左侧列表切换
- 路由参数切换
- 详情对象切换

就必须检查：

- 切换后是否重新拉取对应接口
- loading 是否正确重置
- 是否残留上一对象的数据
- reset 是否回到了旧静态值
- 空态是否正确回收

### 7.2 推荐实现

```ts
watch(
  () => props.xxxId,
  () => {
    loadData()
  },
  { immediate: true }
)
```

### 7.3 无上下文时的行为

- 没有 `id` / `selectedItem` 时，组件必须清空数据
- 不允许继续显示上一对象的数据

## 8. 局部 Loading 必须跟着局部请求走

### 8.1 原则

谁发请求，谁维护 loading。

### 8.2 结果要求

- 某个 Tab 数据慢，只影响这个 Tab
- 右侧摘要请求慢，不影响左中两列
- 避免整页白屏和全局 loading 抖动

## 9. Reset 不是回到写死常量，而是回到当前对象最新值

### 9.1 正确定义

reset 的目标是：

- 回到当前选中对象的接口最新状态
- 而不是回到组件初始化时写死的 `INITIAL_FORM`

### 9.2 规则

- 接口已接入后，`reset()` 应优先重新调用 `loadData()`
- 静态初始值仅适用于接口未接入前的纯展示阶段

## 10. 保存闭环必须由“子组件导出状态 + 父面板统一组装 + 顶层统一提交”构成

### 10.1 标准分工

- 子组件 A（如功能权限）导出：
  - `getPermissionIds()`
  - 或其他当前编辑态读取方法
- 子组件 B（如数据权限）导出：
  - `getModuleDataScopes()`
  - 或其他当前表单快照读取方法
- 中间面板组件负责：
  - 聚合多个子组件暴露的方法
  - 统一组装 `UpdatePayload`
- 顶层页面负责：
  - 调用 `fetch*Update()`
  - 处理成功/失败提示
  - 成功后触发 reset / reload

### 10.2 禁止的保存方式

- 顶层页面直接猜测每个子组件内部状态
- 保存时临时从 DOM 或零散变量拼 payload
- 仅保存某一个 Tab，却遗漏其他联动区块
- 保存成功后不刷新摘要、详情、局部状态

### 10.3 推荐闭环

1. 子组件暴露 `getCurrentValue()` / `getPermissionIds()` / `getModuleDataScopes()`
2. 父面板暴露 `getSavePayload()`
3. 顶层页面点击保存时：
   - 调 `panelRef.getSavePayload()`
   - 调 `fetchUpdate(payload)`
   - 成功后提示
   - 调 `panelRef.reset()`
   - 刷新与当前对象相关的侧边摘要、用户、统计等数据

## 11. 保存成功后的刷新策略必须明确

### 11.1 至少处理以下内容

- 当前面板是否回到最新服务端值
- 右侧摘要是否同步更新
- 相关联用户 / 数量是否需要刷新
- 顶层选中对象是否需要重置或保持

### 11.2 原则

- 保存操作不是只发请求成功就结束
- 必须让用户看到最新结果
- 保存后页面状态必须与服务端状态重新对齐

## 12. 复杂页面开发顺序必须固定

按以下顺序推进：

1. 先拆 UI 边界
2. 再写 `mock/backend-api/*.json`
3. 再写 `config/data-source.ts`
4. 再写 `src/api/*.ts`
5. 再让父组件只传上下文
6. 再让子组件各自 `watch + loadData`
7. 再补局部 loading / 空态 / reset
8. 最后补保存闭环

禁止跳过中间层，直接在 `.vue` 中堆静态数据和临时请求。

## 13. 验收清单

提交前必须确认：

- 是否按 UI 边界拆成多个 JSON
- 是否每个 fetch 都有独立 mock 开关
- 是否使用项目统一 request 风格
- mock 和真实分支返回值是否同构
- 父组件是否只传上下文
- 子组件是否自己 watch 参数并拉数
- 子组件是否自己维护 loading
- reset 是否回到当前对象最新值
- 保存是否通过统一 payload 收口
- 保存后是否刷新相关摘要 / 局部状态
- 是否通过 diagnostics / vue-tsc 检查

## 14. 角色页示例范式

以 `config-management/role` 为例：

- 左侧角色列表独立接口
- 功能权限 Tab 独立接口，并由 `role-permission-func.vue` 自拉数据
- 数据权限 Tab 独立接口，并由 `role-permission-data.vue` 自拉数据
- 右侧用户列表独立接口
- 权限摘要独立接口
- 保存动作独立接口
- `index.vue` 只管理 `selectedRole` 与跨区域共享上下文
- `RolePermissionPanel` 负责统一收口保存 payload
- `src/api/config-management/role.ts` 必须完全对齐项目 request 风格
