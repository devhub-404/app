import type { components } from '@devhub-404/api-contract';

export type MediaUploadPurpose = components['schemas']['RequestMediaUploadDTO']['purpose'];
export type UploadGrant = components['schemas']['MediaUploadGrantDTO'];
export type RequestMediaUploadInput = components['schemas']['RequestMediaUploadDTO'];
export type ConfirmMediaUploadInput = components['schemas']['ConfirmMediaUploadDTO'];
export type ConfirmedMediaUpload = components['schemas']['ConfirmedMediaUploadDTO'];
