export const WEDDING_DATE = process.env.NEXT_PUBLIC_WEDDING_DATE ?? '2026-09-19'
export const FIRST_MET_DATE = process.env.NEXT_PUBLIC_FIRST_MET_DATE ?? '2022-12-24'
export const ATTENDANCE_FORM_URL = process.env.NEXT_PUBLIC_ATTENDANCE_FORM_URL ?? ''

// TODO: 실제 이름 입력
export const GROOM = '성룡'
export const BRIDE = '주영'

// TODO: 예식장 정보 입력
export const VENUE_NAME = ''
export const VENUE_ADDRESS = ''
export const VENUE_NAVER_PLACE_ID = '' // 네이버 지도 장소 ID

// TODO: 계좌 정보 입력
export const ACCOUNTS = [
  { name: GROOM, bank: '', number: '', kakaoPayUrl: '' },
  { name: BRIDE, bank: '', number: '', kakaoPayUrl: '' },
  { name: `${GROOM} 부`, bank: '', number: '' },
  { name: `${BRIDE} 부`, bank: '', number: '' },
]

// TODO: 우리 이야기 타임라인 입력
export const OUR_STORY: { date: string; title: string; description: string; image?: string }[] = [
  // { date: '2022.12.24', title: '첫 만남', description: '...' },
]

// TODO: 추가 정보 (포토부스·주차·답례품)
export const INFO_TABS = {
  photobooth: '',
  parking: '',
  gift: '',
}
