import * as http  from 'http';
import * as https  from 'https';
const formatTypeParameter = (soundType) => soundType ? encodeURIComponent(` type:"${soundType}"`) : ''
    
const getXenoCantoQueryUrl = (species, soundType) => {
    return `https://xeno-canto.org/api/3/recordings?key=${process.env.XC_API_KEY}&query=sp:"${encodeURIComponent(species)}"${encodeURIComponent(' q:"A"')}${formatTypeParameter(soundType)}`
}
const getRecordingData = async (species, soundType) => {
    console.log(`Calling getXenoCantoQueryUrl with species: ${species}, soundType: ${soundType}`);
    const url = getXenoCantoQueryUrl(species, soundType);

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

const constructSoundUrlFromRecordingData = (recording) => {
    const mp3FileName = data["file-name"].replace(/\.wav$/i, ".mp3");

    const match = data.sono.small.match(/uploaded\/([^/]+)\//);
    if (!match) {
        throw new Error("recordistId not found in sono.small");
    }
    const recordistId = match[1];

    // 3. Construct final URL
    const mp3Url = `https://xeno-canto.org/sounds/uploaded/${recordistId}/${mp3FileName}`;
}

const getRandomRecordingForSpecies = async (species, soundType) => {
    console.log(`Calling getRecordingData with species: ${species}, soundType: ${soundType}`);
    const data = await getRecordingData(species, soundType);
    if (data.recordings.length === 0) {
        throw new Error(`No recordings found for species ${species}`);
    }
    const randomIndex = Math.floor(Math.random() * data.recordings.length);
    console.log("Random index: ", randomIndex);
    const recording = data.recordings[randomIndex];
    return {
        species: species,
        recording,
        soundUrl: constructSoundUrlFromRecordingData(recording)
    };
}

export { getRandomRecordingForSpecies }