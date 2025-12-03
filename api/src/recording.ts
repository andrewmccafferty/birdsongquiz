import * as http from 'http';
import * as https from 'https';
import { XenoCantoResponse, Recording } from './xeno_canto_responses';
const formatTypeParameter = (soundType: string | null) =>
  soundType ? encodeURIComponent(` type:"${soundType}"`) : '';

const getXenoCantoQueryUrl = (species: string, soundType: string | null) => {
  return `https://xeno-canto.org/api/3/recordings?key=${process.env.XC_API_KEY}&query=sp:"${encodeURIComponent(
    species,
  )}"${encodeURIComponent(' q:"A"')}${formatTypeParameter(soundType)}`;
};

const getRecordingData = async (
  species: string,
  soundType: string | null,
): Promise<XenoCantoResponse> => {
  console.log(
    `Calling getXenoCantoQueryUrl with species: ${species}, soundType: ${soundType}`,
  );
  const url = getXenoCantoQueryUrl(species, soundType);

  console.log('Calling with URL:', url);
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
          } catch (error: unknown) {
            reject(new Error(`Error parsing JSON: ${error}`));
          }
        } else {
          reject(
            new Error(
              `Failed to fetch recording results: status code ${response.statusCode}, response body ${data}`,
            ),
          );
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    request.end();
  });
};

const constructSoundUrlFromRecordingData = (recording: Recording): string => {
  const mp3FileName = recording['file-name'].replace(/\.wav$/i, '.mp3');

  const match = recording.sono.small.match(/uploaded\/([^/]+)\//);
  if (!match) {
    throw new Error('recordistId not found in sono.small');
  }
  const recordistId = match[1];

  // 3. Construct final URL
  return `https://xeno-canto.org/sounds/uploaded/${recordistId}/${mp3FileName}`;
};

export const getRandomRecordingForSpecies = async (
  species: string | null,
  soundType: string | null,
) => {
  if (!species) {
    throw new Error('species is required');
  }
  console.log(
    `Calling getRecordingData with species: ${species}, soundType: ${soundType}`,
  );
  const data = await getRecordingData(species, soundType);
  if (!data.recordings || data.recordings.length === 0) {
    throw new Error(`No recordings found for species ${species}`);
  }
  const randomIndex = Math.floor(Math.random() * data.recordings.length);
  console.log('Random index: ', randomIndex);
  const recording = data.recordings[randomIndex];
  return {
    species: species,
    recording,
    soundUrl: constructSoundUrlFromRecordingData(recording),
  };
};


