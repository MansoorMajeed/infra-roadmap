"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export default function QuestionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
}: EdgeProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const question = (data?.question as string) || "";
  const detail = (data?.detail as string) || "";

  // Allow parent to force expand via data prop
  const forceExpanded = (data?.forceExpanded as boolean) || false;
  const isExpanded = expanded || forceExpanded;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: "#94a3b8", strokeWidth: 1.5 }}
      />
      <EdgeLabelRenderer>
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            zIndex: isExpanded ? 1000 : hovered ? 100 : 1,
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Collapsed: short question label */}
          <button
            onClick={handleClick}
            className={`
              max-w-[200px] px-1.5 py-1 rounded text-[9px] italic leading-tight
              text-gray-500 dark:text-gray-400
              bg-white/90 dark:bg-gray-800/90
              border border-gray-200/60 dark:border-gray-700/60
              cursor-pointer
              transition-all duration-200
              hover:border-blue-300 dark:hover:border-blue-600
              hover:bg-blue-50/80 dark:hover:bg-blue-950/50
              hover:text-gray-700 dark:hover:text-gray-300
              ${isExpanded ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md text-gray-700 dark:text-gray-300" : "shadow-sm"}
            `}
          >
            <span className="line-clamp-2">{question}</span>
            <span className="ml-0.5 text-blue-400 dark:text-blue-500 not-italic text-[8px]">
              {isExpanded ? "−" : "+"}
            </span>
          </button>

          {/* Expanded: detail popover */}
          {isExpanded && detail && (
            <div
              className="
                absolute left-1/2 -translate-x-1/2 top-full mt-1.5
                w-[280px] p-3 rounded-lg
                bg-white dark:bg-gray-800
                border border-blue-200 dark:border-blue-800
                shadow-lg shadow-blue-100/50 dark:shadow-blue-900/30
              "
            >
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-1.5 italic">
                &ldquo;{question}&rdquo;
              </p>
              <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                {detail}
              </p>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
