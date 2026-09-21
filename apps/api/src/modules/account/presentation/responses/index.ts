import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';

export const AUTH_RESPONSES = {
  CURRENT_USER_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Identidade obtida',
  },
  PASSWORD_REGISTRATION_STARTED: {
    status: HttpStatus.OK,
    message: 'Registro de senha iniciado',
  },
  PASSWORD_REGISTRATION_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Registro de senha concluído',
  },
  PASSWORD_LOGIN_STARTED: {
    status: HttpStatus.OK,
    message: 'Login com senha iniciado',
  },
  PASSWORD_LOGIN_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Login com senha concluído',
  },
  ACCOUNT_RECOVERY_STARTED: {
    status: HttpStatus.OK,
    message: 'Recuperação de conta solicitada',
  },
  ACCOUNT_RECOVERY_PREPARED: {
    status: HttpStatus.OK,
    message: 'Recuperação de conta preparada',
  },
  ACCOUNT_RECOVERED: {
    status: HttpStatus.OK,
    message: 'Recuperação de conta concluída',
  },
  ACCOUNT_DEACTIVATED: {
    status: HttpStatus.OK,
    message: 'Conta desativada',
  },
  ACCOUNT_REACTIVATED: {
    status: HttpStatus.OK,
    message: 'Conta reativada',
  },
  ACCOUNT_DELETION_CANCELLED: {
    status: HttpStatus.OK,
    message: 'Exclusão de conta cancelada',
  },
  USERNAME_AVAILABILITY_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Disponibilidade de username obtida',
  },
  RESTORE_ACCESS_ISSUED: {
    status: HttpStatus.OK,
    message: 'Acesso restaurado',
  },
  PASSWORD_CREDENTIAL_CREATE_STARTED: {
    status: HttpStatus.OK,
    message: 'Adição de senha iniciada',
  },
  PASSWORD_CREDENTIAL_CREATED: {
    status: HttpStatus.OK,
    message: 'Adição de senha concluída',
  },
  PASSWORD_RECOVERY_ACKNOWLEDGED: {
    status: HttpStatus.OK,
    message: 'Recuperação de senha solicitada',
  },
  PASSWORD_RECOVERY_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Recuperação de senha concluída',
  },
  PASSWORD_RECOVERY_PREPARED: {
    status: HttpStatus.OK,
    message: 'Recuperação de senha preparada',
  },
  PASSWORD_CHANGE_STARTED: {
    status: HttpStatus.OK,
    message: 'Alteração de senha iniciada',
  },
  AUTHENTICATION_METHODS_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Métodos de autenticação recuperados',
  },
  PASSWORD_CHANGED: {
    status: HttpStatus.OK,
    message: 'Alteração de senha concluída',
  },
  EMAIL_VERIFICATION_STARTED: {
    status: HttpStatus.OK,
    message: 'Verificação de email solicitada',
  },
  EMAIL_VERIFIED: {
    status: HttpStatus.OK,
    message: 'Email verificado',
  },
  PRIMARY_EMAIL_CHANGE_STARTED: {
    status: HttpStatus.OK,
    message: 'Troca de email principal solicitada',
  },
  PRIMARY_EMAIL_CHANGED: {
    status: HttpStatus.OK,
    message: 'Email principal alterado',
  },
  BACKUP_EMAIL_CHANGE_STARTED: {
    status: HttpStatus.OK,
    message: 'Troca de email backup solicitada',
  },
  BACKUP_EMAIL_CHANGED: {
    status: HttpStatus.OK,
    message: 'Email backup alterado',
  },
  BACKUP_EMAIL_DELETED: {
    status: HttpStatus.OK,
    message: 'Email backup removido',
  },
  TOTP_ENROLLMENT_STARTED: {
    status: HttpStatus.OK,
    message: 'MFA TOTP iniciado',
  },
  TOTP_ENROLLMENT_COMPLETED: {
    status: HttpStatus.OK,
    message: 'MFA TOTP concluído',
  },
  TOTP_DISABLED: {
    status: HttpStatus.OK,
    message: 'MFA TOTP removido',
  },
  TOTP_VERIFIED: {
    status: HttpStatus.OK,
    message: 'MFA TOTP verificado',
  },
  RECOVERY_CODE_VERIFIED: {
    status: HttpStatus.OK,
    message: 'MFA recovery code verificado',
  },
  RECOVERY_CODES_REGENERATED: {
    status: HttpStatus.OK,
    message: 'Recovery codes regenerados',
  },
  SESSIONS_LISTED: {
    status: HttpStatus.OK,
    message: 'Sessões listadas',
  },
  CURRENT_SESSION_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Sessão obtida',
  },
  TOKENS_REFRESHED: {
    status: HttpStatus.OK,
    message: 'Sessão renovada',
  },
  CURRENT_SESSION_REVOKED: {
    status: HttpStatus.OK,
    message: 'Sessão revogada',
  },
  OTHER_SESSIONS_REVOKED: {
    status: HttpStatus.OK,
    message: 'Outras sessões revogadas',
  },
  SESSION_REVOKED: {
    status: HttpStatus.OK,
    message: 'Sessão revogada',
  },
  SESSIONS_REVOKED: {
    status: HttpStatus.OK,
    message: 'Sessões revogadas',
  },
  EMAIL_AVAILABILITY_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Disponibilidade de email verificada',
  },
  MAGIC_LINK_LOGIN_STARTED: {
    status: HttpStatus.OK,
    message: 'Magic link solicitado',
  },
  MAGIC_LINK_LOGIN_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Login com magic link concluído',
  },
  OAUTH_LOGIN_STARTED: {
    status: HttpStatus.OK,
    message: 'Login OAuth iniciado',
  },
  OAUTH_LOGIN_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Login OAuth concluído',
  },
  OAUTH_LINK_STARTED: {
    status: HttpStatus.OK,
    message: 'Vinculação OAuth iniciada',
  },
  OAUTH_LINKED: {
    status: HttpStatus.OK,
    message: 'Vinculação OAuth concluída',
  },
  PASSKEY_LOGIN_STARTED: {
    status: HttpStatus.OK,
    message: 'Login com passkey iniciado',
  },
  PASSKEY_LOGIN_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Login com passkey concluído',
  },
  PASSKEY_REGISTRATION_STARTED: {
    status: HttpStatus.OK,
    message: 'Registro de passkey iniciado',
  },
  PASSKEY_REGISTERED: {
    status: HttpStatus.OK,
    message: 'Registro de passkey concluído',
  },
  PASSKEY_DEVICE_NAME_UPDATED: {
    status: HttpStatus.OK,
    message: 'Passkey atualizado',
  },
  CREDENTIAL_DELETED: {
    status: HttpStatus.OK,
    message: 'Credencial removida',
  },
  PASSKEY_DEVICES_LISTED: {
    status: HttpStatus.OK,
    message: 'Dispositivos passkey listados',
  },
  MFA_CONFIGURATION_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Configuração MFA recuperada',
  },
  POSSESSION_PROOF_STARTED: {
    status: HttpStatus.OK,
    message: 'Código de prova de posse enviado',
  },
  POSSESSION_PROOF_COMPLETED: {
    status: HttpStatus.OK,
    message: 'Prova de posse concluída',
  },
  EMAIL_VERIFICATION_RESENT: {
    status: HttpStatus.OK,
    message: 'Verificação de email reenviada',
  },
  AUTH_INVALID_CREDENTIAL: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Credencial inválida',
  },
  AUTH_PASSWORD_ALREADY_SET: {
    status: HttpStatus.CONFLICT,
    message: 'Senha já configurada',
  },
  AUTH_REQUIRED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Autenticacao recente obrigatoria',
  },
  AUTH_TOKEN_INVALID: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Token inválido',
  },
  AUTH_TOO_MANY_ATTEMPTS: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    message: 'Muitas tentativas',
  },
  ACCOUNT_DELETED: {
    status: HttpStatus.OK,
    message: 'Conta deletada',
  },
} as const satisfies ResponseMetadata;

