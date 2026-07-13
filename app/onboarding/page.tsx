import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QuizForm from "@/components/QuizForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  return (
    <div className="mx-auto max-w-xl space-y-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Quick taste check</h1>
        <p className="text-sm text-muted">
          4 questions, one time only — helps us recommend better.
        </p>
      </div>
      <QuizForm />
    </div>
  );
}
