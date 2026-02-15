"use client";

import { useState } from "react";
import type { Zone, ZoneEdge, RoadmapNode } from "@/lib/types";
import ZoneMap from "@/components/ZoneMap";
import NodeGraph from "@/components/NodeGraph";

interface HomeClientProps {
  zones: Zone[];
  zoneEdges: ZoneEdge[];
  zoneNodeIds: Record<string, string[]>;
  zoneNodes: Record<string, RoadmapNode[]>;
}

export default function HomeClient({
  zones,
  zoneEdges,
  zoneNodeIds,
  zoneNodes,
}: HomeClientProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [highlightNode, setHighlightNode] = useState<string | undefined>();

  const handleZoneClick = (zoneId: string, nodeId?: string) => {
    setActiveZone(zoneId);
    setHighlightNode(nodeId);
  };

  const handleBack = () => {
    setActiveZone(null);
    setHighlightNode(undefined);
  };

  const currentZone = zones.find((z) => z.id === activeZone);

  return (
    <div className="w-screen h-screen">
      {activeZone && currentZone && zoneNodes[activeZone] ? (
        <NodeGraph
          nodes={zoneNodes[activeZone]}
          zoneTitle={currentZone.title}
          zoneColor={currentZone.color}
          onBack={handleBack}
          highlightNodeId={highlightNode}
        />
      ) : (
        <ZoneMap
          zones={zones}
          zoneEdges={zoneEdges}
          zoneNodeIds={zoneNodeIds}
          onZoneClick={(zoneId) => handleZoneClick(zoneId)}
        />
      )}
    </div>
  );
}
