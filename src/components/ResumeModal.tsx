"use client";

import { useEffect } from "react";
import type { LastNode } from "@/lib/progress";

interface ResumeModalProps {
  lastNode: LastNode;
  onResume: () => void;
  onDismiss: () => void;
  onAlways: () => void;
  onNever: () => void;
}

function timeAgo(timestamp: string): string {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function ResumeModal({
  lastNode,
  onResume,
  onDismiss,
  onAlways,
  onNever,
}: ResumeModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDismiss]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onDismiss} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Continue where you left off?
            </h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-5">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {lastNode.nodeTitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                in {lastNode.zoneTitle} &middot; {timeAgo(lastNode.timestamp)}
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={onResume}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Yes, take me there
              </button>
              <button
                onClick={onDismiss}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                No thanks
              </button>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={onAlways}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Always resume
                </button>
                <button
                  onClick={onNever}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Never ask
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
