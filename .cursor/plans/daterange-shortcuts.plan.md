# 范围日期快捷项扩展（含「本月」与 maxHistoryDays）

## 权限策略

- **B（维持）**：`allowCustomRange === false` 时，仍只保留「跨度天数 === `defaultRangeDays`」的快捷项（[`filterDateRangeShortcutsForScope`](d:\私活\Vegoo\web-vegoo-admin\src\utils\permission\resolve-date-permission-for-picker.ts) 现有逻辑不改语义）。

## 「本月」额外可见性规则（新增）

「本月」区间为 **当月 1 日 00:00:00 — 今天 `endOfDay`**（与产品约定一致）。

设 `D = inclusiveLocalDayCount(当月1日, 今天)`（与现有工具函数一致，自然日含首尾）。

当存在日期权限 `scope` 且 `maxHistoryDays` 为有效非负数字时：

- **仅当 `D <= maxHistoryDays`** 时，「本月」快捷项可进入后续过滤；**若 `D > maxHistoryDays`**，**不展示**「本月」。
- 例：角色 **7 天**查看范围（`maxHistoryDays === 7`），今天是当月第 6 日 → `D = 6` → `6 <= 7` → 允许进入后续判断；若已是当月第 8 日 → `D = 8` → `8 > 7` → **不展示**「本月」。

仍须同时满足已有条件（与其它快捷一致）：

- `startOfDay(起点) >= minSelectableDay(now, maxHistoryDays)`（若配置了 `maxHistoryDays`）；
- `endOfDay(终点) <= endOfDay(now)`；
- `allowCustomRange === false` 时仍须 `D === defaultRangeDays`（策略 B），故 **严格模式下「本月」仅在偶然与 `defaultRangeDays` 相等时出现**。

**上月**、**今天**、**昨天**、**近15天**等：不增加「`D <= maxHistoryDays`」这条，仅沿用现有 min/max + 严格跨度规则。

## 实现要点

1. **[`src/utils/form/date-shortcuts.ts`](d:\私活\Vegoo\web-vegoo-admin\src\utils\form\date-shortcuts.ts)**

   - 实现「本月」等快捷；为「本月」项增加可机器识别的标记（推荐扩展 [`DateShortcutItem`](d:\私活\Vegoo\web-vegoo-admin\src\utils\permission\resolve-date-permission-for-picker.ts) 为可选字段，如 `preset?: 'thisMonth'`），**禁止**用中文 `text` 在权限层写死判断（后续 i18n 会踩坑）。

2. **[`src/utils/permission/resolve-date-permission-for-picker.ts`](d:\私活\Vegoo\web-vegoo-admin\src\utils\permission\resolve-date-permission-for-picker.ts)**

   - 在 `filterDateRangeShortcutsForScope` 中：若 `shortcut.preset === 'thisMonth'`，在现有逻辑前或合并进同一 `filter` 回调中增加 `D <= scope.maxHistoryDays`（当 `typeof scope.maxHistoryDays === 'number' && scope.maxHistoryDays >= 0`）。

3. **[`src/components/core/forms/AppDatePicker.vue`](d:\私活\Vegoo\web-vegoo-admin\src\components\core\forms\AppDatePicker.vue)**
   - 无需改动（仍使用同一 `dateRangeShortcuts` 与过滤函数）。

## 与「代码 min 窗口」的关系说明

当前 `minSelectableDay` 为「今天往前推 `maxHistoryDays` 个日历日」的 0 点，与「从 1 号到今天共 `D` 天」的口径不同；按产品要求以 **`D <= maxHistoryDays`** 作为「本月」是否出现的**显式**条件，避免仅靠边界判断与业务表述不一致。
