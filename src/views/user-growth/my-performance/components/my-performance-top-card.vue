<template>
  <div class="top-card">
    <ElSkeleton :loading="loading" animated>
      <template #template>
        <div class="top-card__sk">
          <div class="left top-card__sk-left">
            <ElSkeletonItem variant="circle" class="top-card__sk-avatar" />
            <div class="top-card__sk-info">
              <ElSkeletonItem variant="text" class="top-card__sk-line top-card__sk-line--name" />
              <ElSkeletonItem variant="text" class="top-card__sk-line top-card__sk-line--role" />
              <ElSkeletonItem variant="text" class="top-card__sk-line top-card__sk-line--apps" />
            </div>
          </div>
          <div class="divider" aria-hidden="true"></div>
          <div class="right top-card__sk-kpis">
            <div v-for="i in 5" :key="i" class="top-card__sk-kpi">
              <ElSkeletonItem variant="text" class="top-card__sk-line top-card__sk-line--kpi-t" />
              <ElSkeletonItem variant="text" class="top-card__sk-line top-card__sk-line--kpi-v" />
            </div>
          </div>
        </div>
      </template>
      <template #default>
        <div class="top-card__content">
          <div class="left">
            <div class="avatar">{{ person.avatarLetter }}</div>
            <div class="info">
              <div class="name">{{ person.name }}</div>
              <div class="role">{{ person.role }}</div>
              <div class="apps">
                <span class="apps-label">{{ responsibleLabel }}</span>
                <span class="apps-list">{{ person.apps.join('，') }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="right">
            <div
              v-for="(k, idx) in kpis"
              :key="idx"
              class="kpi"
              :class="[
                k.type ? `is-${k.type}` : '',
                k.highlight ? `is-total-score is-score-${scoreTone(k.value)}` : ''
              ]"
            >
              <template v-if="k.highlight">
                <div class="score-card">
                  <div class="score-card__label">{{ k.label }}</div>
                  <div class="score-card__value">{{ k.value }}</div>
                  <div class="score-card__badge" :class="`is-${scoreTone(k.value)}`">
                    <ElIcon class="score-card__badge-icon"><StarFilled /></ElIcon>
                    <span class="score-card__badge-text">{{ scoreLevelText(k.value) }}</span>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="kpi-card">
                  <div class="kpi-label-row">
                    <span class="kpi-label">{{ k.label }}</span>
                    <span class="kpi-dot" :class="k.type ? `is-${k.type}` : 'is-default'"></span>
                  </div>
                  <div class="kpi-value">
                    <span class="value">{{ k.value }}</span>
                    <span v-if="k.sub" class="sub">{{ k.sub }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </ElSkeleton>
  </div>
</template>

<script setup lang="ts">
  import { StarFilled } from '@element-plus/icons-vue'
  import type { MyPerformancePersonOption, MyPerformanceTopKpiItem } from '../types'

  defineOptions({ name: 'MyPerformanceTopCard' })

  withDefaults(
    defineProps<{
      loading?: boolean
      person: MyPerformancePersonOption
      kpis: MyPerformanceTopKpiItem[]
      responsibleLabel?: string
    }>(),
    { loading: false, responsibleLabel: '负责' }
  )

  function parseScore(value: string) {
    const m = value.match(/(\d+(?:\.\d+)?)/)
    if (!m?.[1]) return undefined
    const n = Number(m[1])
    return Number.isFinite(n) ? n : undefined
  }

  function scoreTone(value: string) {
    const n = parseScore(value)
    if (n == null) return 'neutral'
    if (n >= 90) return 'good'
    if (n >= 80) return 'mid'
    return 'low'
  }

  function scoreLevelText(value: string) {
    const n = parseScore(value)
    if (n == null) return '—'
    if (n >= 90) return '优秀'
    if (n >= 80) return '良好'
    return '待提升'
  }
</script>

<style scoped lang="scss">
  @use '../styles/mp-card-fx.scss' as *;

  .top-card {
    position: relative;
    display: flex;
    gap: var(--space-4);
    align-items: stretch;
    padding: 18px 22px;
    overflow: hidden;
    backdrop-filter: blur(18px) saturate(1.15);
    border: 1px solid rgb(63 63 70 / 40%);
    border-radius: 18px;

    @include mp-neon-stack;
    @include mp-card-mesh;
    @include mp-panel-hover-lift;

    &::after {
      inset: 3px;
      opacity: 0.18;
      mask-image: linear-gradient(
        180deg,
        rgb(0 0 0 / 100%) 0%,
        rgb(0 0 0 / 35%) 85%,
        transparent 100%
      );
    }

    &::before {
      position: absolute;
      inset: -1px;
      z-index: 1;
      padding: 1px;
      pointer-events: none;
      content: '';
      background: conic-gradient(
        from var(--border-angle, 0deg) at 50% 50%,
        transparent 0deg,
        rgb(16 185 129 / 25%) 60deg,
        transparent 120deg,
        rgb(59 130 246 / 20%) 200deg,
        transparent 280deg,
        rgb(168 85 247 / 15%) 340deg,
        transparent 360deg
      );
      border-radius: inherit;
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: border-spin 6s linear infinite;
    }

    > * {
      position: relative;
      z-index: 2;
    }

    :deep(.el-skeleton) {
      width: 100%;
    }
  }

  .top-card__content {
    display: flex;
    gap: var(--space-4);
    align-items: stretch;
    width: 100%;
  }

  @property --border-angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }

  @keyframes border-spin {
    to {
      --border-angle: 360deg;
    }
  }

  .top-card__sk {
    display: flex;
    gap: var(--space-4);
    align-items: stretch;
    width: 100%;
  }

  .top-card__sk-left {
    display: flex;
    flex-shrink: 0;
    gap: 14px;
    align-items: center;
    min-width: 0;
    max-width: min(320px, 38%);
  }

  .top-card__sk-avatar {
    flex-shrink: 0;
    width: 62px !important;
    height: 62px !important;
  }

  .top-card__sk-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .top-card__sk-line--name {
    width: 55% !important;
    height: 18px !important;
  }

  .top-card__sk-line--role {
    width: 40% !important;
    height: 14px !important;
  }

  .top-card__sk-line--apps {
    width: 88% !important;
    height: 14px !important;
  }

  .top-card__sk-kpis {
    display: grid;
    flex: 1 1 0;
    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr)
      minmax(0, 0.82fr)
      minmax(0, 1.2fr)
      minmax(0, 1.05fr);
    gap: 10px;
    align-items: stretch;
    min-width: 0;
  }

  .top-card__sk-kpi {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;
    min-height: 86px;
    padding: 10px;
    background: rgb(39 39 42 / 35%);
    border: 1px solid rgb(72 72 80 / 30%);
    border-radius: 14px;
  }

  .top-card__sk-line--kpi-t {
    width: 72% !important;
    height: 14px !important;
  }

  .top-card__sk-line--kpi-v {
    width: 55% !important;
    height: 22px !important;
  }

  @media (width <= 1200px) {
    .top-card__sk {
      flex-direction: column;
    }

    .top-card__sk-left {
      max-width: none;
    }

    .top-card__sk-kpis {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (width <= 768px) {
    .top-card__sk-kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  .left {
    display: flex;
    flex-shrink: 0;
    gap: 14px;
    align-items: center;
    min-width: 0;
    max-width: min(320px, 38%);
  }

  .avatar {
    position: relative;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 77%;
    min-height: 62px;
    aspect-ratio: 1 / 1;
    font-size: 22px;
    font-weight: 700;
    color: rgb(244 244 245 / 98%);
    background: linear-gradient(135deg, rgb(16 185 129 / 95%), rgb(34 211 238 / 80%));
    border-radius: 9999px;
    box-shadow:
      0 0 24px rgb(16 185 129 / 35%),
      0 0 48px rgb(16 185 129 / 15%),
      0 0 80px rgb(34 211 238 / 8%);
    transition: box-shadow 0.45s var(--ease-out);

    &::after {
      position: absolute;
      inset: -5px;
      content: '';
      border: 2px solid rgb(16 185 129 / 30%);
      border-radius: 9999px;
      animation: avatar-ring-pulse 3s ease-in-out infinite;
    }
  }

  @keyframes avatar-ring-pulse {
    0%,
    100% {
      border-color: rgb(16 185 129 / 30%);
      opacity: 0.4;
      transform: scale(1);
    }

    50% {
      border-color: rgb(34 211 238 / 45%);
      opacity: 0.8;
      transform: scale(1.08);
    }
  }

  .info {
    min-width: 0;
  }

  .top-card:hover .avatar {
    box-shadow:
      0 0 32px rgb(16 185 129 / 45%),
      0 0 56px rgb(16 185 129 / 22%),
      0 0 96px rgb(34 211 238 / 12%);
  }

  .name {
    font-size: 17px;
    font-weight: 750;
    color: var(--text-primary);
    text-shadow: 0 0 20px rgb(244 244 245 / 8%);
    transition:
      text-shadow 0.35s var(--ease-out),
      color 0.35s;
  }

  .top-card:hover .name {
    text-shadow:
      0 0 28px rgb(244 244 245 / 14%),
      0 0 48px rgb(34 211 238 / 8%);
  }

  .role {
    margin-top: 3px;
    font-size: 13px;
    color: var(--text-secondary);
    transition: color 0.35s var(--ease-out);
  }

  .top-card:hover .role {
    color: rgb(228 228 231 / 92%);
  }

  .apps {
    margin-top: 6px;
    font-size: var(--font-size-aux);
    color: var(--text-secondary);
  }

  .apps-label {
    margin-right: 4px;
    transition: color 0.3s var(--ease-out);
  }

  .top-card:hover .apps-label {
    color: rgb(186 230 253 / 88%);
  }

  .apps-list {
    color: rgb(244 244 245 / 70%);
    word-break: break-all;
    transition: color 0.35s var(--ease-out);
  }

  .top-card:hover .apps-list {
    color: rgb(244 244 245 / 86%);
  }

  .divider {
    align-self: stretch;
    width: 1px;
    background: linear-gradient(
      180deg,
      transparent 5%,
      rgb(16 185 129 / 40%) 30%,
      rgb(34 211 238 / 35%) 50%,
      rgb(59 130 246 / 30%) 70%,
      transparent 95%
    );
  }

  .right {
    display: grid;
    flex: 1 1 0;

    /* 预估利润、综合评分需要更宽列；ROI 较窄 */
    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr)
      minmax(0, 0.82fr)
      minmax(0, 1.2fr)
      minmax(0, 1.05fr);
    gap: 10px;
    align-items: stretch;
    min-width: 0;
  }

  .kpi {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    overflow: hidden;
    perspective: 600px;
  }

  .kpi-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .kpi-label-row .kpi-label {
    flex: 1 1 auto;
    min-width: 0;
    margin-bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kpi-label-row {
    display: flex;
    gap: 6px;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    min-height: 18px;
    margin-bottom: 6px;
  }

  .kpi-dot {
    flex: none;
    width: 8px;
    height: 8px;
    background: rgb(161 161 170 / 35%);
    border-radius: 9999px;
    box-shadow: 0 0 0 3px rgb(24 24 27 / 35%);
  }

  .kpi-dot.is-primary {
    background: rgb(96 165 250 / 95%);
    box-shadow:
      0 0 0 3px rgb(96 165 250 / 15%),
      0 0 10px rgb(96 165 250 / 35%);
    animation: dot-glow-blue 2.5s ease-in-out infinite alternate;
  }

  .kpi-dot.is-success {
    background: rgb(16 185 129 / 95%);
    box-shadow:
      0 0 0 3px rgb(16 185 129 / 15%),
      0 0 10px rgb(16 185 129 / 35%);
    animation: dot-glow-green 2.5s ease-in-out infinite alternate;
  }

  .kpi-dot.is-warning {
    background: rgb(249 115 22 / 95%);
    box-shadow:
      0 0 0 3px rgb(249 115 22 / 15%),
      0 0 10px rgb(249 115 22 / 35%);
    animation: dot-glow-orange 2.5s ease-in-out infinite alternate;
  }

  @keyframes dot-glow-blue {
    to {
      box-shadow:
        0 0 0 3px rgb(96 165 250 / 20%),
        0 0 16px rgb(96 165 250 / 50%);
    }
  }

  @keyframes dot-glow-green {
    to {
      box-shadow:
        0 0 0 3px rgb(16 185 129 / 20%),
        0 0 16px rgb(16 185 129 / 50%);
    }
  }

  @keyframes dot-glow-orange {
    to {
      box-shadow:
        0 0 0 3px rgb(249 115 22 / 20%),
        0 0 16px rgb(249 115 22 / 50%);
    }
  }

  .kpi-value {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 6px;
    align-items: baseline;
    min-width: 0;
    max-width: 100%;
    min-height: 30px;
    font-variant-numeric: tabular-nums;
  }

  .kpi-card {
    position: relative;
    display: grid;
    gap: 6px;
    align-content: center;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    min-height: 86px;
    padding: 10px;
    overflow: hidden;
    background:
      radial-gradient(ellipse 90% 70% at 100% 0%, rgb(59 130 246 / 10%) 0%, transparent 50%),
      linear-gradient(155deg, rgb(39 39 42 / 55%) 0%, rgb(24 24 27 / 35%) 100%);
    border: 1px solid rgb(72 72 80 / 42%);
    border-radius: 14px;
    box-shadow:
      inset 0 1px 0 rgb(244 244 245 / 6%),
      0 4px 16px rgb(0 0 0 / 18%);
    transition:
      border-color 0.3s var(--ease-default),
      box-shadow 0.3s var(--ease-default);

    &:hover {
      border-color: rgb(63 63 70 / 60%);
      box-shadow:
        0 8px 24px rgb(0 0 0 / 25%),
        inset 0 1px 0 rgb(244 244 245 / 5%);
    }
  }

  .value {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    font-size: clamp(17px, 1.65vw, 24px);
    font-weight: 800;
    color: rgb(148 163 184 / 92%);
    text-overflow: ellipsis;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  .sub {
    flex-shrink: 0;
    max-width: 100%;
    overflow: hidden;
    font-size: 12px;
    color: rgb(161 161 170 / 85%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .kpi.is-primary .value {
    color: rgb(96 165 250 / 98%);
    text-shadow:
      0 0 20px rgb(96 165 250 / 22%),
      0 0 40px rgb(96 165 250 / 8%);
  }

  .kpi.is-success .value {
    color: rgb(16 185 129 / 98%);
    text-shadow:
      0 0 20px rgb(16 185 129 / 22%),
      0 0 40px rgb(16 185 129 / 8%);
  }

  .kpi.is-warning .value {
    color: rgb(249 115 22 / 98%);
    text-shadow:
      0 0 20px rgb(249 115 22 / 22%),
      0 0 40px rgb(249 115 22 / 8%);
  }

  .score-card {
    position: relative;
    display: grid;
    gap: 6px;
    align-content: center;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    min-height: 86px;
    padding: 10px;
    overflow: hidden;
    background:
      radial-gradient(ellipse 100% 80% at 10% 0%, rgb(16 185 129 / 12%) 0%, transparent 45%),
      radial-gradient(ellipse 70% 60% at 100% 100%, rgb(59 130 246 / 10%) 0%, transparent 50%),
      linear-gradient(165deg, rgb(39 39 42 / 72%) 0%, rgb(24 24 27 / 58%) 100%);
    border: 1px solid rgb(72 72 80 / 50%);
    border-radius: 14px;
    box-shadow:
      0 6px 28px rgb(0 0 0 / 32%),
      inset 0 1px 0 rgb(244 244 245 / 8%),
      0 0 40px rgb(16 185 129 / 5%);

    &::before {
      position: absolute;
      inset: -1px;
      z-index: 0;
      padding: 1px;
      pointer-events: none;
      content: '';
      background: conic-gradient(
        from var(--border-angle, 0deg),
        transparent 0deg,
        rgb(16 185 129 / 30%) 90deg,
        transparent 180deg,
        rgb(59 130 246 / 25%) 270deg,
        transparent 360deg
      );
      border-radius: inherit;
      mask:
        linear-gradient(#fff 0 0) content-box,
        linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: border-spin 4s linear infinite;
    }

    &::after {
      position: absolute;
      top: -40%;
      right: -25%;
      z-index: 0;
      width: 100px;
      height: 100px;
      content: '';
      background: radial-gradient(circle, rgb(16 185 129 / 15%) 0%, transparent 65%);
      border-radius: 9999px;
      animation: score-orb 4s ease-in-out infinite alternate;
    }

    > * {
      position: relative;
      z-index: 1;
    }
  }

  @keyframes score-orb {
    0% {
      opacity: 0.6;
      transform: translate(0, 0) scale(1);
    }

    100% {
      opacity: 1;
      transform: translate(-10%, 10%) scale(1.15);
    }
  }

  .score-card__label {
    overflow: hidden;
    font-size: 12px;
    font-weight: 650;
    color: rgb(161 161 170 / 92%);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .score-card__value {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    font-size: clamp(22px, 2.8vw, 32px);
    font-weight: 850;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
    color: rgb(244 244 245 / 98%);
    text-overflow: ellipsis;
    letter-spacing: 0.01em;
    white-space: nowrap;
    animation: value-breathe 3s ease-in-out infinite;
  }

  @keyframes value-breathe {
    0%,
    100% {
      opacity: 0.92;
    }

    50% {
      opacity: 1;
    }
  }

  .kpi.is-total-score.is-score-good .score-card {
    border-color: rgb(16 185 129 / 35%);
    box-shadow:
      0 4px 24px rgb(0 0 0 / 28%),
      0 0 40px rgb(16 185 129 / 12%);
  }

  .kpi.is-total-score.is-score-good .score-card__value {
    color: rgb(16 185 129 / 98%);
    text-shadow:
      0 0 30px rgb(16 185 129 / 30%),
      0 0 60px rgb(16 185 129 / 12%);
  }

  .kpi.is-total-score.is-score-mid .score-card {
    border-color: rgb(56 189 248 / 30%);
    box-shadow:
      0 4px 24px rgb(0 0 0 / 28%),
      0 0 40px rgb(56 189 248 / 12%);
  }

  .kpi.is-total-score.is-score-mid .score-card__value {
    color: rgb(56 189 248 / 98%);
    text-shadow:
      0 0 30px rgb(56 189 248 / 30%),
      0 0 60px rgb(56 189 248 / 12%);
  }

  .kpi.is-total-score.is-score-low .score-card {
    border-color: rgb(249 115 22 / 30%);
    box-shadow:
      0 4px 24px rgb(0 0 0 / 28%),
      0 0 40px rgb(249 115 22 / 12%);
  }

  .kpi.is-total-score.is-score-low .score-card__value {
    color: rgb(249 115 22 / 98%);
    text-shadow:
      0 0 30px rgb(249 115 22 / 30%),
      0 0 60px rgb(249 115 22 / 12%);
  }

  .score-card__badge {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    justify-self: start;
    max-width: 100%;
    padding: 4px 10px;
    overflow: hidden;
    font-size: 11px;
    font-weight: 700;
    color: rgb(244 244 245 / 85%);
    background: rgb(39 39 42 / 25%);
    border: 1px solid transparent;
    border-radius: 9999px;
  }

  .score-card__badge-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .score-card__badge-icon {
    font-size: 14px;
    animation: star-twinkle 2s ease-in-out infinite;
  }

  @keyframes star-twinkle {
    0%,
    100% {
      opacity: 0.7;
      transform: scale(1) rotate(0deg);
    }

    50% {
      opacity: 1;
      transform: scale(1.15) rotate(15deg);
    }
  }

  .score-card__badge.is-good {
    color: rgb(16 185 129 / 95%);
    background: rgb(16 185 129 / 18%);
    border-color: rgb(16 185 129 / 35%);
    box-shadow: 0 0 16px rgb(16 185 129 / 15%);
  }

  .score-card__badge.is-mid {
    color: rgb(56 189 248 / 95%);
    background: rgb(56 189 248 / 18%);
    border-color: rgb(56 189 248 / 35%);
    box-shadow: 0 0 16px rgb(56 189 248 / 15%);
  }

  .score-card__badge.is-low {
    color: rgb(249 115 22 / 95%);
    background: rgb(249 115 22 / 18%);
    border-color: rgb(249 115 22 / 35%);
    box-shadow: 0 0 16px rgb(249 115 22 / 15%);
  }

  @media (width <= 1200px) {
    .top-card {
      flex-direction: column;
      align-items: stretch;
    }

    .left {
      max-width: none;
    }

    .divider {
      width: 100%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgb(16 185 129 / 35%), transparent);
    }

    .right {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }
  }

  @media (width <= 768px) {
    .right {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .top-card {
      transition: none;
    }

    .top-card:hover {
      transform: none;
    }

    .top-card:hover .avatar {
      transform: none;
    }

    .avatar {
      transition: none;
    }

    .top-card:hover .name,
    .top-card:hover .role {
      transform: none;
    }

    .name,
    .role,
    .apps-label,
    .apps-list {
      transition: none;
    }

    .top-card::before,
    .score-card::before {
      animation: none;
    }

    .top-card::after {
      opacity: 0.1;
    }

    .avatar::after,
    .kpi-dot.is-primary,
    .kpi-dot.is-success,
    .kpi-dot.is-warning {
      animation: none;
    }

    .score-card__value,
    .score-card__badge-icon,
    .score-card::after {
      animation: none;
    }
  }
</style>
