<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <transition name="modal-fade" appear>
      <div class="modal-box">
        <div class="modal-header">
          <div class="modal-title">
            <span class="lark-icon">🔔</span>
            飞书推送配置
          </div>
          <span class="modal-subtitle">配置报告自动推送规则和目标</span>
          <button class="modal-close" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <!-- Section 1: Push Targets -->
          <div class="section">
            <div class="section-num">1. 推送目标</div>
            <div class="field-row">
              <label class="field-label">推送群组</label>
              <div class="tags-row">
                <span v-for="g in config.groups" :key="g" class="tag tag-blue">
                  💬 {{ g }} <span class="tag-remove" @click="removeGroup(g)">×</span>
                </span>
                <button class="tag-add" @click="addGroup">+ 添加群组</button>
              </div>
            </div>
            <div class="field-row">
              <label class="field-label">指定人员</label>
              <div class="tags-row">
                <span v-for="p in config.persons" :key="p" class="tag tag-gray">
                  👤 {{ p }} <span class="tag-remove" @click="removePerson(p)">×</span>
                </span>
                <button class="tag-add" @click="addPerson">+ 添加人员</button>
              </div>
            </div>
          </div>

          <!-- Section 2: Push Rules -->
          <div class="section">
            <div class="section-num">2. 推送规则</div>
            <div class="rule-rows">
              <!-- Daily -->
              <div class="rule-row">
                <span class="rule-type">日报</span>
                <el-select v-model="config.daily.day" size="small" class="rule-select">
                  <el-option value="每天" label="每天" />
                  <el-option value="工作日" label="工作日" />
                </el-select>
                <span class="rule-label">时间：</span>
                <el-select v-model="config.daily.time" size="small" class="rule-select-time">
                  <el-option v-for="t in timeOptions" :key="t" :value="t" :label="t" />
                </el-select>
                <span class="rule-toggle-label">工作日展示</span>
                <el-switch v-model="config.daily.workdayOnly" size="small" />
              </div>
              <!-- Weekly -->
              <div class="rule-row">
                <span class="rule-type">周报</span>
                <el-select v-model="config.weekly.day" size="small" class="rule-select">
                  <el-option value="每周一" label="每周一" />
                  <el-option value="每周五" label="每周五" />
                </el-select>
                <span class="rule-label">时间：</span>
                <el-select v-model="config.weekly.time" size="small" class="rule-select-time">
                  <el-option v-for="t in timeOptions" :key="t" :value="t" :label="t" />
                </el-select>
                <span class="rule-toggle-label">包含周环比</span>
                <el-switch v-model="config.weekly.showChange" size="small" />
              </div>
              <!-- Monthly -->
              <div class="rule-row">
                <span class="rule-type">月报</span>
                <el-select v-model="config.monthly.day" size="small" class="rule-select">
                  <el-option value="每月 1 日" label="每月 1 日" />
                  <el-option value="每月 2 日" label="每月 2 日" />
                </el-select>
                <span class="rule-label">时间：</span>
                <el-select v-model="config.monthly.time" size="small" class="rule-select-time">
                  <el-option v-for="t in timeOptions" :key="t" :value="t" :label="t" />
                </el-select>
                <span class="rule-toggle-label">包含费用抄扣明细</span>
                <el-switch v-model="config.monthly.showFee" size="small" />
              </div>
            </div>
          </div>

          <!-- Section 3: Push Content -->
          <div class="section">
            <div class="section-num">3. 推送内容</div>
            <div class="checkbox-grid">
              <el-checkbox v-model="config.content.summary" label="汇总表" />
              <el-checkbox v-model="config.content.adPlatform" label="广告平台表" />
              <el-checkbox v-model="config.content.byCountry" label="分国家汇总表" />
              <el-checkbox v-model="config.content.platformCountry" label="广告平台分国家表" />
              <el-checkbox v-model="config.content.campaigns" label="在投广告系列表" />
            </div>
            <p class="push-hint">飞书推送以消息卡片形式发送，包含数据摘要和 Excel 附件</p>
          </div>
        </div>

        <div class="modal-footer">
          <el-button @click="$emit('close')">取消</el-button>
          <el-button @click="saveConfig">保存配置</el-button>
          <el-button type="primary" @click="pushNow">立即推送一次</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { LarkPushConfig } from './types'

  defineProps<{ visible: boolean }>()
  const emit = defineEmits<{ (e: 'close'): void; (e: 'save', config: LarkPushConfig): void }>()

  const timeOptions = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00']

  const config = reactive<LarkPushConfig>({
    groups: ['经营日报群', '管理层周报群'],
    persons: ['王总', '李总'],
    daily: { enabled: true, day: '每天', time: '09:00', workdayOnly: true },
    weekly: { enabled: true, day: '每周一', time: '09:00', showChange: true },
    monthly: { enabled: true, day: '每月 1 日', time: '09:00', showFee: true },
    content: {
      summary: true,
      adPlatform: true,
      byCountry: true,
      platformCountry: false,
      campaigns: true
    }
  })

  const removeGroup = (g: string) => {
    config.groups = config.groups.filter((x) => x !== g)
  }
  const addGroup = () => {
    config.groups.push('新群组')
  }
  const removePerson = (p: string) => {
    config.persons = config.persons.filter((x) => x !== p)
  }
  const addPerson = () => {
    config.persons.push('新成员')
  }
  const saveConfig = () => {
    emit('save', config)
    ElMessage.success('推送配置已保存')
    emit('close')
  }
  const pushNow = () => {
    ElMessage({ message: '推送成功！已发送至飞书群', type: 'success', duration: 2500 })
    emit('close')
  }
