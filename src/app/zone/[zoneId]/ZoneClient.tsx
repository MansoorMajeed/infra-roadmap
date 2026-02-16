"use client";

import { Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { RoadmapNode } from "@/lib/types";
import NodeGraph from "@/components/NodeGraph";

interface ZoneClientProps {
  nodes: RoadmapNode[];
  zoneTitle: string;
  zoneColor: string;
}

function ZoneClientInner({
  nodes,
  zoneTitle,
  zoneColor,
}: ZoneClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const highlightNode = searchParams.get("node") ?? undefined;

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
        onNodeSelect={handleNodeSelect}
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
