"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

export function JoinButton({
  reason,
  children = "加入",
}: {
  reason?: string;
  children?: string;
}) {
  const { open } = useAuth();
  return (
    <Button onClick={() => open("signup", reason)} size="lg">
      {children}
    </Button>
  );
}

export function SignInButton({
  reason,
  children = "登录",
}: {
  reason?: string;
  children?: string;
}) {
  const { open } = useAuth();
  return (
    <Button variant="outline" onClick={() => open("signin", reason)}>
      {children}
    </Button>
  );
}
