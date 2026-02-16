"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeChange,
  type Viewport,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import type { RoadmapNode } from "@/lib/types";
import { getNodeProgress } from "@/lib/progress";
import NodeCard from "./NodeCard";
import ContentPanel from "./ContentPanel";
import QuestionEdge from "./QuestionEdge";

interface NodeGraphProps {
  nodes: RoadmapNode[];
  zoneTitle: string;
  zoneColor: string;
  onBack: () => void;
  highlightNodeId?: string;
  onNodeSelect?: (nodeId: string | null) => void;
}

const nodeTypes = { roadmapNode: NodeCard };
const edgeTypes = { question: QuestionEdge };

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

// Find root nodes (no incoming edges from within this zone)
function findRoots(roadmapNodes: RoadmapNode[]): string[] {
  const nodeIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));
  const hasIncoming = new Set<string>();

  for (const n of roadmapNodes) {
    if (n.frontmatter.edges.to) {
      for (const edge of n.frontmatter.edges.to) {
        if (nodeIds.has(edge.id)) {
          hasIncoming.add(edge.id);
        }
      }
    }
  }

  return roadmapNodes
    .map((n) => n.frontmatter.id)
    .filter((id) => !hasIncoming.has(id));
}

// Get direct children of a node (within the zone)
function getChildren(nodeId: string, roadmapNodes: RoadmapNode[]): string[] {
  const nodeIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));
  const node = roadmapNodes.find((n) => n.frontmatter.id === nodeId);
  if (!node?.frontmatter.edges.to) return [];
  return node.frontmatter.edges.to.map((e) => e.id).filter((id) => nodeIds.has(id));
}

// Get all descendants of a node recursively
function getDescendants(nodeId: string, roadmapNodes: RoadmapNode[]): Set<string> {
  const descendants = new Set<string>();
  const queue = getChildren(nodeId, roadmapNodes);
  while (queue.length > 0) {
    const child = queue.shift()!;
    if (descendants.has(child)) continue;
    descendants.add(child);
    queue.push(...getChildren(child, roadmapNodes));
  }
  return descendants;
}

// Get the initial visible set: roots + their direct children
function getInitialVisibleNodes(roadmapNodes: RoadmapNode[]): Set<string> {
  const roots = findRoots(roadmapNodes);
  const visible = new Set(roots);

  for (const rootId of roots) {
    for (const childId of getChildren(rootId, roadmapNodes)) {
      visible.add(childId);
    }
  }

  return visible;
}

// Check if a node has any visible children
function hasVisibleChildren(
  nodeId: string,
  roadmapNodes: RoadmapNode[],
  visibleIds: Set<string>
): boolean {
  const children = getChildren(nodeId, roadmapNodes);
  return children.some((id) => visibleIds.has(id));
}

// Check if a node is a root (cannot be collapsed)
function isRoot(nodeId: string, roadmapNodes: RoadmapNode[]): boolean {
  return findRoots(roadmapNodes).includes(nodeId);
}

