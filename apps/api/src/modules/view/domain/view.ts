import { DomainError } from '@/shared/errors/domain-error';

export type ViewState = { accountId: string; resourceId: string; createdAt: string };

export class View {
  private constructor(private readonly state: ViewState) {}

  static record(input: Omit<ViewState, 'createdAt'>, at = new Date()): View {
    if (!input.accountId.trim() || !input.resourceId.trim()) throw new DomainError('VIEW_INVALID_REFERENCE');

    return new View({ ...input, createdAt: at.toISOString() });
  }

  static rehydrate(state: ViewState): View {
    return new View({ ...state });
  }
  get value(): ViewState {
    return { ...this.state };
  }
}
