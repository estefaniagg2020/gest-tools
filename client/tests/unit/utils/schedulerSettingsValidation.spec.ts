import { describe, it, expect } from "vitest";
import {
  clampHour,
  clampPixels,
  clampSlotDuration,
  MIN_HOUR,
  MAX_HOUR,
  MIN_PIXELS,
  MAX_PIXELS,
} from "@/utils/schedulerSettingsValidation";

describe("clampHour", () => {
  it("should_return_value_unchanged_when_within_range", () => {
    expect(clampHour(0)).toBe(0);
    expect(clampHour(12)).toBe(12);
    expect(clampHour(24)).toBe(24);
  });

  it("should_clamp_to_MIN_HOUR_when_below_minimum", () => {
    expect(clampHour(-1)).toBe(MIN_HOUR);
    expect(clampHour(-100)).toBe(MIN_HOUR);
  });

  it("should_clamp_to_MAX_HOUR_when_above_maximum", () => {
    expect(clampHour(25)).toBe(MAX_HOUR);
    expect(clampHour(100)).toBe(MAX_HOUR);
  });

  it("should_floor_decimal_values", () => {
    expect(clampHour(12.7)).toBe(12);
    expect(clampHour(0.9)).toBe(0);
  });
});

describe("clampPixels", () => {
  it("should_return_value_unchanged_when_within_range", () => {
    expect(clampPixels(30)).toBe(30);
    expect(clampPixels(90)).toBe(90);
    expect(clampPixels(200)).toBe(200);
  });

  it("should_clamp_to_MIN_PIXELS_when_below_minimum", () => {
    expect(clampPixels(0)).toBe(MIN_PIXELS);
    expect(clampPixels(29)).toBe(MIN_PIXELS);
  });

  it("should_clamp_to_MAX_PIXELS_when_above_maximum", () => {
    expect(clampPixels(201)).toBe(MAX_PIXELS);
    expect(clampPixels(500)).toBe(MAX_PIXELS);
  });

  it("should_floor_decimal_values", () => {
    expect(clampPixels(90.9)).toBe(90);
  });
});

describe("clampSlotDuration", () => {
  it("should_return_value_unchanged_when_valid_slot_duration", () => {
    expect(clampSlotDuration(30)).toBe(30);
    expect(clampSlotDuration(60)).toBe(60);
    expect(clampSlotDuration(90)).toBe(90);
    expect(clampSlotDuration(120)).toBe(120);
  });

  it("should_return_default_60_when_invalid_duration", () => {
    expect(clampSlotDuration(15)).toBe(60);
    expect(clampSlotDuration(45)).toBe(60);
    expect(clampSlotDuration(100)).toBe(60);
  });
});
