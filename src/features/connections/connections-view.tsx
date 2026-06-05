"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ConnectionStatusCard } from "./connection-status-card";
import type { SocialConnection, SupportedNetwork } from "@/lib/types";

interface ConnectionsViewProps {
  clientId: string;
  clientName: string;
  connections: SocialConnection[];
  reconnectUrl: string | null;
}

const PLATFORMS: SupportedNetwork[] = ["facebook", "instagram"];

export function ConnectionsView({
  clientId,
  clientName,
  connections,
  reconnectUrl,
}: ConnectionsViewProps) {
  const router = useRouter();

  const handleDisconnect = async (platform: SupportedNetwork) => {
    const res = await fetch(
      `/api/connections/${encodeURIComponent(clientId)}/${platform}`,
      { method: "DELETE" },
    );
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      // eslint-disable-next-line no-alert
      alert(body.error || "Disconnect failed.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {PLATFORMS.map((platform) => {
        const connection = connections.find((c) => c.platform === platform) ?? null;
        return (
          <ConnectionStatusCard
            key={platform}
            platform={platform}
            connection={connection}
            clientName={clientName}
            reconnectHref={reconnectUrl ?? undefined}
            onDisconnect={handleDisconnect}
          />
        );
      })}
    </div>
  );
}
