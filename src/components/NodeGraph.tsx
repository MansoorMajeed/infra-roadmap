"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  type NodeChange,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { RoadmapNode } from "@/lib/types";
import { getNodeProgress } from "@/lib/progress";
import NodeCard from "./NodeCard";
import ContentPanel from "./ContentPanel";

interface NodeGraphProps {
  nodes: RoadmapNode[];
  zoneTitle: string;
  zoneColor: string;
  onBack: () => void;
  highlightNodeId?: string;
}

const nodeTypes = { roadmapNode: NodeCard };

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

// Layout only visible nodes using topological depth
function layoutNodes(
  roadmapNodes: RoadmapNode[],
  visibleIds: Set<string>,
  onExpand: (nodeId: string) => void
): Node[] {
  const visibleNodes = roadmapNodes.filter((n) => visibleIds.has(n.frontmatter.id));
  const nodeMap = new Map(visibleNodes.map((n) => [n.frontmatter.id, n]));
  const allNodeMap = new Map(roadmapNodes.map((n) => [n.frontmatter.id, n]));
  const allNodeIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));

  // Calculate depth via BFS from roots
  const depths = new Map<string, number>();
  const inDegree = new Map<string, number>();

  for (const n of visibleNodes) {
    inDegree.set(n.frontmatter.id, 0);
  }

  for (const n of visibleNodes) {
    if (n.frontmatter.edges.to) {
      for (const edge of n.frontmatter.edges.to) {
        if (nodeMap.has(edge.id)) {
          inDegree.set(edge.id, (inDegree.get(edge.id) || 0) + 1);
        }
      }
    }
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push(id);
      depths.set(id, 0);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = nodeMap.get(current);
    if (!node) continue;
    const currentDepth = depths.get(current) || 0;

    if (node.frontmatter.edges.to) {
      for (const edge of node.frontmatter.edges.to) {
        if (nodeMap.has(edge.id)) {
          const existingDepth = depths.get(edge.id);
          if (existingDepth === undefined || existingDepth < currentDepth + 1) {
            depths.set(edge.id, currentDepth + 1);
            queue.push(edge.id);
          }
        }
      }
    }
  }

  for (const n of visibleNodes) {
    if (!depths.has(n.frontmatter.id)) {
      depths.set(n.frontmatter.id, 0);
    }
  }

  // Group by depth
  const byDepth = new Map<number, RoadmapNode[]>();
  for (const n of visibleNodes) {
    const d = depths.get(n.frontmatter.id) || 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  }

  const flowNodes: Node[] = [];
  const xSpacing = 260;
  const ySpacing = 140;

  for (const [depth, nodesAtDepth] of byDepth) {
    const totalWidth = (nodesAtDepth.length - 1) * xSpacing;
    const startX = -totalWidth / 2;

    nodesAtDepth.forEach((n, i) => {
      const progress = getNodeProgress(n.frontmatter.id);

      // Check if this node has children that are not yet visible
      const childrenInZone = (n.frontmatter.edges.to || [])
        .map((e) => e.id)
        .filter((id) => allNodeIds.has(id));
      const hasHiddenChildren = childrenInZone.some((id) => !visibleIds.has(id));

      flowNodes.push({
        id: n.frontmatter.id,
        type: "roadmapNode",
        position: { x: startX + i * xSpacing, y: depth * ySpacing },
        data: {
          label: n.frontmatter.title,
          difficulty: n.frontmatter.difficulty,
          category: n.frontmatter.category,
          status: progress.status,
          hasHiddenChildren,
          onExpand,
          nodeId: n.frontmatter.id,
        },
      });
    });
  }

  // Suppress unused variable warning
  void allNodeMap;

  return flowNodes;
}

function buildEdges(roadmapNodes: RoadmapNode[], visibleIds: Set<string>): Edge[] {
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
            label:
              edge.question.length > 50
                ? edge.question.slice(0, 47) + "..."
                : edge.question,
            labelStyle: {
              fontSize: 10,
              fill: "#6b7280",
              fontStyle: "italic",
            },
            labelBgStyle: {
              fill: "white",
              fillOpacity: 0.85,
            },
            labelBgPadding: [6, 3] as [number, number],
            labelBgBorderRadius: 4,
            style: { stroke: "#94a3b8", strokeWidth: 1.5 },
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
}: NodeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [visibleIds, setVisibleIds] = useState<Set<string>>(() =>
    getInitialVisibleNodes(roadmapNodes)
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const { fitView } = useReactFlow();

  const handleExpand = useCallback(
    (nodeId: string) => {
      setVisibleIds((prev) => {
        const next = new Set(prev);
        const children = getChildren(nodeId, roadmapNodes);
        for (const childId of children) {
          next.add(childId);
        }
        return next;
      });
      // Fit view after expansion with a small delay for the layout to settle
      setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
    },
    [roadmapNodes, fitView]
  );

  const layoutedNodes = useMemo(
    () => layoutNodes(roadmapNodes, visibleIds, handleExpand),
    [roadmapNodes, visibleIds, handleExpand, refreshKey]
  );
  const flowEdges = useMemo(
    () => buildEdges(roadmapNodes, visibleIds),
    [roadmapNodes, visibleIds]
  );

  // Track node positions for dragging, but re-layout when visibleIds changes
  const [nodes, setNodes] = useState<Node[]>(layoutedNodes);

  useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // Highlight starting node
  useEffect(() => {
    if (highlightNodeId) {
      // Make sure highlighted node is visible
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

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const roadmapNode = roadmapNodes.find((n) => n.frontmatter.id === node.id);
      if (roadmapNode) setSelectedNode(roadmapNode);
    },
    [roadmapNodes]
  );

  const handleNavigate = useCallback(
    (nodeId: string) => {
      // Ensure the node is visible first
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

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
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

      {/* Expand All button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => {
            setVisibleIds(new Set(roadmapNodes.map((n) => n.frontmatter.id)));
            setTimeout(() => fitView({ padding: 0.4, duration: 300 }), 50);
          }}
          className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        >
          Show All
        </button>
      </div>

      {/* Content Modal */}
      {selectedNode && (
        <ContentPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
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
