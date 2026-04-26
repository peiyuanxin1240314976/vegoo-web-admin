<template>
  <div class="role-permission-pages flex h-full min-h-0 flex-col" v-loading="loading">
    <div class="panel-intro">
      <div>
        <h3 class="panel-intro__title">页面访问范围</h3>
        <p class="panel-intro__desc">勾选后角色可在侧边导航和直达访问中看到对应页面。</p>
      </div>
      <div class="panel-intro__stats">
        <ElTag type="primary" effect="plain" round
          >{{ checkedCount }} / {{ totalCount }} 个路由</ElTag
        >
      </div>
    </div>

    <div class="panel-toolbar">
      <ElButton round @click="expandAll">展开全部</ElButton>
      <ElButton round @click="collapseAll">收起全部</ElButton>
      <ElButton round @click="checkAll">全选</ElButton>
      <ElButton round @click="clearAll">清空</ElButton>
    </div>

    <ElScrollbar class="tree-scroll">
      <ElTree
        ref="treeRef"
        :data="routeTree"
        node-key="routeName"
        show-checkbox
        default-expand-all
        class="route-tree"
        :props="treeProps"
      >
        <template #default="{ data }">
          <div class="route-node">
            <div class="route-node__main">
              <span class="route-node__title">{{ resolveTitle(data.title) }}</span>
              <span class="route-node__path">{{ data.path }}</span>
            </div>
            <ElTag v-if="data.children?.length" size="small" type="info" effect="plain" round>
              目录
            </ElTag>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>

    <div class="panel-tip">
      <ElAlert
        title="按钮级权限本期不落地，保存时会预留 buttonPermissions.codes 字段。"
        type="info"
        :closable="false"
        show-icon
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElTree } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import {
    fetchRolePermissionPages,
    type RolePagePermissionResponse
  } from '@/api/config-management/role'

  defineOptions({ name: 'RolePermissionPages' })

  const props = defineProps<{
    roleId?: number
  }>()

  const { t } = useI18n()

  const loading = ref(false)
  const routeTree = ref<RolePagePermissionResponse['routeTree']>([])
  const checkedRouteNames = ref<string[]>([])
  const treeRef = ref<InstanceType<typeof ElTree> | null>(null)
  const treeProps = {
    label: 'title',
    children: 'children'
  }

  const totalCount = computed(() => countNodes(routeTree.value))
  const checkedCount = computed(() => {
    const keys = getRouteNames()
    return new Set(keys).size
  })

  function countNodes(nodes: RolePagePermissionResponse['routeTree']): number {
    return nodes.reduce((sum, item) => sum + 1 + countNodes(item.children ?? []), 0)
  }

  function resolveTitle(title: string): string {
    return title.startsWith('menus.') ? t(title) : title
  }

  async function loadData() {
    if (!props.roleId) {
      routeTree.value = []
      checkedRouteNames.value = []
      return
    }

    loading.value = true
    try {
      const res = await fetchRolePermissionPages({ roleId: props.roleId })
      routeTree.value = res.routeTree || []
      checkedRouteNames.value = res.checkedRouteNames || []

      await nextTick()
      // 回显只使用“叶子页面”节点：如果把父级目录 routeName 也 set 进去，
      // Element Plus 会把整棵子树重新勾选，导致你取消子级后又被“带回去”
      const leafSet = new Set(flattenLeafRouteNames(routeTree.value))
      const leafChecked = (checkedRouteNames.value ?? []).filter((key) => leafSet.has(key))
      treeRef.value?.setCheckedKeys(leafChecked)
    } catch (error) {
      console.error('获取页面权限失败', error)
      routeTree.value = []
      checkedRouteNames.value = []
    } finally {
      loading.value = false
    }
  }

  function getRouteNames(): string[] {
    const tree = treeRef.value as any
    // UI 选择以叶子页面为准，但保存时需要把父级目录一并传递（父级下的未勾选子级要过滤掉）
    const leafKeys = ((tree?.getCheckedKeys(true) as string[] | undefined) ?? []).filter(Boolean)
    const parentMap = buildParentMap(routeTree.value)
    const withParents = new Set<string>(leafKeys)
    leafKeys.forEach((key) => {
      let current = key
      while (parentMap.has(current)) {
        const parent = parentMap.get(current)
        if (!parent) break
        withParents.add(parent)
        current = parent
      }
    })
    return Array.from(withParents)
  }

  function checkAll() {
    const allKeys = flattenLeafRouteNames(routeTree.value)
    treeRef.value?.setCheckedKeys(allKeys)
  }

  function clearAll() {
    treeRef.value?.setCheckedKeys([])
  }

  function expandAll() {
    setExpandState(true)
  }

  function collapseAll() {
    setExpandState(false)
  }

  function setExpandState(expanded: boolean) {
    const store = (treeRef.value as any)?.store
    const nodeMap = store?.nodesMap ?? {}
    Object.keys(nodeMap).forEach((key) => {
      nodeMap[key].expanded = expanded
    })
  }

  function flattenLeafRouteNames(nodes: RolePagePermissionResponse['routeTree']): string[] {
    return nodes.flatMap((item) => {
      if (item.children?.length) return flattenLeafRouteNames(item.children)
      return item.routeName ? [item.routeName] : []
    })
  }

  function buildParentMap(
    nodes: RolePagePermissionResponse['routeTree'],
    parent?: string
  ): Map<string, string> {
    const map = new Map<string, string>()
    const walk = (list: RolePagePermissionResponse['routeTree'], parentKey?: string) => {
      list.forEach((node) => {
        if (parentKey) map.set(node.routeName, parentKey)
        if (node.children?.length) walk(node.children, node.routeName)
      })
    }
    walk(nodes, parent)
    return map
  }

  function reset() {
    loadData()
  }

  defineExpose({
    reset,
    getRouteNames
  })

  watch(
    () => props.roleId,
    () => {
      loadData()
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .role-permission-pages {
    gap: 12px;
  }

  .panel-intro {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
  }

  .panel-intro__title {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .panel-intro__desc {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .panel-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .tree-scroll {
    flex: 1;
    min-height: 0;
    padding: 1px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;

    :deep(.el-scrollbar__wrap) {
      padding: 12px;
    }
  }

  .route-tree {
    :deep(.el-tree-node__content) {
      height: auto;
      padding: 6px 0;
    }
  }

  .route-node {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-width: 0;
  }

  .route-node__main {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .route-node__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .route-node__path {
    margin-top: 2px;
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .panel-tip {
    flex-shrink: 0;
  }
</style>
