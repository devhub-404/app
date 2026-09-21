import { createSignal, onMount } from 'solid-js';
import { useAuth } from '@/features/auth/public';
import { useI18n } from '@/features/account/i18n';
import { preloadPasskeyAuthentication, type PasskeyDevice } from '@/features/auth/public/authentication';

export function usePasskeySettings() {
  preloadPasskeyAuthentication();
  const { t } = useI18n();
  const genericFailure = t('securitysection.operationNotCanBeConcluidatryAgain');
  const { listPasskeyDevices, registerPasskey, updatePasskeyDeviceName, deleteCredential } = useAuth();
  const [busy, setBusy] = createSignal(false);
  const [passkeys, setPasskeys] = createSignal<PasskeyDevice[]>([]);
  const [error, setError] = createSignal<string | null>(null);
  const [editingCredentialId, setEditingCredentialId] = createSignal<string | null>(null);
  const [removingCredentialId, setRemovingCredentialId] = createSignal<string | null>(null);

  const fail = (message = genericFailure) => setError(message);
  const run = async (operation: () => Promise<void>) => {
    if (busy()) return;
    setBusy(true);
    setError(null);
    try {
      await operation();
    } finally {
      setBusy(false);
    }
  };

  const load = async () => {
    const result = await listPasskeyDevices();
    const data = result.data?.data;
    if (result.error) fail(t('securitysection.couldNotLoadPasskeys'));
    else if (Array.isArray(data)) setPasskeys(data);
  };

  onMount(() => void load());

  const register = async (values: { deviceName?: string }) =>
    run(async () => {
      const result = await registerPasskey(values.deviceName?.trim() || undefined);
      if (result.error) fail(t('securitysection.couldNotAddPasskey'));
      else {
        await load();
      }
    });

  const beginRename = (device: PasskeyDevice) => {
    setError(null);
    setRemovingCredentialId(null);
    setEditingCredentialId(device.credentialId);
  };

  const cancelRename = () => {
    setEditingCredentialId(null);
  };

  const rename = async (device: PasskeyDevice, values: { deviceName?: string }) => {
    const name = values.deviceName?.trim() ?? '';
    if (!name || name === device.deviceName) {
      cancelRename();
      return;
    }
    await run(async () => {
      const ok = await updatePasskeyDeviceName(device.credentialId, name);
      if (!ok) fail(t('securitysection.couldNotRenamePasskey'));
      else {
        cancelRename();
        await load();
      }
    });
  };

  const beginRemove = (device: PasskeyDevice) => {
    setEditingCredentialId(null);
    setRemovingCredentialId(device.credentialId);
  };

  const cancelRemove = () => setRemovingCredentialId(null);

  const remove = async (device: PasskeyDevice) =>
    run(async () => {
      const ok = await deleteCredential(device.credentialId);
      if (!ok) fail(t('securitysection.couldNotRemovePasskey'));
      else {
        setPasskeys((items) => items.filter((item) => item.credentialId !== device.credentialId));
        cancelRemove();
      }
    });

  return {
    busy,
    passkeys,
    error,
    editingCredentialId,
    removingCredentialId,
    register,
    beginRename,
    cancelRename,
    rename,
    beginRemove,
    cancelRemove,
    remove,
  };
}
