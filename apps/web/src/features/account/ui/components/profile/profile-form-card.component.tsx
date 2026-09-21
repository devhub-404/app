import ProfileForm from './profile-form.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import SectionCard from '@/shared/ui/components/surfaces/section-card.component.tsx';

function ProfileFormCard() {
  return (
    <SectionCard>
      <ProfileForm />
    </SectionCard>
  );
}

export default withLocale(ProfileFormCard);
