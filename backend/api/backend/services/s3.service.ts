import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as stream from 'stream';

export async function uploadToS3(data: Buffer, filename: string, bucket: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = new S3Client({ region: 'ap-northeast-1' });
    console.log(`uploadToS3() | Upload the file ${filename} to the bucket ${bucket}`);
    console.log(`uploadToS3() | bucket: ${bucket}`);
    console.log(`uploadToS3() | filename: ${filename}`);
    console.log('uploadToS3() | data');
    console.log(data);
    client
      .send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: filename,
          Body: data,
        })
      )
      .then(() => {
        console.log(`File ${filename} was uploaded to the bucket ${bucket}`);
        resolve();
      })
      .catch((e) => reject(`The error ${e} has happened`));
  });
}

export async function downloadFromS3(key: string, bucket: string): Promise<Buffer> {
  return new Promise(async (resolve) => {
    console.log(`Dowload the file ${key}`);
    const client = new S3Client({ region: 'ap-northeast-1' });
    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const response = await client.send(getObjectCommand);
    const buffers: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const readableStream = stream.Readable.from(response.Body as NodeJS.ReadableStream);
      readableStream.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });
      readableStream.on('end', () => resolve());
      readableStream.on('error', reject);
    });

    const buffer = Buffer.concat(buffers);
    console.log(`File ${key} is downloaded from the bucket ${bucket}`);
    resolve(buffer);
  });
}
