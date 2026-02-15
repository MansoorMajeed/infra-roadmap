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
  onExpand?: (nodeId: string) => void;
  nodeId: string;
  [key: string]: unknown;
}

const difficultyColors = {
  1: { border: "border-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
  2: { border: "border-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
  3: { border: "border-red-400", bg: "bg-red-50 dark:bg-red-950/30" },
};

const statusStyles: Record<NodeStatus, string> = {
  "not-started": "opacity-80",
  "in-progress": "ring-2 ring-blue-400 ring-offset-1",
  completed: "ring-2 ring-green-500 ring-offset-1 opacity-90",
};

const categoryIcons: Record<string, string> = {
  concept: "\u{1F4A1}",
  tool: "\u{1F527}",
  practice: "\u{1F4CB}",
  principle: "\u{1F3AF}",
};

function NodeCard({ data }: NodeProps) {
  const cardData = data as unknown as NodeCardData;
  const colors = difficultyColors[cardData.difficulty] || difficultyColors[1];
  const statusClass = statusStyles[cardData.status] || "";
  const icon = categoryIcons[cardData.category] || "";

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    cardData.onExpand?.(cardData.nodeId);
  };

  return (
    <div
      className={`rounded-lg border-2 ${colors.border} ${colors.bg} ${statusClass} px-4 py-3 shadow-sm min-w-[160px] max-w-[200px] cursor-pointer transition-all hover:shadow-md relative`}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-start gap-2">
        {icon && <span className="text-sm mt-0.5">{icon}</span>}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-tight">
          {cardData.label}
        </span>
      </div>
      {cardData.status === "completed" && (
        <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
          ✓ Completed
        </div>
      )}
      {cardData.hasHiddenChildren && (
        <button
          onClick={handleExpand}
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md transition-colors z-10"
          title="Expand to see more topics"
        >
          +
        </button>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
}

export default memo(NodeCard);
