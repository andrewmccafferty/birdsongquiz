const MAILER_SEND_URL = "https://api.mailersend.com/v1/email"

export interface SendEmailRequest {
  from: {
    email: string
    name?: string
  }
  to: {
    email: string
    name?: string
  }[]
  subject: string
  text?: string
  html?: string
}

export const sendEmail = async (
  sendEmailRequest: SendEmailRequest
): Promise<void> => {
  const apiKey = process.env.MAILER_SEND_API_KEY
  if (!apiKey) {
    throw new Error("MAILER_SEND_API_KEY environment variable is not set.")
  }

  const response = await fetch(MAILER_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendEmailRequest),
  })

  if (!response.ok) {
    const data = await response.text()
    throw new Error(
      `Failed to send email: status code ${response.status}, response body ${data}`
    )
  }
}
