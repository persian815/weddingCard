'use client'
import { useState, useEffect, useRef } from 'react'
import { GROOM, BRIDE } from '@/lib/constants'
import { DEFAULT_CONFIG, mergeConfig, type WeddingConfig } from '@/lib/wedding-config'

const inputCls = 'w-full border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[var(--gold)] transition-colors'
const textareaCls = `${inputCls} resize-none`

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div className={`space-y-1 ${half ? 'flex-1' : 'w-full'}`}>
      <label className="text-xs text-neutral-500">{label}</label>
      {children}
    </div>
  )
}

const TABS = [
  { id: 'content', label: '콘텐츠 관리' },
  { id: 'ceremony', label: '예식 정보' },
  { id: 'people', label: '인물·인터뷰' },
  { id: 'info', label: '안내·계좌' },
  { id: 'etc', label: '기타' },
] as const

type TabId = typeof TABS[number]['id']

export default function AdminPage() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('content')

  const coverFileRef = useRef<HTMLInputElement>(null)
  const galleryFileRef = useRef<HTMLInputElement>(null)
  const storyFileRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const stored = sessionStorage.getItem('admin-pw')
    if (stored) { setAuthed(true); loadConfig() }
  }, [])

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  const loadConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/config')
      const data = await res.json()
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setConfig(mergeConfig(data))
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      sessionStorage.setItem('admin-pw', password)
      setAuthed(true)
      loadConfig()
    } else {
      setAuthError('비밀번호가 틀렸습니다')
    }
  }

  const save = async () => {
    const pw = sessionStorage.getItem('admin-pw') ?? ''
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        showToast('저장되었습니다 ✓', true)
      } else {
        const { error } = await res.json()
        showToast(error ?? '저장 실패', false)
      }
    } catch {
      showToast('네트워크 오류', false)
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (file: File, key: string): Promise<string | null> => {
    const pw = sessionStorage.getItem('admin-pw') ?? ''
    setUploading(key)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/images', {
        method: 'POST',
        headers: { 'x-admin-password': pw },
        body: form,
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? '업로드 실패', false); return null }
      return data.url
    } catch {
      showToast('네트워크 오류', false)
      return null
    } finally {
      setUploading(null)
    }
  }

  const deleteImage = async (url: string) => {
    const pw = sessionStorage.getItem('admin-pw') ?? ''
    try {
      await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': pw },
        body: JSON.stringify({ url }),
      })
    } catch {}
  }

  const setVenue = (patch: Partial<WeddingConfig['venue']>) =>
    setConfig(p => ({ ...p, venue: { ...p.venue, ...patch } }))
  const setPeople = (patch: Partial<WeddingConfig['people']>) =>
    setConfig(p => ({ ...p, people: { ...p.people, ...patch } }))
  const setInfoTabs = (patch: Partial<WeddingConfig['infoTabs']>) =>
    setConfig(p => ({ ...p, infoTabs: { ...p.infoTabs, ...patch } }))

  // ── password gate ────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <form onSubmit={login} className="bg-white p-8 w-72 space-y-4 shadow-sm rounded-sm">
          <p className="text-sm text-center font-medium text-neutral-700 tracking-wider">관리자</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            className={inputCls}
          />
          {authError && <p className="text-xs text-red-500">{authError}</p>}
          <button type="submit" className="w-full bg-[var(--gold)] text-white py-2 text-sm tracking-wider">
            입장
          </button>
        </form>
      </div>
    )
  }

  // ── tab content ──────────────────────────────────────────────
  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-40 text-xs text-neutral-400">불러오는 중...</div>

    switch (activeTab) {

      // ── 콘텐츠 관리 ─────────────────────────────────────────
      case 'content': return (
        <div className="space-y-10">
          <Section title="커버 배경 이미지">
            <p className="text-[10px] text-neutral-400">메인 화면 가장 먼저 보이는 전체 배경 사진입니다.</p>
            <div className="space-y-3">
              {config.coverImage ? (
                <div className="relative aspect-video bg-neutral-100">
                  <img src={config.coverImage} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={async () => {
                      await deleteImage(config.coverImage)
                      setConfig(p => ({ ...p, coverImage: '' }))
                    }}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center text-neutral-300 text-xs">
                  이미지 없음
                </div>
              )}
              <button
                onClick={() => coverFileRef.current?.click()}
                disabled={uploading === 'cover'}
                className="w-full border border-[var(--gold)] text-[var(--gold)] py-2 text-xs tracking-wider disabled:opacity-50"
              >
                {uploading === 'cover' ? '업로드 중...' : config.coverImage ? '이미지 교체' : '이미지 등록'}
              </button>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (config.coverImage) await deleteImage(config.coverImage)
                  const url = await uploadImage(file, 'cover')
                  if (url) setConfig(p => ({ ...p, coverImage: url }))
                  e.target.value = ''
                }}
              />
            </div>
          </Section>

          <Section title="갤러리 이미지">
            <p className="text-[10px] text-neutral-400">업로드한 순서대로 갤러리에 표시됩니다. 이미지를 삭제하면 Storage에서도 제거됩니다.</p>
            <div className="grid grid-cols-3 gap-2">
              {config.gallery.map((url, i) => (
                <div key={i} className="relative aspect-square group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={async () => {
                      await deleteImage(url)
                      setConfig(p => ({ ...p, gallery: p.gallery.filter(u => u !== url) }))
                    }}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => galleryFileRef.current?.click()}
                disabled={uploading === 'gallery'}
                className="aspect-square border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center text-neutral-300 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors disabled:opacity-50"
              >
                <span className="text-2xl leading-none">{uploading === 'gallery' ? '…' : '+'}</span>
                <span className="text-[10px] mt-1">{uploading === 'gallery' ? '업로드 중' : '추가'}</span>
              </button>
            </div>
            <input
              ref={galleryFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async e => {
                const files = Array.from(e.target.files ?? [])
                for (const file of files) {
                  const url = await uploadImage(file, 'gallery')
                  if (url) setConfig(p => ({ ...p, gallery: [...p.gallery, url] }))
                }
                e.target.value = ''
              }}
            />
          </Section>

          <Section title="우리 이야기 이미지">
            <p className="text-[10px] text-neutral-400">타임라인 각 항목의 썸네일 이미지입니다. 인물·인터뷰 탭에서 내용을 먼저 추가하세요.</p>
            {config.ourStory.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-4">우리 이야기 항목이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {config.ourStory.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center border border-neutral-100 p-3 rounded-sm">
                    <div className="w-16 h-16 flex-shrink-0 bg-neutral-100 relative overflow-hidden">
                      {item.image
                        ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                        : <span className="flex items-center justify-center h-full text-neutral-300 text-xs">없음</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[var(--gold)]">{item.date || '날짜 없음'}</p>
                      <p className="text-xs font-medium truncate">{item.title || '제목 없음'}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => storyFileRefs.current[i]?.click()}
                        disabled={uploading === `story-${i}`}
                        className="text-[10px] border border-[var(--gold)] text-[var(--gold)] px-2 py-1 whitespace-nowrap disabled:opacity-50"
                      >
                        {uploading === `story-${i}` ? '…' : item.image ? '교체' : '등록'}
                      </button>
                      {item.image && (
                        <button
                          onClick={async () => {
                            await deleteImage(item.image!)
                            const s = [...config.ourStory]
                            s[i] = { ...s[i], image: undefined }
                            setConfig(p => ({ ...p, ourStory: s }))
                          }}
                          className="text-[10px] text-red-400 border border-red-200 px-2 py-1"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <input
                      ref={el => { storyFileRefs.current[i] = el }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (item.image) await deleteImage(item.image)
                        const url = await uploadImage(file, `story-${i}`)
                        if (url) {
                          const s = [...config.ourStory]
                          s[i] = { ...s[i], image: url }
                          setConfig(p => ({ ...p, ourStory: s }))
                        }
                        e.target.value = ''
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )

      // ── 예식 정보 ────────────────────────────────────────────
      case 'ceremony': return (
        <div className="space-y-10">
          <Section title="청첩 문구">
            <Field label="초대 문구">
              <textarea
                value={config.invitation}
                onChange={e => setConfig(p => ({ ...p, invitation: e.target.value }))}
                rows={5}
                className={textareaCls}
              />
            </Field>
          </Section>

          <Section title="예식 정보">
            <Field label="예식장명">
              <input value={config.venue.name} onChange={e => setVenue({ name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="주소">
              <input value={config.venue.address} onChange={e => setVenue({ address: e.target.value })} className={inputCls} />
            </Field>
            <Field label="네이버 지도 장소 ID (선택)">
              <input
                value={config.venue.naverPlaceId}
                onChange={e => setVenue({ naverPlaceId: e.target.value })}
                placeholder="예: 32982104"
                className={inputCls}
              />
              <p className="text-[10px] text-neutral-400 mt-1">
                입력하면 하단에 "네이버 지도" 버튼이 표시됩니다. 지도 화면은 주소 기반 Google Maps로 표시됩니다.
              </p>
            </Field>
            <Field label="예식 시간">
              <input
                value={config.venue.time}
                onChange={e => setVenue({ time: e.target.value })}
                placeholder="예: 낮 12시 30분"
                className={inputCls}
              />
            </Field>
          </Section>
        </div>
      )

      // ── 인물·인터뷰·스토리 ───────────────────────────────────
      case 'people': return (
        <div className="space-y-10">
          <Section title="인물">
            <p className="text-xs font-medium text-[var(--gold)]">신랑측 · {GROOM}</p>
            <div className="flex gap-2">
              <Field label="부(父) 성함" half>
                <input value={config.people.groomFather} onChange={e => setPeople({ groomFather: e.target.value })} className={inputCls} />
              </Field>
              <Field label="모(母) 성함" half>
                <input value={config.people.groomMother} onChange={e => setPeople({ groomMother: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <Field label="자녀 순서">
              <input value={config.people.groomOrder} onChange={e => setPeople({ groomOrder: e.target.value })} placeholder="예: 장남" className={inputCls} />
            </Field>

            <p className="text-xs font-medium text-[var(--gold)] pt-2">신부측 · {BRIDE}</p>
            <div className="flex gap-2">
              <Field label="부(父) 성함" half>
                <input value={config.people.brideFather} onChange={e => setPeople({ brideFather: e.target.value })} className={inputCls} />
              </Field>
              <Field label="모(母) 성함" half>
                <input value={config.people.brideMother} onChange={e => setPeople({ brideMother: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <Field label="자녀 순서">
              <input value={config.people.brideOrder} onChange={e => setPeople({ brideOrder: e.target.value })} placeholder="예: 장녀" className={inputCls} />
            </Field>
          </Section>

          <Section title="웨딩 인터뷰 Q&A">
            <div className="space-y-3">
              {config.interview.qa.map((qa, i) => (
                <div key={i} className="border border-neutral-100 rounded-sm p-3 space-y-2 bg-neutral-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-500">Q{i + 1}</span>
                    <button
                      onClick={() => setConfig(p => ({ ...p, interview: { qa: p.interview.qa.filter((_, idx) => idx !== i) } }))}
                      className="text-[10px] text-red-400 hover:text-red-600"
                    >삭제</button>
                  </div>
                  <Field label="질문">
                    <input
                      value={qa.q}
                      onChange={e => {
                        const newQa = [...config.interview.qa]
                        newQa[i] = { ...newQa[i], q: e.target.value }
                        setConfig(p => ({ ...p, interview: { qa: newQa } }))
                      }}
                      className={inputCls}
                    />
                  </Field>
                  <Field label={`${GROOM} 답변`}>
                    <textarea
                      value={qa.groomAnswer}
                      onChange={e => {
                        const newQa = [...config.interview.qa]
                        newQa[i] = { ...newQa[i], groomAnswer: e.target.value }
                        setConfig(p => ({ ...p, interview: { qa: newQa } }))
                      }}
                      rows={2} className={textareaCls}
                    />
                  </Field>
                  <Field label={`${BRIDE} 답변`}>
                    <textarea
                      value={qa.brideAnswer}
                      onChange={e => {
                        const newQa = [...config.interview.qa]
                        newQa[i] = { ...newQa[i], brideAnswer: e.target.value }
                        setConfig(p => ({ ...p, interview: { qa: newQa } }))
                      }}
                      rows={2} className={textareaCls}
                    />
                  </Field>
                </div>
              ))}
            </div>
            <button
              onClick={() => setConfig(p => ({ ...p, interview: { qa: [...p.interview.qa, { q: '', groomAnswer: '', brideAnswer: '' }] } }))}
              className="text-xs text-[var(--gold)] border border-[var(--gold)] px-3 py-1.5 w-full"
            >+ 질문 추가</button>
          </Section>

          <Section title="우리 이야기 타임라인">
            <div className="space-y-3">
              {config.ourStory.map((item, i) => (
                <div key={i} className="border border-neutral-100 rounded-sm p-3 space-y-2 bg-neutral-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-neutral-500">#{i + 1}</span>
                    <button
                      onClick={() => setConfig(p => ({ ...p, ourStory: p.ourStory.filter((_, idx) => idx !== i) }))}
                      className="text-[10px] text-red-400 hover:text-red-600"
                    >삭제</button>
                  </div>
                  <div className="flex gap-2">
                    <Field label="날짜" half>
                      <input
                        value={item.date}
                        onChange={e => {
                          const s = [...config.ourStory]; s[i] = { ...s[i], date: e.target.value }
                          setConfig(p => ({ ...p, ourStory: s }))
                        }}
                        placeholder="2022.12.24" className={inputCls}
                      />
                    </Field>
                    <Field label="제목" half>
                      <input
                        value={item.title}
                        onChange={e => {
                          const s = [...config.ourStory]; s[i] = { ...s[i], title: e.target.value }
                          setConfig(p => ({ ...p, ourStory: s }))
                        }}
                        placeholder="첫 만남" className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="설명">
                    <textarea
                      value={item.description}
                      onChange={e => {
                        const s = [...config.ourStory]; s[i] = { ...s[i], description: e.target.value }
                        setConfig(p => ({ ...p, ourStory: s }))
                      }}
                      rows={2} className={textareaCls}
                    />
                  </Field>
                </div>
              ))}
            </div>
            <button
              onClick={() => setConfig(p => ({ ...p, ourStory: [...p.ourStory, { date: '', title: '', description: '' }] }))}
              className="text-xs text-[var(--gold)] border border-[var(--gold)] px-3 py-1.5 w-full"
            >+ 항목 추가</button>
          </Section>
        </div>
      )

      // ── 안내·계좌 ────────────────────────────────────────────
      case 'info': return (
        <div className="space-y-10">
          <Section title="안내 정보">
            <Field label="포토부스">
              <textarea value={config.infoTabs.photobooth} onChange={e => setInfoTabs({ photobooth: e.target.value })} rows={3} placeholder="포토부스 위치 및 이용 안내" className={textareaCls} />
            </Field>
            <Field label="주차">
              <textarea value={config.infoTabs.parking} onChange={e => setInfoTabs({ parking: e.target.value })} rows={3} placeholder="주차 안내 및 주차 가능 대수" className={textareaCls} />
            </Field>
            <Field label="답례품">
              <textarea value={config.infoTabs.gift} onChange={e => setInfoTabs({ gift: e.target.value })} rows={3} placeholder="답례품 안내" className={textareaCls} />
            </Field>
          </Section>

          <Section title="계좌 정보">
            {config.accounts.map((acc, i) => (
              <div key={i} className="border border-neutral-100 rounded-sm p-3 space-y-2 bg-neutral-50">
                <p className="text-xs font-medium text-[var(--gold)]">{acc.name}</p>
                <div className="flex gap-2">
                  <Field label="은행" half>
                    <input
                      value={acc.bank}
                      onChange={e => {
                        const a = [...config.accounts]; a[i] = { ...a[i], bank: e.target.value }
                        setConfig(p => ({ ...p, accounts: a }))
                      }}
                      placeholder="카카오뱅크" className={inputCls}
                    />
                  </Field>
                  <Field label="계좌번호" half>
                    <input
                      value={acc.number}
                      onChange={e => {
                        const a = [...config.accounts]; a[i] = { ...a[i], number: e.target.value }
                        setConfig(p => ({ ...p, accounts: a }))
                      }}
                      placeholder="0000-00-0000000" className={inputCls}
                    />
                  </Field>
                </div>
                {i < 2 && (
                  <Field label="카카오페이 송금 링크">
                    <input
                      value={acc.kakaoPayUrl ?? ''}
                      onChange={e => {
                        const a = [...config.accounts]; a[i] = { ...a[i], kakaoPayUrl: e.target.value }
                        setConfig(p => ({ ...p, accounts: a }))
                      }}
                      placeholder="https://qr.kakaopay.com/..." className={inputCls}
                    />
                  </Field>
                )}
              </div>
            ))}
          </Section>
        </div>
      )

      // ── 기타 ─────────────────────────────────────────────────
      case 'etc': return (
        <div className="space-y-10">
          <Section title="기타">
            <Field label="참석여부 구글폼 URL">
              <input
                value={config.attendanceFormUrl}
                onChange={e => setConfig(p => ({ ...p, attendanceFormUrl: e.target.value }))}
                placeholder="https://forms.gle/..."
                className={inputCls}
              />
            </Field>
          </Section>
        </div>
      )
    }
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white">
      {/* header */}
      <div className="sticky top-0 bg-white border-b border-neutral-100 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-medium text-neutral-800">청첩장 설정</h1>
          <a href="/" className="text-xs text-neutral-400 hover:text-neutral-600">청첩장 보기 →</a>
        </div>
        {/* tab bar */}
        <div className="flex overflow-x-auto scrollbar-hide border-t border-neutral-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs tracking-wide transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'text-[var(--gold)] border-b-2 border-[var(--gold)] font-medium'
                  : 'text-neutral-400 border-b-2 border-transparent'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 pb-28">
        {renderContent()}
      </div>

      {/* 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-3 z-10">
        <div className="max-w-lg mx-auto">
          <button
            onClick={save}
            disabled={saving || loading}
            className="w-full bg-[var(--gold)] text-white py-3 text-sm tracking-wider disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 text-white text-xs px-4 py-2 rounded z-50 ${toast.ok ? 'bg-neutral-800' : 'bg-red-500'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}
