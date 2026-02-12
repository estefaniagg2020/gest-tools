import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ToastContainer from "@/components/common/ToastContainer.vue";
import { useToast } from "@/composables/useToast";

describe("ToastContainer", () => {
  beforeEach(() => {
    const { toasts, removeToast } = useToast();
    while (toasts.value.length) removeToast(toasts.value[0].id);
  });

  it("should_render_container", () => {
    const wrapper = mount(ToastContainer);
    expect(wrapper.find(".fixed.top-4.right-4").exists()).toBe(true);
  });

  it("should_show_toast_when_added_via_composable", async () => {
    const wrapper = mount(ToastContainer);
    const { addToast } = useToast();
    addToast("Test message", "success", 0);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Test message");
    expect(wrapper.text()).toContain("Éxito");
  });

  it("should_remove_toast_on_close_click", async () => {
    const wrapper = mount(ToastContainer);
    const { addToast, toasts } = useToast();
    addToast("To remove", "info", 0);
    await wrapper.vm.$nextTick();
    const btn = wrapper.find("button");
    await btn.trigger("click");
    await wrapper.vm.$nextTick();
    expect(toasts.value).toHaveLength(0);
  });
});
