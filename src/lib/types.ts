export interface EdgeConnection {
  id: string;
  question: string;
  detail?: string;
}

export interface NodeFrontmatter {
  id: string;
  title: string;
  zone: string;
  edges: {
    from?: EdgeConnection[];
    to?: EdgeConnection[];
  };
  difficulty: 1 | 2 | 3;
  tags: string[];
  category: "concept" | "tool" | "practice" | "principle";
  milestones: string[];
}

export interface RoadmapNode {
  frontmatter: NodeFrontmatter;
  summary: string;
  deepDive: string;
  resources: string;
}

export interface Zone {
  id: string;
  title: string;
  coreQuestion: string;
  description: string;
  color: string;
  position: { x: number; y: number };
  active: boolean;
}

export interface ZoneEdge {
  from: string;
  to: string;
}

export interface ZonesConfig {
  zones: Zone[];
  zoneEdges: ZoneEdge[];
}

export type NodeStatus = "not-started" | "in-progress" | "completed";

export interface NodeProgress {
  status: NodeStatus;
  completedAt?: string;
  milestones: boolean[];
}

export interface ProgressData {
  nodes: Record<string, NodeProgress>;
  entryPoint?: string;
}