export const USER_RESPONSES = {
  USER_ALREADY_EXISTS: {
    status: HttpStatus.CONFLICT,
    message: 'Usuário já existe',
  },
  USER_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Usuário não encontrado',
  },
  USER_LAST_CREDENTIAL: {
    status: HttpStatus.CONFLICT,
    message: 'Nao e possivel remover a ultima credencial',
  },
  USER_CANNOT_AUTHENTICATE: {
    status: HttpStatus.FORBIDDEN,
    message: 'Conta nao pode autenticar',
  },
  AUTH_MFA_ALREADY_ENABLED: {
    status: HttpStatus.CONFLICT,
    message: 'MFA já habilitado',
  },
  AUTH_MFA_NOT_ENABLED: {
    status: HttpStatus.CONFLICT,
    message: 'MFA não habilitado',
  },
  USER_SUSPENDED: {
    status: HttpStatus.OK,
    message: 'Usuário suspenso',
  },
  USER_UNSUSPENDED: {
    status: HttpStatus.OK,
    message: 'Suspensão removida',
  },
  USER_BANNED: {
    status: HttpStatus.OK,
    message: 'Usuário banido',
  },
  USER_UNBANNED: {
    status: HttpStatus.OK,
    message: 'Ban removido',
  },
  USER_ROLES_UPDATED: {
    status: HttpStatus.OK,
    message: 'Roles atualizadas',
  },
  USERS_LISTED: {
    status: HttpStatus.OK,
    message: 'Usuários listados',
  },
  USER_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Usuário obtido',
  },
  USER_INVALID_ROLE: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Role inválida',
  },
  USER_INVALID_STATUS: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Estado de usuário inválido',
  },
  PROFILE_ALREADY_EXISTS: {
    status: HttpStatus.CONFLICT,
    message: 'Profile já existe',
  },
  PREFERENCES_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Preferências obtidas',
  },
  PREFERENCES_UPDATED: {
    status: HttpStatus.OK,
    message: 'Preferências atualizadas',
  },
  PROFILE_RETRIEVED: {
    status: HttpStatus.OK,
    message: 'Perfil obtido',
  },
  PROFILES_LISTED: {
    status: HttpStatus.OK,
    message: 'Perfis listados',
  },
  PROFILE_UPDATED: {
    status: HttpStatus.OK,
    message: 'Perfil atualizado',
  },
  USER_PREFERENCES_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Preferências não encontradas',
  },
  PROFILE_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    message: 'Perfil não encontrado',
  },
  USER_PROFILE_INVALID_DISPLAY_NAME: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Display name inválido',
  },
  USER_PROFILE_INVALID_AVATAR_URL: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Avatar URL inválida',
  },
  USER_PROFILE_INVALID_PORTFOLIO_URL: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Portfolio URL inválida',
  },
  USER_PROFILE_INVALID_SOCIAL_LINK: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Link social inválido',
  },
} as const satisfies ResponseMetadata;

export const SESSION_RESPONSES = {
  AUTH_SESSION_EXPIRED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Sessão expirada',
  },
  AUTH_SESSION_REVOKED: {
    status: HttpStatus.UNAUTHORIZED,
    message: 'Sessão revogada',
  },
} as const satisfies ResponseMetadata;
