"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export interface QuestionNodeData {
  question: string;
  detail?: string;
  [key: string]: unknown;
}

function QuestionNode({ data }: NodeProps) {
  const nodeData = data as unknown as QuestionNodeData;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen((prev) => !prev);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ zIndex: open ? 1000 : "auto" }}>
      <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-1.5 !h-1.5" />
      <div
        onClick={handleClick}
        className={`
          max-w-[180px] min-w-[120px] px-2 py-1.5 rounded cursor-pointer
          text-[9px] italic leading-tight
          text-gray-500 dark:text-gray-400
          bg-white/90 dark:bg-gray-800/90
          border border-gray-200/60 dark:border-gray-700/60
          shadow-sm transition-all duration-200
          hover:border-blue-300 dark:hover:border-blue-600
          hover:bg-blue-50/80 dark:hover:bg-blue-950/50
          hover:text-gray-700 dark:hover:text-gray-300
          ${open ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/60 shadow-md text-gray-700 dark:text-gray-300" : ""}
        `}
      >
        <div className="flex items-start justify-between gap-1">
          <span className="line-clamp-2">{nodeData.question}</span>
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 mt-0.5 text-blue-400 dark:text-blue-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path d="M1.5 2.5 L4 5.5 L6.5 2.5" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 z-50 w-[280px] p-3 rounded-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-100/50 dark:shadow-blue-900/30">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-sm leading-none"
            title="Close"
          >
            ×
          </button>
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-1.5 italic pr-4">
            &ldquo;{nodeData.question}&rdquo;
          </p>
          {nodeData.detail && (
            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
              {nodeData.detail}
            </p>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-1.5 !h-1.5" />
    </div>
  );
}

export default memo(QuestionNode);
