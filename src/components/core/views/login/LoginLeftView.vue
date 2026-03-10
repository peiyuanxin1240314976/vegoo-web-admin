<!-- 登录、注册、忘记密码左侧背景 -->
<template>
  <div class="login-left-view">
    <div class="left-img">
      <picture class="block w-full h-full">
        <source :srcset="loginIconWebp" type="image/webp" />
        <img :src="loginIcon" alt="" class="w-full h-full object-cover" />
      </picture>
    </div>
  </div>
</template>

<script setup lang="ts">
  import loginIcon from '@imgs/login/u6443.png'
  import loginIconWebp from '@imgs/login/u6443.webp'
</script>

<style lang="scss" scoped>
  .login-left-view {
    position: relative;
    box-sizing: border-box;
    width: 65vw;
    height: 100%;
    overflow: hidden;

    .left-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
  }

  @media only screen and (width <= 1600px) {
    .login-left-view {
      width: 60vw;
    }
  }

  @media only screen and (width <= 1180px) {
    .login-left-view {
      width: auto;
      height: auto;
      background: transparent;

      .left-img {
        display: none;
      }
    }
  }
</style>
