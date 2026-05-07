function copyComputedStyles(source: Element, target: HTMLElement | SVGElement) {
  const computed = window.getComputedStyle(source)
  for (let index = 0; index < computed.length; index += 1) {
    const name = computed.item(index)
    if (!name) continue
    target.style.setProperty(
      name,
      computed.getPropertyValue(name),
      computed.getPropertyPriority(name)
    )
  }
}

function syncFormValue(source: Element, target: Element) {
  if (source instanceof HTMLTextAreaElement && target instanceof HTMLTextAreaElement) {
    target.value = source.value
    target.textContent = source.value
    return
  }

  if (source instanceof HTMLInputElement && target instanceof HTMLInputElement) {
    if (source.type === 'checkbox' || source.type === 'radio') {
      target.checked = source.checked
      if (source.checked) target.setAttribute('checked', 'checked')
      else target.removeAttribute('checked')
      return
    }

    target.value = source.value
    target.setAttribute('value', source.value)
    return
  }

  if (source instanceof HTMLSelectElement && target instanceof HTMLSelectElement) {
    target.value = source.value
  }
}

function cloneNodeWithInlineStyles<T extends HTMLElement>(node: T): T {
  const clone = node.cloneNode(true) as T
  const sourceNodes = [node, ...Array.from(node.querySelectorAll('*'))]
  const clonedNodes = [clone, ...Array.from(clone.querySelectorAll('*'))]

  sourceNodes.forEach((sourceNode, index) => {
    const clonedNode = clonedNodes[index]
    if (!clonedNode) return

    copyComputedStyles(sourceNode, clonedNode as HTMLElement | SVGElement)
    syncFormValue(sourceNode, clonedNode)

    if (sourceNode instanceof SVGElement && clonedNode instanceof SVGElement) {
      clonedNode.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }

    if (sourceNode instanceof HTMLCanvasElement && clonedNode instanceof HTMLCanvasElement) {
      clonedNode.width = sourceNode.width
      clonedNode.height = sourceNode.height
      const ctx = clonedNode.getContext('2d')
      ctx?.drawImage(sourceNode, 0, 0)
    }
  })

  return clone
}

function createSvgDataUrl(markup: string, width: number, height: number) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <foreignObject x="0" y="0" width="100%" height="100%">${markup}</foreignObject>
    </svg>
  `
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = 'sync'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load generated screenshot image'))
    img.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export screenshot as PNG'))
    }, 'image/png')
  })
}

export async function elementToPngBlob(
  element: HTMLElement,
  options?: {
    pixelRatio?: number
    backgroundColor?: string
    resetRootTransform?: boolean
  }
) {
  const rect = element.getBoundingClientRect()
  const width = Math.max(Math.ceil(rect.width), Math.ceil(element.scrollWidth), 1)
  const height = Math.max(Math.ceil(rect.height), Math.ceil(element.scrollHeight), 1)
  const pixelRatio = Math.max(1, Math.min(options?.pixelRatio ?? window.devicePixelRatio ?? 2, 3))

  const wrapper = document.createElement('div')
  wrapper.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml')
  wrapper.style.width = `${width}px`
  wrapper.style.height = `${height}px`
  wrapper.style.boxSizing = 'border-box'
  wrapper.style.background = options?.backgroundColor ?? '#ffffff'
  wrapper.style.padding = '0'
  wrapper.style.margin = '0'
  const clonedElement = cloneNodeWithInlineStyles(element)
  if (options?.resetRootTransform) {
    clonedElement.style.transform = 'none'
    clonedElement.style.transformOrigin = 'top left'
  }
  wrapper.appendChild(clonedElement)

  const markup = new XMLSerializer().serializeToString(wrapper)
  const image = await loadImage(createSvgDataUrl(markup, width, height))

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * pixelRatio)
  canvas.height = Math.round(height * pixelRatio)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to create canvas context')

  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.fillStyle = options?.backgroundColor ?? '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(image, 0, 0, width, height)

  return canvasToBlob(canvas)
}
