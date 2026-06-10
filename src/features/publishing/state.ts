"use client";

import { useReducer } from "react";

import type {
  AuditLogEvent,
  ContentTag,
  MediaAsset,
  NetworkId,
  ScheduleState,
  SocialPostDraft,
} from "@/lib/types";

export interface ComposerState {
  draft: SocialPostDraft;
  events: AuditLogEvent[];
  panels: {
    firstComment: boolean;
    workflows: boolean;
    tags: boolean;
    schedule: boolean;
  };
}

export type ComposerAction =
  | { type: "set-client"; clientId: string }
  | { type: "toggle-network"; network: NetworkId }
  | { type: "set-caption"; caption: string }
  | { type: "set-first-comment"; firstComment: string }
  | { type: "toggle-tag"; tag: ContentTag }
  | { type: "toggle-draft" }
  | { type: "add-media"; media: MediaAsset[] }
  | { type: "remove-media"; id: string }
  | { type: "set-schedule"; schedule: ScheduleState }
  | { type: "set-status"; status: SocialPostDraft["status"] }
  | { type: "merge-draft"; draft: SocialPostDraft }
  | { type: "log-event"; event: AuditLogEvent }
  | { type: "toggle-panel"; panel: keyof ComposerState["panels"] };

function makeInitialDraft(
  clientId: string,
  initialSchedule?: ScheduleState,
): SocialPostDraft {
  return {
    id: "draft_local",
    clientId,
    networks: ["facebook", "instagram"],
    caption: "",
    firstComment: "",
    tags: [],
    media: [],
    isDraft: true,
    schedule: initialSchedule ?? { date: null, time: null },
    status: "draft",
    updatedAt: new Date().toISOString(),
  };
}

export function initialComposerState(
  clientId: string,
  initialSchedule?: ScheduleState,
  existingDraft?: SocialPostDraft,
): ComposerState {
  const draft = existingDraft ?? makeInitialDraft(clientId, initialSchedule);
  return {
    draft,
    events: [],
    panels: {
      firstComment: true,
      workflows: false,
      tags: true,
      schedule: existingDraft
        ? !!existingDraft.schedule.date
        : !!initialSchedule?.date,
    },
  };
}

function touch(draft: SocialPostDraft): SocialPostDraft {
  return { ...draft, updatedAt: new Date().toISOString() };
}

function reducer(state: ComposerState, action: ComposerAction): ComposerState {
  switch (action.type) {
    case "set-client":
      return {
        ...state,
        draft: touch({ ...state.draft, clientId: action.clientId }),
      };
    case "toggle-network": {
      const exists = state.draft.networks.includes(action.network);
      const networks = exists
        ? state.draft.networks.filter((n) => n !== action.network)
        : [...state.draft.networks, action.network];
      return { ...state, draft: touch({ ...state.draft, networks }) };
    }
    case "set-caption":
      return {
        ...state,
        draft: touch({ ...state.draft, caption: action.caption }),
      };
    case "set-first-comment":
      return {
        ...state,
        draft: touch({ ...state.draft, firstComment: action.firstComment }),
      };
    case "toggle-tag": {
      const exists = state.draft.tags.includes(action.tag);
      const tags = exists
        ? state.draft.tags.filter((t) => t !== action.tag)
        : [...state.draft.tags, action.tag];
      return { ...state, draft: touch({ ...state.draft, tags }) };
    }
    case "toggle-draft":
      return {
        ...state,
        draft: touch({ ...state.draft, isDraft: !state.draft.isDraft }),
      };
    case "add-media":
      return {
        ...state,
        draft: touch({
          ...state.draft,
          media: [...state.draft.media, ...action.media],
        }),
      };
    case "remove-media":
      return {
        ...state,
        draft: touch({
          ...state.draft,
          media: state.draft.media.filter((m) => m.id !== action.id),
        }),
      };
    case "set-schedule":
      return {
        ...state,
        draft: touch({ ...state.draft, schedule: action.schedule }),
      };
    case "set-status":
      return {
        ...state,
        draft: touch({ ...state.draft, status: action.status }),
      };
    case "merge-draft":
      return { ...state, draft: action.draft };
    case "log-event":
      return { ...state, events: [action.event, ...state.events].slice(0, 25) };
    case "toggle-panel":
      return {
        ...state,
        panels: { ...state.panels, [action.panel]: !state.panels[action.panel] },
      };
    default:
      return state;
  }
}

type ComposerInitArgs = {
  clientId: string;
  initialSchedule?: ScheduleState;
  existingDraft?: SocialPostDraft;
};

export function useComposer(
  initialClientId: string,
  initialSchedule?: ScheduleState,
  existingDraft?: SocialPostDraft,
) {
  return useReducer(
    reducer,
    { clientId: initialClientId, initialSchedule, existingDraft } satisfies ComposerInitArgs,
    ({ clientId, initialSchedule: sched, existingDraft: draft }) =>
      initialComposerState(clientId, sched, draft),
  );
}
