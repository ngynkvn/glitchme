import clsx from 'clsx'
import { PRESETS, type Settings } from '../settings'
import { Icon } from './Icon'
import { Slider } from './Slider'

interface Props {
  settings: Settings
  onChange: (settings: Settings) => void
  onReset: () => void
  onRemix: () => void
}

export function Controls({ settings, onChange, onReset, onRemix }: Props) {
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value })
  const active = PRESETS.find((preset) =>
    Object.entries(preset.settings).every(
      ([key, value]) => settings[key as keyof Settings] === value,
    ),
  )?.name
  return (
    <aside className="controls" aria-label="Effect controls">
      <section className="presets-section">
        <div className="section-heading">
          <h2>
            <span>01</span> Start somewhere
          </h2>
          <span className="tiny-tag">PRESETS</span>
        </div>
        <div className="preset-grid">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              className={clsx('preset', { active: active === preset.name })}
              aria-pressed={active === preset.name}
              onClick={() => onChange(preset.settings)}
              title={preset.description}
            >
              <span className={`preset-art ${preset.color}`} aria-hidden="true" />
              <span>{preset.name}</span>
              {active === preset.name && <Icon name="check" size={12} />}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>
            <span>02</span> Make it yours
          </h2>
          <button className="text-button" onClick={onReset}>
            <Icon name="reset" size={13} /> Reset
          </button>
        </div>
        <div className="control-label">
          <span id="direction-label">Direction</span>
        </div>
        <div className="segmented" role="group" aria-labelledby="direction-label">
          <button
            aria-pressed={settings.direction === 'horizontal'}
            onClick={() => update('direction', 'horizontal')}
          >
            <span aria-hidden="true">↔</span> Horizontal
          </button>
          <button
            aria-pressed={settings.direction === 'vertical'}
            onClick={() => update('direction', 'vertical')}
          >
            <span aria-hidden="true">↕</span> Vertical
          </button>
        </div>
        <div className="select-row">
          <label htmlFor="sort-by">Sort pixels by</label>
          <select
            id="sort-by"
            value={settings.sortBy}
            onChange={(event) => update('sortBy', event.target.value as Settings['sortBy'])}
          >
            <option value="brightness">Brightness</option>
            <option value="hue">Hue</option>
            <option value="saturation">Saturation</option>
          </select>
        </div>
        <label className="check-row">
          <span>Reverse sort order</span>
          <input
            type="checkbox"
            checked={settings.reverse}
            onChange={(event) => update('reverse', event.target.checked)}
          />
        </label>
        <div className="threshold-heading">
          Brightness window <span>0 — 100%</span>
        </div>
        <p className="help-text">Only pixels inside this range get sorted.</p>
        <Slider
          id="low"
          label="Low threshold"
          value={settings.low}
          min={0}
          max={settings.high}
          step={0.01}
          display={`${Math.round(settings.low * 100)}%`}
          onChange={(value) => update('low', value)}
        />
        <Slider
          id="high"
          label="High threshold"
          value={settings.high}
          min={settings.low}
          max={1}
          step={0.01}
          display={`${Math.round(settings.high * 100)}%`}
          onChange={(value) => update('high', value)}
        />
        <Slider
          id="span"
          label="Streak length"
          value={settings.span}
          min={8}
          max={640}
          step={8}
          display={`${settings.span} px`}
          onChange={(value) => update('span', value)}
        />
        <Slider
          id="strength"
          label="Sort intensity"
          value={settings.strength}
          min={0}
          max={1}
          step={0.01}
          display={`${Math.round(settings.strength * 100)}%`}
          onChange={(value) => update('strength', value)}
        />
        <Slider
          id="shift"
          label="RGB split"
          value={settings.shift}
          min={0}
          max={24}
          step={1}
          display={`${settings.shift} px`}
          onChange={(value) => update('shift', value)}
        />
        <label className="check-row smooth-row">
          <span>
            Kuwahara smoothing<small>A soft, painterly finish</small>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={settings.smooth}
            onChange={(event) => update('smooth', event.target.checked)}
          />
        </label>
      </section>
      <button className="remix-button" onClick={onRemix}>
        <Icon name="shuffle" /> Surprise me <span>↗</span>
      </button>
      <p className="controls-note">Happy accidents encouraged.</p>
    </aside>
  )
}
