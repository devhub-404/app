import { Body, Controller, Get, Patch, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';
import { GetMyPreferencesQuery } from '@/modules/account/application/preferences/use-cases/query/get-my-preferences.query';
import { UpdateMyPreferencesCommand } from '@/modules/account/application/preferences/use-cases/command/update-my-preferences.command';
import { AccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/out';
import { UpdateAccountPreferencesDTO } from '@/modules/account/application/preferences/dtos/in';

@Controller('me/preferences')
@UseGuards(AuthGuard)
export class MePreferencesController {
  constructor(
    private readonly getPreferencesQuery: GetMyPreferencesQuery,
    private readonly updatePreferencesCommand: UpdateMyPreferencesCommand,
  ) {}

  @Version('1')
  @Get()
  @AppResponse('PREFERENCES_RETRIEVED', AccountPreferencesDTO)
  async getPreferences(@User() user: AuthenticatedUser) {
    return await this.getPreferencesQuery.execute(user.sub);
  }

  @Version('1')
  @Patch()
  @AppResponse('PREFERENCES_UPDATED', AccountPreferencesDTO)
  async updatePreferences(@User() user: AuthenticatedUser, @Body() payload: UpdateAccountPreferencesDTO) {
    return await this.updatePreferencesCommand.execute(user.sub, payload);
  }
}
