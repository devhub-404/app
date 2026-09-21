import { Injectable } from '@nestjs/common';
import { MediaServicePort, type ConfirmImageUploadInput } from '@/modules/media/public/media.service.port';

@Injectable()
export class ConfirmMediaUploadCommand {
  constructor(private readonly mediaService: MediaServicePort) {}

  execute(input: ConfirmImageUploadInput) {
    return this.mediaService.confirmImageUpload(input);
  }
}
