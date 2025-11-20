import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const getObjectFromS3AsString = async (bucketName, s3Key) => {
    const s3Client = new S3Client({region: "eu-west-2"});
    const { Body } = await s3Client.send(
    new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    }));
    return Body.transformToString()
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

const getSpeciesListsForRegion = async (region) => {
    
}

export { loadSpeciesListForRegion, loadSpeciesListById }