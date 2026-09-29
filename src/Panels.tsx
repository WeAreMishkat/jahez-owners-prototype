import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, Check, Info, RotateCcw, ShieldCheck, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { useDemo, type DemoEvent, type Tone } from './store'
import { GUIDE, NAFATH_MAX_ATTEMPTS, OTP_FAIL, OTP_SUCCESS } from './data'
import { formatClock } from './lib'
import { Spinner, cx, useNow } from './ui'

const APP_ICON = `${import.meta.env.BASE_URL}brand/jahez-app-icon.png`

/* ---------------- Left: scenario guide ---------------- */

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

function CopyChip({ value, tone }: { value: string; tone?: 'ok' | 'bad' }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { copyText(value); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
      title="Click to copy"
      className={cx(
        'tabular inline-flex max-w-full items-center gap-1 rounded-lg px-2 py-[5px] text-left text-[12.5px] font-semibold transition',
        copied ? 'bg-ok-50 text-ok' : tone === 'ok' ? 'bg-ok-50 text-ok hover:brightness-95' : tone === 'bad' ? 'bg-bad-50 text-bad hover:brightness-95' : 'bg-[#f3f3f5] text-ink hover:bg-brand-50 hover:text-brand',
      )}
    >
      <span className="truncate">{value}</span>
      {copied && <Check className="size-3 shrink-0" strokeWidth={3.5} />}
    </button>
  )
}

const SCENARIOS: Array<{ title: string; values: string[]; note?: string }> = [
  { title: 'Existing account', values: [GUIDE.existing.email] },
  { title: 'New owner · 1 brand', values: [GUIDE.oneBrand.email, GUIDE.oneBrand.id] },
  { title: 'New owner · 3 brands', values: [GUIDE.multiBrand.email, GUIDE.multiBrand.id] },
  { title: 'No ownership match', values: [GUIDE.noMatch.email, GUIDE.noMatch.id], note: 'Then choose CR owner or authorized person' },
  { title: 'ID already registered', values: [GUIDE.linked.email, GUIDE.linked.id] },
  { title: 'New merchant', values: [GUIDE.newMerchant.email], note: 'Choose “register my restaurant or store”' },
]

export function ScenarioGuide() {
  const reset = useDemo(s => s.reset)
  return (
    <div className="flex h-full flex-col rounded-3xl bg-white p-4 ring-1 ring-line">
      <div className="mb-4 flex items-center gap-3 px-1">
        <img src={APP_ICON} alt="" className="size-9 rounded-[11px]" />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold tracking-[-0.01em]">Jahez for Owners</div>
          <div className="text-[12px] text-ink-3">Onboarding prototype</div>
        </div>
      </div>

      <div className="thin-scroll -mx-1 flex-1 overflow-y-auto px-1">
        <div className="mb-1 flex items-baseline justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-3">Test credentials</span>
          <span className="text-[11px] text-ink-3">Click to copy</span>
        </div>
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-[#f7f7f9] px-2.5 py-2 text-[12px] font-medium text-ink-2">
          <span className="mr-auto whitespace-nowrap font-semibold text-ink">Email code</span>
          <CopyChip value={OTP_SUCCESS} tone="ok" /> <span className="-ml-1">works</span>
          <CopyChip value={OTP_FAIL} tone="bad" /> <span className="-ml-1">fails</span>
        </div>
        <ul className="divide-y divide-line">
          {SCENARIOS.map((s, i) => (
            <li key={s.title} className="px-1 py-2.5">
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-md bg-ink text-[10.5px] font-bold text-white">{i + 1}</span>
                <span className="truncate text-[13px] font-semibold">{s.title}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.values.map(v => <CopyChip key={v} value={v} />)}
              </div>
              {s.note && <div className="mt-1 text-[11.5px] leading-snug text-ink-3">{s.note}</div>}
            </li>
          ))}
          <li className="px-1 py-2.5 text-[11.5px] leading-relaxed text-ink-3">
            Nafath reject, timeout or two failures: use scenario 2 or 3, then the Nafath controls on the right.
          </li>
        </ul>
      </div>

      <button
        onClick={reset}
        data-testid="reset-demo"
        className="mt-3 flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-ink text-[13.5px] font-semibold text-white transition hover:bg-[#2a2a2f] active:scale-[0.99]"
      >
        <RotateCcw className="size-4" /> Reset demo
      </button>
    </div>
  )
}

/* ---------------- Right: business activity ---------------- */

