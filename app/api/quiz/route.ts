import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = (await req.json()) as {
    answers: { questionId: string; label: string }[];
  };
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await prisma.$transaction([
    ...answers.map((a) =>
      prisma.quizAnswer.upsert({
        where: { userId_question: { userId: session.user.id, question: a.questionId } },
        update: { answer: a.label },
        create: { userId: session.user.id, question: a.questionId, answer: a.label },
      })
    ),
    prisma.user.update({
      where: { id: session.user.id },
      data: { hasCompletedQuiz: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
