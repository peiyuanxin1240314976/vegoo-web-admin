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

    .left-img::after {
      position: absolute;
      inset: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          circle at 30% 25%,
          color-mix(in srgb, var(--art-primary) 22%, transparent),
          transparent 58%
        ),
        radial-gradient(
          circle at 70% 60%,
          color-mix(in srgb, var(--art-success) 18%, transparent),
          transparent 62%
        ),
        linear-gradient(180deg, rgb(255 255 255 / 18%), rgb(255 255 255 / 8%));
      opacity: 0.75;
    }

    &::before {
      position: absolute;
      inset: -20%;
      z-index: 0;
      pointer-events: none;
      content: '';
      background:
        radial-gradient(
          circle at 35% 20%,
          color-mix(in srgb, var(--art-primary) 22%, transparent),
          transparent 55%
        ),
        radial-gradient(
          circle at 70% 65%,
          color-mix(in srgb, var(--art-success) 18%, transparent),
          transparent 60%
        );
      filter: blur(18px);
      opacity: 0.75;
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

  @media (prefers-reduced-motion: reduce) {
    .login-left-view {
      &::before {
        display: none;
      }
    }
  }
</style>
