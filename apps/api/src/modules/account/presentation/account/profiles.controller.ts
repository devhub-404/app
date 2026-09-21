import { Body, Controller, Get, Param, Patch, UseGuards, Version } from '@nestjs/common';
import { AppResponse } from '@/shared/nest/http/app-response.decorator';
import { GetProfileByUsernameQuery } from '@/modules/account/application/profile/use-cases/query/get-profile-by-username.query';
import { GetMyProfileQuery } from '@/modules/account/application/profile/use-cases/query/get-my-profile.query';
import { UpdateMyProfileCommand } from '@/modules/account/application/profile/use-cases/command/update-my-profile.command';
import { GetProfileByUsernameQueryDTO, UpdateProfileDTO } from '@/modules/account/application/profile/dtos/in';
import { ProfileDTO, PublicProfileDTO } from '@/modules/account/application/profile/dtos/out';
import { AuthGuard } from '@/modules/auth/public/http';
import { User } from '@/modules/auth/public/http';
import { Public } from '@/shared/nest/decorators/public';
import type { User as AuthenticatedUser } from '@/shared/kernel/auth/authenticated-user';

@Controller('profiles')
@UseGuards(AuthGuard)
export class ProfilesController {
  constructor(
    private readonly getMeProfileQuery: GetMyProfileQuery,
    private readonly getProfileByUsernameQuery: GetProfileByUsernameQuery,
    private readonly updateMeProfileCommand: UpdateMyProfileCommand,
  ) {}

  @Version('1')
  @Get('me')
  @AppResponse('PROFILE_RETRIEVED', ProfileDTO)
  getMeProfile(@User() user: AuthenticatedUser) {
    return this.getMeProfileQuery.execute(user.sub);
  }

  @Version('1')
  @Get(':username')
  @Public()
  @AppResponse('PROFILE_RETRIEVED', PublicProfileDTO)
  getByUsername(@Param() params: GetProfileByUsernameQueryDTO) {
    return this.getProfileByUsernameQuery.execute(params.username);
  }

  @Version('1')
  @Patch('me')
  @AppResponse('PROFILE_UPDATED', ProfileDTO)
  updateMeProfile(@User() user: AuthenticatedUser, @Body() payload: UpdateProfileDTO) {
    return this.updateMeProfileCommand.execute(user.sub, payload);
  }
}
