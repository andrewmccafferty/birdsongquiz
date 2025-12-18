import { listFilesForPrefix, getObjectFromS3AsString } from "./s3_utils"
import { PresetListNameDetails } from "./model/species_lists"

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

const loadSpeciesListForRegion = async (
  region: string
): Promise<unknown[] | null> => {
  return loadSpeciesListFromS3Key(`countries/${region}.json`)
}

const loadSpeciesListById = async (
  listId: string
): Promise<unknown[] | null> => {
  return loadSpeciesListFromS3Key(`presets/${listId}.json`)
}

const getSpeciesPresetListsForRegion = async (
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

export {
  loadSpeciesListForRegion,
  loadSpeciesListById,
  getSpeciesPresetListsForRegion,
}
