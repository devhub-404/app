import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class PasswordLoginFinishDTO {
  @IsEmail()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @ApiProperty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  serverLoginState!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  finishLoginRequest!: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  deviceName?: string;
}
