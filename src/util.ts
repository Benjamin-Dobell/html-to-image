import { Options } from './options'

const WOFF = 'application/font-woff'
const JPEG = 'image/jpeg'
const mimes: { [key: string]: string } = {
  woff: WOFF,
  woff2: WOFF,
  ttf: 'application/font-truetype',
  eot: 'application/vnd.ms-fontobject',
  png: 'image/png',
  jpg: JPEG,
  jpeg: JPEG,
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
}

export function getExtension(url: string): string {
  const match = /\.([^./]*?)$/g.exec(url)
  return match ? match[1] : ''
}

export function getMimeType(url: string): string {
  const extension = getExtension(url).toLowerCase()
  return mimes[extension] || ''
}

export function resolveUrl(url: string, baseUrl: string | null): string {
  // url is absolute already
  if (url.match(/^[a-z]+:\/\//i)) {
    return url
  }

  // url is absolute already, without protocol
  if (url.match(/^\/\//)) {
    return window.location.protocol + url
  }

  // dataURI, mailto:, tel:, etc.
  if (url.match(/^[a-z]+:/i)) {
    return url
  }

  const doc = document.implementation.createHTMLDocument()
  const base = doc.createElement('base')
  const a = doc.createElement('a')

  doc.head.appendChild(base)
  doc.body.appendChild(a)

  if (baseUrl) {
    base.href = baseUrl
  }

  a.href = url

  return a.href
}

export function isDataUrl(url: string) {
  return url.search(/^(data:)/) !== -1
}

export function makeDataUrl(content: string, mimeType: string) {
  return `data:${mimeType};base64,${content}`
}

export function parseDataUrlContent(dataURL: string) {
  return dataURL.split(/,/)[1]
}

export const uuid = (function uuid() {
  // generate uuid for className of pseudo elements.
  // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
  let counter = 0

  // ref: http://stackoverflow.com/a/6248722/2519373
  const random = () =>
    // eslint-disable-next-line no-bitwise
    `0000${((Math.random() * 36 ** 4) << 0).toString(36)}`.slice(-4)

  return () => {
    counter += 1
    return `u${random()}${counter}`
  }
})()

export const delay =
  <T>(ms: number) =>
  (args: T) =>
    new Promise<T>((resolve) => setTimeout(() => resolve(args), ms))

export function toArray<T>(arrayLike: any): T[] {
  const arr: T[] = []

  for (let i = 0, l = arrayLike.length; i < l; i += 1) {
    arr.push(arrayLike[i])
  }

  return arr
}

function px(node: HTMLElement, styleProperty: string) {
  const val = window.getComputedStyle(node).getPropertyValue(styleProperty)
  return parseFloat(val.replace('px', ''))
}

export function getNodeWidth(node: HTMLElement) {
  const leftBorder = px(node, 'border-left-width')
  const rightBorder = px(node, 'border-right-width')
  return node.clientWidth + leftBorder + rightBorder
}

export function getNodeHeight(node: HTMLElement) {
  const topBorder = px(node, 'border-top-width')
  const bottomBorder = px(node, 'border-bottom-width')
  return node.clientHeight + topBorder + bottomBorder
}

export function getPixelRatio() {
  let ratio

  let FINAL_PROCESS
  try {
    FINAL_PROCESS = process
  } catch (e) {
    // pass
  }

  const val =
    FINAL_PROCESS && FINAL_PROCESS.env
      ? FINAL_PROCESS.env.devicePixelRatio
      : null
  if (val) {
    ratio = parseInt(val, 10)
    if (Number.isNaN(ratio)) {
      ratio = 1
    }
  }
  return ratio || window.devicePixelRatio || 1
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  options: Options = {},
): Promise<Blob | null> {
  if (canvas.toBlob) {
    return new Promise((resolve) =>
      canvas.toBlob(
        resolve,
        options.type ? options.type : 'image/png',
        options.quality ? options.quality : 1,
      ),
    )
  }

  return new Promise((resolve) => {
    const binaryString = window.atob(
      canvas
        .toDataURL(
          options.type ? options.type : undefined,
          options.quality ? options.quality : undefined,
        )
        .split(',')[1],
    )
    const len = binaryString.length
    const binaryArray = new Uint8Array(len)

    for (let i = 0; i < len; i += 1) {
      binaryArray[i] = binaryString.charCodeAt(i)
    }

    resolve(
      new Blob([binaryArray], {
        type: options.type ? options.type : 'image/png',
      }),
    )
  })
}

export function getImageSize(node: HTMLElement, options: Options = {}) {
  const width = options.width || getNodeWidth(node)
  const height = options.height || getNodeHeight(node)

  return { width, height }
}

export async function createImage(url: string): Promise<HTMLImageElement> {
  const img = new Image()

  await Promise.all([
    new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.crossOrigin = 'anonymous'
      img.decoding = 'sync'
      img.src = url
    }),
    new Promise<void>((resolve, reject) => {
      // Irrespective of 'sync' decoding, Safari's <img> load event currently fires before loading
      // has completed when an SVG src is provided. Thus we additionally track the load event of an
      // <embed> element, which does function correctly in Safari.
      const loadingProxy = document.createElement('embed')
      loadingProxy.type = 'image/svg+xml'
      loadingProxy.width = '0'
      loadingProxy.height = '0'
      loadingProxy.onload = () => {
        document.body.removeChild(loadingProxy)
        resolve()
      }
      loadingProxy.onabort = reject
      loadingProxy.onerror = reject
      loadingProxy.src = url
      document.body.appendChild(loadingProxy)
    }),
  ])

  return img
}

