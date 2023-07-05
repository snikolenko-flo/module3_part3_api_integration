import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const bucketEndpoint = 'https://stanislav-flo-test-bucket.s3.ap-northeast-1.amazonaws.com';

export async function uploadToS3(data: Buffer, filename: string, bucket: string): Promise<void> {
  return new Promise((resolve) => {
    const client = new S3Client({
      forcePathStyle: true,
      endpoint: bucketEndpoint,
    });
    console.log(`Upload the file ${filename}`);
    client
      .send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: Buffer.from(data),
        })
      )
      .then(() => {
        console.log(`File ${filename} is uploaded to the bucket ${bucket}`);
        resolve();
      })
      .catch((e) => console.log(`The error ${e} has happened`));
  });
}
