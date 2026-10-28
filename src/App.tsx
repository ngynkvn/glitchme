import { useRef, useState } from 'react'
import './App.css'
import { Header, Intro } from './components/Brand'
import { Controls } from './components/Controls'
import { Icon } from './components/Icon'
import { ImageToolbar } from './components/ImageToolbar'
import { useFileDrop } from './hooks/useFileDrop'
import { Preview } from './components/Preview'
import { useImage } from './hooks/useImage'
import { useProcessor } from './hooks/useProcessor'
import { downloadImage } from './image'
import { DEFAULT_SETTINGS, remixSettings } from './settings'

function App() {
  const { image, loading, error: loadError, load } = useImage()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const input = useRef<HTMLInputElement>(null)
  const { result, busy, error: processingError } = useProcessor(image?.pixels ?? null, settings)
  const error = loadError ?? processingError ?? exportError
  const upload = () => input.current?.click()
  const openFile = (file: File) => {
    setNotice('')
    setExportError(null)
    void load(file)
  }
  const tryDemo = () => {
    setNotice('')
    setExportError(null)
    void load()
  }
  const { dragging, dropProps } = useFileDrop(openFile)
  const exportPng = async () => {
    if (!result || !image || busy || loading) return
    setExporting(true)
    setExportError(null)
    try {
      await downloadImage(result.image, image.name)
      setNotice('PNG exported. Make another happy accident?')
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : 'Could not export this image.')
    } finally {
      setExporting(false)
    }
  }
  return (
    <div className="app" {...dropProps}>
      <a className="skip-link" href="#editor">
        Skip to editor
      </a>
      <Header />
      <main id="editor">
        <Intro />
        <ImageToolbar
          image={image}
          loading={loading}
          canExport={Boolean(result && !busy && !loading && !processingError)}
          exporting={exporting}
          onUpload={upload}
          onExport={() => void exportPng()}
        />
        <input
          ref={input}
          className="visually-hidden"
          type="file"
          accept="image/*"
          aria-label="Choose image"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) openFile(file)
            event.target.value = ''
          }}
        />
        {error && (
          <div className="error-message" role="alert">
            {error} <button onClick={tryDemo}>Try the demo</button>
          </div>
        )}
        <div className="editor-layout">
          <Controls
            settings={settings}
            onChange={setSettings}
            onReset={() => setSettings(DEFAULT_SETTINGS)}
            onRemix={() => setSettings(remixSettings())}
          />
          <div className="workspace">
            <Preview
              original={image?.pixels ?? null}
              result={result?.image}
              mask={result?.mask}
              busy={busy || loading}
              dragging={dragging}
              onUpload={upload}
            />
            <div className="workspace-bottom">
              <p>
                <span className="shortcut">⌘ / Ctrl + V</span> to paste an image
              </p>
              <button className="text-button" onClick={tryDemo}>
                Try the demo <Icon name="arrow" size={14} />
              </button>
            </div>
            <details className="how-it-works">
              <summary>
                A little method to the madness <span>+</span>
              </summary>
              <p>
                Pixel sorting rearranges streaks of pixels by brightness or color. Pick a preset,
                then move the thresholds to choose which pixels get sorted. Use the selection mask
                to see the affected areas, compare with your original, and export your favorite
                result. Every edit starts from the original image.
              </p>
              <p>
                Images stay in your browser. Large images are resized to a maximum of 1600 px on the
                longest edge; PNG exports use the displayed dimensions. Animated images use a single
                frame.
              </p>
            </details>
          </div>
        </div>
        <div className="sr-status" role="status" aria-live="polite">
          {busy ? 'Processing image' : notice || (result ? 'Preview ready' : '')}
        </div>
        <footer className="site-footer">
          <span>
            <span className="status-dot" /> 100% LOCAL. 100% YOUR PIXELS.
          </span>
          <span>
            {result && !busy
              ? `${Math.round(result.selected * 100)}% pixels selected`
              : 'Made for experimentation'}{' '}
            <span className="footer-cross">✳</span> BREAK THE PATTERN.
          </span>
        </footer>
      </main>
    </div>
  )
}

export default App
