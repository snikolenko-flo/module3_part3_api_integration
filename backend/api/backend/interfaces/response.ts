export interface IResponseWithImages {
  total: number;
  objects: { url: string; id: number }[];
}

export interface ImagesUrls {
  url: string;
  id: number;
}
