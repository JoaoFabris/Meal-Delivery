import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

export function isAdmin(email?: string | null): boolean {
  if (!email) return false
  return adminEmails.includes(email.toLowerCase())
}

// Schema de validação das credenciais
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // ── OAuth ────────────────────────────────────────────
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),

    // ── E-mail + Senha (JWT) ──────────────────────────────
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null
      
        const { email, password } = parsed.data
      
        // Seleciona password explicitamente (campo opcional no schema)
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            password: true, // necessário selecionar explicitamente
          },
        })
      
        if (!user) return null
        if (!user.password) return null
      
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null
      
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Persiste role e isAdmin no token na primeira autenticação
      if (user) {
        token.role = (user as { role?: string }).role ?? 'USER'
      }
      token.isAdmin = isAdmin(token.email)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.isAdmin = token.isAdmin as boolean
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt', // necessário para CredentialsProvider
  },
})