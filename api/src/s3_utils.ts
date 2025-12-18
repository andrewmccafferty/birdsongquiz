import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2CommandOutput,
  _Object,
  S3ServiceException,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3"

const s3 = new S3Client({ region: "eu-west-2" })

const deleteObjectFromS3 = async (bucketName: string, s3Key: string) => {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
  )
}

const listFilesForPrefix = async (
  bucketName: string,
  prefix: string
): Promise<string[]> => {
  const params = {
    Bucket: bucketName,
    Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
  }

  const files: string[] = []
  let continuationToken: string | undefined = undefined

  try {
    do {
      const response: ListObjectsV2CommandOutput = await s3.send(
        new ListObjectsV2Command({
          ...params,
          ContinuationToken: continuationToken,
        })
      )

      if (response.Contents) {
        files.push(
          ...response.Contents.map(
            (obj: _Object) => obj.Key as string | undefined
          ).filter((k: string | undefined): k is string => !!k)
        )
      }

      continuationToken = response.IsTruncated
        ? response.NextContinuationToken
        : undefined
    } while (continuationToken)

    return files
  } catch (err) {
    console.error("Error listing files:", err)
    throw err
  }
}

const getObjectFromS3AsString = async (
  bucketName: string,
  s3Key: string
): Promise<string | null> => {
  const s3Client = new S3Client({ region: "eu-west-2" })
  try {
    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
      })
    )
    return Body!.transformToString()
  } catch (err) {
    if (
      err instanceof S3ServiceException &&
      err.$metadata?.httpStatusCode === 404
    ) {
      return null
    } else {
      throw err
    }
  }
}

const s3KeyExists = async (bucket: string, key: string): Promise<boolean> => {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (err) {
    if (
      err instanceof S3ServiceException &&
      err.$metadata?.httpStatusCode === 404
    ) {
      return false
    }
    throw err
  }
}

const putObjectToS3 = async (object: unknown, bucket: string, key: string) => {
  return s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(object),
    })
  )
}

export {
  deleteObjectFromS3,
  listFilesForPrefix,
  getObjectFromS3AsString,
  s3KeyExists,
  putObjectToS3,
}
