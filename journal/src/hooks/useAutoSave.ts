import { useEffect, useRef } from 'react';

/**
 * Debounced autosave. Skips the first run after mount / when `resetKey` changes
 * so hydrating from props does not re-write storage.
 */
export function useAutoSave(
  resetKey: string,
  ready: boolean,
  signature: string,
  save: () => void | Promise<void>,
  delayMs = 350
): void {
  const saveRef = useRef(save);
  saveRef.current = save;
  const skipKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (skipKeyRef.current !== resetKey) {
      skipKeyRef.current = resetKey;
      return;
    }
    if (!ready) return;

    const id = window.setTimeout(() => {
      void saveRef.current();
    }, delayMs);
    return () => window.clearTimeout(id);
  }, [resetKey, ready, signature, delayMs]);
}
