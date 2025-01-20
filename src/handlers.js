import { getRandomRecordingsForMultipleSpecies } from './recording.js';

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
      const recordings = await getRandomRecordingsForMultipleSpecies(speciesList)
      console.log("Got recording: ", recordings);
      return response(200, recordings);
    } catch (error) {
      console.error("Error getting recordings: ", error);
      return response(500, { "message": "Error getting recordings" });
    }
  }