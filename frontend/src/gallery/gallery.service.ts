import { FRONTEND_BASE_URL } from '../data/constants.js';

export class GalleryService {
  wrapUrlsInHtml(urlsList: URL[]): string {
    let images = '';

    urlsList.forEach(function (url) {
      images += `<div class="gallery">
                   <img src="${url}">
                 </div>`;
    });
    return images;
  }

  redirectToPage(pageNumber: number, pageLimit: number): void {
    window.location.href = `gallery.html?page=${pageNumber}&limit=${pageLimit}`;
  }
}
