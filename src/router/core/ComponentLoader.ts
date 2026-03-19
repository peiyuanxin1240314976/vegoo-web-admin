/**
 * 组件加载器
 *
 * 负责动态加载 Vue 组件
 *
 * @module router/core/ComponentLoader
 * @author VeGoo Team
 */

import { h } from 'vue'

export class ComponentLoader {
  private modules: Record<string, () => Promise<any>>

  constructor() {
    // 动态导入 views 目录下所有 .vue 组件
    this.modules = import.meta.glob('../../views/**/*.vue')
  }

  /**
   * 加载组件
   * componentPath 与路由约定一致：如 '/business-insight/iaa-analysis' 对应 src/views/business-insight/iaa-analysis/index.vue
   */
  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // 统一为正斜杠，避免 Windows 下 glob 键与拼接结果不一致
    const normalized = componentPath.replace(/\\/g, '/')
    const fullPath = `../../views${normalized}.vue`
    const fullPathWithIndex = `../../views${normalized}/index.vue`

    // 先尝试直接路径，再尝试添加/index的路径；兼容 glob 可能返回的多种路径形式
    const module =
      this.modules[fullPath] ||
      this.modules[fullPathWithIndex] ||
      this.modules[fullPath.replace(/\//g, '\\')] ||
      this.modules[fullPathWithIndex.replace(/\//g, '\\')]

    if (!module) {
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
  }

  /**
   * 加载布局组件
   */
  loadLayout(): () => Promise<any> {
    return () => import('@/views/index/index.vue')
  }

  /**
   * 加载 iframe 组件
   */
  loadIframe(): () => Promise<any> {
    return () => import('@/views/outside/Iframe.vue')
  }

  /**
   * 创建空组件
   */
  private createEmptyComponent(): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', {})
        }
      })
  }

  /**
   * 创建错误提示组件
   */
  private createErrorComponent(componentPath: string): () => Promise<any> {
    return () =>
      Promise.resolve({
        render() {
          return h('div', { class: 'route-error' }, `组件未找到: ${componentPath}`)
        }
      })
  }
}
