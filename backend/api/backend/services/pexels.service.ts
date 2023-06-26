import { createClient } from 'pexels';
import { ImagesIds } from '../interfaces/pexels';
import { errorHandler } from '@helper/http-api/error-handler';
import { ImageAPI } from '../interfaces/image.api';
import { IResponseWithImages } from '../interfaces/response';

const apiKey = process.env.PEXELS_API_KEY;
const client = createClient(apiKey!);

// Do not abuse the API. By default, the API is rate-limited to 200 requests per hour
// and 20,000 requests per month.

export class PexelsService extends ImageAPI {
  async getRandomImages(imagesNumber: number): Promise<IResponseWithImages> {
    try {
      const photos = await client.photos.curated({ per_page: imagesNumber });
      const photosArray = JSON.stringify(photos);
      const newPhotosArray = JSON.parse(photosArray);

      const imageArray = newPhotosArray.photos.map((photo) => {
        return photo.src.medium;
      });
      return {
        total: 1,
        objects: imageArray,
      };
    } catch (e) {
      throw errorHandler(e);
    }
  }
}
