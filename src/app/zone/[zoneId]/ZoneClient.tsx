"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const highlightNode = searchParams.get("node") ?? undefined;

  return (
    <div className="w-screen h-screen">
      <NodeGraph
        nodes={nodes}
        zoneTitle={zoneTitle}
        zoneColor={zoneColor}
        onBack={() => router.push("/")}
        highlightNodeId={highlightNode}
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
