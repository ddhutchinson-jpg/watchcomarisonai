import { NextResponse } from "next/server";
import { getOrCreatePairComparison } from "@/src/lib/pairComparison";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      watchAId?: unknown;
      watchBId?: unknown;
    };

    if (typeof body.watchAId !== "string" || typeof body.watchBId !== "string") {
      return NextResponse.json(
        { error: "watchAId and watchBId are required." },
        { status: 400 },
      );
    }

    const result = await getOrCreatePairComparison(body.watchAId, body.watchBId, {
      recordEvent: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create pair review.";
    const status = message.includes("Choose two different watches")
      ? 400
      : message.includes("Unable to find both watches")
        ? 404
        : message.includes("OPENAI_API_KEY")
          ? 503
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
