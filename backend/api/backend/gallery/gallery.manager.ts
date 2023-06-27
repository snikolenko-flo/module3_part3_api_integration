import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { GalleryService } from './gallery.service.js';
import { Database } from '../interfaces/database.js';
import { ImageAPI } from '../interfaces/image.api.js';
import { Gallery } from '../interfaces/gallery.js';

export class GalleryManager extends Gallery {
  service: GalleryService;

  constructor() {
    super();
    this.service = new GalleryService();
  }

  async getGallery(
    apiService: ImageAPI,
    user: string,
    pageNumber: number,
    pageLimit: number,
    dbService: Database,
    currentUser: string,
    imageNumber: number
  ): Promise<APIGatewayProxyResult> {
    const images = await apiService.getRandomImages(imageNumber, pageNumber);
    return createResponse(200, images);
  }

  async searchGallery(
    apiService: ImageAPI,
    user: string,
    pageNumber: number,
    pageLimit: number,
    dbService: Database,
    currentUser: string,
    imageNumber: number,
    query: string,
  ): Promise<APIGatewayProxyResult> {
    const images = await apiService.searchImages(query, imageNumber, pageNumber);
    return createResponse(200, images);
  }
}
