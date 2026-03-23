<template>
  <div v-loading="loading" class="ade-page art-full-height">
    <!-- ── 顶部面包屑 ───────────────────────────────────────────── -->
    <div class="ade-topbar">
      <div class="ade-topbar__left">
        <button type="button" class="ade-back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </button>
        <el-breadcrumb separator="/" class="ade-breadcrumb">
          <el-breadcrumb-item>投放管理</el-breadcrumb-item>
          <el-breadcrumb-item
            :to="{
              path: '/user-growth/ad-performance/campaign-detail',
              query: { id: campaignId }
            }"
          >
            广告系列详情
          </el-breadcrumb-item>
          <el-breadcrumb-item>编辑 Campaign</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <!-- ── 标题行 ──────────────────────────────────────────────── -->
    <div class="ade-title-row">
      <h1 class="ade-title">编辑 Campaign</h1>
    </div>

    <!-- ── 主体三列 ────────────────────────────────────────────── -->
    <div class="ade-body">
      <!-- 左列：基本信息 + 预算设置 -->
      <div class="ade-col">
        <EditBasicInfo v-model="form.basic" />
        <EditBudget v-model="form.budget" />
      </div>

      <!-- 中列：定向设置 + 素材选择 -->
      <div class="ade-col">
        <EditTargeting v-model="form.targeting" />
        <EditCreatives v-model="form.creatives" />
      </div>

      <!-- 右列：预测 + 参考 + 提示 -->
      <div class="ade-col">
        <EditSidebar v-model="form.sidebar" />
      </div>
    </div>

    <!-- ── 底部操作栏 ─────────────────────────────────────────── -->
    <div class="ade-footer">
      <ElButton round @click="saveDraft">保存草稿</ElButton>
      <ElButton round @click="preview">预览</ElButton>
      <ElButton type="success" round @click="createAndLaunch">
        <el-icon><VideoPlay /></el-icon>
        创建并启动
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowLeft, VideoPlay } from '@element-plus/icons-vue'
  import { fetchAdEditForm } from '@/api/user-growth/ad-performance'
  import EditBasicInfo from './modules/edit-basic-info.vue'
  import EditBudget from './modules/edit-budget.vue'
  import EditTargeting from './modules/edit-targeting.vue'
  import EditCreatives from './modules/edit-creatives.vue'
  import EditSidebar from './modules/edit-sidebar.vue'
  import { MOCK_AD_EDIT_FORM } from './mock/data'
  import type { AdEditCreativeItem, AdEditFormData, AdEditSidebarRefItem } from './types'

  defineOptions({ name: 'AdEdit' })

  const router = useRouter()
  const route = useRoute()
  const loading = ref(true)
  const campaignId = ref(String(route.query.campaignId ?? ''))
  const form = reactive<AdEditFormData>(JSON.parse(JSON.stringify(MOCK_AD_EDIT_FORM)))

  onMounted(async () => {
    const cid = String(route.query.campaignId ?? '')
    campaignId.value = cid
    const qAd = String(route.query.adId ?? '')
    const qId = String(route.query.id ?? '')
    const adId = qAd || qId || undefined
    if (!cid) {
      ElMessage.error('缺少广告系列 ID')
      loading.value = false
      return
    }
    try {
      const res = await fetchAdEditForm({ campaignId: cid, adId })
      Object.assign(form.basic, res.basic)
      Object.assign(form.budget, res.budget)
      Object.assign(form.targeting, res.targeting)
      form.creatives.items = res.creatives.items.map((x: AdEditCreativeItem) => ({ ...x }))
      form.creatives.selectedIds.splice(
        0,
        form.creatives.selectedIds.length,
        ...res.creatives.selectedIds
      )
      form.sidebar.refItems = res.sidebar.refItems.map((x: AdEditSidebarRefItem) => ({ ...x }))
      form.sidebar.tips = [...res.sidebar.tips]
      form.sidebar.budgetForecastValues = res.sidebar.budgetForecastValues
        ? [...res.sidebar.budgetForecastValues]
        : undefined
    } catch {
      ElMessage.error('加载编辑表单失败')
    } finally {
      loading.value = false
    }
  })

  function saveDraft() {
    ElMessage.success('草稿已保存')
  }

  function preview() {
    ElMessage.info('预览功能开发中')
  }

  function createAndLaunch() {
    ElMessage.success('Campaign 已创建并启动')
    router.back()
  }
</script>

<style scoped lang="scss">
  .ade-page {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px 0;
    overflow: hidden;
    background: var(--default-bg-color);
  }

  // ── 顶部 ────────────────────────────────────────────────────
  .ade-topbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  .ade-topbar__left {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .ade-back-btn {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: var(--default-box-color);
    border: 1px solid var(--default-border);
    border-radius: 20px;
    transition: all 0.15s;

    &:hover {
      color: var(--el-text-color-primary);
      border-color: var(--art-primary);
    }
  }

  .ade-breadcrumb {
    :deep(.el-breadcrumb__item) {
      font-size: 13px;
    }

    :deep(.el-breadcrumb__inner.is-link:hover) {
      color: var(--art-primary);
    }
  }

  // ── 标题行 ──────────────────────────────────────────────────
  .ade-title-row {
    flex-shrink: 0;
  }

  .ade-title {
    font-size: 20px;
    font-weight: 800;
    color: var(--el-text-color-primary);
  }

  // ── 主体三列 ─────────────────────────────────────────────────
  .ade-body {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    min-height: 0;
    padding-bottom: 4px;
    overflow: auto;
  }

  .ade-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }

  // ── 底部操作栏 ────────────────────────────────────────────────
  .ade-footer {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    padding: 12px 0 14px;
    border-top: 1px solid var(--default-border);
  }
</style>
