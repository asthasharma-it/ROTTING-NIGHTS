"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QUIZ_QUESTIONS } from "@/lib/quiz";

export default function QuizForm() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id]);

  async function handleSubmit() {
    setSubmitting(true);
    await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, label]) => ({
          questionId,
          label,
        })),
      }),
    });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {QUIZ_QUESTIONS.map((q) => (
        <div key={q.id} className="space-y-3">
          <p className="font-medium">{q.question}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.label }))}
                  className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                    selected
                      ? "border-accent bg-accent-soft/40 text-accent"
                      : "border-border bg-surface text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="w-full rounded-full bg-accent py-3 text-sm font-medium text-background transition disabled:opacity-40"
      >
        {submitting ? "Saving…" : "Save my taste"}
      </button>
    </div>
  );
}
