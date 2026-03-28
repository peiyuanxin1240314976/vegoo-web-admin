/**
 * 将「同一物理行内含多条 declaration」的 `{ ... }` 展开为多行，满足
 * declaration-block-single-line-max-declarations。
 * 仅处理块内不含嵌套 `{` 的情形（与当前账户管理模块违规形态一致）。
 */
import fs from 'node:fs'
import path from 'node:path'

const roots = [
  path.resolve('src/views/config-management/account-management'),
  path.resolve('src/views/account-management')
]

function* walkVue(dir) {
  if (!fs.existsSync(dir)) return
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walkVue(p)
    else if (e.isFile() && e.name.endsWith('.vue')) yield p
  }
}

function lineIndent(line) {
  const m = line.match(/^(\s*)/)
  return m ? m[1] : ''
}

/** 从 openBraceIndex 起匹配成对 {}，返回闭合 } 的下标，失败返回 -1 */
function findClosingBrace(text, openIdx) {
  let depth = 0
  for (let j = openIdx; j < text.length; j++) {
    const c = text[j]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return j
    }
  }
  return -1
}

/**
 * 在 text 中展开第一个可展开块（同一段内从块起至 } 无换行、无内层 {、声明数>1）
 */
function tryExpandOneBlockInText(text) {
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue

    const open = i
    const close = findClosingBrace(text, open)
    if (close === -1) continue

    const segment = text.slice(open, close + 1)
    if (segment.includes('\n')) continue

    const body = text.slice(open + 1, close).trim()
    if (body.includes('{') || body.includes('}')) continue

    const decls = body
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
    if (decls.length <= 1) continue

    const lineStart = text.lastIndexOf('\n', open - 1) + 1
    const rawBefore = text.slice(lineStart, open)
    const baseIndent = lineIndent(rawBefore)
    const selector = rawBefore.slice(baseIndent.length).trimEnd()
    const innerIndent = `${baseIndent}  `
    const after = text.slice(close + 1)

    const replacement = `${baseIndent}${selector} {\n${decls
      .map((d) => `${innerIndent}${d};`)
      .join('\n')}\n${baseIndent}}`

    return text.slice(0, lineStart) + replacement + after
  }
  return text
}

function fixScssLikeBlock(blockContent) {
  let text = blockContent
  let prev
  do {
    prev = text
    text = tryExpandOneBlockInText(text)
  } while (text !== prev)
  return text
}

function processVueFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8')
  const styleRe = /(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi
  let changed = false
  const out = src.replace(styleRe, (full, openTag, body, closeTag) => {
    const next = fixScssLikeBlock(body)
    if (next !== body) changed = true
    return openTag + next + closeTag
  })
  if (changed) fs.writeFileSync(filePath, out, 'utf8')
  return changed
}

let n = 0
for (const root of roots) {
  for (const file of walkVue(root)) {
    if (processVueFile(file)) {
      n++
      console.log('fixed:', path.relative(process.cwd(), file))
    }
  }
}
console.log(`done. ${n} file(s) updated.`)
