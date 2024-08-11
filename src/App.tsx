import React, { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import './App.css'
import { getContrastMap, getSpans, sortSpansInImage } from './util'
import { kuwahara } from './filter/kuwahara'

function App() {
  const [lowThreshold, setLowThreshold] = useState(0.4)
  const [highThreshold, setHighThreshold] = useState(0.8)
  const [fileDragged, setFileDragged] = useState(false)
  const [loadedImage, setImgData] = useState<ImageData | null>(null)
  const [kuwaharaEnabled, setKuwaharaEnabled] = useState(false)
  const imgRef = useRef<HTMLCanvasElement | null>(null)
  const ctx = useMemo(() => imgRef.current?.getContext('2d', { willReadFrequently: true }), [imgRef.current])

  let imgData = useMemo(() => {
    if (kuwaharaEnabled && loadedImage) {
      return kuwahara(loadedImage)
    }
    return loadedImage
  }, [loadedImage, kuwaharaEnabled])


  const handleKuwaharaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKuwaharaEnabled(e.target.checked)
    if (!e.target.checked || !loadedImage) {
      return
    }
    const imgData = kuwahara(loadedImage)
    ctx?.putImageData(imgData, 0, 0)
  }

  const handleChange = (setValue: (value: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value))
    showContrast()
  }
  const handleScroll = (setValue: React.Dispatch<React.SetStateAction<number>>) => (e: WheelEvent) => {
    setValue((prev) => prev + (e.deltaY > 0 ? 0.01 : -0.01))
    showContrast()
  }

  const showContrast = () => {
    if (!ctx || !imgData) { return }

    const contrastMap = getContrastMap(imgData, highThreshold, lowThreshold)
    ctx?.putImageData(contrastMap, 0, 0)
  }


  const handleGlitch = () => {
    if (!ctx || !imgData) { return }

    const contrastMap = getContrastMap(imgData, highThreshold, lowThreshold)
    const spans = getSpans(contrastMap)
    const glitched = sortSpansInImage(imgData, spans)
    ctx?.putImageData(glitched, 0, 0)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setFileDragged(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setFileDragged(false)
  }


  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer?.files

    if (!files || files.length === 0) {
      return
    }

    const file = files[0]

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = function (e) {
        const image = new Image()
        image.src = e.target?.result as string
        image.onload = function () {
          const canvas = imgRef.current
          if (!canvas) {
            return
          }
          canvas.width = image.width
          canvas.height = image.height
          ctx?.drawImage(image, 0, 0)
          setImgData(ctx?.getImageData(0, 0, canvas.width, canvas.height) ?? null)
        }
      }
      reader.readAsDataURL(file)
    }
    setFileDragged(false)
  }


  return (
    <>
      <div>
        <div
          className={clsx("image-container", fileDragged ? "highlight" : "")}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <canvas ref={imgRef} id="image"></canvas>
          {!loadedImage && <div>Drop an image here</div>}
        </div>
        <button className="glitch-button" onClick={handleGlitch}>Glitch me</button>
        <div>
          <div>
            <label>Low threshold</label>
            <ScrollableInput title="Low threshold" type="range" min="0" max="1" step="0.01" placeholder='0.4' value={lowThreshold} onWheel={handleScroll(setLowThreshold)} onChange={handleChange(setLowThreshold)} id="contrast-low" />
            {lowThreshold.toFixed(2)}
          </div>
          <div>
            <label>High threshold</label>
            <ScrollableInput title="High threshold" type="range" min="0" max="1" step="0.01" placeholder='0.8' value={highThreshold} onWheel={handleScroll(setHighThreshold)} onChange={handleChange(setHighThreshold)} id="contrast-high" />
            {highThreshold.toFixed(2)}
          </div>
          <div>
            <label>Kuwahara</label>
            <input type="checkbox" checked={kuwaharaEnabled} onChange={handleKuwaharaChange} />
          </div>
        </div>
      </div>
    </>
  )
}


type ScrollableInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onWheel'> & {
  onWheel: (_: WheelEvent) => void
}
function ScrollableInput({ onWheel, ...props }: ScrollableInputProps) {
  const ref = useRef<HTMLInputElement>(null)
  const handleScroll = (e: WheelEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onWheel(e)
  }
  useEffect(() => {
    if (!ref.current) { return }
    const listener = handleScroll;
    ref.current.addEventListener('wheel', listener)
    return () => {
      ref.current?.removeEventListener('wheel', listener)
    }
  }, [ref.current, onWheel])
  return <input {...props} ref={ref} />
}

export default App
