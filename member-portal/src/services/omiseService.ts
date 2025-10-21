// Omise Payment Service
// This service handles Omise payment gateway integration

import type {
  OmiseCardData,
  OmiseTokenResponse,
  OmiseSourceResponse,
} from '../types/omise'

interface OmiseInstance {
  setPublicKey: (key: string) => void
  createToken: (
    type: string,
    data: OmiseCardData,
    callback: (statusCode: number, response: OmiseTokenResponse) => void
  ) => void
  createSource: (
    type: string,
    data: { amount: number; currency: string },
    callback: (statusCode: number, response: OmiseSourceResponse) => void
  ) => void
}

declare global {
  interface Window {
    Omise: OmiseInstance
  }
}

export class OmiseService {
  private readonly publicKey: string;
  private isInitialized: boolean = false;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
    this.initializeOmise();
  }

  private initializeOmise(): void {
    if (globalThis.window?.Omise) {
      globalThis.window.Omise.setPublicKey(this.publicKey);
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
      globalThis.window.Omise.createToken('card', cardData, (statusCode: number, response: OmiseTokenResponse) => {
        if (statusCode === 200) {
          console.log('Card token created successfully:', response.id);
          resolve(response);
        } else {
          console.error('Failed to create card token:', response);
          const errorMsg = (response as { message?: string }).message || 'Failed to create card token';
          reject(new Error(errorMsg));
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
      globalThis.window.Omise.createSource('promptpay', {
        amount: amount,
        currency: currency
      }, (statusCode: number, response: OmiseSourceResponse) => {
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
          const errorMsg = (response as { message?: string }).message || 'Failed to create PromptPay source';
          reject(new Error(errorMsg));
        }
      });
    });
  }

  /**
   * Validate cardholder name
   */
  private validateCardholderName(name: string): string | null {
    if (!name || name.trim() === '') {
      return 'Cardholder name is required';
    }
    return null;
  }

  /**
   * Validate card number
   */
  private validateCardNumber(number: string): string | null {
    if (!number || number.trim() === '') {
      return 'Card number is required';
    }
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return 'Invalid card number length';
    }
    if (!/^\d+$/.test(cleanNumber)) {
      return 'Card number must contain only digits';
    }
    return null;
  }

  /**
   * Validate expiration month
   */
  private validateExpirationMonth(month: string): string | null {
    if (!month || month.trim() === '') {
      return 'Expiration month is required';
    }
    const monthNum = Number.parseInt(month);
    if (Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return 'Invalid expiration month';
    }
    return null;
  }

  /**
   * Validate expiration year
   */
  private validateExpirationYear(year: string): string | null {
    if (!year || year.trim() === '') {
      return 'Expiration year is required';
    }
    const yearNum = Number.parseInt(year);
    const currentYear = new Date().getFullYear();
    if (Number.isNaN(yearNum) || yearNum < currentYear) {
      return 'Invalid expiration year';
    }
    return null;
  }

  /**
   * Validate security code (CVV)
   */
  private validateSecurityCode(cvv: string): string | null {
    if (!cvv || cvv.trim() === '') {
      return 'Security code (CVV) is required';
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      return 'Security code must be 3 or 4 digits';
    }
    return null;
  }

  /**
   * Validate card data before creating token
   */
  validateCardData(cardData: OmiseCardData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const nameError = this.validateCardholderName(cardData.name);
    if (nameError) errors.push(nameError);

    const numberError = this.validateCardNumber(cardData.number);
    if (numberError) errors.push(numberError);

    const monthError = this.validateExpirationMonth(cardData.expiration_month);
    if (monthError) errors.push(monthError);

    const yearError = this.validateExpirationYear(cardData.expiration_year);
    if (yearError) errors.push(yearError);

    const cvvError = this.validateSecurityCode(cardData.security_code);
    if (cvvError) errors.push(cvvError);

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
    return globalThis.window !== undefined && !!globalThis.window?.Omise && this.isInitialized;
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
