export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { configured, supabase } from "@/lib/supabase/server";
import { logout, updatePassword } from "../auth/actions";
import { saveCloudTrade, deleteCloudTrade } from "./actions";
import { PageHeading } from "@/components/journal";
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!configured()) redirect("/login?status=unconfigured");
  const client = await supabase();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await client
    .from("trades")
    .select("*")
    .eq("user_id", user.id)
    .order("enteredAt", { ascending: false });
  const { status } = await searchParams;
  const example = JSON.stringify(
    {
      id: crypto.randomUUID(),
      symbol: "BTC/USD",
      market: "spot",
      direction: "long",
      currency: "USD",
      enteredAt: new Date().toISOString(),
      exitedAt: null,
      entry: "60000",
      exit: null,
      quantity: "0.1",
      fees: "0",
      funding: "0",
      status: "open",
      strategy: "",
      note: "",
      emotion: "Спокойствие",
      tags: [],
    },
    null,
    2,
  );
  return (
    <>
      <PageHeading
        eyebrow="PRIVATE ACCOUNT"
        title="Ваш облачный журнал."
        text="Приватное хранилище Supabase. Этот раздел отделён от локального демо."
      />
      <p>{user.email}</p>
      {status && (
        <p role="status">
          {status === "saved"
            ? "Сохранено."
            : status === "invalid"
              ? "Проверьте формат полей сделки или пароля."
              : "Операция не выполнена. Проверьте миграции Supabase."}
        </p>
      )}
      {error ? (
        <p role="alert">
          Не удалось загрузить журнал. Проверьте миграции и доступ к Supabase.
        </p>
      ) : (
        data?.map((t) => (
          <div className="panel" key={t.id}>
            <h2>{t.symbol}</h2>
            <p>
              {t.status} · {t.entry} USD
            </p>
            <form action={saveCloudTrade}>
              <label>
                Редактирование записи JSON
                <textarea
                  name="trade"
                  defaultValue={JSON.stringify(
                    {
                      ...t,
                      ...Object.fromEntries(
                        ["entry", "exit", "quantity", "fees", "funding"].map(
                          (k) => [k, t[k] === null ? null : String(t[k])],
                        ),
                      ),
                    },
                    null,
                    2,
                  )}
                  required
                />
              </label>
              <button className="button">Сохранить</button>
            </form>
            <form action={deleteCloudTrade}>
              <input type="hidden" name="id" value={t.id} />
              <label>
                <input type="checkbox" required /> Подтверждаю удаление
              </label>
              <button className="text-link">Удалить запись</button>
            </form>
          </div>
        ))
      )}
      <form action={saveCloudTrade} className="panel">
        <h2>Создать облачную запись</h2>
        <p>
          Технический интерфейс первого этапа. Поля валидируются на сервере;
          визуальная форма доступна в демо-журнале.
        </p>
        <label>
          Данные сделки JSON
          <textarea name="trade" required defaultValue={example} rows={16} />
        </label>
        <button className="button">Сохранить в Supabase</button>
      </form>
      <form className="panel" action={updatePassword}>
        <h2>Новый пароль</h2>
        <label>
          После восстановления доступа
          <input
            type="password"
            name="password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </label>
        <button className="button">Обновить пароль</button>
      </form>
      <form action={logout}>
        <button className="button secondary">Выйти</button>
      </form>
    </>
  );
}
