"use client";

import { useState, useEffect, useCallback } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { RoadmapNode, NodeProgress } from "@/lib/types";
import { getNodeProgress, setNodeStatus, toggleMilestone } from "@/lib/progress";

interface ContentPanelProps {
  node: RoadmapNode | null;
  onClose: () => void;
  onNavigate: (nodeId: string) => void;
  onProgressChange: () => void;
}

export default function ContentPanel({
  node,
  onClose,
  onNavigate,
  onProgressChange,
}: ContentPanelProps) {
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [progress, setProgress] = useState<NodeProgress>({
    status: "not-started",
    milestones: [],
  });

  const refreshProgress = useCallback(() => {
    if (node) {
      setProgress(getNodeProgress(node.frontmatter.id));
    }
  }, [node]);

  useEffect(() => {
    refreshProgress();
    setShowDeepDive(false);
  }, [refreshProgress]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!node) return null;

  const { frontmatter, summary, deepDive, resources } = node;

  const handleToggleMilestone = (index: number) => {
    toggleMilestone(frontmatter.id, index);
    refreshProgress();
    onProgressChange();
  };

  const handleMarkComplete = () => {
    const newStatus = progress.status === "completed" ? "not-started" : "completed";
    setNodeStatus(frontmatter.id, newStatus);
    refreshProgress();
    onProgressChange();
  };

  const difficultyLabel = { 1: "Beginner", 2: "Intermediate", 3: "Advanced" };
  const difficultyColor = {
    1: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    2: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
    3: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col pointer-events-auto border border-gray-200 dark:border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {frontmatter.title}
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[frontmatter.difficulty]}`}
                >
                  {difficultyLabel[frontmatter.difficulty]}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 capitalize">
                  {frontmatter.category}
                </span>
                {frontmatter.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 -m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Summary */}
            <div className="content-prose">
              <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
            </div>

            {/* Deep Dive */}
            {deepDive && (
              <div>
                <button
                  onClick={() => setShowDeepDive(!showDeepDive)}
                  className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${showDeepDive ? "rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {showDeepDive ? "Hide Deep Dive" : "Deep Dive — Learn More"}
                </button>
                {showDeepDive && (
                  <div className="mt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                    <div className="content-prose">
                      <Markdown remarkPlugins={[remarkGfm]}>{deepDive}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            {(frontmatter.milestones.length > 0 || resources) && (
              <hr className="border-gray-100 dark:border-gray-800" />
            )}

            {/* Milestones */}
            {frontmatter.milestones.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Milestones
                </h3>
                <ul className="space-y-2.5">
                  {frontmatter.milestones.map((milestone, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={progress.milestones[i] || false}
                        onChange={() => handleToggleMilestone(i)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          progress.milestones[i]
                            ? "text-gray-400 line-through"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {milestone}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resources */}
            {resources && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Resources
                </h3>
                <div className="content-prose content-prose-links">
                  <Markdown remarkPlugins={[remarkGfm]}>{resources}</Markdown>
                </div>
              </div>
            )}

            {/* Divider */}
            {frontmatter.edges.to && frontmatter.edges.to.length > 0 && (
              <hr className="border-gray-100 dark:border-gray-800" />
            )}

            {/* Where to go next */}
            {frontmatter.edges.to && frontmatter.edges.to.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  Where to go next?
                </h3>
                <div className="space-y-2">
                  {frontmatter.edges.to.map((edge) => (
                    <button
                      key={edge.id}
                      onClick={() => onNavigate(edge.id)}
                      className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all group"
                    >
                      <p className="text-sm italic text-gray-500 dark:text-gray-400 leading-relaxed">
                        &ldquo;{edge.question}&rdquo;
                      </p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1.5 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                        → {edge.id
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleMarkComplete}
              className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
                progress.status === "completed"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30"
                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              }`}
            >
              {progress.status === "completed"
                ? "✓ Completed — Click to Undo"
                : "Mark as Complete"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
