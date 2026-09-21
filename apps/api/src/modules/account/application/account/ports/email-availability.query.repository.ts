export abstract class EmailAvailabilityQueryRepository {
  abstract isEmailAvailable(email: string): Promise<boolean>;
}
