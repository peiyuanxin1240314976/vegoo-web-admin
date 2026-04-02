<!-- 登录、注册、忘记密码左侧背景 -->
<template>
  <div class="login-left-view">
    <div class="left-img">
      <picture class="block w-full h-full">
        <source :srcset="loginIconWebp" type="image/webp" />
        <img :src="loginIcon" alt="" class="w-full h-full object-cover" />
      </picture>
    </div>
    <div v-if="showParticles" class="left-particles" aria-hidden="true">
      <vue-particles id="loginLeftParticles" :options="particlesOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import loginIcon from '@imgs/login/u6443.png'
  import loginIconWebp from '@imgs/login/u6443.webp'
  import { usePreferredReducedMotion } from '@vueuse/core'

  const reducedMotion = usePreferredReducedMotion()
  const showParticles = computed(() => reducedMotion.value !== 'reduce')

  const particlesOptions = {
    fpsLimit: 60,
    detectRetina: true,
    fullScreen: { enable: false },
    background: { color: { value: 'transparent' } },
    particles: {
      number: { value: 72, density: { enable: true, area: 920 } },
      color: { value: ['#3B82F6', '#10B981', '#A855F7'] },
      links: {
        enable: true,
        color: '#60A5FA',
        distance: 160,
        opacity: 0.4,
        width: 1.2
      },
      opacity: { value: 0.9 },
      size: { value: { min: 1, max: 4 } },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none',
        outModes: { default: 'out' }
      }
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: ['grab', 'repulse'] },
        resize: true
      },
      modes: {
        grab: { distance: 200, links: { opacity: 0.55 } },
        repulse: { distance: 120, duration: 0.2 }
      }
    }
  } as const
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

    .left-particles {
      position: absolute;
      inset: 0;
      z-index: 1;
      pointer-events: none;
      filter: saturate(1.1)
        drop-shadow(0 0 18px color-mix(in srgb, var(--art-primary) 28%, transparent));
      mix-blend-mode: screen;
      opacity: 0.95;
      mask-image: linear-gradient(to right, #000 0%, #000 70%, transparent 100%);
    }

    .left-particles > * {
      width: 100%;
      height: 100%;
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

      .left-particles {
        display: none;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .login-left-view {
      &::before {
        display: none;
      }

      .left-particles {
        display: none;
      }
    }
  }
</style>
