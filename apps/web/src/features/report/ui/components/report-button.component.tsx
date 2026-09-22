import { Flag, X } from "lucide-solid";
import { createSignal } from "solid-js";
import { Dialog } from "@ark-ui/solid/dialog";
import { createForm, reset } from "@modular-forms/solid";
import Field from "@/shared/ui/components/forms/field.component.tsx";
import {
  reportComment,
  reportResource,
} from "@/features/report/actions/report.action.ts";
import { withLocale } from "@/shared/i18n/core/solid";
import { useI18n } from "@/features/report/i18n";
import { zodForm } from "@/shared/ui/forms/zod-form";
import {
  createReportFormSchema,
  type ReportFormInput,
} from "@/features/report/ui/schemas/forms.schema.ts";
import { useAppActor as useAuthSession } from "@/app/session/public";
import { routes } from "@/shared/navigation/routes";
import { redirectTo } from "@/shared/utils/redirect.util.ts";

function ReportButton(props: { target: "resource" | "comment"; id: string }) {
  const { t, locale } = useI18n();
  const { authenticated } = useAuthSession();
  const [open, setOpen] = createSignal(false);
  const [busy, setBusy] = createSignal(false);
  const [_form, { Form, Field: FormField }] = createForm<ReportFormInput>({
    initialValues: { reason: "", description: "" },
    validate: zodForm(createReportFormSchema(locale())),
    validateOn: "submit",
    revalidateOn: "input",
  });
  const close = () => {
    if (busy()) return;
    setOpen(false);
    reset(_form);
  };

  const submit = async (values: ReportFormInput) => {
    if (busy() || !authenticated()) return;

    setBusy(true);
    const ok = await (props.target === "resource"
      ? reportResource(props.id, {
          reason: values.reason.trim(),
          description: values.description?.trim() || undefined,
        })
      : reportComment(props.id, {
          reason: values.reason.trim(),
          description: values.description?.trim() || undefined,
        }));
    setBusy(false);
    if (ok) close();
  };

  return (
    <>
      <button
        type="button"

        aria-label={t("report.report")}
        title={t("report.report")}
        onClick={() => {
          if (!authenticated()) {
            redirectTo(
              `${routes.auth.signIn}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`,
            );
            return;
          }
          setOpen(true);
        }}
        class="action action-secondary"
      >
        <Flag class="size-4" aria-hidden="true" />
      </button>

      <Dialog.Root
        open={open()}
        role="dialog"
        onOpenChange={(details) => !details.open && close()}
      >
        <Dialog.Backdrop class="fixed inset-0 z-50 bg-scrim" />
        <Dialog.Positioner class="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Content class="grid w-full max-w-lg gap-5 rounded-3xl border border-line bg-surface-elevated p-6 shadow-ui-overlay">
            <header class="flex items-start justify-between gap-4">
              <div class="grid gap-1">
                <Dialog.Title
                  id="report-dialog-title"
                  class="text-lg font-semibold text-content"
                >
                  {t("report.dialogTitle")}
                </Dialog.Title>
                <Dialog.Description class="text-sm text-content-muted">
                  {t("report.dialogDescription")}
                </Dialog.Description>
              </div>
              <Dialog.CloseTrigger
                asChild={(triggerProps) => (
                  <button
                    {...triggerProps}
                    type="button"

                    disabled={busy()}
                    aria-label={t("report.close")}
                    title={t("report.close")}
                    class="action action-secondary size-10 shrink-0 px-0 text-content-muted"
                  >
                    <X class="size-4" aria-hidden="true" />
                  </button>
                )}
              />
            </header>

            <Form class="grid gap-4" onSubmit={submit}>
              <Field>
                <label
                  for={`report-reason-${props.target}-${props.id}`}
                  class="field-label"
                >
                  {t("report.reason")}
                </label>
                <FormField name="reason">
                  {(_, fieldProps) => (
                    <input
                      {...fieldProps}
                      id={`report-reason-${props.target}-${props.id}`}
                      required
                      maxlength={80}
                      autocomplete="off"
                      placeholder={t("report.reasonPlaceholder")}
                      class="field-control"
                    />
                  )}
                </FormField>
              </Field>

              <Field>
                <label
                  for={`report-description-${props.target}-${props.id}`}
                  class="text-sm font-semibold text-content"
                >
                  {t("report.description")}
                </label>
                <FormField name="description">
                  {(_, fieldProps) => (
                    <textarea
                      {...fieldProps}
                      id={`report-description-${props.target}-${props.id}`}
                      rows={4}
                      maxlength={2000}
                      placeholder={t("report.descriptionPlaceholder")}
                      class="field-control resize-y"
                    />
                  )}
                </FormField>
              </Field>

              <footer class="flex flex-wrap justify-end gap-2">
                <Dialog.CloseTrigger
                  asChild={(triggerProps) => (
                    <button
                      {...triggerProps}
                      type="button"
                      disabled={busy()}
                      class="action action-secondary"
                    >
                      <X class="size-4" aria-hidden="true" />
                      {t("report.cancel")}
                    </button>
                  )}
                />
                <button
                  type="submit"
                  disabled={busy()}
                  class="action action-primary"
                >
                  <Flag class="size-4" aria-hidden="true" />
                  {busy() ? t("report.sending") : t("report.submit")}
                </button>
              </footer>
            </Form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </>
  );
}

export default withLocale(ReportButton);
