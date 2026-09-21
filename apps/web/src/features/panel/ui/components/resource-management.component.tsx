import ResourcesAdminList from '@/features/panel/ui/components/resources-admin-list.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';

function ResourceManagement() {
  return <ResourcesAdminList />;
}

export default withLocale(ResourceManagement);
