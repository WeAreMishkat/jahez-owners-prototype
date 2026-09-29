import { create } from 'zustand'
import {
  BRANDS, INITIAL_ACCOUNTS, NAFATH_MAX_ATTEMPTS, NAFATH_SECONDS, OTP_MAX_RESENDS, OTP_RESEND_SECONDS,
  OTP_SUCCESS, OWNER_RECORDS, type Account, type Brand, type OwnerRecord,
} from './data'
import { makeReference, normalizeEmail, plural, randomChallenge } from './lib'

export type Screen =
  | 'email' | 'situation' | 'lead' | 'leadDone' | 'nationalId' | 'noMatch' | 'authorized'
  | 'alreadyLinked' | 'manualForm' | 'manualDone' | 'nafath' | 'nafathFailed' | 'otp' | 'welcome' | 'home'

export type Tone = 'neutral' | 'success' | 'warning' | 'error' | 'pending' | 'info'
export interface DemoEvent { id: number; at: number; title: string; detail?: string; tone: Tone }

export type ManualContext = 'cr_owner' | 'authorized' | 'linked' | 'nafath'
export type NafathStatus = 'idle' | 'pending' | 'approved' | 'rejected' | 'expired'

interface FlowState {
  screen: Screen
  dir: 'fwd' | 'back'
  busy: boolean
  email: string
  flow: 'login' | 'onboarding' | null
  situation: 'existing' | 'new' | null
  nationalId: string
  idConsent: boolean
  owner: OwnerRecord | null
  linkedEmail: string | null
  crAnswer: 'yes' | 'authorized' | null
  nafath: { attempt: number; challenge: number; deadline: number; status: NafathStatus; eventId: number | null }
  otp: { sentAt: number; resends: number; error: string | null; verifying: boolean; verified: boolean }
  brands: Brand[]
  selectedBrandId: string | null
  lead: { name: string; mobile: string; storeName: string; cr: string; reference: string | null }
  manual: { context: ManualContext; from: Screen; storeName: string; cr: string; mobile: string; reference: string | null }
}

interface State extends FlowState {
  gen: number
  accounts: Record<string, Account>
  events: DemoEvent[]
  toast: { id: number; text: string } | null

  setEmail: (v: string) => void
  setNationalId: (v: string) => void
  setConsent: (v: boolean) => void
  setSituation: (v: 'existing' | 'new') => void
  setCrAnswer: (v: 'yes' | 'authorized') => void
  setLead: (patch: Partial<FlowState['lead']>) => void
  setManual: (patch: Partial<FlowState['manual']>) => void
  showToast: (text: string) => void

  back: () => void
  submitEmail: () => void
  confirmSituation: () => void
  submitLead: () => void
  submitNationalId: () => void
  confirmCrAnswer: () => void
  openManual: (context: ManualContext, from: Screen) => void
  submitManual: () => void
  nafathApprove: () => void
  nafathReject: () => void
  nafathRetry: () => void
  verifyOtp: (code: string) => void
  resendOtp: () => void
  clearOtpError: () => void
  enterHome: () => void
  selectBrand: (id: string) => void
  signOut: () => void
  backToLogin: () => void
  reset: () => void
}

const freshFlow = (): FlowState => ({
  screen: 'email',
  dir: 'fwd',
  busy: false,
  email: '',
  flow: null,
  situation: null,
  nationalId: '',
  idConsent: false,
  owner: null,
  linkedEmail: null,
  crAnswer: null,
  nafath: { attempt: 0, challenge: 0, deadline: 0, status: 'idle', eventId: null },
  otp: { sentAt: 0, resends: 0, error: null, verifying: false, verified: false },
  brands: [],
  selectedBrandId: null,
  lead: { name: '', mobile: '', storeName: '', cr: '', reference: null },
  manual: { context: 'cr_owner', from: 'noMatch', storeName: '', cr: '', mobile: '', reference: null },
})

const BACK_TARGET: Partial<Record<Screen, Screen>> = {
  situation: 'email',
  lead: 'situation',
  nationalId: 'situation',
  noMatch: 'nationalId',
  authorized: 'noMatch',
  alreadyLinked: 'nationalId',
}

let eventSeq = 0
let toastSeq = 0

