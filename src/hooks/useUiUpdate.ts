import { useCallback, useEffect, useRef, useState } from 'react';

type VersionPayload = {
  buildHash?: string;
  timestamp?: string;
};

export type UpdateReason = 'version_changed' | 'chunk_load_error';

const DEFAULT_POLL_INTERVAL_MS = 60_000; // 1 min

async function fetchVersion(signal?: AbortSignal): Promise<VersionPayload | null> {
  try {
    const res = await fetch(`/version.json?ts=${Date.now()}`, {
      cache: 'no-store',
      signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as VersionPayload;
  } catch {
    return null;
  }
}

function normalizeVersion(v: VersionPayload | null): string | null {
  if (!v) return null;
  // Combine buildHash + timestamp so even same-commit rebuilds are detected
  const hash = (v.buildHash && String(v.buildHash).trim()) || '';
  const ts = (v.timestamp && String(v.timestamp).trim()) || '';
  const key = [hash, ts].filter(Boolean).join('_');
  return key || null;
}

function isChunkLoadError(err: unknown): boolean {
  const anyErr = err as any;
  const name = anyErr?.name ? String(anyErr.name) : '';
  const message = anyErr?.message ? String(anyErr.message) : '';
  const stack = anyErr?.stack ? String(anyErr.stack) : '';

  // webpack / CRA patterns
  if (
    name.includes('ChunkLoadError') ||
    message.includes('ChunkLoadError') ||
    message.includes('Loading chunk') ||
    stack.includes('ChunkLoadError') ||
    stack.includes('Loading chunk')
  ) return true;

  // Vite dynamic import failure patterns
  if (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Importing a module script failed') ||
    message.includes('Unable to preload CSS') ||
    message.includes('error loading dynamically imported module')
  ) return true;

  return false;
}

export function useUiUpdate(pollIntervalMs: number = DEFAULT_POLL_INTERVAL_MS) {
  const initialVersionRef = useRef<string | null>(null);
  const initDoneRef = useRef(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [reason, setReason] = useState<UpdateReason | null>(null);

  const triggerUpdate = useCallback((r: UpdateReason) => {
    setReason(prev => prev ?? r);
    setIsUpdateAvailable(true);
  }, []);

  const refreshNow = useCallback(() => {
    window.location.reload();
  }, []);

  // Single effect: init + polling + chunk error detection
  useEffect(() => {
    if (isUpdateAvailable) return;

    let timer: number | undefined;
    const controller = new AbortController();

    const tick = async () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      if (!initDoneRef.current) return; // wait for init

      const current = normalizeVersion(await fetchVersion(controller.signal));
      const initial = initialVersionRef.current;
      if (initial && current && initial !== current) {
        triggerUpdate('version_changed');
      }
    };

    // Init: fetch initial version, then start polling
    (async () => {
      const v = await fetchVersion(controller.signal);
      if (controller.signal.aborted) return;
      initialVersionRef.current = normalizeVersion(v);
      initDoneRef.current = true;

      // Start polling after init is done
      timer = window.setInterval(tick, pollIntervalMs);
      // First check after 5s
      window.setTimeout(tick, 5_000);
    })();

    const onFocus = () => tick();
    window.addEventListener('focus', onFocus);

    // Chunk load error listeners
    const onWindowError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error)) {
        triggerUpdate('chunk_load_error');
      }
    };
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        triggerUpdate('chunk_load_error');
      }
    };
    window.addEventListener('error', onWindowError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      if (timer) window.clearInterval(timer);
      controller.abort();
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('error', onWindowError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [isUpdateAvailable, pollIntervalMs, triggerUpdate]);

  return {
    isUpdateAvailable,
    reason,
    refreshNow,
  };
}
