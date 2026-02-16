import { notFound } from "next/navigation";
import { getZonesConfig, getNodesByZone } from "@/lib/content";
import ZoneClient from "./ZoneClient";

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

  return (
    <ZoneClient
      nodes={nodes}
      zoneTitle={zone.title}
      zoneColor={zone.color}
    />
  );
}
