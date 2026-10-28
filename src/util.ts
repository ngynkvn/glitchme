export interface PixelImage {
  width: number
  height: number
  data: Uint8ClampedArray
}

export type RGBA = [number, number, number, number]

export function getRGBA(image: PixelImage, x: number, y: number): RGBA {
  const i = (y * image.width + x) * 4
  return [image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3]]
}

export function getBrightness([r, g, b]: RGBA) {
  return r * 0.299 + g * 0.587 + b * 0.114
}

export function getHue([r, g, b]: RGBA) {
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  if (delta === 0) return 0
  let hue = (r - g) / delta + 4
  if (max === r) hue = (g - b) / delta + (g < b ? 6 : 0)
  else if (max === g) hue = (b - r) / delta + 2
  return hue * 60
}

export function getSaturation([r, g, b]: RGBA) {
  const max = Math.max(r, g, b)
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max
}

export function cloneImage(image: PixelImage): PixelImage {
  return { width: image.width, height: image.height, data: image.data.slice() }
}
