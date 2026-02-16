import { getZonesConfig, getNodesByZone, validateEdgeReferences } from "@/lib/content";
import HomeClient from "./HomeClient";

export default function Home() {
  validateEdgeReferences();
  const config = getZonesConfig();

  // Only compute node IDs per zone (for progress display), not full node data
  const zoneNodeIds: Record<string, string[]> = {};

  for (const zone of config.zones) {
    const nodes = getNodesByZone(zone.id);
    zoneNodeIds[zone.id] = nodes.map((n) => n.frontmatter.id);
  }

  return (
    <HomeClient
      zones={config.zones}
      zoneEdges={config.zoneEdges}
      zoneNodeIds={zoneNodeIds}
    />
  );
}
