import { UrlManipulationService } from './url-manipulation.service.js';

export class RedirectService {
  urlService: UrlManipulationService;

  constructor() {
    this.urlService = new UrlManipulationService();
  }

  redirectToLogin(): void {
    window.location.href = '../html/login.html';
  }
}
