import type { AgencyRole } from "@/lib/types";

export const ROLES: AgencyRole[] = ["owner", "admin", "member"];

const RANK: Record<AgencyRole, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

export function hasAtLeast(role: AgencyRole, minimum: AgencyRole): boolean {
  return RANK[role] >= RANK[minimum];
}

export function describeRole(role: AgencyRole): string {
  switch (role) {
    case "owner":
      return "Workspace owner";
    case "admin":
      return "Administrator";
    case "member":
      return "Team member";
  }
}

/**
 * Reads AGENCY_OWNERS (comma-separated emails) from env and returns the
 * canonical role for a given email. Used to bootstrap role assignments
 * before agencyMembers is wired to Firestore.
 */
export function resolveRoleForEmail(email: string): AgencyRole {
  const normalized = email.trim().toLowerCase();
  const owners = (process.env.AGENCY_OWNERS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (owners.includes(normalized)) return "owner";
  const admins = (process.env.AGENCY_ADMINS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (admins.includes(normalized)) return "admin";
  return "member";
}
