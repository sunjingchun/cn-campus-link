"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useT } from "@/components/site/locale-switch";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";

export function JoinButton({
  reason,
  children,
}: {
  reason?: string;
  children?: string;
}) {
  const { open } = useAuth();
  const { t } = useT();
  return (
    <Button onClick={() => open("signup", reason)} size="lg">
      {children ?? t(copy.join)}
    </Button>
  );
}

export function SignInButton({
  reason,
  children,
}: {
  reason?: string;
  children?: string;
}) {
  const { open } = useAuth();
  const { t } = useT();
  return (
    <Button variant="outline" onClick={() => open("signin", reason)}>
      {children ?? t(copy.signIn)}
    </Button>
  );
}
