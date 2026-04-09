import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";

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

  const pieceData = piece as Record<string, unknown>;
  const pkgData = pieceData.content_packages as Record<string, unknown> | undefined;
  const listingsData = pkgData?.listings as Record<string, unknown> | undefined;
  if (listingsData?.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (pieceData.status !== "failed") {
    return NextResponse.json(
      { error: "Only failed pieces can be retried" },
      { status: 400 }
    );
  }

  if ((pieceData.retry_count as number) >= 2) {
    return NextResponse.json(
      { error: "Max retries reached (2)" },
      { status: 400 }
    );
  }

  // Trigger retry via Inngest
  await inngest.send({
    name: "piece/retry.requested",
    data: { piece_id: params.id },
  });

  return NextResponse.json({ success: true, message: "Retry started" });
}
