import { Injectable } from '@nestjs/common';
import { MediaServicePort, type CreateImageUploadInput } from '@/modules/media/public/media.service.port';

@Injectable()
export class RequestMediaUploadCommand {
  constructor(private readonly mediaService: MediaServicePort) {}

  execute(input: CreateImageUploadInput) {
    return this.mediaService.createImageUpload(input);
  }
}
