import { GalleryManager } from './gallery.manager.js';
import { UrlManipulationService } from '../services/url-manipulation.service.js';
import { BASE_URL } from '../data/constants.js';
import { ImagesResponse } from '../interfaces/response.js';

const urlService = new UrlManipulationService();
const manager = new GalleryManager();

export async function loadGallery(): Promise<void> {
  try {
    const pageNumber: number = urlService.getPageNumberFromUrl();
    const pageLimit: number = await urlService.getLimit();
    const user: string = urlService.getUserFromUrl();
    const images = await manager.api.fetchImages(pageNumber, pageLimit, user);
    console.log('images');
    console.log(images);
    manager.render.renderImages(images.objects);
    manager.url.addParametersToUrl(pageNumber, pageLimit, user);
  } catch (e) {
    alert(e);
  }
}

export async function fetchNextPage(event: Event): Promise<void> {
  event.preventDefault();
  const pageNumber: number = urlService.getPageNumberFromUrl();
  const increasedPageNumber = pageNumber + 1;
  const pageLimit: number = urlService.getPageLimitFromUrl();
  const user: string = urlService.getUserFromUrl();
  const query = localStorage.getItem('query');
  const accessToken = localStorage.getItem('token');

  const body = {
    query: query,
    pageNumber: increasedPageNumber,
    pageLimit: pageLimit,
    user: user
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: accessToken,
    },
  };
  const url = `${BASE_URL}/search`;
  try {
    const response = await fetch(url, options);
    const images = (await response.json()) as ImagesResponse;
    if(user) {
      manager.url.addParametersToUrl(increasedPageNumber, pageLimit, user);
    } else {
      manager.url.addParametersToUrl(increasedPageNumber, pageLimit);
    }
    manager.render.renderImages(images.objects);
  } catch (e) {
    alert(e);
  }
}

export async function fetchPreviousPage(event: Event): Promise<void> {
  event.preventDefault();
  const pageNumber: number = urlService.getPageNumberFromUrl();
  let decreasedPageNumber = pageNumber - 1;
  if(decreasedPageNumber === 0) {
    decreasedPageNumber = 1;
  }
  const pageLimit: number = urlService.getPageLimitFromUrl();
  const user: string = urlService.getUserFromUrl();
  const query = localStorage.getItem('query');
  const accessToken = localStorage.getItem('token');

  const body = {
    query: query,
    pageNumber: decreasedPageNumber,
    pageLimit: pageLimit,
    user: user
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: accessToken,
    },
  };
  const url = `${BASE_URL}/search`;
  try {
    const response = await fetch(url, options);
    const images = (await response.json()) as ImagesResponse;
    if(user) {
      manager.url.addParametersToUrl(decreasedPageNumber, pageLimit, user);
    } else {
      manager.url.addParametersToUrl(decreasedPageNumber, pageLimit);
    }
    manager.render.renderImages(images.objects);
  } catch (e) {
    alert(e);
  }
}

export async function uploadImage(event: Event): Promise<void> {
  event.preventDefault();

  const inputFile = document.getElementById('img') as HTMLFormElement;
  const formData = new FormData();

  for (const file of inputFile.files) {
    formData.append('files', file);
  }

  const url = `${BASE_URL}/upload`;
  const accessToken = localStorage.getItem('token');

  const options = {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: accessToken,
    },
  };

  try {
    await fetch(url, options);
    const pageLimit: number = urlService.getPageLimitFromUrl();
    const pageNumber: number = urlService.getPageNumberFromUrl();
    const user: string = urlService.getUserFromUrl();
    const limitStep = 1;

    if(user) {
      manager.url.addParametersToUrl(pageNumber, pageLimit+limitStep, user);
    } else {
      manager.url.addParametersToUrl(pageNumber, pageLimit+limitStep);
    }
    location.reload();
  } catch (e) {
    alert(e);
  }
}

export async function searchImages(event: Event): Promise<void> {
  event.preventDefault();
  const apiSearchForm = document.getElementById('api_search') as HTMLFormElement;
  const query = apiSearchForm.value;
  localStorage.setItem('query', query);

  const pageNumber = 1;
  const pageLimit: number = urlService.getPageLimitFromUrl();
  const user: string = urlService.getUserFromUrl();

  const url = `${BASE_URL}/search`;
  const accessToken = localStorage.getItem('token');

  const body = {
    query: query,
    pageNumber: pageNumber,
    pageLimit: pageLimit,
    user: user
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: accessToken,
    },
  };
  try {
    const response = await fetch(url, options);
    const images = (await response.json()) as ImagesResponse;
    if(user) {
      manager.url.addParametersToUrl(pageNumber, pageLimit, user);
    } else {
      manager.url.addParametersToUrl(pageNumber, pageLimit);
    }
    manager.render.renderImages(images.objects);
  } catch (e) {
    alert(e);
  }
}

export async function addImageToFavorites(event: Event): Promise<void> {
  event.preventDefault();
  console.log('add to favorites');
  const checkedImages = Array.from(document.querySelectorAll('input[name="image"]:checked')).map(function(item) {return item.id});
  const accessToken = localStorage.getItem('token');
  
  const body = {
    imagesIds: checkedImages
  }

  const options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      Authorization: accessToken,
    },
  };

  const url = `${BASE_URL}/add_to_favorites`;
  try {
    const response = await fetch(url, options);
    if(response.ok) {
      alert('Images were added to favorites');
    }
  } catch (e) {
    alert(`addImageToFavorites. The error: ${e}`);
  }
}