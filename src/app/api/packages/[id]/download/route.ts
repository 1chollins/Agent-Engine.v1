import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { packageZipResponse } from "@/lib/package-zip";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("id, status, listing_id, listings!inner(user_id, address, city)")
    .eq("id", params.id)
    .single();

  const pkgData = pkg as Record<string, unknown> | null;
  const pkgListings = pkgData?.listings as Record<string, unknown> | undefined;

  if (!pkgData || pkgListings?.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (pkgData.status === "processing") {
    return NextResponse.json({ error: "Package is still processing" }, { status: 400 });
  }

  return packageZipResponse(params.id, (pkgListings?.address as string) ?? "content");
}
