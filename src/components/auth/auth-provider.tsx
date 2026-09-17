"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { track } from "@/components/analytics/track";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/site/locale-switch";
import { copy } from "@/lib/copy";
import type { Member } from "@/lib/store";

type Mode = "signin" | "signup";

type AuthContextValue = {
  member: Member | null;
  open: (mode?: Mode, reason?: string) => void;
  signOut: () => Promise<void>;
  requireMember: (reason: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

export function AuthProvider({
  member,
  children,
}: {
  member: Member | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const { t: tr } = useT();
  const [dialog, setDialog] = useState<{ mode: Mode; reason?: string } | null>(null);

  const open = useCallback((mode: Mode = "signin", reason?: string) => {
    if (mode === "signup") track("register_start");
    setDialog({ mode, reason });
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success(tr(copy.signedOut));
    router.refresh();
  }, [router, tr]);

  const requireMember = useCallback(
    (reason: string) => {
      if (member) return true;
      setDialog({ mode: "signin", reason });
      return false;
    },
    [member],
  );

  const value = useMemo(
    () => ({ member, open, signOut, requireMember }),
    [member, open, signOut, requireMember],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Dialog open={dialog !== null} onOpenChange={(next) => !next && setDialog(null)}>
        <DialogContent className="max-w-md gap-0 overflow-hidden p-0 sm:max-w-md">
          {dialog ? (
            <AuthSheet
              mode={dialog.mode}
              reason={dialog.reason}
              onMode={(mode) => {
                if (mode === "signup") track("register_start");
                setDialog({ mode, reason: dialog.reason });
              }}
              onDone={() => {
                setDialog(null);
                router.refresh();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </AuthContext.Provider>
  );
}

function AuthSheet({
  mode,
  reason,
  onMode,
  onDone,
}: {
  mode: Mode;
  reason?: string;
  onMode: (mode: Mode) => void;
  onDone: () => void;
}) {
  const { t: tr } = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  async function submit(path: string, payload: unknown) {
    setPending(true);
    setError(null);
    const response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? tr(copy.somethingWrong));
      return;
    }
    if (path.endsWith("register")) track("register_done");
    toast.success(path.endsWith("register") ? tr(copy.registered) : tr(copy.welcomeBack));
    onDone();
  }

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-[#7d3b2e] px-6 py-7 text-primary-foreground">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <DialogHeader className="relative space-y-1.5 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? tr(copy.signInTitle) : tr(copy.joinTitle)}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/85">
            {reason ?? (mode === "signin" ? tr(copy.signInLead) : tr(copy.joinLead))}
          </DialogDescription>
        </DialogHeader>
      </div>

      <div className="space-y-4 px-6 py-6">
        {mode === "signin" ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit("/api/auth/login", { identifier, password });
            }}
          >
            <Field label={tr(copy.emailOrUser)}>
              <Input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                placeholder="you@example.com"
              />
            </Field>
            <Field label={tr(copy.password)}>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </Field>
            {error ? <Alert>{error}</Alert> : null}
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
              {pending ? tr(copy.signingIn) : tr(copy.signIn)}
            </Button>
            <Switcher
              prompt={tr(copy.noAccount)}
              action={tr(copy.registerOne)}
              onClick={() => {
                setError(null);
                onMode("signup");
              }}
            />
          </form>
        ) : (
          <form
            className="space-y-4"
            data-register-form
            onSubmit={(event) => {
              event.preventDefault();
              void submit("/api/auth/register", {
                email,
                password,
                displayName,
              });
            }}
          >
            <Field label={tr(copy.displayName)}>
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Amina"
              />
            </Field>
            <Field label={tr(copy.email)}>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label={tr(copy.password)} hint={tr(copy.passwordHint)}>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </Field>
            {error ? <Alert>{error}</Alert> : null}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending || email.length < 3 || password.length < 8 || displayName.length === 0}
            >
              {pending ? tr(copy.creating) : tr(copy.createAccount)}
            </Button>
            <Switcher
              prompt={tr(copy.haveAccount)}
              action={tr(copy.goSignIn)}
              onClick={() => {
                setError(null);
                onMode("signin");
              }}
            />
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-baseline gap-2 text-sm">
        {label}
        {hint ? <span className="text-xs font-normal text-muted-foreground">{hint}</span> : null}
      </Label>
      {children}
    </div>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{children}</p>
  );
}

function Switcher({
  prompt,
  action,
  onClick,
}: {
  prompt: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <p className="pt-1 text-center text-sm text-muted-foreground">
      {prompt}{" "}
      <button type="button" onClick={onClick} className="font-medium text-primary hover:underline">
        {action}
      </button>
    </p>
  );
}
