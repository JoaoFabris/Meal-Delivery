// Em desenvolvimento (sem RESEND_API_KEY), loga o link no terminal.

interface SendResetEmailParams {
    to: string
    resetUrl: string
  }
  
  export async function sendPasswordResetEmail({ to, resetUrl }: SendResetEmailParams) {
    // ── Mock para desenvolvimento ──────────────────────────
    if (!process.env.RESEND_API_KEY) {
      console.log('\n========================================')
      console.log('📧 [DEV] E-mail de recuperação de senha')
      console.log(`   Para: ${to}`)
      console.log(`   Link: ${resetUrl}`)
      console.log('   (Configure RESEND_API_KEY para enviar de verdade)')
      console.log('========================================\n')
      return { success: true, mock: true }
    }
  
    // ── Envio real com Resend ──────────────────────────────
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
  
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'FoodApp <noreply@foodapp.com>',
      to,
      subject: 'Recuperação de senha — FoodApp',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #e85d04; margin-bottom: 8px;">Recuperação de senha</h2>
          <p style="color: #444; margin-bottom: 24px;">
            Recebemos uma solicitação para redefinir a senha da sua conta no FoodApp.
            Clique no botão abaixo para criar uma nova senha:
          </p>
          <a
            href="${resetUrl}"
            style="display: inline-block; background: #e85d04; color: white; padding: 12px 24px;
                   border-radius: 8px; text-decoration: none; font-weight: bold;"
          >
            Redefinir senha
          </a>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Este link expira em 1 hora. Se você não solicitou a recuperação, ignore este e-mail.
          </p>
          <p style="color: #bbb; font-size: 11px;">
            Ou copie e cole este link no navegador:<br/>
            <span style="color: #e85d04;">${resetUrl}</span>
          </p>
        </div>
      `,
    })
  
    if (error) {
      console.error('[EMAIL ERROR]', error)
      throw new Error('Falha ao enviar e-mail.')
    }
  
    return { success: true, mock: false }
  }