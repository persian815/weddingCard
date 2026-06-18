'use client'
import { useEffect, useRef, useState } from 'react'
import { WEDDING_DATE } from '@/lib/constants'

type SnapFile = { name: string; created_at: string }

export default function GuestSnapPage() {
  const isActive = new Date() >= new Date(WEDDING_DATE)
  const [files, setFiles] = useState<SnapFile[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/guest-snap').then(r => r.json()).then(d => setFiles(d.files ?? []))
  }, [])

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    await fetch('/api/guest-snap', { method: 'POST', body: form })
    const data = await fetch('/api/guest-snap').then(r => r.json())
    setFiles(data.files ?? [])
    setUploading(false)
  }

  return (
    <main className="min-h-screen px-6 py-12 max-w-md mx-auto">
      <h1 className="text-center text-sm tracking-widest text-[var(--gold)] uppercase mb-8">guest snap</h1>
      {!isActive ? (
        <p className="text-center text-sm text-neutral-500">혼례일 당일부터 업로드 가능합니다</p>
      ) : (
        <>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full border border-[var(--gold)] text-[var(--gold)] py-3 text-sm mb-6 disabled:opacity-50"
          >
            {uploading ? '업로드 중...' : '사진 선택'}
          </button>
          <div className="grid grid-cols-3 gap-1">
            {files.map(f => {
              const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/guest-snap/${f.name}`
              return <img key={f.name} src={url} alt="" className="aspect-square object-cover" />
            })}
          </div>
        </>
      )}
    </main>
  )
}
