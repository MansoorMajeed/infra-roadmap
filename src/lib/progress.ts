"use client";

import type { ProgressData, NodeProgress, NodeStatus } from "./types";

const STORAGE_KEY = "infra-roadmap-progress";

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
