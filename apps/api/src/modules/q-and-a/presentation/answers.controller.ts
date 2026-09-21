import { Controller, Get, Query, Version } from '@nestjs/common';
import { AuthGuard } from '@/modules/auth/public/http';
import { UseGuards } from '@nestjs/common';
import { User } from '@/modules/auth/public/http';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { QAndAAccountContributionDTO } from '../application/dtos';
import { ListMyAnswersQuery } from '../application/use-cases/query';

@Controller('answers')
@UseGuards(AuthGuard)
export class AnswersController {
  constructor(private readonly answers: ListMyAnswersQuery) {}

  @Version('1')
  @Get('mine')
  @AppResponse('CONTENT_LISTED', QAndAAccountContributionDTO, { isArray: true })
  listMine(@User('id') accountId: string, @Query('limit') limit?: string) {
    return this.answers.execute(accountId, Number(limit || 20));
  }
}
