"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeading } from "./journal";
import { useLocal } from "@/lib/use-local";
import { traders } from "@/lib/demo";
import Link from "next/link";
const articles = [
  {
    title: "Риск начинается до входа",
    category: "Риск-менеджмент",
    body: "До открытия позиции определите уровень отмены сценария и допустимый денежный убыток. Рассчитайте объём из расстояния до стопа, учитывая комиссии. Размер позиции — следствие лимита риска, а не уверенности в прогнозе. После сделки сравните запланированный и фактический риск.",
  },
  {
    title: "Журнал решений, а не только результатов",
    category: "Психология",
    body: "Прибыльная сделка может нарушать систему, а убыточная — полностью ей соответствовать. Записывайте сценарий до входа, эмоциональное состояние и причины выхода. Раз в неделю отделяйте качество исполнения от финансового результата. Сравнивайте похожие ситуации и не делайте выводов по единичному наблюдению.",
  },
  {
    title: "Как читать Profit Factor",
    category: "Аналитика",
    body: "Profit Factor — отношение суммы прибыльных сделок к модулю суммы убыточных, после издержек. При отсутствии убытков значение не определено. Показатель не описывает просадку, стабильность или риск редких событий. Рассматривайте его вместе с размером выборки и распределением результатов.",
  },
];
export function ModulePage({ slug }: { slug: string }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [opened, setOpened] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const params = useSearchParams();
  const notes = useLocal<{ id: string; text: string }[]>("mansion.notes", []);
  const bookmarks = useLocal<number[]>("mansion.bookmarks", []);
  const posts = useLocal<
    {
      id: string;
      text: string;
      likes: number;
      liked: boolean;
      comments: string[];
    }[]
  >("mansion.posts", []);
  const requests = useLocal<{ id: string; message: string; status: string }[]>(
    "mansion.requests",
    [],
  );
  const strategies = useLocal<{ id: string; name: string; rules: string }[]>(
    "mansion.strategies",
    [],
  );
  const profile = useLocal("mansion.profile", {
    name: "Исследователь",
    bio: "",
  });
  const [notice, setNotice] = useState("");
  if (slug === "knowledge")
    return (
      <>
        <PageHeading
          eyebrow="DATA BASE"
          title="Знания — ваше преимущество."
          text="Небольшая библиотека практик для осознанной торговли."
        />
        <div className="toolbar">
          <input
            aria-label="Поиск материалов"
            placeholder="Поиск материалов"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            aria-label="Категория"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {[
              "Все",
              "Риск-менеджмент",
              "Психология",
              "Аналитика",
              "Избранное",
            ].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="content-grid">
          {articles
            .map((a, i) => ({ a, i }))
            .filter(
              ({ a, i }) =>
                a.title.toLowerCase().includes(query.toLowerCase()) &&
                (category === "Все" ||
                  category === a.category ||
                  (category === "Избранное" && bookmarks.value.includes(i))),
            )
            .map(({ a, i }) => (
              <article className="panel article" key={a.title}>
                <span className="eyebrow">{a.category} · ДЕМО-МАТЕРИАЛ</span>
                <h2>{a.title}</h2>
                <p>{opened === i ? a.body : a.body.slice(0, 110) + "…"}</p>
                <div className="actions">
                  <button
                    className="text-link"
                    onClick={() => setOpened(opened === i ? null : i)}
                  >
                    {opened === i ? "Свернуть" : "Читать материал →"}
                  </button>
                  <button
                    className="icon-button"
                    aria-label="Сохранить материал"
                    onClick={() =>
                      bookmarks.setValue(
                        bookmarks.value.includes(i)
                          ? bookmarks.value.filter((x) => x !== i)
                          : [...bookmarks.value, i],
                      )
                    }
                  >
                    {bookmarks.value.includes(i) ? "★" : "☆"}
                  </button>
                </div>
              </article>
            ))}
        </div>
        <h2>Личные заметки</h2>
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            notes.setValue([
              ...notes.value,
              { id: crypto.randomUUID(), text: draft.trim() },
            ]);
            setDraft("");
          }}
        >
          <label>
            Только в этом браузере
            <textarea
              value={draft}
              required
              maxLength={4000}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button className="button" disabled={!draft.trim()}>
            Добавить заметку
          </button>
        </form>
        {notes.value.map((n) => (
          <div className="panel" key={n.id}>
            <textarea
              aria-label="Изменить заметку"
              value={n.text}
              onChange={(e) =>
                notes.setValue(
                  notes.value.map((x) =>
                    x.id === n.id ? { ...x, text: e.target.value } : x,
                  ),
                )
              }
            />
            <button
              className="text-link"
              onClick={() =>
                notes.setValue(notes.value.filter((x) => x.id !== n.id))
              }
            >
              Удалить
            </button>
          </div>
        ))}
      </>
    );
  if (slug === "community") {
    const index = params.get("profile");
    if (index !== null) {
      const t = traders[Number(index)];
      return (
        <>
          <PageHeading
            eyebrow="TRADER PROFILE · DEMO"
            title={t?.name ?? "Профиль не найден"}
            text="Демонстрационный профиль. Статистика не подтверждена брокером."
          />
          <Link className="text-link" href="/community">
            ← Вернуться в сообщество
          </Link>
        </>
      );
    }
    return (
      <>
        <PageHeading
          eyebrow="COMMUNITY"
          title="Сильное окружение."
          text="Демо-лента этого браузера. Публикации не отправляются другим пользователям."
        />
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            posts.setValue([
              {
                id: crypto.randomUUID(),
                text: draft.trim(),
                likes: 0,
                liked: false,
                comments: [],
              },
              ...posts.value,
            ]);
            setDraft("");
          }}
        >
          <label>
            Поделитесь наблюдением
            <textarea
              required
              maxLength={3000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button disabled={!draft.trim()} className="button">
            Добавить в локальную ленту
          </button>
        </form>
        {posts.value.map((p) => (
          <article className="panel" key={p.id}>
            <span className="eyebrow">ВЫ · ЛОКАЛЬНАЯ ПУБЛИКАЦИЯ</span>
            <p className="post-text">{p.text}</p>
            <button
              className="text-link"
              onClick={() =>
                posts.setValue(
                  posts.value.map((x) =>
                    x.id === p.id
                      ? {
                          ...x,
                          liked: !x.liked,
                          likes: x.likes + (x.liked ? -1 : 1),
                        }
                      : x,
                  ),
                )
              }
            >
              {p.liked ? "♥" : "♡"} {p.likes}
            </button>
            {p.comments.map((c, i) => (
              <p className="comment" key={i}>
                {c}
              </p>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const text = String(
                  new FormData(e.currentTarget).get("comment"),
                ).trim();
                if (text)
                  posts.setValue(
                    posts.value.map((x) =>
                      x.id === p.id
                        ? { ...x, comments: [...x.comments, text] }
                        : x,
                    ),
                  );
                e.currentTarget.reset();
              }}
            >
              <label>
                Комментарий
                <input name="comment" required maxLength={1000} />
              </label>
              <button className="text-link">Добавить комментарий</button>
            </form>
          </article>
        ))}
        {!posts.value.length && (
          <div className="empty">
            Первое наблюдение может стать началом хорошей дискуссии.
          </div>
        )}
      </>
    );
  }
  if (slug === "strategies")
    return (
      <>
        <PageHeading
          eyebrow="STRATEGY LAB"
          title="От идеи к системе."
          text="Локальные стратегии. Бэктестинг и AI-агенты пока не подключены."
        />
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            strategies.setValue([
              ...strategies.value,
              {
                id: crypto.randomUUID(),
                name: String(f.get("name")),
                rules: String(f.get("rules")),
              },
            ]);
            e.currentTarget.reset();
          }}
        >
          <label>
            Название
            <input name="name" required maxLength={80} />
          </label>
          <label>
            Правила входа, выхода, риск и отмена сценария
            <textarea name="rules" required maxLength={4000} />
          </label>
          <button className="button">Создать стратегию</button>
        </form>
        {strategies.value.map((s) => (
          <div className="panel" key={s.id}>
            <input
              aria-label="Название стратегии"
              value={s.name}
              onChange={(e) =>
                strategies.setValue(
                  strategies.value.map((x) =>
                    x.id === s.id ? { ...x, name: e.target.value } : x,
                  ),
                )
              }
            />
            <textarea
              aria-label="Правила стратегии"
              value={s.rules}
              onChange={(e) =>
                strategies.setValue(
                  strategies.value.map((x) =>
                    x.id === s.id ? { ...x, rules: e.target.value } : x,
                  ),
                )
              }
            />
            <button
              className="text-link"
              onClick={() =>
                strategies.setValue(
                  strategies.value.filter((x) => x.id !== s.id),
                )
              }
            >
              Удалить
            </button>
          </div>
        ))}
      </>
    );
  if (slug === "requests")
    return (
      <>
        <PageHeading
          eyebrow="REQUESTS"
          title="Ваш голос важен."
          text="Локальные черновики обращений. Доставка поддержке не подключена."
        />
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            requests.setValue([
              ...requests.value,
              {
                id: crypto.randomUUID(),
                message: draft.trim(),
                status: "Локальный черновик",
              },
            ]);
            setDraft("");
          }}
        >
          <label>
            Новое обращение
            <textarea
              required
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </label>
          <button disabled={!draft.trim()} className="button">
            Сохранить черновик
          </button>
        </form>
        {requests.value.map((r) => (
          <div className="panel" key={r.id}>
            <small>{r.status}</small>
            <p>{r.message}</p>
          </div>
        ))}
      </>
    );
  if (slug === "settings")
    return (
      <>
        <PageHeading
          eyebrow="PREFERENCES"
          title="Ваше пространство. Ваши правила."
          text="Демонстрационный профиль и управление локальными данными."
        />
        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            setNotice("Профиль сохранён в этом браузере.");
          }}
        >
          <label>
            Имя
            <input
              required
              maxLength={60}
              value={profile.value.name}
              onChange={(e) =>
                profile.setValue({ ...profile.value, name: e.target.value })
              }
            />
          </label>
          <label>
            О себе
            <textarea
              maxLength={1000}
              value={profile.value.bio}
              onChange={(e) =>
                profile.setValue({ ...profile.value, bio: e.target.value })
              }
            />
          </label>
          <button className="button">Сохранить профиль</button>
          <p role="status">{notice}</p>
        </form>
        <div className="panel">
          <h2>Управление демо-данными</h2>
          <p>
            Журнал приватен для этого браузера. Для синхронизации нужен
            Supabase.
          </p>
          <button
            className="button secondary"
            onClick={() => {
              if (confirm("Удалить все локальные данные Mansion?")) {
                Object.keys(localStorage)
                  .filter((k) => k.startsWith("mansion."))
                  .forEach((k) => localStorage.removeItem(k));
                location.reload();
              }
            }}
          >
            Удалить локальные данные
          </button>
        </div>
      </>
    );
  if (slug === "leaderboard")
    return (
      <>
        <PageHeading
          eyebrow="TRADERS · DEMO"
          title="Учитесь у сильных."
          text="Примеры профилей за октябрь 2026. Доходности условные, не подтверждены брокером."
        />
        <div className="info-banner">
          Это демонстрация каталога, а не рекомендация трейдеров. Методология
          рейтинга ещё не внедрена.
        </div>
        {traders.map((t, i) => (
          <Link
            className="panel ranking"
            href={"/community?profile=" + i}
            key={t.name}
          >
            <span className="avatar">{t.initials}</span>
            <h2>{t.name}</h2>
            <p>{t.style}</p>
            <strong className="positive">{t.value}</strong>
            <small>Демо · не верифицировано</small>
          </Link>
        ))}
      </>
    );
  const info: Record<string, [string, string, string]> = {
    news: [
      "NEWS",
      "Информация без шума.",
      "Новостной провайдер не подключён. Актуальные новости появятся после настройки источника.",
    ],
    economy: [
      "ECONOMY",
      "Смотрите на рынок шире.",
      "Экономический провайдер не подключён. Реальные события и значения не загружены.",
    ],
    ai: [
      "AI ASSISTANT",
      "Вопросы, которые ведут к росту.",
      "AI не подключён. В журнале уже доступен анализ тегов на основе правил.",
    ],
    "copy-trading": [
      "COPY TRADING",
      "Опыт, которым можно делиться.",
      "Будущий модуль. Копирование сделок, оплата и исполнение ордеров не доступны.",
    ],
    subscription: [
      "MEMBERSHIP",
      "Инвестируйте в свою систему.",
      "Подписки и платежи пока не подключены. Все текущие функции доступны в деморежиме.",
    ],
  };
  const data = info[slug] ?? [
    "MANSION",
    "Раздел не найден",
    "Вернитесь на главную страницу.",
  ];
  return (
    <>
      <PageHeading eyebrow={data[0]} title={data[1]} text={data[2]} />
      <div className="panel empty">
        <span className="eyebrow">
          {slug === "copy-trading"
            ? "В РАЗРАБОТКЕ"
            : "ИНТЕГРАЦИЯ НЕ ПОДКЛЮЧЕНА"}
        </span>
        <h2>Место для следующего шага</h2>
        <p>
          Мы показываем только те данные и возможности, которые действительно
          доступны.
        </p>
        <Link href={slug === "ai" ? "/trading" : "/"} className="button">
          {slug === "ai" ? "Открыть журнал" : "На главную"}
        </Link>
      </div>
    </>
  );
}
