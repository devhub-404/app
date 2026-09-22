import { notifyError } from "@/shared/ui/feedback/notifications";
import Field from "@/shared/ui/components/forms/field.component.tsx";
import { createForm, setValues } from "@modular-forms/solid";
import { useStore } from "@nanostores/solid";
import { ExternalLink, Pencil, Save } from "lucide-solid";
import { zodForm } from "@/shared/ui/forms/zod-form";
import type { UpdateProfileDTO } from "@/features/account/types/profile.type.ts";
import {
  createUpdateProfileSchema,
  type UpdateProfileFormInput,
} from "@/features/account/ui/schemas/profile/forms.schema.ts";
import { $account } from "@/features/account/store/account-projection.store";
import { updateMyProfile } from "@/features/account/actions/profile.action.ts";
import { bootstrapAccount } from "@/features/account/actions/account.action.ts";
import { uploadImage } from "@/shared/media/media.service";
import { routes } from "@/shared/navigation/routes";
import { withLocale } from "@/shared/i18n/core/solid";
import { useI18n } from "@/features/account/i18n";
import UserAvatar from "../user-avatar.component.tsx";
import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";
function ProfileForm() {
  const { t, locale } = useI18n();
  const textFields = [
    ["displayName", t("profileform.name"), t("profileform.nameAlternative2")],
    [
      "headline",
      t("profileform.headline"),
      t("profileform.backendEngineerFocusedSystemsDistributed"),
    ],
    ["location", t("profileform.location"), t("profileform.locationExample")],
    ["portfolioUrl", t("profileform.portfolio"), "https://..."],
    ["githubUrl", "GitHub", "https://github.com/..."],
    ["linkedinUrl", "LinkedIn", "https://linkedin.com/in/..."],
    ["twitterUrl", "Twitter/X", "https://x.com/..."],
  ] as const;
  const account = useStore($account);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [hydrated, setHydrated] = createSignal(false);
  const [currentUsername, setCurrentUsername] = createSignal("");
  const [avatarFile, setAvatarFile] = createSignal<File | null>(null);
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null);
  let avatarInput: HTMLInputElement | undefined;
  const [form, { Form, Field: FormField }] = createForm<UpdateProfileFormInput>(
    {
      validate: zodForm(createUpdateProfileSchema(locale())),
      validateOn: "submit",
      revalidateOn: "input",
    },
  );

  onMount(() => {
    void bootstrapAccount();
  });

  createEffect(() => {
    const state = account();
    const profile = state.details?.profile;
    if (!hydrated() && profile) {
      setValues(form, {
        username: profile.username ?? "",
        displayName: profile.displayName ?? "",
        headline: profile.headline ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        avatarMediaId: undefined,
        portfolioUrl: profile.portfolioUrl ?? "",
        githubUrl: profile.githubUrl ?? "",
        linkedinUrl: profile.linkedinUrl ?? "",
        twitterUrl: profile.twitterUrl ?? "",
      });
      setCurrentUsername(profile.username ?? "");
      setHydrated(true);
    }
    if (state.status !== "loading") setLoading(false);
  });

  onCleanup(() => {
    const preview = avatarPreview();
    if (preview) URL.revokeObjectURL(preview);
  });

  const avatarName = () =>
    account().details?.profile.displayName ??
    account().details?.profile.username ??
    "";
  const avatarUrl = () =>
    avatarPreview() ?? account().details?.profile.avatarUrl ?? null;
  const handleAvatarChange = (
    event: Event & { currentTarget: HTMLInputElement },
  ) => {
    const file = event.currentTarget.files?.[0] ?? null;
    const previousPreview = avatarPreview();
    if (previousPreview) URL.revokeObjectURL(previousPreview);
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const save = async (values: UpdateProfileFormInput) => {
    setError(null);
    const parsed = createUpdateProfileSchema(locale()).safeParse(values);
    if (!parsed.success) {
      setError(t("profileform.dataInvalid"));
      return;
    }

    let payload: UpdateProfileDTO = parsed.data;
    const file = avatarFile();
    if (file) {
      const uploaded = await uploadImage(file, "avatar");
      if (uploaded.error || !uploaded.data?.data?.mediaId) {
        notifyError(uploaded.error?.code);
        setError(t("profileform.couldNotSendAvatar"));
        return;
      }
      payload = { ...payload, avatarMediaId: uploaded.data.data.mediaId };
    } else {
      const { avatarMediaId: _, ...rest } = payload;
      payload = rest;
    }
    const updated = await updateMyProfile(payload);
    if (updated) {
      const preview = avatarPreview();
      if (preview) URL.revokeObjectURL(preview);
      setAvatarFile(null);
      setAvatarPreview(null);
      if (avatarInput) avatarInput.value = "";
    }
  };

  return (
    <Show
      when={!loading()}
      fallback={<p class="text-muted">{t("profileform.loading")}</p>}
    >
      <Form class="flex flex-col gap-4" onSubmit={save}>
        <Field>
          <label for="profile-avatar" class="field-label">
            {t("profileform.avatarOptionalUpTo1Mib")}
          </label>
          <div class="flex items-center gap-4">
            <div class="relative size-20 shrink-0">
              <UserAvatar
                src={avatarUrl()}
                name={avatarName()}
                alt={t("profileform.avatarAlt")}
                class="grid size-20 place-items-center overflow-hidden rounded-2xl border border-line bg-action-subtle text-lg font-extrabold text-content-accent"
              />
              <button
                type="button"
                aria-label={t("profileform.changeAvatar")}
                onClick={() => avatarInput?.click()}
                class="action action-ghost"
              >
                <Pencil class="size-5" aria-hidden="true" />
              </button>
            </div>
            <div class="min-w-0">
              <p class="text-strong">{t("profileform.changeAvatar")}</p>
              <p class="text-muted-compact mt-1">
                {t("profileform.avatarOptionalUpTo1Mib")}
              </p>
              <input
                ref={(element) => (avatarInput = element)}
                id="profile-avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="sr-only"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </Field>

        <Field>
          <label for="profile-username" class="field-label">
            {t("profileform.usernameAlternative2")}
          </label>
          <FormField name="username">
            {(field, fieldProps) => (
              <>
                <input
                  {...fieldProps}
                  id="profile-username"
                  value={field.value ?? ""}
                  onInput={fieldProps.onInput}
                  placeholder={t("profileform.username")}
                  class="field-control"
                />
                <Show when={field.error}>
                  {(message) => (
                    <span role="alert" class="field-error">
                      {message()}
                    </span>
                  )}
                </Show>
              </>
            )}
          </FormField>
        </Field>

        <div class="grid gap-4 sm:grid-cols-2">
          <For each={textFields}>
            {([name, label, placeholder]) => (
              <Field>
                <label for={`profile-${name}`} class="field-label">
                  {label}
                </label>
                <FormField name={name}>
                  {(field, fieldProps) => (
                    <>
                      <input
                        {...fieldProps}
                        id={`profile-${name}`}
                        value={(field.value as string | null) ?? ""}
                        placeholder={placeholder}
                        class="field-control"
                      />
                      <Show when={field.error}>
                        {(message) => (
                          <span role="alert" class="field-error">
                            {message()}
                          </span>
                        )}
                      </Show>
                    </>
                  )}
                </FormField>
              </Field>
            )}
          </For>
        </div>

        <Field>
          <label for="profile-bio" class="field-label">
            {t("profileform.bio")}
          </label>
          <FormField name="bio">
            {(field, fieldProps) => (
              <textarea
                {...fieldProps}
                id="profile-bio"
                rows={5}
                value={field.value ?? ""}
                placeholder={t("profileform.tellBrieflyAboutYou")}
                class="field-control resize-y"
              />
            )}
          </FormField>
        </Field>

        <p class="text-caption">
          {t("profileform.profileTagsDescribeTechnologiesNotSeniorityOrRole")}
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={form.submitting}
            class="action action-primary"
          >
            <Save class="size-4" />
            {form.submitting ? t("profile.saving") : t("profileform.save")}
          </button>
          <Show when={currentUsername()}>
            <a
              href={routes.profile(currentUsername())}
              target="_blank"
              rel="noreferrer"
              class="action action-secondary"
            >
              <ExternalLink class="size-4" />{" "}
              {t("profileform.viewProfilePublic")}
            </a>
          </Show>
        </div>
        <Show when={error()}>
          {(message) => (
            <p role="alert" class="text-danger">
              {message()}
            </p>
          )}
        </Show>
      </Form>
    </Show>
  );
}

export default withLocale(ProfileForm);
