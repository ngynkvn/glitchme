import { useState, type DragEvent } from 'react'

export function useFileDrop(onFile: (file: File) => void) {
  const [dragging, setDragging] = useState(false)
  return {
    dragging,
    dropProps: {
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (!event.dataTransfer.types.includes('Files')) return
        event.preventDefault()
        setDragging(true)
      },
      onDragLeave: (event: DragEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
      },
      onDrop: (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragging(false)
        const file = event.dataTransfer.files[0]
        if (file) onFile(file)
      },
    },
  }
}
