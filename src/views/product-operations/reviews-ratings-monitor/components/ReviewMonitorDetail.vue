<script setup lang="ts">
  /**
   * ReviewMonitorDetail.vue
   * 评论与评分监控 - 明细列表 Tab
   *
   * Props:
   *   filters: GlobalFilter - 从父组件传入的全局过滤条件
   *
   * Usage:
   *   <ReviewMonitorDetail :filters="globalFilters" />
   */
  import { ref, reactive, watch, computed, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    reviewMonitorApi,
    type GlobalFilter,
    type ReviewItem,
    type ReviewListData,
    type ReplyTemplate
  } from '../api/reviewMonitor'

  // ─────────────────────────────────────────────
  // Props
  // ─────────────────────────────────────────────
  interface Props {
    filters?: GlobalFilter
  }
  const props = withDefaults(defineProps<Props>(), {
    filters: () => ({})
  })

  // ─────────────────────────────────────────────
  // 本地过滤状态
  // ─────────────────────────────────────────────
  const localFilter = reactive({
    starRating: null as number | null,
    reviewType: '',
    replied: '',
    autoReplied: '',
    keyword: '',
    sortBy: 'latest' as 'latest' | 'oldest' | 'rating_asc' | 'rating_desc',
    page: 1,
    pageSize: 10
  })

  // ─────────────────────────────────────────────
  // 列表状态
  // ─────────────────────────────────────────────
  const loading = ref(false)
  const listData = ref<ReviewListData | null>(null)
  const reviews = computed(() => listData.value?.list ?? [])
  const total = computed(() => listData.value?.total ?? 0)

  // ─────────────────────────────────────────────
  // 侧边详情面板
  // ─────────────────────────────────────────────
  const activeReview = ref<ReviewItem | null>(null)
  const panelVisible = ref(false)

  function openPanel(review: ReviewItem) {
    activeReview.value = review
    panelVisible.value = true
    replyContent.value = ''
    autoGenLoading.value = false
    fetchTemplates()
  }

  function closePanel() {
    panelVisible.value = false
    activeReview.value = null
  }

  // ─────────────────────────────────────────────
  // 回复功能
  // ─────────────────────────────────────────────
  const replyContent = ref('')
  const replyLoading = ref(false)
  const autoGenLoading = ref(false)
  const templates = ref<ReplyTemplate[]>([])
  const templatesLoaded = ref(false)

  async function fetchTemplates() {
    if (templatesLoaded.value) return
    templates.value = await reviewMonitorApi.getTemplates()
    templatesLoaded.value = true
  }

  async function sendReply() {
    if (!activeReview.value || !replyContent.value.trim()) {
      ElMessage.warning('回复内容不能为空')
      return
    }
    replyLoading.value = true
    try {
      await reviewMonitorApi.replyReview(activeReview.value.id, replyContent.value)
      ElMessage.success('回复成功')
      activeReview.value.replied = true
      activeReview.value.replyContent = replyContent.value
      // 同步更新列表中的状态
      const item = reviews.value.find((r) => r.id === activeReview.value?.id)
      if (item) {
        item.replied = true
        item.replyContent = replyContent.value
      }
      replyContent.value = ''
    } catch {
      ElMessage.error('回复失败，请重试')
    } finally {
      replyLoading.value = false
    }
  }

  async function autoGenReply() {
    if (!activeReview.value) return
    autoGenLoading.value = true
    try {
      const result = await reviewMonitorApi.autoGenerateReply(
        activeReview.value.id,
        activeReview.value.content
      )
      replyContent.value = result
    } catch {
      ElMessage.error('自动生成失败')
    } finally {
      autoGenLoading.value = false
    }
  }

  function applyTemplate(t: ReplyTemplate) {
    replyContent.value = t.content
  }

  // ─────────────────────────────────────────────
  // 获取列表数据
  // ─────────────────────────────────────────────
  async function fetchList() {
    loading.value = true
    try {
      listData.value = await reviewMonitorApi.getList({
        ...props.filters,
        starRating: localFilter.starRating,
        reviewType: localFilter.reviewType,
        replied: localFilter.replied,
        autoReplied: localFilter.autoReplied,
        keyword: localFilter.keyword,
        sortBy: localFilter.sortBy,
        page: localFilter.page,
        pageSize: localFilter.pageSize
      })
    } finally {
      loading.value = false
    }
  }

  function onFilterChange() {
    localFilter.page = 1
    fetchList()
  }

  function onPageChange(page: number) {
    localFilter.page = page
    fetchList()
  }

  function onSearch() {
    onFilterChange()
  }

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  function sentimentLabel(s: string) {
    const map: Record<string, { label: string; cls: string }> = {
      positive: { label: '正面', cls: 'tag-positive' },
      negative: { label: '负面', cls: 'tag-negative' },
      neutral: { label: '其他', cls: 'tag-neutral' }
    }
    return map[s] ?? { label: s, cls: 'tag-neutral' }
  }

  function flagEmoji(code: string): string {
    if (!code || code.length !== 2) return ''
    const offset = 0x1f1e6
    return String.fromCodePoint(code.charCodeAt(0) - 65 + offset, code.charCodeAt(1) - 65 + offset)
  }

  const starRatings = [null, 5, 4, 3, 2, 1]
  const starLabels = ['全部', '5星', '4星', '3星', '2星', '1星']

  const sortOptions = [
    { value: 'latest', label: '最新' },
    { value: 'oldest', label: '最旧' },
    { value: 'rating_desc', label: '评分从高到低' },
    { value: 'rating_asc', label: '评分从低到高' }
  ]

  // 相似评论（模拟：从当前列表中取同星级的）
  const similarReviews = computed(() => {
    if (!activeReview.value) return []
    return reviews.value
      .filter((r) => r.id !== activeReview.value?.id && r.starRating <= 2)
      .slice(0, 3)
  })

  // ─────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────
  onMounted(fetchList)

  watch(() => props.filters, onFilterChange, { deep: true })
