import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseCard from "@/components/BaseCard.vue";

describe("BaseCard", () => {
  it("should_render_with_default_classes", () => {
    const wrapper = mount(BaseCard, {
      slots: { default: "Card content" },
    });
    expect(wrapper.text()).toBe("Card content");
    expect(wrapper.classes()).toContain("rounded-3xl");
  });

  it("should_apply_custom_cardClass", () => {
    const wrapper = mount(BaseCard, {
      props: { cardClass: "custom-class" },
      slots: { default: "Content" },
    });
    expect(wrapper.classes()).toContain("custom-class");
  });
});
