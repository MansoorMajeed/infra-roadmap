"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { RoadmapNode, SearchableNode, Zone } from "@/lib/types";

const NodeGraph = dynamic(() => import("@/components/NodeGraph"), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading graph...</div>
    </div>
  ),
});

interface ZoneClientProps {
  nodes: RoadmapNode[];
  zoneTitle: string;
  zoneColor: string;
  searchableNodes: SearchableNode[];
  zones: Zone[];
}

function ZoneClientInner({
  nodes,
  zoneTitle,
  zoneColor,
  searchableNodes,
  zones,
}: ZoneClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlightNode = searchParams.get("node") ?? undefined;
  const focusNode = searchParams.get("focus") ?? undefined;

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      if (nodeId) {
        router.replace(`${pathname}?node=${nodeId}`, { scroll: false });
      } else {
        router.replace(pathname, { scroll: false });
      }
    },
    [router, pathname]
  );

  return (
    <div className="w-screen h-screen">
      <NodeGraph
        nodes={nodes}
        zoneTitle={zoneTitle}
        zoneColor={zoneColor}
        onBack={() => router.push("/")}
        highlightNodeId={highlightNode}
        focusNodeId={focusNode}
        onNodeSelect={handleNodeSelect}
        searchableNodes={searchableNodes}
        zones={zones}
      />
    </div>
  );
}

export default function ZoneClient(props: ZoneClientProps) {
  return (
    <Suspense>
      <ZoneClientInner {...props} />
    </Suspense>
  );
}
