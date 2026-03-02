"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  type Node,
  type NodeChange,
  type Viewport,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { RoadmapNode, SearchableNode, Zone, NodeStatus } from "@/lib/types";
import { getProgress } from "@/lib/progress";
import { layoutNodes, buildEdges, getChildren, getDescendants, getInitialVisibleNodes } from "@/lib/layout";
import NodeCard from "./NodeCard";
import ZonePortalCard from "./ZonePortalCard";
import ContentPanel from "./ContentPanel";
import QuestionNode from "./QuestionNode";
import SearchModal from "./SearchModal";
import HelpModal from "./HelpModal";
import EntryPointSelector from "./EntryPointSelector";

interface NodeGraphProps {
  nodes: RoadmapNode[];
  zoneTitle: string;
  zoneColor: string;
  onBack: () => void;
  highlightNodeId?: string;
  focusNodeId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  searchableNodes: SearchableNode[];
  zones: Zone[];
}

const nodeTypes = { roadmapNode: NodeCard, zonePortalNode: ZonePortalCard, questionNode: QuestionNode };

const VISIBLE_NODES_STORAGE_KEY = "infra-roadmap-visible-nodes";
const VIEWPORT_STORAGE_KEY = "infra-roadmap-viewport";

function saveVisibleNodes(zoneId: string, ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(VISIBLE_NODES_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[zoneId] = Array.from(ids);
    localStorage.setItem(VISIBLE_NODES_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function loadVisibleNodes(zoneId: string): Set<string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VISIBLE_NODES_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data[zoneId] && Array.isArray(data[zoneId]) && data[zoneId].length > 0) {
      return new Set(data[zoneId] as string[]);
    }
    return null;
  } catch {
    return null;
  }
}

function saveViewport(zoneId: string, viewport: Viewport): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[zoneId] = viewport;
    localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function loadViewport(zoneId: string): Viewport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data[zoneId] && typeof data[zoneId].zoom === "number") {
      return data[zoneId] as Viewport;
    }
    return null;
  } catch {
    return null;
  }
}

// One localStorage read for all nodes — called on mount and after progress changes
function computeProgressMap(roadmapNodes: RoadmapNode[]): Map<string, NodeStatus> {
  const data = getProgress();
  const map = new Map<string, NodeStatus>();
  for (const n of roadmapNodes) {
    const id = n.frontmatter.id;
    map.set(id, data.nodes[id]?.status ?? "not-started");
  }
  return map;
}

