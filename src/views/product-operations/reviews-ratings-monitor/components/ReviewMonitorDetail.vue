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
  } from '@/api/product-operations/reviews-ratings-monitor'

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
    const u = code.toUpperCase()
    const offset = 0x1f1e6
    return String.fromCodePoint(u.charCodeAt(0) - 65 + offset, u.charCodeAt(1) - 65 + offset)
  }

  function countryCodeDisplay(code: string): string {
    return code ? code.toUpperCase() : ''
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
                  {{ flagEmoji(review.countryCode) }} {{ countryCodeDisplay(review.countryCode) }}
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
                >{{ flagEmoji(activeReview.countryCode) }}
                {{ countryCodeDisplay(activeReview.countryCode) }}</span
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
    color: var(--el-text-color-primary);
  }

  /* ── 筛选栏（对齐广告成效筛选玻璃面板）── */
  .filter-bar {
    display: flex;
    flex-shrink: 0;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: center;
    padding: 14px 18px;
    margin-bottom: 16px;
    background: rgb(10 10 14 / 82%);
    backdrop-filter: blur(12px);
    border: 1px solid rgb(96 165 250 / 20%);
    border-radius: 16px;
    box-shadow:
      0 8px 32px rgb(0 0 0 / 40%),
      inset 0 1px 0 rgb(186 230 253 / 10%),
      0 0 40px rgb(59 130 246 / 8%);
  }

  .filter-section {
    display: flex;
    gap: 6px;
    align-items: center;
  }

  .filter-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    white-space: nowrap;
  }

  .star-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .star-tab {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
    border-radius: 9999px;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      color: var(--el-color-primary);
      border-color: color-mix(in srgb, var(--el-color-primary) 55%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--el-color-primary) 15%, transparent);
    }

    &.active {
      font-weight: 700;
      color: #fff;
      background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
      border-color: transparent;
      box-shadow:
        0 0 16px color-mix(in srgb, var(--el-color-primary) 35%, transparent),
        0 0 0 1px rgb(255 255 255 / 12%) inset;
    }
  }

  .filter-select {
    width: 110px;

    :deep(.el-select__wrapper) {
      min-height: 34px;
      color: var(--el-text-color-primary) !important;
      background: color-mix(in srgb, var(--el-color-primary) 6%, transparent) !important;
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent) !important;
      border-radius: 9999px !important;
      box-shadow: none !important;
    }

    :deep(.el-select__placeholder),
    :deep(.el-select__selected-item) {
      color: var(--el-text-color-primary) !important;
    }

    :deep(.el-select__caret) {
      color: var(--el-color-primary);
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
      background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      border-radius: 9999px;
      box-shadow: none;
    }

    :deep(.el-input__inner) {
      color: var(--el-text-color-primary);

      &::placeholder {
        color: var(--el-text-color-secondary);
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
    padding: 8px 4px 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    b {
      color: var(--el-text-color-primary);
    }
  }

  /* ── 主体布局 ─────────────────────────────── */
  .main-body {
    display: flex;
    flex: 1;
    gap: 0;
    overflow: hidden;
    transition: gap 0.3s ease;

    &.panel-open {
      gap: 16px;
    }
  }

  .review-list {
    flex: 1;
    min-width: 0;
    padding: 4px 0 12px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
    }
  }

  /* ── 评论条目 ─────────────────────────────── */
  .review-item {
    padding: 14px 16px;
    margin-bottom: 12px;
    cursor: pointer;
    background: rgb(10 10 14 / 78%);
    backdrop-filter: blur(10px);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 16px;
    box-shadow: 0 8px 28px rgb(0 0 0 / 38%);
    transition:
      border-color 0.28s ease,
      box-shadow 0.28s ease,
      transform 0.2s ease;
    animation: fadeSlideIn 0.35s ease both;

    &:hover {
      border-color: rgb(96 165 250 / 55%);
      box-shadow:
        0 12px 40px rgb(0 0 0 / 45%),
        0 0 48px rgb(59 130 246 / 12%);
      transform: translateX(2px);
    }

    &.review-active {
      border-color: var(--el-color-primary);
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--el-color-primary) 22%, transparent),
        0 12px 40px rgb(0 0 0 / 42%);
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
    color: var(--el-text-color-primary);
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
    color: var(--el-text-color-secondary);
  }

  .version-badge {
    padding: 1px 6px;
    font-size: 11px;
    color: var(--el-text-color-secondary);
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 9999px;
  }

  .sentiment-tag {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;

    &.tag-positive {
      color: var(--el-color-success);
      background: color-mix(in srgb, var(--el-color-success) 15%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-success) 30%, transparent);
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
    color: var(--el-text-color-regular);
  }

  .review-reply-preview {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    padding: 8px 12px;
    margin-top: 8px;
    margin-left: 46px;
    background: color-mix(in srgb, var(--el-color-primary) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 22%, transparent);
    border-radius: 12px;
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
    color: var(--el-text-color-regular);
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
      background: color-mix(in srgb, var(--el-color-primary) 6%, transparent);
      border: 1px solid color-mix(in srgb, var(--el-color-primary) 28%, transparent);
      border-radius: 9999px;
      box-shadow: none;
    }

    :deep(.el-input__inner) {
      color: var(--el-text-color-primary);
    }
  }

  /* ── 翻页 ─────────────────────────────────── */
  .pagination-wrap {
    display: flex;
    justify-content: center;
    padding: 16px 0;

    :deep(.el-pagination) {
      --el-pagination-bg-color: rgb(10 10 14 / 80%);
      --el-pagination-button-bg-color: color-mix(in srgb, var(--el-color-primary) 10%, transparent);
      --el-pagination-button-color: var(--el-text-color-secondary);
      --el-pagination-hover-color: var(--el-color-primary);
    }

    :deep(.el-pagination.is-background .el-pager li.is-active) {
      color: #fff;
      background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary-light-3));
    }

    :deep(.el-pagination.is-background .el-pager li) {
      color: var(--el-text-color-secondary);
      background: rgb(255 255 255 / 6%);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  /* ── 侧边面板 ─────────────────────────────── */
  .detail-panel {
    flex-shrink: 0;
    width: 380px;
    padding: 16px;
    overflow-y: auto;
    background: rgb(10 10 14 / 92%);
    backdrop-filter: blur(14px);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 16px;
    box-shadow:
      -12px 0 40px rgb(0 0 0 / 35%),
      inset 1px 0 0 rgb(186 230 253 / 8%);

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
    border-bottom: 1px solid rgb(96 165 250 / 18%);
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
    color: var(--el-text-color-primary);
  }

  .panel-content-preview {
    margin-bottom: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-secondary);
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
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 12px;
  }

  .meta-row {
    display: grid;
    grid-template-columns: 60px 1fr 60px 1fr;
    gap: 6px 4px;
    padding: 4px 0;
    border-bottom: 1px solid rgb(96 165 250 / 12%);

    &:last-child {
      border-bottom: none;
    }
  }

  .meta-key {
    align-self: center;
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }

  .meta-val {
    align-self: center;
    font-size: 12px;
    color: var(--el-text-color-primary);

    &.tag-positive {
      color: var(--el-color-success);
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
    font-weight: 700;
    color: transparent;
    letter-spacing: 0.02em;
    background-image: linear-gradient(
      92deg,
      color-mix(in srgb, var(--el-text-color-primary) 55%, var(--el-color-primary)) 0%,
      var(--el-color-primary-light-5) 45%,
      var(--el-color-primary) 85%
    );
    -webkit-background-clip: text;
    background-clip: text;
    border-bottom: 1px solid rgb(96 165 250 / 18%);
    -webkit-text-fill-color: transparent;
  }

  .panel-review-content {
    padding: 10px 12px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-primary);
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 12px;
  }

  /* 回复 textarea */
  .reply-textarea {
    width: 100%;

    :deep(.el-textarea__inner) {
      color: var(--el-text-color-primary);
      resize: none;
      background: rgb(255 255 255 / 4%);
      border-color: rgb(96 165 250 / 28%);
      border-radius: 12px;

      &:focus {
        border-color: var(--el-color-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--el-color-primary) 18%, transparent);
      }

      &::placeholder {
        color: var(--el-text-color-secondary);
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
    color: var(--el-color-primary);
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
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 12px;
    transition: border-color 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  .template-text {
    display: -webkit-box;
    flex: 1;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .template-apply-btn {
    padding: 2px 8px;
    font-size: 11px;
    color: var(--el-color-primary);
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--el-color-primary) 45%, transparent);
    border-radius: 9999px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      background: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
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
    background: rgb(255 255 255 / 4%);
    border: 1px solid rgb(96 165 250 / 22%);
    border-radius: 12px;
    transition: border-color 0.2s;

    &:hover {
      border-color: rgb(59 130 246 / 65%);
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
    color: var(--el-text-color-regular);
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

  /* ── 响应式：中屏压缩侧栏；小屏列表与详情上下堆叠 ── */
  @media (width <= 1199px) {
    .detail-panel {
      width: min(360px, 38vw);
      min-width: 260px;
    }
  }

  @media (width <= 1023px) {
    .filter-bar {
      padding: 12px 14px;
    }

    .filter-right {
      justify-content: flex-start;
      width: 100%;
      margin-left: 0;
    }

    .filter-search {
      flex: 1;
      width: auto;
      min-width: 0;
      max-width: none;
    }

    .detail-panel {
      width: min(320px, 42vw);
    }
  }

  @media (width <= 767px) {
    .filter-section {
      flex-wrap: wrap;
    }

    .sort-wrap {
      width: 100%;
      margin-top: 4px;
    }

    .main-body {
      flex-direction: column;
      min-height: 0;

      &.panel-open {
        gap: 12px;
      }
    }

    .review-list {
      flex: 1 1 auto;
      min-height: 0;
    }

    .detail-panel {
      flex-shrink: 0;
      width: 100%;
      min-width: 0;
      max-height: min(52vh, 560px);
      box-shadow:
        0 -8px 36px rgb(0 0 0 / 38%),
        inset 0 1px 0 rgb(186 230 253 / 8%);
    }

    .review-content,
    .review-reply-preview,
    .quick-reply {
      padding-left: 0;
      margin-left: 0;
    }

    .review-header {
      flex-wrap: wrap;
    }

    .pagination-wrap {
      padding: 12px 0;

      :deep(.el-pagination) {
        flex-wrap: wrap;
        row-gap: 8px;
        justify-content: center;
      }
    }

    .panel-slide-enter-from,
    .panel-slide-leave-to {
      transform: translateY(14px);
    }
  }

  @media (width <= 479px) {
    .filter-select {
      flex: 1 1 100%;
      width: 100%;
      max-width: 100%;
    }

    .filter-search {
      min-width: 100%;
    }

    .star-tab {
      padding: 4px 10px;
      font-size: 11px;
    }

    .review-item {
      padding: 12px;
    }

    .empty-list {
      height: 220px;
    }
  }

  /* ── 动画 ─────────────────────────────────── */
  .list-enter-active,
  .list-leave-active {
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
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
    transition:
      opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
