import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import parseMultipart from 'parse-multipart';
import { IFileData } from '../interfaces/file';
import jwt from 'jsonwebtoken';
import { UploadManager } from './upload.manager';
import { FileService } from '../services/file.service';
import { DynamoDB } from '../services/dynamo.service';
import { v4 as uuidv4 } from 'uuid';

const secret = process.env.SECRET;
const bucket = process.env.BUCKET;
const s3Path = process.env.S3_IMAGE_DIRECTORY;
const fileService = new FileService();
const dbService = new DynamoDB();

export const upload: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log('Upload image');
    const manager = new UploadManager();

    const { filename, data, type } = extractFile(event);
    const token = event.headers.authorization;
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.user;

    const imageMetadata = manager.getMetadata(fileService, data, type);
    const imageArray = await manager.getImagesArray(userEmail, dbService);

    imageArray.push({
      id: uuidv4(),
      filename: filename,
      user: userEmail,
      metadata: imageMetadata,
      date: new Date(),
      subclipCreated: false,
    });

    await manager.uploadImageToS3(data, `${s3Path}/${userEmail}/${filename}`, bucket!);
    await manager.updateUserInDB(userEmail, imageArray, dbService);
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};

function extractFile(event): IFileData {
  const boundary = parseMultipart.getBoundary(event.headers['content-type']);
  const parts = parseMultipart.Parse(Buffer.from(event.body, 'base64'), boundary);
  const [{ filename, data, type }] = parts;
  console.log(`extractFile() | filename: ${filename}`);
  console.log(`extractFile() | data: ${data}`);
  console.log(`extractFile() | type: ${type}`);
  return {
    filename,
    data,
    type,
  };
}
