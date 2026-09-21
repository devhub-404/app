export const catalog = {
  'lifecycle.deletionLoading': 'Cancelling deletion…',
  'lifecycle.deletionTitle': 'Deletion cancelled',
  'lifecycle.deletionBody': 'The deletion request was cancelled. For security, sign in again to create a new session.',
  'lifecycle.login': 'Go to sign in',
  'lifecycle.deletionErrorTitle': 'Deletion could not be cancelled',
  'lifecycle.deletionErrorBody':
    'The link may have expired, already been used, or the retention window may have ended.',
  'lifecycle.deletionMetaTitle': 'DevHub — Cancel deletion',
  'lifecycle.deletionMetaDescription': 'Cancel your account deletion during the retention window.',
  'lifecycle.reactivationLoading': 'Reactivating account…',
  'lifecycle.reactivationTitle': 'Confirm MFA',
  'lifecycle.reactivationBody':
    'The account was reactivated, but a session will only be created after a valid second factor.',
  'lifecycle.reactivationTotp': 'Authenticator code',
  'lifecycle.codeRequired': 'Enter a code.',
  'lifecycle.reactivationRecovery': 'Recovery code',
  'lifecycle.reactivationConfirm': 'Confirm code',
  'lifecycle.reactivationUseRecovery': 'Use recovery code',
  'lifecycle.reactivationError': 'The account could not be reactivated.',
  'lifecycle.reactivationLogin': 'Back to sign in',
  'lifecycle.reactivationMetaTitle': 'DevHub — Reactivate account',
  'lifecycle.reactivationMetaDescription': 'Reactivate your account with a valid proof.',
} as const;
