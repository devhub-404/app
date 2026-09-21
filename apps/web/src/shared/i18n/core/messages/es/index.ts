import { messages as en } from '../en';

// The pilot keeps the API-code catalog total while the domain messages are
// migrated incrementally. Untranslated codes intentionally fall back to the
// English wording until their Spanish copy is reviewed.
export const messages = {
  ...en,
  DEFAULT_SUCCESS: 'Operación completada correctamente',
  DEFAULT_ERROR: 'Algo salió mal. Inténtalo de nuevo',
  DEFAULT_INFO: 'Operación completada',
  UNAUTHORIZED: 'No autenticado',
  FORBIDDEN: 'Sin permiso',
  INVALID_EMAIL: 'Correo electrónico no válido',
  INVALID_URL: 'URL no válida',
  INTERNAL_SERVER_ERROR: 'Error interno del servidor',
  NETWORK_REQUEST_FAILED: 'No se pudo completar la solicitud. Comprueba tu conexión e inténtalo de nuevo',
  AUTH_REGISTERED: 'Cuenta creada',
  AUTH_LOGGED_IN: 'Sesión iniciada',
  AUTH_LOGGED_OUT: 'Sesión cerrada',
  AUTH_INVALID_CREDENTIAL: 'Credenciales no válidas',
  AUTH_TOO_MANY_ATTEMPTS: 'Demasiados intentos. Inténtalo más tarde',
  USER_PREFERENCES_UPDATED: 'Preferencias actualizadas',
} as const;
