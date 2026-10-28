import { processImage } from './processor'
import type { Settings } from './settings'
import type { PixelImage } from './util'

self.onmessage = (event: MessageEvent<{ image: PixelImage; settings: Settings }>) => {
  try {
    const start = performance.now()
    const result = processImage(event.data.image, event.data.settings)
    self.postMessage(
      { ...result, duration: performance.now() - start },
      { transfer: [result.image.data.buffer, result.mask.data.buffer] },
    )
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Image processing failed.' })
  }
}
