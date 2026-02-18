import { describe, it, expect } from "vitest";
import {
  getZonesConfig,
  getNodesByZone,
  getNode,
  getZone,
} from "../content";

describe("getZonesConfig", () => {
  it("returns a valid zones config with zones array", () => {
    const config = getZonesConfig();
    expect(config.zones).toBeDefined();
    expect(Array.isArray(config.zones)).toBe(true);
    expect(config.zones.length).toBe(8);
  });

  it("returns zone edges", () => {
    const config = getZonesConfig();
    expect(config.zoneEdges).toBeDefined();
    expect(Array.isArray(config.zoneEdges)).toBe(true);
    expect(config.zoneEdges.length).toBeGreaterThan(0);
  });

  it("each zone has required fields", () => {
    const config = getZonesConfig();
    for (const zone of config.zones) {
      expect(zone.id).toBeDefined();
      expect(zone.title).toBeDefined();
      expect(zone.coreQuestion).toBeDefined();
      expect(zone.color).toBeDefined();
      expect(zone.position).toBeDefined();
      expect(typeof zone.active).toBe("boolean");
    }
  });
});

describe("getZone", () => {
  it("finds an existing zone", () => {
    const zone = getZone("foundations");
    expect(zone).toBeDefined();
    expect(zone!.id).toBe("foundations");
    expect(zone!.active).toBe(true);
  });

  it("returns undefined for missing zone", () => {
    expect(getZone("nonexistent")).toBeUndefined();
  });
});

describe("getNodesByZone", () => {
  it("returns 20 nodes for foundations zone", () => {
    const nodes = getNodesByZone("foundations");
    expect(nodes).toHaveLength(20);
  });

  it("each node has correct structure", () => {
    const nodes = getNodesByZone("foundations");
    for (const node of nodes) {
      expect(node.frontmatter.id).toBeDefined();
      expect(node.frontmatter.title).toBeDefined();
      expect(node.frontmatter.zone).toBe("foundations");
      expect(node.frontmatter.difficulty).toBeGreaterThanOrEqual(1);
      expect(node.frontmatter.difficulty).toBeLessThanOrEqual(3);
      expect(["concept", "tool", "practice", "principle"]).toContain(
        node.frontmatter.category
      );
      expect(Array.isArray(node.frontmatter.tags)).toBe(true);
      expect(Array.isArray(node.frontmatter.milestones)).toBe(true);
      expect(typeof node.summary).toBe("string");
      expect(node.summary.length).toBeGreaterThan(0);
    }
  });

  it("returns empty array for nonexistent zone", () => {
    expect(getNodesByZone("nonexistent")).toEqual([]);
  });
});

describe("getNode", () => {
  it("finds a specific node", () => {
    const node = getNode("foundations", "hello-world");
    expect(node).toBeDefined();
    expect(node!.frontmatter.title).toBe("Hello, World!");
  });

  it("returns undefined for missing node", () => {
    expect(getNode("foundations", "nonexistent")).toBeUndefined();
  });
});

describe("content parsing", () => {
  it("splits summary, deep dive, and resources correctly", () => {
    const node = getNode("foundations", "hello-world");
    expect(node).toBeDefined();
    expect(node!.summary.length).toBeGreaterThan(0);
    expect(node!.deepDive.length).toBeGreaterThan(0);
    expect(node!.resources.length).toBeGreaterThan(0);
  });

  it("summary does not contain section markers", () => {
    const node = getNode("foundations", "hello-world");
    expect(node!.summary).not.toContain("<!-- DEEP_DIVE -->");
    expect(node!.summary).not.toContain("<!-- RESOURCES -->");
  });
});

describe("edge reference integrity", () => {
  it("all intra-zone edge 'to' IDs reference existing nodes in the zone", () => {
    const nodes = getNodesByZone("foundations");
    const nodeIds = new Set(nodes.map((n) => n.frontmatter.id));

    for (const node of nodes) {
      if (node.frontmatter.edges.to) {
        for (const edge of node.frontmatter.edges.to) {
          // Skip cross-zone edges (they reference nodes in other zones)
          if (!nodeIds.has(edge.id)) continue;

          expect(
            nodeIds.has(edge.id),
            `Node "${node.frontmatter.id}" has edge to "${edge.id}" which does not exist in zone`
          ).toBe(true);
        }
      }
    }
  });

  it("each edge has required fields", () => {
    const nodes = getNodesByZone("foundations");
    for (const node of nodes) {
      if (node.frontmatter.edges.to) {
        for (const edge of node.frontmatter.edges.to) {
          expect(edge.id).toBeDefined();
          expect(edge.question).toBeDefined();
          expect(edge.question.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
