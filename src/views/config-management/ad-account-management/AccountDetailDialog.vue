<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { CopyDocument, Edit, View } from '@element-plus/icons-vue'
  import type { AdAccount, AdAccountUpdatePayload } from './types'

  const props = withDefaults(
    defineProps<{
      visible: boolean
      account: AdAccount | null
      submitting?: boolean
    }>(),
    {
      submitting: false
    }
  )

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    update: [value: AdAccountUpdatePayload]
  }>()

  const isEditing = ref(false)
  const showToken = ref(false)
  const newAccountId = ref('')
  const form = ref<AdAccount | null>(null)

  function cloneAccount(account: AdAccount | null) {
    return account
      ? {
          ...account,
          adAccounts: [...account.adAccounts]
        }
      : null
  }

  watch(
    () => props.account,
    (account) => {
      form.value = cloneAccount(account)
      isEditing.value = false
      showToken.value = false
      newAccountId.value = ''
    },
    { immediate: true }
  )

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        isEditing.value = false
        showToken.value = false
        newAccountId.value = ''
      }
    }
  )

  const dialogTitle = computed(() => {
    if (!props.account) return '账户详情'
    return `${props.account.appName} / ${props.account.platform} / ${props.account.adPlatform}`
  })

  const maskedToken = computed(() => {
    const token = form.value?.token ?? ''
    if (!token) return '-'
    if (showToken.value) return token
    if (token.length <= 8) return `${token.slice(0, 2)}***`
    return `${token.slice(0, 8)}********`
  })

  const operationLogs = computed(() => {
    if (!props.account) return []
    const statusLabel = props.account.status === 'enabled' ? '已启用' : '已停用'
    return [
      {
        date: '2026-04-14',
        text: `最近状态：${statusLabel}`
      },
      {
        date: '2026-04-14',
        text: `经理账户：${props.account.managerAccount}`
      }
    ]
  })

  function close() {
    if (props.submitting) return
    emit('update:visible', false)
  }

  function enterEdit() {
    isEditing.value = true
  }

  function cancelEdit() {
    form.value = cloneAccount(props.account)
    isEditing.value = false
    newAccountId.value = ''
  }

  function addAccountId() {
    const value = newAccountId.value.trim()
    if (!value || !form.value) return
    if (!form.value.adAccounts.includes(value)) {
      form.value.adAccounts.push(value)
    }
    newAccountId.value = ''
  }

  function removeAccountId(index: number) {
    form.value?.adAccounts.splice(index, 1)
  }

  function handleSave() {
    if (!form.value) return
    if (!form.value.managerAccount.trim()) {
      ElMessage.warning('请填写经理账户')
      return
    }
    emit('update', {
      managerAccount: form.value.managerAccount.trim(),
      credential: form.value.credential.trim(),
      adAccounts: [...form.value.adAccounts],
      token: String(form.value.token ?? '').trim()
    })
  }

  async function copyToken() {
    const token = form.value?.token
    if (!token) return
    await navigator.clipboard.writeText(token)
    ElMessage.success('已复制令牌')
  }
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="640px"
    destroy-on-close
    @close="close"
  >
    <template v-if="form">
      <div class="toolbar">
        <el-button v-if="!isEditing" type="primary" plain round @click="enterEdit">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
      </div>

      <el-descriptions :column="2" border class="summary">
        <el-descriptions-item label="状态">
          <el-tag :type="form.status === 'enabled' ? 'success' : 'danger'">
            {{ form.status === 'enabled' ? '已启用' : '已停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="应用">{{ form.appName }}</el-descriptions-item>
        <el-descriptions-item label="终端平台">{{ form.platform }}</el-descriptions-item>
        <el-descriptions-item label="广告平台">{{ form.adPlatform }}</el-descriptions-item>
      </el-descriptions>

      <el-form label-position="top" class="detail-form">
        <el-form-item label="经理账户">
          <el-input
            v-if="isEditing"
            v-model="form.managerAccount"
            placeholder="请输入经理账户 ID"
          />
          <div v-else class="mono">{{ form.managerAccount }}</div>
        </el-form-item>

        <el-form-item label="凭证">
          <el-input v-if="isEditing" v-model="form.credential" placeholder="请输入凭证" />
          <div v-else class="mono">{{ form.credential || '-' }}</div>
        </el-form-item>

        <el-form-item label="广告子账户 ID">
          <div class="tag-list">
            <el-tag
              v-for="(item, index) in form.adAccounts"
              :key="item"
              :closable="isEditing"
              @close="removeAccountId(index)"
            >
              {{ item }}
            </el-tag>
            <span v-if="!form.adAccounts.length" class="empty-text">暂无广告子账户</span>
          </div>
          <div v-if="isEditing" class="tag-editor">
            <el-input
              v-model="newAccountId"
              placeholder="输入子账户 ID 后按回车或点击添加"
              @keyup.enter="addAccountId"
            />
            <el-button round @click="addAccountId">添加</el-button>
          </div>
        </el-form-item>

        <el-form-item label="令牌">
          <template v-if="isEditing">
            <el-input v-model="form.token" :type="showToken ? 'text' : 'password'">
              <template #suffix>
                <el-icon class="token-action" @click="showToken = !showToken">
                  <View />
                </el-icon>
              </template>
            </el-input>
          </template>
          <template v-else>
            <div class="token-box">
              <span class="mono">{{ maskedToken }}</span>
              <div class="token-buttons">
                <el-button text @click="showToken = !showToken">
                  <el-icon><View /></el-icon>
                  {{ showToken ? '隐藏' : '显示' }}
                </el-button>
                <el-button text :disabled="!form.token" @click="copyToken">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </div>
            </div>
          </template>
        </el-form-item>
      </el-form>

      <div class="log-section">
        <div class="log-title">操作记录</div>
        <ul class="log-list">
          <li v-for="log in operationLogs" :key="`${log.date}-${log.text}`">
            <span class="log-date">{{ log.date }}</span>
            <span>{{ log.text }}</span>
          </li>
        </ul>
      </div>
    </template>

    <template #footer>
      <div class="dialog-footer">
        <template v-if="isEditing">
          <el-button round :disabled="submitting" @click="cancelEdit">取消</el-button>
          <el-button type="primary" round :loading="submitting" @click="handleSave">保存</el-button>
        </template>
        <template v-else>
          <el-button round @click="close">关闭</el-button>
        </template>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
  }

  .summary {
    margin-bottom: 16px;
  }

  .detail-form {
    margin-top: 8px;
  }

  .mono {
    font-family: 'JetBrains Mono', 'Courier New', monospace;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 32px;
  }

  .tag-editor {
    display: flex;
    gap: 8px;
    margin-top: 12px;
  }

  .token-box {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: #111827;
    border-radius: 8px;
  }

  .token-buttons {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .token-action {
    cursor: pointer;
  }

  .empty-text {
    color: #6b7280;
  }

  .log-section {
    margin-top: 8px;
  }

  .log-title {
    margin-bottom: 8px;
    font-weight: 600;
  }

  .log-list {
    padding-left: 18px;
    margin: 0;
  }

  .log-date {
    display: inline-block;
    min-width: 96px;
    color: #6b7280;
  }
</style>
