"use client";
import { useEffect, useState } from "react";
export function useLocal<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) setValue(JSON.parse(stored) as T);
    } catch {
      setError("Локальные данные недоступны. Изменения могут не сохраниться.");
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        setError(
          "Не удалось сохранить: проверьте свободное место и настройки браузера.",
        );
      }
  }, [key, value, ready]);
  return { value, setValue, ready, error };
}
