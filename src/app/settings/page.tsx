import type { Metadata } from "next";
import { getZonesConfig, getNodesByZone } from "@/lib/content";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings — Infra: Zero to Scale",
};

export default function SettingsPage() {
  const config = getZonesConfig();
  const allNodeIds: string[] = [];
  for (const zone of config.zones) {
    if (!zone.active) continue;
    const nodes = getNodesByZone(zone.id);
    for (const node of nodes) {
      allNodeIds.push(node.frontmatter.id);
    }
  }

  return <SettingsClient allNodeIds={allNodeIds} />;
}
