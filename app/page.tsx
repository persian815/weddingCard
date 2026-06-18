import { getWeddingConfig } from '@/lib/wedding-config-server'
import { WeddingConfigProvider } from '@/components/WeddingConfigContext'
import EntryPopup from '@/components/EntryPopup'
import MusicButton from '@/components/MusicButton'
import FloatingActions from '@/components/FloatingActions'
import S01_HeroCover from '@/components/sections/S01_HeroCover'
import S02_Invitation from '@/components/sections/S02_Invitation'
import S03_People from '@/components/sections/S03_People'
import S04_Interview from '@/components/sections/S04_Interview'
import S05_Ceremony from '@/components/sections/S05_Ceremony'
import S06_DDay from '@/components/sections/S06_DDay'
import S07_OurStory from '@/components/sections/S07_OurStory'
import S08_Gallery from '@/components/sections/S08_Gallery'
import S09_GuestSnap from '@/components/sections/S09_GuestSnap'
import S10_InfoTabs from '@/components/sections/S10_InfoTabs'
import S11_Location from '@/components/sections/S11_Location'
import S12_Attendance from '@/components/sections/S12_Attendance'
import S13_Gift from '@/components/sections/S13_Gift'
import S14_Guestbook from '@/components/sections/S14_Guestbook'
import S15_Together from '@/components/sections/S15_Together'
import S16_Ending from '@/components/sections/S16_Ending'

export default async function Home() {
  const config = await getWeddingConfig()
  return (
    <WeddingConfigProvider config={config}>
      <main className="max-w-md mx-auto">
        <EntryPopup />
        <MusicButton />
        <FloatingActions />
        <S01_HeroCover />
        <S02_Invitation />
        <S03_People />
        <S04_Interview />
        <S05_Ceremony />
        <S06_DDay />
        <S07_OurStory />
        <S08_Gallery />
        <S09_GuestSnap />
        <S10_InfoTabs />
        <S11_Location />
        <S12_Attendance />
        <S13_Gift />
        <S14_Guestbook />
        <S15_Together />
        <S16_Ending />
      </main>
    </WeddingConfigProvider>
  )
}
