import type { LoadedImage } from '../image'
import { Icon } from './Icon'

interface Props {
  image: LoadedImage | null
  loading: boolean
  canExport: boolean
  exporting: boolean
  onUpload: () => void
  onExport: () => void
}

export function ImageToolbar({ image, loading, canExport, exporting, onUpload, onExport }: Props) {
  const dimensions = image
    ? `${image.pixels.width} × ${image.pixels.height} px`
    : 'PNG, JPEG, WebP, AVIF · up to 25 MB'
  const suffix = image
    ? image.resized
      ? ' · resized for smooth editing'
      : ' · ready to experiment'
    : ''
  return (
    <div className="editor-bar">
      <div className="file-info">
        <Icon name="image" />
        <div>
          <strong>{loading ? 'Opening image…' : (image?.name ?? 'No image loaded')}</strong>
          <span>
            {dimensions}
            {suffix}
          </span>
        </div>
      </div>
      <div className="file-actions">
        <button className="upload-button" onClick={onUpload}>
          <Icon name="upload" /> Open image
        </button>
        <button className="export-button" disabled={!canExport || exporting} onClick={onExport}>
          <Icon name="download" />
          {exporting ? 'Exporting…' : 'Export PNG'}
        </button>
      </div>
    </div>
  )
}
