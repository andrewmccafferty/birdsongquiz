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

const loadSpeciesList = async (region) => {
    const speciesData = await getObjectFromS3AsString(
        process.env.SPECIES_LIST_BUCKET_NAME,
        `${region}.json`);
    if (!speciesData) {
    return null
    }

    const species_list = JSON.parse(speciesData);
    return species_list
}

export { loadSpeciesList }