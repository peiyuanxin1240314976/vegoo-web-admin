<template>
  <div class="subject-table">
    <el-table :data="rows" row-key="subjectId" class="subject-table__el">
      <el-table-column min-width="260" label="主体信息">
        <template #default="{ row }">
          <div class="subject-table__subject">
            <strong>{{ row.subjectName }}</strong>
            <span>{{ row.subjectId }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="210" label="营业执照">
        <template #default="{ row }">
          <div class="subject-table__license">
            <el-tag :type="row.businessLicense ? 'success' : 'info'" effect="light" round>
              {{ row.businessLicense ? '已上传' : '未上传' }}
            </el-tag>
            <span class="subject-table__license-text">
              {{ row.businessLicense || '建议补充执照地址或文件标识' }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="200" label="Facebook">
        <template #default="{ row }">
          <div class="subject-table__platform">
            <el-switch
              :model-value="row.facebookEnabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="emitToggle(row.subjectId, 'facebook', $event)"
            />
            <span class="subject-table__remark">
              {{ row.facebookRemark || '暂无备注' }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="200" label="TikTok">
        <template #default="{ row }">
          <div class="subject-table__platform">
            <el-switch
              :model-value="row.tiktokEnabled"
              inline-prompt
              active-text="开"
              inactive-text="关"
              @change="emitToggle(row.subjectId, 'tiktok', $event)"
            />
            <span class="subject-table__remark">
              {{ row.tiktokRemark || '暂无备注' }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column min-width="170" label="更新时间">
        <template #default="{ row }">
          <div class="subject-table__time">
            <strong>{{ row.updateTime }}</strong>
            <span>更新人 ID: {{ row.updaterId ?? '--' }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column fixed="right" width="140" label="操作">
        <template #default="{ row }">
          <el-button type="primary" link @click="emit('edit', row)">编辑</el-button>
          <el-button type="danger" link @click="emit('delete', row)">删除</el-button>
        </template>
      </el-table-column>

      <template #empty>
        <div class="subject-table__empty">
          <strong>暂无主体配置</strong>
          <span>可以先创建一个主体，补齐平台可用性与备注信息。</span>
        </div>
      </template>
    </el-table>

    <div class="subject-table__pagination">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next"
        :current-page="current"
        :page-size="size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @current-change="emit('pageChange', $event)"
        @size-change="emit('sizeChange', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { SubjectPlatformKey, SubjectSettingItem } from '../types'

  defineOptions({ name: 'SubjectSettingTable' })

  defineProps<{
    rows: SubjectSettingItem[]
    current: number
    size: number
    total: number
  }>()

  const emit = defineEmits<{
    edit: [row: SubjectSettingItem]
    delete: [row: SubjectSettingItem]
    togglePlatform: [payload: { id: string; platform: SubjectPlatformKey; enabled: boolean }]
    pageChange: [value: number]
    sizeChange: [value: number]
  }>()

  function emitToggle(
    id: string,
    platform: SubjectPlatformKey,
    enabled: string | number | boolean
  ) {
    emit('togglePlatform', {
      id,
      platform,
      enabled: Boolean(enabled)
    })
  }
</script>

<style lang="scss" scoped>
  .subject-table__el {
    --el-table-border-color: color-mix(in srgb, var(--art-primary) 14%, transparent);
    --el-table-header-bg-color: color-mix(in srgb, var(--default-box-color) 82%, transparent);
    --el-table-tr-bg-color: transparent;
    --el-table-row-hover-bg-color: color-mix(in srgb, var(--theme-color) 5%, transparent);
    --el-table-text-color: var(--text-primary);
    --el-table-header-text-color: var(--text-secondary);

    overflow: hidden;
    border-radius: 20px;
  }

  .subject-table :deep(.el-table) {
    background: transparent;
  }

  .subject-table :deep(.el-table__inner-wrapper::before) {
    background-color: transparent;
  }

  .subject-table :deep(th.el-table__cell) {
    background: linear-gradient(
      to bottom,
      color-mix(in srgb, var(--default-box-color) 88%, transparent),
      color-mix(in srgb, var(--default-bg-color) 16%, transparent)
    );
  }

  .subject-table :deep(td.el-table__cell) {
    background: transparent;
    border-bottom-color: color-mix(in srgb, var(--art-primary) 10%, transparent);
  }

  .subject-table :deep(.el-table__body tr:hover > td.el-table__cell) {
    background: color-mix(in srgb, var(--theme-color) 6%, transparent) !important;
  }

  .subject-table__subject,
  .subject-table__license,
  .subject-table__platform,
  .subject-table__time {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .subject-table__subject strong,
  .subject-table__time strong {
    font-size: 14px;
    color: var(--text-primary);
  }

  .subject-table__subject span,
  .subject-table__license-text,
  .subject-table__remark,
  .subject-table__time span {
    font-size: 12px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .subject-table__remark {
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .subject-table__empty {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 36px 0;
    color: var(--text-secondary);
  }

  .subject-table :deep(.el-switch) {
    --el-switch-on-color: var(--theme-color);
    --el-switch-off-color: color-mix(in srgb, var(--text-tertiary) 34%, transparent);
  }

  .subject-table :deep(.el-tag.el-tag--success) {
    color: color-mix(in srgb, var(--theme-color) 92%, white 8%);
    background: color-mix(in srgb, var(--theme-color) 12%, transparent);
    border-color: color-mix(in srgb, var(--theme-color) 28%, transparent);
  }

  .subject-table :deep(.el-tag.el-tag--info) {
    color: var(--text-secondary);
    background: color-mix(in srgb, var(--default-bg-color) 26%, transparent);
    border-color: color-mix(in srgb, var(--art-primary) 14%, transparent);
  }

  .subject-table :deep(.el-button--primary.is-link) {
    color: color-mix(in srgb, var(--theme-color) 92%, white 8%);
  }

  .subject-table :deep(.el-button--danger.is-link) {
    color: var(--text-danger);
  }

  .subject-table__pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
</style>
