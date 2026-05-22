"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NetworkIcon } from "@/components/network/network-icon";
import { cn } from "@/lib/utils";
import type { SocialConnectionStatus, SupportedNetwork } from "@/lib/types";

interface NetworkRowProps {
  network: SupportedNetwork;
  label: string;
  description: string;
  status?: SocialConnectionStatus | "idle";
  accountName?: string | null;
}

const STATUS_TEXT: Record<SocialConnectionStatus | "idle", string> = {
  idle: "Not connected",
  pending: "Awaiting authorization",
  connected: "Connected",
  expired: "Reconnect required",
  revoked: "Access revoked",
  error: "Connection error",
};

const STATUS_TONE: Record<SocialConnectionStatus | "idle", string> = {
  idle: "text-muted-foreground",
  pending: "text-amber-600",
  connected: "text-emerald-600",
  expired: "text-amber-700",
  revoked: "text-destructive",
  error: "text-destructive",
};

function NetworkRow({ network, label, description, status = "idle", accountName }: NetworkRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
      <span
        className={cn(
          "mt-0.5 flex h-9 w-9 items-center justify-center rounded-md",
          status === "connected"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-muted text-foreground",
        )}
      >
        <NetworkIcon network={network} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold tracking-tight">{label}</span>
          <span
            className={cn("text-[11px] font-medium", STATUS_TONE[status])}
          >
            · {STATUS_TEXT[status]}
          </span>
        </div>
        <p className="text-[12px] text-muted-foreground">{description}</p>
        {accountName ? (
          <p className="truncate text-[11.5px] font-medium text-foreground">
            {accountName}
          </p>
        ) : null}
      </div>
      {status === "connected" ? (
        <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-emerald-600" />
      ) : null}
    </div>
  );
}

interface ConnectionButtonsProps {
  token: string;
  networks: SupportedNetwork[];
  connections: Array<{
    platform: SupportedNetwork;
    status: SocialConnectionStatus;
    accountName: string | null;
  }>;
  allConnected: boolean;
}

export function ConnectionButtons({
  token,
  networks,
  connections,
  allConnected,
}: ConnectionButtonsProps) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  const onConnect = () => {
    setPending(true);
    router.push(`/api/oauth/meta/start?token=${encodeURIComponent(token)}`);
  };

  const wantsFacebook = networks.includes("facebook");
  const wantsInstagram = networks.includes("instagram");
  const fbConn = connections.find((c) => c.platform === "facebook");
  const igConn = connections.find((c) => c.platform === "instagram");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {wantsFacebook ? (
          <NetworkRow
            network="facebook"
            label="Facebook Page"
            description="We'll request access to the Page your business runs on Facebook so the agency can publish on your behalf."
            status={fbConn?.status ?? "idle"}
            accountName={fbConn?.accountName}
          />
        ) : null}
        {wantsInstagram ? (
          <NetworkRow
            network="instagram"
            label="Instagram Business"
            description="Connects your Instagram Business or Professional account. This happens through Meta, alongside your Facebook Page."
            status={igConn?.status ?? "idle"}
            accountName={igConn?.accountName}
          />
        ) : null}
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-3 text-[12px] text-muted-foreground">
        Facebook and Instagram are connected together through Meta. You will be
        sent to a secure Meta authorization screen to grant the LCI Social Desk
        app permission to publish on the Page and Instagram account associated
        with your business.
      </div>

      <Button
        size="lg"
        variant={allConnected ? "outline" : "brand"}
        className="w-full justify-center"
        onClick={onConnect}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ExternalLink className="h-4 w-4" />
        )}
        {allConnected ? "Reconnect with Meta" : "Continue to Meta"}
      </Button>
    </div>
  );
}
