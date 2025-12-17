import { sendEmail } from "./email"
import { PresetListSuggestion } from "./model/species_lists"
import { getObjectFromS3AsString } from "./s3_utils"

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
  const suggestion = JSON.parse(suggestionRawData) as PresetListSuggestion
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
      name: suggestion.name || "Anonymous website visitor",
    },
    to: [
      {
        email: process.env.NOTIFICATIONS_TO_EMAIL_ADDRESS as string,
        name: "Me",
      },
    ],
    subject: "New preset list suggestion",
    text: `Somebody has suggested the list ${suggestionRawData}`,
    html: `<h2>New Preset List Suggestion</h2>
    <p><strong>List Name:</strong> ${suggestion.name}</p>
    <p><strong>Suggestion ID</strong>: ${suggestion.suggestionId}</p>
    <p><strong>Species:</strong></p>
    <ul>
      ${suggestion.speciesList?.map((s) => `<li>${s.Species}</li>`).join("") || "<li>None</li>"}
    </ul>
    <p><strong>Submitted by:</strong> ${suggestion.name || "Anonymous"}</p>
    <p><strong>Email:</strong> ${suggestion.email || "Not provided"}</p>
    `,
  })
  console.log("Email sent")
}
