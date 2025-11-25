import {computed, Injectable, signal} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PasswordGeneratorService {
// --- Configuration Signals ---
  length = signal(16);
  count = signal(1);
  uppercase = signal(true);
  lowercase = signal(true);
  numbers = signal(true);
  symbolsEnabled = signal(true);
  symbols = signal('!@#$%^&*()_+~`|}{[]:;?><,./-=');
  omit = signal('');
  uniqueChars = signal(true);

  // --- State Signal ---
  passwords = signal<{value: string, bits: number, strength: string}[]>([]);

  // --- Computed Signals ---

  charsets = computed(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const syms = this.symbols();

    let allowedChars = new Set<string>();

    const charSetOptions = [
      { enabled: this.uppercase(), chars: upper },
      { enabled: this.lowercase(), chars: lower },
      { enabled: this.numbers(), chars: nums },
      { enabled: this.symbolsEnabled(), chars: syms }
    ];

    for (const option of charSetOptions) {
      if (option.enabled) {
        for (const char of option.chars) {
          allowedChars.add(char);
        }
      }
    }

    for (const char of this.omit()) {
      allowedChars.delete(char);
    }
    return Array.from(allowedChars);
  });

  isGenerationPossible = computed(() => {
    const charset = this.charsets();
    const len = this.length();
    if (len <= 0) return false;
    // If unique characters are required, length cannot be greater than the number of available characters.
    if (this.uniqueChars() && len > charset.length) {
      return false;
    }
    return charset.length > 0;
  });

  // --- Public Methods ---
  incrementLength() { this.length.update(l => l + 1); }
  decrementLength() { this.length.update(l => Math.max(1, l - 1)); }
  incrementCount() { this.count.update(c => c + 1); }
  decrementCount() { this.count.update(c => Math.max(1, c - 1)); }

  /**
   * Calculates the bits and strength of a given password.
   * @param password The password to analyze.
   * @returns An object with the bits and strength.
   */
  private calculatePasswordStrength(password: string): { bits: number, strength: string } {
    let bits = 0;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';

    for (const char of password) {
      if (upper.includes(char) || lower.includes(char)) {
        bits += 4;
      } else if (nums.includes(char)) {
        bits += 3;
      } else {
        bits += 1;
      }
    }

    let strength = 'Weak';
    if (bits >= 100) {
      strength = 'Ultra Strong';
    } else if (bits >= 80) {
      strength = 'Very Strong';
    } else if (bits >= 60) {
      strength = 'Strong';
    } else if (bits >= 40) {
      strength = 'Medium';
    }

    return { bits, strength };
  }

  /**
   * Generates a list of passwords based on the current settings.
   * Now supports generating passwords with unique characters.
   */
  generatePasswords() {
    if (!this.isGenerationPossible()) {
      this.passwords.set([]);
      return;
    }

    const newPasswords: {value: string, bits: number, strength: string}[] = [];
    const crypto = window.crypto;
    const useUnique = this.uniqueChars();
    const len = this.length();

    for (let i = 0; i < this.count(); i++) {
      let passwordValue = '';
      let currentCharset = [...this.charsets()];

      if (useUnique) {
        for (let j = currentCharset.length - 1; j > 0; j--) {
          const randomValues = new Uint32Array(1);
          crypto.getRandomValues(randomValues);
          const k = randomValues[0] % (j + 1);
          [currentCharset[j], currentCharset[k]] = [currentCharset[k], currentCharset[j]]; // ES6 swap
        }
        passwordValue = currentCharset.slice(0, len).join('');
      } else {
        const randomValues = new Uint32Array(len);
        crypto.getRandomValues(randomValues);
        for (let j = 0; j < len; j++) {
          passwordValue += currentCharset[randomValues[j] % currentCharset.length];
        }
      }
      const { bits, strength } = this.calculatePasswordStrength(passwordValue);
      newPasswords.push({ value: passwordValue, bits, strength });
    }
    this.passwords.set(newPasswords);
  }

  restoreDefaultSymbols() {
    this.symbols.set('!@#$%^&*()_+~`|}{[]:;?><,./-=');
  }

  /**
   * Resets all password generation settings to their default values.
   */
  resetSettings() {
    this.length.set(16);
    this.count.set(1);
    this.uppercase.set(true);
    this.lowercase.set(true);
    this.numbers.set(true);
    this.symbolsEnabled.set(true);
    this.symbols.set('!@#$%^&*()_+~`|}{[]:;?><,./-=');
    this.omit.set('');
    this.uniqueChars.set(true);
    this.passwords.set([]);
  }
}
