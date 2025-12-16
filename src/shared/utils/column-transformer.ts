import { ValueTransformer } from 'typeorm';

export class DecimalColumnToNumberTransformer implements ValueTransformer {
  /**
   * Converts a string to a number
   * @param {string} value - The string value
   * @returns {number} The number value
   */
  to(value: string): number {
    return value ? parseFloat(value) : 0;
  }

  /**
   * Converts a string to a number
   * @param {string} value - The string value
   * @returns {number} The number value
   */
  from(value: string): number {
    return value ? parseFloat(value) : 0;
  }
}
