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
    if (!props.account) return 'Account Detail'
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
    return [
      {
        date: '2026-04-14',
        text: `Last known status: ${props.account.status}`
      },
      {
        date: '2026-04-14',
        text: `Manager account: ${props.account.managerAccount}`
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
      ElMessage.warning('Manager account is required')
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
    ElMessage.success('Token copied')
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
        <el-button v-if="!isEditing" type="primary" plain @click="enterEdit">
          <el-icon><Edit /></el-icon>
          Edit
        </el-button>
      </div>

      <el-descriptions :column="2" border class="summary">
        <el-descriptions-item label="Status">
          <el-tag :type="form.status === 'enabled' ? 'success' : 'danger'">
            {{ form.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="App">{{ form.appName }}</el-descriptions-item>
        <el-descriptions-item label="Platform">{{ form.platform }}</el-descriptions-item>
        <el-descriptions-item label="Ad Platform">{{ form.adPlatform }}</el-descriptions-item>
      </el-descriptions>

      <el-form label-position="top" class="detail-form">
        <el-form-item label="Manager Account">
          <el-input
            v-if="isEditing"
            v-model="form.managerAccount"
            placeholder="Enter manager account id"
          />
          <div v-else class="mono">{{ form.managerAccount }}</div>
        </el-form-item>

        <el-form-item label="Credential">
          <el-input v-if="isEditing" v-model="form.credential" placeholder="Enter credential" />
          <div v-else class="mono">{{ form.credential || '-' }}</div>
        </el-form-item>

        <el-form-item label="Ad Account IDs">
          <div class="tag-list">
            <el-tag
              v-for="(item, index) in form.adAccounts"
              :key="item"
              :closable="isEditing"
              @close="removeAccountId(index)"
            >
              {{ item }}
            </el-tag>
            <span v-if="!form.adAccounts.length" class="empty-text">No ad account ids</span>
          </div>
          <div v-if="isEditing" class="tag-editor">
            <el-input
              v-model="newAccountId"
              placeholder="Enter account id and press Enter"
              @keyup.enter="addAccountId"
            />
            <el-button @click="addAccountId">Add</el-button>
          </div>
        </el-form-item>

        <el-form-item label="Token">
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
                  {{ showToken ? 'Hide' : 'Show' }}
                </el-button>
                <el-button text :disabled="!form.token" @click="copyToken">
                  <el-icon><CopyDocument /></el-icon>
                  Copy
                </el-button>
              </div>
            </div>
          </template>
        </el-form-item>
      </el-form>

      <div class="log-section">
        <div class="log-title">Operation Logs</div>
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
          <el-button :disabled="submitting" @click="cancelEdit">Cancel</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSave">Save</el-button>
        </template>
        <template v-else>
          <el-button @click="close">Close</el-button>
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
