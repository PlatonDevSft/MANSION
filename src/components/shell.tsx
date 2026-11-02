"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  House,
  Search,
  BookOpen,
  BrainCircuit,
  ChartCandlestick,
  Copy,
  Crown,
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
  ArrowLeftToLine,
  ArrowRightFromLine,
} from "lucide-react";
import Velaris from "@/components/ui/velaris";
import { useLocal } from "@/lib/use-local";
const links = [
  ["/", "Главная", House],
  ["/trading", "Журнал", ChartCandlestick],
  ["/ai", "AI Ассистент", BrainCircuit],
  ["/community", "Сообщество", Users],
  ["/copy-trading", "Копи-трейдинг", Copy],
  ["/knowledge", "База знаний", BookOpen],
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
  const homeRail = useLocal("mansion.home-sidebar-collapsed", false);
  const home = path === "/";
  const [support, setSupport] = useState(false);
  const [profile, setProfile] = useState(false);
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const navigation = useRef<HTMLElement>(null);
  const menuTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const trigger = menuTrigger.current;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navigation.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        return;
      }
      if (e.key !== "Tab") return;
      const elements = Array.from(
        navigation.current?.querySelectorAll<HTMLElement>("a,button") ?? [],
      );
      const first = elements[0],
        last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", keyboard);
      trigger?.focus();
    };
  }, [menu]);

  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const requests = useLocal<{ id: string; message: string; status: string }[]>(
    "mansion.requests",
    [],
  );
  return (
    <div
      className={
        "app " +
        (home
          ? "dashboard-scene" + (homeRail.value ? " home-compact" : "")
          : "inner-scene")
      }
    >
      <a className="skip-link" href="#main-content">
        Перейти к содержимому
      </a>
      <button
        ref={menuTrigger}
        aria-expanded={menu}
        aria-controls="primary-navigation"
        className="mobile-menu icon-button"
        aria-label="Открыть навигацию"
        onClick={() => setMenu(!menu)}
      >
        {menu ? <X /> : <Menu />}
      </button>
      {menu && (
        <button
          className="navigation-scrim"
          aria-label="Закрыть навигацию"
          onClick={() => setMenu(false)}
          tabIndex={-1}
        />
      )}
      <aside
        ref={navigation}
        id="primary-navigation"
        role={menu ? "dialog" : undefined}
        aria-modal={menu ? true : undefined}
        aria-label="Навигация Mansion"
        className={menu ? "sidebar mobile-open" : "sidebar"}
      >
        {menu && (
          <button
            className="navigation-close icon-button"
            aria-label="Закрыть меню"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        )}
        <Link href="/" className="logo" onClick={() => setMenu(false)}>
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="brand-name">MANSION</span>
        </Link>
        {home && (
          <button
            type="button"
            className="home-sidebar-toggle icon-button"
            aria-label={
              homeRail.value
                ? "Развернуть боковую панель"
                : "Свернуть боковую панель"
            }
            aria-expanded={!homeRail.value}
            aria-controls="primary-navigation"
            onClick={() => homeRail.setValue(!homeRail.value)}
          >
            {homeRail.value ? (
              <ArrowRightFromLine size={18} />
            ) : (
              <ArrowLeftToLine size={18} />
            )}
          </button>
        )}
        <nav aria-label="Главная навигация">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              aria-label={label}
              title={home && homeRail.value ? label : undefined}
              onClick={() => setMenu(false)}
              className={
                (path === href ? "active " : "") +
                (href === "/settings" ? "settings-link" : "")
              }
            >
              <Icon size={17} aria-hidden="true" />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="member-mark">
            <Crown size={18} />
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
      <div className="workspace" inert={menu}>
        {home && <Velaris />}
        <header className="topbar">
          <div className="global-search">
            <Search size={17} />
            <input
              ref={searchInput}
              aria-label="Поиск по разделам"
              placeholder="Поиск по разделам Mansion…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setSearch("");
                if (e.key === "ArrowDown" && search.trim()) {
                  e.preventDefault();
                  document
                    .querySelector<HTMLAnchorElement>(".search-results a")
                    ?.focus();
                }
              }}
            />
            <kbd>⌘ K</kbd>
            {search.trim() && (
              <div
                className="search-results"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearch("");
                    searchInput.current?.focus();
                  }
                  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    const items = Array.from(
                      e.currentTarget.querySelectorAll<HTMLAnchorElement>("a"),
                    );
                    const current = items.indexOf(
                      document.activeElement as HTMLAnchorElement,
                    );
                    items[
                      (current +
                        (e.key === "ArrowDown" ? 1 : -1) +
                        items.length) %
                        items.length
                    ]?.focus();
                  }
                }}
              >
                {links
                  .filter(([, label]) =>
                    label.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map(([href, label, Icon]) => (
                    <Link key={href} href={href} onClick={() => setSearch("")}>
                      <Icon size={16} />
                      {label}
                    </Link>
                  ))}
                {!links.some(([, label]) =>
                  label.toLowerCase().includes(search.toLowerCase()),
                ) && <p>Раздел не найден. Попробуйте «Журнал».</p>}
              </div>
            )}
          </div>
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
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
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
