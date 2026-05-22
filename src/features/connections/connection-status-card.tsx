"use client";

import * as React from "react";
import { Loader2, RefreshCw, Unplug } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NetworkIcon } from "@/components/network/network-icon";
import { cn } from "@/lib/utils";
import type { SocialConnection, SocialConnectionStatus, SupportedNetwork } from "@/lib/types";

interface ConnectionStatusCardProps {
  platform: SupportedNetwork;
  connection: SocialConnection | null;
  clientName: string;
  reconnectHref?: string;
  onDisconnect?: (platform: SupportedNetwork) => Promise<void>;
}

const TONE: Record<SocialConnectionStatus | "missing", string> = {
  missing: "text-muted-foreground",
  pending: "text-amber-600",
  connected: "text-emerald-600",
  expired: "text-amber-700",
  revoked: "text-destructive",
  error: "text-destructive",
};

const LABEL: Record<SocialConnectionStatus | "missing", string> = {
  missing: "Not connected",
  pending: "Authorization pending",
  connected: "Connected",
  expired: "Reconnect required",
  revoked: "Revoked",
  error: "Connection error",
};

export function ConnectionStatusCard({
  platform,
  connection,
  reconnectHref,
  onDisconnect,
}: ConnectionStatusCardProps) {
  const [pending, setPending] = React.useState(false);
  const status = connection?.status ?? "missing";
  const tone = TONE[status];

  const onDisconnectClick = async () => {
    if (!onDisconnect) return;
    setPending(true);
    try {
      await onDisconnect(platform);
    } finally {
      setPending(false);
    }
  };

  return (
    <Card>
      <div className="flex items-start gap-3 px-5 py-4">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md",
            status === "connected"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-muted text-foreground",
          )}
        >
          <NetworkIcon network={platform} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold tracking-tight capitalize">
              {platform}
            </span>
            <span className={cn("text-[11px] font-medium", tone)}>
              · {LABEL[status]}
            </span>
            {connection?.publishingReady ? (
              <Badge variant="success">Publishing ready</Badge>
            ) : null}
          </div>
          <p className="truncate text-[12.5px] text-foreground">
            {connection?.accountName ?? "No account linked yet."}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {connection?.connectedBy ? (
              <div className="flex gap-1">
                <dt>Connected by</dt>
                <dd className="font-medium text-foreground/80">
                  {connection.connectedBy}
                </dd>
              </div>
            ) : null}
            {connection?.updatedAt ? (
              <div className="flex gap-1">
                <dt>Last updated</dt>
                <dd className="font-medium text-foreground/80">
                  {new Date(connection.updatedAt).toLocaleString()}
                </dd>
              </div>
            ) : null}
            {connection?.expiresAt ? (
              <div className="flex gap-1">
                <dt>Token expires</dt>
                <dd className="font-medium text-foreground/80">
                  {new Date(connection.expiresAt).toLocaleString()}
                </dd>
              </div>
            ) : null}
            {connection?.scopes?.length ? (
              <div className="col-span-2 flex flex-wrap items-baseline gap-1">
                <dt>Scopes</dt>
                <dd className="font-mono text-[10.5px] text-foreground/70">
                  {connection.scopes.join(", ")}
                </dd>
              </div>
            ) : null}
            {connection?.note ? (
              <div className="col-span-2 mt-1 text-[11px] italic text-amber-700">
                {connection.note}
              </div>
            ) : null}
          </dl>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-5 py-2.5">
        {reconnectHref ? (
          <Button asChild variant="outline" size="sm">
            <a href={reconnectHref}>
              <RefreshCw className="h-3.5 w-3.5" />
              {connection?.status === "connected" ? "Reconnect" : "Connect"}
            </a>
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          disabled={pending || !connection || !onDisconnect}
          onClick={onDisconnectClick}
          title="Disconnect placeholder — wires to revocation when Meta keys are configured."
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Unplug className="h-3.5 w-3.5" />
          )}
          Disconnect
        </Button>
      </div>
    </Card>
  );
}
