import { GROOM, BRIDE } from '@/lib/constants'

export interface WeddingConfig {
  invitation: string
  venue: {
    name: string
    address: string
    naverPlaceId: string
    time: string
  }
  people: {
    groomFather: string
    groomMother: string
    groomOrder: string
    brideFather: string
    brideMother: string
    brideOrder: string
  }
  interview: {
    qa: { q: string; groomAnswer: string; brideAnswer: string }[]
  }
  ourStory: {
    date: string
    title: string
    description: string
    image?: string
  }[]
  infoTabs: {
    photobooth: string
    parking: string
    gift: string
  }
  accounts: {
    name: string
    bank: string
    number: string
    kakaoPayUrl?: string
  }[]
  attendanceFormUrl: string
  coverImage: string
  gallery: string[]
}

export const DEFAULT_CONFIG: WeddingConfig = {
  invitation:
    '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며 걸어가고자 합니다.\n저희 두 사람이 사랑으로 만나\n행복한 가정을 이루려 합니다.',
  venue: { name: '', address: '', naverPlaceId: '', time: '' },
  people: {
    groomFather: '',
    groomMother: '',
    groomOrder: '장남',
    brideFather: '',
    brideMother: '',
    brideOrder: '장녀',
  },
  interview: {
    qa: [
      { q: '처음 만났을 때 첫인상은?', groomAnswer: '', brideAnswer: '' },
      { q: '상대방의 어떤 점에 반했나요?', groomAnswer: '', brideAnswer: '' },
      { q: '결혼을 결심한 순간은?', groomAnswer: '', brideAnswer: '' },
    ],
  },
  ourStory: [],
  infoTabs: { photobooth: '', parking: '', gift: '' },
  accounts: [
    { name: GROOM, bank: '', number: '', kakaoPayUrl: '' },
    { name: BRIDE, bank: '', number: '', kakaoPayUrl: '' },
    { name: `${GROOM} 부`, bank: '', number: '' },
    { name: `${BRIDE} 부`, bank: '', number: '' },
  ],
  attendanceFormUrl: '',
  coverImage: '',
  gallery: [],
}

export function mergeConfig(saved: Partial<WeddingConfig>): WeddingConfig {
  return {
    ...DEFAULT_CONFIG,
    ...saved,
    venue: { ...DEFAULT_CONFIG.venue, ...(saved.venue ?? {}) },
    people: { ...DEFAULT_CONFIG.people, ...(saved.people ?? {}) },
    interview: { qa: saved.interview?.qa ?? DEFAULT_CONFIG.interview.qa },
    infoTabs: { ...DEFAULT_CONFIG.infoTabs, ...(saved.infoTabs ?? {}) },
    accounts: saved.accounts ?? DEFAULT_CONFIG.accounts,
    ourStory: saved.ourStory ?? DEFAULT_CONFIG.ourStory,
    coverImage: saved.coverImage ?? DEFAULT_CONFIG.coverImage,
    gallery: saved.gallery ?? DEFAULT_CONFIG.gallery,
  }
}

