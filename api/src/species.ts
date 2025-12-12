import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import {
  listFilesForPrefix,
  s3KeyExists,
  getObjectFromS3AsString,
} from "./s3_utils"
import { randomUUID } from "crypto"
import {
  PresetListNameDetails,
  PresetListSuggestion,
} from "./model/species_lists"

const REGION = "eu-west-2"

const deleteObjectFromS3 = async (bucketName: string, s3Key: string) => {
  const s3Client = new S3Client({ region: REGION })
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
  )
}

const loadSpeciesListFromS3Key = async (
  s3Key: string
): Promise<unknown[] | null> => {
  console.log("Loading species list from S3 key...", s3Key)
  const speciesData = await getObjectFromS3AsString(
    process.env.SPECIES_LIST_BUCKET_NAME as string,
    s3Key
  )
  if (!speciesData) {
    return null
  }

  const species_list = JSON.parse(speciesData)
  return species_list
}

export const loadSpeciesListForRegion = async (
  region: string
): Promise<unknown[] | null> => {
  return loadSpeciesListFromS3Key(`countries/${region}.json`)
}

export const loadSpeciesListById = async (
  listId: string
): Promise<unknown[] | null> => {
  return loadSpeciesListFromS3Key(`presets/${listId}.json`)
}

export const getSpeciesPresetListsForRegion = async (
  region: string
): Promise<PresetListNameDetails[]> => {
  const files = await listFilesForPrefix(
    process.env.SPECIES_LIST_BUCKET_NAME as string,
    `presets/${region}/`.toLowerCase()
  )
  const mapped = files
    .filter((file) => file.indexOf(".json") > 0)
    .map((path) => {
      const filename = path.split("/").pop()!.replace(".json", "")
      const name = filename
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      return {
        id: `${region.toLowerCase()}/${filename}`,
        name,
      }
    })
  return mapped
}

const suggestionS3Key = (suggestionId: string) =>
  `suggestions/${suggestionId}.json`

export const storeSuggestedSpeciesList = async (
  presetListData: unknown
): Promise<string> => {
  const s3Client = new S3Client({ region: REGION })
  const suggestionId = randomUUID()
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.SPECIES_LIST_BUCKET_NAME as string,
      Key: suggestionS3Key(suggestionId),
      Body: JSON.stringify(presetListData),
    })
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

const updatePresetListVersionToCurrentTimestamp = async () => {
  const s3Client = new S3Client({ region: REGION })
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.FRONTEND_BUCKET_NAME as string,
      Key: "frontend-configuration.json",
      Body: JSON.stringify({
        presetsVersion: `${Date.now()}`,
      }),
    })
  )
}

const mapListNameToFileKey = (listName: string) => {
  return listName.split(" ").join("-").toLowerCase()
}

export const approveSuggestedSpeciesList = async (
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
  const s3Client = new S3Client({ region: REGION })
  const presetListData = suggestion.speciesList
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.SPECIES_LIST_BUCKET_NAME as string,
      Key: s3Key,
      Body: JSON.stringify(presetListData),
    })
  )

  await deleteSuggestion(suggestionId)
  await updatePresetListVersionToCurrentTimestamp()

  return s3Key
}
