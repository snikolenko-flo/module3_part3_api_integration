import { IResponseWithImages } from './response';

export abstract class ImageAPI {
  abstract getRandomImages(imagesNumber: number): Promise<IResponseWithImages>;
}
