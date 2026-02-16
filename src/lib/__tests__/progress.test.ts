import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getProgress,
  setNodeStatus,
  toggleMilestone,
  getCompletedCount,
  resetProgress,
  getNodeProgress,
} from "../progress";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe("getProgress", () => {
  it("returns default progress when empty", () => {
    const progress = getProgress();
    expect(progress).toEqual({ nodes: {} });
  });
});

describe("setNodeStatus", () => {
  it("persists and retrieves node status", () => {
    setNodeStatus("hello-world", "completed");
    const progress = getNodeProgress("hello-world");
    expect(progress.status).toBe("completed");
    expect(progress.completedAt).toBeDefined();
  });

  it("sets status to in-progress", () => {
    setNodeStatus("hello-world", "in-progress");
    const progress = getNodeProgress("hello-world");
    expect(progress.status).toBe("in-progress");
  });
});

describe("toggleMilestone", () => {
  it("toggles milestone correctly", () => {
    toggleMilestone("hello-world", 0);
    let progress = getNodeProgress("hello-world");
    expect(progress.milestones[0]).toBe(true);

    toggleMilestone("hello-world", 0);
    progress = getNodeProgress("hello-world");
    expect(progress.milestones[0]).toBe(false);
  });

  it("sets status to in-progress when milestone is checked", () => {
    toggleMilestone("hello-world", 0);
    const progress = getNodeProgress("hello-world");
    expect(progress.status).toBe("in-progress");
  });
});

describe("getCompletedCount", () => {
  it("counts completed nodes correctly", () => {
    setNodeStatus("node-1", "completed");
    setNodeStatus("node-2", "completed");
    setNodeStatus("node-3", "in-progress");

    const count = getCompletedCount(["node-1", "node-2", "node-3", "node-4"]);
    expect(count).toBe(2);
  });

  it("returns 0 when nothing is completed", () => {
    expect(getCompletedCount(["node-1", "node-2"])).toBe(0);
  });
});

describe("resetProgress", () => {
  it("clears all data", () => {
    setNodeStatus("hello-world", "completed");
    resetProgress();
    const progress = getProgress();
    expect(progress).toEqual({ nodes: {} });
  });
});
