import { googleSignInEnabled, signIn } from "@/lib/auth";
import GuestSignInForm from "@/components/GuestSignInForm";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm space-y-6 py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Welcome to Rotting Nights</h1>
        <p className="text-sm text-muted">
          Sign in to keep your own watchlist, statuses, and recommendations.
        </p>
      </div>

      {googleSignInEnabled ? (
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button className="w-full rounded-full bg-white py-2.5 text-sm font-medium text-black transition hover:opacity-90">
            Continue with Google
          </button>
        </form>
      ) : (
        <div className="space-y-1 rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          <p>
            Google sign-in isn&apos;t configured yet. Add{" "}
            <code className="text-foreground">GOOGLE_CLIENT_ID</code> /{" "}
            <code className="text-foreground">GOOGLE_CLIENT_SECRET</code> to your{" "}
            <code className="text-foreground">.env</code> to enable it.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-border" /> or continue as guest{" "}
        <div className="h-px flex-1 bg-border" />
      </div>

      <GuestSignInForm />
    </div>
  );
}
