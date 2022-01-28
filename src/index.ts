import { Options } from './options'
import { cloneNode } from './cloneNode'
import { embedImages } from './embedImages'
import { applyStyleWithOptions } from './applyStyleWithOptions'
import { embedWebFonts, getWebFontCSS } from './embedWebFonts'
import {
  canvasToBlob,
  imageToCanvas,
  createImage,
  getImageSize,
  nodeToDataURL,
} from './util'

export async function toSvg<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<string> {
  const { width, height } = getImageSize(node, options)

  return Promise.resolve(node)
    .then((nativeNode) => cloneNode(nativeNode, options, true))
    .then((clonedNode) => embedWebFonts(clonedNode!, options))
    .then((clonedNode) => embedImages(clonedNode, options))
    .then((clonedNode) => applyStyleWithOptions(clonedNode, options))
    .then((clonedNode) => nodeToDataURL(clonedNode, width, height))
}

export async function toCanvas<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<HTMLCanvasElement> {
  return toSvg(node, options)
    .then(createImage)
    .then((img) => imageToCanvas(node, img, options))
}

export async function toPixelData<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<Uint8ClampedArray> {
  const { width, height } = getImageSize(node, options)
  return toCanvas(node, options).then((canvas) => {
    const ctx = canvas.getContext('2d')!
    return ctx.getImageData(0, 0, width, height).data
  })
}

export async function toPng<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<string> {
  return toCanvas(node, options).then((canvas) => canvas.toDataURL())
}

export async function toJpeg<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<string> {
  return toCanvas(node, options).then((canvas) =>
    canvas.toDataURL('image/jpeg', options.quality || 1),
  )
}

export async function toBlob<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<Blob | null> {
  return toCanvas(node, options).then(canvasToBlob)
}

export async function getFontEmbedCSS<T extends HTMLElement>(
  node: T,
  options: Options = {},
): Promise<string> {
  return getWebFontCSS(node, options)
}
