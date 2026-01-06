import { sendEmail } from "./email"
import { FeedbackRequest } from "./model/feedback"

const sendFeedbackEmail = async (feedbackRequest: FeedbackRequest) => {
  if (!process.env.SHOULD_SEND_FEEDBACK_EMAILS) {
    console.log(
      "SHOULD_SEND_FEEDBACK_EMAILS not set, so not sending email",
      feedbackRequest
    )
    return
  }
  const messageText = `From ${feedbackRequest.fromName}(<a href="mailto:${feedbackRequest.fromEmail}">${feedbackRequest.fromEmail}</a>): ${feedbackRequest.message}`
  await sendEmail({
    from: {
      email: process.env.NOTIFICATIONS_FROM_EMAIL_ADDRESS as string,
      name: "Birdsong Quiz website",
    },
    to: [
      {
        email: process.env.NOTIFICATIONS_TO_EMAIL_ADDRESS as string,
        name: "Birdsong Quiz admin",
      },
    ],
    subject: "Feedback sent from birdsongquiz.co.uk",
    text: messageText,
    html: messageText,
  })
}

export { sendFeedbackEmail }
