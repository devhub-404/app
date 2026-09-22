import { createMemo, Show } from "solid-js";
import { Pencil } from "lucide-solid";
import type { Project } from "@/features/project/types/project.type.ts";
import { canEditProject } from "@/features/project/access/project.access.ts";
import { useAccount } from "@/features/account/public/account-state";
import { useAppActor as useAuthSession } from "@/app/session/public";
import { anonymousActor, type Actor } from "@/features/auth/public/access";
import { routes } from "@/shared/navigation/routes";
import ShareButton from "@/shared/ui/components/actions/share-button.component.tsx";
import { ReportButton } from "@/features/report/public";
import type { Locale } from "@/shared/i18n/core";

type Props = {
  project: Pick<Project, "id" | "slug" | "title" | "authorAccountId">;
  shareLabel: string;
  copiedLabel: string;
  manageLabel: string;
  locale: Locale;
};

export default function ProjectActions(props: Props) {
  const { state: account } = useAccount();
  const { authenticated, role } = useAuthSession();
  const actor = createMemo<Actor>(() => {
    const details = account().details;
    if (!details || !authenticated()) return anonymousActor;
    return {
      accountId: details.account.id,
      role: role(),
      organizationIds: [],
      ownerOrganizationIds: [],
    };
  });
  const canEdit = createMemo(
    () => authenticated() && canEditProject(props.project, actor()),
  );

  return (
    <>
      <ShareButton
        title={props.project.title}
        url={routes.project(props.project.slug)}
        label={props.shareLabel}
        copiedLabel={props.copiedLabel}
      />
      <ReportButton
        target="resource"
        id={props.project.id}
        locale={props.locale}
      />
      <Show when={canEdit()}>
        <a
          href={routes.account.project(props.project.id)}
          title={props.manageLabel}
          aria-label={props.manageLabel}
          class="action action-ghost"
        >
          <Pencil class="size-4" aria-hidden="true" />
        </a>
      </Show>
    </>
  );
}
