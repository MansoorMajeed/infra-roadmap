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

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {frontmatter.title}
          </h2>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {difficultyLabel[frontmatter.difficulty]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {frontmatter.category}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <Markdown remarkPlugins={[remarkGfm]}>{summary}</Markdown>
        </div>

        {/* Deep Dive */}
        {deepDive && (
          <div>
            <button
              onClick={() => setShowDeepDive(!showDeepDive)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span className={`transition-transform ${showDeepDive ? "rotate-90" : ""}`}>
                ▶
              </span>
              {showDeepDive ? "Hide" : "Learn More"}
            </button>
            {showDeepDive && (
              <div className="mt-3 prose prose-sm dark:prose-invert max-w-none">
                <Markdown remarkPlugins={[remarkGfm]}>{deepDive}</Markdown>
              </div>
            )}
          </div>
        )}

        {/* Milestones */}
        {frontmatter.milestones.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Milestones
            </h3>
            <ul className="space-y-2">
              {frontmatter.milestones.map((milestone, i) => (
                <li key={i} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={progress.milestones[i] || false}
                    onChange={() => handleToggleMilestone(i)}
                    className="mt-1 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{milestone}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Resources */}
        {resources && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Resources
            </h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown remarkPlugins={[remarkGfm]}>{resources}</Markdown>
            </div>
          </div>
        )}

        {/* Where to go next */}
        {frontmatter.edges.to && frontmatter.edges.to.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Where to go next?
            </h3>
            <div className="space-y-2">
              {frontmatter.edges.to.map((edge) => (
                <button
                  key={edge.id}
                  onClick={() => onNavigate(edge.id)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <p className="text-sm italic text-gray-600 dark:text-gray-400">
                    &ldquo;{edge.question}&rdquo;
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                    → {edge.id.replace(/-/g, " ")}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleMarkComplete}
          className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            progress.status === "completed"
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {progress.status === "completed" ? "✓ Completed — Click to Undo" : "Mark as Complete"}
        </button>
      </div>
    </div>
  );
}
