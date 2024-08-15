import { jwtDecode } from 'jwt-decode'

/**
 * Get the expiration date of a JWT token
 * @param {string} token - The JWT token
 * @returns {number} The expiration numeric date of the JWT token
 * @throws {Error} If the token does not contain an expiration date
 * @example
 * const token = 'eyJ...'; // JWT token
 * const expireDate = getJWTExpire(token);
 * console.log(expireDate); // 1631536823000
 */

export const getJWTExpire = (token: string): number => {
  const decoded = jwtDecode(token)

  if (decoded.exp == null) {
    throw new Error('Token does not contain an expiration date')
  }

  return decoded.exp * 1000
}
