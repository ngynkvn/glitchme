import { useEffect, useRef } from 'react'

interface Props {
  label: string
  id: string
  value: number
  min: number
  max: number
  step: number
  display: string
  onChange: (value: number) => void
}

export function Slider({ label, id, value, min, max, step, display, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const input = ref.current
    if (!input) return
    const wheel = (event: WheelEvent) => {
      // Scroll the page normally unless the slider has keyboard/click focus.
      if (document.activeElement !== input || event.deltaY === 0) return
      event.preventDefault()
      const next = value + (event.deltaY < 0 ? step : -step)
      onChange(Math.max(min, Math.min(max, Number(next.toFixed(3)))))
    }
    input.addEventListener('wheel', wheel, { passive: false })
    return () => input.removeEventListener('wheel', wheel)
  }, [value, min, max, step, onChange])
  return (
    <div className="slider-control">
      <div className="control-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{display}</output>
      </div>
      <input
        ref={ref}
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
