import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { JwtTokenType } from './jwt-token-type';

export class OAuthStateTokenDTO {
  @IsString()
  @ApiProperty()
  state!: string;

  @IsIn(['login', 'link'])
  @ApiProperty({ enum: ['login', 'link'] })
  action!: 'login' | 'link';

  @IsIn(['github', 'google'])
  @ApiProperty({ enum: ['github', 'google'] })
  provider!: 'github' | 'google';

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, nullable: true })
  userId?: string;

  @IsIn([JwtTokenType.OAUTH_STATE])
  @ApiProperty({ enum: [JwtTokenType.OAUTH_STATE] })
  type!: JwtTokenType.OAUTH_STATE;
}
