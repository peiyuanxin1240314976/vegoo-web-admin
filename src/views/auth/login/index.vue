<!-- 登录页面（统一深色模式） -->
<template>
  <div class="login-page login-page--dark flex w-full h-screen">
    <LoginLeftView />

    <div class="relative flex-1 login-right">
      <!-- <AuthTopBar /> -->

      <div class="auth-right-wrap">
        <div class="form">
          <div class="login-brand">
            <picture>
              <source :srcset="loginBrandImgWebp" type="image/webp" />
              <img
                :src="loginBrandImg"
                alt="Vegoo"
                class="login-brand-img"
                width="160"
                height="80"
                fetchpriority="high"
              />
            </picture>
            <div class="login-brand-text">
              <h3 class="title">Vegoo</h3>
              <p class="sub-title">经营数据分析平台</p>
            </div>
          </div>
          <ElForm
            ref="formRef"
            :model="formData"
            :rules="rules"
            :key="formKey"
            label-position="top"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <ElFormItem prop="username" :label="$t('login.label.username')">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.username')"
                v-model.trim="formData.username"
              >
                <template #prefix>
                  <ElIcon><User /></ElIcon>
                </template>
              </ElInput>
            </ElFormItem>
            <ElFormItem prop="password" :label="$t('login.label.password')">
              <ElInput
                class="custom-height"
                :placeholder="$t('login.placeholder.password')"
                v-model.trim="formData.password"
                type="password"
                autocomplete="off"
                show-password
              >
                <template #prefix>
                  <ElIcon><Lock /></ElIcon>
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem prop="captchaValue" label="验证码">
              <div class="captcha-row">
                <ElInput
                  class="custom-height captcha-input"
                  placeholder="请输入验证码"
                  v-model.trim="formData.captchaValue"
                  maxlength="8"
                  autocomplete="off"
                >
                  <template #prefix>
                    <ElIcon><Picture /></ElIcon>
                  </template>
                </ElInput>
                <button
                  class="captcha-image-btn"
                  type="button"
                  :disabled="captchaLoading"
                  title="刷新验证码"
                  @click="loadCaptcha"
                >
                  <span v-if="captchaLoading" class="captcha-placeholder">加载中</span>
                  <img
                    v-else-if="captchaImage"
                    class="captcha-image"
                    :src="captchaImage"
                    alt="验证码"
                    @error="handleCaptchaImageError"
                  />
                  <span v-else class="captcha-placeholder">刷新</span>
                  <ElIcon class="captcha-refresh" :class="{ 'is-loading': captchaLoading }">
                    <Refresh />
                  </ElIcon>
                </button>
              </div>
            </ElFormItem>

            <!-- 滑块拖动验证（暂时不需要，注释保留） -->
            <!-- <div class="relative pb-5 mt-6">
              <div
                class="relative z-[2] overflow-hidden select-none rounded-lg border border-transparent tad-300"
                :class="{ '!border-[#FF4E4F]': !isPassing && isClickPass }"
              >
                <ArtDragVerify
                  ref="dragVerify"
                  v-model:value="isPassing"
                  :text="$t('login.sliderText')"
                  textColor="#e2e8f0"
                  :successText="$t('login.sliderSuccessText')"
                  progressBarBg="var(--main-color)"
                  background="#26272F"
                  handlerBg="var(--default-box-color)"
                />
              </div>
              <p
                class="absolute top-0 z-[1] px-px mt-2 text-xs text-[#f56c6c] tad-300"
                :class="{ 'translate-y-10': !isPassing && isClickPass }"
              >
                {{ $t('login.placeholder.slider') }}
              </p>
            </div> -->

            <div class="flex-cb mt-2 text-sm">
              <ElCheckbox v-model="formData.rememberPassword">{{
                $t('login.rememberPwd')
              }}</ElCheckbox>
              <RouterLink class="text-theme" :to="{ name: 'ForgetPassword' }">{{
                $t('login.forgetPwd')
              }}</RouterLink>
            </div>

            <div style="margin-top: 30px">
              <ElButton
                class="w-full custom-height"
                type="primary"
                round
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </ElButton>
            </div>

            <div class="mt-5 text-sm login-page-footer-tip">
              <span>{{ $t('login.noAccount') }}</span>
              <RouterLink class="text-theme" :to="{ name: 'Register' }">{{
                $t('login.register')
              }}</RouterLink>
            </div>
          </ElForm>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // import AppConfig from '@/config'
  import loginBrandImg from '@imgs/login/u205.png'
  import loginBrandImgWebp from '@imgs/login/u205.webp'
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchCaptcha, fetchLogin } from '@/api/auth'
  import {
    ElIcon,
    ElMessage,
    ElNotification,
    type FormInstance,
    type FormRules
  } from 'element-plus'
  import { Lock, Picture, Refresh, User } from '@element-plus/icons-vue'
  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  // 监听语言切换，重置表单
  watch(locale, () => {
    formKey.value++
  })

  // 滑块拖动验证（暂时不需要，注释保留）
  // const dragVerify = ref()
  // const isPassing = ref(false)
  // const isClickPass = ref(false)

  const userStore = useUserStore()
  const router = useRouter()
  const route = useRoute()

  // const systemName = AppConfig.systemInfo.name
  const formRef = ref<FormInstance>()

  const formData = reactive({
    username: '',
    password: '',
    captchaValue: '',
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
    captchaValue: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
  }))

  const loading = ref(false)
  const captchaId = ref('')
  const captchaImage = ref('')
  const captchaLoading = ref(false)

  const normalizeCaptchaImage = (base64Str: string) => {
    if (!base64Str) return ''
    return base64Str.startsWith('data:image') ? base64Str : `data:image/png;base64,${base64Str}`
  }

  const loadCaptcha = async () => {
    if (captchaLoading.value) return
    captchaLoading.value = true

    try {
      const captcha = await fetchCaptcha()
      captchaId.value = captcha.id
      captchaImage.value = normalizeCaptchaImage(captcha.base64Str)
      formData.captchaValue = ''
      formRef.value?.clearValidate('captchaValue')
    } catch (error) {
      captchaId.value = ''
      captchaImage.value = ''
      if (!(error instanceof HttpError)) {
        console.error('[Login] Captcha load failed:', error)
      }
    } finally {
      captchaLoading.value = false
    }
  }

  const handleCaptchaImageError = () => {
    captchaImage.value = ''
  }

  onMounted(() => {
    loadCaptcha()
  })

  // 登录
  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      // 表单验证
      const valid = await formRef.value.validate()
      if (!valid) return

      if (!captchaId.value) {
        ElMessage.warning(captchaLoading.value ? '验证码加载中，请稍后' : '请刷新验证码后再登录')
        return
      }

      // 拖拽验证（暂时不需要，注释保留）
      // if (!isPassing.value) {
      //   isClickPass.value = true
      //   return
      // }

      loading.value = true

      // 登录请求
      const { username, password, rememberPassword, captchaValue } = formData

      // 调用真实登录接口，返回 token 字符串
      const token = await fetchLogin({
        username,
        password,
        captchaId: captchaId.value,
        captchaValue,
        rememberMe: rememberPassword
      })

      const refreshToken = ''

      // 验证token
      if (!token) {
        throw new Error('Login failed - no token received')
      }

      // 存储 token 和登录状态
      userStore.setToken(token, refreshToken)
      userStore.setLoginStatus(true)

      // 登录成功：跳转后由路由守卫统一拉取用户信息并 setUserInfo/checkAndClearWorktabs，避免重复请求
      showLoginSuccessNotice()

      // 获取 redirect 参数，如果存在则跳转到指定页面，否则跳转到首页
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    } catch (error) {
      // 处理 HttpError
      if (error instanceof HttpError) {
        // console.log(error.code)
        loadCaptcha()
      } else {
        // 处理非 HttpError
        // ElMessage.error('登录失败，请稍后重试')
        console.error('[Login] Unexpected error:', error)
        loadCaptcha()
      }
    } finally {
      loading.value = false
      // resetDragVerify() // 滑块暂时不需要
    }
  }

  // 重置拖拽验证（暂时不需要，注释保留）
  // const resetDragVerify = () => {
  //   dragVerify.value.reset()
  // }

  // 登录成功提示
  const showLoginSuccessNotice = () => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        // message: `${t('login.success.message')}, ${systemName}!`
        message: `${t('login.success.message')}, ${'追来科技'}!`
      })
    }, 1000)
  }
</script>

<style src="./style.css"></style>

<style lang="scss" scoped>
  :deep(.el-select__wrapper) {
    height: 40px !important;
  }
</style>
