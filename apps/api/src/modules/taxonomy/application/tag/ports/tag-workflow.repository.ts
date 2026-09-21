export abstract class TagWorkflowRepository {
  abstract resolveMergedTag(sourceTagId: string): Promise<string | null>;
  abstract createMerge(input: { sourceTagId: string; targetTagId: string; mergedById: string }): Promise<void>;
}