// Layout only visible nodes using dagre for edge-crossing minimization
function layoutNodes(
  roadmapNodes: RoadmapNode[],
  visibleIds: Set<string>,
  onExpand: (nodeId: string) => void,
  onCollapse: (nodeId: string) => void,
  previousNodes?: Node[],
  anchorNodeId?: string | null
): Node[] {
  const visibleNodes = roadmapNodes.filter((n) => visibleIds.has(n.frontmatter.id));
  const allNodeIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));

  const nodeWidth = 200;
  const nodeHeight = 70;

  // Build dagre graph
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", ranksep: 180, nodesep: 80, edgesep: 40 });

  for (const n of visibleNodes) {
    g.setNode(n.frontmatter.id, { width: nodeWidth, height: nodeHeight });
  }

  for (const n of visibleNodes) {
    if (n.frontmatter.edges.to) {
      for (const edge of n.frontmatter.edges.to) {
        if (visibleIds.has(edge.id)) {
          g.setEdge(n.frontmatter.id, edge.id);
        }
      }
    }
  }

  Dagre.layout(g);

  // Build a map of previous positions for anchoring
  const prevPosMap = new Map<string, { x: number; y: number }>();
  if (previousNodes) {
    for (const pn of previousNodes) {
      prevPosMap.set(pn.id, pn.position);
    }
  }

  // Anchor the layout so the clicked node stays in place.
  // If no specific anchor, fall back to centroid of shared nodes.
  let offsetX = 0;
  let offsetY = 0;
  if (prevPosMap.size > 0) {
    const anchorId = anchorNodeId && prevPosMap.has(anchorNodeId) && g.node(anchorNodeId)
      ? anchorNodeId
      : null;

    if (anchorId) {
      const prev = prevPosMap.get(anchorId)!;
      const dagrePos = g.node(anchorId);
      offsetX = prev.x - (dagrePos.x - nodeWidth / 2);
      offsetY = prev.y - (dagrePos.y - nodeHeight / 2);
    } else {
      let sumDx = 0;
      let sumDy = 0;
      let count = 0;
      for (const n of visibleNodes) {
        const id = n.frontmatter.id;
        const prev = prevPosMap.get(id);
        if (prev) {
          const dagrePos = g.node(id);
          sumDx += prev.x - (dagrePos.x - nodeWidth / 2);
          sumDy += prev.y - (dagrePos.y - nodeHeight / 2);
          count++;
        }
      }
      if (count > 0) {
        offsetX = sumDx / count;
        offsetY = sumDy / count;
      }
    }
  }

  // Convert dagre positions (center-based) to React Flow positions (top-left)
  const flowNodes: Node[] = [];
  for (const n of visibleNodes) {
    const nodeId = n.frontmatter.id;
    const pos = g.node(nodeId);
    const progress = getNodeProgress(nodeId);

    const childrenInZone = (n.frontmatter.edges.to || [])
      .map((e) => e.id)
      .filter((id) => allNodeIds.has(id));
    const hasHiddenChildren = childrenInZone.some((id) => !visibleIds.has(id));
    const canCollapse =
      !hasHiddenChildren &&
      !isRoot(nodeId, roadmapNodes) &&
      hasVisibleChildren(nodeId, roadmapNodes, visibleIds);

    flowNodes.push({
      id: nodeId,
      type: "roadmapNode",
      position: {
        x: pos.x - nodeWidth / 2 + offsetX,
        y: pos.y - nodeHeight / 2 + offsetY,
      },
      data: {
        label: n.frontmatter.title,
        difficulty: n.frontmatter.difficulty,
        category: n.frontmatter.category,
        status: progress.status,
        hasHiddenChildren,
        canCollapse,
        onExpand,
        onCollapse,
        nodeId,
      },
    });
  }

  return flowNodes;
}

function buildEdges(
  roadmapNodes: RoadmapNode[],
  visibleIds: Set<string>,
  allEdgesExpanded: boolean,
  onEdgeExpand?: (x: number, y: number) => void
): Edge[] {
  const edges: Edge[] = [];

  for (const node of roadmapNodes) {
    if (!visibleIds.has(node.frontmatter.id)) continue;
    if (node.frontmatter.edges.to) {
      for (const edge of node.frontmatter.edges.to) {
        if (visibleIds.has(edge.id)) {
          edges.push({
            id: `${node.frontmatter.id}-${edge.id}`,
            source: node.frontmatter.id,
            target: edge.id,
            type: "question",
            data: {
              question: edge.question,
              detail: edge.detail || "",
              forceExpanded: allEdgesExpanded,
              onExpand: onEdgeExpand,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 16,
              height: 16,
              color: "#94a3b8",
            },
          });
        }
      }
    }
  }

  return edges;
}

