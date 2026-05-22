"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase/client";

interface SignInFormProps {
  firebaseConfigured: boolean;
  demoEnabled: boolean;
}

export function SignInForm({ firebaseConfigured, demoEnabled }: SignInFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard/publishing/new";

  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState<"google" | "demo" | null>(null);

  const goNext = () => {
    router.replace(next);
    router.refresh();
  };

  const onGoogle = async () => {
    setError(null);
    if (!firebaseConfigured) {
      setError(
        "Firebase Authentication isn't configured for this environment. Configure NEXT_PUBLIC_FIREBASE_* and FIREBASE_* env vars to enable Google sign-in.",
      );
      return;
    }
    setPending("google");
    try {
      const auth = getFirebaseAuth();
      if (!auth) throw new Error("Firebase auth unavailable.");
      const { signInWithPopup } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider());
      const idToken = await result.user.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Session could not be created.");
      }
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(null);
    }
  };

  const onDemoSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = (form.get("email") as string | null)?.trim();
    const name = (form.get("name") as string | null)?.trim() || undefined;
    if (!email) {
      setError("Enter an email to continue.");
      return;
    }
    setPending("demo");
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ demo: { email, name } }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Demo sign-in failed.");
      }
      goNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Button
          type="button"
          onClick={onGoogle}
          disabled={pending !== null || !firebaseConfigured}
          variant="default"
          className="w-full justify-center"
        >
          {pending === "google" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleGlyph />
          )}
          Continue with Google
        </Button>
        {!firebaseConfigured ? (
          <p className="text-[11px] text-muted-foreground">
            Google sign-in becomes available once Firebase Authentication env
            vars are configured for this deployment.
          </p>
        ) : null}
      </div>

      {demoEnabled ? (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <form onSubmit={onDemoSubmit} className="space-y-3">
            <div className="rounded-md border border-amber-200 bg-amber-50/80 p-2.5 text-[11.5px] text-amber-900">
              <span className="font-medium">Demo sign-in is on.</span> Provider
              auth is not yet wired for this environment. Anyone with the URL
              can enter a session — disable by removing
              <code className="mx-1 rounded bg-amber-100 px-1 py-px font-mono text-[10.5px]">
                NEXT_PUBLIC_AUTH_MODE=demo
              </code>
              and configuring Firebase.
            </div>
            <div className="space-y-1">
              <Label htmlFor="demo-name">Display name</Label>
              <Input
                id="demo-name"
                name="name"
                autoComplete="name"
                placeholder="Alex Owner"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="demo-email">Work email</Label>
              <Input
                id="demo-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@youragency.com"
                required
              />
            </div>
            <Button
              type="submit"
              variant="brand"
              className="w-full justify-center"
              disabled={pending !== null}
            >
              {pending === "demo" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Continue in demo
            </Button>
          </form>
        </>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
        >
          {error}
        </p>
      ) : null}

      <p className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5" />
        Sessions are signed and stored in an HTTP-only cookie for 12 hours.
        Activity is recorded to the internal audit log.
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg
      viewBox="0 0 18 18"
      className="h-4 w-4"
      aria-hidden
      role="img"
    >
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.58 2.69-3.91 2.69-6.62z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.92v2.32A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.97H.92A9 9 0 0 0 0 9c0 1.45.35 2.83.92 4.03l3.05-2.32z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .92 4.97l3.05 2.32C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