</script>

<template>
  <div class="detail-root">
    <!-- ── 筛选栏 ──────────────────────────── -->
    <div class="filter-bar">
      <!-- 星级 Tabs -->
      <div class="filter-section">
        <span class="filter-label">评分：</span>
        <div class="star-tabs">
          <button
            v-for="(star, i) in starRatings"
            :key="i"
            :class="['star-tab', localFilter.starRating === star ? 'active' : '']"
            @click="((localFilter.starRating = star), onFilterChange())"
            >{{ starLabels[i] }}</button
          >
        </div>
      </div>

      <!-- 类型 -->
      <div class="filter-section">
        <span class="filter-label">类型：</span>
        <el-select
          v-model="localFilter.reviewType"
          placeholder="全部"
          size="small"
          class="filter-select"
          @change="onFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="正面评价" value="positive" />
          <el-option label="负面评价" value="negative" />
          <el-option label="广告过多" value="ads" />
          <el-option label="功能问题" value="feature" />
          <el-option label="BUG" value="bug" />
        </el-select>
      </div>

      <!-- 已回复 -->
      <div class="filter-section">
        <span class="filter-label">已回复：</span>
        <el-select
          v-model="localFilter.replied"
          placeholder="全部"
          size="small"
          class="filter-select"
          @change="onFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="是" value="yes" />
          <el-option label="否" value="no" />
        </el-select>
      </div>

      <!-- 自动回复 -->
      <div class="filter-section">
        <span class="filter-label">自动回复：</span>
        <el-select
          v-model="localFilter.autoReplied"
          placeholder="全部"
          size="small"
          class="filter-select"
          @change="onFilterChange"
        >
          <el-option label="全部" value="" />
          <el-option label="是" value="yes" />
          <el-option label="否" value="no" />
        </el-select>
      </div>

      <!-- 搜索 + 排序 -->
      <div class="filter-right">
        <el-input
          v-model="localFilter.keyword"
          placeholder="搜索评论内容..."
          size="small"
          clearable
          class="filter-search"
          @keyup.enter="onSearch"
          @clear="onFilterChange"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="sort-wrap">
          <span class="filter-label">排序：</span>
          <el-select
            v-model="localFilter.sortBy"
            size="small"
            class="filter-select"
            @change="onFilterChange"
          >
            <el-option v-for="o in sortOptions" :key="o.value" :label="o.label" :value="o.value" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 总计提示 -->
    <div class="list-header">
      <span class="total-label"
        >共 <b>{{ total }}</b> 条评论</span
      >
    </div>

    <!-- ── 主体：列表 + 侧边面板 ─────────────── -->
    <div class="main-body" :class="{ 'panel-open': panelVisible }">
      <!-- 评论列表 -->
      <div v-loading="loading" class="review-list">
        <transition-group name="list" tag="div">
          <div
            v-for="review in reviews"
            :key="review.id"
            :class="['review-item', activeReview?.id === review.id ? 'review-active' : '']"
            @click="openPanel(review)"
          >
            <!-- 头部 -->
            <div class="review-header">
              <div class="review-avatar">
                <img v-if="review.avatar" :src="review.avatar" :alt="review.userName" />
                <span v-else class="avatar-fallback">
                  {{ review.userName.charAt(0) }}
                </span>
              </div>

              <div class="review-meta">
                <span class="review-name">{{ review.userName }}</span>
                <div class="review-stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="i <= review.starRating ? 'star-f' : 'star-e'"
                    >★</span
                  >
                </div>
              </div>

              <div class="review-badges">
                <span class="flag-badge">
                  {{ flagEmoji(review.countryCode) }} {{ review.countryCode }}
                </span>
                <span class="version-badge">v{{ review.appVersion }}</span>
                <span :class="['sentiment-tag', sentimentLabel(review.sentiment).cls]">
                  {{ sentimentLabel(review.sentiment).label }}
                </span>
                <span :class="['reply-tag', review.replied ? 'reply-done' : 'reply-pending']">
                  {{ review.replied ? '已回复' : '待回复' }}
                </span>
              </div>
            </div>

            <!-- 内容 -->
            <div class="review-content">{{ review.content }}</div>

            <!-- 已有回复 -->
            <div v-if="review.replied && review.replyContent" class="review-reply-preview">
              <div class="reply-icon">↳</div>
              <div class="reply-app-tag">{{ review.appName }}</div>
              <span class="reply-text">{{ review.replyContent }}</span>
            </div>

            <!-- 快速回复（仅展开当前行时显示） -->
            <div
              v-if="activeReview?.id === review.id && !review.replied"
              class="quick-reply"
              @click.stop
            >
              <el-input
                v-model="replyContent"
                placeholder="输入回复内容..."
                size="small"
                class="quick-input"
              />
              <el-button type="primary" size="small" @click.stop="sendReply">发送</el-button>
              <el-button size="small" @click.stop="autoGenReply" :loading="autoGenLoading">
                自动回复
              </el-button>
            </div>
          </div>
        </transition-group>

        <!-- 空状态 -->
        <div v-if="!loading && reviews.length === 0" class="empty-list">
          <el-empty description="暂无符合条件的评论" />
        </div>

        <!-- 翻页 -->
        <div v-if="total > 0" class="pagination-wrap">
          <el-pagination
            v-model:current-page="localFilter.page"
            :page-size="localFilter.pageSize"
            :total="total"
            layout="prev, pager, next, jumper, ->, total"
            background
            @current-change="onPageChange"
          />
        </div>
      </div>

      <!-- ── 侧边详情面板 ───────────────────── -->
      <transition name="panel-slide">
        <div v-if="panelVisible && activeReview" class="detail-panel">
          <!-- 面板头 -->
          <div class="panel-header">
            <div class="panel-user">
              <div class="panel-avatar">
                <span class="avatar-fallback-lg">{{ activeReview.userName.charAt(0) }}</span>
              </div>
              <div>
                <div class="panel-username">{{ activeReview.userName }}</div>
                <div class="panel-content-preview">{{ activeReview.content }}</div>
                <div class="panel-stars">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="i <= activeReview.starRating ? 'star-f' : 'star-e'"
                    >★</span
                  >
                  {{ activeReview.starRating }} 星
                </div>
              </div>
            </div>
            <button class="close-btn" @click="closePanel">✕</button>
          </div>

          <!-- 元信息表格 -->
          <div class="panel-meta-grid">
            <div class="meta-row">
              <span class="meta-key">应用</span>
              <span class="meta-val">{{ activeReview.appName }}</span>
              <span class="meta-key">平台</span>
              <span class="meta-val">{{
                activeReview.platform === 'google_play' ? 'Google Play' : 'App Store'
              }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">版本</span>
              <span class="meta-val">{{ activeReview.appVersion }}</span>
              <span class="meta-key">国家</span>
              <span class="meta-val"
                >{{ flagEmoji(activeReview.countryCode) }} {{ activeReview.countryCode }}</span
              >
            </div>
            <div class="meta-row">
              <span class="meta-key">日期</span>
              <span class="meta-val">{{ activeReview.date }}</span>
              <span class="meta-key">语言</span>
              <span class="meta-val">{{
                activeReview.language === 'zh' ? '中文' : activeReview.language
              }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-key">类型</span>
              <span :class="['meta-val', sentimentLabel(activeReview.sentiment).cls]">
                {{ sentimentLabel(activeReview.sentiment).label }}
              </span>
              <span class="meta-key">回复状态</span>
              <span :class="['meta-val', activeReview.replied ? 'reply-done' : 'reply-pending']">
                {{ activeReview.replied ? '已回复' : '待回复' }}
              </span>
            </div>
          </div>

          <!-- 评论内容 -->
          <div class="panel-section-title">评论内容</div>
          <div class="panel-review-content">{{ activeReview.content }}</div>

          <!-- 回复区 -->
          <div class="panel-section-title">回复评论</div>
          <el-input
            v-model="replyContent"
            type="textarea"
            :rows="4"
            placeholder="输入回复内容..."
            class="reply-textarea"
          />

          <div class="reply-action-row">
            <div class="template-actions">
              <span class="template-link">使用模板</span>
              <span class="template-sep">|</span>
              <span class="template-link" @click="autoGenReply">自动生成</span>
            </div>
            <el-button type="primary" size="small" :loading="replyLoading" @click="sendReply"
              >发送回复</el-button
            >
          </div>

          <!-- 模板列表 -->
          <div class="panel-section-title">常用回复模板</div>
          <div class="template-list">
            <div v-for="t in templates" :key="t.id" class="template-item" @click="applyTemplate(t)">
              <div class="template-text">{{ t.content }}</div>
              <button class="template-apply-btn">应用</button>
            </div>
          </div>

          <!-- 相似评论 -->
          <div v-if="similarReviews.length" class="panel-section-title">
            相似评论 ({{ similarReviews.length }}条)
          </div>
          <div class="similar-list">
            <div
              v-for="sr in similarReviews"
              :key="sr.id"
              class="similar-item"
              @click="openPanel(sr)"
            >
              <div class="similar-stars">
                <span v-for="i in 5" :key="i" :class="i <= sr.starRating ? 'star-f' : 'star-e'"
                  >★</span
                >
              </div>
              <div class="similar-content">{{ sr.content }}</div>
              <div class="similar-date">{{ sr.date }}</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .detail-root {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    color: #e8eaed;
  }

  /* ── 筛选栏 ─────────────────────────────────── */
  .filter-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px 20px;
    align-items: center;
    padding: 12px 16px;
    background: #161b2e;
    border-bottom: 1px solid #1e2a40;
  }

  .filter-section {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    font-size: 13px;
    color: #9ca3af;
    white-space: nowrap;
  }

  .star-tabs {
    display: flex;
    gap: 4px;
  }

  .star-tab {
    padding: 3px 12px;
    font-size: 12px;
    color: #9ca3af;
    cursor: pointer;
    background: transparent;
    border: 1px solid #2a2d3a;
    border-radius: 16px;
    transition: all 0.2s;

    &:hover {
      color: #00d4aa;
      border-color: #00d4aa;
    }

    &.active {
      font-weight: 600;
      color: #0d1117;
      background: #00d4aa;
      border-color: #00d4aa;
    }
  }

  .filter-select {
    width: 100px;

    :deep(.el-select__wrapper) {
      color: #e8eaed !important;
      background: #1e2433 !important;
      border-color: #2a2d3a !important;
      box-shadow: none !important;
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      color: #e8eaed !important;
    }
  }

  .filter-right {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-left: auto;
  }

  .filter-search {
    width: 200px;

    :deep(.el-input__wrapper) {
      background: #1e2433;
      border-color: #2a2d3a;
      box-shadow: none;
    }

    :deep(.el-input__inner) {
      color: #e8eaed;

      &::placeholder {
        color: #6b7280;
      }
    }
  }

  .sort-wrap {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  /* ── 列表头 ─────────────────────────────────── */
  .list-header {
    flex-shrink: 0;
    padding: 10px 16px;
    font-size: 13px;
    color: #6b7280;
    border-bottom: 1px solid #1e2a40;

    b {
      color: #e8eaed;
    }
  }

  /* ── 主体布局 ─────────────────────────────── */
  .main-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .review-list {
    flex: 1;
    min-width: 0;
    padding: 12px 16px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #2a2d3a;
      border-radius: 3px;
    }
  }

  /* ── 评论条目 ─────────────────────────────── */
  .review-item {
    padding: 14px 16px;
    margin-bottom: 10px;
    cursor: pointer;
    background: #161b2e;
    border: 1px solid #1e2a40;
    border-radius: 10px;
    transition:
      border-color 0.2s,
      box-shadow 0.2s,
      transform 0.15s;
    animation: fadeSlideIn 0.35s ease both;

    &:hover {
      border-color: #2a3d5a;
      transform: translateX(2px);
    }

    &.review-active {
      border-color: #00d4aa;
      box-shadow: 0 0 0 1px rgb(0 212 170 / 25%);
    }
  }

  .review-header {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 8px;
  }

  .review-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    overflow: hidden;
    background: #2a3d5a;
    border-radius: 50%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .avatar-fallback {
    font-size: 16px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .review-meta {
    flex: 1;
  }

  .review-name {
    font-size: 13px;
    font-weight: 600;
    color: #c9d1d9;
  }

  .review-stars {
    margin-top: 2px;

    .star-f {
      font-size: 13px;
      color: #f59e0b;
    }

    .star-e {
      font-size: 13px;
      color: #374151;
    }
  }

  .review-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .flag-badge {
    font-size: 12px;
    color: #9ca3af;
  }

  .version-badge {
    padding: 1px 6px;
    font-size: 11px;
    color: #6b7280;
    background: #1e2433;
    border: 1px solid #2a2d3a;
    border-radius: 4px;
  }

  .sentiment-tag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &.tag-positive {
      color: #10b981;
      background: rgb(16 185 129 / 15%);
      border: 1px solid rgb(16 185 129 / 30%);
    }

    &.tag-negative {
      color: #ef4444;
      background: rgb(239 68 68 / 15%);
      border: 1px solid rgb(239 68 68 / 30%);
    }

    &.tag-neutral {
      color: #9ca3af;
      background: rgb(107 114 128 / 15%);
      border: 1px solid rgb(107 114 128 / 30%);
    }
  }

  .reply-tag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &.reply-done {
      color: #4e8ef7;
      background: rgb(59 130 246 / 15%);
      border: 1px solid rgb(59 130 246 / 30%);
    }

    &.reply-pending {
      color: #f59e0b;
      background: rgb(245 158 11 / 15%);
      border: 1px solid rgb(245 158 11 / 30%);
    }
  }

  .review-content {
    padding-left: 46px;
    font-size: 13px;
    line-height: 1.6;
    color: #9ca3af;
  }

  .review-reply-preview {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    padding: 8px 12px;
    margin-top: 8px;
    margin-left: 46px;
    background: #1a2035;
    border-radius: 6px;
  }

  .reply-icon {
    font-size: 16px;
    color: #4e8ef7;
  }

  .reply-app-tag {
    font-size: 11px;
    font-weight: 600;
    color: #4e8ef7;
    white-space: nowrap;
  }

  .reply-text {
    font-size: 12px;
    line-height: 1.5;
    color: #9ca3af;
  }

  .quick-reply {
    display: flex;
    gap: 8px;
    align-items: center;
    padding-left: 46px;
    margin-top: 10px;
  }

  .quick-input {
    flex: 1;

    :deep(.el-input__wrapper) {
      background: #1e2433;
      border-color: #2a2d3a;
      box-shadow: none;
    }

    :deep(.el-input__inner) {
      color: #e8eaed;
    }
  }

  /* ── 翻页 ─────────────────────────────────── */
  .pagination-wrap {
    display: flex;
    justify-content: center;
    padding: 16px 0;

    :deep(.el-pagination) {
      --el-pagination-bg-color: #161b2e;
      --el-pagination-button-bg-color: #1e2433;
      --el-pagination-button-color: #9ca3af;
      --el-pagination-hover-color: #00d4aa;
      --el-color-primary: #00d4aa;
    }

    :deep(.el-pagination.is-background .el-pager li.is-active) {
      color: #0d1117;
      background: #00d4aa;
    }

    :deep(.el-pagination.is-background .el-pager li) {
      color: #9ca3af;
      background: #1e2433;

      &:hover {
        color: #00d4aa;
      }
    }
  }

  /* ── 侧边面板 ─────────────────────────────── */
  .detail-panel {
    flex-shrink: 0;
    width: 380px;
    padding: 16px;
    overflow-y: auto;
    background: #0f1420;
    border-left: 1px solid #1e2a40;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #2a2d3a;
      border-radius: 2px;
    }
  }

  .panel-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 14px;
    margin-bottom: 16px;
    border-bottom: 1px solid #1e2a40;
  }

  .panel-user {
    display: flex;
    flex: 1;
    gap: 10px;
  }

  .panel-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: #2a3d5a;
    border-radius: 50%;
  }

  .avatar-fallback-lg {
    font-size: 20px;
    font-weight: 700;
    color: #9ca3af;
  }

  .panel-username {
    margin-bottom: 3px;
    font-size: 13px;
    font-weight: 600;
    color: #e8eaed;
  }

  .panel-content-preview {
    margin-bottom: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: #9ca3af;
  }

  .panel-stars {
    display: flex;
    gap: 3px;
    align-items: center;
    font-size: 12px;
    color: #f59e0b;

    .star-f {
      color: #f59e0b;
    }

    .star-e {
      color: #374151;
    }
  }

  .close-btn {
    padding: 4px;
    font-size: 16px;
    color: #6b7280;
    cursor: pointer;
    background: transparent;
    border: none;
    transition: color 0.2s;

    &:hover {
      color: #e8eaed;
    }
  }

  /* 元信息表格 */
  .panel-meta-grid {
    padding: 10px 12px;
    margin-bottom: 14px;
    background: #161b2e;
    border: 1px solid #1e2a40;
    border-radius: 8px;
  }

  .meta-row {
    display: grid;
    grid-template-columns: 60px 1fr 60px 1fr;
    gap: 6px 4px;
    padding: 4px 0;
    border-bottom: 1px solid #1e2a40;

    &:last-child {
      border-bottom: none;
    }
  }

  .meta-key {
    align-self: center;
    font-size: 11px;
    color: #6b7280;
  }

  .meta-val {
    align-self: center;
    font-size: 12px;
    color: #c9d1d9;

    &.tag-positive {
      color: #10b981;
    }

    &.tag-negative {
      color: #ef4444;
    }

    &.reply-done {
      color: #4e8ef7;
    }

    &.reply-pending {
      color: #f59e0b;
    }
  }

  /* 面板内分区标题 */
  .panel-section-title {
    padding-bottom: 4px;
    margin: 14px 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: #9ca3af;
    border-bottom: 1px solid #1e2a40;
  }

  .panel-review-content {
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.7;
    color: #c9d1d9;
    background: #161b2e;
    border: 1px solid #1e2a40;
    border-radius: 8px;
  }

  /* 回复 textarea */
  .reply-textarea {
    width: 100%;

    :deep(.el-textarea__inner) {
      color: #e8eaed;
      resize: none;
      background: #161b2e;
      border-color: #2a2d3a;

      &:focus {
        border-color: #00d4aa;
        box-shadow: 0 0 0 2px rgb(0 212 170 / 15%);
      }

      &::placeholder {
        color: #6b7280;
      }
    }
  }

  .reply-action-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
  }

  .template-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .template-link {
    font-size: 12px;
    color: #00d4aa;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.7;
    }
  }

  .template-sep {
    color: #2a2d3a;
  }

  /* 模板列表 */
  .template-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .template-item {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    justify-content: space-between;
    padding: 10px 12px;
    cursor: pointer;
    background: #161b2e;
    border: 1px solid #1e2a40;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #00d4aa;
    }
  }

  .template-text {
    display: -webkit-box;
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: #9ca3af;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .template-apply-btn {
    padding: 2px 8px;
    font-size: 11px;
    color: #00d4aa;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid rgb(0 212 170 / 40%);
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: rgb(0 212 170 / 10%);
    }
  }

  /* 相似评论 */
  .similar-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .similar-item {
    flex: 1;
    min-width: 100px;
    padding: 8px 10px;
    cursor: pointer;
    background: #161b2e;
    border: 1px solid #1e2a40;
    border-radius: 8px;
    transition: border-color 0.2s;

    &:hover {
      border-color: #4e8ef7;
    }
  }

  .similar-stars {
    .star-f {
      font-size: 11px;
      color: #f59e0b;
    }

    .star-e {
      font-size: 11px;
      color: #374151;
    }
  }

  .similar-content {
    display: -webkit-box;
    margin-top: 4px;
    overflow: hidden;
    font-size: 11px;
    line-height: 1.4;
    color: #9ca3af;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .similar-date {
    margin-top: 4px;
    font-size: 10px;
    color: #4b5563;
  }

  /* ── 空状态 ─────────────────────────────────── */
  .empty-list {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
  }

  /* ── 动画 ─────────────────────────────────── */
  .list-enter-active,
  .list-leave-active {
    transition: all 0.3s ease;
  }

  .list-enter-from {
    opacity: 0;
    transform: translateY(-8px);
  }

  .list-leave-to {
    opacity: 0;
    transform: translateX(-10px);
  }

  .panel-slide-enter-active,
  .panel-slide-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .panel-slide-enter-from,
  .panel-slide-leave-to {
    opacity: 0;
    transform: translateX(20px);
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .star-f {
    color: #f59e0b;
  }

  .star-e {
    color: #374151;
  }
</style>
