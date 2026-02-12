import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useToast } from "@/composables/useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should_return_toasts_addToast_removeToast", () => {
    const { toasts, addToast, removeToast } = useToast();
    expect(toasts).toBeDefined();
    expect(addToast).toBeTypeOf("function");
    expect(removeToast).toBeTypeOf("function");
  });

  it("should_add_toast_and_append_to_list", () => {
    const { toasts, addToast } = useToast();
    const before = toasts.value.length;
    addToast("Hello", "info", 0);
    expect(toasts.value.length).toBe(before + 1);
    const added = toasts.value[toasts.value.length - 1];
    expect(added.message).toBe("Hello");
    expect(added.type).toBe("info");
  });

  it("should_remove_toast_by_id", () => {
    const { toasts, addToast, removeToast } = useToast();
    const before = toasts.value.length;
    addToast("Msg", "success", 0);
    const id = toasts.value[toasts.value.length - 1].id;
    removeToast(id);
    expect(toasts.value.length).toBe(before);
  });

  it("should_auto_remove_after_duration", () => {
    const { toasts, addToast } = useToast();
    const before = toasts.value.length;
    addToast("Auto", "info", 3000);
    expect(toasts.value.length).toBe(before + 1);
    vi.advanceTimersByTime(3000);
    expect(toasts.value.length).toBe(before);
  });
});
