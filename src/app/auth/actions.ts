"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { configured, supabase } from "@/lib/supabase/server";
export async function authenticate(form: FormData) {
  if (!configured()) redirect("/login?status=unconfigured");
  const parsed = z
    .object({
      email: z.string().email(),
      password: z.string().max(128).optional(),
      action: z.enum(["login", "signup", "reset"]),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect("/login?status=invalid");
  const client = await supabase();
  const { email, password, action } = parsed.data;
  if (action !== "reset" && (!password || password.length < 8))
    redirect("/login?status=invalid");
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const result =
    action === "signup"
      ? await client.auth.signUp({
          email,
          password: password!,
          options: { emailRedirectTo: site + "/auth/callback" },
        })
      : action === "reset"
        ? await client.auth.resetPasswordForEmail(email, {
            redirectTo: site + "/auth/callback?recovery=1",
          })
        : await client.auth.signInWithPassword({ email, password: password! });
  if (result.error) redirect("/login?status=failed");
  if (action !== "login") redirect("/login?status=sent");
  redirect("/account");
}
export async function logout() {
  const client = await supabase();
  await client.auth.signOut();
  redirect("/");
}
export async function updatePassword(form: FormData) {
  const password = z.string().min(8).max(128).safeParse(form.get("password"));
  if (!password.success) redirect("/account?status=invalid");
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await client.auth.updateUser({ password: password.data });
  redirect("/account?status=" + (error ? "failed" : "saved"));
}
