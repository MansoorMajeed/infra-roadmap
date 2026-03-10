"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Zone, ZoneEdge, SearchableNode } from "@/lib/types";
import { getCompletedCount, getLastNode, getResumePref, setResumePref } from "@/lib/progress";
import type { LastNode } from "@/lib/progress";
import EntryPointSelector from "./EntryPointSelector";
import SearchModal from "./SearchModal";
import HelpModal from "./HelpModal";
import ResumeModal from "./ResumeModal";

interface ZoneMapProps {
  zones: Zone[];
  zoneEdges: ZoneEdge[];
  zoneNodeIds: Record<string, string[]>;
  searchableNodes: SearchableNode[];
}


function ZoneNode({ data }: { data: Record<string, unknown> }) {
  const zone = data as unknown as Zone & {
    nodeCount: number;
    completedCount: number;
  };
  const progress =
    zone.nodeCount > 0
      ? Math.round((zone.completedCount / zone.nodeCount) * 100)
      : 0;

  return (
    <div
      className={`rounded-2xl border-2 p-5 min-w-[220px] max-w-[260px] shadow-lg transition-all ${
        zone.active
          ? "cursor-pointer hover:shadow-xl hover:scale-[1.02]"
          : "opacity-50 cursor-default"
      }`}
      style={{ borderColor: zone.color, backgroundColor: `${zone.color}10` }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !w-0 !h-0" />
      <div
        className="text-xs font-bold uppercase tracking-wider mb-1"
        style={{ color: zone.color }}
      >
        {zone.active ? "Explore" : "Coming Soon"}
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
        {zone.title}
      </h3>
      <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-3">
        &ldquo;{zone.coreQuestion}&rdquo;
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {zone.nodeCount} topics
        </span>
        {zone.active && zone.nodeCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: zone.color }}
              />
            </div>
            <span className="text-xs text-gray-500">{progress}%</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !w-0 !h-0" />
    </div>
  );
}

const nodeTypes = { zone: ZoneNode };

