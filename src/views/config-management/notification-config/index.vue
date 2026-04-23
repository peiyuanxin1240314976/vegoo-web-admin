<template>
  <div class="notification-config-page art-full-height">
    <div class="art-card-sm" v-loading="notificationDetailLoading">
      <h2 class="p-4 text-lg font-medium border-b border-g-300">通知设置</h2>
      <div class="p-5">
        <div class="notification-two-cols grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="flex flex-col gap-8">
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
                  </ElCheckboxGroup>
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col gap-8">
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
          </div>
        </div>

        <div class="flex justify-end pt-6 mt-2 border-t border-g-300">
          <ElButton
            type="primary"
            v-ripple
            :loading="notificationSaveLoading"
            :disabled="notificationDetailLoading"
            @click="saveNotification"
          >
            保存设置
          </ElButton>
        </div>
      </div>
    </div>
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

<style scoped lang="scss"></style>
