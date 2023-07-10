import { AWSPartitial } from '../types';

export const getGalleryConfig: AWSPartitial = {
  functions: {
    apiAuthorizer: {
      handler: 'api/auth/handler.httpApiPolicy',
    },
    apiGetGallery: {
      handler: 'api/backend/gallery/handler.getGallery',
      description: 'Get gallery images',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/gallery',
            method: 'get',
            authorizer: {
              name: 'apiAuthorizer',
              type: 'request',
            },
          },
        },
      ],
    },
    apiGetImagesLimit: {
      handler: 'api/backend/gallery/handler.getImagesLimit',
      description: 'Return a number of images that are on a backend',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/gallery/limit',
            method: 'get',
          },
        },
      ],
    },
    apiSearchImages: {
      handler: 'api/backend/gallery/handler.searchImagesInAPI',
      description: 'Returns a number of images that are on a backend',
      timeout: 28,
      events: [
        {
          httpApi: {
            path: '/search',
            method: 'post',
          },
        },
      ],
    },
    apiAddToFavorites: {
      handler: 'api/backend/gallery/handler.addImagesToFavorites',
      description: 'Uploads images to s3',
      timeout: 900,
      events: [
        {
          httpApi: {
            path: '/add_to_favorites',
            method: 'post',
          },
        },
      ],
    },
    cropImage: {
      handler: 'api/backend/gallery/handler.cropImage',
      description: 'Crop image from s3',
      timeout: 28,
      events: [
        {
          s3: {
            bucket: 'stanislav-flo-test-bucket',
            event: 's3:ObjectCreated:*',
          },
        },
      ],
    },
  },
};
