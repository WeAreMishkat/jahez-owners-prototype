import { useLayoutEffect, useRef, useState, type ComponentType } from 'react'
import { useDemo, type Screen } from './store'
import {
  AlreadyLinkedScreen, AuthorizedScreen, EmailScreen, LeadDoneScreen, LeadScreen, ManualDoneScreen,
  ManualFormScreen, NationalIdScreen, NoMatchScreen, SituationScreen,
} from './screens/Entry'
import { NafathFailedScreen, NafathScreen } from './screens/Nafath'
import { OtpScreen } from './screens/Otp'
import { HomeScreen, WelcomeScreen } from './screens/Home'

const SCREENS: Record<Screen, ComponentType> = {
  email: EmailScreen,
  situation: SituationScreen,
  lead: LeadScreen,
  leadDone: LeadDoneScreen,
  nationalId: NationalIdScreen,
  noMatch: NoMatchScreen,
  authorized: AuthorizedScreen,
  alreadyLinked: AlreadyLinkedScreen,
  manualForm: ManualFormScreen,
  manualDone: ManualDoneScreen,
  nafath: NafathScreen,
  nafathFailed: NafathFailedScreen,
  otp: OtpScreen,
  welcome: WelcomeScreen,
  home: HomeScreen,
}

// iPhone 15 logical size
const W = 393
const H = 852
const BEZEL = 10

export function Phone() {
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const fit = () => {
      const s = Math.min(el.clientHeight / (H + BEZEL * 2), el.clientWidth / (W + BEZEL * 2))
      setScale(Math.max(0.45, Math.min(1.3, s)))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const screen = useDemo(s => s.screen)
  const dir = useDemo(s => s.dir)
  const gen = useDemo(s => s.gen)
  const Current = SCREENS[screen]

  return (
    <div ref={wrap} className="flex h-full w-full items-center justify-center">
      <div style={{ width: (W + BEZEL * 2) * scale, height: (H + BEZEL * 2) * scale }} className="relative shrink-0">
        <div
          style={{ width: W + BEZEL * 2, height: H + BEZEL * 2, transform: `scale(${scale})`, padding: BEZEL }}
          className="absolute left-0 top-0 origin-top-left rounded-[62px] bg-[#0d0d0f] shadow-[0_40px_80px_-30px_rgba(20,20,30,.45),0_0_0_1.5px_#2a2a2e_inset]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[52px] bg-white" data-testid="phone">
            <StatusBar />
            <div className="absolute inset-x-0 bottom-[30px] top-[54px] overflow-hidden">
              <div key={`${gen}-${screen}`} className={`h-full ${dir === 'back' ? 'screen-back' : 'screen-fwd'}`}>
                <Current />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex h-[30px] items-end justify-center bg-white pb-2">
              <div className="h-[5px] w-[134px] rounded-full bg-[#111]" />
            </div>
            <Toast />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-[54px] items-center justify-between bg-white px-[34px] pt-1.5">
      <span className="w-[54px] text-center text-[16px] font-semibold tracking-[-0.01em]">9:41</span>
      <div className="absolute left-1/2 top-[11px] h-[35px] w-[122px] -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-[6px]">
        <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden><path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.1-1.2A10.2 10.2 0 0 0 8 .8 10.2 10.2 0 0 0 .9 3.6L2 4.8a8.6 8.6 0 0 1 6-2.4Zm0 3.3c1.4 0 2.7.5 3.7 1.4l1.1-1.2A7.1 7.1 0 0 0 8 4.1c-1.8 0-3.5.7-4.8 1.8l1.1 1.2c1-.9 2.3-1.4 3.7-1.4Zm0 3.3c-.6 0-1.1.2-1.5.6L8 11.2l1.5-1.6c-.4-.4-.9-.6-1.5-.6Z" /></svg>
        <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity=".35" /><rect x="2" y="2" width="20" height="9" rx="2.5" /><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity=".4" /></svg>
      </div>
    </div>
  )
}

function Toast() {
  const toast = useDemo(s => s.toast)
  if (!toast) return null
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[64px] z-40 flex justify-center" key={toast.id}>
      <div className="fade-up rounded-full bg-[#1b1b1f]/92 px-4 py-2.5 text-[13px] font-medium text-white shadow-lg">{toast.text}</div>
    </div>
  )
}
