import { describe, it, expect } from "vitest";
import {
  DASHBOARD_CHART_DATA,
  DASHBOARD_RECENT_ACTIVITY,
  type ChartDataItem,
  type RecentActivityItem,
} from "@/data/dashboardConfig";

describe("dashboardConfig", () => {
  describe("DASHBOARD_CHART_DATA", () => {
    it("should_have_seven_days", () => {
      expect(DASHBOARD_CHART_DATA).toHaveLength(7);
    });

    it("should_have_label_value_percent_per_item", () => {
      const item = DASHBOARD_CHART_DATA[0] as ChartDataItem;
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("value");
      expect(item).toHaveProperty("percent");
    });

    it("should_have_weekday_labels", () => {
      const labels = DASHBOARD_CHART_DATA.map((d) => d.label);
      expect(labels).toContain("Lun");
      expect(labels).toContain("Dom");
    });
  });

  describe("DASHBOARD_RECENT_ACTIVITY", () => {
    it("should_have_activity_items", () => {
      expect(DASHBOARD_RECENT_ACTIVITY.length).toBeGreaterThan(0);
    });

    it("should_have_title_time_dotClass_per_item", () => {
      const item = DASHBOARD_RECENT_ACTIVITY[0] as RecentActivityItem;
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("time");
      expect(item).toHaveProperty("dotClass");
    });
  });
});
