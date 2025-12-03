import { getRandomRecordingForSpecies } from './recording';
import {
  loadSpeciesListById,
  loadSpeciesListForRegion,
  getSpeciesPresetListsForRegion,
  storeSuggestedSpeciesList,
  approveSuggestedSpeciesList,
} from './species';
import { sendEmailWithSuggestionData } from './preset_suggestions';

interface ApiGatewayEvent {
  queryStringParameters?: Record<string, string | undefined>;
  pathParameters?: Record<string, string | undefined>;
  body?: string;
  [key: string]: any;
}

interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const response = (
  statusCode: number,
  responseBody: unknown,
  addCacheHeader = false,
): LambdaResponse => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  };
  if (addCacheHeader) {
    // Cache for the maximum time allowed, which is one year
    headers['Cache-Control'] = 'public, max-age=31536000';
  }
  return {
    statusCode,
    headers,
    body: JSON.stringify(responseBody),
  };
};

export const getRecording = async (event: ApiGatewayEvent) => {
  console.log('Event: ', event);
  const species = event.queryStringParameters
    ? event.queryStringParameters['species'] ?? null
    : null;
  const soundType = event.queryStringParameters
    ? event.queryStringParameters['soundType'] ?? null
    : null;
  console.log(
    `Calling getRandomRecordingForSpecies with species: ${species}, soundType: ${soundType}`,
  );
  try {
    const recording = await getRandomRecordingForSpecies(species, soundType);
    console.log('Got recording: ', recording);
    return response(200, recording);
  } catch (error) {
    console.error('Error getting recording: ', error);
    return response(500, { message: 'Error getting recording' });
  }
};

export const getSpeciesList = async (event: ApiGatewayEvent) => {
  console.log('Event:', event);
  const region = event.queryStringParameters?.['region'];
  const listId = event.queryStringParameters?.['listId'];
  if (region) {
    const species_list = await loadSpeciesListForRegion(region);
    if (!species_list) {
      return response(404, { message: 'No species list found for region' });
    }
    return response(200, { species: species_list }, true);
  }

  if (listId) {
    const species_list = await loadSpeciesListById(listId.toLowerCase());
    if (!species_list) {
      return response(404, { message: 'No species list found for given id' });
    }
    return response(200, { species: species_list }, true);
  }

  return response(400, {
    message: "Must supply either 'region' or 'listId' parameters",
  });
};

export const getSpeciesPresetLists = async (event: ApiGatewayEvent) => {
  console.log('Entering preset lists handler with event', event);
  const region = event.pathParameters?.region;

  if (!region) {
    return response(400, { message: "Missing required path parameter 'region'" });
  }
  console.log('Loading preset lists with region', region);
  return response(
    200,
    { presets: await getSpeciesPresetListsForRegion(region) },
    true,
  );
};

export const suggestPresetList = async (event: ApiGatewayEvent) => {
  const body = event.body;
  const presetListData = body ? JSON.parse(body) : {};
  const region = presetListData.region;
  const listName = presetListData.listName;
  const speciesList = presetListData.speciesList;
  if (!listName || listName.length === 0) {
    return response(400, { message: 'Missing listName property from request body' });
  }
  if (!region || region.length === 0) {
    return response(400, { message: 'Missing region property from request body' });
  }
  if (!speciesList || speciesList.length < 2) {
    return response(400, {
      message:
        'Species list not found in speciesList, or has fewer than 2 species',
    });
  }

  const suggestionId = await storeSuggestedSpeciesList(presetListData);
  return response(200, {
    suggestionId,
  });
};

export const approvePresetList = async (event: { suggestionId?: string }) => {
  if (!event.suggestionId) {
    throw new Error('suggestionId property not set in event body');
  }

  const listPath = await approveSuggestedSpeciesList(event.suggestionId);
  return { listPath };
};

export const notifyPresetListSuggested = async (event: any) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = record.s3.object.key;
  console.log('Handling event with bucket and key', bucket, key);
  await sendEmailWithSuggestionData(bucket, key);
};


