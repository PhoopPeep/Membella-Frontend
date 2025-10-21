export interface OmiseCardData {
  name: string
  number: string
  expiration_month: string
  expiration_year: string
  security_code: string
}

export interface OmiseTokenResponse {
  id: string
  object: string
  livemode: boolean
  location: string
  used: boolean
  card: {
    id: string
    object: string
    livemode: boolean
    location: string
    created: string
    deleted: boolean
    street1: string | null
    street2: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    country: string | null
    phone_number: string | null
    financing: string
    bank: string
    last_digits: string
    brand: string
    fingerprint: string
    name: string | null
    expiration_month: number
    expiration_year: number
    security_code_check: boolean
  }
  created: string
}

export interface OmiseSourceData {
  type: 'promptpay'
  amount: number
  currency: string
}

export interface OmiseSourceResponse {
  id: string
  object: string
  livemode: boolean
  location: string
  type: string
  flow: string
  amount: number
  currency: string
  scannable_code: {
    object: string
    type: string
    image: {
      download_uri: string
    }
  }
  created: string
}

