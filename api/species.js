import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { listFilesForPrefix, s3KeyExists } from "./s3_utils.js";
import { randomUUID } from "crypto"

const getObjectFromS3AsString = async (bucketName, s3Key) => {
    const s3Client = new S3Client({region: "eu-west-2"});
    const { Body } = await s3Client.send(
    new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    }));
    return Body.transformToString()
}

const deleteObjectFromS3 = async (bucketName, s3Key) => {
    const s3Client = new S3Client({region: "eu-west-2"});
    const { Body } = await s3Client.send(
    new DeleteObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    }));
}

const loadSpeciesListFromS3Key = async (s3Key) => {
    console.log("Loading species list from S3 key...", s3Key);
    const speciesData = await getObjectFromS3AsString(
        process.env.SPECIES_LIST_BUCKET_NAME,
        s3Key);
    if (!speciesData) {
        return null
    }

    const species_list = JSON.parse(speciesData);
    return species_list
}

const loadSpeciesListForRegion = async (region) => {
    return loadSpeciesListFromS3Key(`countries/${region}.json`)
}

const loadSpeciesListById = async (listId) => {
    return loadSpeciesListFromS3Key(`presets/${listId}.json`)
}

const getSpeciesPresetListsForRegion = async (region) => {
    const files = await listFilesForPrefix(process.env.SPECIES_LIST_BUCKET_NAME, `presets/${region}/`.toLowerCase())
    const mapped = files.map(path => {
        const filename = path.split('/').pop().replace('.json', '');
        const name = filename
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        return {
            id: `${region.toLowerCase()}/${filename}`,
            name
        };
    });
    return mapped
}

const suggestionS3Key = (suggestionId) => `suggestions/${suggestionId}.json`

const storeSuggestedSpeciesList = async (presetListData) => {
    const s3Client = new S3Client({region: "eu-west-2"});
    const suggestionId = randomUUID();
    await s3Client.send(
        new PutObjectCommand({
        Bucket: process.env.SPECIES_LIST_BUCKET_NAME,
        Key: suggestionS3Key(suggestionId),
        Body: JSON.stringify(presetListData)
    }));
    return suggestionId
}

const loadSuggestion = async (suggestionId) => {
    const suggestionRawData = await getObjectFromS3AsString(process.env.SPECIES_LIST_BUCKET_NAME, suggestionS3Key(suggestionId));
    return JSON.parse(suggestionRawData);
}

const deleteSuggestion = async (suggestionId) => {
    await deleteObjectFromS3(process.env.SPECIES_LIST_BUCKET_NAME, suggestionS3Key(suggestionId))
}

const updatePresetListVersionToCurrentTimestamp = async () => {
    const s3Client = new S3Client({region: "eu-west-2"});
    await s3Client.send(
        new PutObjectCommand({
        Bucket: process.env.FRONTEND_BUCKET_NAME,
        Key: "frontend-configuration.json",
        Body: JSON.stringify({
            "presetsVersion": `${Date.now()}`
        })
    }));
}

const mapListNameToFileKey = (listName) => {
    return listName.split(' ').join('-').toLowerCase();
}

const approveSuggestedSpeciesList = async (suggestionId) => {
    const suggestion = await loadSuggestion(suggestionId);
    console.log("Loaded suggestion", suggestion);
    const region = suggestion.region;
    const s3Key = `presets/${region.toLowerCase()}/${mapListNameToFileKey(suggestion.listName)}.json`;
    if (await s3KeyExists(process.env.SPECIES_LIST_BUCKET_NAME, s3Key)) {
        throw new Error(`Preset already exists with the key ${s3Key}`)
    }
    const s3Client = new S3Client({region: "eu-west-2"});
    const presetListData = suggestion.speciesList;
    await s3Client.send(
        new PutObjectCommand({
        Bucket: process.env.SPECIES_LIST_BUCKET_NAME,
        Key: s3Key,
        Body: JSON.stringify(presetListData)
    }));
    
    await deleteSuggestion(suggestionId);
    await updatePresetListVersionToCurrentTimestamp();

    return s3Key
}

export { loadSpeciesListForRegion, loadSpeciesListById, getSpeciesPresetListsForRegion, storeSuggestedSpeciesList, approveSuggestedSpeciesList }