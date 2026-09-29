import { useEffect, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Check, ChevronLeft, Loader2, Lock } from 'lucide-react'

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(' ')

export function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

export function Spinner({ className = 'size-5' }: { className?: string }) {
  return <Loader2 className={cx('animate-spin', className)} aria-hidden />
}

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  className?: string
  loadingText?: string
}

export function Button({ children, onClick, disabled, loading, variant = 'primary', type = 'button', className, loadingText }: ButtonProps) {
  const base = 'relative flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl text-[16px] font-semibold tracking-[-0.01em] transition-all duration-150 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-4'
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-600 focus-visible:ring-brand/20 disabled:bg-[#e4e4e8] disabled:text-ink-3 disabled:active:scale-100',
    secondary: 'bg-white text-ink ring-1 ring-inset ring-line hover:bg-[#f7f7f9] focus-visible:ring-brand/20',
    ghost: 'text-brand hover:bg-brand-50 focus-visible:ring-brand/15 h-12',
  }[variant]
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cx(base, styles, loading && '!bg-brand !text-white', className)}>
      {loading ? <><Spinner />{loadingText && <span>{loadingText}</span>}</> : children}
    </button>
  )
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      className="-ml-1.5 flex size-10 items-center justify-center rounded-full text-ink transition hover:bg-[#f2f2f4] active:bg-[#ebebee]"
    >
      <ChevronLeft className="size-6" strokeWidth={2.2} />
    </button>
  )
}

export function ScreenLayout({ onBack, title, right, children, footer, bodyClassName }: {
  onBack?: () => void
  title?: string
  right?: ReactNode
  children: ReactNode
  footer?: ReactNode
  bodyClassName?: string
}) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between px-4">
        <div className="w-10">{onBack && <BackButton onClick={onBack} />}</div>
        {title && <div className="text-[15px] font-semibold text-ink">{title}</div>}
        <div className="flex w-10 justify-end">{right}</div>
      </header>
      <div className={cx('thin-scroll flex-1 overflow-y-auto px-6 pb-6', bodyClassName)}>{children}</div>
      {footer && <div className="shrink-0 space-y-2 px-6 pb-3 pt-3">{footer}</div>}
    </div>
  )
}

export function Title({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-7">
      <h1 className="text-[27px] font-bold leading-[1.15] tracking-[-0.025em] text-ink">{children}</h1>
      {sub && <p className="mt-2.5 text-[15px] leading-[1.5] text-ink-2">{sub}</p>}
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange?: (v: string) => void
  error?: string | null
  hint?: string
  prefix?: string
  readOnly?: boolean
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  type?: string
  placeholder?: string
  maxLength?: number
  autoFocus?: boolean
  name?: string
  onEnter?: () => void
  autoComplete?: string
  /** Show the error while typing, not only after blur. */
  eager?: boolean
}

export function Field({ label, value, onChange, error, hint, prefix, readOnly, inputMode, type = 'text', placeholder, maxLength, autoFocus, name, onEnter, autoComplete = 'off', eager }: FieldProps) {
  const [touched, setTouched] = useState(false)
  const showError = !!error && (touched || !!eager)
  const id = `f-${name ?? label.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className="mb-4">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-semibold text-ink-2">{label}</label>
      <div
        className={cx(
          'flex h-[54px] items-center rounded-2xl border bg-white transition-all',
          readOnly ? 'border-line bg-[#f7f7f9]' : showError ? 'border-bad ring-4 ring-bad/10' : 'border-line focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/[0.06] hover:border-[#d4d4da]',
        )}
      >
        {prefix && <span className="flex h-full items-center border-r border-line pl-4 pr-3 text-[16px] font-medium text-ink-2">{prefix}</span>}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          readOnly={readOnly}
          inputMode={inputMode}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          spellCheck={false}
          aria-invalid={showError}
          onChange={e => onChange?.(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={e => { if (e.key === 'Enter') onEnter?.() }}
          className={cx('h-full w-full min-w-0 bg-transparent px-4 text-[16px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-[#b3b4ba]', readOnly && 'text-ink-2')}
        />
        {readOnly && <Lock className="mr-4 size-4 shrink-0 text-ink-3" aria-label="Read only" />}
      </div>
      {showError ? (
        <p role="alert" className="mt-1.5 text-[13px] font-medium text-bad">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[13px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  )
}

export function OptionCard({ selected, onSelect, title, description, icon }: {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cx(
        'mb-3 flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all',
        selected ? 'border-brand bg-brand-50 ring-1 ring-brand' : 'border-line bg-white hover:border-[#d4d4da] hover:bg-[#fafafb]',
      )}
    >
      {icon && (
        <span className={cx('flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors', selected ? 'bg-brand text-white' : 'bg-[#f3f3f5] text-ink')}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 pt-0.5">
        <span className="block text-[15.5px] font-semibold leading-snug text-ink">{title}</span>
        {description && <span className="mt-1 block text-[13.5px] leading-snug text-ink-2">{description}</span>}
      </span>
      <span className={cx('mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 transition-all', selected ? 'border-brand bg-brand' : 'border-[#cfd0d6]')}>
        {selected && <span className="size-2 rounded-full bg-white" />}
      </span>
    </button>
  )
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className={cx('relative flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors', checked ? 'border-brand/40 bg-brand-50' : 'border-line bg-[#fafafb] hover:border-[#d4d4da]')}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={cx('mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-[7px] border-2 transition-all peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20', checked ? 'border-brand bg-brand' : 'border-[#cfd0d6] bg-white')}>
        {checked && <Check className="size-3.5 text-white" strokeWidth={3.5} />}
      </span>
      <span className="text-[13.5px] leading-[1.5] text-ink-2">{children}</span>
    </label>
  )
}

const toneStyles = {
  brand: 'bg-brand-50 text-brand',
  ok: 'bg-ok-50 text-ok',
  warn: 'bg-warn-50 text-warn',
  bad: 'bg-bad-50 text-bad',
  neutral: 'bg-[#f3f3f5] text-ink',
  nafath: 'bg-nafath-50 text-nafath',
}

export function IconBadge({ children, tone = 'brand', size = 'lg', className }: { children: ReactNode; tone?: keyof typeof toneStyles; size?: 'md' | 'lg'; className?: string }) {
  return (
    <div className={cx('flex items-center justify-center rounded-[22px]', size === 'lg' ? 'size-16' : 'size-12 rounded-2xl', toneStyles[tone], className)}>
      {children}
    </div>
  )
}

export function BrandAvatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name.replace(/&|\./g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('')
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[30%] font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  )
}
