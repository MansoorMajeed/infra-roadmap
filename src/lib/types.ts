export interface EdgeConnection {
  id: string;
  question: string;
  detail?: string;
  zone?: string; // set on cross-zone edges to render a zone portal node
}

export interface NodeFrontmatter {
  id: string;
  title: string;
  zone: string;
  edges: {
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

export interface SearchableNode {
  id: string;
  title: string;
  zoneId: string;
  zoneTitle: string;
  zoneColor: string;
  tags: string[];
  category: string;
  difficulty: number;
  edgesTo: EdgeConnection[];
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
