import type { FieldValues, FormErrors, ValidateForm } from '@modular-forms/solid';

type ZodIssue = { message: string; path: PropertyKey[] };
type ZodSchema = {
  safeParseAsync(values: unknown): Promise<{ success: true } | { success: false; error: { issues: ZodIssue[] } }>;
};

/**
 * Modular Forms 0.25 types its built-in adapter against Zod 3, while the
 * application uses Zod 4. This preserves the adapter's runtime behaviour
 * without weakening individual form schemas.
 */
export function zodForm<TFieldValues extends FieldValues>(schema: ZodSchema): ValidateForm<TFieldValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values);
    const errors: Record<string, string> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        if (!errors[path]) errors[path] = issue.message;
      }
    }
    return errors as FormErrors<TFieldValues>;
  };
}
