export type ShareOrCopyResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export async function shareOrCopy(title: string, url: string): Promise<ShareOrCopyResult> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title, url });
      return 'shared';
    }

    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
    return 'failed';
  }
}
