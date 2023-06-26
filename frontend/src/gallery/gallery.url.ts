export class GalleryUrl {
  addParametersToUrl(pageNumber: number, pageLimit: number, user?: string): void {
    const defaultPage = 1;
    let urlInAddressBar = `./gallery.html?page=${pageNumber}&limit=${pageLimit}`;
    urlInAddressBar = user ? `./gallery.html?page=${defaultPage}&limit=${pageLimit}&filter=${user}` : urlInAddressBar;

    history.replaceState({}, '', urlInAddressBar);
  }
}
