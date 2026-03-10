<!-- 个人中心页面：左侧用户概览+导航，右侧按 Tab 展示内容 -->
<template>
  <div class="user-center-page w-full h-full p-0 bg-transparent border-none shadow-none">
    <!-- 顶部标题 -->
    <div class="panel-row header-row mb-5">
      <div class="header-title-wrap">
        <h1 class="page-title">个人中心</h1>
        <p class="page-desc">管理个人信息、密码与通知设置</p>
      </div>
    </div>

    <div class="relative flex gap-5 max-md:flex-col max-md:mt-1">
      <!-- 左侧：用户概览 + 导航 -->
      <div class="user-center-left w-72 shrink-0 max-md:w-full max-md:mr-0">
        <div class="art-card-sm p-6">
          <!-- 用户概览 -->
          <div class="user-overview flex items-center gap-4">
            <div
              class="user-overview-avatar w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-xl font-medium text-white bg-[var(--el-color-primary)]"
            >
              {{ userInitials }}
            </div>
            <div class="user-overview-info flex-1 min-w-0 flex flex-col gap-1.5 text-left">
              <h2 class="user-overview-name text-base font-medium leading-tight">{{
                displayName
              }}</h2>
              <ElTag type="warning" size="small" class="user-overview-role w-fit rounded-md">
                {{ roleLabel }}
              </ElTag>
              <div class="user-overview-email flex items-center gap-1.5 text-sm text-g-600">
                <ArtSvgIcon icon="ri:mail-line" class="shrink-0" />
                <span class="truncate">{{ userInfo?.email || '—' }}</span>
              </div>
              <div class="user-overview-status flex items-center gap-1.5 text-sm text-g-600">
                <span class="w-2 h-2 rounded-full bg-[var(--el-color-success)] shrink-0" />
                <span>活跃</span>
              </div>
            </div>
          </div>

          <!-- 导航菜单 -->
          <nav class="mt-6 border-t border-g-300 pt-4">
            <div
              v-for="item in navItems"
              :key="item.key"
              class="nav-item flex items-center gap-3 py-2.5 px-3 rounded-lg cursor-pointer transition-colors"
              :class="activeTab === item.key ? 'nav-item--active' : ''"
              @click="activeTab = item.key"
            >
              <ArtSvgIcon :icon="item.icon" class="text-lg shrink-0" />
              <span class="text-sm">{{ item.label }}</span>
            </div>
          </nav>
        </div>
      </div>

      <!-- 右侧：内容区 -->
      <div class="user-center-right flex-1 min-w-0 max-md:w-full max-md:mt-3.5">
        <!-- 基本信息（与用户接口一致：仅邮箱可编辑） -->
        <div v-show="activeTab === 'basic'" class="art-card-sm">
          <h2 class="p-4 text-lg font-medium border-b border-g-300">基本信息</h2>
          <ElForm
            :model="form"
            class="box-border p-5 [&>.el-row_.el-form-item]:w-[calc(50%-10px)] [&>.el-row_.el-input]:w-full"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <ElRow>
              <ElFormItem label="用户名">
                <ElInput :model-value="form.username" disabled />
              </ElFormItem>
              <ElFormItem label="手机号" class="ml-5">
                <ElInput :model-value="form.phone" disabled />
              </ElFormItem>
            </ElRow>
            <ElRow>
              <ElFormItem label="角色">
                <ElInput :model-value="form.isAdminLabel" disabled />
              </ElFormItem>
              <ElFormItem label="邮箱" prop="email" class="ml-5">
                <ElInput v-model="form.email" placeholder="选填" />
              </ElFormItem>
            </ElRow>
            <div class="flex justify-end [&_.el-button]:!w-27.5">
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                :disabled="!canSaveBasicInfo"
                @click="saveBasicInfo"
              >
                保存
              </ElButton>
            </div>
          </ElForm>
        </div>

        <!-- 通知设置：左右两列 -->
        <div v-show="activeTab === 'notification'" class="art-card-sm">
          <h2 class="p-4 text-lg font-medium border-b border-g-300">通知设置</h2>
          <div class="p-5">
            <div class="notification-two-cols grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- 左列：飞书通知 + 预警级别配置 -->
              <div class="flex flex-col gap-8">
                <!-- 飞书通知 -->
                <div>
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-base font-medium">飞书通知</span>
                    <ArtSvgIcon icon="ri:notification-3-line" class="text-lg text-g-600" />
                  </div>
                  <ElTable :data="feishuNotifyList" border stripe class="feishu-notify-table">
                    <ElTableColumn label="通知类型" min-width="120">
                      <template #default="{ row }">
                        <div class="flex items-center gap-2">
                          <ArtSvgIcon icon="ri:message-2-line" class="text-g-600 shrink-0" />
                          <span class="font-medium">{{ row.label }}</span>
                        </div>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="说明" min-width="160" prop="desc">
                      <template #default="{ row }">
                        <span class="text-g-600">{{ row.desc }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="开关" width="70" align="center">
                      <template #default="{ row }">
                        <ElSwitch
                          :model-value="getFeishuNotifyValue(row)"
                          @update:model-value="onFeishuNotifyChange(row, $event)"
                        />
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>

                <!-- 预警级别配置 -->
                <div>
                  <div class="text-base font-medium mb-4">预警级别配置</div>
                  <div class="grid grid-cols-3 gap-4">
                    <div
                      v-for="level in alertLevels"
                      :key="level.key"
                      class="rounded-lg border border-g-300 p-3"
                      :class="level.bgClass"
                    >
                      <div class="text-sm font-medium mb-2" :class="level.labelClass">
                        {{ level.label }}
                      </div>
                      <ElCheckboxGroup
                        v-model="notificationForm.alertChannels[level.key]"
                        class="flex flex-col gap-1.5"
                      >
                        <ElCheckbox value="feishu" size="small" class="!mr-0">飞书卡片</ElCheckbox>
                        <ElCheckbox value="email" size="small" class="!mr-0">邮件</ElCheckbox>
                        <ElCheckbox value="platform" size="small" class="!mr-0"
                          >平台内消息</ElCheckbox
                        >
                      </ElCheckboxGroup>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 右列：推送时间设置 + 订阅的报表 -->
              <div class="flex flex-col gap-8">
                <!-- 推送时间设置 -->
                <div>
                  <div class="text-base font-medium mb-4">推送时间设置</div>
                  <div class="flex flex-col gap-4">
                    <div class="flex flex-wrap items-center gap-4">
                      <ElRadioGroup v-model="notificationForm.pushInWorkTime">
                        <ElRadio :value="true">工作时间内推送</ElRadio>
                      </ElRadioGroup>
                      <ElTimePicker
                        v-model="notificationForm.pushStartTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="开始"
                        class="w-28"
                      />
                      <span class="text-g-600">至</span>
                      <ElTimePicker
                        v-model="notificationForm.pushEndTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        placeholder="结束"
                        class="w-28"
                      />
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-sm text-g-600 shrink-0">推送日期：</span>
                      <ElCheckboxGroup
                        v-model="notificationForm.pushWeekdays"
                        class="flex flex-wrap gap-2"
                      >
                        <ElCheckbox
                          v-for="(label, idx) in weekdayLabels"
                          :key="idx"
                          :value="idx + 1"
                          class="!mr-0"
                        >
                          {{ label }}
                        </ElCheckbox>
                      </ElCheckboxGroup>
                    </div>
                  </div>
                </div>

                <!-- 订阅的报表 -->
                <div>
                  <div class="text-base font-medium mb-4">订阅的报表</div>
                  <ElTable :data="subscribedReports" border stripe class="subscribed-reports-table">
                    <ElTableColumn label="报表名称" min-width="140" prop="name">
                      <template #default="{ row }">
                        <span class="font-medium">{{ row.name }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="推送时间" min-width="120" prop="pushTime">
                      <template #default="{ row }">
                        <span class="text-g-600">{{ row.pushTime }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="推送渠道" min-width="100" prop="channel">
                      <template #default="{ row }">
                        <span class="text-g-600">{{ row.channel }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="开关" width="70" align="center">
                      <template #default="{ row }">
                        <ElSwitch v-model="row.enabled" />
                      </template>
                    </ElTableColumn>
                    <ElTableColumn label="操作" width="80" align="center">
                      <template #default="{ row }">
                        <ElButton link type="primary" size="small" @click="editReport(row)">
                          编辑
                        </ElButton>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                  <ElButton class="mt-3" :icon="Plus" @click="addReport"> 添加订阅 </ElButton>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-6 mt-2 border-t border-g-300">
              <ElButton type="primary" v-ripple @click="saveNotification"> 保存设置 </ElButton>
            </div>
          </div>
        </div>

        <!-- 密码安全：三项均需填写且不能为纯空格，才可点击保存 -->
        <div v-show="activeTab === 'password'" class="art-card-sm">
          <h2 class="p-4 text-lg font-medium border-b border-g-300">密码安全</h2>
          <ElForm :model="pwdForm" class="box-border p-5" label-width="86px" label-position="top">
            <ElFormItem label="当前密码" prop="password">
              <ElInput
                v-model="pwdForm.password"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </ElFormItem>
            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </ElFormItem>
            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </ElFormItem>
            <div class="flex justify-end [&_.el-button]:!w-27.5">
              <ElButton
                type="primary"
                class="w-22.5"
                v-ripple
                :disabled="!canSavePwd"
                @click="savePwd"
              >
                保存
              </ElButton>
            </div>
          </ElForm>
        </div>

        <!-- 飞书绑定 -->
        <div v-show="activeTab === 'feishu'" class="art-card-sm">
          <h2 class="p-4 text-lg font-medium border-b border-g-300">飞书绑定</h2>
          <div class="p-8 text-center text-g-600"> 飞书账号绑定功能开发中，敬请期待。 </div>
        </div>

        <!-- 登录记录 -->
        <div v-show="activeTab === 'login-log'" class="art-card-sm">
          <h2 class="p-4 text-lg font-medium border-b border-g-300">登录记录</h2>
          <div class="p-8 text-center text-g-600"> 登录记录功能开发中，敬请期待。 </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { fetchChangeEmail, fetchChangePwd } from '@/api/auth'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { Plus } from '@element-plus/icons-vue'

  defineOptions({ name: 'UserCenter' })

  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  type TabKey = 'basic' | 'notification' | 'password' | 'feishu' | 'login-log'
  const activeTab = ref<TabKey>('notification')
  const navItems: { key: TabKey; label: string; icon: string }[] = [
    { key: 'basic', label: '基本信息', icon: 'ri:user-3-line' },
    { key: 'notification', label: '通知设置', icon: 'ri:notification-3-line' },
    { key: 'password', label: '密码安全', icon: 'ri:lock-line' },
    { key: 'feishu', label: '飞书绑定', icon: 'ri:link' },
    { key: 'login-log', label: '登录记录', icon: 'ri:file-list-3-line' }
  ]

  const userInitials = computed(() => {
    const name = userInfo.value?.username || userInfo.value?.userName || ''
    if (!name) return 'U'
    if (/[\u4e00-\u9fa5]/.test(name)) return name.slice(0, 2)
    return name.slice(0, 2).toUpperCase()
  })

  const displayName = computed(() => userInfo.value?.username || userInfo.value?.userName || '—')
  const roleLabel = computed(() => {
    const isAdmin = userInfo.value?.isAdmin
    return isAdmin === 1 ? '管理员' : '非管理员'
  })

  const ruleFormRef = ref<FormInstance>()

  const form = reactive({
    username: '',
    phone: '',
    isAdminLabel: '',
    email: ''
  })

  /** 已填写邮箱时才允许点击保存；格式校验由表单 rules 在点击保存时触发 */
  const canSaveBasicInfo = computed(() => (form.email ?? '').trim().length > 0)

  /** 密码三项均填写且去除首尾空格后非空时才允许点击保存（不允许纯空格） */
  const canSavePwd = computed(() => {
    const a = (pwdForm.password ?? '').trim()
    const b = (pwdForm.newPassword ?? '').trim()
    const c = (pwdForm.confirmPassword ?? '').trim()
    return a.length > 0 && b.length > 0 && c.length > 0
  })

  /** 从 store 用户信息同步到表单（仅邮箱可编辑） */
  function syncFormFromUserInfo() {
    const info = userStore.getUserInfo
    form.username = info?.username || info?.userName || ''
    form.phone = info?.phone ?? ''
    form.isAdminLabel = (info?.isAdmin === 1 ? '管理员' : '非管理员') as string
    form.email = info?.email ?? ''
  }

  onMounted(syncFormFromUserInfo)
  watch(userInfo, syncFormFromUserInfo, { deep: true })

  const pwdForm = reactive({
    password: '',
    newPassword: '',
    confirmPassword: ''
  })

  const rules = reactive<FormRules>({
    email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }]
  })

  type FeishuNotifyKey = 'alert' | 'daily' | 'weekly' | 'approval' | 'dataAbnormal'
  const feishuNotifyList: { key: FeishuNotifyKey; label: string; desc: string }[] = [
    { key: 'alert', label: '预警通知', desc: '当系统检测到异常时推送' },
    { key: 'daily', label: '日报推送', desc: '每日 08:00 推送经营日报' },
    { key: 'weekly', label: '周报推送', desc: '每周一 09:00 推送周报' },
    { key: 'approval', label: '审批通知', desc: '有待审批事项时推送' },
    { key: 'dataAbnormal', label: '数据异常', desc: '数据质量问题时推送' }
  ]

  const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

  type AlertLevelKey = 'high' | 'medium' | 'low'
  const notificationForm = reactive<{
    feishu: Record<FeishuNotifyKey, boolean>
    pushInWorkTime: boolean
    pushStartTime: string
    pushEndTime: string
    pushWeekdays: number[]
    alertChannels: Record<AlertLevelKey, string[]>
  }>({
    feishu: {
      alert: true,
      daily: true,
      weekly: false,
      approval: true,
      dataAbnormal: false
    },
    pushInWorkTime: true,
    pushStartTime: '08:00',
    pushEndTime: '22:00',
    pushWeekdays: [1, 2, 3, 4, 5],
    alertChannels: {
      high: ['feishu', 'email', 'platform'],
      medium: ['feishu', 'platform'],
      low: ['feishu', 'platform']
    }
  })

  const alertLevels: { key: AlertLevelKey; label: string; bgClass: string; labelClass: string }[] =
    [
      {
        key: 'high',
        label: '高优先级',
        bgClass: 'bg-red-50 dark:bg-red-950/30',
        labelClass: 'text-red-600'
      },
      {
        key: 'medium',
        label: '中优先级',
        bgClass: 'bg-amber-50 dark:bg-amber-950/30',
        labelClass: 'text-amber-600'
      },
      {
        key: 'low',
        label: '低优先级',
        bgClass: 'bg-sky-50 dark:bg-sky-950/30',
        labelClass: 'text-sky-600'
      }
    ]

  interface SubscribedReport {
    id: number
    name: string
    pushTime: string
    channel: string
    enabled: boolean
  }

  const subscribedReports = ref<SubscribedReport[]>([
    { id: 1, name: '每日经营快报', pushTime: '每日 08:00', channel: '飞书卡片', enabled: true },
    { id: 2, name: '每周投放复盘', pushTime: '每周一 09:00', channel: '飞书卡片', enabled: true },
    { id: 3, name: '月度经营分析', pushTime: '每月1日 09:00', channel: '飞书卡片', enabled: true }
  ])

  let reportIdCounter = 4

  /** 保存基本信息：二次确认后调用修改邮箱接口并更新本地 */
  const saveBasicInfo = async () => {
    const valid = await ruleFormRef.value?.validate().catch(() => false)
    if (!valid) return
    try {
      await ElMessageBox.confirm('确定要保存当前修改吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
    } catch {
      return
    }
    const email = form.email.trim()
    await fetchChangeEmail(email)
    userStore.setUserInfo({
      ...userStore.getUserInfo,
      email
    } as Api.Auth.UserInfo)
    ElMessage.success('保存成功')
  }

  /** 保存密码：校验后调用修改密码接口 */
  const savePwd = async () => {
    const oldPassword = (pwdForm.password ?? '').trim()
    const newPwd = (pwdForm.newPassword ?? '').trim()
    const confirm = (pwdForm.confirmPassword ?? '').trim()
    if (!oldPassword || !newPwd || !confirm) {
      ElMessage.warning('请填写完整且不能为纯空格')
      return
    }
    if (newPwd !== confirm) {
      ElMessage.warning('两次输入的新密码不一致')
      return
    }
    const id = userStore.getUserInfo?.id ?? userStore.getUserInfo?.userId
    if (id == null) {
      ElMessage.warning('无法获取用户信息，请重新登录')
      return
    }
    await fetchChangePwd({ id, oldPassword, newPassword: newPwd })
    ElMessage.success('密码修改成功')
    pwdForm.password = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
  }

  const setFeishuNotify = (key: FeishuNotifyKey, value: boolean) => {
    notificationForm.feishu[key] = value
  }

  const getFeishuNotifyValue = (row: { key: FeishuNotifyKey }) => {
    return notificationForm.feishu[row.key]
  }

  const onFeishuNotifyChange = (
    row: { key: FeishuNotifyKey },
    value: string | number | boolean
  ) => {
    setFeishuNotify(row.key, Boolean(value))
  }

  const saveNotification = () => {
    ElMessage.success('通知设置已保存')
  }

  const addReport = () => {
    subscribedReports.value.push({
      id: reportIdCounter++,
      name: '新订阅报表',
      pushTime: '每日 08:00',
      channel: '飞书卡片',
      enabled: true
    })
    ElMessage.info('请点击「编辑」设置报表与推送时间')
  }

  const editReport = (report: SubscribedReport) => {
    ElMessage.info(`编辑订阅「${report.name}」功能开发中`)
  }
</script>

<style scoped>
  .user-overview-name {
    color: var(--art-gray-900);
  }

  .dark .user-overview-name {
    color: var(--art-gray-900);
  }

  .user-overview-email,
  .user-overview-status {
    color: var(--art-gray-600);
  }

  .dark .user-overview-email,
  .dark .user-overview-status {
    color: var(--art-gray-700);
  }

  .user-center-page .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .user-center-page .header-title-wrap {
    flex: 1;
  }

  .user-center-page .page-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
  }

  .user-center-page .page-desc {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: var(--art-gray-600);
  }

  .user-center-page .nav-item {
    color: var(--art-gray-700);
  }

  .user-center-page .nav-item:hover {
    background: var(--art-hover-color);
  }

  .user-center-page .nav-item--active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .dark .user-center-page .nav-item--active {
    /* color: var(--el-color-primary); */
    color: #fff;
    background: var(--el-color-primary-dark-2);
  }
</style>
