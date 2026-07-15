export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

type Listener = (toast: ToastItem) => void;

const listeners = new Set<Listener>();
let counter = 0;

export function subscribeToast(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(type: ToastType, message: string) {
  const item: ToastItem = { id: ++counter, type, message };
  listeners.forEach((l) => l(item));
}

export const toast = {
  success: (message: string) => emit("success", message),
  error: (message: string) => emit("error", message),
  info: (message: string) => emit("info", message),
};
