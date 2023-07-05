import { GalleryService } from './gallery.service.js';
import { ImagesResponse } from '../interfaces/response.js';
export class RenderGalleryHtml {
  galleryService: GalleryService;

  constructor() {
    this.galleryService = new GalleryService();
  }

  renderImages(imagesUrls: {url: string, id: number}[]): void {
    const images = document.getElementById('images');
    images.innerHTML = this.galleryService.wrapUrlsInHtml(imagesUrls);
  }
}
