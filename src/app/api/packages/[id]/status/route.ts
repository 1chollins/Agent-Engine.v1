import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ContentPackage, ContentPiece } from "@/types/content";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user owns this listing
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("*, listings!inner(user_id)")
    .eq("id", params.id)
    .single();

  const pkgListings = (pkg as Record<string, unknown> | null)?.listings as Record<string, unknown> | undefined;
  if (!pkg || pkgListings?.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: pieces } = await supabase
    .from("content_pieces")
    .select("id, day_number, content_type, status, error_message, asset_type")
    .eq("package_id", params.id)
    .order("day_number");

  const typedPkg = pkg as ContentPackage;
  const typedPieces = (pieces ?? []) as Pick<
    ContentPiece,
    "id" | "day_number" | "content_type" | "status" | "error_message" | "asset_type"
  >[];

  return NextResponse.json({
    package: {
      id: typedPkg.id,
      status: typedPkg.status,
      total_pieces: typedPkg.total_pieces,
      completed_pieces: typedPkg.completed_pieces,
      failed_pieces: typedPkg.failed_pieces,
    },
    pieces: typedPieces,
  });
}
