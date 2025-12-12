import { getObjectFromS3AsString } from "./s3_utils"
import { sendEmail } from "./email"

export const sendEmailWithSuggestionData = async (
  bucketName: string,
  suggestionS3Key: string
) => {
  console.log(
    "Retrieving suggestion for bucketName, suggestionS3Key",
    bucketName,
    suggestionS3Key
  )
  const suggestionRawData = await getObjectFromS3AsString(
    bucketName,
    suggestionS3Key
  )
  console.log("Suggestion retrieved, sending email")
  if (!process.env.SHOULD_SEND_SUGGESTION_NOTIFICATION_EMAILS) {
    console.log(
      "Not sending notification email because SHOULD_SEND_SUGGESTION_NOTIFICATION_EMAILS flag is not set."
    )
    return
  }
  await sendEmail({
    from: {
      email: process.env.NOTIFICATIONS_FROM_EMAIL_ADDRESS as string,
      name: "Website visitor",
    },
    to: [
      {
        email: process.env.NOTIFICATIONS_TO_EMAIL_ADDRESS as string,
        name: "Me",
      },
    ],
    subject: "New preset list suggestion",
    text: `Somebody has suggested the list ${suggestionRawData}`,
    html: `Somebody has suggested the list ${suggestionRawData}`,
  })
  console.log("Email sent")
}
