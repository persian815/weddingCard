'use client'
import { GROOM, BRIDE } from '@/lib/constants'
import { useWeddingConfig } from '@/components/WeddingConfigContext'
import { useScrollVisible } from '@/hooks/useScrollVisible'

export default function S03_People() {
  const { people } = useWeddingConfig()
  const { ref } = useScrollVisible<HTMLElement>()

  const groomParent = people.groomFather && people.groomMother
    ? `${people.groomFather} · ${people.groomMother}의 ${people.groomOrder}`
    : `○○○의 ${people.groomOrder}`
  const brideParent = people.brideFather && people.brideMother
    ? `${people.brideFather} · ${people.brideMother}의 ${people.brideOrder}`
    : `○○○의 ${people.brideOrder}`

  return (
    <section ref={ref} className="py-16 px-8 scroll-fade">
      <div className="max-w-sm mx-auto grid grid-cols-2 gap-8 text-center">
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">{groomParent}</p>
          <p className="text-lg font-medium">{GROOM}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">{brideParent}</p>
          <p className="text-lg font-medium">{BRIDE}</p>
        </div>
      </div>
    </section>
  )
}
