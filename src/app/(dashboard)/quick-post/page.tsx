import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostComposer } from "@/components/studio/post-composer";

export const metadata = {
  title: "Quick Post — Listing Studio",
};

export default async function QuickPostPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-tan">
          Quick Post
        </p>
        <h1 className="mt-1 text-2xl font-bold text-black sm:text-3xl">
          A finished post in one click.
        </h1>
        <p className="mt-1 text-gray-600">
          Drop a photo — the AI writes it, your brand styles it, you download it.
        </p>
      </div>
      <PostComposer />
    </div>
  );
}
