export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const normalizeEmail = (v: string) => v.trim().toLowerCase()
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim())

/** m.alharbi@jahez.net → m*******i@jahez.net */
export function maskEmail(email: string) {
  const [user, domain] = email.split('@')
  if (!domain) return email
  if (user.length <= 2) return `${user[0]}${'*'.repeat(Math.max(1, user.length - 1))}@${domain}`
  return `${user[0]}${'*'.repeat(user.length - 2)}${user[user.length - 1]}@${domain}`
}

export const digitsOnly = (v: string) => v.replace(/\D/g, '')

export function nationalIdError(v: string): string | null {
  if (!v) return null
  if (v[0] !== '1') return 'A Saudi National ID starts with 1'
  if (v.length !== 10) return 'National ID must be exactly 10 digits'
  return null
}
export const isValidNationalId = (v: string) => /^1\d{9}$/.test(v)

export function crError(v: string): string | null {
  if (!v) return null
  if (v[0] !== '7') return 'CR number starts with 7'
  if (v.length !== 10) return 'CR number must be exactly 10 digits'
  return null
}
export const isValidCr = (v: string) => /^7\d{9}$/.test(v)

/** Saudi mobile, entered after the +966 prefix: 5XXXXXXXX. A leading 0 is tolerated. */
export function normalizeMobile(v: string) {
  const d = digitsOnly(v)
  if (d.startsWith('966')) return d.slice(3, 12)
  if (d.startsWith('05')) return d.slice(1, 10)
  return d.slice(0, 9)
}
export function mobileError(v: string): string | null {
  if (!v) return null
  if (v[0] !== '5') return 'Saudi mobile numbers start with 5'
  if (v.length !== 9) return 'Enter 9 digits after +966'
  return null
}
export const isValidMobile = (v: string) => /^5\d{8}$/.test(v)
export const formatMobile = (v: string) =>
  `+966 ${v.slice(0, 2)} ${v.slice(2, 5)} ${v.slice(5)}`.trim()

export const maskId = (id: string) => `•••• ${id.slice(-4)}`

export function makeReference(prefix: string) {
  const n = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${n}`
}

export function randomChallenge(avoid?: number) {
  let n = 10 + Math.floor(Math.random() * 90)
  if (n === avoid) n = n === 99 ? 10 : n + 1
  return n
}

export const formatClock = (secs: number) => {
  const s = Math.max(0, Math.ceil(secs))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const formatSar = (n: number) => `SAR ${n.toLocaleString('en-US')}`

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
