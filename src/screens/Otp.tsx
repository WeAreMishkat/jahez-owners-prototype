import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'
import { Check, Mail, ShieldCheck } from 'lucide-react'
import { useDemo } from '../store'
import { OTP_MAX_RESENDS, OTP_RESEND_SECONDS } from '../data'
import { formatClock, plural } from '../lib'
import { IconBadge, ScreenLayout, Spinner, Title, cx, useNow } from '../ui'

const LEN = 4

export function OtpScreen() {
  const { email, otp, flow, verifyOtp, resendOtp, clearOtpError, back } = useDemo()
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(''))
  const [shakeKey, setShakeKey] = useState(0)
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const now = useNow(250)
  const locked = otp.verifying || otp.verified

  const focus = (i: number) => refs.current[Math.max(0, Math.min(LEN - 1, i))]?.focus()

  useEffect(() => { focus(0) }, [])

  // Wrong code: clear the boxes, shake, refocus.
  useEffect(() => {
    if (!otp.error) return
    setDigits(Array(LEN).fill(''))
    setShakeKey(k => k + 1)
    setTimeout(() => focus(0), 0)
  }, [otp.error])

  // A resend issues a new code: start fresh.
  useEffect(() => {
    if (otp.resends === 0) return
    setDigits(Array(LEN).fill(''))
    setTimeout(() => focus(0), 0)
  }, [otp.resends])

  const commit = (next: string[]) => {
    setDigits(next)
    if (otp.error && next.some(Boolean)) clearOtpError()
    if (next.every(Boolean)) verifyOtp(next.join(''))
  }

  const fillFrom = (i: number, raw: string) => {
    const incoming = raw.replace(/\D/g, '')
    if (!incoming) return
    const next = [...digits]
    let j = i
    for (const ch of incoming) {
      if (j >= LEN) break
      next[j++] = ch
    }
    commit(next)
    focus(j)
  }

  const onChange = (i: number, value: string) => {
    if (locked) return
    const v = value.replace(/\D/g, '')
    if (!v) {
      const next = [...digits]
      next[i] = ''
      setDigits(next)
      return
    }
    // Typing into a filled box replaces its digit with the newest keystroke.
    fillFrom(i, v.length > 1 && digits[i] ? v.replace(digits[i], '') || v : v)
  }

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault()
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      focus(i - 1)
    } else if (e.key === 'ArrowLeft') { e.preventDefault(); focus(i - 1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); focus(i + 1) }
  }

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (!locked) fillFrom(i, e.clipboardData.getData('text'))
  }

  const wait = Math.max(0, (otp.sentAt + OTP_RESEND_SECONDS * 1000 - now) / 1000)
  const resendsLeft = OTP_MAX_RESENDS - otp.resends

  return (
    <ScreenLayout onBack={locked ? undefined : back}>
      {flow === 'onboarding' && (
        <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-ok-50 px-3 py-1.5 text-[12.5px] font-semibold text-ok">
          <ShieldCheck className="size-4" /> Identity verified with Nafath
        </div>
      )}
      {flow !== 'onboarding' && <IconBadge tone="brand" size="md" className="mb-6"><Mail className="size-6" /></IconBadge>}
      <Title sub={<>Enter the 4-digit code we sent to<br /><span className="font-semibold text-ink" data-testid="otp-email">{email}</span></>}>
        Check your email
      </Title>

      <div key={shakeKey} className={cx('grid grid-cols-4 gap-3', shakeKey > 0 && 'shake')} role="group" aria-label="Verification code">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { refs.current[i] = el }}
            value={d}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1}`}
            disabled={locked}
            onChange={e => onChange(i, e.target.value)}
            onKeyDown={e => onKeyDown(i, e)}
            onPaste={e => onPaste(i, e)}
            onFocus={e => e.target.select()}
            className={cx(
              'tabular h-[68px] w-full rounded-2xl border bg-white text-center text-[28px] font-bold text-ink caret-brand outline-none transition-all',
              otp.verified ? 'border-ok bg-ok-50 text-ok'
                : otp.error ? 'border-bad ring-4 ring-bad/10'
                  : d ? 'border-[#c9c9cf]' : 'border-line',
              !locked && 'focus:border-ink focus:ring-4 focus:ring-ink/[0.06] hover:border-[#c9c9cf]',
            )}
          />
        ))}
      </div>

      <div className="mt-3 min-h-[22px] text-[13.5px] font-medium">
        {otp.verifying ? (
          <span className="flex items-center gap-2 text-ink-2"><Spinner className="size-4" /> Verifying code</span>
        ) : otp.verified ? (
          <span className="flex items-center gap-1.5 text-ok"><Check className="size-4" strokeWidth={3} /> Email verified</span>
        ) : otp.error ? (
          <span role="alert" className="text-bad" data-testid="otp-error">{otp.error}</span>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl bg-[#f7f7f9] px-4 py-3.5 text-[14px]" data-testid="otp-resend">
        {resendsLeft <= 0 ? (
          <div>
            <div className="font-semibold text-ink">Resend limit reached</div>
            <div className="mt-0.5 text-ink-2">You’ve used all {OTP_MAX_RESENDS} resends. Check your spam folder or try again later.</div>
          </div>
        ) : wait > 0 ? (
          <div className="flex items-center justify-between text-ink-2">
            <span>Didn’t get a code?</span>
            <span className="tabular font-semibold text-ink-3">Resend in {formatClock(wait)}</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-ink-2">Didn’t get a code?</span>
            <button
              onClick={resendOtp}
              disabled={locked}
              className="rounded-lg px-2 py-1 -mr-2 font-semibold text-brand transition hover:bg-brand-50"
            >
              Resend code
            </button>
          </div>
        )}
        {resendsLeft > 0 && otp.resends > 0 && (
          <div className="mt-1 text-[12.5px] text-ink-3">{plural(resendsLeft, 'resend')} left</div>
        )}
      </div>
    </ScreenLayout>
  )
}
