// Omise Payment Service
// This service handles Omise payment gateway integration

declare global {
  interface Window {
    Omise: any;
  }
}

export interface OmiseCardData {
  name: string;
  number: string;
  expiration_month: string;
  expiration_year: string;
  security_code: string;
}

export interface OmiseTokenResponse {
  id: string;
  object: string;
  livemode: boolean;
  location: string;
  used: boolean;
  card: {
    id: string;
    object: string;
    livemode: boolean;
    location: string;
    created: string;
    deleted: boolean;
    street1: string | null;
    street2: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    country: string | null;
    phone_number: string | null;
    financing: string;
    bank: string;
    last_digits: string;
    brand: string;
    fingerprint: string;
    name: string | null;
    expiration_month: number;
    expiration_year: number;
    security_code_check: boolean;
  };
  created: string;
}

export interface OmiseSourceData {
  type: 'promptpay';
  amount: number;
  currency: string;
}

export interface OmiseSourceResponse {
  id: string;
  object: string;
  livemode: boolean;
  location: string;
  type: string;
  flow: string;
  amount: number;
  currency: string;
  scannable_code: {
    object: string;
    type: string;
    image: {
      download_uri: string;
    };
  };
  created: string;
}

export class OmiseService {
  private readonly publicKey: string;
  private isInitialized: boolean = false;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
    this.initializeOmise();
  }

  private initializeOmise(): void {
    if (typeof window !== 'undefined' && window.Omise) {
      window.Omise.setPublicKey(this.publicKey);
      this.isInitialized = true;
      console.log('Omise initialized successfully');
    } else {
      console.error('Omise.js library not loaded');
    }
  }

  /**
   * Create a token for credit/debit card payment
   */
  async createCardToken(cardData: OmiseCardData): Promise<OmiseTokenResponse> {
    if (!this.isInitialized) {
      throw new Error('Omise not initialized');
    }

    return new Promise((resolve, reject) => {
      window.Omise.createToken('card', cardData, (statusCode: number, response: any) => {
        if (statusCode === 200) {
          console.log('Card token created successfully:', response.id);
          resolve(response);
        } else {
          console.error('Failed to create card token:', response);
          reject(new Error(response.message || 'Failed to create card token'));
        }
      });
    });
  }

  /**
   * Create a source for PromptPay payment
   */
  async createPromptPaySource(amount: number, currency: string = 'thb'): Promise<OmiseSourceResponse> {
    if (!this.isInitialized) {
      throw new Error('Omise not initialized');
    }

    console.log('Creating PromptPay source with:', { amount, currency });

    return new Promise((resolve, reject) => {
      window.Omise.createSource('promptpay', {
        amount: amount,
        currency: currency
      }, (statusCode: number, response: any) => {
        console.log('Omise createSource response:', { statusCode, response });

        if (statusCode === 200) {
          console.log('PromptPay source created successfully:', response.id);
          console.log('Source details:', {
            id: response.id,
            type: response.type,
            amount: response.amount,
            currency: response.currency,
            hasScannableCode: !!response.scannable_code,
            scannableCodeType: response.scannable_code?.type,
            hasImage: !!response.scannable_code?.image,
            imageUri: response.scannable_code?.image?.download_uri
          });

          // Validate response structure
          if (!response.scannable_code?.image?.download_uri) {
            console.error('Invalid PromptPay source response - missing QR code image:', response);
            reject(new Error('PromptPay source created but QR code image is not available. Please try again.'));
            return;
          }

          resolve(response);
        } else {
          console.error('Failed to create PromptPay source:', response);
          reject(new Error(response.message || 'Failed to create PromptPay source'));
        }
      });
    });
  }

  /**
   * Validate card data before creating token
   */
  validateCardData(cardData: OmiseCardData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!cardData.name || cardData.name.trim() === '') {
      errors.push('Cardholder name is required');
    }

    if (!cardData.number || cardData.number.trim() === '') {
      errors.push('Card number is required');
    } else {
      // Basic card number validation (remove spaces and check length)
      const cleanNumber = cardData.number.replace(/\s/g, '');
      if (cleanNumber.length < 13 || cleanNumber.length > 19) {
        errors.push('Invalid card number length');
      }
      if (!/^\d+$/.test(cleanNumber)) {
        errors.push('Card number must contain only digits');
      }
    }

    if (!cardData.expiration_month || cardData.expiration_month.trim() === '') {
      errors.push('Expiration month is required');
    } else {
      const month = parseInt(cardData.expiration_month);
      if (isNaN(month) || month < 1 || month > 12) {
        errors.push('Invalid expiration month');
      }
    }

    if (!cardData.expiration_year || cardData.expiration_year.trim() === '') {
      errors.push('Expiration year is required');
    } else {
      const year = parseInt(cardData.expiration_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < currentYear) {
        errors.push('Invalid expiration year');
      }
    }

    if (!cardData.security_code || cardData.security_code.trim() === '') {
      errors.push('Security code (CVV) is required');
    } else {
      const cvv = cardData.security_code;
      if (!/^\d{3,4}$/.test(cvv)) {
        errors.push('Security code must be 3 or 4 digits');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format card number with spaces for better UX
   */
  formatCardNumber(number: string): string {
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Check if Omise is available
   */
  isOmiseAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.Omise && this.isInitialized;
  }

  /**
   * Get Omise public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }
}

// Create singleton instance
let omiseServiceInstance: OmiseService | null = null;

export const getOmiseService = (publicKey?: string): OmiseService => {
  if (!omiseServiceInstance) {
    if (!publicKey) {
      throw new Error('Omise public key is required for initialization');
    }
    omiseServiceInstance = new OmiseService(publicKey);
  }
  return omiseServiceInstance;
};

export default OmiseService;
