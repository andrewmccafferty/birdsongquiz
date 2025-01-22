import { getRandomRecordingForSpecies } from './recording.js';

const response = (statusCode, responseBody) => ({
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(responseBody),
  });

export const getRecording = async (event) => {
    console.log('Event: ', event);
    const species = event.queryStringParameters ? event.queryStringParameters["species"] : null;
    
    console.log("Calling getRandomRecordingForSpecies with species: ", species);
    try {
      const recording = await getRandomRecordingForSpecies(species)
      console.log("Got recording: ", recording);
      return response(200, recording);
    } catch (error) {
      console.error("Error getting recording: ", error);
      return response(500, { "message": "Error getting recording" });
    }
  }