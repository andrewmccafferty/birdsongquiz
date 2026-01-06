import { getRandomRecordingForSpecies } from "./recording"
import {
  loadSpeciesListById,
  loadSpeciesListForRegion,
  getSpeciesPresetListsForRegion,
} from "./species"
import {
  storeSuggestedSpeciesList,
  approveSuggestedSpeciesList,
} from "./preset_suggestions"
import { sendEmailWithSuggestionData } from "./preset_suggestions"
import { APIGatewayEvent, APIGatewayProxyResult, S3Event } from "aws-lambda"
import { FeedbackRequest, isFeedbackRequest } from "./model/feedback"
import { sendFeedbackEmail } from "./feedback"
import { validateTurnstile } from "./cloudflare_turnstile"

const response = (
  statusCode: number,
  responseBody: unknown,
  addCacheHeader = false
): APIGatewayProxyResult => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  }
  if (addCacheHeader) {
    // Cache for the maximum time allowed, which is one year
    headers["Cache-Control"] = "public, max-age=31536000"
  }
  return {
    statusCode,
    headers,
    body: responseBody ? JSON.stringify(responseBody) : "",
  }
}

const getRecording = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Event: ", event)
  const species = event.queryStringParameters
    ? (event.queryStringParameters["species"] ?? null)
    : null
  if (!species) {
    return response(400, {
      message: "No species query string parameter provided",
    })
  }

  const soundType = event.queryStringParameters
    ? (event.queryStringParameters["soundType"] ?? null)
    : null
  console.log(
    `Calling getRandomRecordingForSpecies with species: ${species}, soundType: ${soundType}`
  )
  try {
    const recording = await getRandomRecordingForSpecies(species, soundType)
    console.log("Got recording: ", recording)
    return response(200, recording)
  } catch (error) {
    console.error("Error getting recording: ", error)
    return response(500, { message: "Error getting recording" })
  }
}

const getSpeciesList = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Event:", event)
  const region = event.queryStringParameters?.["region"]
  const listId = event.queryStringParameters?.["listId"]
  if (region) {
    const species_list = await loadSpeciesListForRegion(region)
    if (!species_list) {
      return response(404, { message: "No species list found for region" })
    }
    return response(200, { species: species_list }, true)
  }

  if (listId) {
    const species_list = await loadSpeciesListById(listId.toLowerCase())
    if (!species_list) {
      return response(404, { message: "No species list found for given id" })
    }
    return response(200, { species: species_list }, true)
  }

  return response(400, {
    message: "Must supply either 'region' or 'listId' parameters",
  })
}

const getSpeciesPresetLists = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Entering preset lists handler with event", event)
  const region = event.pathParameters?.region

  if (!region) {
    return response(400, {
      message: "Missing required path parameter 'region'",
    })
  }
  console.log("Loading preset lists with region", region)
  return response(
    200,
    { presets: await getSpeciesPresetListsForRegion(region) },
    true
  )
}

const suggestPresetList = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const body = event.body
  const presetListData = body ? JSON.parse(body) : {}
  const region = presetListData.region
  const listName = presetListData.listName
  const speciesList = presetListData.speciesList
  if (!listName || listName.length === 0) {
    return response(400, {
      message: "Missing listName property from request body",
    })
  }
  if (!region || region.length === 0) {
    return response(400, {
      message: "Missing region property from request body",
    })
  }
  if (!speciesList || speciesList.length < 2) {
    return response(400, {
      message:
        "Species list not found in speciesList, or has fewer than 2 species",
    })
  }

  const suggestionId = await storeSuggestedSpeciesList(presetListData)
  return response(200, {
    suggestionId,
  })
}

const approvePresetList = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Entering approve preset list handler with event", event)
  const suggestionId = event.pathParameters?.suggestionId
  const approvalId = event.queryStringParameters?.approvalId

  if (!suggestionId) {
    return response(400, {
      message: "Missing required path parameter 'suggestionId'",
    })
  }

  if (!approvalId) {
    return response(400, {
      message: "Missing required query parameter 'approvalId'",
    })
  }

  const listPath = await approveSuggestedSpeciesList(suggestionId, approvalId)
  if (!listPath) {
    return response(403, { message: "access denied" })
  }
  return response(200, { listPath })
}

const notifyPresetListSuggested = async (event: S3Event) => {
  const record = event.Records[0]
  const bucket = record.s3.bucket.name
  const key = record.s3.object.key
  console.log("Handling event with bucket and key", bucket, key)
  await sendEmailWithSuggestionData(bucket, key)
}

const mapToFeedbackRequest = (
  event: APIGatewayEvent
): FeedbackRequest | null => {
  const body = event.body
  const feedbackRequestBody = body ? JSON.parse(body) : {}
  if (!isFeedbackRequest(feedbackRequestBody)) {
    return null
  }

  return feedbackRequestBody as FeedbackRequest
}

const getRequestIpAddress = (event: APIGatewayEvent): string => {
  return event.headers?.["X-Forwarded-For"] ?? "unknown"
}

const sendFeedback = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Checking feedback request", event)
  const feedbackRequest = mapToFeedbackRequest(event)
  if (!feedbackRequest) {
    return response(400, { message: "Invalid feedback request" })
  }
  if (
    !(await validateTurnstile(
      feedbackRequest.turnstileToken,
      getRequestIpAddress(event)
    ))
  ) {
    return response(400, "Invalid Cloudflare token")
  }
  await sendFeedbackEmail(feedbackRequest)
  return response(204, null)
}

export {
  getRecording,
  getSpeciesList,
  getSpeciesPresetLists,
  suggestPresetList,
  approvePresetList,
  notifyPresetListSuggested,
  sendFeedback,
}
