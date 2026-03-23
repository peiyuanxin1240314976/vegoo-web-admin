<template>
  <ElCard class="adcr" shadow="never">
    <template #header>
      <div class="adcr__header">
        <span class="adcr__title">广告素材表现</span>
        <div class="adcr__tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            class="adcr__tab"
            :class="{ 'is-active': activeStatus === tab.value }"
            @click="activeStatus = tab.value"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>
    </template>

    <!-- 素材表格 -->
    <div class="adcr__table-wrap">
      <ElTable :data="filteredRows" size="small" style="width: 100%" stripe>
        <!-- 广告组（缩略图） -->
        <ElTableColumn label="广告组" min-width="160">
          <template #default="{ row }">
            <div class="adcr__creative-cell">
              <div class="adcr__thumb" :class="`adcr__thumb--${row.type}`">
                <el-icon class="adcr__thumb-icon">
                  <VideoPlay v-if="row.type === 'video'" />
                  <Picture v-else />
                </el-icon>
                <span class="adcr__thumb-label">
                  格式：<em>{{ row.type === 'video' ? '视频' : '图片' }}</em>
                </span>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <!-- 状态 -->
        <ElTableColumn label="状态" min-width="80" align="center">
          <template #default="{ row }">
            <span class="adcr__status" :class="`adcr__status--${row.status}`">
              <span class="adcr__dot"></span>
              {{ row.status === 'active' ? '启用' : '暂停' }}
            </span>
          </template>
        </ElTableColumn>

        <!-- 消耗 -->
        <ElTableColumn label="消耗" min-width="90" align="right">
          <template #default="{ row }">${{ fmtK(row.spend) }}</template>
        </ElTableColumn>

        <!-- 安装 -->
        <ElTableColumn label="安装" min-width="80" align="right">
          <template #default="{ row }">{{ fmtK(row.installs) }}</template>
        </ElTableColumn>

        <!-- CTR -->
        <ElTableColumn label="CTR" min-width="80" align="right">
          <template #default="{ row }">{{ row.ctr.toFixed(1) }}%</template>
        </ElTableColumn>

        <!-- CVR -->
        <ElTableColumn label="CVR" min-width="80" align="right">
          <template #default="{ row }">{{ row.cvr.toFixed(0) }}%</template>
        </ElTableColumn>

        <!-- CPI -->
        <ElTableColumn label="CPI" min-width="80" align="right">
          <template #default="{ row }">${{ row.cpi.toFixed(2) }}</template>
        </ElTableColumn>

        <!-- ROI -->
        <ElTableColumn label="ROI" min-width="80" align="right">
          <template #default="{ row }">
            <span :class="row.roi >= 100 ? 'adcr__roi--good' : 'adcr__roi--warn'">
              {{ row.roi }}%
            </span>
          </template>
        </ElTableColumn>

        <!-- 操作 -->
        <ElTableColumn label="操作" width="76" align="center" fixed="right">
          <template #default>
            <div class="adcr__actions">
              <button type="button" class="adcr__action-btn" title="查看">
                <el-icon><View /></el-icon>
              </button>
              <button type="button" class="adcr__action-btn adcr__action-btn--warn" title="暂停">
                <el-icon><VideoPause /></el-icon>
              </button>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <!-- AI 素材优化建议 -->
    <div v-if="suggestion" class="adcr__suggestion">
      <span class="adcr__suggestion-dot"></span>
      <p class="adcr__suggestion-text"> <strong>素材优化建议：</strong>{{ suggestion }} </p>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { VideoPlay, Picture, View, VideoPause } from '@element-plus/icons-vue'
  import type { AdCreativeItem } from '../types'

  defineOptions({ name: 'AdDetailCreative' })

  const props = defineProps<{
    creatives: AdCreativeItem[]
    suggestion?: string
  }>()

  type StatusFilter = 'all' | 'active' | 'paused'

  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: '全部' },
    { value: 'active', label: '启用中' },
    { value: 'paused', label: '已暂停' }
  ]

  const activeStatus = ref<StatusFilter>('all')

  const filteredRows = computed(() => {
    if (activeStatus.value === 'all') return props.creatives
    return props.creatives.filter((r) => r.status === activeStatus.value)
  })

  function fmtK(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
    return String(v)
  }
</script>

