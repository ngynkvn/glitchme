import { useEffect, useState } from 'react'
import type { Settings } from '../settings'
import type { PixelImage } from '../util'

interface Result {
  source: PixelImage
  settings: Settings
  image: PixelImage
  mask: PixelImage
  selected: number
  duration: number
}

export function useProcessor(image: PixelImage | null, settings: Settings) {
  const [result, setResult] = useState<Result | null>(null)
  const [failure, setFailure] = useState<{
    source: PixelImage
    settings: Settings
    message: string
  } | null>(null)
  useEffect(() => {
    if (!image) return
    let worker: Worker | undefined
    const fail = (message: string) => {
      setFailure({ source: image, settings, message })
      worker?.terminate()
    }
    const timer = window.setTimeout(() => {
      try {
        worker = new Worker(new URL('../processor.worker.ts', import.meta.url), { type: 'module' })
        worker.onmessage = ({
          data,
        }: MessageEvent<Omit<Result, 'source' | 'settings'> & { error?: string }>) => {
          if (data.error) fail(data.error)
          else setResult({ ...data, source: image, settings })
          worker?.terminate()
        }
        worker.onerror = () =>
          fail('Could not process this image. Try another preset or a smaller image.')
        worker.postMessage({ image, settings })
      } catch {
        fail('Image processing is unavailable. Reload the page and try again.')
      }
    }, 100)
    // Cancel superseded work so a slower old render cannot replace a new one.
    return () => {
      window.clearTimeout(timer)
      worker?.terminate()
    }
  }, [image, settings])
  const error = failure?.source === image && failure.settings === settings ? failure.message : null
  const current = result?.source === image ? result : null
  return {
    result: current,
    busy: Boolean(image && !error && current?.settings !== settings),
    error,
  }
}
