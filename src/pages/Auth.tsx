import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Armchair,
  ArrowRight,
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  UserRound,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/admin") {
  if (returnTo?.startsWith("/") && !backToStartsWithSlash(returnTo)) {
    return returnTo;
  }
  return fallback;
}

function backToStartsWithSlash(returnTo: string) {
  return returnTo.startsWith("/") && !returnTo.startsWith("//");
}

const inputClass = "h-10 rounded-lg";

function Field({
  id,
  label,
  icon: Icon,
  trailing,
  children,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
        {trailing}
      </div>
    </div>
  );
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { signIn } = useAuthActions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Client-side validation mirrors the server so users get instant,
    // friendly feedback instead of a raw server error.
    const identifierTrimmed = identifier.trim().toLowerCase();
    if (!identifierTrimmed) {
      setError("Enter your email or username.");
      return;
    }
    if (mode === "signUp") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifierTrimmed)) {
        setError("Sign-up needs a valid email address.");
        return;
      }
      const usernameTrimmed = username.trim().toLowerCase();
      if (usernameTrimmed && !/^[a-z0-9_.-]{3,24}$/.test(usernameTrimmed)) {
        setError(
          "Username must be 3–24 characters: letters, numbers, dots, dashes or underscores.",
        );
        return;
      }
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    if (mode === "signUp" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signUp") {
        await signIn("credentials", {
          flow: "signUp",
          identifier: identifierTrimmed,
          username: username.trim().toLowerCase(),
          name: name.trim(),
          password,
        });
      } else {
        await signIn("credentials", {
          flow: "signIn",
          identifier: identifierTrimmed,
          password,
        });
      }
      navigate(redirect);
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err instanceof Error
          ? err.message.replace(/^Error:\s*/, "")
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next: "signIn" | "signUp") => {
    setMode(next);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(700px 300px at 20% 10%, rgba(255,255,255,0.5), transparent 60%)",
          }}
        />
        <Link to="/" className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
            <Armchair className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">Hearth & Grain</span>
        </Link>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-semibold leading-tight">
            The studio behind the collection.
          </h2>
          <p className="mt-4 leading-7 text-primary-foreground/80">
            Sign in to publish pieces, curate the catalog, and answer customer
            inquiries — all from one calm dashboard.
          </p>
        </div>
        <p className="relative text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Hearth & Grain · Portland, OR
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md pb-0 shadow-md">
          <CardHeader className="text-center">
            <div className="flex justify-center lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Armchair className="size-5" />
                </span>
              </Link>
            </div>
            <CardTitle className="text-xl">
              {mode === "signIn" ? "Sign in to the studio" : "Create your account"}
            </CardTitle>
            <CardDescription>
              {mode === "signIn"
                ? "Use your email or username and password."
                : "Team access is granted on first sign-in."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pb-6">
            {/* Tabs */}
            <div className="mb-5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(
                [
                  ["signIn", "Sign in"],
                  ["signUp", "Sign up"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => switchMode(value)}
                  className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                    mode === value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signUp" && (
                <Field id="auth-name" label="Name" icon={UserRound}>
                  <Input
                    id="auth-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass + " pl-9"}
                    autoComplete="name"
                  />
                </Field>
              )}

              <Field
                id="auth-identifier"
                label={mode === "signUp" ? "Email" : "Email or username"}
                icon={AtSign}
              >
                <Input
                  id="auth-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    mode === "signUp" ? "you@example.com" : "you@example.com or username"
                  }
                  type={mode === "signUp" ? "email" : "text"}
                  className={inputClass + " pl-9"}
                  autoComplete="username"
                  required
                />
                {mode === "signIn" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tip: usernames work too.
                  </p>
                )}
              </Field>

              {mode === "signUp" && (
                <Field id="auth-username" label="Username (optional)" icon={UserRound}>
                  <Input
                    id="auth-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. mara.makes"
                    className={inputClass + " pl-9"}
                    autoComplete="username"
                  />
                </Field>
              )}

              <Field
                id="auth-password"
                label="Password"
                icon={KeyRound}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              >
                <Input
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signUp" ? "At least 8 characters" : "Your password"}
                  type={showPassword ? "text" : "password"}
                  className={inputClass + " pl-9 pr-10"}
                  autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                  required
                />
              </Field>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    {mode === "signIn" ? "Sign in" : "Create account"}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            {mode === "signIn" && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                New to the studio?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => switchMode("signUp")}
                >
                  Create an account
                </button>
              </p>
            )}
          </CardContent>

          <div className="border-t bg-muted px-6 py-4 text-center text-xs text-muted-foreground rounded-b-lg">
            <Link to="/" className="hover:text-foreground">
              ← Back to the showroom
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
