import { getRandomRecordingForSpecies } from './recording.js';
import { loadSpeciesListById, loadSpeciesListForRegion, getSpeciesPresetListsForRegion, storeSuggestedSpeciesList, approveSuggestedSpeciesList } from './species.js';

const response = (statusCode, responseBody, addCacheHeader = false) => {
  const headers = {
    'Content-Type': 'application/json',
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
  };
  if (addCacheHeader) {
    // Cache for the maximum time allowed, which is one year
    headers["Cache-Control"] = "public, max-age=31536000";
  }
  return {
    statusCode,
    headers,
    body: JSON.stringify(responseBody),
  };
};

export const getRecording = async (event) => {
  console.log('Event: ', event);
  const species = event.queryStringParameters ? event.queryStringParameters["species"] : null;
  const soundType = event.queryStringParameters ? event.queryStringParameters["soundType"] : null;
  console.log(`Calling getRandomRecordingForSpecies with species: ${species}, soundType: ${soundType}`);
  try {
    const recording = await getRandomRecordingForSpecies(species, soundType);
    console.log("Got recording: ", recording);
    return response(200, recording);
  } catch (error) {
    console.error("Error getting recording: ", error);
    return response(500, { "message": "Error getting recording" });
  }
}

export const getSpeciesList = async (event) => {
  console.log("Event:", event);
  const region = event.queryStringParameters["region"];
  const listId = event.queryStringParameters["listId"];
  if (region) {
    const species_list = await loadSpeciesListForRegion(region);
    if (!species_list) {
      return response(404, {"message": "No species list found for region"});
    }
    return response(200, {"species": species_list }, true)
  }

  if (listId) {
    const species_list = await loadSpeciesListById(listId.toLowerCase());
    if (!species_list) {
      return response(404, {"message": "No species list found for given id"});
    }
    return response(200, {"species": species_list }, true)
  }

  return response(400, {"message": "Must supply either 'region' or 'listId' parameters"})
}

export const getSpeciesPresetLists = async (event) => {
  console.log("Entering preset lists handler with event", event);
  const region = event.pathParameters?.region;

  if (!region) {
    return response(400, {"message": "Missing required path parameter 'region'"});
  }
  console.log("Loading preset lists with region", region);
  return response(200, {"presets": await getSpeciesPresetListsForRegion(region) }, true);
}

export const suggestPresetList = async (event) => {
  const body = event.body;
  const presetListData = JSON.parse(body);
  const region = presetListData.region;
  const listName = presetListData.listName;
  const speciesList = presetListData.speciesList;
  if (!listName || listName.length === 0) {
    return response(400, {"message": "Missing listName property from request body"})
  }
  if (!region || region.length === 0) {
    return response(400, {"message": "Missing region property from request body"})
  }
  if (!speciesList || speciesList.length < 2) {
    return response(400, {"message": "Species list not found in speciesList, or has fewer than 2 species"})
  }

  const suggestionId = await storeSuggestedSpeciesList(presetListData);
  return response(200, {
    "suggestionId": suggestionId
  })
}

export const approvePresetList = async (event) => {
  console.log("Handling approval event", event)
  const body = event.body;
  const listData = JSON.parse(body);
  if (!listData.suggestionId) {
    throw new Error("suggestionId property not set in event body")
  }

  const listPath = await approveSuggestedSpeciesList(listData.suggestionId)
  return { listPath }
}