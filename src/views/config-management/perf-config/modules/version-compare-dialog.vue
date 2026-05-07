<template>
  <el-dialog
    v-model="visible"
    title=""
    width="780px"
    :show-close="false"
    :close-on-click-modal="false"
    class="vcd-dialog"
    align-center
    @close="handleClose"
  >
    <!-- ── 自定义标题栏 ────────────────────────────────────── -->
    <template #header>
      <div class="vcd-header">
        <div class="vcd-header-left">
          <span class="vcd-app-icon" :style="{ background: item.appIcon }">
            {{ item.appName.charAt(0) }}
          </span>
          <div class="vcd-title-info">
            <span class="vcd-title">版本对比</span>
            <div class="vcd-subtitle-tags">
              <span class="vcd-tag">{{ item.appName }}</span>
              <span class="vcd-tag">{{ platformLabel }}</span>
              <span class="vcd-tag">{{ sourceSummary }}</span>
            </div>
          </div>
        </div>
        <ElIcon class="vcd-close-btn" @click="handleClose"><Close /></ElIcon>
      </div>
    </template>

    <!-- ── 版本选择栏 ─────────────────────────────────────── -->
    <div class="vcd-version-selectors">
      <div class="vcd-ver-selector">
        <span class="vcd-ver-label">版本 A</span>
        <el-select v-model="verAIdx" class="vcd-ver-select" size="small" @change="buildDiff">
          <el-option
            v-for="(v, i) in item.versions"
            :key="v.version"
            :value="i"
            :label="`v${v.version} · ${STATUS_CONFIG[v.status].label}${v.isActive ? ' ★' : ''}`"
          />
        </el-select>
        <span class="vcd-ver-badge vcd-ver-badge--a">v{{ verA.version }}</span>
      </div>
      <div class="vcd-vs-sep">VS</div>
      <div class="vcd-ver-selector">
        <span class="vcd-ver-label">版本 B</span>
        <el-select v-model="verBIdx" class="vcd-ver-select" size="small" @change="buildDiff">
          <el-option
            v-for="(v, i) in item.versions"
            :key="v.version"
            :value="i"
            :label="`v${v.version} · ${STATUS_CONFIG[v.status].label}${v.isActive ? ' ★' : ''}`"
          />
        </el-select>
        <span class="vcd-ver-badge vcd-ver-badge--b">v{{ verB.version }}</span>
      </div>
    </div>

    <!-- ── 对比表格 ──────────────────────────────────────── -->
    <div class="vcd-table-wrap">
      <table class="vcd-table">
        <thead>
          <tr>
            <th class="col-field">字段</th>
            <th class="col-val col-a">版本 A (v{{ verA.version }})</th>
            <th class="col-val col-b">版本 B (v{{ verB.version }})</th>
            <th class="col-diff">差异</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in diffRows"
            :key="row.field"
            :class="['vcd-row', row.changed && 'vcd-row--changed']"
          >
            <td class="col-field">{{ row.label }}</td>
            <td class="col-val col-a" :class="row.changed && 'val--changed-a'">{{ row.valA }}</td>
            <td class="col-val col-b" :class="row.changed && 'val--changed-b'">{{ row.valB }}</td>
            <td class="col-diff">
              <span v-if="row.changed" class="diff-tag diff-tag--changed">已变更</span>
              <span v-else class="diff-tag diff-tag--same">相同</span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="vcd-summary-row">
            <td colspan="4">
              <span class="summary-text">
                共 <b>{{ changedCount }}</b> 项变更 · <b>{{ sameCount }}</b> 项相同
              </span>
              <span v-if="changedCount === 0" class="summary-no-diff">两版本完全相同</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- ── 底部按钮 ──────────────────────────────────────── -->
    <template #footer>
      <div class="vcd-footer">
        <div class="vcd-footer-left">
          <ElButton class="btn-export" @click="handleExport">
            <ElIcon><Download /></ElIcon>导出对比
          </ElButton>
        </div>
        <div class="vcd-footer-right">
          <ElButton class="btn-close" @click="handleClose">关闭</ElButton>
          <ElButton v-if="!verB.isActive" class="btn-activate" @click="handleActivateB">
            将 v{{ verB.version }} 设为激活
          </ElButton>
          <ElButton
            v-if="!verA.isActive"
            class="btn-activate btn-activate--a"
            @click="handleActivateA"
          >
            将 v{{ verA.version }} 设为激活
          </ElButton>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Close, Download } from '@element-plus/icons-vue'
  import { exportPerfVersionCompare } from '@/api/config-management/perf-config'
  import { useCockpitMetaFilterStore } from '@/store/modules/cockpit-meta-filter'
  import type { CockpitMetaOptionItem } from '@/types/cockpit-meta-filter'
  import { STATUS_CONFIG } from '../mock/data'
  import type { PerfConfigItem, PerfVersion } from '../types'
  import { formatPerfRequirementDisplay } from '../utils/perf-requirement-display'

  defineOptions({ name: 'VersionCompareDialog' })

  const props = defineProps<{
    visible: boolean
    item: PerfConfigItem
    defaultVersion?: PerfVersion | null
  }>()

  const cockpitMetaStore = useCockpitMetaFilterStore()

  function optLabel(options: CockpitMetaOptionItem[], value: string) {
    if (!value) return ''
    return options.find((o) => o.value === value)?.label ?? value
  }

  const platformLabel = computed(() =>
    optLabel(cockpitMetaStore.data?.platformOptions ?? [], props.item.platform)
  )

  const sourceSummary = computed(() => {
    const opts = cockpitMetaStore.data?.sourceOptions ?? []
    const codes = props.item.sourceList?.length ? props.item.sourceList : [props.item.source]
    return codes.map((c) => optLabel(opts, c) || c).join('、')
  })

  const emit = defineEmits<{
    'update:visible': [val: boolean]
    activate: [ver: PerfVersion]
  }>()

  const visible = computed({
    get: () => props.visible,
    set: (v) => emit('update:visible', v)
  })

  // ─── 版本选择 ────────────────────────────────────────────
  const verAIdx = ref(0)
  const verBIdx = ref(1)

  // 初始化：defaultVersion → 版本B，最新版 → 版本A
  watch(
    () => props.visible,
    (v) => {
      if (!v) return
      void cockpitMetaStore.ensureLoaded()
      const versions = props.item.versions
      if (props.defaultVersion) {
        const idx = versions.findIndex((v) => v.version === props.defaultVersion!.version)
        verBIdx.value = idx >= 0 ? idx : 0
        verAIdx.value = verBIdx.value === 0 ? Math.min(1, versions.length - 1) : 0
      } else {
        verAIdx.value = 0
        verBIdx.value = Math.min(1, versions.length - 1)
      }
      buildDiff()
    },
    { immediate: true }
  )

  const verA = computed(() => props.item.versions[verAIdx.value] ?? props.item.versions[0])
  const verB = computed(() => props.item.versions[verBIdx.value] ?? props.item.versions[0])

  // ─── 对比行定义 ──────────────────────────────────────────
  interface DiffRow {
    field: string
    label: string
    valA: string
    valB: string
    changed: boolean
  }

  const fmtRate = (v: PerfVersion, rate: number) => formatPerfRequirementDisplay(v.evalMethod, rate)

  const buildRows = (a: PerfVersion, b: PerfVersion): DiffRow[] => [
    {
      field: 'status',
      label: '状态',
      valA: STATUS_CONFIG[a.status]?.label ?? a.status,
      valB: STATUS_CONFIG[b.status]?.label ?? b.status,
      changed: a.status !== b.status
    },
    {
      field: 'evalMethod',
      label: '评估方式',
      valA: a.evalMethod,
      valB: b.evalMethod,
      changed: a.evalMethod !== b.evalMethod
    },
    {
      field: 'evalDays',
      label: '评估天数',
      valA: `${a.evalDays} 天`,
      valB: `${b.evalDays} 天`,
      changed: a.evalDays !== b.evalDays
    },
    {
      field: 'targetRate',
      label: '达标要求',
      valA: fmtRate(a, a.targetRate),
      valB: fmtRate(b, b.targetRate),
      changed: a.targetRate !== b.targetRate || a.evalMethod !== b.evalMethod
    },
    {
      field: 'minRate',
      label: '最低要求',
      valA: fmtRate(a, a.minRate),
      valB: fmtRate(b, b.minRate),
      changed: a.minRate !== b.minRate || a.evalMethod !== b.evalMethod
    },
    {
      field: 'difficultyFactor',
      label: '难度系数',
      valA: String(a.difficultyFactor),
      valB: String(b.difficultyFactor),
      changed: a.difficultyFactor !== b.difficultyFactor
    },
    {
      field: 'minProfit',
      label: '最低利润',
      valA: a.minProfit != null ? `$${a.minProfit.toLocaleString()}` : '-',
      valB: b.minProfit != null ? `$${b.minProfit.toLocaleString()}` : '-',
      changed: a.minProfit !== b.minProfit
    },
    {
      field: 'extraCondition',
      label: '附加条件',
      valA: a.extraCondition || '-',
      valB: b.extraCondition || '-',
      changed: a.extraCondition !== b.extraCondition
    },
    {
      field: 'publishedAt',
      label: '发布时间',
      valA: a.publishedAt,
      valB: b.publishedAt,
      changed: a.publishedAt !== b.publishedAt
    },
    {
      field: 'publishedBy',
      label: '发布人',
      valA: a.publishedBy,
      valB: b.publishedBy,
      changed: a.publishedBy !== b.publishedBy
    }
  ]

  const diffRows = ref<DiffRow[]>([])

  const buildDiff = () => {
    diffRows.value = buildRows(verA.value, verB.value)
  }

  watch([verA, verB], buildDiff, { immediate: true })

  const changedCount = computed(() => diffRows.value.filter((r) => r.changed).length)
  const sameCount = computed(() => diffRows.value.filter((r) => !r.changed).length)

  // ─── 操作 ─────────────────────────────────────────────
  const handleActivateA = () => {
    emit('activate', verA.value)
    visible.value = false
  }

  const handleActivateB = () => {
    emit('activate', verB.value)
    visible.value = false
  }

  const handleExport = async () => {
    try {
      await exportPerfVersionCompare({
        configId: props.item.id,
        versionA: verA.value.version,
        versionB: verB.value.version
      })
      ElMessage.success('导出成功')
    } catch {
      ElMessage.error('导出失败，请稍后重试')
    }
  }

  const handleClose = () => {
    visible.value = false
  }
