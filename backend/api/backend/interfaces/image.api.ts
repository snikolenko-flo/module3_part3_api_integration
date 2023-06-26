import { IResponseWithImages } from './response';

export abstract class ImageAPI {
  abstract getRandomImages(pageimagesNumber: number, pageNumber: number): Promise<IResponseWithImages>;
}
