import { Controller, Param, Post, UseGuards, Version } from '@nestjs/common';
import { AuthGuard, User } from '@/modules/auth/public/http';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { ParseUUIDPipe } from '@/shared/nest/pipes/parse-uuid-pipe';
import { RecordViewCommand } from '../application/use-cases/command/record-view.command';
import { ViewResultDTO } from '../application/dtos/out/view-result.dto';

@Controller()
@UseGuards(AuthGuard)
export class ViewController {
  constructor(private readonly record: RecordViewCommand) {}
  @Version('1')
  @Post('views/:resourceId')
  @AppResponse('CONTENT_VIEW_RECORDED', ViewResultDTO)
  recordView(@User('id') accountId: string, @Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.record.execute(accountId, resourceId);
  }
}
