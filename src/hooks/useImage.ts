import { useCallback, useEffect, useRef, useState } from 'react'
import { decodeImage, readFile, type LoadedImage } from '../image'

export function useImage() {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const request = useRef({ id: 0 })

  const load = useCallback(async (file?: File) => {
    const id = ++request.current.id
    setLoading(true)
    setError(null)
    try {
      const next = await (file
        ? readFile(file)
        : decodeImage(`${import.meta.env.BASE_URL}demo.svg`, 'Alpine daydream.svg'))
      if (id === request.current.id) setImage(next)
    } catch (cause) {
      if (id === request.current.id)
        setError(cause instanceof Error ? cause.message : 'Could not open this image.')
    } finally {
      if (id === request.current.id) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const lifecycle = request.current
    void load()
    return () => {
      lifecycle.id++
    }
  }, [load])

  useEffect(() => {
    const paste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.files ?? []).find((file) =>
        file.type.startsWith('image/'),
      )
      if (file) {
        event.preventDefault()
        void load(file)
      }
    }
    window.addEventListener('paste', paste)
    return () => window.removeEventListener('paste', paste)
  }, [load])

  return { image, loading, error, load }
}
