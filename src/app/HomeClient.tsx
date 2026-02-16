"use client";

import type { Zone, ZoneEdge } from "@/lib/types";
import ZoneMap from "@/components/ZoneMap";

interface HomeClientProps {
  zones: Zone[];
  zoneEdges: ZoneEdge[];
  zoneNodeIds: Record<string, string[]>;
}

export default function HomeClient({
  zones,
  zoneEdges,
  zoneNodeIds,
}: HomeClientProps) {
  return (
    <div className="w-screen h-screen">
      <ZoneMap
        zones={zones}
        zoneEdges={zoneEdges}
        zoneNodeIds={zoneNodeIds}
      />
    </div>
  );
}
