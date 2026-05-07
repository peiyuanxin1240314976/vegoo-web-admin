<template>
  <div class="notification-config-page art-full-height">
    <div class="notification-config-page__toolbar">
      <div class="notification-config-page__toolbar-fx" aria-hidden="true" />
      <div class="notification-config-page__toolbar-row">
        <div class="notification-config-page__toolbar-copy">
          <span class="notification-config-page__toolbar-line" aria-hidden="true" />
          <div class="notification-config-page__toolbar-titles">
            <span class="notification-config-page__toolbar-eyebrow">Config Management</span>
            <span class="notification-config-page__toolbar-title">飞书通知配置</span>
          </div>
          <span class="notification-config-page__toolbar-hint">
            统一管理飞书通知开关、预警触达和推送时间策略
          </span>
        </div>
      </div>
    </div>

    <section class="notification-config-page__panel" v-loading="notificationDetailLoading">
      <div class="notification-config-page__panel-fx" aria-hidden="true" />
      <div class="notification-config-page__panel-body">
        <div class="notification-two-cols grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="flex flex-col gap-8">
            <div class="notification-block">
              <div class="notification-block__title-wrap">
                <span class="text-base font-medium">飞书通知</span>
                <ArtSvgIcon
                  icon="ri:notification-3-line"
                  class="text-lg notification-block__icon"
                />
              </div>
              <ElTable
                :data="feishuNotifyList"
                border
                stripe
                class="feishu-notify-table notification-table"
              >
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

            <div class="notification-block">
              <div class="text-base font-medium mb-4 notification-block__title-wrap"
                >预警级别配置</div
              >
              <div class="grid grid-cols-3 gap-4">
                <div
                  v-for="level in alertLevels"
                  :key="level.key"
                  class="rounded-lg border border-g-300 p-3 notification-level-card"
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
                  </ElCheckboxGroup>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-8">
            <div class="notification-block">
              <div class="text-base font-medium mb-4 notification-block__title-wrap"
                >推送时间设置</div
              >
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
          </div>
        </div>

        <div class="notification-config-page__actions">
          <ElButton
            type="primary"
            round
            class="notification-config-page__btn-primary"
            v-ripple
            :loading="notificationSaveLoading"
            :disabled="notificationDetailLoading"
            @click="saveNotification"
          >
            保存设置
          </ElButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchUserCenterNotificationSettings,
    fetchUserCenterNotificationSettingsSave
  } from '@/api/user-center'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'NotificationConfig' })

  type FeishuNotifyKey = 'alert' | 'daily'
  const feishuNotifyList: { key: FeishuNotifyKey; label: string; desc: string }[] = [
    { key: 'alert', label: '预警通知', desc: '当系统检测到异常时推送' },
    { key: 'daily', label: '日报推送', desc: '每日 08:00 推送经营日报' }
  ]

  const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

  type AlertLevelKey = 'high'
  const alertLevels: { key: AlertLevelKey; label: string; bgClass: string; labelClass: string }[] =
    [
      {
        key: 'high',
        label: '',
        bgClass: 'bg-red-50 dark:bg-red-950/30',
        labelClass: 'text-red-600'
      }
    ]

  const notificationForm = reactive<Api.UserCenter.UserNotificationSettings>({
    feishu: {
      alert: true,
      daily: true
    },
    pushInWorkTime: true,
    pushStartTime: '08:00',
    pushEndTime: '22:00',
    pushWeekdays: [1, 2, 3, 4, 5],
    alertChannels: {
      high: ['feishu']
    }
  })

  const notificationDetailLoading = ref(false)
  const notificationSaveLoading = ref(false)
  let notificationFetchSeq = 0

  function applyNotificationSettings(data: Api.UserCenter.UserNotificationSettings) {
    notificationForm.feishu.alert = data.feishu.alert
    notificationForm.feishu.daily = data.feishu.daily
    notificationForm.alertChannels.high = [
      ...(data.alertChannels.high?.length ? data.alertChannels.high : ['feishu'])
    ]
    notificationForm.pushInWorkTime = data.pushInWorkTime
    notificationForm.pushStartTime = data.pushStartTime
    notificationForm.pushEndTime = data.pushEndTime
    notificationForm.pushWeekdays = [...data.pushWeekdays]
  }

  async function loadNotificationSettings() {
    const seq = ++notificationFetchSeq
    notificationDetailLoading.value = true
    try {
      const data = await fetchUserCenterNotificationSettings()
      if (seq !== notificationFetchSeq) return
      applyNotificationSettings(data)
    } catch {
      // 请求层已提示；保留表单默认值以便继续操作
    } finally {
      if (seq === notificationFetchSeq) notificationDetailLoading.value = false
    }
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

  const saveNotification = async () => {
    const payload: Api.UserCenter.UserNotificationSettings = {
      feishu: { ...notificationForm.feishu },
      alertChannels: { high: [...notificationForm.alertChannels.high] },
      pushInWorkTime: notificationForm.pushInWorkTime,
      pushStartTime: notificationForm.pushStartTime,
      pushEndTime: notificationForm.pushEndTime,
      pushWeekdays: [...notificationForm.pushWeekdays]
    }
    notificationSaveLoading.value = true
    try {
      await fetchUserCenterNotificationSettingsSave(payload)
      ElMessage.success('通知设置已保存')
    } catch {
      // 请求层已提示
    } finally {
      notificationSaveLoading.value = false
    }
  }

  onMounted(() => {
    void loadNotificationSettings()
  })
</script>

<style scoped lang="scss">
  .notification-config-page {
    --page-border: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --panel-border: color-mix(in srgb, var(--el-color-primary) 18%, transparent);
    --panel-soft-bg: color-mix(in srgb, var(--default-box-color) 92%, transparent);
    --panel-soft-bg-2: color-mix(in srgb, var(--default-box-color) 84%, transparent);
    --title-color: color-mix(in srgb, var(--text-primary) 94%, white 6%);

    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100%;
    padding: 24px;
    overflow-x: clip;
    background: var(--default-bg-color);
    isolation: isolate;
  }

  .notification-config-page::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    content: '';
    background:
      radial-gradient(
        ellipse 52% 40% at 90% 0%,
        color-mix(in srgb, var(--el-color-primary) 20%, transparent) 0%,
        transparent 58%
      ),
      radial-gradient(
        ellipse 45% 30% at 8% 5%,
        color-mix(in srgb, var(--theme-color) 16%, transparent) 0%,
        transparent 62%
      );
    mask-image: linear-gradient(to bottom, black 0%, black 35%, transparent 64%);
  }

  .notification-config-page > * {
    position: relative;
    z-index: 1;
  }

  .notification-config-page__toolbar {
    position: relative;
    margin-bottom: 16px;
    overflow: hidden;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 44px rgb(0 0 0 / 16%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 7%, transparent);
  }

  .notification-config-page__toolbar-fx {
    position: absolute;
    inset: -60% -10% 38%;
    pointer-events: none;
    background: conic-gradient(
      from 210deg at 72% 38%,
      color-mix(in srgb, var(--el-color-primary) 16%, transparent),
      color-mix(in srgb, var(--theme-color) 12%, transparent),
      color-mix(in srgb, var(--art-success) 8%, transparent),
      color-mix(in srgb, var(--el-color-primary) 16%, transparent)
    );
    filter: blur(42px);
    opacity: 0.54;
  }

  .notification-config-page__toolbar-row {
    position: relative;
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    background:
      linear-gradient(135deg, var(--panel-soft-bg), var(--panel-soft-bg-2)),
      linear-gradient(
        118deg,
        color-mix(in srgb, var(--theme-color) 8%, transparent),
        color-mix(in srgb, var(--el-color-primary) 6%, transparent)
      );
  }

  .notification-config-page__toolbar-row::after {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary) 42%, transparent) 35%,
      color-mix(in srgb, var(--theme-color) 36%, transparent) 68%,
      transparent 100%
    );
    opacity: 0.88;
  }

  .notification-config-page__toolbar-copy {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 4px 12px;
    align-items: center;
    min-width: 0;
  }

  .notification-config-page__toolbar-line {
    display: inline-block;
    grid-row: 1 / span 2;
    width: 4px;
    height: 36px;
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--el-color-primary) 70%, transparent),
      color-mix(in srgb, var(--theme-color) 55%, transparent)
    );
    border-radius: 999px;
    box-shadow: 0 0 18px color-mix(in srgb, var(--el-color-primary) 28%, transparent);
  }

  .notification-config-page__toolbar-titles {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .notification-config-page__toolbar-eyebrow {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    opacity: 0.65;
  }

  .notification-config-page__toolbar-title {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    background-image: linear-gradient(
      105deg,
      var(--title-color) 0%,
      color-mix(in srgb, var(--el-color-primary) 72%, var(--title-color) 28%) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .notification-config-page__toolbar-hint {
    grid-column: 2;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .notification-config-page__panel {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    background:
      linear-gradient(180deg, var(--panel-soft-bg) 0%, var(--panel-soft-bg-2) 100%),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--el-color-primary) 5%, transparent),
        color-mix(in srgb, var(--theme-color) 4%, transparent)
      );
    isolation: isolate;
    backdrop-filter: blur(18px);
    border: 1px solid var(--page-border);
    border-radius: 20px;
    box-shadow:
      0 18px 48px rgb(0 0 0 / 14%),
      0 0 0 1px color-mix(in srgb, var(--el-color-primary) 7%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
  }

  .notification-config-page__panel::before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 2;
    height: 2px;
    pointer-events: none;
    content: '';
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--el-color-primary) 42%, transparent) 40%,
      color-mix(in srgb, var(--theme-color) 32%, transparent) 70%,
      transparent 100%
    );
    opacity: 0.8;
  }

  .notification-config-page__panel-fx {
    position: absolute;
    inset: -30% 20% 45%;
    z-index: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 55% at 18% 0%,
      color-mix(in srgb, var(--el-color-primary) 18%, transparent) 0%,
      transparent 62%
    );
    filter: blur(32px);
    opacity: 0.52;
  }

  .notification-config-page__panel-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 18px;
    overflow: auto;
  }

  .notification-block {
    padding: 14px;
    background:
      radial-gradient(
        ellipse 92% 70% at 12% 0%,
        color-mix(in srgb, var(--el-color-primary) 9%, transparent) 0%,
        transparent 58%
      ),
      linear-gradient(
        165deg,
        color-mix(in srgb, var(--default-box-color) 96%, transparent) 0%,
        color-mix(in srgb, var(--default-box-color) 88%, transparent) 100%
      );
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    box-shadow:
      0 8px 24px rgb(0 0 0 / 6%),
      inset 0 1px 0 color-mix(in srgb, white 6%, transparent);
  }

  .notification-block__title-wrap {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .notification-block__icon {
    color: var(--text-secondary);
  }

  .notification-level-card {
    border-color: color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    transition:
      border-color var(--duration-normal) var(--ease-out),
      box-shadow var(--duration-normal) var(--ease-out);
  }

  .notification-level-card:hover {
    border-color: color-mix(in srgb, var(--el-color-primary) 46%, transparent);
    box-shadow: 0 10px 20px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
  }

  .notification-config-page__actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    margin-top: 14px;
    border-top: 1px solid color-mix(in srgb, var(--el-color-primary) 18%, transparent);
  }

  .notification-config-page__btn-primary.el-button--primary {
    font-weight: 600 !important;
    box-shadow:
      0 10px 22px color-mix(in srgb, var(--el-color-primary) 28%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 14%, transparent) !important;
    transition:
      box-shadow var(--duration-normal) var(--ease-out),
      transform var(--duration-normal) var(--ease-out),
      filter var(--duration-normal) var(--ease-out);
  }

  .notification-config-page__btn-primary.el-button--primary:hover {
    filter: brightness(1.04);
    box-shadow:
      0 12px 28px color-mix(in srgb, var(--el-color-primary) 34%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 18%, transparent) !important;
    transform: translateY(-1px);
  }

  .notification-table:deep(.el-table) {
    --el-table-border-color: color-mix(in srgb, var(--el-color-primary) 16%, transparent);
    --el-table-header-bg-color: color-mix(in srgb, var(--default-box-color) 90%, transparent);
    --el-table-tr-bg-color: color-mix(in srgb, var(--default-box-color) 98%, transparent);
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--el-color-primary) 8%, transparent);

    border-radius: 10px;
  }

  .notification-table:deep(.el-table th.el-table__cell) {
    color: var(--text-secondary);
  }

  .notification-table:deep(.el-table td.el-table__cell) {
    color: var(--text-primary);
  }

  .notification-config-page:deep(.el-input__wrapper),
  .notification-config-page:deep(.el-checkbox__inner),
  .notification-config-page:deep(.el-radio__inner) {
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 18%, transparent) inset;
  }

  .notification-config-page:deep(.el-input__wrapper.is-focus),
  .notification-config-page:deep(.el-input__wrapper:hover) {
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--el-color-primary) 44%, transparent) inset;
  }

  .notification-config-page:deep(.el-checkbox__input.is-checked .el-checkbox__inner),
  .notification-config-page:deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: var(--el-color-primary);
  }

  @media (width <= 768px) {
    .notification-config-page {
      padding: 16px;
    }

    .notification-config-page__toolbar-row {
      padding: 14px;
    }

    .notification-config-page__panel-body {
      padding: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .notification-level-card,
    .notification-config-page__btn-primary.el-button--primary {
      transition: none;
    }

    .notification-config-page__btn-primary.el-button--primary:hover {
      transform: none;
    }
  }
</style>
