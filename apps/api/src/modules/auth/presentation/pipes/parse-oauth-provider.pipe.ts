import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import type { OAuthProviderName } from '@/modules/auth/public/oauth';

const VALID_PROVIDERS: ReadonlySet<string> = new Set(['github', 'google']);

@Injectable()
export class ParseOAuthProviderPipe implements PipeTransform<string, OAuthProviderName> {
  transform(value: string): OAuthProviderName {
    if (!VALID_PROVIDERS.has(value)) {
      throw new BadRequestException(`Invalid OAuth provider: ${value}. Must be one of: github, google`);
    }

    return value as OAuthProviderName;
  }
}
