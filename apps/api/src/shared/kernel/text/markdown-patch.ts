import DiffMatchPatch from 'diff-match-patch';

const patcher = new DiffMatchPatch();

/** Applies a complete diff or returns null when it is invalid or exceeds the limit. */
export function applyMarkdownPatch(content: string, patchText: string, maxLength = 15000): string | null {
  try {
    const patches = patcher.patch_fromText(patchText);
    const [nextContent, results] = patcher.patch_apply(patches, content);
    if (results.some((applied) => !applied) || nextContent.length > maxLength) return null;

    return nextContent;
  } catch {
    return null;
  }
}

export function createMarkdownPatch(previousContent: string, nextContent: string): string {
  return patcher.patch_toText(patcher.patch_make(previousContent, nextContent));
}
