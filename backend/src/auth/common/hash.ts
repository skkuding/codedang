import * as argon2 from 'argon2'

export class Hash {
  async decryptPassword(password: string): Promise<string> {
    return await argon2.hash(password)
  }
  async validatePassword(
    hashedPassword: string,
    password: string
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password)
  }
}
