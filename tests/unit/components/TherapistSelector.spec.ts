import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TherapistSelector from "@/components/scheduler/TherapistSelector.vue";
import type { Therapist } from "@/interfaces";

const therapists: Therapist[] = [
  {
    id: "th-1",
    name: "Ana García",
    photoUrl: "",
    phoneNumber: "",
    email: "ana@test.com",
    weeklyHours: 40,
    color: "#000",
    role: "therapist",
    spaId: "spa-1",
  },
  {
    id: "th-2",
    name: "Pedro López",
    photoUrl: "",
    phoneNumber: "",
    email: "pedro@test.com",
    weeklyHours: 35,
    color: "#111",
    role: "therapist",
    spaId: "spa-1",
  },
];

describe("TherapistSelector", () => {
  it("should_show_placeholder_when_no_selection", () => {
    const wrapper = mount(TherapistSelector, {
      props: { therapists },
    });
    expect(wrapper.text()).toContain("Seleccionar Terapeuta");
  });

  it("should_show_selected_therapist_name_when_selectedId_provided", () => {
    const wrapper = mount(TherapistSelector, {
      props: { therapists, selectedId: "th-1" },
    });
    expect(wrapper.text()).toContain("Ana García");
  });

  it("should_show_dropdown_on_button_click", async () => {
    const wrapper = mount(TherapistSelector, {
      props: { therapists },
    });
    expect(wrapper.find(".absolute.top-full").exists()).toBe(false);
    await wrapper.find("button").trigger("click");
    expect(wrapper.find(".absolute.top-full").isVisible()).toBe(true);
  });

  it("should_emit_select_with_id_when_therapist_clicked", async () => {
    const wrapper = mount(TherapistSelector, {
      props: { therapists },
    });
    await wrapper.find("button").trigger("click");
    const options = wrapper.findAll(".cursor-pointer");
    await options[0].trigger("click");
    expect(wrapper.emitted("select")).toEqual([["th-1"]]);
  });
});
