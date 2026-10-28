import { cloneImage, getBrightness, getHue, getRGBA, getSaturation, type PixelImage } from './util'
import { kuwahara } from './filter/kuwahara'
import type { Settings } from './settings'

function selectionMask(image: PixelImage, settings: Settings) {
  const mask = cloneImage(image)
  let selected = 0
  for (let i = 0; i < image.data.length; i += 4) {
    const brightness =
      getBrightness([image.data[i], image.data[i + 1], image.data[i + 2], image.data[i + 3]]) / 255
    const included =
      image.data[i + 3] > 0 && brightness >= settings.low && brightness <= settings.high
    const value = included ? 255 : 0
    mask.data.set([value, value, value, 255], i)
    if (included) selected++
  }
  return { mask, selected: selected / (image.width * image.height) }
}

function sortSegment(image: PixelImage, output: PixelImage, offsets: number[], settings: Settings) {
  const score = { brightness: getBrightness, hue: getHue, saturation: getSaturation }[
    settings.sortBy
  ]
  const pixels = offsets.map((offset) => {
    const pixel = getRGBA(image, offset % image.width, Math.floor(offset / image.width))
    return { pixel, score: score(pixel) }
  })
  pixels.sort((a, b) => (settings.reverse ? -1 : 1) * (a.score - b.score))
  offsets.forEach((offset, index) => {
    const i = offset * 4
    for (let channel = 0; channel < 3; channel++) {
      output.data[i + channel] =
        image.data[i + channel] * (1 - settings.strength) +
        pixels[index].pixel[channel] * settings.strength
    }
    // Alpha stays at its source position; transparent gaps never enter a segment.
  })
}

function sortLine(
  image: PixelImage,
  output: PixelImage,
  mask: PixelImage,
  settings: Settings,
  line: number,
) {
  const horizontal = settings.direction === 'horizontal'
  const length = horizontal ? image.width : image.height
  let segment: number[] = []
  for (let position = 0; position <= length; position++) {
    const offset = horizontal ? line * image.width + position : position * image.width + line
    const included = position < length && mask.data[offset * 4] === 255
    if (segment.length > 0 && (!included || segment.length >= settings.span)) {
      sortSegment(image, output, segment, settings)
      segment = []
    }
    if (included) segment.push(offset)
  }
}

function sortPixels(image: PixelImage, mask: PixelImage, settings: Settings) {
  const output = cloneImage(image)
  const lines = settings.direction === 'horizontal' ? image.height : image.width
  for (let line = 0; line < lines; line++) sortLine(image, output, mask, settings, line)
  return output
}

function shiftChannels(image: PixelImage, amount: number) {
  if (amount === 0) return image
  const output = cloneImage(image)
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const i = (y * image.width + x) * 4
      const red = (y * image.width + Math.max(0, x - amount)) * 4
      const blue = (y * image.width + Math.min(image.width - 1, x + amount)) * 4
      if (image.data[red + 3]) output.data[i] = image.data[red]
      if (image.data[blue + 3]) output.data[i + 2] = image.data[blue + 2]
    }
  }
  return output
}

export function processImage(original: PixelImage, settings: Settings) {
  const source = settings.smooth ? kuwahara(original) : original
  const { mask, selected } = selectionMask(source, settings)
  const sorted = sortPixels(source, mask, settings)
  return { image: shiftChannels(sorted, settings.shift), mask, selected }
}