export default function ZoneMap({
  zones,
  zoneEdges,
  zoneNodeIds,
  searchableNodes,
}: ZoneMapProps) {
  const router = useRouter();
  const [showEntrySelector, setShowEntrySelector] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [resumeCandidate, setResumeCandidate] = useState<LastNode | null>(null);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [continueTarget, setContinueTarget] = useState<LastNode | null>(null);

  useEffect(() => {
    const counts: Record<string, number> = {};
    for (const [zoneId, nodeIds] of Object.entries(zoneNodeIds)) {
      counts[zoneId] = getCompletedCount(nodeIds);
    }
    setCompletedCounts(counts);
  }, [zoneNodeIds]);

  // Resume logic — check on mount
  useEffect(() => {
    const lastNode = getLastNode();
    if (!lastNode) return;

    const SESSION_KEY = "infra-roadmap-session-active";
    const isReturningUser = !sessionStorage.getItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, "1");

    if (isReturningUser) {
      // New session — show modal or auto-navigate based on pref
      const pref = getResumePref();
      if (pref === "always") {
        setShowResumeToast(true);
        const timer = setTimeout(() => {
          router.push(`/${lastNode.zoneId}?focus=${lastNode.nodeId}`);
        }, 800);
        return () => clearTimeout(timer);
      }
      if (pref === "ask") {
        setResumeCandidate(lastNode);
      }
      // pref === "never" — show continue button below
    }

    // In-session (back from zone) or pref="never" — show continue button
    setContinueTarget(lastNode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      if (localStorage.getItem("infra-roadmap-help-seen") !== "true") {
        setShowHelp(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const dismissHelp = () => {
    try {
      localStorage.setItem("infra-roadmap-help-seen", "true");
    } catch {
      // ignore
    }
    setShowHelp(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const initialNodes: Node[] = useMemo(
    () =>
      zones.map((zone) => ({
        id: zone.id,
        type: "zone",
        position: zone.position,
        data: {
          ...zone,
          nodeCount: zoneNodeIds[zone.id]?.length ?? 0,
          completedCount: completedCounts[zone.id] ?? 0,
        },
      })),
    [zones, zoneNodeIds, completedCounts]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      zoneEdges.map((e, i) => ({
        id: `zone-edge-${i}`,
        source: e.from,
        target: e.to,
        animated: true,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
      })),
    [zoneEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when completedCounts change (useNodesState only initializes once)
  useEffect(() => {
    setNodes(initialNodes);
  }, [completedCounts]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const zone = zones.find((z) => z.id === node.id);
      if (zone?.active) {
        router.push(`/${zone.id}`);
      }
    },
    [zones, router]
  );

  const handleEntrySelect = (zone: string, nodeId: string) => {
    setShowEntrySelector(false);
    const targetZone = zones.find((z) => z.id === zone);
    if (targetZone?.active) {
      router.push(`/${zone}?node=${nodeId}`);
    }
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      </ReactFlow>

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Infra: Zero to Scale
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            SRE for everyone — click a zone to explore
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="pointer-events-auto px-3 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm transition-colors flex items-center gap-2"
          >
            <span>🔍</span>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline text-xs border border-gray-200 dark:border-gray-600 rounded px-1">⌘K</kbd>
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="pointer-events-auto w-9 h-9 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm transition-colors flex items-center justify-center font-semibold"
            title="Help"
            aria-label="Help"
          >
            ?
          </button>
          <button
            onClick={() => router.push("/settings")}
            className="pointer-events-auto w-9 h-9 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 shadow-sm transition-colors flex items-center justify-center"
            title="Settings"
            aria-label="Settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          {continueTarget && !resumeCandidate && (
            <button
              onClick={() => router.push(`/${continueTarget.zoneId}?focus=${continueTarget.nodeId}`)}
              className="pointer-events-auto px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-blue-300 dark:border-blue-700 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 shadow-sm transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Continue
            </button>
          )}
          <button
            onClick={() => setShowEntrySelector(true)}
            className="pointer-events-auto px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg"
          >
            Where do I start?
          </button>
        </div>
      </div>

      {/* Bottom bar — hidden on mobile */}
      <div className="absolute bottom-4 left-4 hidden sm:flex items-stretch gap-2 pointer-events-none">
        <a
          href="https://github.com/MansoorMajeed/infra-roadmap"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto px-4 rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center"
        >
          ★ GitHub
        </a>
        <a
          href="https://blog.esc.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto px-4 rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center"
        >
          Blog
        </a>
        <a
          href="https://blog.esc.sh/#/portal/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto px-4 rounded-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center"
        >
          Newsletter
        </a>
      </div>

      <SearchModal
        nodes={searchableNodes}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />

      {showEntrySelector && (
        <EntryPointSelector
          onSelect={handleEntrySelect}
          onClose={() => setShowEntrySelector(false)}
        />
      )}

      {showHelp && (
        <HelpModal
          onClose={dismissHelp}
          onShowEntrySelector={() => {
            dismissHelp();
            setShowEntrySelector(true);
          }}
        />
      )}

      {resumeCandidate && (
        <ResumeModal
          lastNode={resumeCandidate}
          onResume={() => {
            setResumeCandidate(null);
            router.push(`/${resumeCandidate.zoneId}?focus=${resumeCandidate.nodeId}`);
          }}
          onDismiss={() => setResumeCandidate(null)}
          onAlways={() => {
            setResumePref("always");
            setResumeCandidate(null);
            router.push(`/${resumeCandidate.zoneId}?focus=${resumeCandidate.nodeId}`);
          }}
          onNever={() => {
            setResumePref("never");
            setResumeCandidate(null);
          }}
        />
      )}

      {showResumeToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium shadow-lg">
          Resuming where you left off...
        </div>
      )}
    </div>
  );
}
