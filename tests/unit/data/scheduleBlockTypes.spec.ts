import { describe, it, expect } from "vitest";
import {
  getBlockTypeCardStyle,
  getBlockTypeMonthCellClass,
  BLOCK_TYPE_CARD_STYLES,
  BLOCK_TYPE_MONTH_CELL_CLASSES,
} from "@/data/scheduleBlockTypes";

describe("getBlockTypeCardStyle", () => {
  it("should_return_style_for_each_known_type", () => {
    expect(getBlockTypeCardStyle("work")).toEqual(BLOCK_TYPE_CARD_STYLES.work);
    expect(getBlockTypeCardStyle("vacation")).toEqual(BLOCK_TYPE_CARD_STYLES.vacation);
    expect(getBlockTypeCardStyle("training")).toEqual(BLOCK_TYPE_CARD_STYLES.training);
    expect(getBlockTypeCardStyle("admin")).toEqual(BLOCK_TYPE_CARD_STYLES.admin);
    expect(getBlockTypeCardStyle("other")).toEqual(BLOCK_TYPE_CARD_STYLES.other);
  });

  it("should_return_default_style_for_unknown_type", () => {
    const result = getBlockTypeCardStyle("unknown" as "work");
    expect(result).toHaveProperty("bg", "bg-gray-100");
    expect(result).toHaveProperty("border", "border-gray-500");
    expect(result).toHaveProperty("text", "text-gray-700");
  });
});

describe("getBlockTypeMonthCellClass", () => {
  it("should_return_class_for_each_known_type", () => {
    expect(getBlockTypeMonthCellClass("work")).toBe(BLOCK_TYPE_MONTH_CELL_CLASSES.work);
    expect(getBlockTypeMonthCellClass("vacation")).toBe(BLOCK_TYPE_MONTH_CELL_CLASSES.vacation);
    expect(getBlockTypeMonthCellClass("training")).toBe(BLOCK_TYPE_MONTH_CELL_CLASSES.training);
    expect(getBlockTypeMonthCellClass("admin")).toBe(BLOCK_TYPE_MONTH_CELL_CLASSES.admin);
    expect(getBlockTypeMonthCellClass("other")).toBe(BLOCK_TYPE_MONTH_CELL_CLASSES.other);
  });

  it("should_return_fallback_class_for_unknown_type", () => {
    expect(getBlockTypeMonthCellClass("unknown" as "work")).toBe("bg-gray-400 text-white");
  });
});
