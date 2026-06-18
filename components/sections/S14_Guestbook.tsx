'use client'
import { useState, useEffect } from 'react'

type Entry = { id: string; name: string; message: string; created_at: string }

export default function S14_Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/guestbook').then(r => r.json()).then(d => setEntries(d.entries ?? []))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    setSubmitting(true)
    await fetch('/api/guestbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), message: message.trim() }),
    })
    const data = await fetch('/api/guestbook').then(r => r.json())
    setEntries(data.entries ?? [])
    setName('')
    setMessage('')
    setSubmitting(false)
  }

  return (
    <section className="py-16 px-8 bg-neutral-50">
      <p className="text-sm tracking-widest text-[var(--gold)] uppercase text-center mb-6">guestbook</p>
      <form onSubmit={submit} className="max-w-sm mx-auto space-y-2 mb-8">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="이름"
          className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none"
          maxLength={20}
        />
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="축하 메시지를 남겨주세요"
          className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none resize-none"
          rows={3}
          maxLength={200}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[var(--gold)] text-white py-2 text-sm tracking-wider disabled:opacity-50"
        >
          {submitting ? '저장 중...' : '남기기'}
        </button>
      </form>
      <div className="max-w-sm mx-auto space-y-4">
        {entries.map(e => (
          <div key={e.id} className="space-y-1">
            <p className="text-xs font-medium">{e.name}</p>
            <p className="text-xs text-neutral-600 leading-relaxed">{e.message}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
