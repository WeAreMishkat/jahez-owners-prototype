import type { ReactNode } from 'react'
import { Building2, Check, FileSearch, Info, Store, UserRoundX } from 'lucide-react'
import { useDemo } from '../store'
import {
  crError, digitsOnly, formatMobile, isValidCr, isValidEmail, isValidMobile, isValidNationalId,
  maskEmail, mobileError, nationalIdError, normalizeMobile,
} from '../lib'
import { Button, Checkbox, Field, IconBadge, OptionCard, ScreenLayout, Title } from '../ui'

const APP_ICON = `${import.meta.env.BASE_URL}brand/jahez-app-icon.png`

export function EmailScreen() {
  const { email, setEmail, submitEmail, busy } = useDemo()
  const valid = isValidEmail(email)
  const submit = () => { if (valid && !busy) submitEmail() }
  return (
    <ScreenLayout
      footer={
        <>
          <Button onClick={submit} disabled={!valid} loading={busy}>Continue</Button>
          <p className="px-4 pt-1 text-center text-[12px] leading-relaxed text-ink-3">
            By continuing, you agree to Jahez’s <span className="font-medium text-ink-2">Terms</span> and <span className="font-medium text-ink-2">Privacy Policy</span>.
          </p>
        </>
      }
    >
      <div className="pt-6">
        <img src={APP_ICON} alt="Jahez" className="mb-8 size-[60px] rounded-[18px] shadow-[0_6px_20px_-6px_rgba(96,0,0,.45)]" />
        <Title sub="Enter your email to sign in or get started.">Welcome to Jahez for Owners</Title>
        <Field
          label="Email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={setEmail}
          error={email && !valid ? 'Enter a valid email address' : null}
          autoFocus
          onEnter={submit}
        />
      </div>
    </ScreenLayout>
  )
}

export function SituationScreen() {
  const { email, situation, setSituation, confirmSituation, back } = useDemo()
  return (
    <ScreenLayout
      onBack={back}
      footer={
        <>
          <Button onClick={confirmSituation} disabled={!situation}>Continue</Button>
          <Button variant="ghost" onClick={back}>Use a different email</Button>
        </>
      }
    >
      <Title sub={<>There’s no Jahez for Owners account for <span className="font-semibold text-ink">{email}</span> yet. Which describes you best?</>}>
        Let’s get you set up
      </Title>
      <div role="radiogroup" aria-label="Your situation">
        <OptionCard
          selected={situation === 'existing'}
          onSelect={() => setSituation('existing')}
          icon={<Store className="size-5" />}
          title="I already have a restaurant or store on Jahez"
          description="Get access to a business that’s already on Jahez."
        />
        <OptionCard
          selected={situation === 'new'}
          onSelect={() => setSituation('new')}
          icon={<Building2 className="size-5" />}
          title="I want to register my restaurant or store on Jahez"
          description="Start selling on Jahez as a new partner."
        />
      </div>
    </ScreenLayout>
  )
}

export function LeadScreen() {
  const { lead, setLead, submitLead, back, busy } = useDemo()
  const nameOk = lead.name.trim().length >= 2
  const storeOk = lead.storeName.trim().length >= 2
  const crOk = !lead.cr || isValidCr(lead.cr)
  const valid = nameOk && storeOk && isValidMobile(lead.mobile) && crOk
  return (
    <ScreenLayout
      onBack={back}
      footer={<Button onClick={submitLead} disabled={!valid} loading={busy}>Submit request</Button>}
    >
      <Title sub="Share a few details and our partnerships team will get in touch.">Register your business</Title>
      <Field label="Full name" name="lead-name" value={lead.name} onChange={v => setLead({ name: v })} placeholder="Your name" autoComplete="name"
        error={lead.name && !nameOk ? 'Enter your full name' : null} autoFocus />
      <MobileField value={lead.mobile} onChange={v => setLead({ mobile: v })} name="lead-mobile" />
      <Field label="Restaurant or store name" name="lead-store" value={lead.storeName} onChange={v => setLead({ storeName: v })} placeholder="e.g. Al Nakheel Kitchen"
        error={lead.storeName && !storeOk ? 'Enter your restaurant or store name' : null} />
      <CrField value={lead.cr} onChange={v => setLead({ cr: v })} name="lead-cr" optional />
    </ScreenLayout>
  )
}

