import { IsBoolean, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCredentialDTO {
  @IsString() userId!: string;
  @IsIn(['password', 'oauth', 'passkey']) type!: 'password' | 'oauth' | 'passkey';
}

export class CreatePasswordCredentialDTO {
  @IsString() userId!: string;
  @IsString() verifier!: string;
  @IsString() opaqueUserIdentifier!: string;
}

export class CreateOAuthCredentialDTO {
  @IsString() userId!: string;
  @IsIn(['github', 'google']) provider!: 'github' | 'google';
  @IsString() providerUserId!: string;
}

export class CreatePasskeyCredentialDTO {
  @IsString() userId!: string;
  @IsString() webauthnId!: string;
  @IsString() publicKey!: string;
  @IsInt() counter!: number;
  @IsIn(['single_device', 'multi_device']) deviceType!: 'single_device' | 'multi_device';
  @IsBoolean() backedUp!: boolean;
  @IsOptional() transports!: string[] | null;
  @IsOptional() @IsString() deviceName!: string | null;
}
