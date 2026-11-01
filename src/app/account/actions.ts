"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { tradeSchema } from "@/lib/journal";
export async function saveCloudTrade(form: FormData) {
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  let input: unknown;
  try {
    input = JSON.parse(String(form.get("trade")));
  } catch {
    redirect("/account?status=invalid");
  }
  const parsed = tradeSchema.safeParse(input);
  if (!parsed.success) redirect("/account?status=invalid");
  const { id, ...payload } = parsed.data;
  const { error } = await client
    .from("trades")
    .upsert({ id, user_id: user.id, ...payload });
  if (error) redirect("/account?status=failed");
  revalidatePath("/account");
  redirect("/account?status=saved");
}
export async function deleteCloudTrade(form: FormData) {
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await client
    .from("trades")
    .delete()
    .eq("id", String(form.get("id")))
    .eq("user_id", user.id);
  if (error) redirect("/account?status=failed");
  revalidatePath("/account");
}
