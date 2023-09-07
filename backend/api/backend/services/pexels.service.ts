import { Photos, createClient } from 'pexels';
import { errorHandler } from '@helper/http-api/error-handler';
import { ImageAPI } from '../interfaces/image.api';
import { IResponseWithImages } from '../interfaces/response';
import { Photo } from 'pexels';
import { Image } from '../interfaces/image';
const apiKey = process.env.PEXELS_API_KEY;
const client = createClient(apiKey!);

// Do not abuse the API. By default, the API is rate-limited to 200 requests per hour
// and 20,000 requests per month.

export class PexelsService extends ImageAPI {
  async getRandomImages(imagesNumber: number, pageNumber: number): Promise<IResponseWithImages> {
    try {
      const photos = (await client.photos.curated({ per_page: imagesNumber, page: pageNumber })) as Photos;
      const imageArray = photos.photos.map((photo) => {
        return { url: photo.src.medium, id: photo.id };
      });
      return {
        total: 1,
        objects: imageArray,
      };
    } catch (e) {
      throw errorHandler(e);
    }
  }

  async searchImages(query: string, imagesNumber: number, pageNumber: number): Promise<IResponseWithImages> {
    try {
      const photos = (await client.photos.search({ query, per_page: imagesNumber, page: pageNumber })) as Photos;
      const imageArray = photos.photos.map((photo) => {
        return { url: photo.src.medium, id: photo.id };
      });
      return {
        total: 1,
        objects: imageArray,
      };
    } catch (e) {
      throw errorHandler(e);
    }
  }

  async getFavoriteImages(imagesIds: string[]): Promise<Image[]> {
    try {
      return await Promise.all(
        imagesIds.map(async (imageID) => {
          return (await client.photos.show({ id: imageID })) as Photo;
        })
      );
    } catch (e) {
      throw errorHandler(e);
    }
  }
}
