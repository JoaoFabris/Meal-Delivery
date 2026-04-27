import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/middleware/errorHandler'
import { sendPasswordResetEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const genericResponse = NextResponse.json({
      message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.',
    })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return genericResponse
    if (!user.password) return genericResponse

    await prisma.passwordResetToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60)

    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    await sendPasswordResetEmail({ to: email, resetUrl })

    return genericResponse
  } catch (error) {
    return handleApiError(error)
  }
}
