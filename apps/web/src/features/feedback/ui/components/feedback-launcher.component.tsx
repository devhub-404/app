import { createSignal, Show } from "solid-js";
import { createForm, reset, setResponse, setValue } from "@modular-forms/solid";
import { zodForm } from "@/shared/ui/forms/zod-form";
import {
  Bug,
  ImagePlus,
  Lightbulb,
  MessageSquareWarning,
  Send,
  X,
} from "lucide-solid";
import { uploadImage } from "@/shared/media/media.service";
import { useAppActor as useAuthSession } from "@/app/session/public";
import { submitFeedback } from "@/features/feedback/actions/feedback.action.ts";
import type { FeedbackCategory } from "@/features/feedback/types/feedback.type.ts";
import { redirectTo } from "@/shared/utils/redirect.util.ts";
import { getReturnToFromLocation } from "@/shared/utils/location.util.ts";

import { withLocale } from "@/shared/i18n/core/solid";
import { useI18n } from "@/features/feedback/i18n";
import {
  createFeedbackFormSchema,
  type FeedbackFormInput,
} from "@/features/feedback/ui/schemas/forms.schema.ts";

function FeedbackLauncher() {
  const { t, locale } = useI18n();
  const categories: Array<{
    value: FeedbackCategory;
    label: string;
    icon: typeof Bug;
  }> = [
    { value: "bug", label: t("feedback.category.bug"), icon: Bug },
    {
      value: "issue",
      label: t("feedback.category.issue"),
      icon: MessageSquareWarning,
    },
    {
      value: "suggestion",
      label: t("feedbacklauncher.suggestion"),
      icon: Lightbulb,
    },
  ];
  const auth = useAuthSession();
  const [open, setOpen] = createSignal(false);
  const [screenshotMediaId, setScreenshotMediaId] = createSignal<string>();
  const [attachingScreenshot, setAttachingScreenshot] = createSignal(false);
  let screenshotInput!: HTMLInputElement;
  const [form, { Form, Field }] = createForm<FeedbackFormInput>({
    initialValues: {
      category: "bug",
      description: "",
      contextUrl: "",
      screenshotMediaId: "",
    },
    validate: zodForm(createFeedbackFormSchema(locale())),
    validateOn: "submit",
    revalidateOn: "input",
  });

  const launch = () => {
    if (!auth.authenticated()) {
      redirectTo(
        `/login?redirect=${encodeURIComponent(getReturnToFromLocation())}`,
      );
      return;
    }
    setResponse(form, { status: "success", message: "" });
    setOpen(true);
  };

  const close = (force = false) => {
    if (form.submitting && !force) return;
    setOpen(false);
    reset(form);
    setScreenshotMediaId();
    setResponse(form, { status: "success", message: "" });
  };

  const submit = async (values: FeedbackFormInput) => {
    setResponse(form, { status: "success", message: "" });
    try {
      await submitFeedback({
        ...values,
        contextUrl: window.location.href,
        screenshotMediaId: screenshotMediaId(),
      });
      close(true);
    } catch {
      setResponse(form, {
        status: "error",
        message: t("feedbacklauncher.sendFailedTryAgain"),
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={launch}
        aria-label={t("feedbacklauncher.sendFeedback")}
        class="action action-primary fixed bottom-5 right-5 z-50 shadow-lg mobile:bottom-10"
      >
        <MessageSquareWarning class="size-5" />
      </button>
      <Show when={open()}>
        <div
          class="fixed inset-0 z-50 grid place-items-center bg-scrim-subtle p-4"
          role="presentation"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <Form
            onSubmit={submit}
            class="w-[min(520px,95vw)] rounded-3xl border border-line bg-surface-elevated p-5 shadow-2xl"
            aria-label={t("feedbacklauncher.sendFeedback")}
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="heading-callout text-base">
                  {t("feedbacklauncher.sendFeedback")}
                </h2>
                <p class="text-muted mt-1">
                  {t("feedbacklauncher.helpImproveDevhub404")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => close()}
                aria-label={t("feedbacklauncher.close")}
                class="action action-secondary"
              >
                <X class="size-4" />
              </button>
            </div>
            <Field name="category">
              {() => (
                <div class="mt-5 grid grid-cols-3 gap-2">
                  {categories.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        type="button"
                        onClick={() => setValue(form, "category", item.value)}
                        class="action action-secondary"
                      >
                        <Icon class="size-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>
            <div class="mt-4 grid gap-2">
              <label for="feedback-description" class="field-label">
                {t("feedbacklauncher.description")}
              </label>
              <Field name="description">
                {(field, fieldProps) => (
                  <>
                    <textarea
                      {...fieldProps}
                      id="feedback-description"
                      value={field.value ?? ""}
                      rows={5}
                      maxLength={4000}
                      required
                      class="field-control resize-y mt-2 min-h-28 bg-surface-subtle"
                      placeholder={t("feedbacklauncher.happenedOrYouSuggests")}
                    />
                    {field.error && (
                      <p class="text-danger-caption mt-1">{field.error}</p>
                    )}
                  </>
                )}
              </Field>
            </div>
            <input
              ref={screenshotInput}
              type="file"
              accept="image/*"
              class="sr-only"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                setAttachingScreenshot(true);
                setResponse(form, { status: "success", message: "" });
                try {
                  const result = await uploadImage(file, "content");
                  const mediaId = result.data?.data?.mediaId;
                  if (result.error || !mediaId)
                    throw new Error("SCREENSHOT_UPLOAD_FAILED");
                  setScreenshotMediaId(mediaId);
                } catch {
                  setResponse(form, {
                    status: "error",
                    message: t(
                      "feedbacklauncher.couldNotAttachScreenshottryAgain",
                    ),
                  });
                } finally {
                  setAttachingScreenshot(false);
                }
              }}
            />
            <button
              type="button"
              aria-label={
                screenshotMediaId()
                  ? t("feedback.screenshotAttached")
                  : t("feedback.attachScreenshot")
              }
              disabled={attachingScreenshot() || form.submitting}
              onClick={() => screenshotInput.click()}
              class="action action-secondary"
            >
              <ImagePlus class="size-4" />
              {attachingScreenshot()
                ? t("feedback.attachingScreenshot")
                : screenshotMediaId()
                  ? t("feedback.screenshotAttached")
                  : t("feedback.attachScreenshot")}
            </button>
            <Show when={form.response.status === "error"}>
              <p class="text-danger mt-2">{form.response.message}</p>
            </Show>
            <button
              type="submit"
              disabled={form.submitting}
              aria-busy={form.submitting}
              class="action action-primary"
            >
              <Send class="size-4" />
              {form.submitting
                ? t("feedback.sending")
                : t("feedbacklauncher.sendFeedback")}
            </button>
          </Form>
        </div>
      </Show>
    </>
  );
}

export default withLocale(FeedbackLauncher);
