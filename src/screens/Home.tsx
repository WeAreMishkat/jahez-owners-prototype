import { useState, type ReactNode } from 'react'
import {
  BarChart3, Bell, Check, ChevronDown, ChevronRight, Home as HomeIcon, LogOut, Megaphone, ReceiptText,
  Star, Store, UserRound, UtensilsCrossed,
} from 'lucide-react'
import { selectedBrand, useDemo } from '../store'
import { formatSar, plural } from '../lib'
import type { Brand } from '../data'
import { BrandAvatar, Button, IconBadge, ScreenLayout, Title, cx } from '../ui'

const DISTRICTS = ['Al Olaya', 'Al Malqa', 'Al Nakheel', 'Al Yasmin', 'Hittin', 'Al Rawdah']

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function WelcomeScreen() {
  const { owner, brands, enterHome } = useDemo()
  return (
    <ScreenLayout footer={<Button onClick={enterHome}>Go to dashboard</Button>}>
      <div className="pt-6">
        <IconBadge tone="ok" className="pop mb-7"><Check className="size-8" strokeWidth={2.6} /></IconBadge>
        <Title sub={<>Your Jahez for Owners account is ready. You now have access to {brands.length === 1 ? 'this brand' : `these ${brands.length} brands`}:</>}>
          You’re all set, {owner?.firstName}
        </Title>
        <div className="overflow-hidden rounded-2xl border border-line">
          {brands.map((b, i) => (
            <div key={b.id} className={cx('fade-up flex items-center gap-3.5 px-4 py-3.5', i > 0 && 'border-t border-line')} style={{ animationDelay: `${120 + i * 90}ms` }}>
              <BrandAvatar name={b.name} color={b.color} size={42} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold">{b.name}</div>
                <div className="truncate text-[13px] text-ink-2">{b.category} · {plural(b.branches, 'branch', 'branches')}</div>
              </div>
              <Check className="size-5 text-ok" strokeWidth={2.6} />
            </div>
          ))}
        </div>
      </div>
    </ScreenLayout>
  )
}