</script>

<style scoped>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(0 0 0 / 65%);
    backdrop-filter: blur(4px);
  }

  .modal-box {
    width: 560px;
    max-width: 96vw;
    max-height: 88vh;
    overflow-y: auto;
    background: #111d35;
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 14px;
    box-shadow: 0 24px 60px rgb(0 0 0 / 50%);
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 10%) transparent;
  }

  .modal-header {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: flex-start;
    padding: 20px 20px 12px;
    border-bottom: 1px solid rgb(255 255 255 / 7%);
  }

  .modal-title {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  }

  .lark-icon {
    font-size: 18px;
  }

  .modal-subtitle {
    width: 100%;
    font-size: 12px;
    color: rgb(255 255 255 / 45%);
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    padding: 2px;
    font-size: 16px;
    line-height: 1;
    color: rgb(255 255 255 / 40%);
    cursor: pointer;
    background: none;
    border: none;
    transition: color 0.15s;
  }

  .modal-close:hover {
    color: #fff;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px 20px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .section-num {
    padding-left: 8px;
    font-size: 13px;
    font-weight: 700;
    color: rgb(255 255 255 / 85%);
    border-left: 3px solid #00d4a1;
  }

  .field-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .field-label {
    flex-shrink: 0;
    width: 52px;
    padding-top: 4px;
    font-size: 12px;
    color: rgb(255 255 255 / 50%);
  }

  .tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }

  .tag {
    display: flex;
    gap: 4px;
    align-items: center;
    padding: 3px 8px;
    font-size: 12px;
    border-radius: 5px;
  }

  .tag-blue {
    color: #60a5fa;
    background: rgb(59 130 246 / 20%);
    border: 1px solid rgb(59 130 246 / 30%);
  }

  .tag-gray {
    color: rgb(255 255 255 / 65%);
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 12%);
  }

  .tag-remove {
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    opacity: 0.6;
  }

  .tag-remove:hover {
    opacity: 1;
  }

  .tag-add {
    padding: 3px 8px;
    font-size: 11px;
    color: #00d4a1;
    cursor: pointer;
    background: rgb(0 212 161 / 10%);
    border: 1px dashed rgb(0 212 161 / 30%);
    border-radius: 5px;
    transition: background 0.15s;
  }

  .tag-add:hover {
    background: rgb(0 212 161 / 20%);
  }

  .rule-rows {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rule-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    padding: 8px 12px;
    background: rgb(255 255 255 / 3%);
    border-radius: 8px;
  }

  .rule-type {
    flex-shrink: 0;
    width: 28px;
    font-size: 12px;
    color: rgb(255 255 255 / 65%);
  }

  .rule-label {
    font-size: 12px;
    color: rgb(255 255 255 / 40%);
    white-space: nowrap;
  }

  .rule-toggle-label {
    margin-left: auto;
    font-size: 11px;
    color: rgb(255 255 255 / 40%);
    white-space: nowrap;
  }

  :deep(.rule-select .el-input__wrapper) {
    background: rgb(255 255 255 / 6%) !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    box-shadow: none !important;
  }

  :deep(.rule-select .el-input__inner) {
    font-size: 12px !important;
    color: rgb(255 255 255 / 75%) !important;
  }

  :deep(.rule-select-time .el-input__wrapper) {
    background: rgb(255 255 255 / 6%) !important;
    border: 1px solid rgb(255 255 255 / 10%) !important;
    box-shadow: none !important;
  }

  :deep(.rule-select-time .el-input__inner) {
    font-size: 12px !important;
    color: rgb(255 255 255 / 75%) !important;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  :deep(.el-checkbox__label) {
    font-size: 12px;
    color: rgb(255 255 255 / 70%) !important;
  }

  :deep(.el-checkbox__inner) {
    background: rgb(255 255 255 / 5%) !important;
    border-color: rgb(255 255 255 / 20%) !important;
  }

  .push-hint {
    padding: 8px 10px;
    margin-top: 4px;
    font-size: 11px;
    color: rgb(255 255 255 / 35%);
    background: rgb(255 255 255 / 2%);
    border-radius: 6px;
  }

  .modal-footer {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 12px 20px;
    border-top: 1px solid rgb(255 255 255 / 7%);
  }

  :deep(.el-button) {
    font-size: 13px !important;
    color: rgb(255 255 255 / 75%) !important;
    background: rgb(255 255 255 / 6%) !important;
    border-color: rgb(255 255 255 / 12%) !important;
  }

  :deep(.el-button--primary) {
    font-weight: 600 !important;
    color: #000 !important;
    background: #00d4a1 !important;
    border-color: #00d4a1 !important;
  }

  :deep(.el-button--primary:hover) {
    background: #00e6b0 !important;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: all 0.2s ease;
  }

  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
    transform: translateY(-12px) scale(0.97);
  }
</style>
