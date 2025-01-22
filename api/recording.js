import * as http  from 'http';
import * as https  from 'https';

const getRecordingData = async (species) => {
    const url = `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(species)}`;
    console.log("Calling with URL:", url);
    // Tried to do this with fetch, but it didn't work in the Lambda
    // for some reason.
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;

        const request = lib.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                if (response.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error(`Error parsing JSON: ${error.message}`));
                    }
                } else {
                    reject(new Error(`Failed to fetch recording results: status code ${response.statusCode}, response body ${data}`));
                }
            });
        });

        request.on('error', (error) => {
            reject(new Error(`Request error: ${error.message}`));
        });

        request.end();
    });
};

const getRandomRecordingForSpecies = async (species) => {
    console.log("Calling getRecordingData with species: ", species);
    const data = await getRecordingData(species);
    console.log("Got data: ", data);
    if (data.recordings.length === 0) {
        throw new Error(`No recordings found for species ${species}`);
    }
    const randomIndex = Math.floor(Math.random() * data.recordings.length);
    console.log("Random index: ", randomIndex);
    const recording = data.recordings[randomIndex];
    console.log("Got recording: ", recording);
    return {
        species: species,
        recording
    };
}

export { getRandomRecordingForSpecies }