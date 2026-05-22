import "server-only";

/**
 * Envio de e-mails transacionais via API do Brevo (https://api.brevo.com).
 *
 * Requer as variáveis de ambiente:
 * - BREVO_API_KEY      — chave da API (somente server-side)
 * - BREVO_SENDER_EMAIL — e-mail remetente, verificado no painel do Brevo
 * - BREVO_SENDER_NAME  — nome exibido do remetente (opcional)
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export type SendEmailParams = {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  textContent?: string;
};

/** Dispara um e-mail transacional. Lança erro caso o Brevo recuse a requisição. */
export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: SendEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey) {
    throw new Error("BREVO_API_KEY não configurada.");
  }
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL não configurada.");
  }

  const response = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: process.env.BREVO_SENDER_NAME ?? "FinanceAll",
      },
      to: [to.name ? { email: to.email, name: to.name } : { email: to.email }],
      subject,
      htmlContent,
      ...(textContent ? { textContent } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Brevo retornou ${response.status} ao enviar e-mail. ${detail}`.trim(),
    );
  }
}
