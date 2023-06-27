import { errorHandler } from '@helper/http-api/error-handler';
import { createResponse } from '@helper/http-api/response';
import { log } from '@helper/logger';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { GalleryManager } from './gallery.manager';
import jwt from 'jsonwebtoken';
import { DynamoDB } from '../services/dynamo.service';
import { PexelsService } from '../services/pexels.service';

const secret = process.env.SECRET;
const dbService = new DynamoDB();
const apiService = new PexelsService();
const imageNumber = 10;

export const getGallery: APIGatewayProxyHandlerV2 = async (event) => {
  try {
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

    if(query === '') {
      return await manager.getGallery(apiService, user!, pageNumber, pageLimit, dbService, currentUser, imageNumber);
    } else {
      return await manager.searchGallery(apiService, user!, pageNumber, pageLimit, dbService, currentUser, imageNumber, query);
    }
  } catch (e) {
    return errorHandler(e);
  }
};