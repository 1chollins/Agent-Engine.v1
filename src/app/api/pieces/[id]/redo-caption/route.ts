import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { regeneratePieceCaptions } from "@/lib/generation/captions";
import type { Listing } from "@/types/listing";
import type { BrandProfile } from "@/types/brand-profile";
import type { ContentPiece } from "@/types/content";

/**
 * Regenerate-with-direction (text): rewrites one piece's captions using the
 * agent's instruction. Unlimited — text redos cost fractions of a cent.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let direction = "";
  try {
    const body = await request.json();
    direction = String(body.direction ?? "").trim().slice(0, 300);
  } catch {
    // fall through — direction stays empty
  }
  if (!direction) {
    return NextResponse.json(
      { error: "Tell me what to change — e.g. “shorter” or “highlight the lanai”." },
      { status: 400 }
    );
  }

  // RLS-scoped read proves ownership: users can only see their own pieces.
  const { data: piece } = await supabase
    .from("content_pieces")
    .select("*, content_packages!inner(listing_id)")
    .eq("id", params.id)
    .single();

  if (!piece) {
    return NextResponse.json({ error: "Piece not found" }, { status: 404 });
  }

  const typedPiece = piece as ContentPiece & {
    content_packages: { listing_id: string };
  };
  const listingId = typedPiece.content_packages.listing_id;

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const { data: brand } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (!brand) {
    return NextResponse.json({ error: "Brand profile not found" }, { status: 400 });
  }

  try {
    const result = await regeneratePieceCaptions(
      listing as Listing,
      brand as BrandProfile,
      typedPiece,
      direction,
      listingId
    );

    // Writes go through the service client — pieces are system-managed rows.
    const serviceClient = createServiceClient();
    const update: Record<string, string> = {
      caption_instagram: result.caption_instagram,
      caption_facebook: result.caption_facebook,
      hashtags: result.hashtags,
    };
    if (typedPiece.content_type === "story") {
      if (result.story_teaser) update.story_teaser = result.story_teaser;
      if (result.story_cta) update.story_cta = result.story_cta;
    }
    const { error: updateError } = await serviceClient
      .from("content_pieces")
      .update(update)
      .eq("id", params.id);
    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json({ ...update });
  } catch (error) {
    console.error("[redo-caption] failed:", error);
    return NextResponse.json(
      { error: "Rewrite failed — please try again" },
      { status: 500 }
    );
  }
}
