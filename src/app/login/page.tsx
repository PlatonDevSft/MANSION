import { authenticate } from "@/app/auth/actions";
import { configured } from "@/lib/supabase/server";
import Link from "next/link";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const messages: Record<string, string> = {
    unconfigured: "Сначала подключите Supabase в переменных окружения.",
    invalid: "Проверьте email и пароль (не менее 8 символов).",
    failed: "Операция не выполнена. Проверьте данные и настройки Supabase.",
    sent: "Если операция доступна для этого адреса, письмо отправлено. Проверьте почту.",
  };
  return (
    <section className="panel auth-form">
      <span className="eyebrow">WELCOME TO MANSION</span>
      <h1>С возвращением.</h1>
      {!configured() ? (
        <>
          <p>
            Синхронизация не настроена. Сейчас доступен локальный деморежим.
          </p>
          <Link href="/" className="button">
            Открыть демо
          </Link>
        </>
      ) : (
        <form action={authenticate}>
          <label>
            Email
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Пароль
            <input
              type="password"
              name="password"
              minLength={8}
              maxLength={128}
              required
              autoComplete="current-password"
            />
          </label>
          <div className="actions">
            <button name="action" value="login" className="button">
              Войти
            </button>
            <button name="action" value="signup" className="button secondary">
              Регистрация
            </button>
          </div>
          <button
            formNoValidate
            name="action"
            value="reset"
            className="text-link"
          >
            Восстановить доступ
          </button>
        </form>
      )}
      {status && <p role="status">{messages[status] ?? ""}</p>}
    </section>
  );
}
