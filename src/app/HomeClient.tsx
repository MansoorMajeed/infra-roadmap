"use client";

import dynamic from "next/dynamic";
import type { Zone, ZoneEdge, SearchableNode } from "@/lib/types";

const ZoneMap = dynamic(() => import("@/components/ZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading map...</div>
    </div>
  ),
});

interface HomeClientProps {
  zones: Zone[];
  zoneEdges: ZoneEdge[];
  zoneNodeIds: Record<string, string[]>;
  searchableNodes: SearchableNode[];
}

export default function HomeClient({
  zones,
  zoneEdges,
  zoneNodeIds,
  searchableNodes,
}: HomeClientProps) {
  return (
    <div className="w-screen h-screen">
      <ZoneMap
        zones={zones}
        zoneEdges={zoneEdges}
        zoneNodeIds={zoneNodeIds}
        searchableNodes={searchableNodes}
      />
    </div>
  );
}
