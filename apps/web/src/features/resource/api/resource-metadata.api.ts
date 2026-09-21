export interface ResourceMetadata {
  title: string;
  description: string;
}

function meta(document: Document, property: string, name: string): string {
  return (
    document.querySelector(`meta[property="${property}"]`)?.getAttribute('content')?.trim() ||
    document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() ||
    ''
  );
}

export async function loadResourceMetadataFromUrl(url: string): Promise<ResourceMetadata> {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) throw new Error(`Metadata request failed with status ${response.status}`);

  const html = await response.text();
  const parsed = new DOMParser().parseFromString(html, 'text/html');

  return {
    title: meta(parsed, 'og:title', 'twitter:title') || parsed.title?.trim() || '',
    description: meta(parsed, 'og:description', 'twitter:description'),
  };
}
