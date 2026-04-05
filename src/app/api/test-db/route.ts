import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    // Simple query to verify connection — works even with empty tables
    const { data, error } = await supabase
      .from("brand_profiles")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", message: error.message, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "connected",
      message: "Supabase connection successful",
      rows: data.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}
