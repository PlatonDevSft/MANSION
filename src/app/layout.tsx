import type { Metadata } from "next";
import "@fontsource/manrope/latin-400.css";
import "@fontsource/manrope/cyrillic-400.css";
import "@fontsource/manrope/latin-500.css";
import "@fontsource/manrope/cyrillic-500.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/cyrillic-400.css";
import "./globals.css";
import "./redesign.css";
import "./ui-polish.css";
import "./home.css";
import "./home-effects.css";
import { Shell } from "@/components/shell";
export const metadata: Metadata = {
  title: "Mansion — Trading Intelligence",
  description: "Закрытое пространство для осознанного трейдинга",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
