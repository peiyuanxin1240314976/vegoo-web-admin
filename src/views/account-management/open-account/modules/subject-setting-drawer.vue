<template>
  <el-drawer
    v-model="drawerVisible"
    :title="mode === 'create' ? '新建主体' : '编辑主体'"
    size="560px"
    class="subject-drawer"
    append-to-body
    destroy-on-close
    :lock-scroll="true"
    @close="handleClose"
  >
    <div class="subject-drawer__body">
      <section class="subject-drawer__section">
        <header class="subject-drawer__section-header">
          <h3>基础信息</h3>
          <p>用于识别主体资质与后续平台配置。</p>
        </header>

        <el-form ref="formRef" :model="form" label-position="top" :rules="rules">
          <el-form-item label="主体名称" prop="subjectName">
            <el-input v-model="form.subjectName" placeholder="请输入主体名称" />
          </el-form-item>

          <el-form-item label="主体 ID" prop="subjectId">
            <el-input
              v-model="form.subjectId"
              placeholder="请输入主体唯一标识"
              :disabled="mode === 'edit'"
            />
          </el-form-item>

          <el-form-item label="营业执照地址" prop="businessLicense">
            <el-input
              v-model="form.businessLicense"
              placeholder="可填写 OSS 地址、文件编号或业务侧可追溯路径"
            />
          </el-form-item>
        </el-form>
      </section>

      <section class="subject-drawer__section">
        <header class="subject-drawer__section-header">
          <h3>平台配置</h3>
          <p>按平台维护是否可用与备注说明，便于后续运营快速判断。</p>
        </header>

        <div class="subject-drawer__platform-grid">
          <article class="subject-drawer__platform-card subject-drawer__platform-card--facebook">
            <div class="subject-drawer__platform-head">
              <div>
                <strong>Facebook</strong>
                <p>适合记录主体当前是否支持 Meta 开户与特殊限制。</p>
              </div>
              <el-switch
                v-model="form.facebookEnabled"
                inline-prompt
                active-text="开"
                inactive-text="关"
              />
            </div>

            <el-input
              v-model="form.facebookRemark"
              type="textarea"
              :rows="4"
              placeholder="例如：美国主体优先，需走指定代理渠道"
            />
          </article>

          <article class="subject-drawer__platform-card subject-drawer__platform-card--tiktok">
            <div class="subject-drawer__platform-head">
              <div>
                <strong>TikTok</strong>
                <p>可记录开户限制、代理要求或审核提示。</p>
              </div>
              <el-switch
                v-model="form.tiktokEnabled"
                inline-prompt
                active-text="开"
                inactive-text="关"
              />
            </div>

            <el-input
              v-model="form.tiktokRemark"
              type="textarea"
              :rows="4"
              placeholder="例如：仅支持东南亚投放，需补齐税务材料"
            />
          </article>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="subject-drawer__footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import type { SubjectSettingItem } from '../types'

  defineOptions({ name: 'SubjectSettingDrawer' })

  const props = defineProps<{
    visible: boolean
    mode: 'create' | 'edit'
    data: SubjectSettingItem | null
  }>()

  const emit = defineEmits<{
    'update:visible': [value: boolean]
    submit: [payload: SubjectSettingItem]
  }>()

  const formRef = ref<FormInstance>()

  const drawerVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
  })

  const createEmptyForm = (): SubjectSettingItem => ({
    subjectId: '',
    subjectName: '',
    businessLicense: '',
    facebookEnabled: false,
    facebookRemark: '',
    tiktokEnabled: false,
    tiktokRemark: '',
    inputTime: '',
    creatorId: null,
    createTime: '',
    updaterId: null,
    updateTime: ''
  })

  const form = reactive<SubjectSettingItem>(createEmptyForm())

  const rules = computed<FormRules>(() => ({
    subjectName: [{ required: true, message: '请输入主体名称', trigger: 'blur' }],
    subjectId: [{ required: true, message: '请输入主体 ID', trigger: 'blur' }]
  }))

  watch(
    () => [props.visible, props.data, props.mode],
    () => {
      const next = props.data ? { ...props.data } : createEmptyForm()
      Object.assign(form, next)
    },
    { immediate: true }
  )

  function handleClose() {
    emit('update:visible', false)
  }

  async function handleSubmit() {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return
    emit('submit', { ...form })
  }
