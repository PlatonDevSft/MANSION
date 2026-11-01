"use client";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Download, Search, Pencil, Trash2, X } from "lucide-react";
import {
  tradeSchema,
  Trade,
  pnl,
  statistics,
  money,
  errorTags,
  insights,
} from "@/lib/journal";
import { demoTrades } from "@/lib/demo";
import { useLocal } from "@/lib/use-local";
import { PnlChart } from "./pnl-chart";
const blank = (): Trade => ({
  id: crypto.randomUUID(),
  symbol: "BTC/USD",
  market: "linear",
  direction: "long",
  currency: "USD",
  enteredAt: new Date().toISOString(),
  exitedAt: null,
  entry: "",
  exit: null,
  quantity: "",
  fees: "0",
  funding: "0",
  status: "open",
  strategy: "",
  note: "",
  emotion: "Спокойствие",
  tags: [],
});
export function Journal() {
  const store = useLocal<Trade[]>("mansion.trades", demoTrades);
  const [tab, setTab] = useState("Журнал");
  const [editing, setEditing] = useState<Trade | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [tag, setTag] = useState("");
  const [page, setPage] = useState(0);
  const [ascending, setAscending] = useState(false);
  const [notice, setNotice] = useState("");
  const stats = statistics(store.value);
  const filtered = store.value
    .filter(
      (t) =>
        t.symbol.toLowerCase().includes(search.toLowerCase()) &&
        (status === "all" || t.status === status) &&
        (!tag || t.tags.includes(tag)),
    )
    .sort((a, b) =>
      ascending
        ? a.enteredAt.localeCompare(b.enteredAt)
        : b.enteredAt.localeCompare(a.enteredAt),
    );
  function save(t: Trade) {
    const validated = tradeSchema.parse(t);
    store.setValue(
      store.value.some((v) => v.id === t.id)
        ? store.value.map((v) => (v.id === t.id ? validated : v))
        : [...store.value, validated],
    );
    setEditing(null);
    setNotice("Сделка сохранена в этом браузере.");
  }
  return (
    <>
      <PageHeading
        eyebrow="TRADING JOURNAL"
        title="Каждая сделка имеет значение."
        text="Анализируйте решения. Находите закономерности. Формируйте свою систему."
      />
      <div className="tabs">
        {["Журнал", "Аналитика", "AI Insights", "Психология"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="info-banner">
        Демонстрационный журнал · данные сохраняются только в этом браузере.
        Spot Long и линейные USD-контракты. Объём — в единицах базового актива.
      </div>
      {(store.error || notice) && <p role="status">{store.error || notice}</p>}
      {tab === "Журнал" && (
        <>
          <div className="toolbar">
            <label className="search">
              <Search size={16} />
              <input
                aria-label="Поиск инструмента"
                placeholder="Найти инструмент"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </label>
            <select
              aria-label="Статус сделки"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">Все статусы</option>
              <option value="open">Открытые</option>
              <option value="closed">Закрытые</option>
            </select>
            <select
              aria-label="Тег ошибки"
              value={tag}
              onChange={(e) => {
                setTag(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Все ошибки</option>
              {errorTags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <button
              className="button secondary"
              onClick={() => {
                const a = document.createElement("a");
                const url = URL.createObjectURL(
                  new Blob([JSON.stringify(store.value, null, 2)], {
                    type: "application/json",
                  }),
                );
                a.href = url;
                a.download = "mansion-journal.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={16} /> Экспорт
            </button>
            <button
              className="button"
              onClick={() => setEditing(blank())}
              disabled={!store.ready}
            >
              <Plus size={16} /> Новая сделка
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Инструмент</th>
                  <th>Направление</th>
                  <th>
                    <button onClick={() => setAscending(!ascending)}>
                      Вход {ascending ? "↑" : "↓"}
                    </button>
                  </th>
                  <th>Стратегия</th>
                  <th>Статус</th>
                  <th>P&L · USD</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(page * 8, page * 8 + 8).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.symbol}</strong>
                      <small>{t.market === "spot" ? "Spot" : "Linear"}</small>
                    </td>
                    <td>
                      <span className={"trade-direction " + t.direction}>
                        {t.direction.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {new Date(t.enteredAt).toLocaleDateString("ru-RU", {
                        timeZone: "UTC",
                      })}
                      <small>UTC</small>
                    </td>
                    <td>{t.strategy || "—"}</td>
                    <td>{t.status === "closed" ? "Закрыта" : "Открыта"}</td>
                    <td className={pnl(t)?.lt(0) ? "negative" : "positive"}>
                      {money(pnl(t))}
                    </td>
                    <td>
                      <button
                        className="icon-button"
                        aria-label={"Редактировать " + t.symbol}
                        onClick={() => setEditing(t)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button"
                        aria-label={"Удалить " + t.symbol}
                        onClick={() => {
                          if (
                            confirm(
                              "Удалить сделку без возможности восстановления?",
                            )
                          ) {
                            store.setValue(
                              store.value.filter((v) => v.id !== t.id),
                            );
                            setPage(0);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && (
              <div className="empty">
                Сделок не найдено. Измените фильтры или добавьте первую сделку.
              </div>
            )}
          </div>
          <div className="pagination">
            <span>{filtered.length} сделок</span>
            <button disabled={page === 0} onClick={() => setPage(page - 1)}>
              Назад
            </button>
            <span>
              {page + 1} / {Math.max(1, Math.ceil(filtered.length / 8))}
            </span>
            <button
              disabled={(page + 1) * 8 >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              Далее
            </button>
          </div>
        </>
      )}
      {tab === "Аналитика" && (
        <>
          <div className="metric-grid">
            {[
              ["Закрытых сделок", stats.count],
              ["Net P&L", money(stats.net)],
              [
                "Win Rate",
                stats.winRate === null ? "—" : stats.winRate.toFixed(1) + "%",
              ],
              ["Profit Factor", stats.profitFactor?.toFixed(2) ?? "—"],
              ["Средняя прибыль", money(stats.averageWin)],
              ["Средний убыток", money(stats.averageLoss)],
            ].map(([k, v]) => (
              <div className="panel" key={k}>
                <small>{k}</small>
                <h2>{v}</h2>
              </div>
            ))}
          </div>
          <div className="panel">
            <h2>Накопленный реализованный P&L</h2>
            <p>USD · по дате закрытия · это не доходность капитала</p>
            <PnlChart trades={store.value} />
          </div>
        </>
      )}
      {tab === "AI Insights" && (
        <>
          <div className="info-banner">
            Анализ по правилам, без LLM. Наблюдения показывают связь, а не
            причинность. Выборка: {stats.count} закрытых сделок.
          </div>
          {insights(store.value).map((i) => (
            <div className="panel insight" key={i.tag}>
              <span className="eyebrow">ПОВТОРЯЮЩИЙСЯ ТЕГ</span>
              <h2>{i.tag}</h2>
              <p>
                {i.count} сделок · суммарный P&L {money(i.net)}.{" "}
                {i.count < 10 ? "Малая выборка — выводы предварительны." : ""}
              </p>
              <button
                className="text-link"
                onClick={() => {
                  setTag(i.tag);
                  setTab("Журнал");
                  setPage(0);
                }}
              >
                Показать {i.count} подтверждающих сделок →
              </button>
            </div>
          ))}
          {!insights(store.value).length && (
            <div className="empty">
              Добавьте закрытые сделки с тегами ошибок для анализа.
            </div>
          )}
        </>
      )}
      {tab === "Психология" && (
        <div className="panel empty">
          <h2>Сначала — осознанность</h2>
          <p>
            AI не подключён. Начните с заметки: какое правило вы соблюли
            сегодня?
          </p>
          <p>
            Ассистент для дисциплины появится после подключения серверного
            AI-провайдера.
          </p>
        </div>
      )}
      {editing && (
        <TradeForm
          initial={editing}
          save={save}
          close={() => setEditing(null)}
        />
      )}
    </>
  );
}
export function PageHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
function TradeForm({
  initial,
  save,
  close,
}: {
  initial: Trade;
  save: (t: Trade) => void;
  close: () => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Trade>({
    resolver: zodResolver(tradeSchema),
    defaultValues: initial,
  });
  const dialog = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const el = dialog.current;
    function trap(e: KeyboardEvent) {
      if (e.key !== "Tab" || !el) return;
      const controls = Array.from(
        el.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),select,textarea,[href]",
        ),
      );
      const first = controls[0],
        last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    el?.addEventListener("keydown", trap);
    return () => {
      el?.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, []);
  const closed = watch("status") === "closed";
  return (
    <div
      className="modal-backdrop"
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-title"
        className="modal"
      >
        <button
          className="icon-button close"
          aria-label="Закрыть форму"
          onClick={close}
        >
          <X />
        </button>
        <span className="eyebrow">YOUR TRADING RECORD</span>
        <h2 id="trade-title">Запись в журнале</h2>
        <form onSubmit={handleSubmit(save)}>
          <div className="form-grid">
            <label>
              Инструмент
              <input autoFocus {...register("symbol")} />
            </label>
            <label>
              Рынок
              <select {...register("market")}>
                <option value="linear">Линейный USD-контракт</option>
                <option value="spot">Spot (только Long)</option>
              </select>
            </label>
            <label>
              Направление
              <select {...register("direction")}>
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </label>
            <label>
              Статус
              <select {...register("status")}>
                <option value="open">Открыта</option>
                <option value="closed">Закрыта</option>
              </select>
            </label>
            <label>
              Вход · дата и время UTC
              <input
                {...register("enteredAt")}
                placeholder="2026-11-02T10:00:00.000Z"
              />
            </label>
            <label>
              Цена входа · USD
              <input inputMode="decimal" {...register("entry")} />
            </label>
            <label>
              Объём · базовый актив
              <input inputMode="decimal" {...register("quantity")} />
            </label>
            <label>
              Комиссии · USD
              <input inputMode="decimal" {...register("fees")} />
            </label>
            <label>
              Funding уплачен · USD
              <input inputMode="decimal" {...register("funding")} />
            </label>
            {closed && (
              <>
                <label>
                  Выход · дата и время UTC
                  <input
                    {...register("exitedAt", { setValueAs: (v) => v || null })}
                    placeholder="2026-11-02T12:00:00.000Z"
                  />
                </label>
                <label>
                  Цена выхода · USD
                  <input
                    inputMode="decimal"
                    {...register("exit", { setValueAs: (v) => v || null })}
                  />
                </label>
              </>
            )}
            <label>
              Стратегия
              <input {...register("strategy")} />
            </label>
            <label>
              Эмоциональное состояние
              <select {...register("emotion")}>
                <option>Спокойствие</option>
                <option>Тревога</option>
                <option>Эйфория</option>
              </select>
            </label>
          </div>
          <fieldset>
            <legend>Ошибки и наблюдения</legend>
            <div className="tag-options">
              {errorTags.map((t) => (
                <label key={t}>
                  <input type="checkbox" value={t} {...register("tags")} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            Личная заметка
            <textarea {...register("note")} />
          </label>
          {Object.entries(errors).map(([k, e]) => (
            <p className="negative" role="alert" key={k}>
              {k}: {e.message}
            </p>
          ))}
          <p className="muted">
            Валюта расчётов: USD. Funding учитывается как расход. Другие типы
            инструментов и выплаты funding пока не поддерживаются.
          </p>
          <div className="actions">
            <button type="button" className="button secondary" onClick={close}>
              Отмена
            </button>
            <button type="submit" className="button">
              Сохранить сделку
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
