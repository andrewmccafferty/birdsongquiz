import { XenoCantoResponse, Recording } from './model/xeno_canto_responses';
import { getApiJsonData } from './api_helper';
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
  return getApiJsonData<XenoCantoResponse>(getXenoCantoQueryUrl(species, soundType))
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

const getRandomRecordingForSpecies = async (
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
    recording: {
      id: recording.id,
      en: recording.en,
      rec: recording.rec,
      gen: recording.gen,
      sp: recording.sp
    },
    soundUrl: constructSoundUrlFromRecordingData(recording),
  };
};

export { getRandomRecordingForSpecies }