<style scoped lang="scss">
  .adcr {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--default-box-color);

    :deep(.el-card__header) {
      padding: 10px 16px 8px;
      border-bottom: 1px solid var(--default-border);
    }

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }
  }

  .adcr__header {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
  }

  .adcr__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .adcr__tabs {
    display: flex;
    gap: 2px;
    padding: 3px;
    background: color-mix(in srgb, var(--default-border) 40%, transparent);
    border-radius: 8px;
  }

  .adcr__tab {
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 6px;
    transition: all 0.15s;

    &.is-active {
      color: var(--el-text-color-primary);
      background: var(--default-box-color);
      box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
    }
  }

  // ── 表格 ──────────────────────────────────────────────────
  .adcr__table-wrap {
    flex: 1;
    overflow: auto;
  }

  :deep(.el-table) {
    height: 100%;
    font-size: 13px;
    background: transparent;
  }

  :deep(.el-table__header th) {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    background: color-mix(in srgb, var(--default-bg-color) 80%, transparent);
  }

  :deep(.el-table__row td) {
    vertical-align: middle;
  }

  // ── 素材缩略图单元格 ──────────────────────────────────────
  .adcr__creative-cell {
    padding: 4px 0;
  }

  .adcr__thumb {
    position: relative;
    display: flex;
    align-items: flex-end;
    width: 150px;
    height: 96px;
    overflow: hidden;
    border-radius: 6px;

    &--video {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid color-mix(in srgb, var(--art-primary) 30%, transparent);
    }

    &--image {
      background: linear-gradient(135deg, #1a2535 0%, #111827 100%);
      border: 1px solid color-mix(in srgb, var(--art-success) 30%, transparent);
    }
  }

  .adcr__thumb-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 36px;
    color: rgb(255 255 255 / 20%);
    transform: translate(-50%, -60%);
  }

  .adcr__thumb-label {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background: rgb(0 0 0 / 50%);

    em {
      font-style: normal;
      font-weight: 600;
      color: var(--art-primary);

      .adcr__thumb--image & {
        color: var(--art-success);
      }
    }
  }

  // ── 状态 ─────────────────────────────────────────────────
  .adcr__status {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: 11px;
  }

  .adcr__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .adcr__status--active {
    color: var(--art-success);

    .adcr__dot {
      background: var(--art-success);
    }
  }

  .adcr__status--paused {
    color: var(--art-warning);

    .adcr__dot {
      background: var(--art-warning);
    }
  }

  // ── ROI 颜色 ─────────────────────────────────────────────
  .adcr__roi--good {
    font-weight: 600;
    color: var(--art-success);
  }

  .adcr__roi--warn {
    font-weight: 600;
    color: var(--art-warning);
  }

  // ── 操作按钮 ─────────────────────────────────────────────
  .adcr__actions {
    display: flex;
    gap: 4px;
    align-items: center;
    justify-content: center;
  }

  .adcr__action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 12px;
    color: var(--art-primary);
    cursor: pointer;
    background: color-mix(in srgb, var(--art-primary) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--art-primary) 30%, transparent);
    border-radius: 4px;
    transition: all 0.15s;

    &:hover {
      background: color-mix(in srgb, var(--art-primary) 20%, transparent);
    }

    &--warn {
      color: var(--art-danger);
      background: color-mix(in srgb, var(--art-danger) 10%, transparent);
      border-color: color-mix(in srgb, var(--art-danger) 30%, transparent);

      &:hover {
        background: color-mix(in srgb, var(--art-danger) 20%, transparent);
      }
    }
  }

  // ── AI 建议 ───────────────────────────────────────────────
  .adcr__suggestion {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: flex-start;
    padding: 12px 16px;
    background: color-mix(in srgb, #f59e0b 6%, transparent);
    border-top: 1px solid var(--default-border);
    border-radius: 0 0 10px 10px;
  }

  .adcr__suggestion-dot {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    margin-top: 4px;
    background: #f59e0b;
    border-radius: 50%;
    box-shadow: 0 0 0 3px color-mix(in srgb, #f59e0b 25%, transparent);
  }

  .adcr__suggestion-text {
    margin: 0;
    font-size: 12px;
    line-height: 1.65;
    color: var(--el-text-color-regular);

    strong {
      color: #f59e0b;
    }
  }
</style>
