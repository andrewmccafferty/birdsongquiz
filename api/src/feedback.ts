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

  await sendEmail({
    from: {
      email: feedbackRequest.fromEmail,
      name: feedbackRequest.fromName,
    },
    to: [
      {
        email: process.env.NOTIFICATIONS_TO_EMAIL_ADDRESS as string,
        name: "Birdsong Quiz admin",
      },
    ],
    subject: "Feedback sent from birdsongquiz.co.uk",
    text: feedbackRequest.message,
    html: feedbackRequest.message,
  })
}

export { sendFeedbackEmail }
