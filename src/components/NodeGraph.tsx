"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
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

// Simple layout: arrange nodes in rows based on topological depth
function layoutNodes(roadmapNodes: RoadmapNode[]): Node[] {
  const nodeMap = new Map(roadmapNodes.map((n) => [n.frontmatter.id, n]));

  // Calculate depth for each node (BFS from roots)
  const depths = new Map<string, number>();
  const inDegree = new Map<string, number>();

  for (const n of roadmapNodes) {
    inDegree.set(n.frontmatter.id, 0);
  }

  for (const n of roadmapNodes) {
    if (n.frontmatter.edges.to) {
      for (const edge of n.frontmatter.edges.to) {
        if (nodeMap.has(edge.id)) {
          inDegree.set(edge.id, (inDegree.get(edge.id) || 0) + 1);
        }
      }
    }
  }

  // Find roots (no incoming edges within this zone)
  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) {
      queue.push(id);
      depths.set(id, 0);
    }
  }

  // BFS
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

  // Assign depths to any remaining nodes (disconnected)
  for (const n of roadmapNodes) {
    if (!depths.has(n.frontmatter.id)) {
      depths.set(n.frontmatter.id, 0);
    }
  }

  // Group by depth
  const byDepth = new Map<number, RoadmapNode[]>();
  for (const n of roadmapNodes) {
    const d = depths.get(n.frontmatter.id) || 0;
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(n);
  }

  const flowNodes: Node[] = [];
  const xSpacing = 260;
  const ySpacing = 120;

  for (const [depth, nodesAtDepth] of byDepth) {
    const totalWidth = (nodesAtDepth.length - 1) * xSpacing;
    const startX = -totalWidth / 2;

    nodesAtDepth.forEach((n, i) => {
      const progress = getNodeProgress(n.frontmatter.id);
      flowNodes.push({
        id: n.frontmatter.id,
        type: "roadmapNode",
        position: { x: startX + i * xSpacing, y: depth * ySpacing },
        data: {
          label: n.frontmatter.title,
          difficulty: n.frontmatter.difficulty,
          category: n.frontmatter.category,
          status: progress.status,
        },
      });
    });
  }

  return flowNodes;
}

function buildEdges(roadmapNodes: RoadmapNode[]): Edge[] {
  const nodeIds = new Set(roadmapNodes.map((n) => n.frontmatter.id));
  const edges: Edge[] = [];

  for (const node of roadmapNodes) {
    if (node.frontmatter.edges.to) {
      for (const edge of node.frontmatter.edges.to) {
        if (nodeIds.has(edge.id)) {
          edges.push({
            id: `${node.frontmatter.id}-${edge.id}`,
            source: node.frontmatter.id,
            target: edge.id,
            label: edge.question.length > 50 ? edge.question.slice(0, 47) + "..." : edge.question,
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
            animated: false,
          });
        }
      }
    }
  }

  return edges;
}

export default function NodeGraph({
  nodes: roadmapNodes,
  zoneTitle,
  zoneColor,
  onBack,
  highlightNodeId,
}: NodeGraphProps) {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const initialNodes = useMemo(() => layoutNodes(roadmapNodes), [roadmapNodes, refreshKey]);
  const initialEdges = useMemo(() => buildEdges(roadmapNodes), [roadmapNodes]);

  const [flowNodes, , onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, , onEdgesChange] = useEdgesState(initialEdges);

  // Highlight starting node
  useEffect(() => {
    if (highlightNodeId) {
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
      const node = roadmapNodes.find((n) => n.frontmatter.id === nodeId);
      if (node) setSelectedNode(node);
    },
    [roadmapNodes]
  );

  const handleProgressChange = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Suppress lint warning for refreshKey - it's used to trigger re-layout
  void refreshKey;

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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

      {/* Content Panel */}
      {selectedNode && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelectedNode(null)}
          />
          <ContentPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onNavigate={handleNavigate}
            onProgressChange={handleProgressChange}
          />
        </>
      )}
    </div>
  );
}
