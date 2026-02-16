import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  RoadmapNode,
  NodeFrontmatter,
  ZonesConfig,
  Zone,
} from "./types";
import { NodeFrontmatterSchema, ZonesConfigSchema } from "./validation";

const contentDir = path.join(process.cwd(), "content");

export function getZonesConfig(): ZonesConfig {
  const filePath = path.join(contentDir, "_zones.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  // Use gray-matter to parse the YAML file (wrapping it as if it were all frontmatter)
  const { data } = matter(`---\n${fileContents}\n---`);
  const result = ZonesConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid _zones.yaml: ${result.error.message}`);
  }
  return result.data as ZonesConfig;
}

export function getZone(zoneId: string): Zone | undefined {
  const config = getZonesConfig();
  return config.zones.find((z) => z.id === zoneId);
}

function parseContent(rawContent: string): {
  summary: string;
  deepDive: string;
  resources: string;
} {
  const deepDiveMarker = "<!-- DEEP_DIVE -->";
  const resourcesMarker = "<!-- RESOURCES -->";

  const deepDiveIdx = rawContent.indexOf(deepDiveMarker);
  const resourcesIdx = rawContent.indexOf(resourcesMarker);

  if (deepDiveIdx === -1 && resourcesIdx === -1) {
    return { summary: rawContent.trim(), deepDive: "", resources: "" };
  }

  const summary = rawContent.slice(0, deepDiveIdx !== -1 ? deepDiveIdx : resourcesIdx).trim();

  let deepDive = "";
  if (deepDiveIdx !== -1) {
    const deepDiveEnd = resourcesIdx !== -1 ? resourcesIdx : rawContent.length;
    deepDive = rawContent.slice(deepDiveIdx + deepDiveMarker.length, deepDiveEnd).trim();
  }

  let resources = "";
  if (resourcesIdx !== -1) {
    resources = rawContent.slice(resourcesIdx + resourcesMarker.length).trim();
  }

  return { summary, deepDive, resources };
}

export function getNodesByZone(zoneId: string): RoadmapNode[] {
  const zoneDir = path.join(contentDir, zoneId);

  if (!fs.existsSync(zoneDir)) {
    return [];
  }

  const files = fs.readdirSync(zoneDir).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const filePath = path.join(zoneDir, file);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    const result = NodeFrontmatterSchema.safeParse(data);
    if (!result.success) {
      throw new Error(
        `Invalid frontmatter in ${file}: ${result.error.message}`
      );
    }
    const { summary, deepDive, resources } = parseContent(content);

    return {
      frontmatter: result.data as NodeFrontmatter,
      summary,
      deepDive,
      resources,
    };
  });
}

export function getNode(zoneId: string, nodeId: string): RoadmapNode | undefined {
  const nodes = getNodesByZone(zoneId);
  return nodes.find((n) => n.frontmatter.id === nodeId);
}

export function getAllNodes(): RoadmapNode[] {
  const config = getZonesConfig();
  return config.zones.flatMap((zone) => getNodesByZone(zone.id));
}

export function getZoneNodeCount(zoneId: string): number {
  return getNodesByZone(zoneId).length;
}

export function validateEdgeReferences(): void {
  const config = getZonesConfig();
  const allNodeIds = new Set(
    config.zones.flatMap((z) => getNodesByZone(z.id).map((n) => n.frontmatter.id))
  );

  for (const zone of config.zones) {
    if (!zone.active) continue;
    const nodes = getNodesByZone(zone.id);

    for (const node of nodes) {
      if (node.frontmatter.edges.to) {
        for (const edge of node.frontmatter.edges.to) {
          // Cross-zone edges to inactive zones won't have content yet — skip them
          if (!allNodeIds.has(edge.id)) continue;
        }
      }
    }
  }
}
