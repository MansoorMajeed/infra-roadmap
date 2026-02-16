"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Zone, ZoneEdge } from "@/lib/types";
import { getCompletedCount } from "@/lib/progress";
import EntryPointSelector from "./EntryPointSelector";

interface ZoneMapProps {
  zones: Zone[];
  zoneEdges: ZoneEdge[];
  zoneNodeIds: Record<string, string[]>;
}

function ZoneNode({ data }: { data: Record<string, unknown> }) {
  const zone = data as unknown as Zone & {
    nodeCount: number;
    completedCount: number;
  };
  const progress =
    zone.nodeCount > 0
      ? Math.round((zone.completedCount / zone.nodeCount) * 100)
      : 0;

  return (
    <div
      className={`rounded-2xl border-2 p-5 min-w-[220px] max-w-[260px] shadow-lg transition-all ${
        zone.active
          ? "cursor-pointer hover:shadow-xl hover:scale-[1.02]"
          : "opacity-50 cursor-default"
      }`}
      style={{ borderColor: zone.color, backgroundColor: `${zone.color}10` }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div
        className="text-xs font-bold uppercase tracking-wider mb-1"
        style={{ color: zone.color }}
      >
        {zone.active ? "Explore" : "Coming Soon"}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
        {zone.title}
      </h3>
      <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-3">
        &ldquo;{zone.coreQuestion}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {zone.nodeCount} topics
        </span>
        {zone.active && zone.nodeCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: zone.color }}
              />
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

const nodeTypes = { zone: ZoneNode };

export default function ZoneMap({
  zones,
  zoneEdges,
  zoneNodeIds,
}: ZoneMapProps) {
  const router = useRouter();
  const [showEntrySelector, setShowEntrySelector] = useState(false);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const counts: Record<string, number> = {};
    for (const [zoneId, nodeIds] of Object.entries(zoneNodeIds)) {
      counts[zoneId] = getCompletedCount(nodeIds);
    }
    setCompletedCounts(counts);
  }, [zoneNodeIds]);

  const initialNodes: Node[] = useMemo(
    () =>
      zones.map((zone) => ({
        id: zone.id,
        type: "zone",
        position: zone.position,
        data: {
          ...zone,
          nodeCount: zoneNodeIds[zone.id]?.length ?? 0,
          completedCount: completedCounts[zone.id] ?? 0,
        },
      })),
    [zones, zoneNodeIds, completedCounts]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      zoneEdges.map((e, i) => ({
        id: `zone-edge-${i}`,
        source: e.from,
        target: e.to,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      })),
    [zoneEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when completedCounts change (useNodesState only initializes once)
  useEffect(() => {
    setNodes(initialNodes);
  }, [completedCounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const zone = zones.find((z) => z.id === node.id);
      if (zone?.active) {
        router.push(`/zone/${zone.id}`);
      }
    },
    [zones, router]
  );

  const handleEntrySelect = (zone: string, nodeId: string) => {
    setShowEntrySelector(false);
    const targetZone = zones.find((z) => z.id === zone);
    if (targetZone?.active) {
      router.push(`/zone/${zone}?node=${nodeId}`);
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Infra: Zero to Scale
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            SRE for everyone — click a zone to explore
          </p>
        </div>
        <button
          onClick={() => setShowEntrySelector(true)}
          className="pointer-events-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          Where do I start?
        </button>
      </div>

      {showEntrySelector && (
        <EntryPointSelector
          onSelect={handleEntrySelect}
          onClose={() => setShowEntrySelector(false)}
        />
      )}
    </div>
  );
}
