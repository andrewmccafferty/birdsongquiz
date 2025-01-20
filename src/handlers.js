import test from 'node:test';
import { getRandomRecordingForSpecies } from './recording.js';
const response = (statusCode, responseBody) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(responseBody),
  });

export const getRecordings = async (event) => {
    console.log('Event: ', event);
    const speciesList = event.multiValueQueryStringParameters ? event.multiValueQueryStringParameters["species"] : null;
    if (!speciesList || speciesList.length < 2) {
        return response(400, { "message": "Should include at least 2 species" });
    }
    console.log("Calling getRandomRecordingForSpecies with species: ", speciesList[0]);
    try {
      const recording = await getRandomRecordingForSpecies(speciesList[0])
      console.log("Got recording: ", recording);
      return response(200, recording);
    } catch (error) {
      console.error("Error getting recording: ", error);
      return response(500, { "message": "Error getting recording" });
    }
  }