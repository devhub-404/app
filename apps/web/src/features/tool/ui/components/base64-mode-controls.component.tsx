import type { ToolMode } from '../../utils/execute-tool.util.ts';
import { useI18n } from '../../i18n';

type Props = {
  mode: ToolMode;
  onChange: (mode: ToolMode) => void;
};

export default function Base64ModeControls(props: Props) {
  const { t } = useI18n();

  return (
    <div class="flex gap-2">
      <button
        type="button"
        data-active={props.mode === 'encode'}
        onClick={() => props.onChange('encode')} class="action action-secondary"
       
      >
        {t('toolform.encode')}
      </button>
      <button
        type="button"
        data-active={props.mode === 'decode'}
        onClick={() => props.onChange('decode')} class="action action-secondary"
       
      >
        {t('toolform.decode')}
      </button>
    </div>
  );
}
