import { IResponseImages } from './response';

export abstract class ImageAPI {
  abstract getRandomImages(pageimagesNumber: number, pageNumber: number): Promise<IResponseImages>;
  abstract searchImages(query: string, imagesNumber: number, pageNumber: number): Promise<IResponseImages>;
}
