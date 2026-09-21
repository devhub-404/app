// Server-only public entrypoint. Keep SSR transports out of client imports.
export { resolveSession, type SessionProjection, type SessionResolution } from '../api/session-server.api.ts';
