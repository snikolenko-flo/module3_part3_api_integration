import { GalleryService } from './gallery.service.js';

export class RenderGalleryHtml {
  galleryService: GalleryService;

  constructor() {
    this.galleryService = new GalleryService();
  }

  renderImages(imagesUrls: URL[]): void {
    const images = document.getElementById('images');
    images.innerHTML = this.galleryService.wrapUrlsInHtml(imagesUrls);
  }
}
