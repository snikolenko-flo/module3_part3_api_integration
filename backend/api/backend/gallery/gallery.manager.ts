import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { GalleryService } from './gallery.service.js';
import { Database } from '../interfaces/database.js';
import { ImageAPI } from '../interfaces/image.api.js';
import { Gallery } from '../interfaces/gallery.js';
import { Photo } from 'pexels';
import { uploadToS3 } from '../services/s3.service';
import https from 'https';

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
    let images;
    if(user) {
      images = await this.service.getImages(pageNumber, pageLimit, dbService, currentUser, user);
    } else {
      images = await apiService.getRandomImages(imageNumber, pageNumber);
    }
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
    query: string
  ): Promise<APIGatewayProxyResult> {
    const images = await apiService.searchImages(query, imageNumber, pageNumber);
    return createResponse(200, images);
  }

  async updateDbUser(favoriteImages: Photo[], userEmail: string, dbService: Database): Promise<void> {
    try {
      const imagesArray = await dbService.getImagesArray(userEmail);
      const user = userEmail.split('@')[0];

      favoriteImages.forEach((image) => {
        const filename = image.src.original.split('/').slice(-1);
        imagesArray.push({
          id: image.id,
          filename: filename.toString(),
          user: user,
          metadata: image,
          date: new Date(),
        });
      });
      await dbService.updateUserInDB(userEmail, imagesArray);
      console.log('Images data was added to a database');
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesArray.`);
    }
  }
  
  async downloadAndUploadFiles(images: Photo[], s3Path: string, user: string): Promise<void> {
    try {
      await Promise.all(
        images.map(async (image) => {
          const url = image.src.original;
          const filename = image.src.original.split('/').slice(-1);
          const fileData = await this.downloadFile(url);
          await uploadToS3(fileData, `${user}/${filename}`, s3Path);
        }));
    } catch (e) {
      throw Error(`Error: ${e} function: downloadAndUploadFiles.`);
    }
  }

  private downloadFile(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      https
        .get(url, (response) => {
          const chunks: any = [];
  
          response.on('data', (chunk) => {
            chunks.push(chunk);
          });
  
          response.on('end', () => {
            console.log(`File from ${url} is downloaded.`);
            const fileData = Buffer.concat(chunks);
            resolve(fileData);
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}