</script>

<style lang="scss" scoped>
  .vcd-dialog {
    :deep(.el-dialog) {
      overflow: hidden;
      background: #131c2e;
      border: 1px solid rgb(255 255 255 / 7%);
      border-radius: 14px;
    }

    :deep(.el-dialog__header) {
      padding: 0;
      margin: 0;
    }

    :deep(.el-dialog__body) {
      padding: 0;
    }

    :deep(.el-dialog__footer) {
      padding: 0;
      border-top: 1px solid rgb(255 255 255 / 7%);
    }
  }

  // ── 标题栏 ─────────────────────────────────────────────
  .vcd-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .vcd-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .vcd-app-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    border-radius: 9px;
  }

  .vcd-title {
    display: block;
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: 700;
    color: #e2e8f0;
  }

  .vcd-subtitle-tags {
    display: flex;
    gap: 5px;
  }

  .vcd-tag {
    padding: 1px 7px;
    font-size: 11px;
    color: #94a3b8;
    background: rgb(255 255 255 / 6%);
    border-radius: 3px;
  }

  .vcd-close-btn {
    font-size: 18px;
    color: #64748b;
    cursor: pointer;

    &:hover {
      color: #e2e8f0;
    }
  }

  // ── 版本选择 ────────────────────────────────────────────
  .vcd-version-selectors {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 14px 20px;
    background: rgb(255 255 255 / 2%);
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .vcd-ver-selector {
    display: flex;
    flex: 1;
    gap: 8px;
    align-items: center;
  }

  .vcd-ver-label {
    font-size: 12px;
    color: #64748b;
    white-space: nowrap;
  }

  .vcd-ver-select {
    flex: 1;

    :deep(.el-select__wrapper) {
      color: #e2e8f0 !important;
      background: rgb(255 255 255 / 4%) !important;
      border: 1px solid rgb(255 255 255 / 10%) !important;
      border-radius: 7px;
      box-shadow: none !important;

      &:hover {
        border-color: #2dd4bf !important;
      }
    }

    :deep(.el-select__placeholder) {
      color: #94a3b8 !important;
    }
  }

  .vcd-ver-badge {
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    border-radius: 5px;

    &--a {
      color: #60a5fa;
      background: rgb(96 165 250 / 12%);
      border: 1px solid rgb(96 165 250 / 25%);
    }

    &--b {
      color: #2dd4bf;
      background: rgb(45 212 191 / 12%);
      border: 1px solid rgb(45 212 191 / 25%);
    }
  }

  .vcd-vs-sep {
    flex-shrink: 0;
    padding: 0 4px;
    font-size: 11px;
    font-weight: 700;
    color: #475569;
  }

  // ── 对比表格 ─────────────────────────────────────────────
  .vcd-table-wrap {
    max-height: 380px;
    padding: 0;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #1e293b transparent;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 3px;
    }
  }

  .vcd-table {
    width: 100%;
    font-size: 13px;
    border-collapse: collapse;

    th,
    td {
      padding: 10px 16px;
      text-align: left;
      border-bottom: 1px solid rgb(255 255 255 / 5%);
    }

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: #0d1626;
    }

    .col-field {
      width: 120px;
      color: #94a3b8;
    }

    .col-val {
      min-width: 200px;
      color: #e2e8f0;
    }

    .col-a {
      border-left: 2px solid rgb(96 165 250 / 20%);
    }

    .col-b {
      border-left: 2px solid rgb(45 212 191 / 20%);
    }

    .col-diff {
      width: 90px;
      text-align: center;
    }
  }

  .vcd-row {
    transition: background 0.12s;

    &:hover td {
      background: rgb(255 255 255 / 2%);
    }

    &--changed {
      background: rgb(245 158 11 / 4%);

      .col-field {
        font-weight: 500;
        color: #f59e0b;
      }
    }
  }

  .val--changed-a {
    color: #93c5fd !important;
    text-decoration: line-through;
    opacity: 0.7;
  }

  .val--changed-b {
    font-weight: 500;
    color: #2dd4bf !important;
  }

  .diff-tag {
    display: inline-block;
    padding: 2px 7px;
    font-size: 10px;
    border-radius: 3px;

    &--changed {
      color: #f59e0b;
      background: rgb(245 158 11 / 12%);
    }

    &--same {
      color: #64748b;
      background: rgb(100 116 139 / 10%);
    }
  }

  // 汇总行
  .vcd-summary-row {
    td {
      padding: 10px 16px;
      background: #0d1626;
    }
  }

  .summary-text {
    font-size: 12px;
    color: #94a3b8;

    b {
      color: #f59e0b;
    }
  }

  .summary-no-diff {
    margin-left: 12px;
    font-size: 12px;
    color: #2dd4bf;
  }

  // ── 底部 ─────────────────────────────────────────────────
  .vcd-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
  }

  .vcd-footer-right {
    display: flex;
    gap: 8px;
  }

  .btn-export {
    display: inline-flex !important;
    gap: 5px !important;
    align-items: center !important;
    font-size: 13px !important;
    color: #94a3b8 !important;
    background: rgb(255 255 255 / 4%) !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 7px !important;

    &:hover {
      color: #2dd4bf !important;
      border-color: #2dd4bf !important;
    }
  }

  .btn-close {
    font-size: 13px !important;
    color: #94a3b8 !important;
    background: rgb(255 255 255 / 4%) !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    border-radius: 7px !important;

    &:hover {
      color: #e2e8f0 !important;
      border-color: rgb(255 255 255 / 20%) !important;
    }
  }

  .btn-activate {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #0b1120 !important;
    background: #2dd4bf !important;
    border: none !important;
    border-radius: 7px !important;

    &:hover {
      filter: brightness(1.08);
    }

    &--a {
      color: #0b1120 !important;
      background: #60a5fa !important;
    }
  }

  // 下拉弹出层
  :deep(.el-select-dropdown) {
    background: #1a2540 !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
  }

  :deep(.el-select-dropdown__item) {
    font-size: 13px;
    color: #94a3b8 !important;

    &:hover,
    &.is-hovering {
      color: #2dd4bf !important;
      background: rgb(45 212 191 / 8%) !important;
    }

    &.is-selected {
      color: #2dd4bf !important;
      background: rgb(45 212 191 / 12%) !important;
    }
  }
</style>
