import { useEffect, useRef, useState, type CSSProperties } from 'react'
import clsx from 'clsx'
import type { PixelImage } from '../util'
import { Icon } from './Icon'

function Canvas({
  image,
  label,
  style,
}: {
  image: PixelImage
  label: string
  style?: CSSProperties
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    canvas.width = image.width
    canvas.height = image.height
    canvas
      .getContext('2d')
      ?.putImageData(
        new ImageData(new Uint8ClampedArray(image.data), image.width, image.height),
        0,
        0,
      )
  }, [image])
  return <canvas ref={ref} style={style} role="img" aria-label={label} />
}

interface Props {
  original: PixelImage | null
  result?: PixelImage
  mask?: PixelImage
  busy: boolean
  dragging: boolean
  onUpload: () => void
}

export function Preview({ original, result, mask, busy, dragging, onUpload }: Props) {
  const [view, setView] = useState('result')
  const [compare, setCompare] = useState(false)
  const [split, setSplit] = useState(50)
  const display = { original, mask, result: result ?? original }[view]
  const labels: Record<string, string> = {
    original: 'Original image',
    mask: 'Selection mask: white pixels will be sorted',
    result: 'Glitched image',
  }
  return (
    <section className="preview" aria-label="Image preview" aria-busy={busy}>
      <div className="preview-toolbar">
        <div className="view-tabs" role="group" aria-label="Preview mode">
          {['result', 'original', 'mask'].map((mode) => (
            <button key={mode} aria-pressed={view === mode} onClick={() => setView(mode)}>
              {mode === 'result' ? 'Glitched' : mode === 'mask' ? 'Selection mask' : 'Original'}
            </button>
          ))}
        </div>
        <button
          aria-label="Compare"
          className={clsx('compare-button', { active: compare })}
          aria-pressed={compare}
          disabled={!result}
          onClick={() => {
            setCompare(!compare)
            setView('result')
          }}
        >
          <Icon name="compare" size={15} />
          <span>Compare</span>
        </button>
      </div>
      <div className={clsx('stage', { dragging })}>
        <span className="stage-label">
          THE CANVAS{' '}
          <span>
            {' '}
            /{' '}
            {view === 'mask'
              ? 'SELECTION'
              : compare && view === 'result'
                ? 'BEFORE + AFTER'
                : view.toUpperCase()}
          </span>
        </span>
        {display ? (
          <div
            className="image-frame"
            style={{ '--ratio': display.width / display.height } as CSSProperties}
          >
            <Canvas image={display} label={labels[view]} />
            {compare && view === 'result' && original && (
              <>
                <Canvas
                  image={original}
                  label="Original comparison"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    clipPath: `inset(0 ${100 - split}% 0 0)`,
                  }}
                />
                <div className="compare-line" style={{ left: `${split}%` }}>
                  <span>↔</span>
                </div>
                <span className="compare-label before">ORIGINAL</span>
                <span className="compare-label after">GLITCHED</span>
                <input
                  className="compare-slider"
                  type="range"
                  aria-label="Before / after comparison"
                  min={0}
                  max={100}
                  value={split}
                  onChange={(event) => setSplit(Number(event.target.value))}
                />
              </>
            )}
          </div>
        ) : (
          <button className="empty-state" onClick={onUpload}>
            <Icon name="image" size={40} />
            <strong>Your next happy accident starts here.</strong>
            <span>Choose an image or drop it onto the canvas.</span>
          </button>
        )}
        {busy && (
          <span className="processing">
            <span className="status-dot" /> Rendering your pixels…
          </span>
        )}
        {dragging && (
          <div className="drop-overlay">
            <Icon name="upload" size={34} />
            <strong>Drop it like it’s art.</strong>
            <span>Let’s give those pixels a new direction.</span>
          </div>
        )}
        <span className="stage-corner" aria-hidden="true">
          +
        </span>
      </div>
      <div className="preview-caption">
        <span>
          <span className={clsx('status-dot', { working: busy })} />
          {busy ? 'Updating preview' : 'Live preview'}
        </span>
        <span>
          {view === 'mask'
            ? 'White = selected · Black = untouched'
            : 'Drop an image anywhere to replace'}
        </span>
      </div>
    </section>
  )
}
