export interface ImagesResponse {
  errorMessage: string;
  message: string;
  total: number;
  objects: { url: string, id: number }[];
}