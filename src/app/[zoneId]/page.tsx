import { notFound } from "next/navigation";
import { getZonesConfig, getNodesByZone } from "@/lib/content";
import type { SearchableNode } from "@/lib/types";
import ZoneClient from "./ZoneClient";

export function generateStaticParams() {
  const config = getZonesConfig();
  return config.zones
    .filter((z) => z.active)
    .map((z) => ({ zoneId: z.id }));
}

interface ZonePageProps {
  params: Promise<{ zoneId: string }>;
}

export default async function ZonePage({ params }: ZonePageProps) {
  const { zoneId } = await params;
  const config = getZonesConfig();
  const zone = config.zones.find((z) => z.id === zoneId);

  if (!zone || !zone.active) {
    notFound();
  }

  const nodes = getNodesByZone(zoneId);

  if (nodes.length === 0) {
    notFound();
  }

  const searchableNodes: SearchableNode[] = [];
  const seenNodeIds = new Set<string>();
  for (const z of config.zones) {
    if (!z.active) continue;
    for (const node of getNodesByZone(z.id)) {
      if (seenNodeIds.has(node.frontmatter.id)) continue;
      seenNodeIds.add(node.frontmatter.id);
      searchableNodes.push({
        id: node.frontmatter.id,
        title: node.frontmatter.title,
        zoneId: z.id,
        zoneTitle: z.title,
        zoneColor: z.color,
        tags: node.frontmatter.tags,
        category: node.frontmatter.category,
        difficulty: node.frontmatter.difficulty,
        edgesTo: node.frontmatter.edges.to ?? [],
      });
    }
  }

  return (
    <ZoneClient
      nodes={nodes}
      zoneTitle={zone.title}
      zoneColor={zone.color}
      searchableNodes={searchableNodes}
      zones={config.zones}
    />
  );
}
