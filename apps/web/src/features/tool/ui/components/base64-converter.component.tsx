import { createSignal } from 'solid-js';
import type { ToolMode } from '../../utils/execute-tool.util.ts';
import type { ToolDefinition } from '../../domain/tool-catalog.domain.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '../../i18n';
import { useToolRunner } from '../hooks/use-tool-runner.hook.ts';
import Base64ModeControls from './base64-mode-controls.component.tsx';
import ToolForm from './tool-form.component.tsx';

function Base64Converter(props: { tool: ToolDefinition }) {
  const { t } = useI18n();
  const runner = useToolRunner(props.tool, t('toolform.couldNotProcessValueProvided'));
  const [mode, setMode] = createSignal<ToolMode>('encode');

  return (
    <ToolForm
      input={runner.input()}
      output={runner.output()}
      error={runner.error()}
      onInput={runner.setInput}
      onRun={() => runner.run(mode())}
      onReset={runner.reset}
      controls={<Base64ModeControls mode={mode()} onChange={setMode} />}
    />
  );
}

export default withLocale(Base64Converter);
