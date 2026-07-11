import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { inngest } from "@/inngest/client";
import type { ContentPiece } from "@/types/content";

/** Video re-renders cost real money — cap user-initiated remixes per piece. */
const MAX_REMIXES = 2;

/**
 * Regenerate-with-direction (video): re-renders a reel/story with a new
 * seed, which changes the music track, edit style, and pacing. Capped at
 * MAX_REMIXES per piece.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // RLS-scoped read proves ownership.
  const { data: piece } = await supabase
    .from("content_pieces")
    .select("*, content_packages!inner(listing_id)")
    .eq("id", params.id)
    .single();

  if (!piece) {
    return NextResponse.json({ error: "Piece not found" }, { status: 404 });
  }

  const typedPiece = piece as ContentPiece & {
    regen_count?: number;
    content_packages: { listing_id: string };
  };

  if (typedPiece.asset_type !== "video") {
    return NextResponse.json(
      { error: "Only video pieces can be remixed" },
      { status: 400 }
    );
  }
  if (typedPiece.status === "processing" || typedPiece.status === "pending") {
    return NextResponse.json(
      { error: "This piece is already rendering" },
      { status: 400 }
    );
  }
  const used = typedPiece.regen_count ?? 0;
  if (used >= MAX_REMIXES) {
    return NextResponse.json(
      { error: `Remix limit reached (${MAX_REMIXES} per piece)` },
      { status: 400 }
    );
  }

  // Bump regen_count first (it feeds the render seed → different music,
  // edit style, and pacing), reset failure retries, and queue the render.
  const serviceClient = createServiceClient();
  const { error: updateError } = await serviceClient
    .from("content_pieces")
    .update({
      regen_count: used + 1,
      retry_count: 0,
      status: "pending",
      error_message: null,
    })
    .eq("id", params.id);
  if (updateError) {
    return NextResponse.json({ error: "Could not queue remix" }, { status: 500 });
  }

  await inngest.send({
    name: "piece/retry.requested",
    data: { piece_id: params.id },
  });

  return NextResponse.json({
    queued: true,
    remixesLeft: MAX_REMIXES - (used + 1),
  });
}
