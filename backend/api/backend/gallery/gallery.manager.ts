import { createResponse } from '@helper/http-api/response';
import { APIGatewayProxyResult } from 'aws-lambda/trigger/api-gateway-proxy';
import { GalleryService } from './gallery.service';
import { Database } from '../interfaces/database';
import { ImageAPI } from '../interfaces/image.api';
import { Gallery } from '../interfaces/gallery';
import { Image } from '../interfaces/image';
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
    imageNumber: number
  ): Promise<APIGatewayProxyResult> {
    let images;
    if (user) {
      images = await this.service.getImages(pageNumber, pageLimit, dbService, user);
    } else {
      images = await apiService.getRandomImages(imageNumber, pageNumber);
    }
    return createResponse(200, images);
  }

  async searchGallery(
    apiService: ImageAPI,
    pageNumber: number,
    imageNumber: number,
    query: string
  ): Promise<APIGatewayProxyResult> {
    const images = await apiService.searchImages(query, imageNumber, pageNumber);
    return createResponse(200, images);
  }

  async updateDbUser(favoriteImages: Image[], userEmail: string, dbService: Database): Promise<void> {
    try {
      const imagesArray = await dbService.getImagesArray(userEmail);

      favoriteImages.forEach((image) => {
        const filename = image.src.original.split('/').slice(-1);
        imagesArray.push({
          id: image.id,
          filename: filename.toString(),
          user: userEmail,
          metadata: image,
          date: new Date(),
          subclipCreated: false,
        });
      });
      await dbService.updateUserInDB(userEmail, imagesArray);
      console.log('Images data was added to a database');
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesArray.`);
    }
  }

  async updateSubclipField(userEmail: string, filename: string, dbService: Database): Promise<void> {
    try {
      const imagesArray = await dbService.getImagesArray(userEmail);
      const imageToUpdate = imagesArray.find((image) => image.filename === filename);
      imageToUpdate!.subclipCreated = true;
      await dbService.updateUserInDB(userEmail, imagesArray);
      console.log(`Subclip field for the file ${filename} was set to true`);
    } catch (e) {
      throw Error(`Error: ${e} function: getImagesArray.`);
    }
  }

  async downloadAndUploadFiles(images: Image[], s3Path: string, userEmail: string): Promise<void> {
    try {
      await Promise.all(
        images.map(async (image) => {
          const url = image.src.original;
          const filename = image.src.original.split('/').slice(-1);
          const fileData = await this.downloadFile(url);
          await uploadToS3(fileData, `s3-bucket/${userEmail}/${filename}`, s3Path);
        })
      );
    } catch (e) {
      throw Error(`Error: ${e} function: downloadAndUploadFiles.`);
    }
  }

  downloadFile(url: string): Promise<Buffer> {
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

  retrievePartsFromKey(s3Key) {
    const keyArray = s3Key.split('/');
    const fullFileName = keyArray[keyArray.length - 1];
    const userEmail = keyArray[keyArray.length - 2];
    const fileNameArray = keyArray[keyArray.length - 1].split('.');
    const fileNameWithoutExtension = fileNameArray[0];
    const fileExtension = fileNameArray[fileNameArray.length - 1];
    const s3PathBeforeUserFolder = keyArray.slice(0, -2);
    return {
      fullFileName,
      userEmail,
      fileNameWithoutExtension,
      fileExtension,
      s3PathBeforeUserFolder,
    };
  }
}