</script>

<style lang="scss" scoped>
  .subject-drawer__body {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .subject-drawer__section {
    padding: 18px;
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--default-box-color) 88%, transparent),
        color-mix(in srgb, var(--default-box-color) 72%, transparent)
      ),
      color-mix(in srgb, var(--default-box-color) 82%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    border-radius: 20px;
    box-shadow:
      0 16px 34px rgb(0 0 0 / 18%),
      0 0 0 1px color-mix(in srgb, var(--art-primary) 8%, transparent),
      inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .subject-drawer__section-header {
    margin-bottom: 16px;
  }

  .subject-drawer__section-header h3 {
    margin: 0 0 6px;
    font-size: 16px;
    color: var(--text-primary);
  }

  .subject-drawer__section-header p {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .subject-drawer__platform-grid {
    display: grid;
    gap: 14px;
  }

  .subject-drawer__platform-card {
    padding: 16px;
    background: color-mix(in srgb, var(--default-bg-color) 20%, transparent);
    border-radius: 18px;
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .subject-drawer__platform-card--facebook {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--art-primary) 8%, transparent),
      color-mix(in srgb, var(--default-bg-color) 22%, transparent) 45%
    );
    border: 1px solid color-mix(in srgb, var(--art-primary) 22%, transparent);
  }

  .subject-drawer__platform-card--tiktok {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--theme-color) 8%, transparent),
      color-mix(in srgb, var(--default-bg-color) 22%, transparent) 45%
    );
    border: 1px solid color-mix(in srgb, var(--theme-color) 22%, transparent);
  }

  .subject-drawer__platform-head {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .subject-drawer__platform-head strong {
    display: block;
    margin-bottom: 6px;
    font-size: 15px;
    color: var(--text-primary);
  }

  .subject-drawer__platform-head p {
    margin: 0;
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .subject-drawer__footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    width: 100%;
  }

  .subject-drawer :deep(.el-drawer__header) {
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .subject-drawer :deep(.el-drawer) {
    background: var(--default-bg-color);
  }

  .subject-drawer :deep(.el-drawer__body) {
    background:
      radial-gradient(
        ellipse 80% 50% at 100% -10%,
        color-mix(in srgb, var(--art-primary) 16%, transparent) 0%,
        transparent 60%
      ),
      radial-gradient(
        ellipse 70% 50% at 0% 110%,
        color-mix(in srgb, var(--theme-color) 14%, transparent) 0%,
        transparent 60%
      ),
      var(--default-bg-color);
  }

  .subject-drawer :deep(.el-input__wrapper),
  .subject-drawer :deep(.el-textarea__inner) {
    color: var(--text-primary);
    background: color-mix(in srgb, var(--default-box-color) 78%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 14%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
  }

  .subject-drawer :deep(.el-input__inner),
  .subject-drawer :deep(.el-textarea__inner::placeholder) {
    color: var(--text-primary);
  }

  .subject-drawer :deep(.el-form-item__label) {
    color: var(--text-secondary);
  }

  .subject-drawer :deep(.el-button--primary) {
    color: color-mix(in srgb, var(--theme-color) 92%, white 8%);
    background: color-mix(in srgb, var(--theme-color) 16%, transparent);
    border-color: color-mix(in srgb, var(--theme-color) 36%, transparent);
  }

  .subject-drawer :deep(.el-switch) {
    --el-switch-on-color: var(--theme-color);
    --el-switch-off-color: color-mix(in srgb, var(--text-tertiary) 34%, transparent);
  }
</style>
