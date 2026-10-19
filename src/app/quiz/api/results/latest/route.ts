import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// The signed-in person's most recent result of their own (not results they
// recorded about someone else), so "See Results" works on any device they
// sign in on. Returns 204 when there is none.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse(null, { status: 204 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return new NextResponse(null, { status: 204 });
  }

  const { data: self } = await admin
    .from("people")
    .select("id")
    .eq("owner_user_id", user.id)
    .eq("is_self", true)
    .maybeSingle();

  let query = admin
    .from("quiz_results")
    .select("id")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: false })
    .limit(1);
  query = self
    ? query.or(`person_id.is.null,person_id.eq.${self.id}`)
    : query.is("person_id", null);

  const { data } = await query.maybeSingle();
  if (!data) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(
    { id: data.id },
    { headers: { "Cache-Control": "no-store" } }
  );
}
