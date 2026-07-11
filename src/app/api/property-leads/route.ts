import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Public lead capture from property pages. No auth — the slug is the
 * capability. Honeypot-guarded; stores the lead and emails the agent via
 * Resend when RESEND_API_KEY is configured (in-app list works regardless).
 */
export async function POST(request: NextRequest) {
  let body: {
    slug?: string;
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
    company?: string; // honeypot
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Bots fill the hidden field — accept silently, store nothing.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const slug = String(body.slug ?? "").slice(0, 120);
  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const message = String(body.message ?? "").trim().slice(0, 2000);

  if (!slug || !name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Please provide your name and a valid email." },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();
  const { data: page } = await supabase
    .from("property_pages")
    .select("id, listing_id, user_id, published")
    .eq("slug", slug)
    .maybeSingle();
  if (!page || !page.published) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { error: insertError } = await supabase.from("property_leads").insert({
    property_page_id: page.id,
    listing_id: page.listing_id,
    user_id: page.user_id,
    name,
    email,
    phone: phone || null,
    message: message || null,
  });
  if (insertError) {
    console.error("[property-leads] insert failed:", insertError.message);
    return NextResponse.json({ error: "Could not save your message" }, { status: 500 });
  }

  // Email the agent — best effort; the lead is already safe in the DB.
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const [{ data: brand }, { data: listing }] = await Promise.all([
        supabase
          .from("brand_profiles")
          .select("email, agent_name")
          .eq("user_id", page.user_id)
          .maybeSingle(),
        supabase
          .from("listings")
          .select("address, city, state")
          .eq("id", page.listing_id)
          .single(),
      ]);
      const to = brand?.email;
      if (to && listing) {
        const address = `${listing.address}, ${listing.city}, ${listing.state}`;
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Listing Studio <leads@frameandformstudio.com>",
            to: [to],
            reply_to: email,
            subject: `🔥 New lead: ${name} — ${address}`,
            text: [
              `New inquiry from your property page for ${address}.`,
              ``,
              `Name: ${name}`,
              `Email: ${email}`,
              phone ? `Phone: ${phone}` : null,
              message ? `\nMessage:\n${message}` : null,
              ``,
              `Reply to this email to respond directly.`,
              `All leads: https://studio.frameandformstudio.com/leads`,
            ]
              .filter((l) => l !== null)
              .join("\n"),
          }),
        });
      }
    }
  } catch (error) {
    console.error("[property-leads] email failed:", error);
  }

  return NextResponse.json({ ok: true });
}
