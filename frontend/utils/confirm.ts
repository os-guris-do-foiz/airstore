export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface ConfirmRequest {
  id: number;
  options: ConfirmOptions;
  resolve: (ok: boolean) => void;
}

type Listener = (req: ConfirmRequest) => void;

const listeners = new Set<Listener>();
let counter = 0;

export function subscribeConfirm(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function confirmDialog(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (listeners.size === 0) {
      resolve(window.confirm(options.message));
      return;
    }
    const req: ConfirmRequest = { id: ++counter, options, resolve };
    listeners.forEach((l) => l(req));
  });
}
