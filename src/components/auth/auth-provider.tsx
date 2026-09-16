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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CampusOption } from "@/data";
import { COUNTRY_CODES, COUNTRIES, flagOf } from "@/lib/countries";
import { MEMBER_STATUS_META, MEMBER_STATUSES, type MemberStatus } from "@/lib/domain";
import type { Member } from "@/lib/store";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

type AuthContextValue = {
  member: Member | null;
  /** Opens the authorisation sheet. `reason` explains what the visitor was trying to do. */
  open: (mode?: Mode, reason?: string) => void;
  signOut: () => Promise<void>;
  /** Returns false and opens the sheet when the visitor is not signed in. */
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
  campuses,
  children,
}: {
  member: Member | null;
  campuses: CampusOption[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<{ mode: Mode; reason?: string } | null>(null);

  const open = useCallback((mode: Mode = "signin", reason?: string) => {
    setDialog({ mode, reason });
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("已退出登录");
    router.refresh();
  }, [router]);

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
              campuses={campuses}
              onMode={(mode) => setDialog({ mode, reason: dialog.reason })}
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
  campuses,
  onMode,
  onDone,
}: {
  mode: Mode;
  reason?: string;
  campuses: CampusOption[];
  onMode: (mode: Mode) => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [campus, setCampus] = useState<string | null>(null);
  const [status, setStatus] = useState<MemberStatus>("incoming");

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
      setError(data?.error ?? "出了点问题，再试一次");
      return;
    }
    toast.success(path.endsWith("register") ? "注册成功，欢迎加入" : "欢迎回来");
    onDone();
  }

  const signupStepOneReady =
    email.length > 3 && username.length >= 3 && password.length >= 8 && displayName.length > 0;

  return (
    <div>
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-primary to-[#7d3b2e] px-6 py-7 text-primary-foreground">
        <div className="absolute -right-10 -top-14 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <DialogHeader className="relative space-y-1.5 text-left">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "登录 NihaoCampus" : "加入 NihaoCampus"}
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/85">
            {reason ??
              (mode === "signin"
                ? "发帖和回帖需要登录后才能看。"
                : "填一次资料，就能在校区留言板上发言。")}
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
            <Field label="邮箱或用户名" hint="Email or username">
              <Input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="username"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="密码" hint="Password">
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
              {pending ? "正在登录…" : "登录"}
            </Button>
            <Switcher
              prompt="还没有账号？"
              action="注册一个"
              onClick={() => {
                setError(null);
                onMode("signup");
              }}
            />
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (step === 1) {
                setStep(2);
                return;
              }
              void submit("/api/auth/register", {
                username,
                email,
                password,
                displayName,
                country,
                campus: campus === "none" ? "" : campus,
                status,
              });
            }}
          >
            <StepDots step={step} />
            {step === 1 ? (
              <>
                <Field label="你想让大家怎么称呼你" hint="Display name">
                  <Input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="Amina / 阿明"
                  />
                </Field>
                <Field label="用户名" hint="Username, 用在主页地址上">
                  <Input
                    value={username}
                    onChange={(event) => setUsername(event.target.value.toLowerCase())}
                    placeholder="amina_k"
                  />
                </Field>
                <Field label="邮箱" hint="Email">
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="密码" hint="至少 8 位">
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="new-password"
                    placeholder="••••••••"
                  />
                </Field>
                <Button type="submit" className="w-full" size="lg" disabled={!signupStepOneReady}>
                  下一步
                </Button>
              </>
            ) : (
              <>
                <Field label="你来自哪里" hint="Where are you from">
                  <Select value={country} onValueChange={(value) => setCountry(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择国家 / Select country">
                        {(value: string | null) =>
                          value ? `${flagOf(value)} ${COUNTRIES[value]?.zh ?? value}` : null
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {COUNTRY_CODES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {flagOf(code)} {COUNTRIES[code].zh} · {COUNTRIES[code].en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="你现在的状态" hint="Your status">
                  <div className="grid grid-cols-2 gap-2">
                    {MEMBER_STATUSES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setStatus(option)}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-left text-sm transition",
                          status === option
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        <span className="block font-medium">{MEMBER_STATUS_META[option].zh}</span>
                        <span className="block text-xs opacity-70">
                          {MEMBER_STATUS_META[option].en}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="哪个校区" hint="还没定就先跳过">
                  <Select value={campus} onValueChange={(value) => setCampus(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="选择校区 / Select campus">
                        {(value: string | null) =>
                          value === "none"
                            ? "还没决定"
                            : (campuses.find((option) => option.slug === value)?.label ?? null)
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="none">还没决定</SelectItem>
                      {campuses.map((option) => (
                        <SelectItem key={option.slug} value={option.slug}>
                          {option.city} · {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                {error ? <Alert>{error}</Alert> : null}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    上一步
                  </Button>
                  <Button
                    type="submit"
                    className="flex-[2]"
                    size="lg"
                    disabled={pending || country === null}
                  >
                    {pending ? "正在创建…" : "创建账号"}
                  </Button>
                </div>
              </>
            )}
            <Switcher
              prompt="已经有账号了？"
              action="去登录"
              onClick={() => {
                setError(null);
                setStep(1);
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

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 pb-1 text-xs text-muted-foreground">
      <span className={cn("h-1.5 w-8 rounded-full", step >= 1 ? "bg-primary" : "bg-border")} />
      <span className={cn("h-1.5 w-8 rounded-full", step >= 2 ? "bg-primary" : "bg-border")} />
      <span>{step === 1 ? "第 1 步 账号" : "第 2 步 你的身份"}</span>
    </div>
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
