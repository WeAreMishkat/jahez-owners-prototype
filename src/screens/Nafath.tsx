import { Check, ShieldCheck, TimerOff, XCircle } from 'lucide-react'
import { useDemo } from '../store'
import { NAFATH_MAX_ATTEMPTS, NAFATH_SECONDS } from '../data'
import { formatClock } from '../lib'
import { Button, IconBadge, ScreenLayout, Spinner, Title, cx, useNow } from '../ui'

export function NafathMark({ className }: { className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full bg-nafath-50 py-1.5 pl-1.5 pr-3 text-[13px] font-semibold text-nafath', className)}>
      <span className="flex size-6 items-center justify-center rounded-full bg-nafath text-white"><ShieldCheck className="size-3.5" strokeWidth={2.5} /></span>
      Nafath
    </span>
  )
}

export function NafathScreen() {
  const { nafath, owner } = useDemo()
  const now = useNow(200)

  if (nafath.status === 'approved') {
    return (
      <ScreenLayout>
        <div className="flex h-full flex-col items-center justify-center pb-16 text-center">
          <IconBadge tone="ok" className="pop mb-7 size-20 rounded-full"><Check className="size-10" strokeWidth={2.6} /></IconBadge>
          <h1 className="text-[27px] font-bold tracking-[-0.025em]">Identity verified</h1>
          <p className="mt-2.5 max-w-[280px] text-[15px] leading-[1.5] text-ink-2">
            Thanks, {owner?.firstName}. Next, we’ll verify your email.
          </p>
          <div className="mt-8 flex items-center gap-2 text-[13.5px] font-medium text-ink-3"><Spinner className="size-4" /> Sending your code</div>
        </div>
      </ScreenLayout>
    )
  }

  const remaining = Math.max(0, (nafath.deadline - now) / 1000)
  const pct = Math.min(100, (remaining / NAFATH_SECONDS) * 100)
  const low = remaining <= 15

  return (
    <ScreenLayout
      right={
        <span className="whitespace-nowrap rounded-full bg-[#f3f3f5] px-2.5 py-1 text-[12px] font-semibold text-ink-2" data-testid="nafath-attempt">
          Attempt {nafath.attempt} of {NAFATH_MAX_ATTEMPTS}
        </span>
      }
    >
      <NafathMark className="mb-5" />
      <Title sub="Open the Nafath app, choose the number below and approve the request.">Verify your identity</Title>

      <div className="rounded-[28px] border border-nafath/15 bg-nafath-50 px-5 pb-5 pt-6 text-center">
        <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-nafath/80">Your verification number</div>
        <div className="tabular pop mt-1 text-[84px] font-extrabold leading-none tracking-[-0.02em] text-nafath" data-testid="nafath-number" key={nafath.challenge}>
          {String(nafath.challenge).padStart(2, '0')}
        </div>
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-[13px] font-medium">
            <span className="text-ink-2">Request expires in</span>
            <span className={cx('tabular font-semibold', low ? 'text-bad' : 'text-ink')} data-testid="nafath-timer">{formatClock(remaining)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white">
            <div className={cx('h-full rounded-full transition-[width] duration-200 ease-linear', low ? 'bg-bad' : 'bg-nafath')} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2.5 text-[14px] font-medium text-ink-2">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-nafath opacity-60" />
          <span className="relative inline-flex size-2.5 rounded-full bg-nafath" />
        </span>
        Waiting for your approval in Nafath…
      </div>

      <ol className="mt-7 space-y-3 border-t border-line pt-6">
        {['Open the Nafath app', <>Choose <span className="font-bold text-ink">{String(nafath.challenge).padStart(2, '0')}</span></>, 'Approve the request'].map((step, i) => (
          <li key={i} className="flex items-center gap-3 text-[14px] text-ink-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f3f3f5] text-[12px] font-bold text-ink">{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </ScreenLayout>
  )
}

export function NafathFailedScreen() {
  const { nafath, nafathRetry, openManual, backToLogin } = useDemo()
  const final = nafath.attempt >= NAFATH_MAX_ATTEMPTS
  const expired = nafath.status === 'expired'
  const reason = expired
    ? 'The verification request expired before it was approved.'
    : 'The verification request was rejected in Nafath.'
  return (
    <ScreenLayout
      footer={
        final ? (
          <>
            <Button onClick={() => openManual('nafath', 'nafathFailed')}>Request manual verification</Button>
            <Button variant="ghost" onClick={backToLogin}>Back to login</Button>
          </>
        ) : (
          <>
            <Button onClick={nafathRetry}>Try again</Button>
            <Button variant="ghost" onClick={backToLogin}>Back to login</Button>
          </>
        )
      }
    >
      <div className="pt-6">
        <IconBadge tone="bad" className="pop mb-7">{expired ? <TimerOff className="size-7" /> : <XCircle className="size-7" />}</IconBadge>
        <Title sub={reason}>We couldn’t verify your identity</Title>
        {final ? (
          <div className="rounded-2xl bg-[#f7f7f9] p-4 text-[14px] leading-[1.55] text-ink-2" data-testid="nafath-final">
            <div className="mb-1 font-semibold text-ink">No verification attempts left</div>
            You can still get access. Request manual verification and the Jahez team will review your details.
          </div>
        ) : (
          <div className="rounded-2xl bg-[#f7f7f9] p-4 text-[14px] leading-[1.55] text-ink-2">
            <div className="mb-1 font-semibold text-ink">You have 1 attempt left</div>
            We’ll send a new request to Nafath with a new number.
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}
