/** Conteúdo dos e-mails transacionais enviados pela aplicação. */

export type EmailContent = {
  subject: string;
  htmlContent: string;
  textContent: string;
};

/** E-mail com o link de redefinição de senha. */
export function passwordResetEmail(resetUrl: string): EmailContent {
  const subject = "Redefinição de senha — FinanceAll";

  const htmlContent = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#1b1320;padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;">FinanceAll</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;font-size:20px;color:#1f1124;">Redefinição de senha</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#3f3346;">
                  Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                </p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td style="border-radius:8px;background-color:#ef318e;">
                      <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">
                        Redefinir senha
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#6b6172;">
                  Se o botão não funcionar, copie e cole o endereço abaixo no navegador:
                </p>
                <p style="margin:0 0 16px;font-size:13px;line-height:1.6;word-break:break-all;">
                  <a href="${resetUrl}" style="color:#ef318e;">${resetUrl}</a>
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6b6172;">
                  O link expira em 1 hora. Se você não solicitou esta alteração, ignore este e-mail — sua senha continuará a mesma.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#9b93a3;">© FinanceAll</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textContent = `Redefinição de senha — FinanceAll

Recebemos um pedido para redefinir a senha da sua conta.
Acesse o link abaixo para criar uma nova senha:

${resetUrl}

O link expira em 1 hora. Se você não solicitou esta alteração, ignore este e-mail.`;

  return { subject, htmlContent, textContent };
}

/** E-mail notificando o cliente sobre mudança de estágio do projeto. */
export function stageChangeEmail(
  clienteNome: string,
  novoEstagio: string,
  projetoUrl: string,
): EmailContent {
  const subject = `Seu projeto avançou para: ${novoEstagio} — FinanceAll`;

  const htmlContent = `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background-color:#1b1320;padding:24px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:bold;">FinanceAll</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 8px;font-size:20px;color:#1f1124;">Atualização do seu projeto</h1>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3346;">
                  Olá, <strong>${clienteNome}</strong>! Seu projeto avançou para um novo estágio.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background-color:#f4f4f5;border-radius:8px;padding:16px 20px;text-align:center;">
                      <p style="margin:0 0 4px;font-size:12px;color:#6b6172;text-transform:uppercase;letter-spacing:.05em;">Estágio atual</p>
                      <p style="margin:0;font-size:18px;font-weight:bold;color:#1b1320;">${novoEstagio}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3346;">
                  Nossa equipe está trabalhando para concluir cada etapa com cuidado. Em caso de dúvidas, entre em contato conosco.
                </p>
                ${projetoUrl ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
                  <tr>
                    <td style="border-radius:8px;background-color:#ef318e;">
                      <a href="${projetoUrl}" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">
                        Ver projeto
                      </a>
                    </td>
                  </tr>
                </table>` : ""}
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#9b93a3;">© FinanceAll</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textContent = `Atualização do seu projeto — FinanceAll

Olá, ${clienteNome}! Seu projeto avançou para um novo estágio.

Estágio atual: ${novoEstagio}

Nossa equipe está trabalhando para concluir cada etapa com cuidado.
${projetoUrl ? `\nVer projeto: ${projetoUrl}` : ""}`;

  return { subject, htmlContent, textContent };
}
