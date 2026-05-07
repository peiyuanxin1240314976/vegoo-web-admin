<script setup lang="ts">
  import { computed, onMounted, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { View } from '@element-plus/icons-vue'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
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

  const cockpitMetaStore = useCockpitMetaFilterStore()

  const metaAppOptions = computed(() => cockpitMetaStore.data?.appOptions ?? [])
  const metaPlatformOptions = computed(() => cockpitMetaStore.data?.platformOptions ?? [])
  const metaSourceOptions = computed(() => cockpitMetaStore.data?.sourceOptions ?? [])

  const showToken = ref(false)
  const newAccountId = ref('')

  const form = reactive<AdAccountForm>({
    appId: '',
    platform: '',
    source: '',
    managerAccount: '',
    credential: '',
    adAccounts: [],
    token: ''
  })

  function pickDefaultMeta() {
    const apps = metaAppOptions.value
    const plats = metaPlatformOptions.value
    const sources = metaSourceOptions.value
    form.appId = apps[0]?.value ?? ''
    form.platform = plats[0]?.value ?? ''
    form.source = sources[0]?.value ?? ''
  }

  function resetForm() {
    pickDefaultMeta()
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
      if (visible) {
        void cockpitMetaStore.ensureLoaded().then(() => {
          if (!form.appId && !form.platform && !form.source) pickDefaultMeta()
        })
      } else {
        resetForm()
      }
    }
  )

  onMounted(() => {
    void cockpitMetaStore.ensureLoaded().then(() => {
      pickDefaultMeta()
    })
  })

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
    if (!form.appId) {
      ElMessage.warning('请选择应用')
      return
    }
    if (!form.platform) {
      ElMessage.warning('请选择终端平台')
      return
    }
    if (!form.source) {
      ElMessage.warning('请选择广告平台')
      return
    }
    if (!form.managerAccount.trim()) {
      ElMessage.warning('请填写经理账户')
      return
    }
    const appName = metaAppOptions.value.find((o) => o.value === form.appId)?.label
    emit('save', {
      ...form,
      appName,
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
    title="新建广告账户"
    width="560px"
    destroy-on-close
    @close="close"
  >
    <div class="dialog-body">
      <el-form label-position="top">
        <el-form-item label="应用" required>
          <el-select v-model="form.appId" filterable placeholder="请选择应用" style="width: 100%">
            <el-option
              v-for="opt in metaAppOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>

        <div class="grid-2">
          <el-form-item label="终端平台" required>
            <el-select v-model="form.platform" placeholder="请选择终端平台" style="width: 100%">
              <el-option
                v-for="opt in metaPlatformOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="广告平台" required>
            <el-select v-model="form.source" placeholder="请选择广告平台" style="width: 100%">
              <el-option
                v-for="opt in metaSourceOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </div>

        <el-form-item label="经理账户" required>
          <el-input v-model="form.managerAccount" placeholder="请输入经理账户 ID" />
        </el-form-item>

        <el-form-item label="凭证">
          <el-input v-model="form.credential" placeholder="请输入凭证名称" />
        </el-form-item>

        <el-form-item label="广告子账户 ID">
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
                placeholder="输入子账户 ID 后按回车或点击添加"
                @keyup.enter="addAccountId"
              />
              <el-button round @click="addAccountId">添加</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="令牌">
          <el-input
            v-model="form.token"
            :type="showToken ? 'text' : 'password'"
            placeholder="请输入令牌"
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
        <el-button round :disabled="submitting" @click="close">取消</el-button>
        <el-button type="primary" round :loading="submitting" @click="handleSave">保存</el-button>
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