const dimensionCanvasLimit = 16384 // as per https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size

export function checkCanvasDimensions(canvas: HTMLCanvasElement) {
  if (
    canvas.width > dimensionCanvasLimit ||
    canvas.height > dimensionCanvasLimit
  ) {
    if (
      canvas.width > dimensionCanvasLimit &&
      canvas.height > dimensionCanvasLimit
    ) {
      if (canvas.width > canvas.height) {
        canvas.height *= dimensionCanvasLimit / canvas.width
        canvas.width = dimensionCanvasLimit
      } else {
        canvas.width *= dimensionCanvasLimit / canvas.height
        canvas.height = dimensionCanvasLimit
      }
    } else if (canvas.width > dimensionCanvasLimit) {
      canvas.height *= dimensionCanvasLimit / canvas.width
      canvas.width = dimensionCanvasLimit
    } else {
      canvas.width *= dimensionCanvasLimit / canvas.height
      canvas.height = dimensionCanvasLimit
    }
  }
}

export function imageToCanvas(
  node: HTMLElement,
  img: HTMLImageElement,
  options: Options = {},
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  const ratio = options.pixelRatio || getPixelRatio()
  const { width, height } = getImageSize(node, options)

  const canvasWidth = options.canvasWidth || width
  const canvasHeight = options.canvasHeight || height

  canvas.width = canvasWidth * ratio
  canvas.height = canvasHeight * ratio

  if (!options.skipAutoScale) {
    checkCanvasDimensions(canvas)
  }
  canvas.style.width = `${canvasWidth}`
  canvas.style.height = `${canvasHeight}`

  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.drawImage(img, 0, 0, canvas.width, canvas.height)

  return canvas
}

export async function svgToDataURL(svg: SVGElement): Promise<string> {
  return Promise.resolve()
    .then(() => new XMLSerializer().serializeToString(svg))
    .then(encodeURIComponent)
    .then((html) => `data:image/svg+xml;charset=utf-8,${html}`)
}

export async function nodeToDataURL(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  const xmlns = 'http://www.w3.org/2000/svg'
  const svg = document.createElementNS(xmlns, 'svg')
  const foreignObject = document.createElementNS(xmlns, 'foreignObject')

  svg.setAttribute('width', `${width}`)
  svg.setAttribute('height', `${height}`)
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)

  foreignObject.setAttribute('width', '100%')
  foreignObject.setAttribute('height', '100%')
  foreignObject.setAttribute('x', '0')
  foreignObject.setAttribute('y', '0')
  foreignObject.setAttribute('externalResourcesRequired', 'true')

  svg.appendChild(foreignObject)
  foreignObject.appendChild(node)

  return svgToDataURL(svg)
}
