import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { GalleryManager } from './gallery.manager';
import jwt from 'jsonwebtoken';
import { DynamoDB } from '../services/dynamo.service';
import { PexelsService } from '../services/pexels.service';
import { Image } from '../interfaces/image';
import Jimp from 'jimp';
import { downloadFromS3, uploadToS3 } from '../services/s3.service';
import JPEG from 'jpeg-js';

// Added it to fix the error: "Jimp error: Error: maxMemoryUsageInMB limit exceeded by at least 117MB"
// To fix it you can override the jpeg-js decoder jimp uses.
// Got this from here: https://github.com/jimp-dev/jimp/issues/915#issuecomment-794121827
Jimp.decoders['image/jpeg'] = (data: Buffer) => JPEG.decode(data, { maxMemoryUsageInMB: 1024 });

const secret = process.env.SECRET;
const dbService = new DynamoDB();
const apiService = new PexelsService();
const imageNumber = 10;
const s3Bucket = process.env.BUCKET;

export const getGallery: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    log('getGallery event');
    log(event);
    const manager = new GalleryManager();

    const params = event.queryStringParameters;
    const pageNumber = parseInt(params!.page!);
    const pageLimit = parseInt(params!.limit!);
    const user = params!.filter;

    const token = event['headers'].authorization;
    const decodedToken = jwt.verify(token, secret);
    const currentUser = decodedToken.user;

    if (isNaN(pageNumber)) return createResponse(400, { message: 'The page number should be an integer' });
    if (!isFinite(pageNumber)) return createResponse(400, { message: 'The page number should be a finite integer' });

    return await manager.getGallery(apiService, user!, pageNumber, pageLimit, dbService, currentUser, imageNumber);
  } catch (e) {
    return errorHandler(e);
  }
};

export const getImagesLimit: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const token = event['headers'].authorization;
    const decodedToken = jwt.verify(token, secret);
    const currentUser = decodedToken.user;
    console.log(`currentUser: ${currentUser}`);
    const pageLimit = await dbService.getNumberOfAllImages(currentUser);
    const limit = JSON.stringify({ limit: pageLimit });
    log(`Page limit ${limit} was sent to the frontend.`);
    return createResponse(200, limit);
  } catch (e) {
    return errorHandler(e);
  }
};

export const searchImagesInAPI: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log('searchImagesInAPI');

    const { query, pageNumber, pageLimit, user } = JSON.parse(event.body!);
    const manager = new GalleryManager();

    console.log(`query: ${query}`);
    console.log(`pageNumber: ${pageNumber}`);
    console.log(`pageLimit: ${pageLimit}`);
    console.log(`user: ${user}`);

    const token = event['headers'].authorization;
    const decodedToken = jwt.verify(token, secret);
    const currentUser = decodedToken.user;

    if (isNaN(pageNumber)) return createResponse(400, { message: 'The page number should be an integer' });
    if (!isFinite(pageNumber)) return createResponse(400, { message: 'The page number should be a finite integer' });

    if (query === '') {
      return await manager.getGallery(apiService, user!, pageNumber, pageLimit, dbService, currentUser, imageNumber);
    } else {
      return await manager.searchGallery(apiService, pageNumber, imageNumber, query);
    }
  } catch (e) {
    return errorHandler(e);
  }
};

export const addImagesToFavorites: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    console.log('addImagesToFavorites');

    const manager = new GalleryManager();
    const body = JSON.parse(event.body!);
    const imagesIds = body.imagesIds;

    const token = event['headers'].authorization;
    const decodedToken = jwt.verify(token, secret);
    const userEmail = decodedToken.user;

    const favoriteImages: Image[] = await apiService.getFavoriteImages(imagesIds);
    const dbService = new DynamoDB();

    await manager.downloadAndUploadFiles(favoriteImages, s3Bucket!, userEmail);
    await manager.updateDbUser(favoriteImages, userEmail, dbService);
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};

export const cropImage = async (event) => {
  try {
    console.log('cropImage');
    const manager = new GalleryManager();

    const key = event.Records[0].s3.object.key.replace('%40', '@');
    const bucket = event.Records[0].s3.bucket.name;

    const { fullFileName, userEmail, fileNameWithoutExtension, fileExtension, s3PathBeforeUserFolder } =
      manager.retrievePartsFromKey(key);

    if (fileNameWithoutExtension.includes('_SC')) {
      console.log(`The file ${fileNameWithoutExtension} was not cropped because it is a subclip.`);
      return;
    }

    const s3ImageBuffer = await downloadFromS3(key, bucket);

    try {
      const image = await Jimp.read(s3ImageBuffer);
      const resizedImage = image.cover(512, 250);
      const mime = resizedImage.getMIME();
      const buffer = await resizedImage.getBufferAsync(mime);

      const subclipName = `${fileNameWithoutExtension}_SC.${fileExtension}`;
      const newKey = `${s3PathBeforeUserFolder}/${userEmail}/${subclipName}`;

      await uploadToS3(buffer, newKey, bucket);
      await manager.updateSubclipField(userEmail, fullFileName, dbService);
    } catch (e) {
      console.log(`Jimp error: ${e}`);
    }
    return createResponse(200);
  } catch (e) {
    return errorHandler(e);
  }
};
