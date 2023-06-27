import { IResponseWithImages } from './response';

export abstract class ImageAPI {
  abstract getRandomImages(pageimagesNumber: number, pageNumber: number): Promise<IResponseWithImages>;
  abstract searchImages(query: string, imagesNumber: number, pageNumber: number): Promise<IResponseWithImages>;
}
