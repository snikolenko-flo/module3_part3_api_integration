import { loadGallery, fetchNextPage, fetchPreviousPage, uploadImage } from './handler.js';
import { TokenService } from '../services/token.service.js';

const tokenService = new TokenService();
tokenService.checkToken();

(async () => await loadGallery())();

const nextPage = document.getElementById('next_page');
nextPage.onclick = fetchNextPage;

const previousPage = document.getElementById('previous_page');
previousPage.onclick = fetchPreviousPage;

const form = document.getElementById('image_form');
form.onsubmit = uploadImage;