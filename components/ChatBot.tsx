'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: '안녕하세요! 결혼식 관련 궁금한 점을 물어보세요 😊',
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, slug: 'weddingcard' }),
      })
      const { answer } = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-4 z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-xl"
        style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
        aria-label="AI 도우미"
      >
        💬
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white rounded-t-2xl flex flex-col"
            style={{ height: '70vh' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <span className="font-semibold text-neutral-800">AI 도우미</span>
              <button onClick={() => setOpen(false)} className="text-neutral-400 text-lg leading-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'text-white rounded-br-sm'
                        : 'bg-neutral-100 text-neutral-800 rounded-bl-sm'
                    }`}
                    style={msg.role === 'user' ? { backgroundColor: 'var(--gold)' } : {}}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-100 text-neutral-400 px-4 py-2 rounded-2xl rounded-bl-sm text-sm">
                    ···
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="px-4 py-3 border-t border-neutral-100 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.nativeEvent.isComposing && send()}
                placeholder="궁금한 점을 입력하세요"
                className="flex-1 border border-neutral-200 rounded-full px-4 py-2 text-sm outline-none"
                style={{ '--tw-ring-color': 'var(--gold)' } as React.CSSProperties}
                disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full text-white flex items-center justify-center disabled:opacity-40 text-base"
                style={{ backgroundColor: 'var(--gold)' }}
              >
                ↑
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
