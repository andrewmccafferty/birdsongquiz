import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "eu-west-2" });

async function listFilesForPrefix(bucketName, prefix) {
  const params = {
    Bucket: bucketName,
    Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
  };

  let files = [];
  let continuationToken = undefined;

  try {
    do {
      const response = await s3.send(
        new ListObjectsV2Command({
          ...params,
          ContinuationToken: continuationToken,
        })
      );

      if (response.Contents) {
        files.push(...response.Contents.map(obj => obj.Key));
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined;

    } while (continuationToken);

    return files;
  } catch (err) {
    console.error("Error listing files:", err);
    throw err;
  }
}

const getObjectFromS3AsString = async (bucketName, s3Key) => {
    const s3Client = new S3Client({region: "eu-west-2"});
    const { Body } = await s3Client.send(
    new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    }));
    return Body.transformToString()
}

export { listFilesForPrefix, getObjectFromS3AsString }