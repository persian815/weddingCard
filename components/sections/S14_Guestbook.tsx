'use client'
import { useState, useEffect } from 'react'

type Entry = { id: string; name: string; message: string; created_at: string }

function EntryItem({
  entry,
  onDeleted,
}: {
  entry: Entry
  onDeleted: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [showInput, setShowInput] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState('')

  const handleDeleteClick = () => {
    setShowInput(true)
    setError('')
    setDeletePassword('')
  }

  const handleDeleteConfirm = async () => {
    if (!deletePassword) {
      setError('비밀번호를 입력해주세요')
      return
    }
    setDeleting(true)
    setError('')
    try {
      const res = await fetch('/api/guestbook', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, password: deletePassword }),
      })
      const data = await res.json()
      if (res.ok) {
        onDeleted(entry.id)
      } else {
        setError(data.error ?? '삭제할 수 없습니다')
      }
    } catch {
      setError('오류가 발생했습니다')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-1 pb-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium">{entry.name}</p>
        {!showInput && (
          <button
            onClick={handleDeleteClick}
            className="text-[10px] text-neutral-300 hover:text-red-400 transition-colors shrink-0"
          >
            삭제
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-600 leading-relaxed">{entry.message}</p>
      {showInput && (
        <div className="space-y-1 pt-1">
          <div className="flex gap-1">
            <input
              type="password"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDeleteConfirm()}
              placeholder="작성 시 입력한 비밀번호"
              className="flex-1 border border-neutral-200 px-2 py-1 text-xs outline-none"
              autoFocus
            />
            <button
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="text-xs border border-red-300 text-red-400 px-2 py-1 disabled:opacity-50"
            >
              {deleting ? '...' : '확인'}
            </button>
            <button
              onClick={() => { setShowInput(false); setError('') }}
              className="text-xs border border-neutral-200 text-neutral-400 px-2 py-1"
            >
              취소
            </button>
          </div>
          {error && <p className="text-[10px] text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default function S14_Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
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
      body: JSON.stringify({
        name: name.trim(),
        message: message.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
      }),
    })
    const data = await fetch('/api/guestbook').then(r => r.json())
    setEntries(data.entries ?? [])
    setName('')
    setMessage('')
    setPassword('')
    setSubmitting(false)
  }

  const handleDeleted = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id))
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
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호 (선택, 수정·삭제 시 필요)"
          className="w-full border border-neutral-200 px-3 py-2 text-sm outline-none"
          maxLength={50}
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
          <EntryItem key={e.id} entry={e} onDeleted={handleDeleted} />
        ))}
      </div>
    </section>
  )
}
