import type { UserListItemDTO } from '@/features/panel/types/panel.type.ts';
import { formatLocalizedDate, type Locale } from '@/shared/i18n/core';
import { useI18n } from '@/features/panel/i18n';

function identityText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  for (const key of ['username', 'email', 'address', 'value', 'name']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return null;
}

export default function UserAdminSummary(props: { item: UserListItemDTO; locale: Locale }) {
  const { t } = useI18n();
  const username = () => identityText(props.item.username);
  const email = () => identityText(props.item.email);
  const heading = () => (username() ? `@${username()}` : (email() ?? props.item.id));

  return (
    <section class="grid gap-3 text-sm text-content" aria-labelledby="user-admin-summary-heading">
      <div class="grid gap-1">
        <h2 id="user-admin-summary-heading" class="heading-card text-lg">
          {heading()}
        </h2>
        <p class="text-caption break-all">
          {props.item.id}
        </p>
        {email() && username() ? <p class="text-caption">{email()}</p> : null}
      </div>
      <dl class="grid gap-2 text-xs sm:grid-cols-2">
        <div class="grid gap-0.5">
          <dt class="text-content-muted">{t('useradmindetail.statusVoluntary')}</dt>
          <dd class="font-semibold text-content">{props.item.voluntaryStatus}</dd>
        </div>
        <div class="grid gap-0.5">
          <dt class="text-content-muted">{t('useradmindetail.moderation')}</dt>
          <dd class="font-semibold text-content">{props.item.moderationStatus}</dd>
        </div>
        <div class="grid gap-0.5">
          <dt class="text-content-muted">{t('useradmindetail.softDelete')}</dt>
          <dd class="font-semibold text-content">
            {props.item.deletionStatus === 'pending' ? t('useradmindetail.requested') : t('useradmindetail.no')}
          </dd>
        </div>
        <div class="grid gap-0.5">
          <dt class="text-content-muted">{t('useradmindetail.mfa')}</dt>
          <dd class="font-semibold text-content">
            {props.item.mfaEnabled ? t('useradmindetail.ready') : t('useradmindetail.notConfigured')}
          </dd>
        </div>
        <div class="grid gap-0.5">
          <dt class="text-content-muted">{t('useradmindetail.role')}</dt>
          <dd class="font-semibold text-content">{props.item.role ?? t('useradmindetail.regularAccount')}</dd>
        </div>
        <div class="grid gap-0.5">
          <dt class="text-content-muted">{t('useradmindetail.lockedUntil')}</dt>
          <dd class="font-semibold text-content">
            {props.item.lockedUntil ? formatLocalizedDate(props.item.lockedUntil, props.locale) : '—'}
          </dd>
        </div>
      </dl>
      <p class="text-caption">
        {t('useradmindetail.created')} {formatLocalizedDate(props.item.createdAt, props.locale)}
      </p>
    </section>
  );
}
