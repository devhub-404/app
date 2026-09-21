import type { Job, JobType } from '@/features/job/types/job.type.ts';
import type { SelectOption } from '@/shared/ui/components/forms/select.component.tsx';
import type { TranslationKey } from '@/features/job/i18n';

type Translator = (key: TranslationKey) => string;
export type CompensationUnit = NonNullable<Job['compensationUnit']>;

export const jobTypeOptions = (t: Translator): SelectOption<JobType>[] => [
  { value: 'full_time', label: t('jobOptions.fullTime') },
  { value: 'part_time', label: t('jobOptions.partTime') },
  { value: 'contract', label: t('jobOptions.contract') },
  { value: 'internship', label: t('jobOptions.internship') },
  { value: 'temporary', label: t('jobOptions.temporary') },
];

export const workplaceOptions = (t: Translator): SelectOption<Job['workplaceType']>[] => [
  { value: 'remote', label: t('jobOptions.remote') },
  { value: 'hybrid', label: t('jobOptions.hybrid') },
  { value: 'onsite', label: t('jobOptions.onsite') },
];

export const compensationUnitOptions = (t: Translator): SelectOption<CompensationUnit>[] => [
  { value: 'hourly', label: t('jobOptions.hour') },
  { value: 'daily', label: t('jobOptions.day') },
  { value: 'monthly', label: t('jobOptions.month') },
  { value: 'yearly', label: t('jobOptions.year') },
  { value: 'fixed_project', label: t('jobOptions.projectClosed') },
];

const labelOf = <TValue extends string>(options: Array<{ value: TValue; label: string }>, value: TValue) =>
  options.find((option) => option.value === value)?.label ?? value;

export const jobTypeLabel = (value: JobType, t: Translator) => labelOf(jobTypeOptions(t), value);
export const workplaceLabel = (value: Job['workplaceType'], t: Translator) => labelOf(workplaceOptions(t), value);
export const compensationUnitLabel = (value: CompensationUnit, t: Translator) =>
  labelOf(compensationUnitOptions(t), value);
