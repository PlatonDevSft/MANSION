"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  House,
  Users,
  Newspaper,
  MessageSquare,
  ChartNoAxesColumn,
  Diamond,
  Globe,
  Settings,
  ArrowUpRight,
  Menu,
  X,
  Headphones,
  ChevronDown,
} from "lucide-react";
import { useLocal } from "@/lib/use-local";
const links = [
  ["/", "Главная", House],
  ["/community", "Сообщество", Users],
  ["/news", "Новости", Newspaper],
  ["/requests", "Запросы", MessageSquare],
  ["/leaderboard", "Рейтинг", ChartNoAxesColumn],
  ["/subscription", "Подписка", Diamond],
  ["/economy", "Экономика", Globe],
  ["/settings", "Настройки", Settings],
] as const;
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const [support, setSupport] = useState(false);
  const [profile, setProfile] = useState(false);
  const [sent, setSent] = useState(false);
  const requests = useLocal<{ id: string; message: string; status: string }[]>(
    "mansion.requests",
    [],
  );
  return (
    <div className="app">
      <button
        className="mobile-menu icon-button"
        aria-label="Открыть навигацию"
        onClick={() => setMenu(!menu)}
      >
        {menu ? <X /> : <Menu />}
      </button>
      <aside className={menu ? "sidebar mobile-open" : "sidebar"}>
        <Link href="/" className="logo" onClick={() => setMenu(false)}>
          Mansion<span>TRADING INTELLIGENCE</span>
        </Link>
        <nav aria-label="Главная навигация">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenu(false)}
              className={
                (path === href ? "active " : "") +
                (href === "/settings" ? "settings-link" : "")
              }
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="member-mark">
            <Diamond size={18} />
            <div>
              Mansion Member<small>Демонстрационный доступ</small>
            </div>
          </div>
          <Link href="/subscription">
            Открыть больше возможностей <ArrowUpRight size={14} />
          </Link>
          <p>Осознанность. Дисциплина. Рост.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="edition">ВАШЕ ЛИЧНОЕ ПРЕИМУЩЕСТВО</span>
          <div className="profile-wrap">
            <span className="demo-pill">DEMO · локальные данные</span>
            <button
              className="profile"
              onClick={() => setProfile(!profile)}
              aria-expanded={profile}
            >
              <span className="avatar">М</span>
              <span>Исследователь</span>
              <ChevronDown size={14} />
            </button>
            {profile && (
              <div className="profile-menu">
                <Link href="/settings" onClick={() => setProfile(false)}>
                  Мой профиль
                </Link>
                <Link href="/login" onClick={() => setProfile(false)}>
                  Войти в аккаунт
                </Link>
              </div>
            )}
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer>
          MANSION <span>Пространство осознанной торговли</span>
          <span>Демо · не инвестиционная рекомендация</span>
        </footer>
      </div>
      <button
        className="support-button"
        aria-label="Открыть поддержку"
        onClick={() => setSupport(!support)}
      >
        <Headphones size={20} />
      </button>
      {support && (
        <section className="support-panel" aria-label="Поддержка">
          <button
            className="icon-button close"
            aria-label="Закрыть поддержку"
            onClick={() => setSupport(false)}
          >
            <X size={18} />
          </button>
          <h2>Мы рядом</h2>
          <p>
            Демо: обращение останется в этом браузере. Отправка команде не
            подключена.
          </p>
          {sent ? (
            <p role="status">Сохранено в разделе «Запросы».</p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                requests.setValue([
                  ...requests.value,
                  {
                    id: crypto.randomUUID(),
                    message: String(f.get("message")),
                    status: "Локальный черновик",
                  },
                ]);
                setSent(true);
              }}
            >
              <label>
                Ваше сообщение
                <textarea name="message" required maxLength={2000} />
              </label>
              <button className="button">Сохранить обращение</button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
