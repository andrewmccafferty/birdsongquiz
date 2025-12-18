import { randomUUID } from "crypto"
import { sendEmail } from "./email"
import { PresetListSuggestion } from "./model/species_lists"
import {
  deleteObjectFromS3,
  getObjectFromS3AsString,
  putObjectToS3,
  s3KeyExists,
} from "./s3_utils"

const updatePresetListVersionToCurrentTimestamp = async () => {
  putObjectToS3(
    {
      presetsVersion: `${Date.now()}`,
    },
    process.env.FRONTEND_BUCKET_NAME as string,
    "frontend-configuration.json"
  )
}

const mapListNameToFileKey = (listName: string) => {
  return listName.split(" ").join("-").toLowerCase()
}

const suggestionS3Key = (suggestionId: string) =>
  `suggestions/${suggestionId}.json`

const storeSuggestedSpeciesList = async (
  presetListData: object
): Promise<string> => {
  const suggestionId = randomUUID()
  await putObjectToS3(
    presetListData,
    process.env.SPECIES_LIST_BUCKET_NAME as string,
    suggestionS3Key(suggestionId)
  )
  return suggestionId
}

const loadSuggestion = async (
  suggestionId: string
): Promise<PresetListSuggestion> => {
  const suggestionRawData = await getObjectFromS3AsString(
    process.env.SPECIES_LIST_BUCKET_NAME as string,
    suggestionS3Key(suggestionId)
  )
  return JSON.parse(suggestionRawData)
}

const deleteSuggestion = async (suggestionId: string) => {
  await deleteObjectFromS3(
    process.env.SPECIES_LIST_BUCKET_NAME as string,
    suggestionS3Key(suggestionId)
  )
}

const approveSuggestedSpeciesList = async (
  suggestionId: string
): Promise<string> => {
  const suggestion = await loadSuggestion(suggestionId)
  console.log("Loaded suggestion", suggestion)
  const region = suggestion.region
  const s3Key = `presets/${region.toLowerCase()}/${mapListNameToFileKey(
    suggestion.listName
  )}.json`
  if (
    await s3KeyExists(process.env.SPECIES_LIST_BUCKET_NAME as string, s3Key)
  ) {
    throw new Error(`Preset already exists with the key ${s3Key}`)
  }

  await putObjectToS3(
    suggestion.speciesList,
    process.env.SPECIES_LIST_BUCKET_NAME as string,
    s3Key
  )

  await deleteSuggestion(suggestionId)
  await updatePresetListVersionToCurrentTimestamp()

  return s3Key
}

const sendEmailWithSuggestionData = async (
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
    <p><strong>Region:</strong> ${suggestion.region}</p>
    <p><strong>List Name:</strong> ${suggestion.name}</p>
    <p><strong>Suggestion ID</strong>: ${suggestion.suggestionId}</p>
    <p><strong>Species:</strong></p>
    <ul>
      ${suggestion.speciesList?.map((s) => `<li>${s.Species}</li>`).join("") || "<li>None</li>"}
    </ul>
    <p><strong>Submitted by:</strong> ${suggestion.name || "Anonymous"}</p>
    <p><strong>Email:</strong> ${suggestion.email || "Not provided"}</p>
    <p><strong>Comments:</strong> ${suggestion.comments || "None provided"}</p>
    `,
  })
  console.log("Email sent")
}

export {
  approveSuggestedSpeciesList,
  sendEmailWithSuggestionData,
  storeSuggestedSpeciesList,
}
