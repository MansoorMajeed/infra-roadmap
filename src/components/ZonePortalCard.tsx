"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface ZonePortalCardData {
  zoneId: string;
  zoneTitle: string;
  zoneColor: string;
  [key: string]: unknown;
}

function ZonePortalCard({ data }: NodeProps) {
  const { zoneTitle, zoneColor } = data as unknown as ZonePortalCardData;

  return (
    <div
      style={{ borderColor: zoneColor }}
      className="rounded-xl border-2 border-dashed bg-white dark:bg-gray-900 px-4 py-3 shadow-sm min-w-[160px] max-w-[200px] cursor-pointer transition-all hover:shadow-md"
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
      <div className="flex items-center gap-2">
        <span className="text-base">🗺️</span>
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-semibold uppercase tracking-wider leading-none mb-0.5"
            style={{ color: zoneColor }}
          >
            Explore Zone
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
            {zoneTitle}
          </div>
        </div>
        <svg
          className="w-4 h-4 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 !w-2 !h-2" />
    </div>
  );
}

export default memo(ZonePortalCard);
