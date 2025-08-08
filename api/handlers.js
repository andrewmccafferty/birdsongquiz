import { getRandomRecordingForSpecies } from './recording.js';
import { loadSpeciesListById, loadSpeciesListForRegion } from './species.js';

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
    const species_list = await loadSpeciesListById(listId);
    if (!species_list) {
      return response(404, {"message": "No species list found for given id"});
    }
    return response(200, {"species": species_list }, true)
  }

  return response(400, {"message": "Must supply either 'region' or 'listId' parameters"})
}