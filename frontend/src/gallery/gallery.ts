import { loadGallery, fetchNextPage, fetchPreviousPage, uploadImage, searchImages, addImageToFavorites } from './handler.js';
import { TokenService } from '../services/token.service.js';

const tokenService = new TokenService();
const isToken = tokenService.checkToken();

if (isToken) {
    (async () => await loadGallery())();

    const nextPage = document.getElementById('next_page');
    nextPage.onclick = fetchNextPage;
    
    const previousPage = document.getElementById('previous_page');
    previousPage.onclick = fetchPreviousPage;
    
    const search = document.getElementById('search_form');
    search.onsubmit = searchImages;
    
    const upload = document.getElementById('upload_form');
    upload.onsubmit = uploadImage;
    
    const addToFavorites = document.getElementById('add_to_favorites');
    addToFavorites.onclick = addImageToFavorites;
}

