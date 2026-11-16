import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { api, errorMessage } from '../../lib/api'
import { SmartImage } from '../ui/SmartImage'

type ImageUploaderProps = {
  value: string
  onChange: (url: string) => void
  label?: string
}

const MAX_MB = 5

export function ImageUploader({ value, onChange, label = 'Imagen' }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setError('')

    if (!file.type.startsWith('image/')) {
      setError('Selecciona un archivo de imagen (JPG, PNG, WEBP o GIF).')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen no puede superar ${MAX_MB} MB.`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const data = await api<{ url: string }>('/api/admin/uploads', { method: 'POST', body: formData })
      onChange(data.url)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-line bg-sand/40">
          <SmartImage
            src={value || null}
            alt="Vista previa"
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          {uploading ? (
            <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-cream">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/70 px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-gold hover:text-ink disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              {uploading ? 'Subiendo…' : 'Subir imagen'}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white/70 px-3 py-2 text-xs font-semibold text-ink/50 transition hover:border-rose-300 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Quitar
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <input
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="field py-2 text-xs"
            placeholder="…o pega una URL https://"
          />
          <p className="text-[0.66rem] text-ink/35">JPG, PNG, WEBP o GIF · máximo {MAX_MB} MB.</p>
          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
