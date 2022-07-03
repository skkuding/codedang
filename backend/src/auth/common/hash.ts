import * as argon2 from 'argon2'

export async function encrypt(plain: string): Promise<string> {
  return await argon2.hash(plain)
}

export async function validate(hash: string, plain: string): Promise<boolean> {
  return await argon2.verify(hash, plain)
}
