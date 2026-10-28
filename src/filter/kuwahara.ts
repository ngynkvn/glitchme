import { cloneImage, getBrightness, getRGBA, type PixelImage } from '../util'

// Clamp sampling at edges and weight color by alpha to avoid dark halos.
function sampleQuadrant(image: PixelImage, x: number, y: number, dx: number, dy: number) {
  const sums = [0, 0, 0]
  let weight = 0
  let brightness = 0
  let squared = 0
  for (let oy = 0; oy <= 2; oy++) {
    for (let ox = 0; ox <= 2; ox++) {
      const px = Math.max(0, Math.min(image.width - 1, x + ox * dx))
      const py = Math.max(0, Math.min(image.height - 1, y + oy * dy))
      const rgba = getRGBA(image, px, py)
      const alpha = rgba[3] / 255
      const value = getBrightness(rgba)
      weight += alpha
      brightness += value * alpha
      squared += value * value * alpha
      for (let channel = 0; channel < 3; channel++) sums[channel] += rgba[channel] * alpha
    }
  }
  if (weight === 0) return { variance: Infinity, color: sums }
  return {
    variance: Math.max(0, squared / weight - (brightness / weight) ** 2),
    color: sums.map((value) => value / weight),
  }
}

export function kuwahara(image: PixelImage): PixelImage {
  const output = cloneImage(image)
  const quadrants = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]
  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const samples = quadrants.map(([dx, dy]) => sampleQuadrant(image, x, y, dx, dy))
      const best = samples.reduce((a, b) => (a.variance <= b.variance ? a : b))
      const index = (y * image.width + x) * 4
      if (!Number.isFinite(best.variance)) continue
      output.data.set(best.color, index)
      // Keep the original alpha, including the outermost rows and columns.
    }
  }
  return output
}
