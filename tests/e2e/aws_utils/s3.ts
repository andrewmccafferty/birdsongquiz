import { S3Client, GetObjectCommand, _Object } from "@aws-sdk/client-s3"

const getObjectFromS3AsString = async (
  bucketName: string,
  s3Key: string
): Promise<string> => {
  const s3Client = new S3Client({ region: "eu-west-2" })
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
  )
  return Body!.transformToString()
}

export { getObjectFromS3AsString }
