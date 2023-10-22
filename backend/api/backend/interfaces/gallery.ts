import { ImageAPI } from './image.api';
import { Database } from './database';
import { APIGatewayProxyResult } from 'aws-lambda';

export abstract class Gallery {
  abstract getGallery(
    apiService: ImageAPI,
    user: string,
    pageNumber: number,
    pageLimit: number,
    dbService: Database,
    imageNumber: number
  ): Promise<APIGatewayProxyResult>;
}
