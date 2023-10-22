export class GalleryService {
  wrapUrlsInHtml(urlsList: {url: string, id: number}[]): string {
    let images = '';

    urlsList.forEach(function (image) {
      images += `<div class="gallery">
                   <img src="${image.url}">
                   <input type="checkbox" id="${image.id}" name="image">
                 </div>`;
    });
    return images;
  }

  redirectToPage(pageNumber: number, pageLimit: number): void {
    window.location.href = `gallery.html?page=${pageNumber}&limit=${pageLimit}`;
  }
}
