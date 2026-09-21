export function finalizeResponse(response: Response, request: Request, serverTiming?: string): Response {
  // Astro/Cloudflare can hand middleware an immutable Response.
  response = new Response(response.body, response);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (serverTiming) {
    const existingTiming = response.headers.get('Server-Timing');
    response.headers.set('Server-Timing', existingTiming ? `${existingTiming}, ${serverTiming}` : serverTiming);
  }
  if (new URL(request.url).protocol === 'https:')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}
