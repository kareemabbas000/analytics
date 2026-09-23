import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '' // Must be 32 chars
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) throw new Error('Encryption key is not configured.')
  if (ENCRYPTION_KEY.length !== 32) throw new Error('Encryption key must be 32 characters long.')
  
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag().toString('hex')
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  if (!ENCRYPTION_KEY) throw new Error('Encryption key is not configured.')
  
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
  if (!ivHex || !authTagHex || !encrypted) throw new Error('Invalid encrypted text format.')
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