export const useDemo = create<State>()((set, get) => {
  /** Run `fn` after `ms`, unless the demo was reset in the meantime. */
  const later = (ms: number, fn: () => void) => {
    const gen = get().gen
    setTimeout(() => { if (get().gen === gen) fn() }, ms)
  }

  const log = (title: string, detail?: string, tone: Tone = 'neutral') => {
    const id = ++eventSeq
    set(s => ({ events: [...s.events, { id, at: Date.now(), title, detail, tone }] }))
    return id
  }
  const settleEvent = (id: number | null, tone: Tone = 'neutral') => {
    if (id == null) return
    set(s => ({ events: s.events.map(e => (e.id === id ? { ...e, tone } : e)) }))
  }

  const go = (screen: Screen, dir: 'fwd' | 'back' = 'fwd') => set({ screen, dir, busy: false })

  const brandsOf = (owner: OwnerRecord) => owner.brandIds.map(id => BRANDS[id])

  const sendOtp = () => {
    const { email } = get()
    set({ otp: { sentAt: Date.now(), resends: 0, error: null, verifying: false, verified: false } })
    log('Verification code sent', `4-digit code emailed to ${email}.`, 'info')
    go('otp')
  }

  const startNafath = (attempt: number) => {
    const prev = get().nafath.challenge
    const eventId = attempt === 1
      ? log('Identity verification started', `Nafath request sent · waiting for approval (attempt 1 of ${NAFATH_MAX_ATTEMPTS}).`, 'pending')
      : log('Retry started', `New Nafath request sent · waiting for approval (attempt ${attempt} of ${NAFATH_MAX_ATTEMPTS}).`, 'pending')
    set({
      nafath: {
        attempt,
        challenge: randomChallenge(prev),
        deadline: Date.now() + NAFATH_SECONDS * 1000,
        status: 'pending',
        eventId,
      },
    })
    go('nafath')
    later(NAFATH_SECONDS * 1000, () => {
      const n = get().nafath
      if (n.status === 'pending' && n.attempt === attempt) nafathFail('expired')
    })
  }

  const nafathFail = (reason: 'rejected' | 'expired') => {
    const n = get().nafath
    if (n.status !== 'pending') return
    set({ nafath: { ...n, status: reason } })
    settleEvent(n.eventId)
    if (reason === 'rejected') log('Verification rejected', 'The request was declined in Nafath.', 'error')
    else log('Verification expired', `No approval received within ${NAFATH_SECONDS} seconds.`, 'error')
    if (n.attempt < NAFATH_MAX_ATTEMPTS) {
      log('First verification attempt failed', `${plural(NAFATH_MAX_ATTEMPTS - n.attempt, 'attempt')} remaining.`, 'warning')
    } else {
      log('Second verification attempt failed', 'No verification attempts remaining.', 'error')
      log('Manual verification required', 'Automatic verification couldn’t be completed.', 'warning')
    }
    go('nafathFailed')
  }

  return {
    gen: 0,
    accounts: { ...INITIAL_ACCOUNTS },
    events: [],
    toast: null,
    ...freshFlow(),

    setEmail: v => set({ email: v }),
    setNationalId: v => set({ nationalId: v }),
    setConsent: v => set({ idConsent: v }),
    setSituation: v => set({ situation: v }),
    setCrAnswer: v => set({ crAnswer: v }),
    setLead: patch => set(s => ({ lead: { ...s.lead, ...patch } })),
    setManual: patch => set(s => ({ manual: { ...s.manual, ...patch } })),
    showToast: text => {
      const id = ++toastSeq
      set({ toast: { id, text } })
      setTimeout(() => { if (get().toast?.id === id) set({ toast: null }) }, 2200)
    },

    back: () => {
      const { screen, manual, busy } = get()
      if (busy) return
      if (screen === 'otp') return get().backToLogin()
      const target = screen === 'manualForm' ? manual.from : BACK_TARGET[screen]
      if (target) go(target, 'back')
    },

    submitEmail: () => {
      const email = normalizeEmail(get().email)
      set({ email, busy: true })
      later(650, () => {
        const account = get().accounts[email]
        if (account) {
          const owner = OWNER_RECORDS[account.nationalId]
          set({ flow: 'login', owner, nationalId: owner.nationalId })
          log('Email checked', 'Existing Owners account found.', 'success')
          sendOtp()
        } else {
          log('Email checked', 'No Owners account uses this email yet — continuing to onboarding.', 'info')
          go('situation')
        }
      })
    },

    confirmSituation: () => {
      const { situation } = get()
      if (situation === 'existing') {
        log('Existing merchant selected', 'User says their business already operates on Jahez.')
        go('nationalId')
      } else if (situation === 'new') {
        log('New merchant interest', 'User wants to register a new restaurant or store.')
        go('lead')
      }
    },

    submitLead: () => {
      set({ busy: true })
      later(800, () => {
        const reference = makeReference('RL')
        set(s => ({ lead: { ...s.lead, reference } }))
        log('Registration request submitted', `Ref ${reference} · Jahez sales team will contact ${get().lead.name.trim()}.`, 'success')
        go('leadDone')
      })
    },

    submitNationalId: () => {
      const id = get().nationalId
      set({ busy: true, owner: null, linkedEmail: null, crAnswer: null })
      log('National ID received', `ID ending ${id.slice(-4)}.`)
      const checking = log('Checking merchant ownership records', 'Looking for this ID across Jahez merchants.', 'pending')
      later(1100, () => {
        settleEvent(checking)
        const owner = OWNER_RECORDS[id]
        if (!owner) {
          log('No matching merchant record found', 'This ID isn’t listed as an owner or manager of a Jahez merchant.', 'warning')
          go('noMatch')
          return
        }
        set({ owner })
        log(`${owner.role} record found`, `${owner.name} is listed as ${owner.role.toLowerCase()}.`, 'success')
        const linked = Object.values(get().accounts).find(a => a.nationalId === id)
        if (linked) {
          set({ linkedEmail: linked.email })
          log('Account already exists', 'This ID is already linked to an Owners account with another email.', 'warning')
          go('alreadyLinked')
          return
        }
        const n = owner.brandIds.length
        log('Merchant access found', `${plural(n, 'Jahez brand')} ${n === 1 ? 'is' : 'are'} associated with this ${owner.role.toLowerCase()}.`, 'success')
        startNafath(1)
      })
    },

    confirmCrAnswer: () => {
      const { crAnswer } = get()
      if (crAnswer === 'yes') {
        log('Listed in CR (self-declared)', 'User says they are an owner or manager in the CR.')
        get().openManual('cr_owner', 'noMatch')
      } else if (crAnswer === 'authorized') {
        log('Authorized person', 'User isn’t listed in the CR as owner or manager.')
        go('authorized')
      }
    },

    openManual: (context, from) => {
      set(s => ({
        manual: s.manual.context === context
          ? { ...s.manual, from, reference: null }
          : { context, from, storeName: '', cr: '', mobile: '', reference: null },
      }))
      go('manualForm')
    },

    submitManual: () => {
      set({ busy: true })
      later(900, () => {
        const { context } = get().manual
        const reference = makeReference(context === 'linked' ? 'SR' : 'MV')
        set(s => ({ manual: { ...s.manual, reference } }))
        if (context === 'linked') {
          log('Account-access support request submitted', `Ref ${reference} · sent to the Jahez support team.`, 'success')
        } else {
          log('Manual verification request submitted', `Ref ${reference} · sent to the Jahez business team for review.`, 'success')
        }
        go('manualDone')
      })
    },

    nafathApprove: () => {
      const n = get().nafath
      if (n.status !== 'pending') return
      set({ nafath: { ...n, status: 'approved' } })
      settleEvent(n.eventId)
      log('Nafath approved', 'The request was approved in the Nafath app.', 'success')
      log('Identity verified', `${get().owner?.name}’s identity confirmed.`, 'success')
      later(1600, () => {
        set({ flow: 'onboarding' })
        sendOtp()
      })
    },

    nafathReject: () => nafathFail('rejected'),

    nafathRetry: () => {
      const n = get().nafath
      if (n.attempt >= NAFATH_MAX_ATTEMPTS || n.status === 'pending') return
      startNafath(n.attempt + 1)
    },

    verifyOtp: code => {
      if (get().otp.verifying) return
      set(s => ({ otp: { ...s.otp, verifying: true, error: null } }))
      later(700, () => {
        const { owner, flow, email } = get()
        if (code !== OTP_SUCCESS || !owner) {
          set(s => ({ otp: { ...s.otp, verifying: false, error: 'Incorrect code. Please check your email and try again.' } }))
          log('Incorrect code entered', 'The verification code didn’t match.', 'error')
          return
        }
        set(s => ({ otp: { ...s.otp, verifying: false, verified: true } }))
        const brands = brandsOf(owner)
        const names = brands.map(b => b.name).join(', ')
        log('Email verified', 'Verification code accepted.', 'success')
        if (flow === 'login') {
          log('Signed in', `Welcome back, ${owner.firstName}. Access to ${plural(brands.length, 'brand')}.`, 'success')
        } else {
          set(s => ({ accounts: { ...s.accounts, [email]: { email, nationalId: owner.nationalId } } }))
          log('Owners account created', `${email} is now linked to ${owner.name}.`, 'success')
          log('Access granted', `${plural(brands.length, 'brand')}: ${names}.`, 'success')
        }
        set({ brands, selectedBrandId: brands[0].id })
        later(650, () => go(flow === 'login' ? 'home' : 'welcome'))
      })
    },

    resendOtp: () => {
      const { otp, email } = get()
      if (otp.resends >= OTP_MAX_RESENDS || otp.verifying) return
      if (Date.now() < otp.sentAt + OTP_RESEND_SECONDS * 1000) return
      const resends = otp.resends + 1
      set({ otp: { ...otp, resends, sentAt: Date.now(), error: null } })
      log('Verification code resent', `Resend ${resends} of ${OTP_MAX_RESENDS} · sent to ${email}.`, 'info')
      if (resends === OTP_MAX_RESENDS) log('Resend limit reached', 'No further codes can be sent for this sign-in.', 'warning')
    },

    clearOtpError: () => set(s => ({ otp: { ...s.otp, error: null } })),

    enterHome: () => go('home'),

    selectBrand: id => {
      if (id === get().selectedBrandId) return
      set({ selectedBrandId: id })
      log('Brand switched', `Now managing ${BRANDS[id].name}.`, 'info')
    },

    signOut: () => {
      log('Signed out', 'Session ended on this device.')
      get().backToLogin()
    },

    backToLogin: () => {
      set(s => ({ ...freshFlow(), dir: 'back', gen: s.gen + 1 }))
    },

    reset: () => {
      set(s => ({ ...freshFlow(), gen: s.gen + 1, accounts: { ...INITIAL_ACCOUNTS }, events: [], toast: null }))
    },
  }
})

export const selectedBrand = (s: State) => s.brands.find(b => b.id === s.selectedBrandId) ?? null
