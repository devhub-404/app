import { DomainError } from '@/shared/errors/domain-error';
import { canonicalizeHttpUrl, InvalidHttpUrlError } from '@/shared/kernel/url/canonical-http-url';
import { FIELD_LIMITS } from '@/shared/kernel/validation/field-limits';

export type ProjectStatus = 'draft' | 'published' | 'archived';
export type ProjectState = {
  id: string;
  authorAccountId: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  projectUrl: string | null;
  repositoryUrl: string | null;
  status: ProjectStatus;
  publishedAt: string | null;
  hiddenAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export class Project {
  private constructor(private readonly state: ProjectState) {}

  static create(
    input: Omit<ProjectState, 'status' | 'publishedAt' | 'hiddenAt' | 'deletedAt' | 'createdAt' | 'updatedAt'>,
    at = new Date(),
  ): Project {
    if (!input.authorAccountId) throw new DomainError('PROJECT_AUTHOR_REQUIRED');
    const now = at.toISOString();
    const project = new Project({
      ...input,
      projectUrl: input.projectUrl ? Project.canonicalUrl(input.projectUrl) : null,
      repositoryUrl: input.repositoryUrl ? Project.canonicalUrl(input.repositoryUrl) : null,
      status: 'draft',
      publishedAt: null,
      hiddenAt: null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });
    project.validateDetails();

    return project;
  }

  static rehydrate(state: ProjectState): Project {
    return new Project({ ...state });
  }
  get value(): ProjectState {
    return { ...this.state };
  }

  update(
    input: Partial<Pick<ProjectState, 'title' | 'summary' | 'description' | 'projectUrl' | 'repositoryUrl'>>,
  ): void {
    this.ensureNotDeleted();
    Object.assign(this.state, input);
    if (input.projectUrl !== undefined)
      this.state.projectUrl = input.projectUrl ? Project.canonicalUrl(input.projectUrl) : null;
    if (input.repositoryUrl !== undefined)
      this.state.repositoryUrl = input.repositoryUrl ? Project.canonicalUrl(input.repositoryUrl) : null;
    this.validateDetails();
    this.touch();
  }

  publish(at = new Date()): void {
    this.transition('draft', 'published', at);
    this.state.publishedAt = at.toISOString();
  }
  archive(at = new Date()): void {
    this.transition('published', 'archived', at);
  }
  unarchive(at = new Date()): void {
    this.transition('archived', 'published', at);
  }
  delete(at = new Date()): void {
    this.ensureNotDeleted();
    this.state.deletedAt = at.toISOString();
    this.touch(at);
  }
  hide(at = new Date()): void {
    this.ensureNotDeleted();
    if (this.state.hiddenAt) return;
    this.state.hiddenAt = at.toISOString();
    this.touch(at);
  }
  unhide(at = new Date()): void {
    this.ensureNotDeleted();
    if (!this.state.hiddenAt) return;
    this.state.hiddenAt = null;
    this.touch(at);
  }

  private transition(from: ProjectStatus, to: ProjectStatus, at: Date): void {
    this.ensureNotDeleted();
    if (this.state.status !== from) throw new DomainError('PROJECT_INVALID_STATUS');
    this.state.status = to;
    this.touch(at);
  }
  private validateDetails(): void {
    if (this.state.title.trim().length < 2 || this.state.title.length > FIELD_LIMITS.title)
      throw new DomainError('PROJECT_INVALID_TITLE');
    if (this.state.summary.length < 1 || this.state.summary.length > FIELD_LIMITS.shortDescription)
      throw new DomainError('PROJECT_INVALID_SUMMARY');
    if (this.state.description.length < 1 || this.state.description.length > FIELD_LIMITS.body)
      throw new DomainError('PROJECT_INVALID_DESCRIPTION');
  }
  private static canonicalUrl(value: string): string {
    try {
      return canonicalizeHttpUrl(value);
    } catch (error) {
      if (error instanceof InvalidHttpUrlError) throw new DomainError('PROJECT_INVALID_URL');

      throw error;
    }
  }

  private ensureNotDeleted(): void {
    if (this.state.deletedAt) throw new DomainError('PROJECT_DELETED');
  }
  private touch(at = new Date()): void {
    this.state.updatedAt = at.toISOString();
  }
}
