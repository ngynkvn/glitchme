import type { PixelImage } from './util'

export interface LoadedImage {
  pixels: PixelImage
  name: string
  resized: boolean
}

export const MAX_DIMENSION = 1600

export async function decodeImage(url: string, name: string): Promise<LoadedImage> {
  const image = new Image()
  image.src = url
  try {
    await image.decode()
  } catch {
    throw new Error('This image could not be opened. Try a PNG, JPEG, WebP, or AVIF file.')
  }
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Your browser could not create a canvas. Try reloading the page.')
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  return { pixels: ctx.getImageData(0, 0, canvas.width, canvas.height), name, resized: scale < 1 }
}

export async function readFile(file: File): Promise<LoadedImage> {
  if (!file.type.startsWith('image/'))
    throw new Error('Choose an image file, such as a PNG, JPEG, WebP, or AVIF.')
  if (file.size > 25 * 1024 * 1024)
    throw new Error('This file is over 25 MB. Please choose a smaller image.')
  const url = URL.createObjectURL(file)
  try {
    return await decodeImage(url, file.name)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function downloadImage(image: PixelImage, name: string) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not export the image. Try reloading the page.')
  ctx.putImageData(
    new ImageData(new Uint8ClampedArray(image.data), image.width, image.height),
    0,
    0,
  )
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Could not export the image. Try another image.')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${name.replace(/\.[^.]+$/, '')}-glitch.png`
  link.href = url
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
