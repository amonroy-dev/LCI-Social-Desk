import "server-only";

import { connectionRepository } from "@/lib/repositories/connection-repository";
import type { SocialPostDraft, SupportedNetwork } from "@/lib/types";

export interface NetworkPublishResult {
  network: string;
  success: boolean;
  simulated: boolean;
  postId?: string;
  error?: string;
}

const GRAPH = "https://graph.facebook.com/v19.0";

/**
 * Publishes a draft to every network listed in post.networks.
 * Uses real Meta Graph API when:
 *   - NEXT_PUBLIC_ENABLE_PROVIDER_PUBLISH=true AND
 *   - The stored accessToken is not a simulated placeholder.
 * Falls back to a simulated result otherwise.
 */
export async function publishPostToNetworks(
  post: SocialPostDraft,
): Promise<NetworkPublishResult[]> {
  const results: NetworkPublishResult[] = [];

  for (const networkId of post.networks) {
    if (networkId !== "facebook" && networkId !== "instagram") {
      // LinkedIn et al. — not yet wired to a real API
      results.push({ network: networkId, success: true, simulated: true });
      continue;
    }

    const connection = await connectionRepository.get(
      post.clientId,
      networkId as SupportedNetwork,
    );

    if (!connection || !connection.publishingReady) {
      results.push({
        network: networkId,
        success: false,
        simulated: false,
        error: `No active ${networkId} connection for client ${post.clientId}`,
      });
      continue;
    }

    const realPublish = process.env.NEXT_PUBLIC_ENABLE_PROVIDER_PUBLISH === "true";
    const hasRealToken =
      !!connection.accessToken &&
      !connection.accessToken.startsWith("simulated_");

    if (realPublish && hasRealToken) {
      const result =
        networkId === "facebook"
          ? await publishFacebook(post, connection.accountId!, connection.accessToken!)
          : await publishInstagram(post, connection.accountId!, connection.accessToken!);
      results.push(result);
    } else {
      results.push({
        network: networkId,
        success: true,
        simulated: true,
        postId: `sim_${networkId}_${Math.random().toString(36).slice(2, 10)}`,
      });
    }
  }

  return results;
}

async function publishFacebook(
  post: SocialPostDraft,
  pageId: string,
  token: string,
): Promise<NetworkPublishResult> {
  try {
    if (post.media.length > 0) {
      // Photo post — use first image (video support requires async upload)
      const firstMedia = post.media[0];
      if (firstMedia.kind === "image") {
        const body = new URLSearchParams({
          url: firstMedia.url,
          caption: post.caption,
          access_token: token,
        });
        const res = await fetch(`${GRAPH}/${pageId}/photos`, {
          method: "POST",
          body,
        });
        const json = (await res.json()) as { id?: string; error?: { message: string } };
        if (!res.ok || json.error) {
          return { network: "facebook", success: false, simulated: false, error: json.error?.message ?? `HTTP ${res.status}` };
        }
        return { network: "facebook", success: true, simulated: false, postId: json.id };
      }
    }

    // Text-only post
    const body = new URLSearchParams({
      message: post.caption,
      access_token: token,
    });
    const res = await fetch(`${GRAPH}/${pageId}/feed`, {
      method: "POST",
      body,
    });
    const json = (await res.json()) as { id?: string; error?: { message: string } };
    if (!res.ok || json.error) {
      return { network: "facebook", success: false, simulated: false, error: json.error?.message ?? `HTTP ${res.status}` };
    }
    return { network: "facebook", success: true, simulated: false, postId: json.id };
  } catch (err) {
    return {
      network: "facebook",
      success: false,
      simulated: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function publishInstagram(
  post: SocialPostDraft,
  igAccountId: string,
  token: string,
): Promise<NetworkPublishResult> {
  try {
    const imageMedia = post.media.find((m) => m.kind === "image");

    if (!imageMedia) {
      // Instagram requires at least one image or video — skip as simulated
      return {
        network: "instagram",
        success: true,
        simulated: true,
        postId: `sim_ig_no_media_${Math.random().toString(36).slice(2, 8)}`,
        error: "No image attached; Instagram post simulated",
      };
    }

    // Step 1: create media container
    const containerParams = new URLSearchParams({
      image_url: imageMedia.url,
      caption: post.caption,
      access_token: token,
    });
    const containerRes = await fetch(`${GRAPH}/${igAccountId}/media`, {
      method: "POST",
      body: containerParams,
    });
    const containerJson = (await containerRes.json()) as { id?: string; error?: { message: string } };
    if (!containerRes.ok || containerJson.error) {
      return { network: "instagram", success: false, simulated: false, error: containerJson.error?.message ?? `HTTP ${containerRes.status}` };
    }

    // Step 2: publish the container
    const publishParams = new URLSearchParams({
      creation_id: containerJson.id!,
      access_token: token,
    });
    const publishRes = await fetch(`${GRAPH}/${igAccountId}/media_publish`, {
      method: "POST",
      body: publishParams,
    });
    const publishJson = (await publishRes.json()) as { id?: string; error?: { message: string } };
    if (!publishRes.ok || publishJson.error) {
      return { network: "instagram", success: false, simulated: false, error: publishJson.error?.message ?? `HTTP ${publishRes.status}` };
    }

    return { network: "instagram", success: true, simulated: false, postId: publishJson.id };
  } catch (err) {
    return {
      network: "instagram",
      success: false,
      simulated: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