function NodeGraphInner({
  nodes: roadmapNodes,
  zoneTitle,
  zoneColor,
  onBack,
  highlightNodeId,
  focusNodeId,
  onNodeSelect,
  searchableNodes,
  zones,
}: NodeGraphProps) {
  const router = useRouter();
  const zoneId = roadmapNodes[0]?.frontmatter.zone || "unknown";
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Initialize with deterministic defaults (no localStorage) to avoid hydration mismatch
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() =>
    getInitialVisibleNodes(roadmapNodes)
  );
  const [progressMap, setProgressMap] = useState<Map<string, NodeStatus>>(
    () => computeProgressMap(roadmapNodes)
  );
  const [zoomLocked, setZoomLocked] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [hydrated, setHydrated] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEntrySelector, setShowEntrySelector] = useState(false);
  const { fitView, setViewport, zoomIn, zoomOut, zoomTo, getZoom } = useReactFlow();

  // After hydration, load saved state from localStorage
  useEffect(() => {
    // Load saved visible nodes
    const saved = loadVisibleNodes(zoneId);
    if (saved) {
      const validIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));
      const filtered = new Set([...saved].filter((id) => validIds.has(id)));
      if (filtered.size > 0) setVisibleIds(filtered);
    }

    // Load saved zoom lock preference and help/hint state
    try {
      const savedLock = localStorage.getItem("infra-roadmap-zoom-lock");
      if (savedLock !== null) setZoomLocked(savedLock === "true");
      const helpSeen = localStorage.getItem("infra-roadmap-help-seen") === "true";
      if (!helpSeen) setShowHelp(true);
    } catch {
      // ignore
    }

    // Load saved viewport, then reveal
    const vp = loadViewport(zoneId);
    if (vp) {
      setTimeout(() => {
        setViewport(vp, { duration: 0 });
        setHydrated(true);
      }, 50);
    } else {
      setTimeout(() => {
        fitView({ padding: 0.4 });
        setHydrated(true);
      }, 50);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist visible nodes whenever they change (only after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveVisibleNodes(zoneId, visibleIds);
  }, [zoneId, visibleIds, hydrated]);

  // Persist zoom lock preference
  const toggleZoomLock = useCallback(() => {
    setZoomLocked((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("infra-roadmap-zoom-lock", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // Save viewport on changes and track zoom percentage
  const handleViewportChange = useCallback(
    (viewport: Viewport) => {
      setZoomPercent(Math.round(viewport.zoom * 100));
      saveViewport(zoneId, viewport);
    },
    [zoneId]
  );

  const anchorNodeRef = useRef<string | null>(null);

  const handleExpand = useCallback(
    (nodeId: string) => {
      anchorNodeRef.current = nodeId;
      setVisibleIds((prev) => {
        const next = new Set(prev);
        for (const childId of getChildren(nodeId, roadmapNodes)) {
          next.add(childId);
        }
        return next;
      });
      if (!zoomLocked) {
        setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
      }
    },
    [roadmapNodes, fitView, zoomLocked]
  );

  const handleCollapse = useCallback(
    (nodeId: string) => {
      anchorNodeRef.current = nodeId;
      setVisibleIds((prev) => {
        const descendants = getDescendants(nodeId, roadmapNodes);
        return new Set([...prev].filter((id) => !descendants.has(id)));
      });
      if (!zoomLocked) {
        setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
      }
    },
    [roadmapNodes, fitView, zoomLocked]
  );

  const nodesRef = useRef<Node[]>([]);

  const layoutedNodes = useMemo(
    () => {
      const result = layoutNodes(roadmapNodes, visibleIds, progressMap, handleExpand, handleCollapse, nodesRef.current, anchorNodeRef.current, zones);
      anchorNodeRef.current = null;
      return result;
    },
    [roadmapNodes, visibleIds, progressMap, handleExpand, handleCollapse, zones]
  );
  const flowEdges = useMemo(
    () => buildEdges(roadmapNodes, visibleIds),
    [roadmapNodes, visibleIds]
  );

  // Track node positions for dragging, but re-layout when visibleIds changes
  const [nodes, setNodes] = useState<Node[]>(layoutedNodes);

  useEffect(() => {
    setNodes(layoutedNodes);
    nodesRef.current = layoutedNodes;
  }, [layoutedNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        nodesRef.current = updated;
        return updated;
      });
    },
    []
  );

  // Highlight starting node (opens ContentPanel)
  useEffect(() => {
    if (highlightNodeId) {
      setVisibleIds((prev) => {
        if (prev.has(highlightNodeId)) return prev;
        const next = new Set(prev);
        next.add(highlightNodeId);
        return next;
      });
      const node = roadmapNodes.find((n) => n.frontmatter.id === highlightNodeId);
      if (node) setSelectedNode(node);
    }
  }, [highlightNodeId, roadmapNodes]);

  // Focus node from search (makes visible + centers, no ContentPanel)
  useEffect(() => {
    if (!focusNodeId) return;

    // Build reverse adjacency map: child id -> parent ids
    const parents = new Map<string, string[]>();
    for (const node of roadmapNodes) {
      for (const edge of node.frontmatter.edges.to ?? []) {
        if (!parents.has(edge.id)) parents.set(edge.id, []);
        parents.get(edge.id)!.push(node.frontmatter.id);
      }
    }

    // BFS upward from focusNodeId to collect all ancestors
    const toReveal = new Set<string>([focusNodeId]);
    const queue = [focusNodeId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const parentId of parents.get(current) ?? []) {
        if (!toReveal.has(parentId)) {
          toReveal.add(parentId);
          queue.push(parentId);
        }
      }
    }

    setVisibleIds((prev) => {
      const next = new Set(prev);
      for (const id of toReveal) next.add(id);
      return next;
    });

    setTimeout(() => {
      fitView({ nodes: [{ id: focusNodeId }], padding: 0.8, duration: 500 });
    }, 100);
  }, [focusNodeId, roadmapNodes, fitView]);

  // Sync zoom percent on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setZoomPercent(Math.round(getZoom() * 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [getZoom]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id.startsWith("zone-portal-")) {
        const zoneId = node.id.slice("zone-portal-".length);
        router.push(`/${zoneId}`);
        return;
      }
      if (node.id.startsWith("q-")) return; // Q nodes handle their own click
      const roadmapNode = roadmapNodes.find((n) => n.frontmatter.id === node.id);
      if (roadmapNode) {
        setSelectedNode(roadmapNode);
        onNodeSelect?.(node.id);
      }
    },
    [roadmapNodes, onNodeSelect, router]
  );

  const handleNavigate = useCallback(
    (nodeId: string) => {
      // Check if this is a cross-zone edge — if so, navigate to the zone
      for (const n of roadmapNodes) {
        const crossEdge = (n.frontmatter.edges.to ?? []).find(
          (e) => e.id === nodeId && e.zone
        );
        if (crossEdge?.zone) {
          router.push(`/${crossEdge.zone}`);
          return;
        }
      }
      // Normal intra-zone navigation
      setVisibleIds((prev) => {
        if (prev.has(nodeId)) return prev;
        const next = new Set(prev);
        next.add(nodeId);
        return next;
      });
      const node = roadmapNodes.find((n) => n.frontmatter.id === nodeId);
      if (node) setSelectedNode(node);
    },
    [roadmapNodes, router]
  );

  const handleProgressChange = useCallback(() => {
    setProgressMap(computeProgressMap(roadmapNodes));
  }, [roadmapNodes]);

  const dismissHelp = useCallback(() => {
    try { localStorage.setItem("infra-roadmap-help-seen", "true"); } catch { /* ignore */ }
    setShowHelp(false);
  }, []);

  const allVisible = roadmapNodes.every((n) => visibleIds.has(n.frontmatter.id));
  const toggleAllNodes = useCallback(() => {
    if (allVisible) {
      setVisibleIds(getInitialVisibleNodes(roadmapNodes));
    } else {
      setVisibleIds(new Set(roadmapNodes.map((n) => n.frontmatter.id)));
    }
    if (!zoomLocked) setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
  }, [allVisible, roadmapNodes, zoomLocked, fitView]);

  const btnClass =
    "h-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors flex items-center justify-center";

  return (
    <div className="w-full h-full relative" style={{ opacity: hydrated ? 1 : 0 }}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        onViewportChange={handleViewportChange}
        nodeTypes={nodeTypes}
        fitView={false}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>

      {/* Header */}
      <div className="absolute top-4 left-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        >
          ← Back
        </button>
        <h2 className="hidden sm:block text-lg font-bold text-gray-900 dark:text-gray-100">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: zoneColor }}
          />
          {zoneTitle}
        </h2>
      </div>

      <SearchModal
        nodes={searchableNodes}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setShowSearch(true)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors flex items-center gap-1.5"
        >
          🔍 <span className="hidden sm:inline">Search</span>
          <kbd className="hidden sm:inline text-xs border border-gray-200 dark:border-gray-600 rounded px-1">⌘K</kbd>
        </button>

        {/* Desktop-only action buttons */}
        <button
          onClick={toggleAllNodes}
          className="hidden sm:block px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        >
          {allVisible ? "Collapse All" : "Show All"}
        </button>

        {/* Mobile-only ⋮ menu */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm"
          >
            ⋮
          </button>
          {showMobileMenu && (
            <div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-10">
              <button
                onClick={() => { toggleAllNodes(); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
              >
                {allVisible ? "Collapse All" : "Show All"}
              </button>
              <button
                onClick={() => { toggleZoomLock(); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {zoomLocked ? "Unlock zoom" : "Lock zoom"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls — bottom right, Excalidraw-style */}
      <div className="absolute bottom-4 right-4 flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-0.5">
        <button
          onClick={() => zoomOut({ duration: 200 })}
          className={`${btnClass} w-8 rounded-r-none`}
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => zoomTo(1, { duration: 200 })}
          className={`${btnClass} w-14 rounded-none border-x-0 text-xs tabular-nums`}
          title="Reset to 100%"
        >
          {zoomPercent}%
        </button>
        <button
          onClick={() => zoomIn({ duration: 200 })}
          className={`${btnClass} w-8 rounded-l-none`}
          title="Zoom in"
        >
          +
        </button>
        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
        <button
          onClick={() => fitView({ padding: 0.4, duration: 300 })}
          className={`${btnClass} w-8 text-xs`}
          title="Fit to view"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
          </svg>
        </button>
        <button
          onClick={toggleZoomLock}
          className={`${btnClass} w-8 text-xs ${
            zoomLocked
              ? "!bg-blue-50 dark:!bg-blue-950/40 !border-blue-300 dark:!border-blue-600 !text-blue-600 dark:!text-blue-400"
              : ""
          }`}
          title={zoomLocked ? "Unlock — auto-zoom on expand" : "Lock — keep zoom level on expand"}
        >
          {zoomLocked ? (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="10" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="10" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0" />
            </svg>
          )}
        </button>
      </div>

      {/* Help button — bottom left */}
      <button
        onClick={() => setShowHelp(true)}
        className="absolute bottom-4 left-4 w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center justify-center font-semibold text-base"
        title="Help"
        aria-label="Help"
      >
        ?
      </button>

      {/* Content Modal */}
      {selectedNode && (
        <ContentPanel
          node={selectedNode}
          onClose={() => {
            setSelectedNode(null);
            onNodeSelect?.(null);
          }}
          onNavigate={handleNavigate}
          onProgressChange={handleProgressChange}
        />
      )}

      {showHelp && (
        <HelpModal
          onClose={dismissHelp}
          onShowEntrySelector={() => {
            dismissHelp();
            setShowEntrySelector(true);
          }}
        />
      )}

      {showEntrySelector && (
        <EntryPointSelector
          onSelect={(zone, nodeId) => {
            setShowEntrySelector(false);
            router.push(`/${zone}?node=${nodeId}`);
          }}
          onClose={() => setShowEntrySelector(false)}
        />
      )}
    </div>
  );
}

export default function NodeGraph(props: NodeGraphProps) {
  return (
    <ReactFlowProvider>
      <NodeGraphInner {...props} />
    </ReactFlowProvider>
  );
}
