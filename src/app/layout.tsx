import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/LangContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { NavBar } from "@/components/LangToggle";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "123MOG",
  description: "Track your daily meals and nutrition",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

// Runs before hydration so the correct theme applies immediately, avoiding a flash of the wrong theme.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
        <ThemeProvider>
          <LangProvider>
            <RegisterSW />
            <NavBar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
