import crypto from 'crypto'
import { prisma } from './prisma'

export function generateTwoFactorSecret(): string {
  return crypto.randomBytes(20).toString('hex')
}

export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

export function generateTempToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function enableTwoFactor(userId: string): Promise<{
  secret: string
  backupCodes: string[]
}> {
  const secret = generateTwoFactorSecret()
  const backupCodes = generateBackupCodes()

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      backupCodes: backupCodes
    }
  })

  return { secret, backupCodes }
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: []
    }
  })
}

export async function verifyTwoFactorCode(
  userId: string,
  code: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      twoFactorSecret: true,
      backupCodes: true
    }
  })

  if (!user?.twoFactorSecret) {
    return false
  }

  // Check if it's a backup code
  if (user.backupCodes.includes(code)) {
    // Remove the used backup code
    await prisma.user.update({
      where: { id: userId },
      data: {
        backupCodes: user.backupCodes.filter(c => c !== code)
      }
    })
    return true
  }

  // For simplicity, we'll use a basic time-based verification
  // In production, you'd want to use a proper TOTP library like 'otplib'
  const timeWindow = Math.floor(Date.now() / 30000) // 30-second windows
  const expectedCode = generateTOTP(user.twoFactorSecret, timeWindow)
  
  return code === expectedCode
}

function generateTOTP(secret: string, timeWindow: number): string {
  // Simplified TOTP generation - in production use a proper TOTP library
  const hmac = crypto.createHmac('sha1', secret)
  hmac.update(timeWindow.toString())
  const digest = hmac.digest()
  
  const offset = digest[digest.length - 1] & 0x0f
  const code = 
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)
  
  return (code % 1000000).toString().padStart(6, '0')
}

export async function createTempToken(userId: string): Promise<string> {
  const token = generateTempToken()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // In a real implementation, you'd store this in a separate table or Redis
  // For now, we'll store it in the user's record (this is not ideal for production)
  await prisma.user.update({
    where: { id: userId },
    data: {
      // You might want to add a tempToken field to the schema
      // For now, we'll use the twoFactorSecret field temporarily
      twoFactorSecret: token
    }
  })

  return token
}

export async function verifyTempToken(token: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      twoFactorSecret: token
    }
  })

  if (!user) {
    return null
  }

  // Clear the temp token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: null
    }
  })

  return user.id
}
