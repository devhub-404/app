import { Show, type JSX } from 'solid-js';
import { useI18n } from '../../i18n';
import { Play, RotateCcw } from 'lucide-solid';

type Props = {
  input: string;
  output: string;
  error: string;
  onInput: (value: string) => void;
  onRun: () => void;
  onReset: () => void;
  controls?: JSX.Element;
};

export default function ToolForm(props: Props) {
  const { t } = useI18n();

  return (
    <div class="grid gap-4 rounded-3xl border border-line bg-surface-elevated p-6 shadow-sm">
      {props.controls}
      <label for="tool-input" class="field-label">{t('toolform.input')}</label>
      <textarea
        id="tool-input"
        value={props.input}
        onInput={(event) => props.onInput(event.currentTarget.value)}
        rows={10}
        class="field-control resize-y font-mono"
      />
      <div class="flex gap-3">
        <button type="button" onClick={props.onRun} class="action action-primary">
          <Play class="size-4" />
          {t('toolform.run')}
        </button>
        <button type="button" onClick={props.onReset} class="action action-secondary">
          <RotateCcw class="size-4" />
          {t('toolform.clear')}
        </button>
      </div>
      <Show when={props.error}>
        <p class="text-danger">{props.error}</p>
      </Show>
      <label for="tool-output" class="field-label pt-2">
        {t('toolform.output')}
      </label>
      <textarea
        id="tool-output"
        value={props.output}
        readOnly
        rows={10}
        class="field-control resize-y bg-surface-subtle font-mono text-content-muted"
      />
      <p class="text-caption">{t('toolform.localProcessingPrivacy')}</p>
    </div>
  );
}
