import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export type JobStatus = 'published' | 'closed' | 'expired' | 'withdrawn';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';

export type JobState = {
  id: string;
  publisherOrganizationId: string | null;
  title: string;
  description: string;
  employmentType: EmploymentType;
  workplaceType: 'remote' | 'hybrid' | 'onsite';
  location: string | null;
  compensationMin: string | null;
  compensationMax: string | null;
  compensationCurrency: string | null;
  compensationUnit: 'hourly' | 'daily' | 'monthly' | 'yearly' | 'fixed_project' | null;
  applicationUrl: string;
  sourceUrl: string | null;
  status: JobStatus;
  publishedAt: string;
  expiresAt: string;
  closedAt: string | null;
  withdrawnAt: string | null;
  hiddenAt: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JobDetails = Pick<
  JobState,
  | 'title'
  | 'description'
  | 'employmentType'
  | 'workplaceType'
  | 'location'
  | 'compensationMin'
  | 'compensationMax'
  | 'compensationCurrency'
  | 'compensationUnit'
  | 'applicationUrl'
  | 'sourceUrl'
>;

export class Job {
  private constructor(private state: JobState) {}

  static rehydrate(state: JobState): Job {
    return new Job({ ...state });
  }

  static create(id: string, publisherOrganizationId: string | null, details: JobDetails, at = new Date()): Job {
    const normalized = Job.normalizeDetails(details);
    Job.validateDetails(normalized);
    const now = at.toISOString();

    return new Job({
      id,
      publisherOrganizationId,
      ...normalized,
      status: 'published',
      publishedAt: now,
      expiresAt: new Date(at.getTime() + 30 * 86_400_000).toISOString(),
      closedAt: null,
      withdrawnAt: null,
      hiddenAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id() {
    return this.state.id;
  }
  get publisherOrganizationId() {
    return this.state.publisherOrganizationId;
  }
  get status() {
    return this.state.status;
  }
  get employmentType() {
    return this.state.employmentType;
  }
  get publishedAt() {
    return this.state.publishedAt;
  }
  get expiresAt() {
    return this.state.expiresAt;
  }
  get closedAt() {
    return this.state.closedAt;
  }
  get withdrawnAt() {
    return this.state.withdrawnAt;
  }
  get hiddenAt() {
    return this.state.hiddenAt;
  }
  get deletedAt() {
    return this.state.deletedAt ?? null;
  }

  updateDetails(details: JobDetails): void {
    this.ensureAvailable();
    if (this.state.status === 'withdrawn') throw new DomainError('JOB_INVALID_STATUS');
    const normalized = Job.normalizeDetails(details);
    Job.validateDetails(normalized);
    Object.assign(this.state, normalized);
    this.state.updatedAt = new Date().toISOString();
  }

  delete(at = new Date()): void {
    this.ensureAvailable();
    this.state.deletedAt = at.toISOString();
    this.touch(at);
  }
  hide(at = new Date()): void {
    this.ensureAvailable();
    if (this.state.status === 'withdrawn') throw new DomainError('JOB_INVALID_STATUS');
    if (this.state.hiddenAt) return;
    this.state.hiddenAt = at.toISOString();
    this.touch(at);
  }
  unhide(at = new Date()): void {
    this.ensureAvailable();
    if (this.state.status === 'withdrawn') throw new DomainError('JOB_INVALID_STATUS');
    if (!this.state.hiddenAt) return;
    this.state.hiddenAt = null;
    this.touch(at);
  }

  static normalizeDetails(details: JobDetails): JobDetails {
    return {
      ...details,
      title: details.title.trim(),
      applicationUrl: Job.canonicalHttpsUrl(details.applicationUrl),
      sourceUrl: details.sourceUrl ? Job.canonicalHttpsUrl(details.sourceUrl) : null,
    };
  }

  static validateDetails(details: JobDetails): void {
    if (
      !details.title.trim() ||
      details.title.length > FIELD_LIMITS.title ||
      !details.description.trim() ||
      details.description.length > FIELD_LIMITS.body ||
      !['full_time', 'part_time', 'contract', 'internship', 'temporary'].includes(details.employmentType)
    )
      throw new DomainError('JOB_INVALID_DETAILS');
    if (details.location && details.location.length > FIELD_LIMITS.location)
      throw new DomainError('JOB_INVALID_DETAILS');
    const hasCompensation = details.compensationMin != null || details.compensationMax != null;
    if (
      hasCompensation &&
      (details.compensationMin == null || details.compensationCurrency == null || details.compensationUnit == null)
    )
      throw new DomainError('JOB_INVALID_COMPENSATION');
    if (details.compensationMax != null && Number(details.compensationMax) < Number(details.compensationMin))
      throw new DomainError('JOB_INVALID_COMPENSATION');
  }

  private static canonicalHttpsUrl(value: string): string {
    try {
      const canonical = canonicalizeHttpUrl(value);
      if (new URL(canonical).protocol !== 'https:') throw new Error();

      return canonical;
    } catch (error) {
      if (error instanceof InvalidHttpUrlError || error instanceof Error) throw new DomainError('JOB_INVALID_URL');

      throw error;
    }
  }

  close(at = new Date()): void {
    this.ensureAvailable();
    if (this.state.status !== 'published') throw new DomainError('JOB_INVALID_STATUS');
    this.state.status = 'closed';
    this.state.closedAt = at.toISOString();
    this.touch(at);
  }
  withdraw(at = new Date()): void {
    this.ensureAvailable();
    if (this.state.status === 'withdrawn') return;
    if (!['published', 'closed', 'expired'].includes(this.state.status)) throw new DomainError('JOB_INVALID_STATUS');
    this.state.status = 'withdrawn';
    this.state.withdrawnAt = at.toISOString();
    this.touch(at);
  }
  expire(at = new Date()): void {
    this.ensureAvailable();
    if (this.state.status !== 'published' || new Date(this.state.expiresAt) > at)
      throw new DomainError('JOB_INVALID_STATUS');
    this.state.status = 'expired';
    this.touch(at);
  }
  renew(at = new Date()): void {
    this.ensureAvailable();
    if (!['published', 'closed', 'expired'].includes(this.state.status)) throw new DomainError('JOB_INVALID_STATUS');
    const now = at.toISOString();
    this.state.status = 'published';
    this.state.publishedAt = now;
    this.state.expiresAt = new Date(at.getTime() + 30 * 86_400_000).toISOString();
    this.state.closedAt = null;
    this.touch(at);
  }

  snapshot(): JobState {
    return { ...this.state };
  }
  private ensureAvailable(): void {
    if (this.deletedAt) throw new DomainError('JOB_DELETED');
  }
  private touch(at: Date): void {
    this.state.updatedAt = at.toISOString();
  }
}
