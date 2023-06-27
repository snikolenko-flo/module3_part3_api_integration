import { loadGallery, fetchNextPage, fetchPreviousPage, uploadImage, searchImages } from './handler.js';
import { TokenService } from '../services/token.service.js';

const tokenService = new TokenService();
tokenService.checkToken();

(async () => await loadGallery())();

const nextPage = document.getElementById('next_page');
nextPage.onclick = fetchNextPage;

const previousPage = document.getElementById('previous_page');
previousPage.onclick = fetchPreviousPage;

const search = document.getElementById('search_form');
search.onsubmit = searchImages;

const upload = document.getElementById('image_form');
upload.onsubmit = uploadImage;