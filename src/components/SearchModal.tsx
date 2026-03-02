"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { SearchableNode } from "@/lib/types";

interface SearchModalProps {
  nodes: SearchableNode[];
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons: Record<string, string> = {
  concept: "💡",
  tool: "🔧",
  practice: "📋",
  principle: "🎯",
};

export default function SearchModal({ nodes, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const nodeById = useMemo(
    () => new Map(nodes.map((n) => [n.id, n])),
    [nodes]
  );

  const fuse = useMemo(
    () =>
      new Fuse(nodes, {
        keys: [
          { name: "title", weight: 3 },
          { name: "tags", weight: 1.5 },
          { name: "category", weight: 0.5 },
          { name: "zoneTitle", weight: 0.5 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [nodes]
  );

  const results = useMemo(() => {
    if (!query.trim()) return nodes.slice(0, 8).map((n) => ({ item: n }));
    return fuse.search(query).slice(0, 8);
  }, [query, fuse, nodes]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSelect = (node: SearchableNode) => {
    onClose();
    router.push(`/${node.zoneId}?focus=${node.id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-gray-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes..."
            className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-base"
          />
          <kbd className="hidden sm:inline text-xs text-gray-400 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5">
            esc
          </kbd>
        </div>

        {/* Results */}
        <ul className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-400">
              No results for &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map(({ item }) => {
              const connections = (item.edgesTo ?? [])
                .map((e) => nodeById.get(e.id))
                .filter(Boolean) as SearchableNode[];

              return (
                <li key={`${item.zoneId}-${item.id}`}>
                  <button
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-1">
                      <span>{categoryIcons[item.category] ?? "📄"}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {item.title}
                      </span>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ backgroundColor: `${item.zoneColor}20`, color: item.zoneColor }}
                      >
                        {item.zoneTitle}
                      </span>
                    </div>

                    {/* Tags */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-gray-400 dark:text-gray-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Connections */}
                    {connections.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                        {connections.map((c) => (
                          <span key={c.id} className="text-xs text-gray-400 dark:text-gray-500">
                            → {c.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 text-xs text-gray-400">
          <span>↵ to navigate</span>
          <span>esc to close</span>
        </div>
      </div>
    </div>
  );
}
