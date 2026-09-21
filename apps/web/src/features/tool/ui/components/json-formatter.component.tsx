import type { ToolDefinition } from '../../domain/tool-catalog.domain.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '../../i18n';
import { useToolRunner } from '../hooks/use-tool-runner.hook.ts';
import ToolForm from './tool-form.component.tsx';

function JsonFormatter(props: { tool: ToolDefinition }) {
  const { t } = useI18n();
  const runner = useToolRunner(props.tool, t('toolform.couldNotProcessValueProvided'));

  return (
    <ToolForm
      input={runner.input()}
      output={runner.output()}
      error={runner.error()}
      onInput={runner.setInput}
      onRun={runner.run}
      onReset={runner.reset}
    />
  );
}

export default withLocale(JsonFormatter);
