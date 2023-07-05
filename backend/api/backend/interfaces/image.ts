export interface DynamoImages extends Array<any> {
  id: number;
  filename: string;
  user: string;
  url: string;
  metadata: string;
  date: string;
}

export interface ImageObject {
  id: number;
  filename: string;
  user: string;
  metadata: object;
  date: Date;
}

export interface ImagesArray extends Array<ImageObject> {}
