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
    const pagesAmount = await this.service.getNumberOfPages(pageLimit, dbService, user);
    const isValid = this.service.isPagesAmountValid(pagesAmount, pageNumber);
    if (!isValid) {
      return createResponse(400, {
        message: `Page number should be greater than 0 and less than ${pagesAmount + 1}`,
      });
    }
    const images = await apiService.getRandomImages(imageNumber);
    return createResponse(200, images);
  }
}
