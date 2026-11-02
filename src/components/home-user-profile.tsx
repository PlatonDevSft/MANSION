"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { ChevronUp } from "lucide-react";

export function HomeUserProfile({ onNavigate }: { onNavigate: () => void }) {
  const id = useId(),
    popover = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    popover.current?.hidePopover();
    onNavigate();
  };
  return (
    <div className="home-user-profile">
      <button
        className="home-user-trigger"
        popoverTarget={id}
        aria-label="Открыть меню пользователя"
        aria-expanded={open}
        aria-controls={id}
        onClick={(event) => {
          const r = event.currentTarget.getBoundingClientRect(),
            menu = popover.current;
          if (!menu) return;
          menu.style.left = `${Math.max(12, Math.min(r.left, window.innerWidth - 252))}px`;
          menu.style.bottom = `${Math.max(12, window.innerHeight - r.top + 8)}px`;
        }}
      >
        <span className="avatar">М</span>
        <span className="home-user-copy">
          <strong>Исследователь</strong>
          <small>Личный кабинет</small>
        </span>
        <ChevronUp size={16} className="home-user-chevron" aria-hidden="true" />
      </button>
      <div
        ref={popover}
        id={id}
        popover="auto"
        className="home-user-popover"
        onToggle={(event) =>
          setOpen(event.currentTarget.matches(":popover-open"))
        }
        aria-label="Аккаунт пользователя"
      >
        <Link href="/settings" onClick={close}>
          Мой профиль
        </Link>
        <Link href="/login" onClick={close}>
          Войти в аккаунт
        </Link>
      </div>
    </div>
  );
}
