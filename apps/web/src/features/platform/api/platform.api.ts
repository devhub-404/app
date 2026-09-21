import { publicClient } from '@/shared/api';
export class PlatformApi {
  static health() {
    return publicClient.GET('/api/v1/platform/health');
  }
  static readiness() {
    return publicClient.GET('/api/v1/platform/readiness');
  }
}
