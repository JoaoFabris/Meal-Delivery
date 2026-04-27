import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/middleware/errorHandler'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { z } from 'zod'

const schema = z.object({
  token: z.string().min(1, 'Token obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = schema.parse(body)

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) throw new NotFoundError('Token de recuperação')
    if (resetToken.used) throw new ValidationError('Este link já foi utilizado.')
    if (resetToken.expiresAt < new Date()) throw new ValidationError('Este link expirou. Solicite um novo.')

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      message: 'Senha redefinida com sucesso. Faça login com sua nova senha.',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
