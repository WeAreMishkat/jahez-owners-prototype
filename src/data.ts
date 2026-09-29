// Deterministic demo data. Everything here is fictional.

export interface Brand {
  id: string
  name: string
  category: string
  city: string
  branches: number
  color: string
  ordersToday: number
  salesToday: number
  rating: number
  activeCampaigns: number
  openNow: boolean
}

export interface OwnerRecord {
  nationalId: string
  name: string
  firstName: string
  role: 'Owner' | 'Manager'
  brandIds: string[]
}

export interface Account {
  email: string
  nationalId: string
}

export const BRANDS: Record<string, Brand> = {
  'najd-grill': {
    id: 'najd-grill', name: 'Najd Grill', category: 'Grills · Arabic', city: 'Riyadh',
    branches: 4, color: '#8A5A2B', ordersToday: 186, salesToday: 14820, rating: 4.7, activeCampaigns: 2, openNow: true,
  },
  'crumb-co': {
    id: 'crumb-co', name: 'Crumb & Co.', category: 'Bakery · Coffee', city: 'Riyadh',
    branches: 2, color: '#3F6E5A', ordersToday: 74, salesToday: 3960, rating: 4.8, activeCampaigns: 1, openNow: true,
  },
  'olive-thyme': {
    id: 'olive-thyme', name: 'Olive & Thyme', category: 'Mediterranean', city: 'Jeddah',
    branches: 1, color: '#5B6B2E', ordersToday: 58, salesToday: 3410, rating: 4.6, activeCampaigns: 0, openNow: true,
  },
  'dune-burger': {
    id: 'dune-burger', name: 'Dune Burger', category: 'Burgers · Fast food', city: 'Riyadh',
    branches: 6, color: '#B4541A', ordersToday: 312, salesToday: 21640, rating: 4.5, activeCampaigns: 3, openNow: true,
  },
  'saffron-house': {
    id: 'saffron-house', name: 'Saffron House', category: 'Indian · Rice', city: 'Dammam',
    branches: 3, color: '#A07818', ordersToday: 141, salesToday: 11290, rating: 4.7, activeCampaigns: 1, openNow: true,
  },
  'qahwa-lane': {
    id: 'qahwa-lane', name: 'Qahwa Lane', category: 'Coffee · Desserts', city: 'Khobar',
    branches: 2, color: '#4A3F6B', ordersToday: 97, salesToday: 4780, rating: 4.9, activeCampaigns: 0, openNow: false,
  },
  'harbi-shawarma': {
    id: 'harbi-shawarma', name: 'Harbi Shawarma', category: 'Shawarma · Sandwiches', city: 'Madinah',
    branches: 2, color: '#7A2E2E', ordersToday: 129, salesToday: 5210, rating: 4.4, activeCampaigns: 1, openNow: true,
  },
}

/** Jahez merchant-portfolio ownership records, keyed by National ID. */
export const OWNER_RECORDS: Record<string, OwnerRecord> = {
  '1098765432': { nationalId: '1098765432', name: 'Faisal Al-Harbi', firstName: 'Faisal', role: 'Owner', brandIds: ['najd-grill', 'crumb-co'] },
  '1111111111': { nationalId: '1111111111', name: 'Sara Al-Otaibi', firstName: 'Sara', role: 'Owner', brandIds: ['olive-thyme'] },
  '1222222222': { nationalId: '1222222222', name: 'Abdullah Al-Qahtani', firstName: 'Abdullah', role: 'Owner', brandIds: ['dune-burger', 'saffron-house', 'qahwa-lane'] },
  '1444444444': { nationalId: '1444444444', name: 'Mohammed Al-Harbi', firstName: 'Mohammed', role: 'Manager', brandIds: ['harbi-shawarma'] },
}

/** Existing Jahez for Owners accounts at the start of the demo. */
export const INITIAL_ACCOUNTS: Record<string, Account> = {
  'existing@jahez.net': { email: 'existing@jahez.net', nationalId: '1098765432' },
  'm.alharbi@jahez.net': { email: 'm.alharbi@jahez.net', nationalId: '1444444444' },
}

export const OTP_SUCCESS = '1234'
export const OTP_FAIL = '0000'
export const NAFATH_SECONDS = 60
export const NAFATH_MAX_ATTEMPTS = 2
export const OTP_RESEND_SECONDS = 60
export const OTP_MAX_RESENDS = 3

export const GUIDE = {
  existing: { email: 'existing@jahez.net' },
  oneBrand: { email: 'sara@jahez.net', id: '1111111111' },
  multiBrand: { email: 'abdullah@jahez.net', id: '1222222222' },
  noMatch: { email: 'khalid@jahez.net', id: '1333333333' },
  linked: { email: 'mohd@jahez.net', id: '1444444444' },
  newMerchant: { email: 'newstore@jahez.net' },
}
