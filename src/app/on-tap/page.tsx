import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReviewSession } from "@/components/study/review-session";

export const metadata: Metadata = { title: "Ôn tập hôm nay" };

async function ReviewContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap");
  return <ReviewSession userId={user.id} />;
}

export default function ReviewPage() {
  return (
    <div className="py-6">
      <Suspense fallback={<div aria-hidden className="mx-auto h-72 w-full max-w-md animate-pulse rounded-3xl bg-surface-2" />}>
        <ReviewContent />
      </Suspense>
    </div>
  );
}