export function LeadDoneScreen() {
  const { lead, backToLogin } = useDemo()
  return (
    <ScreenLayout footer={<Button onClick={backToLogin}>Back to login</Button>}>
      <SuccessHeader
        title="Request received"
        sub={<>Thanks, {lead.name.trim().split(' ')[0]}. Our team will contact you on <span className="font-semibold text-ink">{formatMobile(lead.mobile)}</span> to get <span className="font-semibold text-ink">{lead.storeName.trim()}</span> started on Jahez.</>}
      />
      <ReferenceCard reference={lead.reference} note="We usually reach out within 2 business days." />
    </ScreenLayout>
  )
}

export function NationalIdScreen() {
  const { nationalId, setNationalId, idConsent, setConsent, submitNationalId, back, busy } = useDemo()
  const valid = isValidNationalId(nationalId)
  const err = nationalIdError(nationalId)
  const canContinue = valid && idConsent && !busy
  return (
    <ScreenLayout
      onBack={busy ? undefined : back}
      footer={<Button onClick={submitNationalId} disabled={!valid || !idConsent} loading={busy} loadingText="Checking merchant records">Continue</Button>}
    >
      <Title sub="We’ll check whether you’re registered as an owner or manager of a Jahez merchant.">Verify your National ID</Title>
      <Field
        label="National ID"
        name="national-id"
        inputMode="numeric"
        placeholder="1XXXXXXXXX"
        value={nationalId}
        onChange={v => setNationalId(digitsOnly(v).slice(0, 10))}
        error={err}
        eager={nationalId.length === 10 || (nationalId.length > 0 && nationalId[0] !== '1')}
        hint="10 digits, starting with 1"
        autoFocus
        onEnter={() => { if (canContinue) submitNationalId() }}
      />
      <Checkbox checked={idConsent} onChange={setConsent}>
        I agree that Jahez may use my National ID to verify whether I’m registered as an owner or manager of merchants on Jahez.
      </Checkbox>
    </ScreenLayout>
  )
}

export function NoMatchScreen() {
  const { nationalId, crAnswer, setCrAnswer, confirmCrAnswer, back } = useDemo()
  return (
    <ScreenLayout onBack={back} footer={<Button onClick={confirmCrAnswer} disabled={!crAnswer}>Continue</Button>}>
      <IconBadge tone="warn" className="mb-6"><FileSearch className="size-7" /></IconBadge>
      <Title sub={<>We couldn’t find National ID <span className="font-semibold text-ink">ending {nationalId.slice(-4)}</span> as an owner or manager of a Jahez merchant.</>}>
        No merchant record found
      </Title>
      <p className="mb-4 text-[16px] font-semibold leading-snug text-ink">
        Are you registered in the Commercial Registration (CR) as an owner or manager?
      </p>
      <div role="radiogroup" aria-label="Registered in CR">
        <OptionCard selected={crAnswer === 'yes'} onSelect={() => setCrAnswer('yes')} title="Yes, I am" description="I’m listed in the CR as an owner or manager." />
        <OptionCard selected={crAnswer === 'authorized'} onSelect={() => setCrAnswer('authorized')} title="No, I’m an authorized person" description="I manage the business on the owner’s behalf." />
      </div>
    </ScreenLayout>
  )
}

export function AuthorizedScreen() {
  const { back, openManual, backToLogin } = useDemo()
  return (
    <ScreenLayout
      onBack={back}
      footer={
        <>
          <Button onClick={() => openManual('authorized', 'authorized')}>Request manual verification</Button>
          <Button variant="ghost" onClick={backToLogin}>Back to login</Button>
        </>
      }
    >
      <IconBadge tone="neutral" className="mb-6"><Info className="size-7" /></IconBadge>
      <Title sub="Jahez for Owners can only give automatic access to people registered in the CR as an owner or manager.">
        We’ll need to verify you manually
      </Title>
      <div className="rounded-2xl bg-[#f7f7f9] p-4 text-[14px] leading-[1.55] text-ink-2">
        You can still request access. Share your business details and the Jahez team will confirm your authorization and contact you.
      </div>
    </ScreenLayout>
  )
}

