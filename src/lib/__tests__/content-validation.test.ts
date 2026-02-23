import { describe, it, expect } from "vitest";
import { getZonesConfig, getNodesByZone } from "../content";

describe("Content graph validation", () => {
  const config = getZonesConfig();
  const allZoneIds = new Set(config.zones.map((z) => z.id));

  // Build zone → Set<nodeId> map once, used across tests
  const nodeIdsByZone = new Map<string, Set<string>>();
  for (const zone of config.zones) {
    const nodes = getNodesByZone(zone.id);
    nodeIdsByZone.set(zone.id, new Set(nodes.map((n) => n.frontmatter.id)));
  }

  it("all node frontmatter parses without error", () => {
    for (const zone of config.zones) {
      expect(
        () => getNodesByZone(zone.id),
        `zone "${zone.id}" failed to parse`
      ).not.toThrow();
    }
  });

  it("no duplicate node IDs within a zone", () => {
    const errors: string[] = [];
    for (const zone of config.zones) {
      const seen = new Set<string>();
      for (const node of getNodesByZone(zone.id)) {
        const id = node.frontmatter.id;
        if (seen.has(id)) {
          errors.push(`duplicate id "${id}" in zone "${zone.id}"`);
        }
        seen.add(id);
      }
    }
    expect(errors).toEqual([]);
  });

  it("intra-zone to-edges reference existing nodes in the same zone", () => {
    const errors: string[] = [];
    for (const zone of config.zones) {
      const zoneNodeIds = nodeIdsByZone.get(zone.id)!;
      for (const node of getNodesByZone(zone.id)) {
        for (const edge of node.frontmatter.edges.to ?? []) {
          if (edge.zone) continue; // cross-zone edges are intentionally not validated here
          if (!zoneNodeIds.has(edge.id)) {
            errors.push(
              `"${zone.id}/${node.frontmatter.id}" → "${edge.id}" — target not found in zone "${zone.id}"`
            );
          }
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it("cross-zone edge zone fields reference valid zone IDs", () => {
    const errors: string[] = [];
    for (const zone of config.zones) {
      for (const node of getNodesByZone(zone.id)) {
        const allEdges = [...(node.frontmatter.edges.to ?? [])];
        for (const edge of allEdges) {
          if (edge.zone && !allZoneIds.has(edge.zone)) {
            errors.push(
              `"${zone.id}/${node.frontmatter.id}" references unknown zone "${edge.zone}"`
            );
          }
        }
      }
    }
    expect(errors).toEqual([]);
  });

  it("node zone field matches its directory", () => {
    const errors: string[] = [];
    for (const zone of config.zones) {
      for (const node of getNodesByZone(zone.id)) {
        if (node.frontmatter.zone !== zone.id) {
          errors.push(
            `node "${node.frontmatter.id}": zone="${node.frontmatter.zone}" but lives in directory "${zone.id}"`
          );
        }
      }
    }
    expect(errors).toEqual([]);
  });
});
