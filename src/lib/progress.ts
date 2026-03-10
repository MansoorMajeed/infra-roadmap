"use client";

import type { ProgressData, NodeProgress, NodeStatus } from "./types";

const STORAGE_KEY = "infra-roadmap-progress";
const LAST_NODE_KEY = "infra-roadmap-last-node";
const RESUME_PREF_KEY = "infra-roadmap-resume-pref";

export type ResumePref = "ask" | "always" | "never";

export interface LastNode {
  nodeId: string;
  zoneId: string;
  nodeTitle: string;
  zoneTitle: string;
  timestamp: string;
}

function getDefaultProgress(): ProgressData {
  return { nodes: {} };
}

export function getProgress(): ProgressData {
  if (typeof window === "undefined") return getDefaultProgress();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return JSON.parse(raw) as ProgressData;
  } catch {
    return getDefaultProgress();
  }
}

function saveProgress(data: ProgressData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getNodeProgress(nodeId: string): NodeProgress {
  const data = getProgress();
  return (
    data.nodes[nodeId] ?? {
      status: "not-started" as NodeStatus,
      milestones: [],
    }
  );
}

export function setNodeStatus(nodeId: string, status: NodeStatus): void {
  const data = getProgress();
  const existing = data.nodes[nodeId] ?? { status: "not-started", milestones: [] };
  data.nodes[nodeId] = {
    ...existing,
    status,
    completedAt: status === "completed" ? new Date().toISOString() : existing.completedAt,
  };
  saveProgress(data);
}

export function toggleMilestone(nodeId: string, milestoneIndex: number): void {
  const data = getProgress();
  const existing = data.nodes[nodeId] ?? { status: "not-started", milestones: [] };
  const milestones = [...existing.milestones];
  milestones[milestoneIndex] = !milestones[milestoneIndex];

  // Auto-set to in-progress if any milestone is checked
  let status = existing.status;
  if (milestones.some(Boolean) && status === "not-started") {
    status = "in-progress";
  }

  data.nodes[nodeId] = { ...existing, status, milestones };
  saveProgress(data);
}

export function setEntryPoint(entryPoint: string): void {
  const data = getProgress();
  data.entryPoint = entryPoint;
  saveProgress(data);
}

export function getCompletedCount(nodeIds: string[]): number {
  const data = getProgress();
  return nodeIds.filter((id) => data.nodes[id]?.status === "completed").length;
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// --- Last Node tracking ---

export function getLastNode(): LastNode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_NODE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LastNode;
  } catch {
    return null;
  }
}

export function setLastNode(nodeId: string, zoneId: string, nodeTitle: string, zoneTitle: string): void {
  if (typeof window === "undefined") return;
  const entry: LastNode = { nodeId, zoneId, nodeTitle, zoneTitle, timestamp: new Date().toISOString() };
  localStorage.setItem(LAST_NODE_KEY, JSON.stringify(entry));
}

// --- Resume preference ---

export function getResumePref(): ResumePref {
  if (typeof window === "undefined") return "ask";
  try {
    const raw = localStorage.getItem(RESUME_PREF_KEY);
    if (raw === "always" || raw === "never") return raw;
    return "ask";
  } catch {
    return "ask";
  }
}

export function setResumePref(pref: ResumePref): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESUME_PREF_KEY, pref);
}

// --- Export / Import ---

const ALL_STORAGE_KEYS = [
  STORAGE_KEY,
  LAST_NODE_KEY,
  RESUME_PREF_KEY,
  "infra-roadmap-visible-nodes",
  "infra-roadmap-viewport",
  "infra-roadmap-zoom-lock",
  "infra-roadmap-help-seen",
] as const;

export interface SaveFile {
  version: 1;
  exportedAt: string;
  data: Record<string, string | null>;
}

export function exportAllData(): SaveFile {
  const data: Record<string, string | null> = {};
  for (const key of ALL_STORAGE_KEYS) {
    data[key] = localStorage.getItem(key);
  }
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function importAllData(save: SaveFile): void {
  if (save.version !== 1) throw new Error("Unsupported save file version");
  for (const key of ALL_STORAGE_KEYS) {
    const value = save.data[key];
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }
}

export function resetAllData(): void {
  if (typeof window === "undefined") return;
  for (const key of ALL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
}

export function getProgressStats(allNodeIds: string[]): { completed: number; inProgress: number; total: number } {
  const data = getProgress();
  let completed = 0;
  let inProgress = 0;
  for (const id of allNodeIds) {
    const status = data.nodes[id]?.status;
    if (status === "completed") completed++;
    else if (status === "in-progress") inProgress++;
  }
  return { completed, inProgress, total: allNodeIds.length };
}
