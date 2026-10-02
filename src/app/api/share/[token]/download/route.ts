import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyShareToken } from "@/lib/share-token";
import { packageZipResponse } from "@/lib/package-zip";

/** ZIP of a shared campaign — the signed token is the authorization. */
export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  const packageId = verifyShareToken(params.token);
  if (!packageId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = createServiceClient();
  const { data: pkg } = await supabase
    .from("content_packages")
    .select("id, status, listings!inner(address)")
    .eq("id", packageId)
    .maybeSingle();
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if ((pkg as { status: string }).status === "processing") {
    return NextResponse.json({ error: "Still being made — try again in a few minutes" }, { status: 400 });
  }
  const address = ((pkg as Record<string, unknown>).listings as { address?: string } | undefined)?.address ?? "campaign";
  return packageZipResponse(packageId, address);
}
