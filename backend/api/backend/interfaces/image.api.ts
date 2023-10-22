import { IResponseWithImages } from './response';
import { Image } from './image';

export abstract class ImageAPI {
  abstract getRandomImages(pageimagesNumber: number, pageNumber: number): Promise<IResponseWithImages>;
  abstract searchImages(query: string, imagesNumber: number, pageNumber: number): Promise<IResponseWithImages>;
  abstract getFavoriteImages(imagesIds: string[]): Promise<Image[]>;
}
