import { getZonesConfig, getNodesByZone, validateEdgeReferences } from "@/lib/content";
import type { SearchableNode } from "@/lib/types";
import HomeClient from "./HomeClient";

export default function Home() {
  validateEdgeReferences();
  const config = getZonesConfig();

  const zoneNodeIds: Record<string, string[]> = {};
  const searchableNodes: SearchableNode[] = [];
  const seenNodeIds = new Set<string>();

  for (const zone of config.zones) {
    const nodes = getNodesByZone(zone.id);
    zoneNodeIds[zone.id] = nodes.map((n) => n.frontmatter.id);
    if (!zone.active) continue;
    for (const node of nodes) {
      if (seenNodeIds.has(node.frontmatter.id)) continue;
      seenNodeIds.add(node.frontmatter.id);
      searchableNodes.push({
        id: node.frontmatter.id,
        title: node.frontmatter.title,
        zoneId: zone.id,
        zoneTitle: zone.title,
        zoneColor: zone.color,
        tags: node.frontmatter.tags,
        category: node.frontmatter.category,
        difficulty: node.frontmatter.difficulty,
        edgesTo: node.frontmatter.edges.to ?? [],
      });
    }
  }

  return (
    <HomeClient
      zones={config.zones}
      zoneEdges={config.zoneEdges}
      zoneNodeIds={zoneNodeIds}
      searchableNodes={searchableNodes}
    />
  );
}
