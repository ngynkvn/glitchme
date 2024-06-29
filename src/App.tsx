import { useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import './App.css'
import { getContrastMap, getSpans, sortSpansInImage } from './util'

function App() {
  const [lowThreshold, setLowThreshold] = useState(0.4)
  const [highThreshold, setHighThreshold] = useState(0.8)
  const [fileDragged, setFileDragged] = useState(false)
  const [imgData, setImgData] = useState<ImageData | null>(null)
  const imgRef = useRef<HTMLCanvasElement | null>(null)
  const ctx = useMemo(() => imgRef.current?.getContext('2d', { willReadFrequently: true }), [imgRef.current])

  const showContrast = () => {
    if (!ctx || !imgData) { return }

    const contrastMap = getContrastMap(imgData, highThreshold, lowThreshold)
    ctx?.putImageData(contrastMap, 0, 0)
  }

  const handleLowThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLowThreshold(Number(e.target.value))
    showContrast()
  }


  const handleHighThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHighThreshold(Number(e.target.value))
    showContrast()
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
        </div>
        <button onClick={handleGlitch}>Glitch me</button>
        <div>
          <label>Low threshold</label>
          <input type="range" min="0" max="1" step="0.01" value={lowThreshold} onChange={handleLowThresholdChange} id="contrast-low" />
          {lowThreshold.toFixed(2)}
          <br />
          <label>High threshold</label>
          <input type="range" min="0" max="1" step="0.01" value={highThreshold} onChange={handleHighThresholdChange} id="contrast-high" />
          {highThreshold.toFixed(2)}
        </div>
      </div>
    </>
  )
}

export default App
