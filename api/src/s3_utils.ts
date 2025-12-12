import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2CommandOutput,
  _Object,
  S3ServiceException,
} from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "eu-west-2" });

export async function listFilesForPrefix(
  bucketName: string,
  prefix: string
): Promise<string[]> {
  const params = {
    Bucket: bucketName,
    Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
  };

  const files: string[] = [];
  let continuationToken: string | undefined = undefined;

  try {
    do {
      const response: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({
          ...params,
          ContinuationToken: continuationToken,
        })
      );

      if (response.Contents) {
        files.push(
          ...response.Contents.map(
            (obj: _Object) => obj.Key as string | undefined
          ).filter((k: string | undefined): k is string => !!k)
        );
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

export const getObjectFromS3AsString = async (
  bucketName: string,
  s3Key: string
): Promise<string> => {
  const s3Client = new S3Client({ region: "eu-west-2" });
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
  );
  return Body!.transformToString();
};

export async function s3KeyExists(
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (err) {
    if (
      err instanceof S3ServiceException &&
      err.$metadata?.httpStatusCode === 404
    ) {
      return false;
    }
    throw err;
  }
}
