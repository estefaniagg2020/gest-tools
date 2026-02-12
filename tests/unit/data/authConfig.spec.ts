import { describe, it, expect } from "vitest";
import { AUTH_CONFIG } from "@/data/authConfig";

describe("AUTH_CONFIG", () => {
  it("should_have_expected_default_role_and_user_id", () => {
    expect(AUTH_CONFIG.DEFAULT_ROLE).toBe("manager");
    expect(AUTH_CONFIG.DEFAULT_USER_ID).toBe("5");
  });

  it("should_have_toggle_user_ids", () => {
    expect(AUTH_CONFIG.TOGGLE_USER_IDS.manager).toBe("5");
    expect(AUTH_CONFIG.TOGGLE_USER_IDS.employee).toBe("1");
  });

  it("should_have_role_identifiers", () => {
    expect(AUTH_CONFIG.ROLE_MANAGER).toBe("manager");
    expect(AUTH_CONFIG.ROLE_EMPLOYEE).toBe("employee");
  });

  it("should_have_manager_user_ids_array", () => {
    expect(AUTH_CONFIG.MANAGER_USER_IDS).toContain("5");
    expect(AUTH_CONFIG.MANAGER_USER_IDS).toContain("admin");
  });

  it("should_have_manager_display_name_and_demo_password", () => {
    expect(AUTH_CONFIG.MANAGER_DISPLAY_NAME).toBe("Antonio");
    expect(AUTH_CONFIG.DEMO_PASSWORD).toBe("demo");
  });
});
