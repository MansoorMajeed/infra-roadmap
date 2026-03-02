"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { NodeStatus } from "@/lib/types";

export interface NodeCardData {
  label: string;
  difficulty: 1 | 2 | 3;
  category: string;
  status: NodeStatus;
  hasHiddenChildren: boolean;
  canCollapse: boolean;
  onExpand?: (nodeId: string) => void;
  onCollapse?: (nodeId: string) => void;
  nodeId: string;
  [key: string]: unknown;
}

const difficultyDots = {
  1: "bg-green-400",
  2: "bg-yellow-400",
  3: "bg-red-400",
};

const statusStyles: Record<NodeStatus, { border: string; bg: string; extra: string }> = {
  "not-started": {
    border: "border-rose-300 dark:border-rose-500/60",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    extra: "",
  },
  "in-progress": {
    border: "border-blue-400 dark:border-blue-500/60",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    extra: "ring-2 ring-blue-300 ring-offset-1",
  },
  completed: {
    border: "border-green-400 dark:border-green-500/60",
    bg: "bg-green-50 dark:bg-green-950/20",
    extra: "",
  },
};

const categoryIcons: Record<string, string> = {
  concept: "\u{1F4A1}",
  tool: "\u{1F527}",
  practice: "\u{1F4CB}",
  principle: "\u{1F3AF}",
};

const categoryStyles: Record<string, { accent: string; border?: string }> = {
  concept: { accent: "" },
  tool: {
    accent: "border-l-4 !border-l-indigo-400 dark:!border-l-indigo-500",
    border: "border-dashed",
  },
  practice: {
    accent: "border-l-4 !border-l-purple-400 dark:!border-l-purple-500",
  },
  principle: {
    accent: "border-l-4 !border-l-amber-400 dark:!border-l-amber-500",
  },
};

function NodeCard({ data }: NodeProps) {
  const cardData = data as unknown as NodeCardData;
  const status = statusStyles[cardData.status] || statusStyles["not-started"];
  const diffDot = difficultyDots[cardData.difficulty] || difficultyDots[1];
  const icon = categoryIcons[cardData.category] || "";
  const catStyle = categoryStyles[cardData.category] || categoryStyles.concept;

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    cardData.onExpand?.(cardData.nodeId);
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    cardData.onCollapse?.(cardData.nodeId);
  };

  return (
    <div
      className={`group rounded-lg border-2 ${status.border} ${status.bg} ${status.extra} ${catStyle.accent} ${catStyle.border || ""} px-4 py-3 shadow-sm min-w-[160px] max-w-[200px] cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] hover:border-blue-400 dark:hover:border-blue-500 relative`}
      title="Click to read"
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-start gap-2">
        {icon && <span className="text-sm mt-0.5">{icon}</span>}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight flex-1">
          {cardData.label}
        </span>
        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${diffDot}`} title={`Difficulty ${cardData.difficulty}`} />
      </div>
      <div className="flex justify-end mt-1">
        {cardData.status === "completed" ? (
          <span className="text-[9px] text-green-600 dark:text-green-400 font-medium">✓ Done</span>
        ) : (
          <span className="text-[9px] text-blue-400/60 dark:text-blue-500/50 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors font-medium">Read →</span>
        )}
      </div>
      {/* Bottom buttons: expand and/or collapse */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
        {cardData.canCollapse && (
          <button
            onClick={handleCollapse}
            className="w-6 h-6 rounded-full bg-gray-400 hover:bg-gray-500 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors"
            title="Collapse children"
          >
            −
          </button>
        )}
        {cardData.hasHiddenChildren && (
          <button
            onClick={handleExpand}
            className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors"
            title="Expand to see more topics"
          >
            +
          </button>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
}

export default memo(NodeCard);