function NodeGraphInner({
  nodes: roadmapNodes,
  zoneTitle,
  zoneColor,
  onBack,
  highlightNodeId,
  onNodeSelect,
}: NodeGraphProps) {
  const zoneId = roadmapNodes[0]?.frontmatter.zone || "unknown";
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  // Initialize with deterministic defaults (no localStorage) to avoid hydration mismatch
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() =>
    getInitialVisibleNodes(roadmapNodes)
  );
  const [allEdgesExpanded, setAllEdgesExpanded] = useState(false);
  const [zoomLocked, setZoomLocked] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [refreshKey, setRefreshKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const reactFlowInstance = useReactFlow();
  const { fitView, setViewport, zoomIn, zoomOut, zoomTo, getZoom, setCenter } =
    reactFlowInstance;

  // After hydration, load saved state from localStorage
  useEffect(() => {
    // Load saved visible nodes
    const saved = loadVisibleNodes(zoneId);
    if (saved) {
      const validIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));
      const filtered = new Set([...saved].filter((id) => validIds.has(id)));
      if (filtered.size > 0) setVisibleIds(filtered);
    }

    // Load saved zoom lock preference
    try {
      const savedLock = localStorage.getItem("infra-roadmap-zoom-lock");
      if (savedLock !== null) {
        setZoomLocked(savedLock === "true");
      }
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
        const children = getChildren(nodeId, roadmapNodes);
        for (const childId of children) {
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
        const next = new Set([...prev].filter((id) => !descendants.has(id)));
        return next;
      });
      if (!zoomLocked) {
        setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
      }
    },
    [roadmapNodes, fitView, zoomLocked]
  );

  const handleEdgeExpand = useCallback(
    (x: number, y: number) => {
      // Only recenter if the label would be near the edge of the viewport
      const zoom = getZoom();
      const vp = reactFlowInstance.getViewport();
      const container = document.querySelector(".react-flow");
      if (!container) return;
      const { width, height } = container.getBoundingClientRect();
      // Convert flow coords to screen coords
      const screenX = x * zoom + vp.x;
      const screenY = y * zoom + vp.y;
      // Add margin for the popover (280px wide, ~120px tall)
      const margin = 160;
      if (
        screenX < margin ||
        screenX > width - margin ||
        screenY < margin ||
        screenY > height - margin
      ) {
        setCenter(x, y, { zoom, duration: 300 });
      }
    },
    [setCenter, getZoom, reactFlowInstance]
  );

  const nodesRef = useRef<Node[]>([]);

  const layoutedNodes = useMemo(
    () => {
      const result = layoutNodes(roadmapNodes, visibleIds, handleExpand, handleCollapse, nodesRef.current, anchorNodeRef.current);
      anchorNodeRef.current = null;
      return result;
    },
    [roadmapNodes, visibleIds, handleExpand, handleCollapse, refreshKey]
  );
  const flowEdges = useMemo(
    () => buildEdges(roadmapNodes, visibleIds, allEdgesExpanded, handleEdgeExpand),
    [roadmapNodes, visibleIds, allEdgesExpanded, handleEdgeExpand]
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

  // Highlight starting node
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

  // Sync zoom percent on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setZoomPercent(Math.round(getZoom() * 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [getZoom]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const roadmapNode = roadmapNodes.find((n) => n.frontmatter.id === node.id);
      if (roadmapNode) {
        setSelectedNode(roadmapNode);
        onNodeSelect?.(node.id);
      }
    },
    [roadmapNodes, onNodeSelect]
  );

  const handleNavigate = useCallback(
    (nodeId: string) => {
      setVisibleIds((prev) => {
        if (prev.has(nodeId)) return prev;
        const next = new Set(prev);
        next.add(nodeId);
        return next;
      });
      const node = roadmapNodes.find((n) => n.frontmatter.id === nodeId);
      if (node) setSelectedNode(node);
    },
    [roadmapNodes]
  );

  const handleProgressChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Suppress lint warning
  void refreshKey;

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
        edgeTypes={edgeTypes}
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          <span
            className="inline-block w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: zoneColor }}
          />
          {zoneTitle}
        </h2>
      </div>

      {/* Top-right buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setAllEdgesExpanded((prev) => !prev)}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        >
          {allEdgesExpanded ? "Hide Questions" : "Show Questions"}
        </button>
        <button
          onClick={() => {
            setVisibleIds(new Set(roadmapNodes.map((n) => n.frontmatter.id)));
            if (!zoomLocked) {
              setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
            }
          }}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        >
          Show All
        </button>
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
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <path d="M2 6h12M6 2v12" />
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
          {zoomLocked ? "🔒" : "🔓"}
        </button>
      </div>

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