export function AlreadyLinkedScreen() {
  const { linkedEmail, back, backToLogin, openManual } = useDemo()
  return (
    <ScreenLayout
      onBack={back}
      footer={
        <>
          <Button onClick={backToLogin}>Back to login</Button>
          <Button variant="secondary" onClick={() => openManual('linked', 'alreadyLinked')}>I need support</Button>
        </>
      }
    >
      <IconBadge tone="warn" className="mb-6"><UserRoundX className="size-7" /></IconBadge>
      <Title sub="This National ID is already linked to a Jahez for Owners account with a different email.">
        This National ID is already registered
      </Title>
      <div className="rounded-2xl border border-line p-4">
        <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">Registered email</div>
        <div className="mt-1.5 text-[17px] font-semibold tracking-[0.01em] text-ink" data-testid="masked-email">{linkedEmail ? maskEmail(linkedEmail) : ''}</div>
      </div>
      <p className="mt-4 text-[14px] leading-[1.55] text-ink-2">
        Sign in with that email to continue. If you no longer have access to it, our support team can help.
      </p>
    </ScreenLayout>
  )
}

export function ManualFormScreen() {
  const { manual, setManual, nationalId, submitManual, back, busy } = useDemo()
  const storeOk = manual.storeName.trim().length >= 2
  const valid = storeOk && isValidCr(manual.cr) && isValidMobile(manual.mobile)
  const support = manual.context === 'linked'
  return (
    <ScreenLayout onBack={busy ? undefined : back} footer={<Button onClick={submitManual} disabled={!valid} loading={busy}>Submit request</Button>}>
      <Title sub={support
        ? 'Share your business details and our support team will help you regain access.'
        : 'Share your business details. The Jahez team will review them and contact you.'}
      >
        {support ? 'Get help with account access' : 'Request manual verification'}
      </Title>
      <Field label="National ID" name="manual-id" value={nationalId} readOnly />
      <Field label="Restaurant or store name" name="manual-store" value={manual.storeName} onChange={v => setManual({ storeName: v })} placeholder="e.g. Al Nakheel Kitchen"
        error={manual.storeName && !storeOk ? 'Enter your restaurant or store name' : null} autoFocus />
      <CrField value={manual.cr} onChange={v => setManual({ cr: v })} name="manual-cr" />
      <MobileField value={manual.mobile} onChange={v => setManual({ mobile: v })} name="manual-mobile" />
    </ScreenLayout>
  )
}

export function ManualDoneScreen() {
  const { manual, backToLogin } = useDemo()
  const support = manual.context === 'linked'
  return (
    <ScreenLayout footer={<Button onClick={backToLogin}>Back to login</Button>}>
      <SuccessHeader
        title={support ? 'Support request submitted' : 'Request submitted'}
        sub={<>The Jahez team will review your information and contact you on <span className="font-semibold text-ink">{formatMobile(manual.mobile)}</span>.</>}
      />
      <ReferenceCard reference={manual.reference} note="Reviews usually take 1–2 business days." />
    </ScreenLayout>
  )
}

/* ---------- shared pieces ---------- */

function SuccessHeader({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="pt-8">
      <IconBadge tone="ok" className="pop mb-7"><Check className="size-8" strokeWidth={2.6} /></IconBadge>
      <Title sub={sub}>{title}</Title>
    </div>
  )
}

function ReferenceCard({ reference, note }: { reference: string | null; note: string }) {
  return (
    <div className="fade-up rounded-2xl border border-line p-5">
      <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-3">Reference number</div>
      <div className="tabular mt-1.5 text-[26px] font-bold tracking-[0.02em] text-ink" data-testid="reference">{reference}</div>
      <div className="mt-3 border-t border-line pt-3 text-[13px] text-ink-2">{note}</div>
    </div>
  )
}

function MobileField({ value, onChange, name }: { value: string; onChange: (v: string) => void; name: string }) {
  return (
    <Field
      label="Mobile number"
      name={name}
      prefix="+966"
      inputMode="tel"
      placeholder="5X XXX XXXX"
      value={value}
      onChange={v => onChange(normalizeMobile(v))}
      error={mobileError(value)}
      eager={value.length === 9 || (value.length > 0 && value[0] !== '5')}
      autoComplete="tel-national"
    />
  )
}

function CrField({ value, onChange, name, optional }: { value: string; onChange: (v: string) => void; name: string; optional?: boolean }) {
  return (
    <Field
      label={optional ? 'CR number (optional)' : 'CR number'}
      name={name}
      inputMode="numeric"
      placeholder="7XXXXXXXXX"
      value={value}
      onChange={v => onChange(digitsOnly(v).slice(0, 10))}
      error={crError(value)}
      eager={value.length === 10 || (value.length > 0 && value[0] !== '7')}
      hint="10 digits, starting with 7"
    />
  )
}
