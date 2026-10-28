import { describe, expect, it } from 'vitest'
import { processImage } from '../src/processor'
import { kuwahara } from '../src/filter/kuwahara'
import { DEFAULT_SETTINGS, PRESETS, remixSettings } from '../src/settings'
import { getBrightness, getHue, getSaturation, type PixelImage } from '../src/util'

const base = { ...DEFAULT_SETTINGS, low: 0, high: 1, strength: 1, shift: 0, span: 640 }
const grayscale = (values: number[], width = values.length): PixelImage => ({
  width,
  height: values.length / width,
  data: new Uint8ClampedArray(values.flatMap((value) => [value, value, value, 255])),
})
const reds = (image: PixelImage) => Array.from(image.data).filter((_, i) => i % 4 === 0)

describe('pixel sorting regressions', () => {
  it('sorts the entire final run, including the right edge, without mutating the source', () => {
    const source = grayscale([190, 70, 140, 20])
    expect(reds(processImage(source, base).image)).toEqual([20, 70, 140, 190])
    expect(reds(source)).toEqual([190, 70, 140, 20])
  })

  it('keeps excluded pixels in place and never sorts across a threshold gap', () => {
    const result = processImage(grayscale([150, 90, 0, 140, 60, 255]), {
      ...base,
      low: 0.1,
      high: 0.8,
    })
    expect(reds(result.image)).toEqual([90, 150, 0, 60, 140, 255])
    expect(reds(result.mask)).toEqual([255, 255, 0, 255, 255, 0])
    expect(result.selected).toBeCloseTo(4 / 6)
  })

  it('sorts columns independently, including the bottom edge', () => {
    expect(
      reds(
        processImage(grayscale([200, 90, 50, 10, 120, 80], 2), { ...base, direction: 'vertical' })
          .image,
      ),
    ).toEqual([50, 10, 120, 80, 200, 90])
  })

  it('honors reverse sorting and segment length', () => {
    const source = grayscale([90, 220, 10, 170])
    expect(reds(processImage(source, { ...base, reverse: true }).image)).toEqual([220, 170, 90, 10])
    expect(reds(processImage(source, { ...base, span: 2 }).image)).toEqual([90, 220, 10, 170])
  })

  it('does nothing at zero intensity and blends at partial intensity', () => {
    const source = grayscale([200, 100])
    expect(reds(processImage(source, { ...base, strength: 0 }).image)).toEqual([200, 100])
    expect(reds(processImage(source, { ...base, strength: 0.5 }).image)).toEqual([150, 150])
  })

  it('excludes transparent gaps and preserves alpha at every source position', () => {
    const source = grayscale([180, 20, 100, 50])
    source.data[7] = 0
    source.data[15] = 120
    const result = processImage(source, base)
    expect(reds(result.image)).toEqual([180, 20, 50, 100])
    expect(Array.from(result.image.data).filter((_, i) => i % 4 === 3)).toEqual([255, 0, 255, 120])
    expect(result.mask.data[4]).toBe(0)
  })

  it('sorts hue and saturation using their own color scores', () => {
    const source = {
      width: 3,
      height: 1,
      data: new Uint8ClampedArray([0, 0, 255, 255, 255, 0, 0, 255, 0, 255, 0, 255]),
    }
    expect(Array.from(processImage(source, { ...base, sortBy: 'hue' }).image.data)).toEqual([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255,
    ])
    const saturation = {
      width: 2,
      height: 1,
      data: new Uint8ClampedArray([255, 0, 0, 255, 128, 128, 128, 255]),
    }
    expect(reds(processImage(saturation, { ...base, sortBy: 'saturation' }).image)).toEqual([
      128, 255,
    ])
  })

  it('clamps RGB split to the same row and keeps alpha', () => {
    const image = processImage(grayscale([10, 20, 30, 40], 2), {
      ...base,
      strength: 0,
      shift: 1,
    }).image
    expect(Array.from(image.data)).toEqual([
      10, 10, 20, 255, 10, 20, 20, 255, 30, 30, 40, 255, 30, 40, 40, 255,
    ])
  })
})

describe('Kuwahara and settings', () => {
  it('preserves a constant image all the way to every border', () => {
    const image = grayscale(Array(25).fill(100), 5)
    expect(kuwahara(image)).toEqual(image)
  })
  it('handles a single pixel and completely transparent images', () => {
    const image = grayscale([87])
    expect(kuwahara(image)).toEqual(image)
    image.data[3] = 0
    expect(kuwahara(image)).toEqual(image)
  })
  it('preserves alpha for smoothed transparent images', () => {
    const image = grayscale(Array(9).fill(180), 3)
    image.data[3] = 0
    image.data[7] = 80
    expect(Array.from(kuwahara(image).data).filter((_, i) => i % 4 === 3)).toEqual([
      0, 80, 255, 255, 255, 255, 255, 255, 255,
    ])
  })
  it('produces bounded, ordered settings for every preset and remix', () => {
    const settings = [
      ...PRESETS.map((preset) => preset.settings),
      ...Array.from({ length: 100 }, remixSettings),
    ]
    for (const item of settings) {
      expect(item.low).toBeGreaterThanOrEqual(0)
      expect(item.high).toBeLessThanOrEqual(1)
      expect(item.low).toBeLessThanOrEqual(item.high)
      expect(item.strength).toBeGreaterThanOrEqual(0)
      expect(item.strength).toBeLessThanOrEqual(1)
    }
  })
  it('handles grayscale and black in color helpers', () => {
    expect(getHue([50, 50, 50, 255])).toBe(0)
    expect(getSaturation([0, 0, 0, 255])).toBe(0)
    expect(getBrightness([255, 255, 255, 255])).toBeCloseTo(255)
  })
})
