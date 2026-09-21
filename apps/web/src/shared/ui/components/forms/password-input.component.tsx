import { createSignal, Show, splitProps, type JSX } from 'solid-js';
import { Eye, EyeOff } from 'lucide-solid';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/shared/i18n';
type Props = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  autocomplete?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  inputProps?: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'id' | 'class' | 'classList' | 'value' | 'onInput'>;
};

function PasswordInput(props: Props) {
  const { t } = useI18n();
  const [visible, setVisible] = createSignal(false);

  const [local] = splitProps(props, [
    'id',
    'name',
    'autocomplete',
    'placeholder',
    'value',
    'disabled',
    'required',
    'onValueChange',
    'inputProps',
  ]);
  return (
    <div class="relative">
      <input
        {...local.inputProps}
        id={local.id}
        name={local.name}
        type={visible() ? 'text' : 'password'}
        autocomplete={local.autocomplete}
        placeholder={local.placeholder}
        class="field-control pr-12 placeholder:text-xs"
        value={local.value}
        disabled={local.disabled}
        required={local.required}
        onInput={(event) => local.onValueChange(event.currentTarget.value)}
      />

      <button
        type="button"
        aria-label={visible() ? t('passwordinput.hidePassword') : t('passwordinput.showPassword')}
        title={visible() ? t('password.hide') : t('password.show')}
        disabled={props.disabled}
        onClick={() => setVisible((v) => !v)} class="action action-ghost absolute right-1 top-1/2 -translate-y-1/2 px-0"
       
       
      >
        <Show when={visible()} fallback={<Eye size={18} />}>
          <EyeOff size={18} />
        </Show>
      </button>
    </div>
  );
}

export default withLocale(PasswordInput);
