<script setup lang="ts">
  import { reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { View } from '@element-plus/icons-vue'
  import type { AdAccountForm } from './types'

  const props = withDefaults(
    defineProps<{
      visible: boolean
      submitting?: boolean
    }>(),
    {
      submitting: false
    }
  )

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    save: [value: AdAccountForm]
  }>()

  const showToken = ref(false)
  const newAccountId = ref('')

  const form = reactive<AdAccountForm>({
    appName: 'Weather5',
    platform: 'Android',
    adPlatform: 'Google',
    managerAccount: '',
    credential: '',
    adAccounts: [],
    token: ''
  })

  const appOptions = ['Weather5', 'Weather6', 'Weather8', 'Weather9']
  const adPlatformOptions = ['Google', 'TikTok', 'Mintegral', 'NewsBreak'] as const

  function resetForm() {
    form.appName = 'Weather5'
    form.platform = 'Android'
    form.adPlatform = 'Google'
    form.managerAccount = ''
    form.credential = ''
    form.adAccounts = []
    form.token = ''
    newAccountId.value = ''
    showToken.value = false
  }

  watch(
    () => props.visible,
    (visible) => {
      if (!visible) {
        resetForm()
      }
    }
  )

  function close() {
    if (props.submitting) return
    emit('update:visible', false)
  }

  function addAccountId() {
    const value = newAccountId.value.trim()
    if (!value) return
    if (!form.adAccounts.includes(value)) {
      form.adAccounts.push(value)
    }
    newAccountId.value = ''
  }

  function removeAccountId(index: number) {
    form.adAccounts.splice(index, 1)
  }

  function handleSave() {
    if (!form.managerAccount.trim()) {
      ElMessage.warning('Manager account is required')
      return
    }
    emit('save', {
      ...form,
      managerAccount: form.managerAccount.trim(),
      credential: form.credential.trim(),
      adAccounts: [...form.adAccounts],
      token: form.token.trim()
    })
  }
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="Create Ad Account"
    width="560px"
    destroy-on-close
    @close="close"
  >
    <div class="dialog-body">
      <el-form label-position="top">
        <el-form-item label="App" required>
          <el-select v-model="form.appName" style="width: 100%">
            <el-option v-for="app in appOptions" :key="app" :label="app" :value="app" />
          </el-select>
        </el-form-item>

        <div class="grid-2">
          <el-form-item label="Platform" required>
            <el-radio-group v-model="form.platform">
              <el-radio-button label="Android" value="Android" />
              <el-radio-button label="iOS" value="iOS" />
            </el-radio-group>
          </el-form-item>

          <el-form-item label="Ad Platform" required>
            <el-select v-model="form.adPlatform" style="width: 100%">
              <el-option
                v-for="platform in adPlatformOptions"
                :key="platform"
                :label="platform"
                :value="platform"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="Manager Account" required>
          <el-input v-model="form.managerAccount" placeholder="Enter manager account id" />
        </el-form-item>

        <el-form-item label="Credential">
          <el-input v-model="form.credential" placeholder="Enter credential name" />
        </el-form-item>

        <el-form-item label="Ad Account IDs">
          <div class="account-input">
            <div class="tag-list">
              <el-tag
                v-for="(item, index) in form.adAccounts"
                :key="item"
                closable
                @close="removeAccountId(index)"
              >
                {{ item }}
              </el-tag>
            </div>
            <div class="tag-editor">
              <el-input
                v-model="newAccountId"
                placeholder="Enter account id and press Enter"
                @keyup.enter="addAccountId"
              />
              <el-button @click="addAccountId">Add</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Token">
          <el-input
            v-model="form.token"
            :type="showToken ? 'text' : 'password'"
            placeholder="Enter token"
          >
            <template #suffix>
              <el-icon class="token-toggle" @click="showToken = !showToken">
                <View />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button :disabled="submitting" @click="close">Cancel</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSave">Save</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
  .dialog-body {
    padding-top: 8px;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .account-input {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tag-editor {
    display: flex;
    gap: 8px;
  }

  .token-toggle {
    cursor: pointer;
  }
</style>