export function HomeScreen() {
  const s = useDemo()
  const { owner, brands, showToast, signOut } = s
  const brand = selectedBrand(s)
  const [sheet, setSheet] = useState(false)
  if (!brand || !owner) return null
  const soon = () => showToast('Not included in this prototype')

  return (
    <div className="relative flex h-full flex-col bg-[#f6f6f8]">
      <header className="flex shrink-0 items-center justify-between gap-3 bg-white px-5 pb-3.5 pt-2">
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-ink-3">{greeting()}</div>
          <div className="truncate text-[20px] font-bold tracking-[-0.02em]">{owner.firstName}</div>
        </div>
        <button
          onClick={() => setSheet(true)}
          aria-label="Switch brand"
          aria-haspopup="dialog"
          data-testid="brand-switcher"
          className="flex h-11 max-w-[190px] items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 transition hover:border-[#d4d4da] hover:bg-[#fafafb] active:scale-[0.98]"
        >
          <BrandAvatar name={brand.name} color={brand.color} size={34} />
          <span className="truncate text-[14px] font-semibold" data-testid="current-brand">{brand.name}</span>
          <ChevronDown className="size-4 shrink-0 text-ink-2" />
        </button>
      </header>

      <div className="thin-scroll flex-1 overflow-y-auto px-5 pb-6 pt-4" key={brand.id}>
        <section className="fade-up rounded-[26px] bg-brand p-5 text-white shadow-[0_12px_30px_-14px_rgba(96,0,0,.6)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[19px] font-bold tracking-[-0.01em]">{brand.name}</div>
              <div className="mt-0.5 truncate text-[13px] text-white/70">{brand.category} · {brand.city}</div>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-[12px] font-semibold">
              <span className={cx('size-1.5 rounded-full', brand.openNow ? 'bg-[#5fe08f]' : 'bg-white/50')} />
              {brand.openNow ? 'Open' : 'Closed'}
            </span>
          </div>
          <div className="mt-6 text-[12.5px] font-medium text-white/70">Today’s sales</div>
          <div className="tabular mt-0.5 text-[30px] font-bold tracking-[-0.02em]">{formatSar(brand.salesToday)}</div>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
            <Stat label="Orders" value={String(brand.ordersToday)} />
            <Stat label="Rating" value={<span className="inline-flex items-center gap-1">{brand.rating.toFixed(1)}<Star className="size-3.5 fill-current" /></span>} />
            <Stat label="Branches" value={String(brand.branches)} />
          </div>
        </section>

        <section className="mt-5 grid grid-cols-4 gap-2">
          {[
            { icon: Store, label: 'Stores' },
            { icon: Megaphone, label: 'Campaigns' },
            { icon: UtensilsCrossed, label: 'Menu' },
            { icon: BarChart3, label: 'Reports' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} onClick={soon} className="flex flex-col items-center gap-2 rounded-2xl py-2 transition hover:bg-white">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-ink shadow-[0_1px_0_rgba(0,0,0,.04)] ring-1 ring-line"><Icon className="size-5" /></span>
              <span className="text-[12px] font-semibold text-ink-2">{label}</span>
            </button>
          ))}
        </section>

        <section className="mt-5 rounded-[22px] bg-white p-4 ring-1 ring-line">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">Campaigns</div>
              <div className="mt-0.5 text-[13px] text-ink-2">
                {brand.activeCampaigns ? `${plural(brand.activeCampaigns, 'active campaign')} running` : 'No active campaigns'}
              </div>
            </div>
            <button onClick={soon} className="rounded-full bg-brand-50 px-3.5 py-2 text-[13px] font-semibold text-brand transition hover:bg-brand-100">
              {brand.activeCampaigns ? 'Manage' : 'Create'}
            </button>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-2 px-1 text-[15px] font-semibold">Branches</div>
          <div className="overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
            {Array.from({ length: Math.min(brand.branches, 3) }, (_, i) => (
              <button key={i} onClick={soon} className={cx('flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-[#fafafb]', i > 0 && 'border-t border-line')}>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-semibold">{brand.name} – {DISTRICTS[i]}</div>
                  <div className="text-[12.5px] text-ink-2">{brand.city}</div>
                </div>
                <span className={cx('text-[12px] font-semibold', brand.openNow ? 'text-ok' : 'text-ink-3')}>{brand.openNow ? 'Open' : 'Closed'}</span>
                <ChevronRight className="size-4 text-ink-3" />
              </button>
            ))}
          </div>
        </section>

        <button onClick={signOut} className="mx-auto mt-6 flex items-center gap-2 rounded-xl px-3 py-2 text-[13.5px] font-semibold text-ink-2 transition hover:bg-white">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>

      <nav className="grid shrink-0 grid-cols-4 border-t border-line bg-white px-2 pb-1 pt-2">
        {[
          { icon: HomeIcon, label: 'Home', active: true },
          { icon: ReceiptText, label: 'Orders' },
          { icon: Bell, label: 'Updates' },
          { icon: UserRound, label: 'Account' },
        ].map(({ icon: Icon, label, active }) => (
          <button key={label} onClick={active ? undefined : soon} className={cx('flex flex-col items-center gap-1 py-1 text-[11px] font-semibold', active ? 'text-brand' : 'text-ink-3 hover:text-ink-2')}>
            <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 2} />
            {label}
          </button>
        ))}
      </nav>

      {sheet && <BrandSheet brands={brands} current={brand.id} onClose={() => setSheet(false)} />}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <div className="text-[11.5px] font-medium text-white/65">{label}</div>
      <div className="tabular mt-0.5 text-[16px] font-bold">{value}</div>
    </div>
  )
}

function BrandSheet({ brands, current, onClose }: { brands: Brand[]; current: string; onClose: () => void }) {
  const selectBrand = useDemo(s => s.selectBrand)
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" role="dialog" aria-label="Switch brand">
      <button aria-label="Close" onClick={onClose} className="scrim-in absolute inset-0 bg-black/35" />
      <div className="sheet-in relative rounded-t-[28px] bg-white px-5 pb-6 pt-3">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#dcdce0]" />
        <div className="mb-1 text-[19px] font-bold tracking-[-0.02em]">Your brands</div>
        <div className="mb-4 text-[13.5px] text-ink-2">
          {brands.length === 1 ? 'You have access to 1 brand.' : `You have access to ${brands.length} brands. Choose one to manage.`}
        </div>
        <div className="space-y-2" role="listbox">
          {brands.map(b => {
            const active = b.id === current
            return (
              <button
                key={b.id}
                role="option"
                aria-selected={active}
                onClick={() => { selectBrand(b.id); onClose() }}
                className={cx('flex w-full items-center gap-3.5 rounded-2xl border p-3 text-left transition', active ? 'border-brand bg-brand-50' : 'border-line hover:bg-[#fafafb]')}
              >
                <BrandAvatar name={b.name} color={b.color} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{b.name}</div>
                  <div className="truncate text-[12.5px] text-ink-2">{b.category} · {plural(b.branches, 'branch', 'branches')}</div>
                </div>
                {active ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand text-white"><Check className="size-3.5" strokeWidth={3} /></span>
                ) : (
                  <span className="size-6 rounded-full border-2 border-[#d4d4da]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
