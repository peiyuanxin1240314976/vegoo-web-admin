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
  private moduleIndex: Map<string, () => Promise<any>>

  constructor() {
    // 动态导入 views 目录下所有 .vue 组件
    this.modules = import.meta.glob('../../views/**/*.vue')
    this.moduleIndex = new Map()
    this.buildModuleIndex()
  }

  /**
   * 加载组件
   * componentPath 与路由约定一致：如 '/business-insight/iaa-analysis' 对应 src/views/business-insight/iaa-analysis/index.vue
   */
  load(componentPath: string): () => Promise<any> {
    if (!componentPath) {
      return this.createEmptyComponent()
    }

    // 统一为正斜杠；保证以 / 开头，避免拼成 ../../viewsxxx.vue 导致精确键匹配失败
    const trimmed = componentPath.replace(/\\/g, '/').trim()
    const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
    const module = this.resolveViewModule(normalized)

    if (!module) {
      const fullPath = `../../views${normalized}.vue`
      const fullPathWithIndex = `../../views${normalized}/index.vue`
      console.error(
        `[ComponentLoader] 未找到组件: ${componentPath}，尝试过的路径: ${fullPath} 和 ${fullPathWithIndex}`
      )
      return this.createErrorComponent(componentPath)
    }

    return module
  }

  private buildModuleIndex(): void {
    Object.entries(this.modules).forEach(([rawKey, moduleLoader]) => {
      const key = rawKey.replace(/\\/g, '/')
      if (!key.startsWith('../../views/')) {
        return
      }

      const rel = key.slice('../../views'.length)
      if (!rel.endsWith('.vue')) {
        return
      }

      const withoutExt = rel.slice(0, -4)
      this.moduleIndex.set(withoutExt, moduleLoader)

      if (withoutExt.endsWith('/index')) {
        const dirPath = withoutExt.slice(0, -'/index'.length) || '/'
        this.moduleIndex.set(dirPath, moduleLoader)
      }
    })
  }

  /**
   * 按约定路径解析 glob 中的视图模块；先精确键名，再按 `views/...` 后缀匹配（兼容 Vite 在不同系统下生成的键差异）
   */
  private resolveViewModule(normalized: string): (() => Promise<any>) | undefined {
    const normalizedPath = normalized === '' ? '/' : normalized
    return (
      this.moduleIndex.get(normalizedPath) ||
      this.moduleIndex.get(`${normalizedPath}/index`) ||
      undefined
    )
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