const TONE: Record<Tone, { dot: string; icon: ReactNode }> = {
  success: { dot: 'bg-ok text-white', icon: <Check className="size-3" strokeWidth={3.5} /> },
  warning: { dot: 'bg-warn text-white', icon: <AlertTriangle className="size-3" strokeWidth={3} /> },
  error: { dot: 'bg-bad text-white', icon: <X className="size-3" strokeWidth={3.5} /> },
  pending: { dot: 'bg-white text-ink-2 ring-1 ring-line', icon: <Spinner className="size-3" /> },
  info: { dot: 'bg-ink text-white', icon: <Info className="size-3" strokeWidth={3} /> },
  neutral: { dot: 'bg-[#e6e6ea] text-ink-2', icon: <span className="size-1.5 rounded-full bg-ink-2" /> },
}

const fmtTime = (t: number) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

function EventRow({ e, latest }: { e: DemoEvent; latest: boolean }) {
  const t = TONE[e.tone]
  return (
    <li className={cx('event-in relative flex gap-3 rounded-2xl px-3 py-2.5 transition-colors', latest && 'bg-brand-50 ring-1 ring-brand/25 shadow-[0_6px_18px_-10px_rgba(96,0,0,.35)]')} data-testid="event">
      <span className={cx('relative z-10 mt-[1px] flex size-5 shrink-0 items-center justify-center rounded-full', t.dot)}>{t.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cx('text-[13.5px] font-semibold leading-snug', latest ? 'text-ink' : 'text-ink')} data-testid="event-title">{e.title}</span>
          {latest
            ? <span className="shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">Latest</span>
            : <span className="tabular shrink-0 text-[11px] text-ink-3">{fmtTime(e.at)}</span>}
        </div>
        {e.detail && <div className={cx('mt-0.5 text-[12.5px] leading-snug', latest ? 'text-ink-2' : 'text-ink-3')}>{e.detail}</div>}
        {latest && <div className="tabular mt-1 text-[11px] text-ink-3">{fmtTime(e.at)}</div>}
      </div>
    </li>
  )
}

export function ActivityPanel() {
  const events = useDemo(s => s.events)
  const screen = useDemo(s => s.screen)
  const nafath = useDemo(s => s.nafath)
  const list = useRef<HTMLDivElement>(null)
  const showNafath = screen === 'nafath' && nafath.status === 'pending'

  useEffect(() => {
    const el = list.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [events.length, showNafath])

  return (
    <div className="flex h-full flex-col rounded-3xl bg-white ring-1 ring-line">
      <div className="flex items-center justify-between px-5 pb-3 pt-4">
        <div>
          <div className="text-[14px] font-bold tracking-[-0.01em]">Behind the scenes</div>
          <div className="text-[12px] text-ink-3">What Jahez checks and decides</div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-ok-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-ok">
          <span className="size-1.5 animate-pulse rounded-full bg-ok" /> Live
        </span>
      </div>
      <div ref={list} className="thin-scroll relative flex-1 overflow-y-auto px-2 pb-3" data-testid="activity">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[#f3f3f5] text-ink-3"><Info className="size-5" /></div>
            <div className="text-[13.5px] font-semibold text-ink-2">No activity yet</div>
            <div className="mt-1 text-[12.5px] leading-snug text-ink-3">Steps will appear here as you use the app.</div>
          </div>
        ) : (
          <ol className="relative space-y-0.5">
            {events.map((e, i) => <EventRow key={e.id} e={e} latest={i === events.length - 1} />)}
          </ol>
        )}
      </div>
      {showNafath && <NafathControls />}
    </div>
  )
}

function NafathControls() {
  const { nafath, nafathApprove, nafathReject } = useDemo()
  const now = useNow(250)
  const remaining = Math.max(0, (nafath.deadline - now) / 1000)
  return (
    <div className="fade-up m-3 mt-0 rounded-2xl border border-nafath/25 bg-nafath-50 p-3.5 attention" data-testid="nafath-controls">
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-nafath">
          <ShieldCheck className="size-3.5" /> Nafath app · demo control
        </span>
        <span className="tabular text-[12px] font-semibold text-ink-2">{formatClock(remaining)}</span>
      </div>
      <div className="mb-3 text-[12.5px] leading-snug text-ink-2">
        Simulates the person’s response in Nafath (number <span className="font-bold text-ink">{String(nafath.challenge).padStart(2, '0')}</span>, attempt {nafath.attempt} of {NAFATH_MAX_ATTEMPTS}).
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={nafathApprove} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-nafath px-2 text-[12.5px] font-semibold text-white transition hover:brightness-110 active:scale-[0.98]">
          <ThumbsUp className="size-4 shrink-0" /> Approve in Nafath
        </button>
        <button onClick={nafathReject} className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-2 text-[12.5px] font-semibold text-bad ring-1 ring-inset ring-bad/30 transition hover:bg-bad-50 active:scale-[0.98]">
          <ThumbsDown className="size-4 shrink-0" /> Reject in Nafath
        </button>
      </div>
    </div>
  )
}
