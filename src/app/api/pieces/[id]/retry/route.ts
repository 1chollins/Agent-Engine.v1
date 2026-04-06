import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { retryPiece } from "@/lib/generation/retry-piece";

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership: piece -> package -> listing -> user
  const { data: piece } = await supabase
    .from("content_pieces")
    .select("id, status, retry_count, content_packages!inner(listing_id, listings!inner(user_id))")
    .eq("id", params.id)
    .single();

  if (!piece) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const listingUserId = (piece as any).content_packages?.listings?.user_id;
  if (listingUserId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if ((piece as any).status !== "failed") {
    return NextResponse.json(
      { error: "Only failed pieces can be retried" },
      { status: 400 }
    );
  }

  if ((piece as any).retry_count >= 2) {
    return NextResponse.json(
      { error: "Max retries reached (2)" },
      { status: 400 }
    );
  }

  // Trigger retry in background — don't block the response
  retryPiece(params.id).catch((err) => {
    console.error(`Retry failed for piece ${params.id}:`, err);
  });

  return NextResponse.json({ success: true, message: "Retry started" });
}
