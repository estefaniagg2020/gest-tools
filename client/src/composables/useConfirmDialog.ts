import { ref, readonly, shallowRef } from "vue";

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
}

// Module-level singleton — shared across all component instances
const _visible = ref(false);
const _config = shallowRef<ConfirmDialogConfig>({ title: "", message: "" });
let _resolve: ((value: boolean) => void) | null = null;

export const useConfirmDialog = () => {
  const show = (config: ConfirmDialogConfig): Promise<boolean> => {
    _config.value = config;
    _visible.value = true;
    return new Promise((resolve) => {
      _resolve = resolve;
    });
  };

  const respond = (confirmed: boolean) => {
    _visible.value = false;
    _resolve?.(confirmed);
    _resolve = null;
  };

  return {
    visible: readonly(_visible),
    config: readonly(_config),
    show,
    respond,
  };
};
