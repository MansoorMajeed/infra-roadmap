import { getZonesConfig, getNodesByZone } from "@/lib/content";
import HomeClient from "./HomeClient";

export default function Home() {
  const config = getZonesConfig();

  // Pre-compute node IDs per zone and serialize node data for active zones
  const zoneNodeIds: Record<string, string[]> = {};
  const zoneNodes: Record<
    string,
    {
      frontmatter: import("@/lib/types").NodeFrontmatter;
      summary: string;
      deepDive: string;
      resources: string;
    }[]
  > = {};

  for (const zone of config.zones) {
    const nodes = getNodesByZone(zone.id);
    zoneNodeIds[zone.id] = nodes.map((n) => n.frontmatter.id);
    if (zone.active) {
      zoneNodes[zone.id] = nodes;
    }
  }

  return (
    <HomeClient
      zones={config.zones}
      zoneEdges={config.zoneEdges}
      zoneNodeIds={zoneNodeIds}
      zoneNodes={zoneNodes}
    />
  );
}
